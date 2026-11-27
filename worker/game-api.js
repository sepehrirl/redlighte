const DATA_REPO='amirsepehr2020/redlighte-data';
const QUESTS=[{id:'play3',title:'Play 3 Games',target:3,reward:30,action:'play'},{id:'win1',title:'Claim a Win',target:1,reward:50,action:'win'},{id:'score20',title:'Beat 20',target:1,reward:40,action:'score20'}];
export async function handleGameApi(request,env,url){const cors=corsHeaders(request);if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});const me=await readSession(request,env);if(!me)return json({error:'Unauthorized.'},401,cors);try{
if(url.pathname==='/api/game/social'&&request.method==='GET')return social(env,me,cors);
if(url.pathname==='/api/game/social/posts'&&request.method==='POST')return createPost(request,env,me,cors);
if(url.pathname==='/api/game/social/posts/like'&&request.method==='POST')return likePost(request,env,me,cors);
if(url.pathname==='/api/game/leaderboard'&&request.method==='GET')return leaderboard(env,me,cors);
if(url.pathname==='/api/game/friends'&&request.method==='POST')return addFriend(request,env,me,cors);
if(url.pathname==='/api/game/friends/accept'&&request.method==='POST')return acceptFriend(request,env,me,cors);
if(url.pathname==='/api/game/friends/remove'&&request.method==='POST')return removeFriend(request,env,me,cors);
if(url.pathname==='/api/game/challenges'&&request.method==='POST')return challenge(request,env,me,cors);
if(url.pathname==='/api/game/challenges/respond'&&request.method==='POST')return respond(request,env,me,cors);
if(url.pathname==='/api/game/challenges/score'&&request.method==='POST')return challengeScore(request,env,me,cors);
if(url.pathname==='/api/game/result'&&request.method==='POST')return gameResult(request,env,me,cors);
if(url.pathname==='/api/game/quests/claim'&&request.method==='POST')return questClaim(request,env,me,cors);
return json({error:'Not found.'},404,cors)}catch(e){console.error('GAME_API_ERROR',e);return json({error:'Game service error.'},500,cors)}}
async function social(env,me,cors){
 const f=await account(env,me.username);if(!f)return json({error:'Account data not found.'},404,cors);
 const state=ensure(f.data),q=questState(f.data),day=today();
 const games=[{id:'redrush',name:'Red Rush',tag:'ARCADE',text:'15 seconds. Beat your record.'},{id:'redlight',name:'Redlight',tag:'REACTION',text:'React only on red.'},{id:'grid',name:'Grid',tag:'PUZZLE',text:'Find the glowing tile.'},{id:'red-orbit',name:'Red Orbit',tag:'ARCADE',text:'Chase the moving pulse around the orbit.'},{id:'memory',name:'Memory',tag:'MEMORY',text:'Remember the sequence and repeat it.'},{id:'red-break',name:'Red Break',tag:'ARCADE',text:'Clear the red field and build a combo.'},{id:'red-dash',name:'Red Dash',tag:'REACTION',text:'Catch the red pulse and build your combo.'},{id:'2048',name:'2048',tag:'PUZZLE',text:'Merge matching tiles and chase 2048.'}];
 const authors=[{username:me.username,name:me.name},...state.friends.slice(0,12)];
 const batches=await Promise.all(authors.map(async author=>{try{const source=author.username===me.username?f:await account(env,author.username);const arr=source?.data?.settings?.gameSocial?.posts;if(!Array.isArray(arr))return[];return arr.slice(-30).map(post=>({...post,username:author.username,name:author.name||source.data.user?.name||author.username,likes:Array.isArray(post.likes)?post.likes.length:0,likedByMe:Array.isArray(post.likes)&&post.likes.includes(me.username)}))}catch{return[]}}));
 const posts=batches.flat();
 posts.sort((x,y)=>String(y.createdAt||'').localeCompare(String(x.createdAt||'')));
 return json({user:me,friends:state.friends,incomingRequests:state.incomingRequests,outgoingRequests:state.outgoingRequests,challenges:state.challenges,posts:posts.slice(0,40),events:[{id:'red-week',title:'Red Week',description:'Play Originals and earn bonus XP.',active:true},{id:'rush-hour',title:'Rush Hour',description:'Beat 20 in Red Rush.',active:true}],quests:QUESTS.map(x=>({...x,progress:q.progress[x.id]||0,claimed:!!q.claimed[x.id]})),gameOfDay:games[Math.floor(Date.now()/86400000)%games.length],day},200,cors)
}
async function createPost(request,env,me,cors){
 const body=await request.json().catch(()=>null),textValue=clean(body?.text,280);
 if(!textValue)return json({error:'Write something before posting.'},400,cors);
 const a=await account(env,me.username);if(!a)return json({error:'Account not found.'},404,cors);
 const state=ensure(a.data),post={id:crypto.randomUUID(),username:me.username,name:me.name,text:textValue,createdAt:new Date().toISOString(),likes:[]};
 state.posts.push(post);state.posts=state.posts.slice(-100);await write(env,a,'Create Game community post');
 return json({ok:true,post:{...post,likes:0}},201,cors)
}
async function likePost(request,env,me,cors){
 const body=await request.json().catch(()=>null),postId=clean(body?.postId,80),owner=clean(body?.username,32).toLowerCase();
 if(!postId||!valid(owner))return json({error:'Invalid post.'},400,cors);
 const a=await account(env,owner);if(!a)return json({error:'Post owner not found.'},404,cors);
 const state=ensure(a.data),post=state.posts.find(x=>x.id===postId);if(!post)return json({error:'Post not found.'},404,cors);
 if(!Array.isArray(post.likes))post.likes=[];
 const index=post.likes.indexOf(me.username);if(index>=0)post.likes.splice(index,1);else post.likes.push(me.username);
 await write(env,a,'Update Game community post reaction');
 return json({ok:true,likes:post.likes.length,liked:index<0},200,cors)
}
async function leaderboard(env,me,cors){const r=await fetch(`https://api.github.com/repos/${DATA_REPO}/contents/users?ref=main`,{headers:gh(env)});if(!r.ok)return json({players:[],me:me.username},200,cors);const entries=await r.json(),users=[];for(const item of Array.isArray(entries)?entries:[]){if(item.type!=='dir')continue;try{const f=await account(env,item.name);const g=f?.data?.settings?.game||{};users.push({username:f.data.user.username,name:f.data.user.name,level:Math.floor((Number(g.xp)||0)/100)+1,xp:Number(g.xp)||0,wins:Number(g.wins)||0})}catch{}}users.sort((a,b)=>b.xp-a.xp||b.wins-a.wins);return json({players:users.slice(0,20),me:me.username},200,cors)}
const GAME_IDS=new Set(['redrush','redlight','grid','red-orbit','memory','red-break','red-dash','2048']);
const WIN_THRESHOLDS={'redrush':15,'redlight':5,'grid':8,'red-orbit':15,'memory':8,'red-break':20,'red-dash':250,'2048':2048};
async function gameResult(request,env,me,cors){
 const body=await request.json().catch(()=>null),game=clean(body?.game,24),runId=clean(body?.runId,80);
 const raw=Number(body?.score);
 if(!GAME_IDS.has(game)||!runId||!Number.isFinite(raw)||raw<0)return json({error:'Invalid game result.'},400,cors);
 const score=Math.min(100000,Math.floor(raw)),a=await account(env,me.username);
 if(!a)return json({error:'Account not found.'},404,cors);
 a.data.settings=a.data.settings||{};a.data.settings.game=a.data.settings.game||{};
 const g=a.data.settings.game;
 if(!Array.isArray(g.recentRuns))g.recentRuns=[];
 if(g.recentRuns.includes(runId))return json({error:'This run was already submitted.'},409,cors);
 const won=score>=(WIN_THRESHOLDS[game]||Number.MAX_SAFE_INTEGER);
 const day=today(),yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
 if(g.lastPlayedDay!==day){g.streak=g.lastPlayedDay===yesterday?(Math.max(0,Number(g.streak)||0)+1):1;g.lastPlayedDay=day}
 g.recentRuns.push(runId);g.recentRuns=g.recentRuns.slice(-100);
 g.gamesPlayed=Math.max(0,Number(g.gamesPlayed)||0)+1;
 g.xp=Math.max(0,Number(g.xp)||0)+10+Math.min(30,score)+(won?20:0);
 g.coins=Math.max(0,Number(g.coins)||0)+(won?15:5);
 g.wins=Math.max(0,Number(g.wins)||0)+(won?1:0);
 if(!Array.isArray(g.playedOriginals))g.playedOriginals=[];
 if(!g.playedOriginals.includes(game))g.playedOriginals.push(game);
 if(!g.bestScores||typeof g.bestScores!=='object')g.bestScores={};
 g.bestScores[game]=Math.max(Number(g.bestScores[game])||0,score);
 if(!Array.isArray(g.achievements))g.achievements=[];
 if(g.gamesPlayed===1&&!g.achievements.includes('First Game'))g.achievements.push('First Game');
 if(won&&!g.achievements.includes('First Win'))g.achievements.push('First Win');
 const level=Math.floor(g.xp/100)+1;if(level>=5&&!g.achievements.includes('Level 5'))g.achievements.push('Level 5');if(level>=10&&!g.achievements.includes('Legend'))g.achievements.push('Legend');
 const q=questState(a.data);
 applyQuestProgress(q,'play',1);
 if(won)applyQuestProgress(q,'win',1);
 if(score>=20)applyQuestProgress(q,'score20',1);
 await write(env,a,'Save Redlighte Game result');
 return json({ok:true,game,score,won,gameStats:{gamesPlayed:g.gamesPlayed,xp:g.xp,coins:g.coins,wins:g.wins,streak:g.streak,bestScores:g.bestScores,achievements:g.achievements},quests:QUESTS.map(x=>({...x,progress:q.progress[x.id]||0,claimed:!!q.claimed[x.id]}))},200,cors);
}
function applyQuestProgress(q,action,amount){const def=QUESTS.find(x=>x.action===action);if(!def)return;q.progress[def.id]=Math.min(def.target,(Number(q.progress[def.id])||0)+amount)}

async function questClaim(request,env,me,cors){const b=await request.json(),id=clean(b.id,30),def=QUESTS.find(x=>x.id===id);if(!def)return json({error:'Quest not found.'},404,cors);const a=await account(env,me.username);if(!a)return json({error:'Account not found.'},404,cors);const q=questState(a.data),progress=q.progress[id]||0;if(progress<def.target)return json({error:'Quest is not complete yet.'},400,cors);if(q.claimed[id])return json({error:'Quest reward already claimed.'},409,cors);q.claimed[id]=true;a.data.settings=a.data.settings||{};a.data.settings.game=a.data.settings.game||{};const g=a.data.settings.game;g.xp=Math.max(0,Number(g.xp)||0)+def.reward;g.coins=Math.max(0,Number(g.coins)||0);if(!Array.isArray(g.achievements))g.achievements=[];if(!g.achievements.includes('Quest Hunter'))g.achievements.push('Quest Hunter');await write(env,a,'Claim Redlighte Game quest reward');return json({ok:true,reward:def.reward,quest:{...def,progress,claimed:true},game:{xp:g.xp,coins:g.coins,achievements:g.achievements}},200,cors)}
async function addFriend(request,env,me,cors){const b=await request.json(),u=clean(b.username,32).toLowerCase();if(!valid(u)||u===me.username)return json({error:'Invalid username.'},400,cors);const t=await account(env,u);if(!t)return json({error:'Account not found.'},404,cors);const o=await account(env,me.username),s=ensure(o.data),ts=ensure(t.data);if(s.friends.some(x=>x.username===u))return json({error:'Already friends.'},409,cors);if(!s.outgoingRequests.some(x=>x.username===u)){s.outgoingRequests.push({username:u,name:t.data.user.name});if(!ts.incomingRequests.some(x=>x.username===me.username))ts.incomingRequests.push({username:me.username,name:me.name});await write(env,o,'Send Game friend request');await write(env,t,'Receive Game friend request')}return json({ok:true},200,cors)}
async function acceptFriend(request,env,me,cors){const b=await request.json(),u=clean(b.username,32).toLowerCase(),o=await account(env,me.username);if(!o)return json({error:'Account not found.'},404,cors);const s=ensure(o.data),t=await account(env,u);if(!t)return json({error:'Account not found.'},404,cors);const ts=ensure(t.data);if(!s.incomingRequests.some(x=>x.username===u))return json({error:'Request not found.'},404,cors);s.incomingRequests=s.incomingRequests.filter(x=>x.username!==u);if(!s.friends.some(x=>x.username===u))s.friends.push({username:u,name:t.data.user.name});ts.outgoingRequests=ts.outgoingRequests.filter(x=>x.username!==me.username);if(!ts.friends.some(x=>x.username===me.username))ts.friends.push({username:me.username,name:me.name});await write(env,o,'Accept Game friend request');await write(env,t,'Friend accepted');return json({ok:true},200,cors)}
async function removeFriend(request,env,me,cors){const b=await request.json(),u=clean(b.username,32).toLowerCase(),o=await account(env,me.username);if(!o)return json({error:'Account not found.'},404,cors);const s=ensure(o.data);s.friends=s.friends.filter(x=>x.username!==u);s.incomingRequests=s.incomingRequests.filter(x=>x.username!==u);s.outgoingRequests=s.outgoingRequests.filter(x=>x.username!==u);await write(env,o,'Remove Game friend or request');const t=await account(env,u);if(t){const ts=ensure(t.data);ts.friends=ts.friends.filter(x=>x.username!==me.username);ts.incomingRequests=ts.incomingRequests.filter(x=>x.username!==me.username);ts.outgoingRequests=ts.outgoingRequests.filter(x=>x.username!==me.username);await write(env,t,'Friend removed')}return json({ok:true},200,cors)}
async function challenge(request,env,me,cors){const b=await request.json(),u=clean(b.username,32).toLowerCase(),game=clean(b.game,20),o=await account(env,me.username);if(!o)return json({error:'Account not found.'},404,cors);const s=ensure(o.data),t=await account(env,u);if(!t||!s.friends.some(x=>x.username===u))return json({error:'You can only challenge a friend.'},403,cors);if(!GAME_IDS.has(game))return json({error:'Invalid game.'},400,cors);const c={id:crypto.randomUUID(),game,from:me.username,fromName:me.name,to:u,status:'pending',createdAt:new Date().toISOString(),scores:{}};s.challenges.push(c);const ts=ensure(t.data);ts.challenges.push({...c});await write(env,o,'Create Game challenge');await write(env,t,'Receive Game challenge');return json({challenge:c},201,cors)}
async function respond(request,env,me,cors){const b=await request.json(),o=await account(env,me.username);if(!o)return json({error:'Account not found.'},404,cors);const s=ensure(o.data),c=s.challenges.find(x=>x.id===clean(b.id,80));if(!c||c.to!==me.username)return json({error:'Challenge not found.'},404,cors);c.status=b.accept===true?'accepted':'declined';await write(env,o,'Respond to Game challenge');const t=await account(env,c.from);if(t){const ts=ensure(t.data),m=ts.challenges.find(x=>x.id===c.id);if(m)m.status=c.status;await write(env,t,'Sync Game challenge response')}return json({ok:true,status:c.status},200,cors)}
async function challengeScore(request,env,me,cors){const b=await request.json(),id=clean(b.id,80),score=Math.max(0,Math.min(100000,Number(b.score)||0)),o=await account(env,me.username);if(!o)return json({error:'Account not found.'},404,cors);const s=ensure(o.data),c=s.challenges.find(x=>x.id===id);if(!c||c.status!=='accepted'||(c.from!==me.username&&c.to!==me.username))return json({error:'Active challenge not found.'},404,cors);c.scores=c.scores||{};c.scores[me.username]=Math.max(Number(c.scores[me.username]||0),score);if(c.scores[c.from]!=null&&c.scores[c.to]!=null)c.status='completed';await write(env,o,'Submit Game challenge score');const other=c.from===me.username?c.to:c.from,t=await account(env,other);if(t){const ts=ensure(t.data),m=ts.challenges.find(x=>x.id===id);if(m){m.scores[me.username]=c.scores[me.username];m.status=c.status}await write(env,t,'Sync Game challenge score')}return json({ok:true,score,status:c.status},200,cors)}
function ensure(d){d.settings=d.settings||{};const s=d.settings.gameSocial=d.settings.gameSocial||{};for(const k of ['friends','incomingRequests','outgoingRequests','challenges','posts'])if(!Array.isArray(s[k]))s[k]=[];return s}
function questState(d){d.settings=d.settings||{};const q=d.settings.gameQuests=d.settings.gameQuests||{},day=today();if(q.day!==day){q.day=day;q.progress={};q.claimed={}}q.progress=q.progress&&typeof q.progress==='object'?q.progress:{};q.claimed=q.claimed&&typeof q.claimed==='object'?q.claimed:{};return q}
function today(){return new Date().toISOString().slice(0,10)}
async function account(env,u){if(!u)return null;const path=`users/${u}/data.json`,r=await fetch(`https://api.github.com/repos/${DATA_REPO}/contents/${path}?ref=main`,{headers:gh(env)});if(r.status===404)return null;if(!r.ok)throw Error('GitHub GET');const x=await r.json(),bytes=Uint8Array.from(atob(x.content.replace(/\n/g,'')),c=>c.charCodeAt(0));return{path,sha:x.sha,data:JSON.parse(new TextDecoder().decode(bytes))}}
async function write(env,a,msg){const content=enc(JSON.stringify(a.data,null,2)),r=await fetch(`https://api.github.com/repos/${DATA_REPO}/contents/${a.path}`,{method:'PUT',headers:{...gh(env),'Content-Type':'application/json'},body:JSON.stringify({message:msg,content,branch:'main',sha:a.sha})});if(!r.ok)throw Error('GitHub PUT')}
function gh(env){return{Authorization:`Bearer ${env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Redlighte-Game'}}function enc(t){const b=new TextEncoder().encode(t);let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));return btoa(s)}
async function readSession(request,env){const m=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)redlighte_session=([^;]+)/);if(!m)return null;const raw=m[1],i=raw.lastIndexOf('.');if(i<1)return null;const p=raw.slice(0,i),sig=raw.slice(i+1);try{const e=await sign(p,env.GITHUB_TOKEN);if(!safe(sig,e))return null;const d=JSON.parse(dec(p));return d.exp&&d.exp>=Date.now()?d:null}catch{return null}}
async function sign(v,s){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(s),{name:'HMAC',hash:'SHA-256'},false,['sign']),x=await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(v));return[...new Uint8Array(x)].map(n=>n.toString(16).padStart(2,'0')).join('')}
function safe(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}function dec(t){const b=atob(t.replace(/\s/g,''));return new TextDecoder().decode(Uint8Array.from(b,c=>c.charCodeAt(0)))}function clean(v,n){return typeof v==='string'?v.trim().slice(0,n):''}function valid(v){return /^[a-z0-9][a-z0-9_.-]{2,31}$/.test(v)}function corsHeaders(r){const o=r.headers.get('Origin'),a=o&&/^https:\/\/(?:www\.)?redlighte\.ir$/.test(o)?o:'https://redlighte.ir';return{'Access-Control-Allow-Origin':a,'Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'}}function json(d,s,h){return new Response(JSON.stringify(d),{status:s,headers:{...h,'Content-Type':'application/json','Cache-Control':'no-store'}})}
