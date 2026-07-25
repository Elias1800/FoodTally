import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ychlylmcitwgntesfwkg.supabase.co";
const SUPABASE_KEY = "sb_publishable_BBjtigJvI6h_ctEWFy1ZhQ_zjvJtNA4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioAtual = null;

async function verificarSessao() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        window.location.href = "/";
        return;
    }

    usuarioAtual = session.user;
    carregarListas();

    setInterval(() => {
        carregarListas(true);
    }, 4000);
}

verificarSessao();

document.getElementById('btn-sair').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
});

function gerarCodigo() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

document.getElementById('btn-criar-lista').addEventListener('click', async () => {
    const nome = document.getElementById('nome-nova-lista').value.trim();
    if (!nome) return alert("Digite um nome para a lista!");

    const codigo = gerarCodigo();
    const { error } = await supabase.from('listas').insert([
        { 
            nome: nome, 
            codigo_compartilhamento: codigo, 
            criador_id: usuarioAtual.id, 
            participantes: [usuarioAtual.id] 
        }
    ]);

    if (error) {
        console.error("Erro ao criar lista:", error);
        alert("Erro ao criar lista.");
    } else {
        document.getElementById('nome-nova-lista').value = "";
        await carregarListas();
    }
});

document.getElementById('btn-entrar-lista').addEventListener('click', async () => {
    const codigo = document.getElementById('codigo-convite').value.trim().toUpperCase();
    if (!codigo) return alert("Digite um código!");

    const { data: listas, error } = await supabase
        .from('listas')
        .select('*')
        .eq('codigo_compartilhamento', codigo);

    if (error || !listas || listas.length === 0) {
        alert("Código inválido ou lista não encontrada!");
        return;
    }

    const lista = listas[0];
    if (lista.participantes.includes(usuarioAtual.id)) {
        alert("Você já faz parte desta lista!");
        return;
    }

    const novosParticipantes = [...lista.participantes, usuarioAtual.id];

    const { error: updateError } = await supabase
        .from('listas')
        .update({ participantes: novosParticipantes })
        .eq('id', lista.id);

    if (!updateError) {
        document.getElementById('codigo-convite').value = "";
        alert("Você entrou na lista com sucesso!");
        await carregarListas();
    }
});

// Função para apagar a lista inteira (e os itens dela)
window.deletarLista = async function(event, listaId) {
    event.stopPropagation(); // Evita que clique no card e abra a lista ao invés de apagar

    if (!confirm("Tem certeza que deseja apagar esta lista inteira?")) return;

    try {
        // 1. Apaga primeiro todos os itens de dentro da lista
        await supabase.from('itens').delete().eq('lista_id', listaId);

        // 2. Apaga a lista em si
        const { error } = await supabase.from('listas').delete().eq('id', listaId);

        if (error) {
            alert("Erro ao apagar a lista.");
            console.error(error);
        } else {
            await carregarListas();
        }
    } catch (err) {
        console.error("Erro ao deletar lista:", err);
    }
};

async function carregarListas(silencioso = false) {
    if (!usuarioAtual) return;
    const container = document.getElementById('container-listas');
    
    if (!silencioso) {
        container.innerHTML = "<p style='text-align:center; color:#888;'>Carregando...</p>";
    }

    const { data: listas, error } = await supabase
        .from('listas')
        .select('*')
        .contains('participantes', [usuarioAtual.id]);

    if (error) return;

    container.innerHTML = "";
    if (!listas || listas.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#888;'>Você ainda não tem listas.</p>";
        return;
    }

    listas.forEach((lista) => {
        const div = document.createElement('div');
        div.className = 'card-lista';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        
        // Clicar no corpo do card abre a lista
        div.innerHTML = `
            <div style="flex-grow: 1; cursor: pointer;" onclick="window.location.href = '/app?id=${lista.id}&nome=${encodeURIComponent(lista.nome)}'">
                <h4 style="margin: 0; color: #fff; font-size: 1.2rem;">${lista.nome}</h4>
                <small style="color: #888;">Código Convite: <b style="color: #4CAF50;">${lista.codigo_compartilhamento}</b></small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="window.deletarLista(event, '${lista.id}')" style="background: transparent; border: none; cursor: pointer; font-size: 1.2rem;" title="Apagar Lista">🗑️</button>
                <span style="font-size: 1.5rem; color: #888; cursor: pointer;" onclick="window.location.href = '/app?id=${lista.id}&nome=${encodeURIComponent(lista.nome)}'">➔</span>
            </div>
        `;
        container.appendChild(div);
    });
}