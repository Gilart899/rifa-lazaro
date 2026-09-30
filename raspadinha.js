import { CONFIG } from "./config.js";

const canvas = document.getElementById("canvasRaspadinha");
const ctx = canvas ? canvas.getContext("2d") : null;
const premioResultado = document.getElementById("premioResultado");
const mensagemPremio = document.getElementById("mensagemPremio");
const iniciarBotao = document.getElementById("iniciarRaspagem");
const voltarInicio = document.getElementById("voltarInicio");
const areaConfetes = document.getElementById("confetes");
let raspando = false, iniciado = false, vencedor = false, porcentagemRaspada = 0;

function formatarMoeda(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function lerDados(){
  let numeros=[]; try{numeros=JSON.parse(localStorage.getItem("rifaSelecionados")||"[]")}catch{}
  numeros=[...new Set(numeros.map(n=>String(n).padStart(3,"0")).filter(n=>/^\d{3}$/.test(n)))];
  const valor=numeros.length*Number(CONFIG.valor||10);
  const criado=Number(localStorage.getItem("rifaReservaCriadaEm")||0);
  const data=criado?new Date(criado):new Date();
  document.getElementById("confirmacaoNumeros").textContent=numeros.length?numeros.join(", "):"Nenhum número selecionado";
  document.getElementById("confirmacaoValor").textContent=numeros.length?`${numeros.length} número(s) • Total: ${formatarMoeda(valor)}`:"R$ 0,00";
  document.getElementById("confirmacaoData").textContent=data.toLocaleDateString("pt-BR");
  document.getElementById("confirmacaoHora").textContent=data.toLocaleTimeString("pt-BR");
  document.getElementById("pixChave").textContent=CONFIG.pix||"045.761.515-09";
}

function ajustarCanvas(){if(!canvas)return;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
function criarCobertura(){if(!ctx)return;ctx.globalCompositeOperation="source-over";ctx.fillStyle="#16752b";ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);ctx.fillStyle="#d9ffd0";ctx.font="900 28px Arial";ctx.textAlign="center";ctx.fillText("🍀 RASPE AQUI",canvas.clientWidth/2,canvas.clientHeight/2)}
function iniciarRaspadinha(){if(iniciado)return;iniciado=true;criarCobertura()}
function raspar(x,y){if(!ctx||!iniciado||vencedor)return;ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill();calcularRaspagem()}
function calcularRaspagem(){const dados=ctx.getImageData(0,0,canvas.width,canvas.height).data;let transparentes=0;for(let i=3;i<dados.length;i+=4)if(dados[i]===0)transparentes++;porcentagemRaspada=transparentes/(dados.length/4)*100;if(porcentagemRaspada>=55)revelarPremio()}
function revelarPremio(){if(vencedor)return;vencedor=true;const premio=CONFIG?.raspadinha?.premio||"Prêmio da Raspadinha";mensagemPremio.textContent=`🎉 Parabéns! Você ganhou: ${premio}`;mensagemPremio.classList.add("sucesso");premioResultado.textContent=premio;criarConfetes()}
function criarConfetes(){if(!areaConfetes)return;for(let i=0;i<50;i++){const e=document.createElement("span");e.className="confete";e.style.left=Math.random()*100+"%";e.style.animationDelay=Math.random()*1.2+"s";areaConfetes.appendChild(e);setTimeout(()=>e.remove(),4000)}}
function posicao(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
if(canvas){canvas.addEventListener("mousedown",()=>raspando=true);canvas.addEventListener("mouseup",()=>raspando=false);canvas.addEventListener("mouseleave",()=>raspando=false);canvas.addEventListener("mousemove",e=>{if(raspando){const p=posicao(e);raspar(p.x,p.y)}});canvas.addEventListener("touchstart",e=>{raspando=true;e.preventDefault()},{passive:false});canvas.addEventListener("touchend",()=>raspando=false);canvas.addEventListener("touchmove",e=>{if(raspando){const t=e.touches[0],r=canvas.getBoundingClientRect();raspar(t.clientX-r.left,t.clientY-r.top);e.preventDefault()}},{passive:false})}

iniciarBotao?.addEventListener("click",iniciarRaspadinha);
voltarInicio?.addEventListener("click",()=>location.href="index.html");
document.getElementById("limparNumeros")?.addEventListener("click",()=>{localStorage.removeItem("rifaSelecionados");localStorage.removeItem("rifaReservaId");localStorage.removeItem("rifaReservaCriadaEm");location.href="cartela.html"});
document.getElementById("copiarPix")?.addEventListener("click",async()=>{const pix=CONFIG.pix||"045.761.515-09";try{await navigator.clipboard.writeText(pix);document.getElementById("mensagemPix").textContent="✅ PIX copiado!"}catch{document.getElementById("mensagemPix").textContent=`Chave PIX: ${pix}`}});
document.getElementById("enviarComprovante")?.addEventListener("click",()=>{const id=localStorage.getItem("rifaReservaId")||"";location.href=`comprovante.html${id?`?reservaId=${encodeURIComponent(id)}`:""}`});
window.addEventListener("resize",()=>{if(!iniciado){ajustarCanvas();criarCobertura()}});
window.addEventListener("load",()=>{lerDados();ajustarCanvas();criarCobertura()});
