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
    onValue,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDr4PL2ljt93p9Yyn1vd1bNWQmFHh3DGI",
    authDomain: "rifa-solidaria-56274.firebaseapp.com",
    databaseURL: "https://rifa-solidaria-56274-default-rtdb.firebaseio.com",
    projectId: "rifa-solidaria-56274",
    storageBucket: "rifa-solidaria-56274.firebasestorage.app",
    messagingSenderId: "279310238107",
    appId: "1:279310238107:web:fd82a20c11e28a4673a13e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

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
    runTransaction
};
