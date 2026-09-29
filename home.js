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

function numeroAleatorio() {
  return String(Math.floor(Math.random() * 1000)).padStart(3, "0");
}

btnSorte?.addEventListener("click", () => {
  if (!resultadoSorte) return;
  const numero = numeroAleatorio();
  resultadoSorte.hidden = false;
  resultadoSorte.textContent = `🍀 Seu número da sorte é: ${numero}`;
  btnSorte.disabled = true;
  btnSorte.textContent = "🍀 NÚMERO REVELADO";
});

carregarConfiguracao();
