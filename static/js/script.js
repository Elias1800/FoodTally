import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

let itensDaFeira = [];
let idEditando = null;
let usuarioAtual = null;

const pesosMedios = { "tomate": 0.15, "cebola": 0.15, "batata": 0.20, "cenoura": 0.10, "maca": 0.15, "maçã": 0.15, "banana": 0.10 };

const urlParams = new URLSearchParams(window.location.search);
const listaIdAtual = urlParams.get('id');
const nomeListaAtual = urlParams.get('nome');

if (!listaIdAtual) window.location.href = "/dashboard"; 
document.getElementById('titulo-lista').innerText = nomeListaAtual || "Lista de Compras";

onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioAtual = user;
        carregarListaEmTempoReal();
    } else {
        window.location.href = "/";
    }
});

// ==========================================
// FUNÇÃO PARA MINIMIZAR/MAXIMIZAR O FORMULÁRIO
// ==========================================
window.toggleFormulario = function() {
    const form = document.getElementById('formulario');
    const btn = document.getElementById('btn-toggle-form');
    
    if (form.style.display === 'none') {
        form.style.display = 'flex';
        btn.innerText = 'Esconder Formulário';
    } else {
        form.style.display = 'none';
        btn.innerText = 'Mostrar Formulário';
    }
}

function carregarListaEmTempoReal() {
    const itensRef = collection(db, "itens");
    const q = query(itensRef, where("listaId", "==", listaIdAtual));
    
    onSnapshot(q, (snapshot) => {
        itensDaFeira = [];
        snapshot.forEach((documento) => {
            itensDaFeira.push({ id: documento.id, ...documento.data() });
        });
        renderizarLista();
    });
}

window.salvarItem = async function() {
    if (!usuarioAtual) return; 

    const nome = document.getElementById('nome-item').value.trim();
    const categoria = document.getElementById('categoria-item').value; 
    const tipo = document.getElementById('tipo-unidade').value;
    const qtd = parseFloat(document.getElementById('qtd-item').value) || 1;
    const valor = parseFloat(document.getElementById('valor-item').value) || 0.0;

    if (nome === "") { alert("O nome é obrigatório!"); return; }

    const status = (valor === 0) ? 'pendente' : 'comprado';
    let subtotalCalculado = 0;
    let pesoEstimadoKg = 0;

    if (tipo === 'un' || tipo === 'kg') {
        subtotalCalculado = qtd * valor;
    } else if (tipo === 'estimar_un') {
        let pesoUnidade = 0.15; 
        const nomeLimpo = nome.toLowerCase();
        for (let alimento in pesosMedios) {
            if (nomeLimpo.includes(alimento)) { pesoUnidade = pesosMedios[alimento]; break; }
        }
        pesoEstimadoKg = qtd * pesoUnidade; 
        subtotalCalculado = pesoEstimadoKg * valor; 
    }
    
    const dadosItem = {
        nome: nome,
        categoria: categoria,
        tipo: tipo,
        qtd: qtd,
        pesoEstimado: pesoEstimadoKg,
        valorUnitario: valor,
        subtotal: subtotalCalculado,
        status: status,
        listaId: listaIdAtual
    };

    try {
        if (idEditando) {
            await updateDoc(doc(db, "itens", idEditando), dadosItem);
        } else {
            await addDoc(collection(db, "itens"), dadosItem);
        }
        limparFormulario();
        
        // Se o form estiver fechado ao salvar (ex: estava editando algo rápido), abre de novo
        document.getElementById('formulario').style.display = 'flex';
        document.getElementById('btn-toggle-form').innerText = 'Esconder Formulário';
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
}

window.editarItem = function(id) {
    const item = itensDaFeira.find(i => i.id === id);
    if (!item) return;

    // Abre o formulário automaticamente se estiver escondido para poder editar
    document.getElementById('formulario').style.display = 'flex';
    document.getElementById('btn-toggle-form').innerText = 'Esconder Formulário';

    document.getElementById('nome-item').value = item.nome;
    document.getElementById('categoria-item').value = item.categoria || "🛒 Mercearia";
    document.getElementById('tipo-unidade').value = item.tipo;
    document.getElementById('qtd-item').value = item.qtd !== 1 ? item.qtd : "";
    document.getElementById('valor-item').value = item.status === 'comprado' ? item.valorUnitario : "";

    idEditando = id;
    
    const btn = document.getElementById('btn-salvar');
    btn.innerText = item.status === 'comprado' ? "Salvar Alteração" : "Salvar no Carrinho";
    btn.classList.add("modo-edicao");
    document.getElementById('valor-item').focus();
}

window.deletarItem = async function(id) {
    try {
        await deleteDoc(doc(db, "itens", id));
    } catch (erro) {
        console.error("Erro ao deletar:", erro);
    }
}

function renderizarLista() {
    const listaUl = document.getElementById('lista-itens');
    listaUl.innerHTML = "";
    let somaTotal = 0;
    const itensAgrupados = {};
    const subtotaisCategoria = {}; // NOVO: Armazena o valor total gasto por categoria

    itensDaFeira.forEach(item => {
        const categoria = item.categoria || "🛒 Mercearia";
        
        if (!itensAgrupados[categoria]) {
            itensAgrupados[categoria] = [];
            subtotaisCategoria[categoria] = 0;
        }
        itensAgrupados[categoria].push(item);
        
        // Se o item já foi comprado, soma no total geral e no subtotal da categoria
        if (item.status === 'comprado') {
            somaTotal += item.subtotal;
            subtotaisCategoria[categoria] += item.subtotal;
        }
    });

    for (const [categoria, itens] of Object.entries(itensAgrupados)) {
        // Título da categoria agora mostra o valor gasto ao lado
        const tituloLi = document.createElement('li');
        tituloLi.className = 'categoria-titulo';
        const valorCategoriaFomatado = subtotaisCategoria[categoria].toFixed(2);
        
        tituloLi.innerHTML = `
            <span>${categoria}</span>
            <span class="categoria-valor">R$ ${valorCategoriaFomatado}</span>
        `;
        listaUl.appendChild(tituloLi);

        itens.forEach(item => {
            const li = document.createElement('li');
            li.className = item.status === 'pendente' ? 'item pendente' : 'item';
            
            if (item.status === 'pendente') {
                let unidade = item.tipo === 'kg' ? 'kg' : 'un';
                li.innerHTML = `
                    <div class="item-info">
                        <span class="item-nome">📝 ${item.nome}</span>
                        <span class="item-detalhes">${item.qtd} ${unidade} • Aguardando...</span>
                    </div>
                    <div class="item-acoes">
                        <button class="btn-pegar" onclick="window.editarItem('${item.id}')">🛒 Pegar</button>
                        <button class="btn-icone btn-deletar" onclick="window.deletarItem('${item.id}')">🗑️</button>
                    </div>
                `;
            } else {
                let textoDetalhes = `${item.qtd}x de R$ ${item.valorUnitario.toFixed(2)}`;
                let textoEstimado = "";
                
                if (item.tipo === 'kg') {
                    textoDetalhes = `${item.qtd} kg a R$ ${item.valorUnitario.toFixed(2)}/kg`;
                } else if (item.tipo === 'estimar_un') {
                    let pesoExibicao = item.pesoEstimado ? item.pesoEstimado : 0;
                    textoDetalhes = `${item.qtd} un (${pesoExibicao.toFixed(2)} kg) a R$ ${item.valorUnitario.toFixed(2)}/kg`;
                    textoEstimado = `<br><small style="color: #eba417; font-size: 0.8rem;">(~ estimado)</small>`;
                }

                li.innerHTML = `
                    <div class="item-info">
                        <span class="item-nome">✅ ${item.nome}</span>
                        <span class="item-detalhes">${textoDetalhes}</span>
                    </div>
                    <div class="item-acoes" style="text-align: right;">
                        <span class="item-preco-total" style="margin-right: 5px;">R$ ${item.subtotal.toFixed(2)} ${textoEstimado}</span>
                        <button class="btn-icone btn-editar" onclick="window.editarItem('${item.id}')">✏️</button>
                        <button class="btn-icone btn-deletar" onclick="window.deletarItem('${item.id}')">🗑️</button>
                    </div>
                `;
            }
            listaUl.appendChild(li);
        });
    }
    document.getElementById('total-geral').innerText = `R$ ${somaTotal.toFixed(2)}`;
}

function limparFormulario() {
    document.getElementById('nome-item').value = "";
    // Reseta para Mercearia como padrão
    document.getElementById('categoria-item').value = "🛒 Mercearia";
    document.getElementById('tipo-unidade').value = "un";
    document.getElementById('qtd-item').value = "";
    document.getElementById('valor-item').value = "";
    idEditando = null;
    const btn = document.getElementById('btn-salvar');
    btn.innerText = "Adicionar à Lista";
    btn.classList.remove("modo-edicao");
}

window.salvarItem = salvarItem;
window.editarItem = editarItem;
window.deletarItem = deletarItem;