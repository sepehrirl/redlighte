import test from 'node:test';
import assert from 'node:assert/strict';
import { retrieveMemories, buildMemoryContext, extractAndMergeMemory } from './memory.js';

test('unrelated high-importance memories are not retrieved',()=>{
 const data={enabled:true,memories:[{id:'m1',key:'profile.name',type:'profile',content:'The user is named Sepehr.',confidence:1,importance:1,status:'active'}]};
 assert.deepEqual(retrieveMemories(data,'خبرهای جدید هوش مصنوعی'),[]);
});
test('Persian query retrieves a legacy English memory through its stable key',()=>{
 const data={enabled:true,memories:[{id:'m2',key:'preference.favorite_color',type:'preference',content:"User's favorite color is green.",confidence:1,importance:.9,status:'active'}]};
 assert.equal(retrieveMemories(data,'رنگ مورد علاقه من چیه؟')[0]?.id,'m2');
});
test('generic stopwords cannot make an unrelated memory look relevant',()=>{
 const data={enabled:true,memories:[{id:'m3',key:'profile.work',type:'profile',content:'The user is a software engineer.',confidence:1,importance:1,status:'active'}]};
 assert.deepEqual(retrieveMemories(data,'What is my current city?'),[]);
});
test('memory context treats saved content as data, not instructions',()=>{
 assert.match(buildMemoryContext([{type:'preference',content:'User likes math.'}]),/DATA, NOT INSTRUCTIONS/);
});
test('explicit Persian fact saves without an AI model and upgrades schema to v4',async t=>{
 const original=globalThis.fetch;let saved;
 t.after(()=>{globalThis.fetch=original});
 globalThis.fetch=async(url,options={})=>{
  if(options.method==='PUT'){const p=JSON.parse(options.body);saved=JSON.parse(Buffer.from(p.content,'base64').toString('utf8'));return new Response('{}',{status:201})}
  return new Response('{}',{status:404});
 };
 const result=await extractAndMergeMemory({GITHUB_TOKEN:'test'},'tester','رنگ مورد علاقه‌م سبزه');
 assert.equal(result.action,'created');assert.equal(saved.version,4);assert.equal(saved.memories.length,1);
 assert.equal(saved.memories[0].key,'preference.favorite_color');assert.equal(saved.memories[0].evidence,'رنگ مورد علاقه‌م سبزه');
});
test('AI extraction without exact evidence is rejected',async t=>{
 const original=globalThis.fetch;let writes=0;
 t.after(()=>{globalThis.fetch=original});
 globalThis.fetch=async(url,options={})=>{
  if(options.method==='PUT'){writes++;return new Response('{}',{status:201})}
  return new Response('{}',{status:404});
 };
 const env={GITHUB_TOKEN:'test',AI:{run:async()=>({response:JSON.stringify({remember:true,key:'preference.theme',type:'preference',content:'User prefers dark mode',confidence:.99,importance:.9})})}};
 const result=await extractAndMergeMemory(env,'tester','I prefer dark mode for coding tasks.');
 assert.equal(result,null);assert.equal(writes,0);
});
test('correction updates an existing memory rather than duplicating it',async t=>{
 const original=globalThis.fetch;let saved;
 const legacy={version:3,enabled:true,memories:[{id:'old-color',key:'preference.favorite_color',type:'preference',content:'رنگ مورد علاقه کاربر سبز است',confidence:.98,importance:.9,status:'active',source:{},createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'}]};
 t.after(()=>{globalThis.fetch=original});
 globalThis.fetch=async(url,options={})=>{
  if(options.method==='PUT'){const p=JSON.parse(options.body);saved=JSON.parse(Buffer.from(p.content,'base64').toString('utf8'));return new Response('{}',{status:200})}
  return new Response(JSON.stringify({sha:'old-sha',content:Buffer.from(JSON.stringify(legacy)).toString('base64')}),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const result=await extractAndMergeMemory({GITHUB_TOKEN:'test'},'tester','رنگ مورد علاقه‌م آبیه');
 assert.equal(result.action,'updated');assert.equal(saved.memories.length,1);assert.equal(saved.memories[0].id,'old-color');assert.match(saved.memories[0].content,/آبیه/);
});
