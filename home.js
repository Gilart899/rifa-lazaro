import { db, ref, get } from "./firebase.js";

const sorteioEl = document.getElementById("dataSorteio");
const btnSorte = document.getElementById("btnNumeroSorte");
const resultadoSorte = document.getElementById("resultadoNumeroSorte");

function formatarSorteio(valor) {
  if (!valor) return "30/12/2026 • 20:00";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " • " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

async function carregarConfiguracao() {
  try {
    const snap = await get(ref(db, "rifa/configuracao"));
    if (snap.exists() && snap.val().sorteio && sorteioEl) {
      sorteioEl.textContent = formatarSorteio(snap.val().sorteio);
    }
  } catch (erro) {
    console.warn("Não foi possível carregar a data do sorteio.", erro);
  }
}

function numeroDaSorte() {
  const salvo = localStorage.getItem("rifaNumeroDaSorte");
  if (/^\d{3}$/.test(salvo || "")) return salvo;
  const novo = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  localStorage.setItem("rifaNumeroDaSorte", novo);
  return novo;
}

btnSorte?.addEventListener("click", () => {
  if (!resultadoSorte) return;
  const numero = numeroDaSorte();
  resultadoSorte.hidden = false;
  resultadoSorte.textContent = `🍀 Seu número da sorte é: ${numero}`;
  btnSorte.textContent = "🍀 NÚMERO REVELADO — IR PARA A CARTELA";
  btnSorte.onclick = () => {
    localStorage.setItem("rifaSelecionados", JSON.stringify([numero]));
    location.href = `cartela.html?numero=${encodeURIComponent(numero)}`;
  };
});

carregarConfiguracao();
