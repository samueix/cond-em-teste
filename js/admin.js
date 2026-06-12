// Painel Administrativo de Manutenção Cadastral
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");
    const loginBlock = document.getElementById("login-block");
    const adminWorkspace = document.getElementById("admin-workspace");
    const loginError = document.getElementById("login-error");
    const btnLogout = document.getElementById("btn-logout");

    const formManage = document.getElementById("form-manage-morador");
    const selectBloco = document.getElementById("m-bloco");
    const contatosInputsContainer = document.getElementById("contatos-inputs-container");
    const listaAdminMoradores = document.getElementById("lista-admin-moradores");
    const btnCancelMEdit = document.getElementById("btn-cancel-m-edit");
    const formMoradorTitle = document.getElementById("form-morador-title");

    // Injeção de Blocos A-Z no select admin
    const blocos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    blocos.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = `Bloco ${b}`;
        selectBloco.appendChild(opt);
    });

    // Renderiza inputs dinâmicos para suportar exatamente até 3 contatos exigidos
    function renderDynamicContactInputs() {
        contatosInputsContainer.innerHTML = "";
        for (let i = 1; i <= 3; i++) {
            const div = document.createElement("div");
            div.className = "contact-input-set";
            div.style.border = "1px solid var(--border-color)";
            div.style.padding = "10px";
            div.style.borderRadius = "6px";
            div.style.marginBottom = "10px";
            div.style.background = "var(--bg-primary)";
            div.innerHTML = `
                <h5 style="margin-bottom:6px; font-size:0.8rem; color:var(--text-muted)">Contato ${i}</h5>
                <div class="form-group" style="margin-bottom:6px">
                    <input type="text" id="m-nome-${i}" placeholder="Nome do Morador">
                </div>
                <div class="form-group" style="margin-bottom:0">
                    <input type="text" id="m-tel-${i}" placeholder="Telefone (Apenas números)">
                </div>
            `;
            contatosInputsContainer.appendChild(div);
        }
    }
    renderDynamicContactInputs();

    // Verificação de Estado de Sessão Local (Evita deslogar no F5)
    if(sessionStorage.getItem("admin_authenticated") === "true") {
        showWorkspace();
    }

    // Fluxo Login
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("adm-user").value;
        const pass = document.getElementById("adm-pass").value;

        if(user === "admin" && pass === "123456") {
            sessionStorage.setItem("admin_authenticated", "true");
            loginError.classList.add("hidden");
            formLogin.reset();
            showWorkspace();
        } else {
            loginError.classList.remove("hidden");
        }
    });

    btnLogout.addEventListener("click", () => {
        sessionStorage.removeItem("admin_authenticated");
        hideWorkspace();
    });

    function showWorkspace() {
        loginBlock.classList.add("hidden");
        adminWorkspace.classList.remove("hidden");
        renderAdminMoradores();
    }

    function hideWorkspace() {
        loginBlock.classList.remove("hidden");
        adminWorkspace.classList.add("hidden");
    }

    // Fluxo CRUD de Operação de Moradores
    formManage.addEventListener("submit", (e) => {
        e.preventDefault();

        const indexVal = document.getElementById("morador-index").value;
        const bloco = selectBloco.value;
        const apartamento = document.getElementById("m-apto").value.trim();

        // Extrai contatos dos inputs dinâmicos
        const contatos = [];
        for(let i = 1; i <= 3; i++) {
            const nome = document.getElementById(`m-nome-${i}`).value.trim();
            const telefone = document.getElementById(`m-tel-${i}`).value.trim();
            if(nome || telefone) {
                contatos.push({ nome, telefone });
            }
        }

        let moradores = JSON.parse(localStorage.getItem("moradores") || "[]");

        if(indexVal !== "") {
            // Edição baseada em ID estável composto
            moradores = moradores.map(m => {
                if(m.id === indexVal) {
                    return { id: `${bloco}-${apartamento}`, bloco, apartamento, contatos };
                }
                return m;
            });
            resetFormMorador();
        } else {
            // Valida duplicidade
            const existe = moradores.some(m => m.bloco === bloco && m.apartamento === apartamento);
            if(existe) {
                alert("Esta unidade predial já se encontra cadastrada no banco de dados.");
                return;
            }
            moradores.push({
                id: `${bloco}-${apartamento}`,
                bloco, apartamento, contatos
            });
        }

        localStorage.setItem("moradores", JSON.stringify(moradores));
        formManage.reset();
        renderDynamicContactInputs();
        renderAdminMoradores();
    });

    function renderAdminMoradores() {
        const moradores = JSON.parse(localStorage.getItem("moradores") || "[]");
        listaAdminMoradores.innerHTML = "";

        // Ordenar por bloco e depois por apto para visualização limpa do administrador
        moradores.sort((a,b) => {
            if(a.bloco !== b.bloco) return a.bloco.localeCompare(b.bloco);
            return parseInt(a.apartamento) - parseInt(b.apartamento);
        });

        moradores.forEach(m => {
            const tr = document.createElement("tr");
            const moradorPrincipal = m.contatos[0] ? m.contatos[0].nome : "Sem moradores cadastrados";
            const totalContatos = m.contatos.length;

            tr.innerHTML = `
                <td><strong>Bloco ${m.bloco} - Ap ${m.apartamento}</strong></td>
                <td>${moradorPrincipal}</td>
                <td><span class="badge delivered" style="background:#e0f2fe; color:#0369a1">${totalContatos} Contato(s)</span></td>
                <td>
                    <button class="btn-phone" style="padding:4px 8px; font-size:0.75rem;" onclick="prepararEdicaoMorador('${m.id}')"><i class="fa-solid fa-marker"></i></button>
                    <button class="btn-cancel" style="padding:4px 8px; font-size:0.75rem; background-color:var(--accent-red);" onclick="excluirMorador('${m.id}')"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            listaAdminMoradores.appendChild(tr);
        });
    }

    window.prepararEdicaoMorador = function(id) {
        const moradores = JSON.parse(localStorage.getItem("moradores") || "[]");
        const m = moradores.find(item => item.id === id);

        if(m) {
            document.getElementById("morador-index").value = m.id;
            selectBloco.value = m.bloco;
            document.getElementById("m-apto").value = m.apartamento;

            renderDynamicContactInputs();
            // Preenche os inputs dinâmicos com os dados existentes
            for(let i = 0; i < 3; i++) {
                if(m.contatos[i]) {
                    document.getElementById(`m-nome-${i+1}`).value = m.contatos[i].nome || "";
                    document.getElementById(`m-tel-${i+1}`).value = m.contatos[i].telefone || "";
                }
            }

            formMoradorTitle.innerHTML = '<i class="fa-solid fa-user-pen"></i> Atualizar Unidade';
            btnCancelMEdit.classList.remove("hidden");
        }
    };

    btnCancelMEdit.addEventListener("click", () => {
        resetFormMorador();
        formManage.reset();
        renderDynamicContactInputs();
    });

    function resetFormMorador() {
        document.getElementById("morador-index").value = "";
        formMoradorTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> Inserir / Editar Unidade';
        btnCancelMEdit.classList.add("hidden");
    }

    window.excluirMorador = function(id) {
        if(confirm("Confirma a exclusão definitiva desta unidade e todos os seus contatos atrelados?")) {
            let moradores = JSON.parse(localStorage.getItem("moradores") || "[]");
            moradores = moradores.filter(item => item.id !== id);
            localStorage.setItem("moradores", JSON.stringify(moradores));
            renderAdminMoradores();
            if(document.getElementById("morador-index").value === id) {
                resetFormMorador();
                formManage.reset();
                renderDynamicContactInputs();
            }
        }
    };
});