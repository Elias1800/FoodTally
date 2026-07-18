let itensDaFeira = [];
let idEditando = null; 

window.onload = function() {
    carregarItens();
};

// Tornamos as funções globais para garantir que o clique do HTML sempre as encontre
window.carregarItens = async function() {
    try {
        // Tenta carregar do backend. Adicionamos um pequeno truque anti-cache
        const resposta = await fetch('/api/itens?' + new Date().getTime());
        itensDaFeira = await resposta.json();
        renderizarLista();
    } catch (erro) {
        console.error("Erro ao carregar itens:", erro);
    }
}

window.salvarItem = async function() {
    const nomeInput = document.getElementById('nome-item');
    const categoriaInput = document.getElementById('categoria-item');
    const tipoInput = document.getElementById('tipo-unidade');
    const qtdInput = document.getElementById('qtd-item');
    const valorInput = document.getElementById('valor-item');

    const nome = nomeInput.value.trim();
    const categoria = categoriaInput.value; 
    const tipo = tipoInput.value;
    const qtd = parseFloat(qtdInput.value) || 1;
    const valor = parseFloat(valorInput.value) || 0.0;

    if (nome === "") {
        alert("O nome do item é obrigatório!");
        return;
    }

    const status = (valor === 0) ? 'pendente' : 'comprado';
    
    let subtotalCalculado = 0;
    let pesoEstimadoKg = 0;

    if (tipo === 'un' || tipo === 'kg') {
        subtotalCalculado = qtd * valor;
    } else if (tipo === 'estimar_un') {
        let pesoUnidade = 0.15; 
        const nomeLimpo = nome.toLowerCase();
        for (let alimento in pesosMedios) {
            if (nomeLimpo.includes(alimento)) {
                pesoUnidade = pesosMedios[alimento];
                break;
            }
        }
        pesoEstimadoKg = qtd * pesoUnidade; 
        subtotalCalculado = pesoEstimadoKg * valor; 
    }
    
    const dadosItem = {
        id: idEditando ? idEditando : Date.now(),
        nome: nome,
        categoria: categoria,
        tipo: tipo,
        qtd: qtd,
        pesoEstimado: pesoEstimadoKg,
        valorUnitario: valor,
        subtotal: subtotalCalculado,
        status: status
    };

    if (idEditando) {
        await fetch(`/api/itens/${idEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosItem)
        });
    } else {
        await fetch('/api/itens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosItem)
        });
    }

    limparFormulario();
    carregarItens();
}

// Essa função agora serve tanto para "Pegar" (item novo) quanto para "Editar" (item velho)
window.editarItem = function(id) {
    const item = itensDaFeira.find(i => i.id === id);
    if (!item) return;

    document.getElementById('nome-item').value = item.nome;
    document.getElementById('categoria-item').value = item.categoria || "🛒 Sem Categoria";
    document.getElementById('tipo-unidade').value = item.tipo;
    document.getElementById('qtd-item').value = item.qtd !== 1 ? item.qtd : "";
    
    // Se já tinha sido comprado, traz o valor antigo pra você não precisar digitar tudo de novo
    if (item.status === 'comprado') {
        document.getElementById('valor-item').value = item.valorUnitario;
    } else {
        document.getElementById('valor-item').value = ""; // Pendente fica vazio pro preço da prateleira
    }

    idEditando = id;
    
    const btn = document.getElementById('btn-salvar');
    // Muda o texto dependendo da ação
    btn.innerText = item.status === 'comprado' ? "Salvar Alteração" : "Salvar no Carrinho";
    btn.classList.add("modo-edicao");
    
    document.getElementById('valor-item').focus();
}

window.deletarItem = async function(id) {
    await fetch(`/api/itens/${id}`, { method: 'DELETE' });
    carregarItens();
}

function renderizarLista() {
    const listaUl = document.getElementById('lista-itens');
    listaUl.innerHTML = "";
    let somaTotal = 0;

    const itensAgrupados = {};

    itensDaFeira.forEach(item => {
        somaTotal += item.status === 'comprado' ? item.subtotal : 0;
        
        const categoria = item.categoria || "🛒 Sem Categoria";
        if (!itensAgrupados[categoria]) {
            itensAgrupados[categoria] = [];
        }
        itensAgrupados[categoria].push(item);
    });

    for (const [categoria, itens] of Object.entries(itensAgrupados)) {
        
        const tituloLi = document.createElement('li');
        tituloLi.className = 'categoria-titulo';
        tituloLi.innerText = categoria;
        listaUl.appendChild(tituloLi);

        itens.forEach(item => {
            const li = document.createElement('li');
            
            if (item.status === 'pendente') {
                li.className = 'item pendente';
                li.innerHTML = `
                    <div class="item-info">
                        <span class="item-nome">📝 ${item.nome}</span>
                        <span class="item-detalhes">Aguardando no mercado...</span>
                    </div>
                    <div class="item-acoes">
                        <button class="btn-pegar" onclick="window.editarItem(${item.id})">🛒 Pegar</button>
                        <button class="btn-icone btn-deletar" onclick="window.deletarItem(${item.id})">🗑️</button>
                    </div>
                `;
            } else {
                li.className = 'item';
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
                        <button class="btn-icone btn-editar" onclick="window.editarItem(${item.id})">✏️</button>
                        <button class="btn-icone btn-deletar" onclick="window.deletarItem(${item.id})">🗑️</button>
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
    document.getElementById('categoria-item').value = "🛒 Sem Categoria";
    document.getElementById('tipo-unidade').value = "un";
    document.getElementById('qtd-item').value = "";
    document.getElementById('valor-item').value = "";
    
    idEditando = null;
    const btn = document.getElementById('btn-salvar');
    btn.innerText = "Adicionar à Lista";
    btn.classList.remove("modo-edicao");
}