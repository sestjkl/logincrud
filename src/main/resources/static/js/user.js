// ==========================================
// CONTROLE DE ABAS DO PAINEL PRINCIPAL
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'text-white', 'bg-indigo-600', 'shadow-lg', 'shadow-indigo-600/20');
        item.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
    });

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
        activeNav.classList.add('active', 'text-white', 'bg-indigo-600', 'shadow-lg', 'shadow-indigo-600/20');
    }
}

// ==========================================
// INICIALIZAÇÃO E CARREGAMENTO DE DADOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons(); // Inicializa os ícones do Lucide
    }

    // Recupera o usuário logado do localStorage
    const dadosSalvos = localStorage.getItem("usuarioLogado");
    if (dadosSalvos) {
        const usuario = JSON.parse(dadosSalvos);

        // Preenche os campos do painel com os dados reais do usuário
        preencherDadosNaTela(usuario);
    } else {
        // Se não houver sessão ativa, redireciona de volta para o login
        alert("Sessão expirada ou não iniciada. Faça login novamente.");
        window.location.href = "index.html";
        return;
    }

    // Carrega a listagem de usuários e as métricas do dashboard
    carregarUsuariosTabela();
    carregarMetricasDashboard();
});

// ==========================================
// FUNÇÃO PARA ALTERNAR A VISÃO (DEMO PARA RECRUTADORES)
// ==========================================
function toggleRole() {
    const dadosSalvos = localStorage.getItem("usuarioLogado");
    if (!dadosSalvos) return;

    let usuario = JSON.parse(dadosSalvos);

    // Alterna a função entre Administrador e Usuário Comum
    if (usuario.funcao && usuario.funcao.toLowerCase().includes("administrador")) {
        usuario.funcao = "Usuário Comum";
    } else {
        usuario.funcao = "Administrador";
    }

    // Atualiza o localStorage com o novo estado de permissão
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Reaplica os dados na tela para atualizar a interface instantaneamente
    preencherDadosNaTela(usuario);

    // Se o recrutador estiver na aba de gerenciamento e alternar para usuário comum, redireciona para o dashboard
    if (usuario.funcao === "Usuário Comum") {
        switchTab('dashboard');
    }
}

// Função auxiliar para preencher os elementos visuais com os dados do usuário
function preencherDadosNaTela(usuario) {
    const dashGreetingName = document.getElementById("dashGreetingName");
    if (dashGreetingName) dashGreetingName.textContent = usuario.nome ? usuario.nome.split(" ")[0] : "Usuário";

    const sidebarUserName = document.getElementById("sidebarUserName");
    if (sidebarUserName) sidebarUserName.textContent = usuario.nome;

    const headerUserName = document.getElementById("headerUserName");
    if (headerUserName) headerUserName.textContent = usuario.nome;

    const headerUserRole = document.getElementById("headerUserRole");
    if (headerUserRole) headerUserRole.textContent = usuario.cargo || "Analista de Sistemas Sênior";

    const inputProfileName = document.getElementById("inputProfileName");
    if (inputProfileName) inputProfileName.value = usuario.nome || "";

    const inputProfileEmail = document.getElementById("inputProfileEmail");
    if (inputProfileEmail) inputProfileEmail.value = usuario.email || "";

    const inputProfileCargo = document.getElementById("inputProfileCargo");
    if (inputProfileCargo) inputProfileCargo.value = usuario.cargo || "";

    const inputProfileTelefone = document.getElementById("inputProfileTelefone");
    if (inputProfileTelefone) inputProfileTelefone.value = usuario.telefone || "";

    const inputProfileBio = document.getElementById("inputProfileBio");
    if (inputProfileBio) inputProfileBio.value = usuario.biografia || "";

    const roleBadge = document.getElementById("roleBadge");
    if (roleBadge) {
        roleBadge.textContent = usuario.funcao || "Usuário Comum";
        if (usuario.funcao && usuario.funcao.toLowerCase().includes("administrador")) {
            roleBadge.className = "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider";
        } else {
            roleBadge.className = "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 uppercase tracking-wider";
        }
    }

    const sidebarAvatar = document.getElementById("sidebarAvatar");
    if (sidebarAvatar && usuario.fotoUrl) sidebarAvatar.src = usuario.fotoUrl;

    const headerAvatar = document.getElementById("headerAvatar");
    if (headerAvatar && usuario.fotoUrl) headerAvatar.src = usuario.fotoUrl;

    const profilePreview = document.getElementById("profilePreview");
    if (profilePreview && usuario.fotoUrl) profilePreview.src = usuario.fotoUrl;

    // ==========================================
    // CONTROLE DE VISIBILIDADE (ADMIN vs COMUM)
    // ==========================================
    const isAdmin = usuario.funcao && (
        usuario.funcao.toLowerCase().includes("administrador") ||
        usuario.funcao.toLowerCase().includes("adm")
    );

    const navEquipeUsuarios = document.getElementById("nav-gerenciamento"); // ID da aba "Equipe e Usuários"

    if (isAdmin) {
        if (navEquipeUsuarios) navEquipeUsuarios.classList.remove("hidden");
    } else {
        if (navEquipeUsuarios) navEquipeUsuarios.classList.add("hidden");
    }
}

// ==========================================
// PRÉ-VISUALIZAÇÃO DA FOTO DE PERFIL
// ==========================================
function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;

            // Atualiza os avatares visualmente na tela imediatamente
            const profilePreview = document.getElementById("profilePreview");
            if (profilePreview) profilePreview.src = base64Image;

            const sidebarAvatar = document.getElementById("sidebarAvatar");
            if (sidebarAvatar) sidebarAvatar.src = base64Image;

            const headerAvatar = document.getElementById("headerAvatar");
            if (headerAvatar) headerAvatar.src = base64Image;

            // Armazena temporariamente para envio posterior ao servidor no saveProfile
            window.tempFotoUrl = base64Image;
        };
        reader.readAsDataURL(file);
    }
}

// ==========================================
// GESTÃO DO MODAL DE USUÁRIOS
// ==========================================
function openModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.classList.add("hidden");
}

// ==========================================
// COMUNICAÇÃO COM O BACK-END (SPRING BOOT)
// ==========================================

// 1. Carregar lista de utilizadores na tabela do painel
async function carregarUsuariosTabela() {
    try {
        const resposta = await fetch("http://localhost:8080/usuarios");
        if (resposta.ok) {
            const usuarios = await resposta.json();
            const tbody = document.getElementById("userTableBody");
            const userCount = document.getElementById("userCount");

            if (tbody) {
                tbody.innerHTML = "";
                usuarios.forEach(u => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="py-3.5 px-6 font-medium text-slate-900">${u.nome}</td>
                        <td class="py-3.5 px-6 text-slate-500">${u.email}</td>
                        <td class="py-3.5 px-6"><span class="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">${u.status || 'Ativo'}</span></td>
                        <td class="py-3.5 px-6 text-right">
                            <button onclick="deletarUsuario(${u.id})" class="text-rose-500 hover:text-rose-700 text-xs font-semibold">Excluir</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                if (userCount) userCount.textContent = usuarios.length;
            }
        }
    } catch (e) {
        console.error("Erro ao carregar tabela de usuários:", e);
    }
}

// 2. Renderizar gráfico dinâmico dos últimos 6 meses com interatividade por clique (sem pop-up)
function renderizarGraficoUltimosMeses(usuarios) {
    const container = document.getElementById("graficoMesesContainer");
    if (!container) return;

    container.innerHTML = "";

    // Gera os últimos 6 meses cronologicamente (do mais antigo para o atual)
    const ultimosMeses = [];
    const dataAtual = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
        const mesIndex = d.getMonth();
        const ano = d.getFullYear();

        const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        ultimosMeses.push({
            label: `${nomesMeses[mesIndex]}/${ano.toString().slice(-2)}`,
            mesIndex: mesIndex,
            ano: ano,
            count: 0
        });
    }

    // Conta os usuários por mês com base na data de cadastro (se houver)
    usuarios.forEach(u => {
        const dataCadastro = u.dataCriacao || u.createdAt ? new Date(u.dataCriacao || u.createdAt) : new Date();
        const m = dataCadastro.getMonth();
        const a = dataCadastro.getFullYear();

        const objMes = ultimosMeses.find(item => item.mesIndex === m && item.ano === a);
        if (objMes) {
            objMes.count++;
        }
    });

    // Fallback visual caso os usuários cadastrados não tenham data explícita no banco
    const totalCadastros = usuarios.length;
    if (ultimosMeses.every(item => item.count === 0) && totalCadastros > 0) {
        ultimosMeses[ultimosMeses.length - 1].count = totalCadastros;
    }

    const maxCount = Math.max(...ultimosMeses.map(i => i.count), 1);

    // Desenha as barras dinâmicas
    ultimosMeses.forEach((item, index) => {
        const alturaPx = Math.max(Math.round((item.count / maxCount) * 150), 24);
        const isUltimo = index === ultimosMeses.length - 1;

        const colunaDiv = document.createElement("div");
        colunaDiv.className = "w-full flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:-translate-y-1";

        // Ação ao clicar no mês: atualiza diretamente a métrica do card superior sem alertas
        colunaDiv.onclick = () => {
            // Remove o destaque de todas as outras barras do gráfico
            document.querySelectorAll(".barra-mes-grafico").forEach(b => {
                b.classList.remove("bg-indigo-600");
                b.classList.add("bg-indigo-100");
            });

            // Destaca a barra clicada
            const barraEl = colunaDiv.querySelector(".barra-mes-grafico");
            if (barraEl) {
                barraEl.classList.remove("bg-indigo-100");
                barraEl.classList.add("bg-indigo-600");
            }

            // Atualiza o valor no card "Novos Cadastros"
            const elemNovos = document.getElementById("metricNovos");
            if (elemNovos) {
                elemNovos.textContent = item.count;
            }
        };

        const corInicial = isUltimo ? "bg-indigo-600" : "bg-indigo-100 group-hover:bg-indigo-500";

        colunaDiv.innerHTML = `
            <span class="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition">${item.count}</span>
            <div class="barra-mes-grafico w-full ${corInicial} transition-all rounded-t-md" style="height: ${alturaPx}px;" title="${item.count} cadastros em ${item.label}"></div>
            <span class="text-xs text-slate-400 font-medium">${item.label}</span>
        `;

        container.appendChild(colunaDiv);
    });
}

// 3. Carregar métricas reais, gráficos e integridade de perfis dinamicamente
async function carregarMetricasDashboard() {
    try {
        const resposta = await fetch("http://localhost:8080/usuarios");
        if (resposta.ok) {
            const usuarios = await resposta.json();
            const total = usuarios.length;

            const ativos = usuarios.filter(u => !u.status || u.status.toLowerCase() === 'ativo').length;
            const inativos = total - ativos;
            const admins = usuarios.filter(u => u.funcao && (u.funcao.toLowerCase().includes('admin') || u.funcao.toLowerCase().includes('administrador'))).length;
            const comFoto = usuarios.filter(u => u.fotoUrl && u.fotoUrl.trim() !== '').length;
            const semFoto = total - comFoto;
            const completos = usuarios.filter(u => u.fotoUrl && u.biografia && u.cargo && u.telefone).length;

            // Atualização das métricas principais
            const elemTotal = document.getElementById("metricTotal");
            if (elemTotal) elemTotal.textContent = total;

            const elemAtivos = document.getElementById("metricAtivos");
            if (elemAtivos) elemAtivos.textContent = ativos;

            const subAtivos = document.getElementById("submetricAtivos");
            if (subAtivos) {
                const pctAtivos = total > 0 ? ((ativos / total) * 100).toFixed(1) : 0;
                subAtivos.textContent = `${pctAtivos}% do escopo total`;
            }

            const elemNovos = document.getElementById("metricNovos");
            if (elemNovos) elemNovos.textContent = total;

            const elemAdmins = document.getElementById("metricAdmins");
            if (elemAdmins) elemAdmins.textContent = admins;

            // Renderiza o gráfico dinâmico dos últimos 6 meses
            renderizarGraficoUltimosMeses(usuarios);

            // Atualização dinâmica dos Indicadores de Integridade (lado direito)
            const pctCompletosVal = total > 0 ? Math.round((completos / total) * 100) : 0;
            const pctSemFotoVal = total > 0 ? Math.round((semFoto / total) * 100) : 0;
            const pctInativosVal = total > 0 ? Math.round((inativos / total) * 100) : 0;

            const txtCompletos = document.getElementById("pctCompletosText");
            const barCompletos = document.getElementById("pctCompletosBar");
            if (txtCompletos) txtCompletos.textContent = `${pctCompletosVal}%`;
            if (barCompletos) barCompletos.style.width = `${pctCompletosVal}%`;

            const txtSemFoto = document.getElementById("pctSemFotoText");
            const barSemFoto = document.getElementById("pctSemFotoBar");
            if (txtSemFoto) txtSemFoto.textContent = `${pctSemFotoVal}%`;
            if (barSemFoto) barSemFoto.style.width = `${pctSemFotoVal}%`;

            const txtInativos = document.getElementById("pctInativosText");
            const barInativos = document.getElementById("pctInativosBar");
            if (txtInativos) txtInativos.textContent = `${pctInativosVal}%`;
            if (barInativos) barInativos.style.width = `${pctInativosVal}%`;
        }
    } catch (e) {
        console.error("Erro ao carregar métricas:", e);
    }
}

// 4. Adicionar novo usuário pelo modal do painel
async function addUser() {
    const nome = document.getElementById("newUserName").value;
    const email = document.getElementById("newUserEmail").value;
    const funcao = document.getElementById("newUserRole").value;

    if (!nome || !email) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const novoUsuario = {
        nome: nome,
        email: email,
        senha: "123", // Senha temporária padrão para novos cadastros administrativos
        funcao: funcao
    };

    try {
        const resposta = await fetch("http://localhost:8080/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoUsuario)
        });

        if (resposta.ok) {
            alert("Usuário cadastrado com sucesso!");
            closeModal();
            carregarUsuariosTabela();
            carregarMetricasDashboard();
        } else {
            const erro = await resposta.text();
            alert("Erro ao cadastrar: " + erro);
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro ao conectar com o servidor.");
    }
}

// 5. Excluir usuário da tabela
async function deletarUsuario(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
        const resposta = await fetch(`http://localhost:8080/usuarios/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("Usuário excluído com sucesso!");
            carregarUsuariosTabela();
            carregarMetricasDashboard();
        } else {
            alert("Erro ao excluir usuário.");
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
    }
}

// 6. Salvar alterações do perfil na aba "Minha Conta"
async function saveProfile() {
    const dadosSalvos = localStorage.getItem("usuarioLogado");
    if (!dadosSalvos) return;

    const usuarioAtual = JSON.parse(dadosSalvos);

    // Captura os valores atualizados dos inputs do perfil
    const novosDados = {
        nome: document.getElementById("inputProfileName")?.value || usuarioAtual.nome,
        email: document.getElementById("inputProfileEmail")?.value || usuarioAtual.email,
        cargo: document.getElementById("inputProfileCargo")?.value || usuarioAtual.cargo,
        telefone: document.getElementById("inputProfileTelefone")?.value || usuarioAtual.telefone,
        biografia: document.getElementById("inputProfileBio")?.value || usuarioAtual.biografia,
        fotoUrl: window.tempFotoUrl || usuarioAtual.fotoUrl, // Envia a nova imagem ou mantém a anterior
        senha: usuarioAtual.senha // Mantém a senha existente para evitar problemas de validação
    };

    try {
        const resposta = await fetch(`http://localhost:8080/usuarios/${usuarioAtual.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novosDados)
        });

        if (resposta.ok) {
            const usuarioAtualizado = await resposta.json();

            // Atualiza o localStorage com os novos dados retornados pelo back-end
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

            // Limpa a variável temporária de foto
            window.tempFotoUrl = null;

            // Atualiza a interface visualmente
            preencherDadosNaTela(usuarioAtualizado);

            alert("Alterações de perfil salvas com sucesso!");
        } else {
            const erroTexto = await resposta.text();
            alert("Erro ao atualizar perfil (" + resposta.status + "): " + (erroTexto || "Erro desconhecido"));
            console.error("Detalhe do erro no back-end:", erroTexto);
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Não foi possível conectar ao servidor para atualizar o perfil.");
    }
}

// ==========================================
// LOGOUT (ENCERRAR SESSÃO)
// ==========================================
document.addEventListener("click", (e) => {
    const logoutBtn = e.target.closest("button");
    if (logoutBtn && (logoutBtn.textContent.includes("Encerrar Sessão") || logoutBtn.querySelector('[data-lucide="log-out"]'))) {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "index.html";
    }
});