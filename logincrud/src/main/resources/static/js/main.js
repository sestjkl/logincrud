const card = document.querySelector(".card");

document.querySelectorAll(".switch-btn").forEach((button) => {
  button.addEventListener("click", () => {
    card.classList.add("has-toggled");
    card.classList.toggle("register");
  });
});

// Busca o Client ID configurado no backend de forma dinâmica
async function handleGoogleLogin() {
    try {
        const resposta = await fetch("/usuarios/google-client-id");
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as credenciais do Google.");
        }
        const data = await resposta.json();
        const clientId = data.clientId;

        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
        });
        google.accounts.id.prompt();
    } catch (erro) {
        console.error("Erro ao inicializar o login do Google:", erro);
        alert("Erro ao conectar com o serviço de autenticação do Google.");
    }
}

function handleCredentialResponse(response) {
    console.log("Token ID do Google obtido com sucesso:", response.credential);
    enviarTokenParaBackend(response.credential);
}

async function enviarTokenParaBackend(idToken) {
    try {
        const resposta = await fetch("/usuarios/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token: idToken })
        });

        if (resposta.ok) {
            const usuario = await resposta.json();
            alert("Usuário logado com sucesso! Bem-vindo, " + usuario.nome);

            // Salva os dados e redireciona para o painel principal
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            window.location.href = "Main.html";
        } else {
            const erroMensagem = await resposta.text();
            alert("Erro detalhado do servidor: " + erroMensagem);
        }
    } catch (erro) {
        console.error("Erro de conexão:", erro);
        alert("Não foi possível conectar ao servidor para autenticar com o Google.");
    }
}

// ==========================================
// INTEGRAÇÃO COM OS FORMULÁRIOS (SPRING BOOT)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // 1. FORMULÁRIO DE CADASTRO (Com validação rigorosa de duplicidade e nomes reservados)
    const formRegister = document.querySelector(".form.register form");

    if (formRegister) {
        formRegister.addEventListener("submit", async (event) => {
            event.preventDefault(); // Impede a página de mudar de rota ou recarregar

            const dadosUsuario = {
                nome: document.querySelector("#reg-username").value,
                senha: document.querySelector("#reg-password").value,
                email: document.querySelector("#reg-email").value
            };

            try {
                const resposta = await fetch("/usuarios", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dadosUsuario)
                });

                if (resposta.ok) {
                    const resultado = await resposta.json();

                    // POP-UP DE SUCESSO AO CRIAR CONTA
                    alert("Usuário criado com sucesso!");
                    formRegister.reset();

                    // Remove a classe register para voltar à tela de login automaticamente
                    if (card) {
                        card.classList.remove("register");
                    }
                } else {
                    const erroMensagem = await resposta.text();
                    alert("Aviso: " + (erroMensagem || "Não foi possível realizar o cadastro."));
                }
            } catch (erro) {
                console.error("Erro na comunicação com o servidor:", erro);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }

    // 2. FORMULÁRIO DE LOGIN TRADICIONAL (Entrar por Usuário)
    const formLogin = document.querySelector(".form.login form");

    if (formLogin) {
        formLogin.addEventListener("submit", async (event) => {
            event.preventDefault();

            const credenciais = {
                nome: document.querySelector("#username").value,
                senha: document.querySelector("#password").value
            };

            try {
                const resposta = await fetch("/usuarios/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(credenciais)
                });

                if (resposta.ok) {
                    const usuario = await resposta.json();
                    alert("Usuário logado com sucesso! Bem-vindo de volta, " + usuario.nome);

                    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
                    window.location.href = "Main.html";
                    formLogin.reset();
                } else {
                    const erroMensagem = await resposta.text();
                    alert("Erro ao entrar: " + (erroMensagem || "Usuário ou senha incorretos."));
                }
            } catch (erro) {
                console.error("Erro na comunicação com o servidor:", erro);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }
});