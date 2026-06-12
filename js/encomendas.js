// Operação Completa de Entrada e Saída de Encomendas
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-encomenda");
    const selectBloco = document.getElementById("enc-bloco");
    const listaTbody = document.getElementById("lista-encomendas");
    const btnCancel = document.getElementById("btn-cancel-edit");
    const formTitle = document.getElementById("form-enc-title");

    // Popular blocos (A-Z)
    const blocos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    blocos.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = `Bloco ${b}`;
        selectBloco.appendChild(opt);
    });

    document.getElementById("enc-data").value = new Date().toISOString().split('T')[0];

    renderEncomendas();

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = document.getElementById("enc-id").value;
        const bloco = document.getElementById("enc-bloco").value;
        const apartamento = document.getElementById("enc-apto").value.trim();
        const destinatario = document.getElementById("enc-destinatario").value.trim();
        const transportadora = document.getElementById("enc-transportadora").value.trim();
        const data = document.getElementById("enc-data").value;
        const status = document.getElementById("enc-status").value;

        let encomendas = JSON.parse(localStorage.getItem("encomendas") || "[]");

        if(id) {
            // Fluxo de Edição / Atualização
            encomendas = encomendas.map(enc => {
                if(enc.id === id) {
                    return { id, bloco, apartamento, destinatario, transportadora, data, status };
                }
                return enc;
            });
            resetFormEdicao();
        } else {
            // Fluxo de Inserção Nova
            const novaEnc = {
                id: Date.now().toString(),
                bloco, apartamento, destinatario, transportadora, data, status
            };
            encomendas.push(novaEnc);
        }

        localStorage.setItem("encomendas", JSON.stringify(encomendas));
        form.reset();
        document.getElementById("enc-data").value = new Date().toISOString().split('T')[0];
        renderEncomendas();
    });

    function renderEncomendas() {
        const encomendas = JSON.parse(localStorage.getItem("encomendas") || "[]");
        listaTbody.innerHTML = "";

        if(encomendas.length === 0) {
            listaTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">Nenhum pacote sob custódia na portaria.</td></tr>';
            return;
        }

        encomendas.sort((a,b) => b.id - a.id);

        encomendas.forEach(e => {
            const tr = document.createElement("tr");
            const badgeClass = (e.status === "Aguardando retirada") ? "badge waiting" : "badge delivered";
            const dataFmt = e.data.split('-').reverse().join('/');

            tr.innerHTML = `
                <td>
                    <strong>${e.destinatario}</strong><br>
                    <small style="color:var(--text-muted)">Bl ${e.bloco} - Ap ${e.apartamento}</small>
                </td>
                <td>
                    <strong>${e.transportadora}</strong><br>
                    <small style="color:var(--text-muted)">Entrada: ${dataFmt}</small>
                </td>
                <td><span class="${badgeClass}">${e.status}</span></td>
                <td>
                    <button class="btn-phone" style="padding:4px 8px; font-size:0.75rem;" onclick="prepararEdicao('${e.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-cancel" style="padding:4px 8px; font-size:0.75rem; background-color:var(--accent-red);" onclick="excluirEncomenda('${e.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            listaTbody.appendChild(tr);
        });
    }

    window.prepararEdicao = function(id) {
        const encomendas = JSON.parse(localStorage.getItem("encomendas") || "[]");
        const enc = encomendas.find(e => e.id === id);

        if(enc) {
            document.getElementById("enc-id").value = enc.id;
            document.getElementById("enc-bloco").value = enc.bloco;
            document.getElementById("enc-apto").value = enc.apartamento;
            document.getElementById("enc-destinatario").value = enc.destinatario;
            document.getElementById("enc-transportadora").value = enc.transportadora;
            document.getElementById("enc-data").value = enc.data;
            document.getElementById("enc-status").value = enc.status;

            formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Registro de Encomenda';
            btnCancel.classList.remove("hidden");
        }
    };

    btnCancel.addEventListener("click", () => {
        resetFormEdicao();
        form.reset();
        document.getElementById("enc-data").value = new Date().toISOString().split('T')[0];
    });

    function resetFormEdicao() {
        document.getElementById("enc-id").value = "";
        formTitle.innerHTML = '<i class="fa-solid fa-box-archive"></i> Receber Nova Encomenda';
        btnCancel.classList.add("hidden");
    }

    window.excluirEncomenda = function(id) {
        if(confirm("Deseja deletar permanentemente esta encomenda?")) {
            let encomendas = JSON.parse(localStorage.getItem("encomendas") || "[]");
            encomendas = encomendas.filter(e => e.id !== id);
            localStorage.setItem("encomendas", JSON.stringify(encomendas));
            renderEncomendas();
            if(document.getElementById("enc-id").value === id) {
                resetFormEdicao();
                form.reset();
            }
        }
    };
});