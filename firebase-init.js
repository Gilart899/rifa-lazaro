// ============================================================
// 🔥 INICIALIZADOR DO BANCO — RIFA SOLIDÁRIA
// ============================================================

import {
    db,
    ref,
    get,
    set
} from "./firebase.js";


// ============================================================
// ⚙️ CRIAR ESTRUTURA DA RIFA
// ============================================================

export async function inicializarBanco() {

    console.log("🔥 Verificando banco da rifa...");

    const rifaRef = ref(db, "rifa");

    const snapshot = await get(rifaRef);

    // --------------------------------------------------------
    // Se já existir, não apaga nada.
    // --------------------------------------------------------

    if (snapshot.exists()) {

        console.log(
            "✅ Banco da rifa já existe."
        );

        return;

    }


    // --------------------------------------------------------
    // Estrutura principal
    // --------------------------------------------------------

    const numeros = {};


    // --------------------------------------------------------
    // Criar os 1.000 números
    // --------------------------------------------------------

    for (
        let numero = 0;
        numero <= 999;
        numero++
    ) {

        const numeroFormatado =
            String(numero).padStart(3, "0");


        numeros[numeroFormatado] = {

            numero:
                numeroFormatado,

            status:
                "disponivel",

            nome:
                "",

            telefone:
                "",

            pagamento:
                false,

            dataReserva:
                "",

            dataVenda:
                "",

            raspadinhaLiberada:
                false,

            raspadinhaUsada:
                false,

            premioRaspadinha:
                ""

        };

    }


    // --------------------------------------------------------
    // Criar estrutura completa
    // --------------------------------------------------------

    const estrutura = {

        configuracao: {

            nome:
                "RIFA ENTRE AMIGOS",

            beneficiada:
                "Dona Bené",

            premio:
                "Geladeira Midea Frost Free",

            valorNumero:
                10,

            quantidadeNumeros:
                1000,

            quantidadeCartelas:
                10,

            numerosPorCartela:
                100,

            dataSorteio:
                "2026-12-30T19:00:00-03:00"

        },


        numeros: numeros,


        participantes: {},


        compras: {},


        raspadinhas: {

            premios: {

                premio1: {

                    nome:
                        "Liquidificador",

                    quantidade:
                        1

                },

                premio2: {

                    nome:
                        "Ferro elétrico",

                    quantidade:
                        1

                }

            }

        }

    };


    // --------------------------------------------------------
    // GRAVAR NO FIREBASE
    // --------------------------------------------------------

    await set(
        rifaRef,
        estrutura
    );


    console.log(
        "🎉 Banco criado com sucesso!"
    );

}


// ============================================================
// ⚠️ NÃO EXECUTAR AUTOMATICAMENTE
// ============================================================
//
// A função será chamada pelo arquivo de administração
// quando chegar a hora.
//
// Isso evita que qualquer visitante da rifa tente
// recriar o banco.
// ============================================================
