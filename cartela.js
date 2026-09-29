import { db, ref, onValue } from "./firebase.js";
import { CONFIG } from "./config.js";

const grid = document.getElementById("grid");
const titulo = document.getElementById("titulo");
const sel = document.getElementById("sel");
const total = document.getElementById("total");

let cartela = 0;
let selecionados = [];
let status = {};

const TOTAL_CARTELAS = 10;
const POR_CARTELA = 100;
const MAX = CONFIG.reserva.maxNumerosPorParticipacao;

function formatar(n) {
    return String(n).padStart(3, "0");
}

function numeroDisponivel(item) {
    if (!item) return true;

    if (item.status === "disponivel") return true;

    if (
        item.status === "reservado" &&
        Number(item.expiraEm || 0) <= Date.now()
    ) {
        return true;
    }

    return false;
}

function render() {
    titulo.textContent =
        `CARTELA ${String(cartela + 1).padStart(2, "0")}`;

    grid.innerHTML = "";

    const inicio = cartela * POR_CARTELA;

    for (let i = 0; i < POR_CARTELA; i++) {
        const n = inicio + i;
        const key = formatar(n);
        const item = status[key];

        const b = document.createElement("button");
        b.type = "button";
        b.textContent = key;

        const disponivel = numeroDisponivel(item);

        b.style.cssText =
            "padding:12px 4px;border-radius:12px;border:1px solid #58b833;" +
            "background:#07340c;color:#fff;font-weight:800";

        if (!disponivel) {
            b.disabled = true;
            b.style.background =
                item?.status === "vendido" ? "#591010" : "#5a4108";
        }

        if (selecionados.includes(key)) {
            b.style.background = "#7cff00";
            b.style.color = "#061000";
        }

        b.onclick = () => {
            if (!disponivel) return;

            if (selecionados.includes(key)) {
                selecionados =
                    selecionados.filter(x => x !== key);
            } else {
                if (selecionados.length >= MAX) {
                    alert(`Você pode selecionar no máximo ${MAX} números.`);
                    return;
                }

                selecionados.push(key);
            }

            update();
        };

        grid.appendChild(b);
    }
}

function update() {
    const ordenados =
        [...selecionados].sort((a, b) => Number(a) - Number(b));

    sel.textContent =
        ordenados.length ? ordenados.join(", ") : "Nenhum";

    total.textContent =
        `R$ ${(ordenados.length * CONFIG.valor)
            .toFixed(2)
            .replace(".", ",")}`;

    render();
}

function ir(n) {
    n = Number(n);

    if (!Number.isInteger(n) || n < 0 || n > 999) {
        alert("Informe um número entre 000 e 999.");
        return;
    }

    cartela = Math.floor(n / POR_CARTELA);
    render();

    document
        .getElementById("grid")
        .scrollIntoView({ behavior: "smooth" });
}

document.getElementById("prev").onclick = () => {
    cartela = (cartela + TOTAL_CARTELAS - 1) % TOTAL_CARTELAS;
    render();
};

document.getElementById("next").onclick = () => {
    cartela = (cartela + 1) % TOTAL_CARTELAS;
    render();
};

document.getElementById("ir").onclick = () => {
    ir(document.getElementById("numero").value);
};

document.getElementById("sugerir").onclick = () => {
    const disponiveis = [];

    for (let n = 0; n < 1000; n++) {
        const key = formatar(n);

        if (
            numeroDisponivel(status[key]) &&
            !selecionados.includes(key)
        ) {
            disponiveis.push(n);
        }
    }

    if (!disponiveis.length) {
        alert("Não há números disponíveis no momento.");
        return;
    }

    const n =
        disponiveis[Math.floor(Math.random() * disponiveis.length)];

    ir(n);

    const key = formatar(n);

    if (selecionados.length < MAX) {
        selecionados.push(key);
        update();
    }
};

document.getElementById("continuar").onclick = () => {
    if (!selecionados.length) {
        alert("Escolha pelo menos um número.");
        return;
    }

    const numeros =
        [...new Set(selecionados)].sort(
            (a, b) => Number(a) - Number(b)
        );

    sessionStorage.setItem(
        "rifaSelecionados",
        JSON.stringify(numeros)
    );

    location.href = "reserva.html";
};

onValue(
    ref(db, "rifa/numeros"),
    snapshot => {
        status = snapshot.val() || {};
        render();
    },
    error => {
        console.error(error);
        alert("Não foi possível carregar os números agora.");
    }
);

const params = new URLSearchParams(location.search);

if (params.has("numero")) {
    ir(params.get("numero"));
} else {
    render();
}

let startX = 0;

grid.addEventListener(
    "touchstart",
    e => {
        startX = e.touches[0].clientX;
    },
    { passive: true }
);

grid.addEventListener(
    "touchend",
    e => {
        const endX = e.changedTouches[0].clientX;

        if (Math.abs(endX - startX) > 60) {
            cartela =
                endX < startX
                    ? Math.min(TOTAL_CARTELAS - 1, cartela + 1)
                    : Math.max(0, cartela - 1);

            render();
        }
    }
);
