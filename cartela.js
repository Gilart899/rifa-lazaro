import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { CONFIG } from "./config.js";

const grid = document.getElementById("grid");
const titulo = document.getElementById("titulo");
const sel = document.getElementById("sel");
const total = document.getElementById("total");
const mensagem = document.getElementById("mensagemDisponibilidade");

let cartela = 0;
let selecionados = [];
let status = {};

try {
  const salvos = JSON.parse(localStorage.getItem("rifaSelecionados") || "[]");
  selecionados = [...new Set(salvos.map(n => String(n).padStart(3, "0")).filter(n => /^\d{3}$/.test(n) && Number(n) <= 999))];
} catch {}

function formatarNumero(n) { return String(n).padStart(3, "0"); }
function estaDisponivel(numero) {
  const item = status[numero];
  if (!item) return true;
  if (item.status === "disponivel") return true;
  if (item.status === "reservado" && Number(item.expiraEm || 0) <= Date.now()) return true;
  return false;
}
function update() {
  sel.textContent = selecionados.join(", ") || "Nenhum";
  total.textContent = `R$ ${(selecionados.length * Number(CONFIG.valor || 10)).toFixed(2).replace(".", ",")}`;
  localStorage.setItem("rifaSelecionados", JSON.stringify(selecionados));
  render();
}
function selecionarNumero(key) {
  if (!estaDisponivel(key)) {
    alert(`O número ${key} não está disponível no momento.`);
    return false;
  }
  if (!selecionados.includes(key)) {
    if (selecionados.length >= 10) {
      alert("Você pode escolher no máximo 10 números por participação.");
      return false;
    }
    selecionados.push(key);
  }
  return true;
}
function render() {
  titulo.textContent = `CARTELA ${String(cartela + 1).padStart(2, "0")}`;
  grid.innerHTML = "";
  const inicio = cartela * 100;
  for (let i = 0; i < 100; i++) {
    const key = formatarNumero(inicio + i);
    const item = status[key];
    const disponivel = estaDisponivel(key);
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = key;
    b.style.cssText = "padding:12px 4px;border-radius:12px;border:1px solid #58b833;background:#07340c;color:#fff;font-weight:800";
    if (!disponivel) {
      b.disabled = true;
      b.style.background = item?.status === "vendido" ? "#591010" : "#5a4108";
    }
    if (selecionados.includes(key)) {
      b.style.background = "#7cff00";
      b.style.color = "#061000";
      b.style.boxShadow = "0 0 0 3px rgba(124,255,0,.35),0 0 18px rgba(124,255,0,.35)";
      b.textContent = `✓ ${key}`;
    }
    b.onclick = () => {
      if (!estaDisponivel(key)) return;
      if (selecionados.includes(key)) selecionados = selecionados.filter(x => x !== key);
      else if (selecionarNumero(key)) {}
      update();
    };
    grid.appendChild(b);
  }
}
function ir(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0 || n > 999) {
    alert("Digite um número entre 000 e 999.");
    return;
  }
  const key = formatarNumero(n);
  cartela = Math.floor(n / 100);
  selecionarNumero(key);
  localStorage.setItem("rifaSelecionados", JSON.stringify(selecionados));
  update();
  requestAnimationFrame(() => document.getElementById("grid").scrollIntoView({ behavior: "smooth", block: "center" }));
}

document.getElementById("prev").onclick = () => { cartela = (cartela + 9) % 10; render(); };
document.getElementById("next").onclick = () => { cartela = (cartela + 1) % 10; render(); };
document.getElementById("ir").onclick = () => ir(document.getElementById("numero").value);
document.getElementById("sugerir").onclick = () => {
  const disponiveis = [];
  for (let i = 0; i < 1000; i++) {
    const key = formatarNumero(i);
    if (estaDisponivel(key) && !selecionados.includes(key)) disponiveis.push(key);
  }
  if (!disponiveis.length) return alert("No momento não encontramos números disponíveis.");
  const key = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  cartela = Math.floor(Number(key) / 100);
  selecionarNumero(key);
  update();
  requestAnimationFrame(() => document.getElementById("grid").scrollIntoView({ behavior: "smooth", block: "center" }));
};
document.getElementById("continuar").onclick = () => {
  if (!selecionados.length) return alert("Escolha pelo menos um número.");
  localStorage.setItem("rifaSelecionados", JSON.stringify(selecionados));
  location.href = "reserva.html";
};

onValue(ref(db, "rifa/numeros"), snapshot => {
  status = snapshot.val() || {};
  const totalDisponiveis = Object.keys(status).filter(estaDisponivel).length;
  if (mensagem) mensagem.textContent = `${totalDisponiveis} números disponíveis no momento.`;
  render();
}, error => {
  console.error("Erro ao carregar números:", error);
  if (mensagem) mensagem.textContent = "Não foi possível atualizar os números agora. Tente novamente.";
  render();
});

const params = new URLSearchParams(location.search);
if (params.has("numero")) {
  const n = params.get("numero");
  if (/^\d{1,3}$/.test(n)) {
    const key = formatarNumero(Number(n));
    if (!selecionados.includes(key)) selecionados.push(key);
    cartela = Math.floor(Number(key) / 100);
  }
}
render();

let start = 0;
grid.addEventListener("touchstart", e => { start = e.touches[0].clientX; }, { passive: true });
grid.addEventListener("touchend", e => {
  const end = e.changedTouches[0].clientX;
  if (Math.abs(end - start) > 60) {
    cartela = end < start ? Math.min(9, cartela + 1) : Math.max(0, cartela - 1);
    render();
  }
});
