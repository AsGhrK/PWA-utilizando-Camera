import { openDB } from "idb";
let db;

async function createDB() {
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                switch (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('pessoas', {
                            keyPath: 'nome'
                        });

                        store.createIndex('id', 'id');
                        showResult("Banco de dados criado!");
                }
            }
        });
        showResult("Banco de dados aberto.");
    } catch (e) {
        showResult("Erro ao criar o banco de dados:" + e.message);
    }
}


window.addEventListener("DOMContentLoaded", async event => {
    createDB();

    const nomeInput = document.getElementById("nome");
    const idadeInput = document.getElementById("idade");

    document.getElementById("btnSalvar").addEventListener("click", () => addData(nomeInput, idadeInput));
    document.getElementById("btnListar").addEventListener("click", getData);
    document.getElementById("btnAtualizar").addEventListener("click", () => updateData(nomeInput, idadeInput));
    document.getElementById("btnRemover").addEventListener("click", () => deleteData(nomeInput));
});


async function addData(nomeInput, idadeInput) {
    const nome = nomeInput.value;
    const idade = idadeInput.value;

    if (!nome || !idade) {
        showResult("Por favor, preencha o nome e a idade.");
        return;
    }

    try {
        const tx = await db.transaction('pessoas', 'readwrite');
        const store = tx.objectStore('pessoas');

        const id = Date.now();
        const pessoa = { nome, idade, id };

        await store.add(pessoa);
        await tx.done;
        showResult("Pessoa adicionada ao banco de dados.");
    } catch (e) {
        showResult("Erro ao adicionar os dados: " + e.message);
    }
}


async function getData() {
    if (db === undefined) {
        showResult("O banco de dados está fechado");
        return;
    }

    try {
        const tx = await db.transaction('pessoas', 'readonly');
        const store = tx.objectStore('pessoas');
        const value = await store.getAll();

        if (value.length > 0) {
            let outputText = "Dados do banco:<br>";
            value.forEach(pessoa => {
                outputText += `Nome: ${pessoa.nome}, Idade: ${pessoa.idade}, ID: ${pessoa.id}<br>`;
            });
            showResult(outputText);
        } else {
            showResult("Não há nenhum dado no banco!");
        }
    } catch (e) {
        showResult("Erro ao obter os dados: " + e.message);
    }
}


async function updateData(nomeInput, idadeInput) {
    const nome = nomeInput.value;
    const idade = idadeInput.value;

    if (!nome || !idade) {
        showResult("Por favor, preencha o nome e a idade.");
        return;
    }

    try {
        const tx = await db.transaction('pessoas', 'readwrite');
        const store = tx.objectStore('pessoas');

        const pessoaExistente = await store.get(nome);
        if (!pessoaExistente) {
            showResult("Pessoa não encontrada.");
            return;
        }

        // Atualizar dados
        pessoaExistente.idade = idade;

        await store.put(pessoaExistente);
        await tx.done;
        showResult("Pessoa atualizada com sucesso.");
    } catch (e) {
        showResult("Erro ao atualizar os dados: " + e.message);
    }
}


async function deleteData(nomeInput) {
    const nome = nomeInput.value;

    if (!nome) {
        showResult("Por favor, preencha o nome.");
        return;
    }

    try {
        const tx = await db.transaction('pessoas', 'readwrite');
        const store = tx.objectStore('pessoas');

        const pessoaExistente = await store.get(nome);
        if (!pessoaExistente) {
            showResult("Pessoa não encontrada.");
            return;
        }

        await store.delete(nome);
        await tx.done;
        showResult("Pessoa removida com sucesso.");
    } catch (e) {
        showResult("Erro ao remover os dados: " + e.message);
    }
}


function showResult(text) {
    document.querySelector("output").innerHTML = text;
}
