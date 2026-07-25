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

    // Polling colaborativo a cada 4 segundos
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
        await carregarListas(); // Garante a execução síncrona/imediata
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
        div.onclick = () => window.location.href = `/app?id=${lista.id}&nome=${encodeURIComponent(lista.nome)}`;
        
        div.innerHTML = `
            <div>
                <h4 style="margin: 0; color: #fff; font-size: 1.2rem;">${lista.nome}</h4>
                <small style="color: #888;">Código Convite: <b style="color: #4CAF50;">${lista.codigo_compartilhamento}</b></small>
            </div>
            <span style="font-size: 1.5rem;">➔</span>
        `;
        container.appendChild(div);
    });
}