import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCnZq2VSUvTs5giEYy1UWccTYGxPpgrHaM",
    authDomain: "foodtally-c2aa6.firebaseapp.com",
    projectId: "foodtally-c2aa6",
    storageBucket: "foodtally-c2aa6.firebasestorage.app",
    messagingSenderId: "101610505032",
    appId: "1:101610505032:web:736f310558da232ec5697d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Mantém o monitoramento de usuário logado
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/dashboard";
    }
});

// Evento de clique do botão de login atualizado para Redirecionamento
document.getElementById("btn-login-google").addEventListener("click", () => {
    signInWithRedirect(auth, provider).catch((error) => {
        console.error("Erro ao logar:", error);
        alert("Erro no login: " + error.message);
    });
});