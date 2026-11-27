// Teste automatizado de integração do Host LAN com duas sessões, sem Cloudflare.
// Execute com: node test-lan.mjs
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.dirname(fileURLToPath(import.meta.url));
const port=19000+Math.floor(Math.random()*20000);
const base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,[path.join(root,'server.mjs')],{
 env:{...process.env,STOP_ARENA_PORT:String(port),STOP_ARENA_BIND:'127.0.0.1'},
 stdio:['ignore','pipe','pipe']
});
let output='';
server.stderr.on('data',x=>{output+=x.toString()});
async function api(body){
 const response=await fetch(base+'/stop-arena/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 return {http:response.status,...await response.json()};
}
try{
 let ready=false;
 for(let n=0;n<70;n++){
  if(server.exitCode!==null)break;
  try{const r=await fetch(base+'/stop-arena/status');if(r.ok){ready=true;break}}catch{}
  await pause(120);
 }
 assert.ok(ready,'Servidor não iniciou: '+output);
 const ui=await fetch(base+'/online/?modo=local');
 assert.equal(ui.status,200);
 assert.ok((await ui.text()).includes('window.STOP_ARENA_LAN=true'));
 const host=await api({op:'create',name:'Ana',team:'Dupla LAN',categories:['Animal','Cor','Objeto','Nome','Fruta','CEP'],letters:['P'],rounds:1,duration:60});
 assert.equal(host.http,200);
 assert.match(host.room.code,/^[A-HJ-NP-Z2-9]{7}$/);
 const guest=await api({op:'join',code:host.room.code,name:'Bruno'});
 assert.equal(guest.http,200);
 const h={code:host.room.code,token:host.token},g={code:host.room.code,token:guest.token};
 assert.equal((await api({op:'action',action:'start',...h})).http,200);
 await api({op:'action',action:'answer',index:0,value:'PATO',...h});
 await api({op:'action',action:'answer',index:0,value:'PUMA',...g});
 const stopped=await api({op:'action',action:'stop',...h});
 assert.deepEqual(stopped.room.results.filter(x=>x.category==='Animal').map(x=>x.answer),['PATO','PUMA']);
 const blank=stopped.room.results.findIndex(x=>!x.answer);
 assert.equal((await api({op:'action',action:'vote',index:blank,status:'valid',...g})).http,400);
 for(const i of stopped.room.results.map((r,i)=>r.answer?i:-1).filter(i=>i>=0)){
  assert.equal((await api({op:'action',action:'vote',index:i,status:'valid',...h})).http,200);
  assert.equal((await api({op:'action',action:'vote',index:i,status:'valid',...g})).http,200);
 }
 const finished=await api({op:'action',action:'next',...h});
 assert.equal(finished.room.stage,'end');
 assert.equal(finished.room.score,10,'Categoria duplicada conta apenas 10 pontos');
 console.log('OK — criação, PIN, entrada, duas respostas, votos, campo vazio e placar LAN');
}finally{
 server.kill('SIGTERM');
}
