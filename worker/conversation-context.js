const MAX_RECENT_MESSAGES = 24;
const MAX_STORED_MESSAGES = 80;
const SUMMARY_BATCH_SIZE = 8;
const MAX_SUMMARY_LENGTH = 7000;

export class ConversationContextDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const method = request.method.toUpperCase();
    if (method === 'GET') {
      const conversation = await this.state.storage.get('conversation');
      return Response.json(conversation || emptyConversation());
    }
    if (method === 'PUT') {
      let value;
      try { value = await request.json(); }
      catch { return Response.json({ error: 'Invalid JSON.' }, { status: 400 }); }
      const conversation = normalizeConversation(value);
      await this.state.storage.put('conversation', conversation);
      return Response.json({ ok: true, updatedAt: conversation.updatedAt });
    }
    if (method === 'DELETE') {
      await this.state.storage.delete('conversation');
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }
}

function emptyConversation() {
  return { version: 1, summary: '', summarizedThrough: 0, messageCount: 0, messages: [], updatedAt: null };
}

function normalizeConversation(value) {
  const messages = Array.isArray(value?.messages)
    ? value.messages.filter(message =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
      ).slice(-MAX_STORED_MESSAGES).map(message => ({
        role: message.role,
        content: message.content.slice(0, 12000)
      }))
    : [];
  return {
    version: 1,
    summary: typeof value?.summary === 'string' ? value.summary.slice(-MAX_SUMMARY_LENGTH) : '',
    summarizedThrough: Math.max(0, Number(value?.summarizedThrough) || 0),
    messageCount: Math.max(messages.length, Number(value?.messageCount) || 0),
    messages,
    updatedAt: new Date().toISOString()
  };
}

export async function advanceConversationSummary(env, previousSummary, messages, baseIndex, summarizedThrough, targetThrough) {
  let summary = String(previousSummary || '').slice(-MAX_SUMMARY_LENGTH);
  let through = Math.max(0, Number(summarizedThrough) || 0);
  const target = Math.max(through, Number(targetThrough) || 0);

  while (through < target) {
    const start = Math.max(0, through - baseIndex);
    const end = Math.min(messages.length, target - baseIndex, start + SUMMARY_BATCH_SIZE);
    if (end <= start) break;
    const batch = messages.slice(start, end);
    const next = await summarizeBatch(env, summary, batch);
    summary = next;
    through = baseIndex + end;
  }

  return { summary, summarizedThrough: through };
}

async function summarizeBatch(env, previousSummary, messages) {
  const transcript = messages.map(message => ({
    role: message.role,
    content: message.content.slice(0, 3000)
  }));
  const prompt = `You maintain the continuity summary for ONE Redlighte AI conversation.
Update the existing summary using the new messages. This summary will be used only inside this same chat.

Preserve:
- the user's original goal, task, and intended outcome;
- important facts, constraints, preferences, names, dates, numbers, and decisions;
- what has already been tried and its result;
- unresolved questions, blockers, and the next expected step;
- distinctions between facts stated by the user and suggestions or claims made by the assistant.

Do not invent, guess, or turn assistant suggestions into user-confirmed facts.
Remove repetition and details that no longer matter. Keep the summary concise, structured, and in the conversation's language. If a prior detail is corrected, keep the latest correction.
Return only the updated summary, without a preface.

EXISTING SUMMARY:
${previousSummary || '(none)'}

NEW MESSAGES:
${JSON.stringify(transcript)}`;

  try {
    const result = await env.AI.run('@cf/zai-org/glm-4.7-flash', {
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 1100,
      temperature: 0.1,
      chat_template_kwargs: { enable_thinking: false }
    });
    const text = result?.response || result?.result?.response ||
      result?.choices?.[0]?.message?.content || '';
    if (typeof text === 'string' && text.trim()) return text.trim().slice(-MAX_SUMMARY_LENGTH);
  } catch (error) {
    console.error('CONVERSATION_SUMMARY_ERROR', error);
  }

  const fallback = transcript.map(message =>
    `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`
  ).join('\n');
  return [previousSummary, fallback].filter(Boolean).join('\n').slice(-MAX_SUMMARY_LENGTH);
}

export const CONVERSATION_LIMITS = Object.freeze({
  maxRecentMessages: MAX_RECENT_MESSAGES,
  maxStoredMessages: MAX_STORED_MESSAGES
});
