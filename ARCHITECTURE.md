# Redlighte Architecture

## 1. Scope

This document describes the architecture documented for the Redlighte repository. It is a high-level map, not a substitute for inspecting the current Worker source, Cloudflare dashboard, bindings, or deployment configuration before making infrastructure changes.

## 2. System overview

Redlighte combines a lightweight web frontend with server-side Cloudflare Workers services.

```text
Browser / PWA
  |
  | same-origin requests
  v
Cloudflare Worker (worker/index.js)
  |-- Core AI, account, auth, chat
  |-- Memory services
  |-- Game API
  |-- Room and live-share services
  |-- Vault API
  |-- Pulse services
  |
  +--> Cloudflare Workers AI (Qwen model family)
  |
  +--> Private application-data repository (server-side access)
  |
  +--> Durable Objects + WebSockets (real-time rooms/presence)
```

Static assets are served through the configured Cloudflare assets integration. The Worker routes API requests and invokes the relevant service modules.

## 3. Frontend

The repository is documented as a lightweight HTML, CSS, and JavaScript application rather than a conventional frontend framework build. Product areas include the main AI experience, Articles, Agents, Game, Now, Room, Vault, account/settings interfaces, and PWA support.

The browser should call same-origin application endpoints. Secrets and privileged data-store credentials must remain server-side.

## 4. Worker services

The documented Worker entry point is `worker/index.js`. Supporting modules include:

- `index-core.js`: core AI, account, authentication, and chat behavior.
- `google-auth.js`: Google authentication integration.
- `memory.js` and `memory-core.js`: memory workflows.
- `game-api.js`: game and social-game API.
- `room.js`: room services and Durable Objects.
- `live-share.js`: live-sharing functionality.
- `vault.js`: Vault API.
- `pulse.js` and `pulse-auth.js`: Pulse-related services.

Module names and responsibilities should be rechecked against source before refactoring.

## 5. AI request flow

The main client sends chat requests to the same-origin `/api/chat` endpoint. The Worker handles server-side logic and invokes Cloudflare Workers AI. The README documents the model identifier as `@cf/qwen/qwen3-30b-a3b-fp8`; confirm model availability and binding configuration before changing it.

Conversation context, input limits, and output limits are implementation details and should be changed only after checking the current code and platform limits.

## 6. Identity, sessions, and data

The repository README describes custom session-based authentication, password hashing with PBKDF2/SHA-256, HMAC-SHA-256 session signing, and secure cookie attributes. Treat these as documented implementation claims, not an independent security audit.

The public application repository is separate from the private `redlighte-data` repository. The Worker accesses private data server-side. Never place repository tokens, signing keys, OAuth secrets, or other credentials in browser code or public documentation.

## 7. Real-time services

Room functionality is documented as using Cloudflare Durable Objects and WebSockets for room state, presence, indexing, and live sharing. Verify the current Durable Object bindings, migrations, and class names in `wrangler.jsonc` and Worker source before deployment.

## 8. Configuration and deployment

The README documents `wrangler.jsonc` as the Cloudflare Worker configuration, with an AI binding, static asset binding, API-first routing, and Durable Objects. The exact production configuration may differ.

Before deployment, verify:
- the target account and Worker environment;
- all required bindings and Durable Object migrations;
- required secrets and environment variables;
- route and custom-domain configuration;
- compatibility date and runtime support;
- data-repository permissions;
- rollback/recovery path.

## 9. Architecture change rules

- Keep changes scoped to the requested product or service.
- Preserve API contracts unless a breaking change is explicitly approved.
- Update this document when a confirmed architectural boundary changes.
- Do not document secrets, private identifiers, or sensitive user data.
- Validate behavior in a non-production environment when available.
