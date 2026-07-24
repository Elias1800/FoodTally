import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, arrayUnion, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnZq2VSUvTs5giEYy1UWccTYGxPpgrHaM",
  authDomain: "foodtally-c2aa6.firebaseapp.com",
  projectId: "foodtally-c2aa6",
  storageBucket: "foodtally-c2aa6.firebasestorage.app",
  messagingSenderId: "101610505032",
  appId: "1:101610505032:web:736f310558da232ec5697d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioAtual = user;
        carregarListas();
    } else {
        window.location.href = "/";
    }
});

document.getElementById('btn-sair').addEventListener('click', () => signOut(auth));

function gerarCodigo() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

document.getElementById('btn-criar-lista').addEventListener('click', async () => {
    const nome = document.getElementById('nome-nova-lista').value.trim();
    if (!nome) return alert("Digite um nome para a lista!");

    const codigo = gerarCodigo();
    await addDoc(collection(db, "listas"), {
        nome: nome,
        codigoCompartilhamento: codigo,
        criadorId: usuarioAtual.uid,
        participantes: [usuarioAtual.uid]
    });
    document.getElementById('nome-nova-lista').value = "";
});

document.getElementById('btn-entrar-lista').addEventListener('click', async () => {
    const codigo = document.getElementById('codigo-convite').value.trim().toUpperCase();
    if (!codigo) return alert("Digite um código!");

    const q = query(collection(db, "listas"), where("codigoCompartilhamento", "==", codigo));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        alert("Código inválido ou lista não encontrada!");
        return;
    }

    const docLista = querySnapshot.docs[0];
    await updateDoc(doc(db, "listas", docLista.id), {
        participantes: arrayUnion(usuarioAtual.uid)
    });
    
    document.getElementById('codigo-convite').value = "";
    alert("Você entrou na lista com sucesso!");
});

function carregarListas() {
    const q = query(collection(db, "listas"), where("participantes", "array-contains", usuarioAtual.uid));
    
    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('container-listas');
        container.innerHTML = "";
        
        if (snapshot.empty) {
            container.innerHTML = "<p style='text-align:center; color:#888;'>Você ainda não tem listas.</p>";
            return;
        }

        snapshot.forEach((documento) => {
            const lista = documento.data();
            const div = document.createElement('div');
            div.className = 'card-lista';
            div.onclick = () => window.location.href = `/app?id=${documento.id}&nome=${encodeURIComponent(lista.nome)}`;
            
            div.innerHTML = `
                <div>
                    <h4 style="margin: 0; color: #fff; font-size: 1.2rem;">${lista.nome}</h4>
                    <small style="color: #888;">Código Convite: <b style="color: #4CAF50;">${lista.codigoCompartilhamento}</b></small>
                </div>
                <span style="font-size: 1.5rem;">➔</span>
            `;
            container.appendChild(div);
        });
    });
}