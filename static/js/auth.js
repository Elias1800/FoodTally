import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ychlylmcitwgntesfwkg.supabase.co";
const SUPABASE_KEY = "sb_publishable_BBjtigJvI6h_ctEWFy1ZhQ_zjvJtNA4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Verifica se o usuário já está logado ao abrir a página
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        window.location.href = "/dashboard";
    }
});

// Evento de clique do botão de login com o Google
document.getElementById("btn-login-google").addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard'
        }
    });

    if (error) {
        console.error("Erro ao logar com Google:", error);
        alert("Erro no login: " + error.message);
    }
});