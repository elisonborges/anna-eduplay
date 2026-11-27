// Adaptador do motor de salas AnnA Virtual para Node.js local.
import { webcrypto as crypto } from "node:crypto";
class DurableObject { constructor(ctx) { this.ctx=ctx; } }

// Uma sala por Durable Object SQLite; todas as mutações são serializadas no objeto.
// Tokens individuais de sessão, sem cadastro, limitam leitura e escrita de cada sala.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=(x,max=32)=>String(x??"").trim().slice(0,max);
const norm=x=>clean(x,100).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleUpperCase("pt-BR");
const knownWords={"Animal":["macaco","morcego","mico","mula","leão","lobo","lagarto","jacaré","cachorro","cavalo","cobra","coelho","coruja","gato","galinha","girafa","elefante","urso","pato","porco","peixe","rato","raposa","sapo","tigre","tartaruga","zebra","abelha","aranha","arara","borboleta","baleia","formiga","vaca"],"Cor":["amarelo","azul","bege","branco","cinza","dourado","laranja","lilás","magenta","marrom","preto","prata","rosa","roxo","turquesa","verde","vermelho","violeta"],"Fruta":["abacaxi","abacate","acerola","ameixa","amora","banana","caju","caqui","cereja","coco","figo","goiaba","jaca","kiwi","laranja","limão","maçã","mamão","manga","maracujá","melancia","melão","morango","pera","pêssego","pitanga","romã","tangerina","uva"],"Objeto":["anel","agulha","armário","balde","bola","boneca","borracha","cadeira","caderno","caneta","chave","colher","copo","escova","espelho","faca","fone","garrafa","garfo","geladeira","janela","lápis","livro","mesa","mochila","óculos","panela","papel","pente","porta","prato","relógio","tesoura","telefone","televisão","vaso"],"Profissão":["advogado","arquiteto","ator","bombeiro","cientista","cozinheiro","dentista","designer","eletricista","enfermeiro","engenheiro","farmacêutico","fotógrafo","jornalista","médico","motorista","músico","padeiro","pedreiro","piloto","policial","professor","psicólogo","veterinário"],"Comida":["arroz","bolo","brigadeiro","batata","churrasco","coxinha","feijão","farofa","frango","hambúrguer","lasanha","macarrão","moqueca","omelete","pão","pastel","pizza","quibe","risoto","salada","sopa","tapioca","torta"],"PHC":["braço","boca","cabeça","coração","costela","dedo","dente","estômago","fígado","joelho","mão","nariz","olho","orelha","pé","perna","pulmão","rim"],"CEP":["manaus","maceió","maranhão","méxico","minas gerais","natal","paraná","pernambuco","piauí","portugal","recife","rio de janeiro","rio grande do sul","salvador","são paulo","sergipe","teresina","tocantins","uruguai","vitória","brasil","belém","bahia","curitiba","ceará","fortaleza","frança","goiânia","goiás","japão","joão pessoa","londres","lisboa","argentina","alagoas","amazonas","acre","alemanha","angola","austrália"],"Flor":["azaleia","begônia","cravo","dália","girassol","hortênsia","jasmim","lavanda","margarida","orquídea","rosa","tulipa","violeta"],"Forma geométrica":["círculo","cubo","cilindro","esfera","hexágono","losango","oval","pentágono","quadrado","retângulo","triângulo"],"Bebida":["água","café","chá","guaraná","iogurte","leite","limonada","refrigerante","suco","vitamina"],"Parte do corpo":["braço","boca","cabeça","coração","costela","dedo","dente","estômago","fígado","joelho","mão","nariz","olho","orelha","pé","perna","pulmão","rim"]};
const dictionary=Object.fromEntries(Object.entries(knownWords).map(([k,v])=>[norm(k),new Set(v.map(norm))]));
const classify=(category,answer,letter)=>!answer?"empty":!norm(answer).startsWith(letter)?"invalid":dictionary[norm(category)]?.has(norm(answer))?"valid":"review";
function collectResults(room){
 // Nova sala: cada jogador preserva suas palavras; sala antiga usa a resposta compartilhada.
 if(!room.submissions)return room.categories.map((category,index)=>{
  const answer=clean(room.answers[index]?.value,80);
  return {category,categoryIndex:index,answer,status:classify(category,answer,room.letter),by:room.answers[index]?.by||"",votes:{}};
 });
 const rows=[];
 room.categories.forEach((category,index)=>{
  let hasAnswer=false;
  room.members.forEach(member=>{
   const answer=clean(room.submissions[member.id]?.[index],80);
   if(!answer)return;
   hasAnswer=true;
   rows.push({category,categoryIndex:index,answer,status:classify(category,answer,room.letter),by:member.id,votes:{}});
  });
  if(!hasAnswer)rows.push({category,categoryIndex:index,answer:"",status:"empty",by:"",votes:{}});
 });
 return rows;
}
const allowed="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomLetter=(used,letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))=>{
 const alphabet=letters.join("");
 const choices=letters.filter(x=>!used.includes(x));
 const pool=choices.length?choices:letters;
 const n=crypto.getRandomValues(new Uint32Array(1))[0];
 return pool[n%pool.length];
};
function expose(room,viewer){
 const {code,team,eventCode,categories,rounds,duration,round,letter,used,deadline,stage,members,answers,results,score,history,version}=room;
 const submissions=room.stage==="game"?{[viewer.id]:room.submissions?.[viewer.id]||[]}:room.submissions||{};
 return {code,team,eventCode:eventCode||"",categories,rounds,duration,round,letter,deadline,stage,
  members:members.map(({id,name})=>({id,name})),answers,submissions,results,score,history,version,finishedEarly:!!room.finishedEarly,
  viewer:viewer.id,host:viewer.id===room.host};
}
export class StopArenaRoom extends DurableObject {
 async alarm(){
  const room=await this.ctx.storage.get("room");
  if(!room)return;
  const expiry=room.touched+24*3600*1000;
  if(Date.now()>=expiry)await this.ctx.storage.delete("room");
  else await this.ctx.storage.setAlarm(expiry);
 }
 async fetch(request){
  if(request.method!=="POST")return json({error:"Método inválido"},405);
  let body;
  try{body=await request.json()}catch{return json({error:"JSON inválido"},400)}
  const op=body?.op,now=Date.now();
  let room=await this.ctx.storage.get("room");
  if(room&&now-room.touched>24*3600*1000){room=null;await this.ctx.storage.delete("room")}
  if(op==="public"){
   if(!room)return json({error:"Sala expirada"},404);
   const active=room.members.filter(m=>Number(m.lastSeen||0)>now-20000).length;
   return json({room:{code:room.code,name:room.team,eventCode:room.eventCode||"",stage:room.stage,
    registered:room.members.length,online:active,capacity:6,available:room.stage==="lobby"?Math.max(0,6-room.members.length):0,
    joinable:room.stage==="lobby"&&room.members.length<6}});
  }
  if(op==="create"){
   if(room)return json({error:"Código já em uso"},409);
   const name=clean(body.name,25),team=clean(body.team,35),code=clean(body.code,8);
   const categories=Array.isArray(body.categories)?body.categories.map(x=>clean(x,42)):[];
   const letters=Array.isArray(body.letters)?body.letters:["ABCDEFGHIJKLMNOPQRSTUVWXYZ"].join("").split("");
   if(!letters.length||letters.length>26||letters.some(x=>typeof x!=="string"||!(/^[A-Z]$/).test(x))||new Set(letters).size!==letters.length)return json({error:"Escolha ao menos uma letra válida"},400);
   const rounds=Number(body.rounds),duration=Number(body.duration);
   const sequence=Array.isArray(body.letterSequence)?body.letterSequence:[];
   if(sequence.length&&(sequence.length!==rounds||sequence.some(x=>!letters.includes(x))))
     return json({error:"Sequência de letras inválida"},400);
   if(!name||!team||!/^[A-HJ-NP-Z2-9]{7}$/.test(code)||
    categories.length<6||categories.length>12||categories.some(x=>!x)||
    new Set(categories.map(norm)).size!==categories.length||
    !Number.isInteger(rounds)||rounds<1||rounds>20||
    !Number.isInteger(duration)||duration<30||duration>300)return json({error:"Configuração inválida"},400);
   const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
   room={code,team,eventCode:/^[A-HJ-NP-Z2-9]{7}$/.test(body.eventCode||"")?body.eventCode:"",categories,letters,sequence,rounds,duration,round:0,letter:"",deadline:0,stage:"lobby",
    host:id,members:[{id,name,token,lastSeen:now}],answers:[],results:[],score:0,history:[],used:[],
    version:1,touched:now};
   await this.ctx.storage.put("room",room);
   await this.ctx.storage.setAlarm(now+24*3600*1000);
   return json({token,room:expose(room,room.members[0])});
  }
  if(!room)return json({error:"Sala não encontrada ou expirada"},404);
  if(op==="join"){
   if(room.stage!=="lobby")return json({error:"Partida já começou. Entre antes do início."},409);
   if(room.members.length>=6)return json({error:"Sala cheia (máximo de 6)"},409);
   const name=clean(body.name,25);
   if(!name||room.members.some(x=>norm(x.name)===norm(name)))return json({error:"Use um nome diferente"},400);
   const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
   const player={id,name,token,lastSeen:now};room.members.push(player);room.version++;room.touched=now;
   await this.ctx.storage.put("room",room);
   await this.ctx.storage.setAlarm(now+24*3600*1000);
   return json({token,room:expose(room,player)});
  }
  const viewer=room.members.find(x=>x.token===body.token);
  if(!viewer)return json({error:"Acesso à sala não autorizado"},403);
  if(room.stage==="game"&&room.deadline&&now>=room.deadline){
   room.stage="review";room.deadline=0;
   room.results=collectResults(room);
   room.version++;
   await this.ctx.storage.put("room",room);
  }
  if(op==="state"){
   if(now-Number(viewer.lastSeen||0)>7000){
    viewer.lastSeen=now;await this.ctx.storage.put("room",room);
   }
   return json({room:expose(room,viewer)});
  }
  if(op!=="action")return json({error:"Operação inválida"},400);
  if(now-Number(viewer.lastSeen||0)>7000)viewer.lastSeen=now;
  const action=body.action,host=viewer.id===room.host;
  if(action==="start"){
   if(!host||room.stage!=="lobby"||room.members.length<2)return json({error:"É preciso 2 participantes e o organizador para iniciar"},409);
   room.stage="game";room.round=1;room.letter=room.sequence?.[0]||randomLetter([],room.letters);
   room.used=[room.letter];room.answers=room.categories.map(()=>({value:"",by:""}));
   room.submissions=Object.fromEntries(room.members.map(m=>[m.id,room.categories.map(()=>"")]));
   room.results=[];room.deadline=now+room.duration*1000;
  }else if(action==="answer"){
   if(room.stage!=="game"||now>=room.deadline)return json({error:"Rodada encerrada"},409);
   const index=Number(body.index),value=clean(body.value,80).toLocaleUpperCase("pt-BR");
   if(!Number.isInteger(index)||index<0||index>=room.categories.length)return json({error:"Categoria inválida"},400);
   if(value&&!/^[\p{L}\p{M}0-9 \-'.()]+$/u.test(value))return json({error:"Caracteres inválidos"},400);
   room.answers[index]={value,by:viewer.id};
   if(room.submissions){
    if(!room.submissions[viewer.id])room.submissions[viewer.id]=room.categories.map(()=>"");
    room.submissions[viewer.id][index]=value;
   }
  }else if(action==="stop"){
   if(room.stage!=="game")return json({error:"Rodada não iniciada"},409);
   room.stage="review";room.deadline=0;
   room.results=collectResults(room);
  }else if(action==="vote"){
   if(room.stage!=="review")return json({error:"A rodada não está em conferência"},409);
   const index=Number(body.index),status=body.status;
   if(!Number.isInteger(index)||index<0||index>=room.results.length||!["valid","invalid"].includes(status))
    return json({error:"Voto inválido"},400);
   const item=room.results[index];
   if(!String(item.answer||"").trim())return json({error:"Não é possível votar em uma resposta vazia"},400);
   if(item.finalized)return json({error:"Avaliação já finalizada pelo organizador"},409);
   item.votes={...(item.votes||{}),[viewer.id]:status};
   const votes=Object.values(item.votes);
   if(votes.length>=2&&votes.every(v=>v===votes[0])){
    item.status=item.ai&&item.ai.status!==votes[0]&&item.ai.status!=="review"?"review":votes[0];
   }else if(votes.length>=2)item.status="review";
   // Um único voto nunca encerra a avaliação previamente pendente.
  }else if(action==="aiHint"){
   if(!host||room.stage!=="review")return json({error:"Somente o organizador pode solicitar a IA"},403);
   const index=Number(body.index),item=room.results[index];
   if(!Number.isInteger(index)||!item||!String(item.answer||"").trim())return json({error:"Resposta vazia ou inválida"},400);
   const suggestion=body.suggestion;
   if(!["valid","invalid","review"].includes(suggestion?.status))return json({error:"Sugestão inválida"},400);
   item.ai={status:suggestion.status,reason:clean(suggestion.reason,160),corrected:clean(suggestion.corrected,80)};
   if(item.ai.corrected||(item.ai.status!=="review"&&item.ai.status!==item.status))item.status="review";
  }else if(action==="grade"){
   if(!host||room.stage!=="review")return json({error:"Só o organizador pode validar"},403);
   const index=Number(body.index),status=body.status;
   if(!Number.isInteger(index)||index<0||index>=room.results.length||!["valid","invalid","review"].includes(status))
    return json({error:"Avaliação inválida"},400);
   if(!String(room.results[index].answer||"").trim())return json({error:"Resposta vazia não pode ser avaliada"},400);
   room.results[index].status=status;room.results[index].finalized=status!=="review";
  }else if(action==="next"){
   if(!host||room.stage!=="review"||room.results.some(x=>x.status==="review"||x.answer&&!x.finalized&&Object.keys(x.votes||{}).length<2))
    return json({error:"Todas as respostas preenchidas precisam de dois votos ou decisão final do organizador"},409);
   const valid=new Set(room.results.filter(x=>x.status==="valid").map(x=>x.categoryIndex??room.categories.indexOf(x.category)));
   const earned=valid.size*10;room.score+=earned;
   room.history.push({round:room.round,letter:room.letter,score:earned,valid:valid.size});
   if(room.round>=room.rounds){room.stage="end";room.deadline=0}
   else{
    room.round++;room.letter=room.sequence?.[room.round-1]||randomLetter(room.used,room.letters);room.used.push(room.letter);
    room.stage="game";room.answers=room.categories.map(()=>({value:"",by:""}));
    room.submissions=Object.fromEntries(room.members.map(m=>[m.id,room.categories.map(()=>"")]));
    room.results=[];room.deadline=now+room.duration*1000;
   }
  }else if(action==="close"){
   if(!host)return json({error:"Somente o organizador pode encerrar a sala"},403);
   if(!["lobby","game","review"].includes(room.stage))return json({error:"Esta partida já foi encerrada"},409);
   room.stage="end";room.deadline=0;room.finishedEarly=true;
  }else{return json({error:"Ação desconhecida"},400)}
  room.version++;room.touched=now;
  await this.ctx.storage.put("room",room);
   await this.ctx.storage.setAlarm(now+24*3600*1000);
  return json({room:expose(room,viewer)});
 }
}
