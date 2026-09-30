import { CONFIG } from "./config.js";
import { db, auth, ref, get, signInAnonymously } from "./firebase.js";
import { runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const canvas = document.getElementById("canvasRaspadinha");
const ctx = canvas ? canvas.getContext("2d") : null;
const premioResultado = document.getElementById("premioResultado");
const mensagemPremio = document.getElementById("mensagemPremio");
const iniciarBotao = document.getElementById("iniciarRaspagem");
const voltarInicio = document.getElementById("voltarInicio");
const areaConfetes = document.getElementById("confetes");
const statusRaspadinha = document.getElementById("statusRaspadinha");
let raspando = false, iniciado = false, vencedor = false, porcentagemRaspada = 0;
let reserva = null;
let numeroDaJogada = null;

function formatarMoeda(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function obterReservaId(){return localStorage.getItem("rifaReservaId") || new URLSearchParams(location.search).get("reservaId") || ""}

async function garantirAuth(){
  if(auth.currentUser) return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}

async function carregarReserva(){
  const id = obterReservaId();
  if(!id){ bloquear("Escolha seus números e faça uma reserva antes de acessar a raspadinha."); return; }
  try{
    const user = await garantirAuth();
    const snap = await get(ref(db, `rifa/reservas/${id}`));
    if(!snap.exists()){ bloquear("Participação não encontrada."); return; }
    const dados = snap.val();
    if(dados.participanteId !== user.uid){ bloquear("Esta participação não pertence a este aparelho."); return; }
    reserva = dados;
    localStorage.setItem("rifaParticipanteId", user.uid);
    localStorage.setItem("rifaReservaCriadaEm", String(dados.criadoEm || Date.now()));
    localStorage.setItem("rifaSelecionados", JSON.stringify(dados.numeros || []));
    const nums = dados.numeros || [];
    const valor = Number(dados.valorTotal || nums.length * Number(CONFIG.valor || 10));
    document.getElementById("confirmacaoNumeros").textContent = nums.length ? nums.join(", ") : "Nenhum número";
    document.getElementById("confirmacaoValor").textContent = `${nums.length} número(s) • Total: ${formatarMoeda(valor)}`;
    const data = new Date(Number(dados.criadoEm || Date.now()));
    document.getElementById("confirmacaoData").textContent = data.toLocaleDateString("pt-BR");
    document.getElementById("confirmacaoHora").textContent = data.toLocaleTimeString("pt-BR");
    document.getElementById("pixChave").textContent = CONFIG.pix || "045.761.515-09";
    atualizarStatus();
  }catch(e){ console.error(e); bloquear("Não foi possível carregar sua participação agora."); }
}

function bloquear(msg){
  if(statusRaspadinha) statusRaspadinha.textContent = `🔒 ${msg}`;
  if(iniciarBotao){ iniciarBotao.disabled = true; iniciarBotao.textContent = "🔒 RASPADINHA BLOQUEADA"; }
  if(canvas) canvas.style.opacity = ".55";
}

function atualizarStatus(){
  if(!reserva) return;
  if(reserva.raspadinhaUsada || reserva.raspadinhaResultado){
    if(statusRaspadinha) statusRaspadinha.textContent = "🍀 Esta raspadinha já foi utilizada.";
    premioResultado.textContent = reserva.raspadinhaResultado || reserva.raspadinhaPremio || "Resultado registrado";
    if(mensagemPremio) mensagemPremio.textContent = reserva.raspadinhaResultado === "Não foi dessa vez" ? "💚 Obrigado por participar!" : `🎉 Você ganhou: ${reserva.raspadinhaResultado}`;
    if(iniciarBotao){ iniciarBotao.disabled = true; iniciarBotao.textContent = "🍀 RASPADINHA JÁ UTILIZADA"; }
    return;
  }
  if(reserva.pagamento === true && reserva.raspadinhaLiberada === true && reserva.status === "vendido"){
    if(statusRaspadinha) statusRaspadinha.textContent = "🍀 Sua raspadinha está liberada! Você pode raspar agora.";
    if(iniciarBotao){ iniciarBotao.disabled = false; iniciarBotao.textContent = "🍀 RASPAR AGORA"; }
  }else if(reserva.comprovanteEnviado){
    bloquear("Comprovante recebido. Aguarde a confirmação e a liberação pelo administrador.");
  }else{
    bloquear("Envie o comprovante após realizar o PIX. A raspadinha será liberada somente após a confirmação.");
  }
}

function formatarPremio(p){ return p || "Prêmio da Raspadinha"; }
function ajustarCanvas(){if(!canvas)return;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
function criarCobertura(){if(!ctx)return;ctx.globalCompositeOperation="source-over";ctx.fillStyle="#16752b";ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);ctx.fillStyle="#d9ffd0";ctx.font="900 28px Arial";ctx.textAlign="center";ctx.fillText("🍀 RASPE AQUI",canvas.clientWidth/2,canvas.clientHeight/2)}
function iniciarRaspadinha(){if(iniciado || !reserva?.raspadinhaLiberada || reserva?.raspadinhaUsada)return;iniciado=true;criarCobertura()}
function raspar(x,y){if(!ctx||!iniciado||vencedor)return;ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill();calcularRaspagem()}
function calcularRaspagem(){const dados=ctx.getImageData(0,0,canvas.width,canvas.height).data;let transparentes=0;for(let i=3;i<dados.length;i+=4)if(dados[i]===0)transparentes++;porcentagemRaspada=transparentes/(dados.length/4)*100;if(porcentagemRaspada>=55)revelarPremio()}

async function revelarPremio(){
  if(vencedor || !reserva) return;
  vencedor=true;
  const premio = reserva.raspadinhaPremio || "Não foi dessa vez";
  try {
    const snap = await runTransaction(ref(db, `rifa/reservas/${reserva.reservaId}`), atual => {
      if(!atual || atual.participanteId !== auth.currentUser?.uid || atual.pagamento !== true || atual.raspadinhaLiberada !== true || atual.raspadinhaUsada === true) return;
      return { ...atual, raspadinhaUsada:true, raspadinhaResultado:atual.raspadinhaPremio || "Não foi dessa vez", raspadinhaUsadaEm:Date.now() };
    });
    if(!snap.committed){ vencedor=false; if(statusRaspadinha) statusRaspadinha.textContent="❌ Esta raspadinha já foi utilizada."; return; }
    reserva = snap.snapshot.val();
  } catch(e){
    console.error(e); vencedor=false;
    if(statusRaspadinha) statusRaspadinha.textContent="❌ Não foi possível registrar o resultado. Tente novamente.";
    return;
  }
  mensagemPremio.textContent = premio === "Não foi dessa vez" ? "💚 Obrigado por participar!" : `🎉 Parabéns! Você ganhou: ${formatarPremio(premio)}`;
  mensagemPremio.classList.add("sucesso");
  premioResultado.textContent=premio;
  if(statusRaspadinha) statusRaspadinha.textContent="✅ Resultado registrado para esta participação.";
  criarConfetes();
}
function criarConfetes(){if(!areaConfetes)return;for(let i=0;i<50;i++){const e=document.createElement("span");e.className="confete";e.style.left=Math.random()*100+"%";e.style.animationDelay=Math.random()*1.2+"s";areaConfetes.appendChild(e);setTimeout(()=>e.remove(),4000)}}
function posicao(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
if(canvas){canvas.addEventListener("mousedown",()=>raspando=true);canvas.addEventListener("mouseup",()=>raspando=false);canvas.addEventListener("mouseleave",()=>raspando=false);canvas.addEventListener("mousemove",e=>{if(raspando){const p=posicao(e);raspar(p.x,p.y)}});canvas.addEventListener("touchstart",e=>{raspando=true;e.preventDefault()},{passive:false});canvas.addEventListener("touchend",()=>raspando=false);canvas.addEventListener("touchmove",e=>{if(raspando){const t=e.touches[0],r=canvas.getBoundingClientRect();raspar(t.clientX-r.left,t.clientY-r.top);e.preventDefault()}},{passive:false})}

iniciarBotao?.addEventListener("click",iniciarRaspadinha);
voltarInicio?.addEventListener("click",()=>location.href="index.html");
document.getElementById("limparNumeros")?.addEventListener("click",()=>{localStorage.removeItem("rifaSelecionados");localStorage.removeItem("rifaReservaId");localStorage.removeItem("rifaReservaCriadaEm");location.href="cartela.html"});
document.getElementById("copiarPix")?.addEventListener("click",async()=>{const pix=CONFIG.pix||"045.761.515-09";try{await navigator.clipboard.writeText(pix);document.getElementById("mensagemPix").textContent="✅ PIX copiado!"}catch{document.getElementById("mensagemPix").textContent=`Chave PIX: ${pix}`}});
document.getElementById("enviarComprovante")?.addEventListener("click",()=>{const id=obterReservaId();location.href=`comprovante.html${id?`?reservaId=${encodeURIComponent(id)}`:""}`});
window.addEventListener("resize",()=>{if(!iniciado){ajustarCanvas();criarCobertura()}});
window.addEventListener("load",()=>{ajustarCanvas();criarCobertura();carregarReserva()});
