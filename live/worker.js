// AnnA EduPlay live sessions — Cloudflare Durable Objects.
// Requires a Worker deployment with Durable Object binding SESSIONS.
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  const headers={'Access-Control-Allow-Origin':'https://eduplay.annaone.com.br','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(url.pathname==='/health')return Response.json({service:'anna-eduplay-live',ready:true},{headers});
  if(url.pathname==='/sessions'&&request.method==='POST'){
   // Session creation must be protected by the existing AnnA One authentication gateway.
   // Reject all creation requests until a server-side verifier is configured.
   if(!env.HOST_AUTH_URL||!env.HOST_AUTH_SECRET)return Response.json({error:'Host authentication not configured'},{status:503,headers});
   const bearer=request.headers.get('Authorization')||'';
   if(!bearer.startsWith('Bearer '))return Response.json({error:'Unauthorized'},{status:401,headers});
   const check=await fetch(env.HOST_AUTH_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Internal-Secret':env.HOST_AUTH_SECRET},body:JSON.stringify({token:bearer.slice(7),scope:'eduplay:host'})});
   if(!check.ok)return Response.json({error:'Unauthorized'},{status:401,headers});
   const pin=String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);
   const id=env.SESSIONS.idFromName(pin),stub=env.SESSIONS.get(id);
   const hostSecret=crypto.randomUUID()+crypto.randomUUID();
   const result=await stub.fetch('https://room/init',{method:'POST',body:JSON.stringify({hostSecret})});
   if(!result.ok)return new Response('Unable to create room',{status:409,headers});
   return Response.json({pin,hostSecret},{headers});
  }
  const match=url.pathname.match(/^\/sessions\/(\d{6})\/connect$/);
  if(match&&request.headers.get('Upgrade')==='websocket'){
   const stub=env.SESSIONS.get(env.SESSIONS.idFromName(match[1]));
   return stub.fetch(request);
  }
  return new Response('Not found',{status:404,headers});
 }
};
export class EduPlayRoom {
 constructor(state){this.state=state;this.sockets=new Map();this.session=null;this.hostSecret=null;this.questionIndex=-1;this.deadline=0;this.answers=new Map();}
 async fetch(request){
  const url=new URL(request.url);
  if(url.pathname==='/init'){
   if(this.hostSecret)return new Response('Already exists',{status:409});
   const body=await request.json();this.hostSecret=body.hostSecret;return new Response('Created',{status:201});
  }
  if(request.headers.get('Upgrade')!=='websocket'||!this.hostSecret)return new Response('Not found',{status:404});
  const role=url.searchParams.get('role'),secret=url.searchParams.get('secret');
  if(role==='host'&&secret!==this.hostSecret)return new Response('Unauthorized',{status:401});
  if(role!=='host'&&role!=='student')return new Response('Invalid role',{status:400});
  if(this.sockets.size>=100)return new Response('Room full',{status:429});
  const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
  const id=crypto.randomUUID(),name=role==='student'?(url.searchParams.get('name')||'Aluno').slice(0,30):'Professor';
  this.sockets.set(id,{socket:server,role,name,score:0,answered:false});
  server.addEventListener('message',event=>this.onMessage(id,event.data));
  server.addEventListener('close',()=>{this.sockets.delete(id);this.broadcastRoster()});
  server.send(JSON.stringify({type:'connected',id,role,questionIndex:this.questionIndex,deadline:this.deadline}));
  this.broadcastRoster();
  return new Response(null,{status:101,webSocket:client});
 }
 send(id,payload){const peer=this.sockets.get(id);if(peer)try{peer.socket.send(JSON.stringify(payload))}catch{}}
 broadcast(payload){for(const id of this.sockets.keys())this.send(id,payload)}
 broadcastRoster(){this.broadcast({type:'roster',students:[...this.sockets].filter(([,p])=>p.role==='student').map(([id,p])=>({id,name:p.name,score:p.score}))})}
 onMessage(id,raw){
  const peer=this.sockets.get(id);if(!peer||typeof raw!=='string'||raw.length>20000)return;
  let msg;try{msg=JSON.parse(raw)}catch{return}
  if(peer.role==='host'){
   if(msg.type==='start'&&Array.isArray(msg.questions)&&msg.questions.length>0&&msg.questions.length<=100&&msg.questions.every(q=>typeof q.prompt==='string'&&q.prompt.length<=300&&Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=4&&q.options.every(a=>typeof a==='string'&&a.length<=180)&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length)){
    this.session={questions:msg.questions.map(q=>({prompt:q.prompt,options:q.options,correct:q.correct,timeLimit:[10,15,20,30,45,60,90,120].includes(q.timeLimit)?q.timeLimit:30,pointsMultiplier:[1,2,3].includes(q.pointsMultiplier)?q.pointsMultiplier:1})),mode:msg.mode==='buttons'?'buttons':'full'};
    this.questionIndex=-1;this.broadcast({type:'ready',count:this.session.questions.length,mode:this.session.mode});
   }
   if(msg.type==='next'&&this.session){this.questionIndex++;if(this.questionIndex>=this.session.questions.length){this.broadcast({type:'finished'});return}const q=this.session.questions[this.questionIndex];this.deadline=Date.now()+q.timeLimit*1000;this.answers.clear();for(const p of this.sockets.values())if(p.role==='student')p.answered=false;this.broadcast({type:'question',index:this.questionIndex,count:this.session.questions.length,deadline:this.deadline,multiplier:q.pointsMultiplier,mode:this.session.mode,prompt:this.session.mode==='full'?q.prompt:null,options:this.session.mode==='full'?q.options:null,answerCount:q.options.length});this.send(id,{type:'hostQuestion',prompt:q.prompt,options:q.options,index:this.questionIndex,deadline:this.deadline});}
   if(msg.type==='reveal'&&this.session&&this.questionIndex>=0){const q=this.session.questions[this.questionIndex];this.deadline=0;this.broadcast({type:'reveal',correct:q.correct,leaderboard:[...this.sockets.values()].filter(p=>p.role==='student').map(p=>({name:p.name,score:p.score})).sort((a,b)=>b.score-a.score).slice(0,10)})}
  }else if(msg.type==='answer'&&this.session&&this.questionIndex>=0&&!peer.answered&&Date.now()<=this.deadline){
   const q=this.session.questions[this.questionIndex];if(!Number.isInteger(msg.choice)||msg.choice<0||msg.choice>=q.options.length)return;
   peer.answered=true;const correct=msg.choice===q.correct;if(correct)peer.score+=1000*q.pointsMultiplier;
   this.send(id,{type:'answerReceived',correct,score:peer.score});this.broadcastRoster();
  }
 }
}
