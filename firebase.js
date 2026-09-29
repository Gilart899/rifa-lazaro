// ==========================================================
// RIFA SOLIDÁRIA — GILFEST
// CONEXÃO PRINCIPAL COM FIREBASE
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update,
    push,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDr4PL2ljt93p9Yyn1vd1bNWQmFHh3DGxI",

    authDomain:
        "rifa-solidaria-56274.firebaseapp.com",

    databaseURL:
        "https://rifa-solidaria-56274-default-rtdb.firebaseio.com",

    projectId:
        "rifa-solidaria-56274",

    storageBucket:
        "rifa-solidaria-56274.firebasestorage.app",

    messagingSenderId:
        "279310238107",

    appId:
        "1:279310238107:web:fd82a20c11e28a4673a13e"

};


// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

const app = initializeApp(firebaseConfig);


// ==========================================================
// FIREBASE AUTHENTICATION
// ==========================================================

const auth = getAuth(app);


// ==========================================================
// REALTIME DATABASE
// ==========================================================

const db = getDatabase(app);


// ==========================================================
// EXPORTAÇÕES
// ==========================================================

export {

    app,

    auth,

    db,

    ref,

    get,

    set,

    update,

    push,

    remove,

    onValue,

    signInAnonymously

};
