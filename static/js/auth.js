import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/dashboard";
    }
});

document.getElementById("btn-login-google").addEventListener("click", () => {
    signInWithPopup(auth, provider).catch((error) => {
        console.error("Erro ao logar:", error);
        alert("Falha no login. Verifique se você acessou via http://localhost:5000");
    });
});