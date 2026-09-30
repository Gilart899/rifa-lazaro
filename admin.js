// ==========================================================
// RIFA SOLIDÁRIA — GILFEST
// PAINEL ADMINISTRATIVO
// ==========================================================

import {
    entrarAdmin,
    sairAdmin,
    observarAutenticacao
} from "./auth.js";

import {
    db,
    ref,
    get,
    update
} from "./firebase.js";


// ==========================================================
// ELEMENTOS DA PÁGINA
// ==========================================================

const loginArea = document.getElementById("login");
const painel = document.getElementById("painel");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const btnEntrar = document.getElementById("btnEntrar");
const btnSair = document.getElementById("btnSair");

const loginErro = document.getElementById("loginErro");

const totalDisponiveis =
    document.getElementById("totalDisponiveis");

const totalReservados =
    document.getElementById("totalReservados");

const totalVendidos =
    document.getElementById("totalVendidos");

const valorArrecadado =
    document.getElementById("valorArrecadado");

const listaNumeros =
    document.getElementById("listaNumeros");

const contadorTabela =
    document.getElementById("contadorTabela");

const buscarAdmin =
    document.getElementById("buscarAdmin");

const btnExportar =
    document.getElementById("btnExportar");

const dataSorteioAdmin =
    document.getElementById("dataSorteioAdmin");

const btnSalvarSorteio =
    document.getElementById("btnSalvarSorteio");

const statusSorteio =
    document.getElementById("statusSorteio");


// ==========================================================
// FORMATAÇÃO
// ==========================================================

function formatarNumero(numero) {

    return String(numero).padStart(3, "0");

}


function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ==========================================================
// MOSTRAR / ESCONDER PAINEL
// ==========================================================

function mostrarLogin() {

    if (loginArea) {

        loginArea.hidden = false;

    }

    if (painel) {

        painel.hidden = true;

    }

}


function mostrarPainel() {

    if (loginArea) {

        loginArea.hidden = true;

    }

    if (painel) {

        painel.hidden = false;

    }

}


// ==========================================================
// LOGIN
// ==========================================================

async function fazerLogin() {

    const email =
        emailInput?.value.trim();

    const senha =
        senhaInput?.value;

    if (loginErro) {

        loginErro.textContent = "";

    }

    if (!email || !senha) {

        if (loginErro) {

            loginErro.textContent =
                "Digite seu e-mail e sua senha.";

        }

        return;

    }


    if (btnEntrar) {

        btnEntrar.disabled = true;

        btnEntrar.textContent =
            "ENTRANDO...";

    }


    try {

        await entrarAdmin(
            email,
            senha
        );

        if (senhaInput) {

            senhaInput.value = "";

        }

    } catch (erro) {

        console.error(erro);

        if (loginErro) {

            loginErro.textContent =
                erro.message ||
                "Não foi possível entrar.";
        }

    } finally {

        if (btnEntrar) {

            btnEntrar.disabled = false;

            btnEntrar.textContent =
                "ENTRAR";

        }

    }

}


// ==========================================================
// LOGOUT
// ==========================================================

async function fazerLogout() {

    try {

        await sairAdmin();

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    }

}


// ==========================================================
// CARREGAR NÚMEROS
// ==========================================================

async function carregarNumeros() {

    try {

        const numerosRef =
            ref(db, "rifa/numeros");

        const snapshot =
            await get(numerosRef);


        if (!snapshot.exists()) {

            console.warn(
                "Nenhum número encontrado no Firebase."
            );

            limparEstatisticas();

            return;

        }


        const dados =
            snapshot.val();

        const numeros =
            Object.values(dados);


        atualizarEstatisticas(
            numeros
        );

        renderizarTabela(
            numeros
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar números:",
            erro
        );

    }

}


// ==========================================================
// ESTATÍSTICAS
// ==========================================================

function atualizarEstatisticas(numeros) {

    let disponiveis = 0;

    let reservados = 0;

    let vendidos = 0;

    let arrecadado = 0;


    numeros.forEach(numero => {

        const status =
            numero.status ||
            "disponivel";


        if (status === "disponivel") {

            disponiveis++;

        }


        if (status === "reservado") {

            reservados++;

        }


        if (status === "vendido") {

            vendidos++;

        }


        if (
            status === "vendido" &&
            numero.pagamento === true
        ) {

            arrecadado += 10;

        }

    });


    if (totalDisponiveis) {

        totalDisponiveis.textContent =
            disponiveis;

    }


    if (totalReservados) {

        totalReservados.textContent =
            reservados;

    }


    if (totalVendidos) {

        totalVendidos.textContent =
            vendidos;

    }


    if (valorArrecadado) {

        valorArrecadado.textContent =
            formatarMoeda(arrecadado);

    }

}


// ==========================================================
// LIMPAR ESTATÍSTICAS
// ==========================================================

function limparEstatisticas() {

    if (totalDisponiveis) {

        totalDisponiveis.textContent =
            "0";

    }

    if (totalReservados) {

        totalReservados.textContent =
            "0";

    }

    if (totalVendidos) {

        totalVendidos.textContent =
            "0";

    }

    if (valorArrecadado) {

        valorArrecadado.textContent =
            "R$ 0,00";

    }

}


// ==========================================================
// TABELA
// ==========================================================

function renderizarTabela(numeros) {
    if (!listaNumeros) return;

    const lista = [...numeros].sort((a,b) => Number(a.numero)-Number(b.numero));
    listaNumeros.innerHTML = "";

    lista.forEach(numero => {
        const tr = document.createElement("tr");
        const status = numero.status || "disponivel";
        const nome = numero.nome || "—";
        const whatsapp = numero.telefone || numero.whatsapp || "—";
        const pagamento = numero.pagamento === true;
        const raspadinha = numero.raspadinhaLiberada === true;
        const comprovante = numero.comprovanteEnviado === true;

        tr.innerHTML = `
            <td><strong>${formatarNumero(numero.numero)}</strong></td>
            <td>${escaparHTML(nome)}</td>
            <td>${escaparHTML(whatsapp)}</td>
            <td><span class="badge ${status}">${textoStatus(status)}</span></td>
            <td><span class="badge ${pagamento ? "sim" : "nao"}">${pagamento ? "Confirmado" : (comprovante ? "Comprovante" : "Pendente")}</span></td>
            <td><span class="badge ${raspadinha ? "sim" : "nao"}">${raspadinha ? "Liberada" : "Não"}</span></td>
            <td><div class="acoes-numero">
                <button type="button" data-numero="${numero.numero}" class="btn-ver-numero">Ver</button>
            </div></td>`;
        listaNumeros.appendChild(tr);
    });

    if (contadorTabela) contadorTabela.textContent = `${lista.length} registros`;
    configurarBotoesTabela();
}

// ==========================================================
// TEXTO DO STATUS
// ==========================================================

function textoStatus(status) {

    switch (status) {

        case "reservado":

            return "Reservado";

        case "vendido":

            return "Vendido";

        default:

            return "Disponível";

    }

}


// ==========================================================
// SEGURANÇA CONTRA HTML INJETADO
// ==========================================================

function escaparHTML(valor) {

    return String(valor)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ==========================================================
// BOTÕES DA TABELA
// ==========================================================

function configurarBotoesTabela() {
    document.querySelectorAll(".btn-ver-numero").forEach(botao => {
        botao.addEventListener("click", () => abrirDetalhesNumero(botao.dataset.numero));
    });
}

async function abrirDetalhesNumero(numero) {
    try {
        const snap = await get(ref(db, `rifa/numeros/${numero}`));
        if (!snap.exists()) return alert("Número não encontrado.");
        const dados = snap.val();
        const reservaId = dados.reservaId || "";
        let reserva = null;
        if (reservaId) {
            const rs = await get(ref(db, `rifa/reservas/${reservaId}`));
            reserva = rs.exists() ? rs.val() : null;
        }
        mostrarModalParticipacao(numero, dados, reserva);
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar os dados desta participação.");
    }
}

function fecharModalParticipacao() {
    document.getElementById("modalParticipacao")?.remove();
}

function mostrarModalParticipacao(numero, dados, reserva) {
    fecharModalParticipacao();
    const modal = document.createElement("div");
    modal.id = "modalParticipacao";
    modal.className = "admin-modal-backdrop";
    const comprovante = reserva?.comprovante?.dataUrl || "";
    const numeros = reserva?.numeros || [numero];
    const valor = Number(reserva?.valorTotal || numeros.length * 10);
    const status = reserva?.status || dados.status || "reservado";
    const aprovado = dados.pagamento === true || reserva?.pagamento === true;
    const liberada = dados.raspadinhaLiberada === true || reserva?.raspadinhaLiberada === true;
    modal.innerHTML = `
      <div class="admin-modal glass">
        <button class="modal-fechar" type="button">✕</button>
        <h2>🧾 Participação ${formatarNumero(numero)}</h2>
        <div class="modal-dados">
          <p><b>Cliente:</b> ${escaparHTML(reserva?.nome || dados.nome || "—")}</p>
          <p><b>WhatsApp:</b> ${escaparHTML(reserva?.telefone || dados.telefone || dados.whatsapp || "—")}</p>
          <p><b>Números:</b> ${escaparHTML(numeros.join(", "))}</p>
          <p><b>Valor:</b> ${formatarMoeda(valor)}</p>
          <p><b>Status:</b> ${escaparHTML(status)}</p>
          <p><b>Pagamento:</b> ${aprovado ? "✅ APROVADO" : "⏳ AGUARDANDO"}</p>
          <p><b>Raspadinha:</b> ${liberada ? "🍀 LIBERADA" : "🔒 BLOQUEADA"}</p>
          ${reserva?.criadoEm ? `<p><b>Reserva:</b> ${new Date(Number(reserva.criadoEm)).toLocaleString("pt-BR")}</p>` : ""}
        </div>
        <div class="modal-comprovante">
          <h3>📎 Comprovante</h3>
          ${comprovante ? `<img src="${comprovante}" alt="Comprovante enviado pelo cliente">` : `<div class="sem-comprovante">Nenhum comprovante enviado ainda.</div>`}
        </div>
        <div class="modal-acoes">
          ${!aprovado && reserva ? `<button id="btnAprovarParticipacao" class="btn btn-success" type="button">✅ APROVAR PAGAMENTO E LIBERAR RASPADINHA</button>` : ""}
          ${!aprovado && reserva ? `<button id="btnCancelarParticipacao" class="btn btn-danger" type="button">❌ CANCELAR PARTICIPAÇÃO</button>` : ""}
          ${aprovado ? `<div class="aprovado-aviso">✅ Pagamento aprovado${reserva?.raspadinhaPremio ? ` • Raspadinha preparada: ${escaparHTML(reserva.raspadinhaPremio)}` : ""}</div>` : ""}
        </div>
        <p id="modalMensagem" class="modal-mensagem"></p>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".modal-fechar").onclick = fecharModalParticipacao;
    modal.addEventListener("click", e => { if(e.target === modal) fecharModalParticipacao(); });
    modal.querySelector("#btnAprovarParticipacao")?.addEventListener("click", () => aprovarParticipacao(reserva, numero));
    modal.querySelector("#btnCancelarParticipacao")?.addEventListener("click", () => cancelarParticipacao(reserva, numero));
}

async function aprovarParticipacao(reserva, numeroReferencia) {
    if (!reserva?.reservaId) return;
    const mensagem = document.getElementById("modalMensagem");
    const btn = document.getElementById("btnAprovarParticipacao");
    if (btn) { btn.disabled = true; btn.textContent = "APROVANDO..."; }
    try {
        const todas = await get(ref(db, "rifa/reservas"));
        const reservas = todas.exists() ? Object.values(todas.val()) : [];
        const usados = reservas.filter(r => r.status === "vendido" && r.raspadinhaPremio && r.raspadinhaPremio !== "Não foi dessa vez").map(r => r.raspadinhaPremio);
        const disponiveis = ["Liquidificador", "Ferro elétrico"].filter(p => !usados.includes(p));
        let premio = "Não foi dessa vez";
        if (disponiveis.length) premio = disponiveis[Math.floor(Math.random()*disponiveis.length)];

        const updates = {};
        const agora = Date.now();
        for (const n of (reserva.numeros || [numeroReferencia])) {
            updates[`rifa/numeros/${n}/status`] = "vendido";
            updates[`rifa/numeros/${n}/pagamento`] = true;
            updates[`rifa/numeros/${n}/pagamentoStatus`] = "aprovado";
            updates[`rifa/numeros/${n}/raspadinhaLiberada`] = true;
            updates[`rifa/numeros/${n}/raspadinhaUsada`] = false;
            updates[`rifa/numeros/${n}/dataVenda`] = agora;
            updates[`rifa/numeros/${n}/comprovanteEnviado`] = reserva.comprovanteEnviado === true;
            updates[`rifa/numeros/${n}/reservaId`] = reserva.reservaId;
        }
        updates[`rifa/reservas/${reserva.reservaId}/status`] = "vendido";
        updates[`rifa/reservas/${reserva.reservaId}/pagamento`] = true;
        updates[`rifa/reservas/${reserva.reservaId}/pagamentoStatus`] = "aprovado";
        updates[`rifa/reservas/${reserva.reservaId}/raspadinhaLiberada`] = true;
        updates[`rifa/reservas/${reserva.reservaId}/raspadinhaUsada`] = false;
        updates[`rifa/reservas/${reserva.reservaId}/raspadinhaPremio`] = premio;
        updates[`rifa/reservas/${reserva.reservaId}/pagamentoAprovadoEm`] = agora;
        updates[`rifa/reservas/${reserva.reservaId}/aprovadoPor`] = "administrador";
        await update(ref(db), updates);
        if (mensagem) mensagem.textContent = `✅ Pagamento aprovado. Raspadinha liberada. Resultado preparado: ${premio}.`;
        await carregarNumeros();
        setTimeout(fecharModalParticipacao, 1000);
    } catch(e) {
        console.error(e);
        if (mensagem) mensagem.textContent = "❌ Não foi possível aprovar. Verifique as regras do Firebase.";
        if (btn) { btn.disabled = false; btn.textContent = "✅ APROVAR PAGAMENTO E LIBERAR RASPADINHA"; }
    }
}

async function cancelarParticipacao(reserva, numeroReferencia) {
    if (!reserva?.reservaId) return;
    const motivo = prompt("Informe o motivo do cancelamento:", "Pagamento não confirmado");
    if (motivo === null) return;
    try {
        const updates = {};
        const agora = Date.now();
        for (const n of (reserva.numeros || [numeroReferencia])) {
            updates[`rifa/numeros/${n}`] = { numero:n, status:"disponivel", nome:"", telefone:"", pagamento:false, pagamentoStatus:"cancelado", participanteId:"", reservaId:"", criadoEm:"", expiraEm:"", comprovanteEnviado:false, raspadinhaLiberada:false, raspadinhaUsada:false, dataVenda:"" };
        }
        updates[`rifa/reservas/${reserva.reservaId}/status`] = "cancelado";
        updates[`rifa/reservas/${reserva.reservaId}/pagamentoStatus`] = "cancelado";
        updates[`rifa/reservas/${reserva.reservaId}/pagamento`] = false;
        updates[`rifa/reservas/${reserva.reservaId}/raspadinhaLiberada`] = false;
        updates[`rifa/reservas/${reserva.reservaId}/canceladoEm`] = agora;
        updates[`rifa/reservas/${reserva.reservaId}/canceladoPor`] = "administrador";
        updates[`rifa/reservas/${reserva.reservaId}/motivoCancelamento`] = motivo.trim() || "Sem motivo informado";
        await update(ref(db), updates);
        alert("Participação cancelada e números liberados novamente.");
        fecharModalParticipacao();
        await carregarNumeros();
    } catch(e) { console.error(e); alert("Não foi possível cancelar. Verifique as regras do Firebase."); }
}

// ==========================================================
// BUSCA ADMINISTRATIVA
// ==========================================================

async function pesquisarNumero() {

    if (!buscarAdmin) {

        return;

    }


    const valor =
        buscarAdmin.value.trim();


    if (valor === "") {

        await carregarNumeros();

        return;

    }


    const numero =
        formatarNumero(
            Number(valor)
        );


    try {

        const numeroRef =
            ref(
                db,
                `rifa/numeros/${numero}`
            );

        const snapshot =
            await get(numeroRef);


        if (!snapshot.exists()) {

            listaNumeros.innerHTML = `

                <tr>

                    <td colspan="7">

                        Número
                        <strong>${numero}</strong>
                        não encontrado.

                    </td>

                </tr>

            `;

            return;

        }


        renderizarTabela([
            snapshot.val()
        ]);


    } catch (erro) {

        console.error(
            "Erro na pesquisa:",
            erro
        );

    }

}


// ==========================================================
// EXPORTAR BACKUP
// ==========================================================

async function exportarBackup() {

    try {

        const rifaRef =
            ref(db, "rifa");

        const snapshot =
            await get(rifaRef);


        if (!snapshot.exists()) {

            alert(
                "Não existem dados para exportar."
            );

            return;

        }


        const dados =
            snapshot.val();


        const arquivo =
            JSON.stringify(
                dados,
                null,
                2
            );


        const blob =
            new Blob(
                [arquivo],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            `backup-rifa-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);


    } catch (erro) {

        console.error(
            "Erro ao exportar backup:",
            erro
        );

        alert(
            "Não foi possível gerar o backup."
        );

    }

}


// ==========================================================
// CONFIGURAÇÃO DA DATA DO SORTEIO
// ==========================================================

function valorParaInputDateTime(valor) {
    if (!valor) return "2026-12-30T20:00";
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "2026-12-30T20:00";
    const partes = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(data).reduce((o, p) => (o[p.type] = p.value, o), {});
    return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}

async function carregarDataSorteio() {
    try {
        const snap = await get(ref(db, "rifa/configuracao"));
        const valor = snap.exists() ? snap.val().sorteio : null;
        if (dataSorteioAdmin) dataSorteioAdmin.value = valorParaInputDateTime(valor);
    } catch (erro) {
        console.error("Erro ao carregar data do sorteio:", erro);
        if (statusSorteio) statusSorteio.textContent = "Não foi possível carregar a data atual.";
    }
}

async function salvarDataSorteio() {
    if (!dataSorteioAdmin?.value) {
        if (statusSorteio) statusSorteio.textContent = "Escolha uma data e um horário.";
        return;
    }

    const valor = new Date(dataSorteioAdmin.value).toISOString();
    if (btnSalvarSorteio) {
        btnSalvarSorteio.disabled = true;
        btnSalvarSorteio.textContent = "SALVANDO...";
    }

    try {
        await update(ref(db, "rifa/configuracao"), {
            sorteio: valor,
            sorteioAtualizadoEm: Date.now()
        });
        if (statusSorteio) {
            statusSorteio.textContent = "✅ Data do sorteio atualizada com sucesso.";
        }
    } catch (erro) {
        console.error("Erro ao salvar data do sorteio:", erro);
        if (statusSorteio) statusSorteio.textContent = "❌ Não foi possível salvar. Verifique sua permissão de administrador.";
    } finally {
        if (btnSalvarSorteio) {
            btnSalvarSorteio.disabled = false;
            btnSalvarSorteio.textContent = "💾 SALVAR DATA DO SORTEIO";
        }
    }
}

// ==========================================================
// EVENTOS
// ==========================================================

if (btnEntrar) {

    btnEntrar.addEventListener(
        "click",
        fazerLogin
    );

}


if (senhaInput) {

    senhaInput.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Enter"
            ) {

                fazerLogin();

            }

        }
    );

}


if (btnSair) {

    btnSair.addEventListener(
        "click",
        fazerLogout
    );

}


if (buscarAdmin) {

    buscarAdmin.addEventListener(
        "input",
        pesquisarNumero
    );

}


if (btnExportar) {

    btnExportar.addEventListener(
        "click",
        exportarBackup
    );

}

if (btnSalvarSorteio) {

    btnSalvarSorteio.addEventListener(
        "click",
        salvarDataSorteio
    );

}


// ==========================================================
// OBSERVAR AUTENTICAÇÃO
// ==========================================================

observarAutenticacao(
    async usuario => {

        if (usuario) {

            mostrarPainel();

            await carregarNumeros();
            await carregarDataSorteio();

        } else {

            mostrarLogin();

        }

    }
);
