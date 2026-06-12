// Controle Interno do Mural de Avisos do Condomínio
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-aviso");
    const muralContainer = document.getElementById("mural-container");
    const btnCancel = document.getElementById("btn-cancel-aviso");
    const formTitle = document.getElementById("form-aviso-title");

    document.getElementById("aviso-data").value = new Date().toISOString().split('T')[0];

    renderAvisos();

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = document.getElementById("aviso-id").value;
        const titulo = document.getElementById("aviso-titulo").value.trim();
        const data = document.getElementById("aviso-data").value;
        const mensagem = document.getElementById("aviso-msg").value.trim();

        let avisos = JSON.parse(localStorage.getItem("avisos") || "[]");

        if(id) {
            avisos = avisos.map(a => {
                if(a.id === id) return { id, titulo, data, mensagem };
                return a;
            });
            resetForm();
        } else {
            avisos.push({
                id: Date.now().toString(),
                titulo, data, mensagem
            });
        }

        localStorage.setItem("avisos", JSON.stringify(avisos));
        form.reset();
        document.getElementById("aviso-data").value = new Date().toISOString().split('T')[0];
        renderAvisos();
    });

    function renderAvisos() {
        const avisos = JSON.parse(localStorage.getItem("avisos") || "[]");
        muralContainer.innerHTML = "";

        if(avisos.length === 0) {
            muralContainer.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted); width:100%"><i class="fa-solid fa-comments" style="font-size:2.5rem; margin-bottom:10px;"></i><p>Nenhum comunicado oficial fixado no mural.</p></div>';
            return;
        }

        avisos.sort((a,b) => b.id - a.id);

        avisos.forEach(a => {
            const div = document.createElement("div");
            div.className = "mural-item";
            const dataFmt = a.data.split('-').reverse().join('/');

            div.innerHTML = `
                <div class="mural-meta">Publicado em: ${dataFmt}</div>
                <h4 style="font-size:1.1rem; margin-bottom:8px; color: var(--accent-orange);"><i class="fa-solid fa-thumbtack"></i> ${a.titulo}</h4>
                <p style="font-size:0.95rem; line-height:1.5; white-space: pre-wrap; margin-bottom:12px;">${a.mensagem}</p>
                <div style="display:flex; gap:10px; justify-content: flex-end;">
                    <button class="btn-phone" style="padding:4px 10px; font-size:0.75rem;" onclick="editarAviso('${a.id}')"><i class="fa-solid fa-pencil"></i> Editar</button>
                    <button class="btn-cancel" style="padding:4px 10px; font-size:0.75rem; background-color:var(--accent-red);" onclick="excluirAviso('${a.id}')"><i class="fa-solid fa-trash-can"></i> Deletar</button>
                </div>
            `;
            muralContainer.appendChild(div);
        });
    }

    window.editarAviso = function(id) {
        const avisos = JSON.parse(localStorage.getItem("avisos") || "[]");
        const av = avisos.find(a => a.id === id);
        if(av) {
            document.getElementById("aviso-id").value = av.id;
            document.getElementById("aviso-titulo").value = av.titulo;
            document.getElementById("aviso-data").value = av.data;
            document.getElementById("aviso-msg").value = av.mensagem;

            formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Alterar Comunicado';
            btnCancel.classList.remove("hidden");
        }
    };

    btnCancel.addEventListener("click", () => {
        resetForm();
        form.reset();
        document.getElementById("aviso-data").value = new Date().toISOString().split('T')[0];
    });

    function resetForm() {
        document.getElementById("aviso-id").value = "";
        formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Fixar Novo Comunicado';
        btnCancel.classList.add("hidden");
    }

    window.excluirAviso = function(id) {
        if(confirm("Remover permanentemente este comunicado do mural?")) {
            let avisos = JSON.parse(localStorage.getItem("avisos") || "[]");
            avisos = avisos.filter(a => a.id !== id);
            localStorage.setItem("avisos", JSON.stringify(avisos));
            renderAvisos();
            if(document.getElementById("aviso-id").value === id) {
                resetForm();
                form.reset();
            }
        }
    };
});