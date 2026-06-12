// Controle de Fluxo e Registro de Visitantes
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-visitante");
    const selectBloco = document.getElementById("vis-bloco");
    const listaTbody = document.getElementById("lista-visitantes");

    // Inicializa selects de blocos (A-Z)
    const blocos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    blocos.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = `Bloco ${b}`;
        selectBloco.appendChild(opt);
    });

    // Auto-preenche data e hora corrente para agilizar o trabalho do porteiro
    const hoje = new Date();
    document.getElementById("vis-data").value = hoje.toISOString().split('T')[0];
    document.getElementById("vis-hora").value = hoje.toTimeString().split(' ')[0].substring(0,5);

    // Carregar Lista Inicial
    renderVisitantes();

    // Evento de Submissão de Cadastro
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const novoVisitante = {
            id: Date.now().toString(),
            nome: document.getElementById("vis-nome").value.trim(),
            documento: document.getElementById("vis-doc").value.trim(),
            bloco: document.getElementById("vis-bloco").value,
            apartamento: document.getElementById("vis-apto").value.trim(),
            data: document.getElementById("vis-data").value,
            hora: document.getElementById("vis-hora").value
        };

        const visitantesAtuais = JSON.parse(localStorage.getItem("visitantes") || "[]");
        visitantesAtuais.push(novoVisitante);
        localStorage.setItem("visitantes", JSON.stringify(visitantesAtuais));

        form.reset();
        // Readiciona data/hora padrão pós reset
        document.getElementById("vis-data").value = hoje.toISOString().split('T')[0];
        document.getElementById("vis-hora").value = hoje.toTimeString().split(' ')[0].substring(0,5);

        renderVisitantes();
    });

    // Função de renderização da tabela
    function renderVisitantes() {
        const visitantes = JSON.parse(localStorage.getItem("visitantes") || "[]");
        listaTbody.innerHTML = "";

        if(visitantes.length === 0) {
            listaTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">Nenhum visitante ativo registrado no momento.</td></tr>';
            return;
        }

        // Ordenação decrescente (mais recentes no topo)
        visitantes.sort((a, b) => b.id - a.id);

        visitantes.forEach(v => {
            const tr = document.createElement("tr");
            
            // Formatador de data simplificado brasileiro
            const dataFormatada = v.data.split('-').reverse().join('/');

            tr.innerHTML = `
                <td>
                    <strong>${v.nome}</strong><br>
                    <small style="color: var(--text-muted)"><i class="fa-solid fa-address-card"></i> Doc: ${v.documento}</small>
                </td>
                <td><span class="location-tag">Bl ${v.bloco} - Ap ${v.apartamento}</span></td>
                <td>${dataFormatada} às ${v.hora}</td>
                <td>
                    <button class="btn-cancel" style="padding: 6px 10px; background-color: var(--accent-red);" onclick="excluirVisitante('${v.id}')">
                        <i class="fa-solid fa-trash-can"></i> Excluir
                    </button>
                </td>
            `;
            listaTbody.appendChild(tr);
        });
    }

    // Escopo global para o gatilho inline do botão de exclusão
    window.excluirVisitante = function(id) {
        if(confirm("Confirma a remoção permanente deste registro de visitante?")) {
            let visitantes = JSON.parse(localStorage.getItem("visitantes") || "[]");
            visitantes = visitantes.filter(v => v.id !== id);
            localStorage.setItem("visitantes", JSON.stringify(visitantes));
            renderVisitantes();
        }
    };
});