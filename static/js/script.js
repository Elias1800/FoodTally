import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ychlylmcitwgntesfwkg.supabase.co";
const SUPABASE_KEY = "sb_publishable_BBjtigJvI6h_ctEWFy1ZhQ_zjvJtNA4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let itensDaFeira = [];
let idEditando = null;
let usuarioAtual = null;

const pesosMedios = { "tomate": 0.15, "cebola": 0.15, "batata": 0.20, "cenoura": 0.10, "maca": 0.15, "maçã": 0.15, "banana": 0.10 };

const urlParams = new URLSearchParams(window.location.search);
const listaIdAtual = urlParams.get('id');
const nomeListaAtual = urlParams.get('nome');

if (!listaIdAtual) window.location.href = "/dashboard"; 
document.getElementById('titulo-lista').innerText = nomeListaAtual || "Lista de Compras";

async function verificarSessaoInterna() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        window.location.href = "/";
        return;
    }

    usuarioAtual = session.user;
    carregarListaDoSupabase();
}

verificarSessaoInterna();

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

function carregarListaDoSupabase() {
    async function buscarItens() {
        const { data: itens, error } = await supabase
            .from('itens')
            .select('*')
            .eq('lista_id', listaIdAtual);

        if (error) {
            console.error("Erro ao carregar itens:", error);
            return;
        }

        itensDaFeira = itens || [];
        renderizarLista();
    }

    buscarItens();

    // Escuta em tempo real para atualizar os itens automaticamente
    supabase
        .channel('public:itens')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'itens' }, (payload) => {
            if (payload.new?.lista_id === listaIdAtual || payload.old?.lista_id === listaIdAtual) {
                buscarItens();
            }
        })
        .subscribe();
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
        lista_id: listaIdAtual,
        nome: nome,
        categoria: categoria,
        tipo: tipo,
        qtd: qtd,
        peso_estimado: pesoEstimadoKg,
        valor_unitario: valor,
        subtotal: subtotalCalculado,
        status: status
    };

    try {
        if (idEditando) {
            await supabase.from('itens').update(dadosItem).eq('id', idEditando);
        } else {
            await supabase.from('itens').insert([dadosItem]);
        }
        limparFormulario();
        document.getElementById('formulario').style.display = 'flex';
        document.getElementById('btn-toggle-form').innerText = 'Esconder Formulário';
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
}

window.editarItem = function(id) {
    const item = itensDaFeira.find(i => i.id === id);
    if (!item) return;

    document.getElementById('formulario').style.display = 'flex';
    document.getElementById('btn-toggle-form').innerText = 'Esconder Formulário';

    document.getElementById('nome-item').value = item.nome;
    document.getElementById('categoria-item').value = item.categoria || "🛒 Mercearia";
    document.getElementById('tipo-unidade').value = item.tipo;
    document.getElementById('qtd-item').value = item.qtd !== 1 ? item.qtd : "";
    document.getElementById('valor-item').value = item.status === 'comprado' ? item.valor_unitario : "";

    idEditando = id;
    
    const btn = document.getElementById('btn-salvar');
    btn.innerText = item.status === 'comprado' ? "Salvar Alteração" : "Salvar no Carrinho";
    btn.classList.add("modo-edicao");
    document.getElementById('valor-item').focus();
}

window.deletarItem = async function(id) {
    try {
        await supabase.from('itens').delete().eq('id', id);
    } catch (erro) {
        console.error("Erro ao deletar:", erro);
    }
}

function renderizarLista() {
    const listaUl = document.getElementById('lista-itens');
    listaUl.innerHTML = "";
    let somaTotal = 0;
    const itensAgrupados = {};
    const subtotaisCategoria = {}; 

    itensDaFeira.forEach(item => {
        const categoria = item.categoria || "🛒 Mercearia";
        
        if (!itensAgrupados[categoria]) {
            itensAgrupados[categoria] = [];
            subtotaisCategoria[categoria] = 0;
        }
        itensAgrupados[categoria].push(item);
        
        if (item.status === 'comprado') {
            somaTotal += item.subtotal;
            subtotaisCategoria[categoria] += item.subtotal;
        }
    });

    for (const [categoria, itens] of Object.entries(itensAgrupados)) {
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
                let textoDetalhes = `${item.qtd}x de R$ ${item.valor_unitario.toFixed(2)}`;
                let textoEstimado = "";
                
                if (item.tipo === 'kg') {
                    textoDetalhes = `${item.qtd} kg a R$ ${item.valor_unitario.toFixed(2)}/kg`;
                } else if (item.tipo === 'estimar_un') {
                    let pesoExibicao = item.peso_estimado ? item.peso_estimado : 0;
                    textoDetalhes = `${item.qtd} un (${pesoExibicao.toFixed(2)} kg) a R$ ${item.valor_unitario.toFixed(2)}/kg`;
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