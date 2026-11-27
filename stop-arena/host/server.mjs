// AnnA Stop Arena Host LAN v0.1 — servidor sem dependências npm.
// Requer Node.js 20+ portátil (runtime/node.exe na distribuição Windows).
import http from 'node:http';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { StopArenaRoom } from './room-engine.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const page=path.resolve(root,'../online/index.html');
const port=Number(process.env.STOP_ARENA_PORT||8788);
const bind=process.env.STOP_ARENA_BIND||'0.0.0.0';
const rooms=new Map();
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const json=(res,body,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body))};
const html=(res,body)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body)};
function addresses(){
 const ips=[];
 for(const list of Object.values(os.networkInterfaces()))for(const item of list||[])
  if(item.family==='IPv4'&&!item.internal)ips.push(item.address);
 return [...new Set(ips)];
}
function newRoom(){
 const values=new Map();
 const storage={
  async get(key){return values.get(key)},
  async put(key,value){values.set(key,value)},
  async delete(key){values.delete(key)},
  async setAlarm(){}
 };
 return {object:new StopArenaRoom({storage}),touched:Date.now()};
}
function code(){
 for(let attempt=0;attempt<10;attempt++){
  const bytes=randomBytes(7),result=Array.from(bytes,n=>alphabet[n%alphabet.length]).join('');
  if(!rooms.has(result))return result;
 }
 throw Error('Não foi possível gerar um PIN. Tente novamente.');
}
function prune(){
 const now=Date.now();
 for(const [key,room] of rooms)if(now-room.touched>24*3600*1000)rooms.delete(key);
}
function bodyOf(req){
 return new Promise((resolve,reject)=>{
  let data='',length=0,finished=false;
  req.on('data',chunk=>{
   if(finished)return;
   length+=chunk.length;
   if(length>16000){finished=true;reject({status:413,error:'Pedido grande demais'});req.destroy();return}
   data+=chunk.toString('utf8');
  });
  req.on('end',()=>{
   if(finished)return;
   try{resolve(JSON.parse(data))}catch{reject({status:400,error:'JSON inválido'})}
  });
  req.on('error',reject);
 });
}
async function roomAction(req,res){
 if(req.method!=='POST')return json(res,{error:'Método não permitido'},405);
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return json(res,{error:'Content-Type inválido'},415);
 const incoming=await bodyOf(req);
 if(!incoming||typeof incoming!=='object')return json(res,{error:'Dados inválidos'},400);
 if(!['create','join','state','action'].includes(incoming.op))return json(res,{error:'Operação inválida'},400);
 prune();
 let pin=incoming.code,slot;
 if(incoming.op==='create'){
  pin=code();
  slot=newRoom();
  rooms.set(pin,slot);
 }else{
  pin=String(pin||'').toUpperCase().trim();
  slot=rooms.get(pin);
  if(!slot)return json(res,{error:'Sala não encontrada neste computador. Confirme o PIN e o endereço do anfitrião.'},404);
 }
 const request=new Request('http://localhost/internal/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...incoming,code:pin})});
 const response=await slot.object.fetch(request);
 slot.touched=Date.now();
 const result=await response.text();
 if(incoming.op==='create'&&response.status!==200)rooms.delete(pin);
 res.writeHead(response.status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(result);
}
function welcome(){
 const links=addresses().map(ip=>'<li><a href="http://'+ip+':'+port+'/online/?modo=local">http://'+ip+':'+port+'/online/?modo=local</a></li>').join('');
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AnnA Stop Arena Host LAN</title><style>body{font:16px system-ui,sans-serif;max-width:700px;margin:40px auto;padding:20px;background:#f7f3ff;color:#30204e}main{background:white;border-radius:20px;padding:25px;box-shadow:0 6px 32px #30126219}a{color:#6532b9;font-weight:700;overflow-wrap:anywhere}.action{display:inline-block;background:#6532b9;color:white;padding:14px 20px;border-radius:12px;text-decoration:none}li{margin:12px 0}small{color:#665d75}</style></head><body><main><h1>🏫 AnnA Stop Arena Host</h1><p><strong>Servidor LAN iniciado!</strong> Sem necessidade de internet.</p><p><a class="action" href="/online/?modo=local">Criar ou entrar em sala</a></p><h2>Compartilhe o endereço com os alunos</h2><ul>${links||'<li>Não foi localizado IPv4 na rede. Verifique sua conexão Wi-Fi/Ethernet.</li>'}</ul><p>O organizador cria a sala e recebe o PIN. Os participantes abrem o mesmo endereço no navegador e digitam o PIN.</p><small>O servidor precisa permanecer ligado. Todos os dispositivos devem conseguir acessar esta máquina na rede; verifique firewall e isolamento de clientes. O Gemini online não funciona offline; a conferência manual permanece.</small></main></body></html>`;
}
const server=http.createServer(async(req,res)=>{
 try{
  const uri=new URL(req.url||'/', 'http://localhost');
  const route=uri.pathname.replace(/\/+$/,'')||'/';
  if(req.method==='GET'&&route==='/')return html(res,welcome());
  if(req.method==='GET'&&(route==='/online'||route==='/online/index.html')){
   const source=await readFile(page,'utf8');
   // Flag de modo LAN habilitada apenas quando a página é servida por este anfitrião.
   return html(res,source.replace('<script>','<script>window.STOP_ARENA_LAN=true;</script>\n<script>'));
  }
  if(req.method==='GET'&&route==='/stop-arena/status')return json(res,{online:true,ai:false,mode:'lan',rooms:rooms.size});
  if(route==='/stop-arena/room')return await roomAction(req,res);
  if(route==='/stop-arena/validate')return json(res,{error:'Gemini indisponível no modo LAN offline. Use a revisão manual.'},503);
  return json(res,{error:'Página não encontrada'},404);
 }catch(e){
  const status=Number(e?.status)||500;
  if(!res.writableEnded)json(res,{error:e?.error||'Erro no servidor local'},status);
  if(status===500)console.error('[LAN]',e);
 }
});
server.listen(port,bind,()=>{
 console.log('\n🏫 AnnA Stop Arena LAN pronto!');
 console.log('Neste computador: http://localhost:'+port);
 for(const ip of addresses())console.log('Na rede local:   http://'+ip+':'+port);
 console.log('Abra o endereço acima. Pressione Ctrl+C para encerrar.\n');
 if(process.platform==='win32'&&process.env.STOP_ARENA_NO_BROWSER!=='1'){
  execFile('rundll32.exe',['url.dll,FileProtocolHandler','http://localhost:'+port+'/'],{windowsHide:true},()=>{});
 }
});
