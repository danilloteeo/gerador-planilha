function byId(id) {
  return document.getElementById(id);
}

function setStatus(statusEl, message, isError = false) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("is-error", Boolean(isError));
}

function activateTab(tabName) {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    const active = tab.dataset.tab === tabName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  panels.forEach((panel) => {
    const active = panel.dataset.panel === tabName;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
}

function normalizeText(value) {
  return value ? String(value).trim() : "";
}

function normalizeClienteEntry(entry) {
  const normalized = {
    idCliente: normalizeText(entry?.idCliente),
    nomeCliente: normalizeText(entry?.nomeCliente),
    idRota: normalizeText(entry?.idRota),
  };

  if (!normalized.idCliente && !normalized.nomeCliente && !normalized.idRota) {
    return null;
  }

  return normalized;
}

function normalizeProdutoEntry(entry) {
  const normalized = {
    idProduto: normalizeText(entry?.idProduto),
    nomeProduto: normalizeText(entry?.nomeProduto),
  };

  if (!normalized.idProduto && !normalized.nomeProduto) {
    return null;
  }

  return normalized;
}

function normalizeEntries(entries, normalizer) {
  if (!Array.isArray(entries)) return [];

  const output = [];
  for (const entry of entries) {
    const normalized = normalizer(entry);
    if (normalized) output.push(normalized);
  }
  return output;
}

function setupGenerator({ prefix, generate, buildPayload, generatingText }) {
  const generateButton = byId(`${prefix}-gerar`);
  const openFileButton = byId(`${prefix}-abrir-arquivo`);
  const openFolderButton = byId(`${prefix}-abrir-pasta`);
  const statusEl = byId(`${prefix}-status`);

  let lastOutPath = "";
  let lastOutDir = "";

  generateButton.addEventListener("click", async () => {
    try {
      setStatus(statusEl, generatingText, false);
      openFileButton.disabled = true;
      openFolderButton.disabled = true;

      const payload = buildPayload();
      const result = await generate(payload);

      lastOutPath = result.outPath;
      lastOutDir = result.outDir;

      setStatus(statusEl, `Sucesso! Arquivo gerado:\n${lastOutPath}`, false);
      openFileButton.disabled = false;
      openFolderButton.disabled = false;
    } catch (error) {
      const message = error?.message || String(error);
      setStatus(statusEl, `Erro ao gerar: ${message}`, true);
    }
  });

  openFileButton.addEventListener("click", async () => {
    if (lastOutPath) await window.api.abrirCaminho(lastOutPath);
  });

  openFolderButton.addEventListener("click", async () => {
    if (lastOutDir) await window.api.abrirCaminho(lastOutDir);
  });
}

let clientesCadastro = [];
let produtosCadastro = [];

const vendaClientesInfoEl = byId("venda-cadastro-info-clientes");
const vendaProdutosInfoEl = byId("venda-cadastro-info-produtos");
const precoClientesInfoEl = byId("preco-cadastro-info-clientes");
const precoProdutosInfoEl = byId("preco-cadastro-info-produtos");
const clientesTbodyEl = byId("clientes-tbody");
const produtosTbodyEl = byId("produtos-tbody");
const clientesStatusEl = byId("clientes-status");
const produtosStatusEl = byId("produtos-status");

function updateVendaCadastroInfo() {
  if (!clientesCadastro.length) {
    vendaClientesInfoEl.textContent =
      "Nenhum cliente cadastrado/importado. As colunas de cliente serao geradas em branco.";
    if (precoClientesInfoEl) {
      precoClientesInfoEl.textContent =
        "Nenhum cliente cadastrado/importado. As colunas de cliente serao geradas em branco.";
    }
  } else {
    vendaClientesInfoEl.textContent =
      `${clientesCadastro.length} cliente(s) cadastrado(s). ` +
      "Rota/ID/Nome serao preenchidos automaticamente na venda.";
    if (precoClientesInfoEl) {
      precoClientesInfoEl.textContent =
        `${clientesCadastro.length} cliente(s) cadastrado(s). ` +
        "Rota/ID/Nome serao preenchidos automaticamente na planilha de preco.";
    }
  }

  if (!produtosCadastro.length) {
    vendaProdutosInfoEl.textContent =
      "Nenhum produto cadastrado/importado. As linhas de produto serao geradas em branco.";
    if (precoProdutosInfoEl) {
      precoProdutosInfoEl.textContent =
        "Nenhum produto cadastrado/importado. As linhas de produto serao geradas em branco.";
    }
  } else {
    vendaProdutosInfoEl.textContent =
      `${produtosCadastro.length} produto(s) cadastrado(s). ` +
      "ID/Nome serao preenchidos automaticamente na venda.";
    if (precoProdutosInfoEl) {
      precoProdutosInfoEl.textContent =
        `${produtosCadastro.length} produto(s) cadastrado(s). ` +
        "ID/Nome serao preenchidos automaticamente na planilha de preco.";
    }
  }
}

function renderClientesTable() {
  clientesTbodyEl.innerHTML = "";

  if (!clientesCadastro.length) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 4;
    emptyCell.className = "table-empty";
    emptyCell.textContent = "Nenhum cliente cadastrado.";
    emptyRow.appendChild(emptyCell);
    clientesTbodyEl.appendChild(emptyRow);
    return;
  }

  clientesCadastro.forEach((cliente, index) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = cliente.idCliente;
    row.appendChild(idCell);

    const nomeCell = document.createElement("td");
    nomeCell.textContent = cliente.nomeCliente;
    row.appendChild(nomeCell);

    const rotaCell = document.createElement("td");
    rotaCell.textContent = cliente.idRota;
    row.appendChild(rotaCell);

    const actionCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "mini-btn";
    removeButton.textContent = "Excluir";
    removeButton.dataset.removeClienteIndex = String(index);
    actionCell.appendChild(removeButton);
    row.appendChild(actionCell);

    clientesTbodyEl.appendChild(row);
  });
}

function renderProdutosTable() {
  produtosTbodyEl.innerHTML = "";

  if (!produtosCadastro.length) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 3;
    emptyCell.className = "table-empty";
    emptyCell.textContent = "Nenhum produto cadastrado.";
    emptyRow.appendChild(emptyCell);
    produtosTbodyEl.appendChild(emptyRow);
    return;
  }

  produtosCadastro.forEach((produto, index) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = produto.idProduto;
    row.appendChild(idCell);

    const nomeCell = document.createElement("td");
    nomeCell.textContent = produto.nomeProduto;
    row.appendChild(nomeCell);

    const actionCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "mini-btn";
    removeButton.textContent = "Excluir";
    removeButton.dataset.removeProdutoIndex = String(index);
    actionCell.appendChild(removeButton);
    row.appendChild(actionCell);

    produtosTbodyEl.appendChild(row);
  });
}

async function saveClientesCadastro(message = "Cadastro de clientes salvo com sucesso.") {
  const saved = await window.api.salvarClientesCadastro(clientesCadastro);
  clientesCadastro = normalizeEntries(saved, normalizeClienteEntry);
  renderClientesTable();
  updateVendaCadastroInfo();
  setStatus(clientesStatusEl, message, false);
}

async function saveProdutosCadastro(message = "Cadastro de produtos salvo com sucesso.") {
  const saved = await window.api.salvarProdutosCadastro(produtosCadastro);
  produtosCadastro = normalizeEntries(saved, normalizeProdutoEntry);
  renderProdutosTable();
  updateVendaCadastroInfo();
  setStatus(produtosStatusEl, message, false);
}

async function loadCadastros() {
  try {
    const [clientesLoaded, produtosLoaded] = await Promise.all([
      window.api.carregarClientesCadastro(),
      window.api.carregarProdutosCadastro(),
    ]);

    clientesCadastro = normalizeEntries(clientesLoaded, normalizeClienteEntry);
    produtosCadastro = normalizeEntries(produtosLoaded, normalizeProdutoEntry);

    renderClientesTable();
    renderProdutosTable();
    updateVendaCadastroInfo();

    if (clientesCadastro.length) {
      setStatus(
        clientesStatusEl,
        `Cadastro carregado com ${clientesCadastro.length} cliente(s).`,
        false
      );
    }

    if (produtosCadastro.length) {
      setStatus(
        produtosStatusEl,
        `Cadastro carregado com ${produtosCadastro.length} produto(s).`,
        false
      );
    }
  } catch (error) {
    setStatus(clientesStatusEl, `Erro ao carregar cadastro: ${error?.message || error}`, true);
    setStatus(produtosStatusEl, `Erro ao carregar cadastro: ${error?.message || error}`, true);
  }
}

function clearClienteInputs() {
  byId("clientes-id").value = "";
  byId("clientes-nome").value = "";
  byId("clientes-rota").value = "";
}

function clearProdutoInputs() {
  byId("produtos-id").value = "";
  byId("produtos-nome").value = "";
}

function setupClientesPanel() {
  const idInput = byId("clientes-id");
  const nomeInput = byId("clientes-nome");
  const rotaInput = byId("clientes-rota");
  const addButton = byId("clientes-adicionar");
  const importButton = byId("clientes-importar");
  const saveButton = byId("clientes-salvar");
  const clearButton = byId("clientes-limpar");

  addButton.addEventListener("click", async () => {
    try {
      const candidate = normalizeClienteEntry({
        idCliente: idInput.value,
        nomeCliente: nomeInput.value,
        idRota: rotaInput.value,
      });

      if (!candidate) {
        setStatus(clientesStatusEl, "Preencha ao menos um campo para adicionar.", true);
        return;
      }

      clientesCadastro.push(candidate);
      await saveClientesCadastro("Cliente adicionado e cadastro salvo.");
      clearClienteInputs();
      idInput.focus();
    } catch (error) {
      setStatus(clientesStatusEl, `Erro ao adicionar cliente: ${error?.message || error}`, true);
    }
  });

  importButton.addEventListener("click", async () => {
    try {
      setStatus(clientesStatusEl, "Selecionando arquivo para importacao...", false);
      const result = await window.api.importarClientesCadastro();

      if (result?.canceled) {
        setStatus(clientesStatusEl, "Importacao cancelada.", false);
        return;
      }

      clientesCadastro = normalizeEntries(result?.entries, normalizeClienteEntry);
      renderClientesTable();
      updateVendaCadastroInfo();
      setStatus(
        clientesStatusEl,
        `Importacao concluida: ${clientesCadastro.length} cliente(s) de ${result.filePath}`,
        false
      );
    } catch (error) {
      setStatus(clientesStatusEl, `Erro na importacao: ${error?.message || error}`, true);
    }
  });

  saveButton.addEventListener("click", async () => {
    try {
      await saveClientesCadastro();
    } catch (error) {
      setStatus(clientesStatusEl, `Erro ao salvar cadastro: ${error?.message || error}`, true);
    }
  });

  clearButton.addEventListener("click", async () => {
    try {
      clientesCadastro = [];
      await saveClientesCadastro("Cadastro de clientes limpo.");
      clearClienteInputs();
    } catch (error) {
      setStatus(clientesStatusEl, `Erro ao limpar cadastro: ${error?.message || error}`, true);
    }
  });

  clientesTbodyEl.addEventListener("click", async (event) => {
    const removeButton = event.target.closest("button[data-remove-cliente-index]");
    if (!removeButton) return;

    try {
      const index = Number(removeButton.dataset.removeClienteIndex);
      if (!Number.isFinite(index)) return;

      clientesCadastro.splice(index, 1);
      await saveClientesCadastro("Cliente removido e cadastro salvo.");
    } catch (error) {
      setStatus(clientesStatusEl, `Erro ao remover cliente: ${error?.message || error}`, true);
    }
  });
}

function setupProdutosPanel() {
  const idInput = byId("produtos-id");
  const nomeInput = byId("produtos-nome");
  const addButton = byId("produtos-adicionar");
  const importButton = byId("produtos-importar");
  const saveButton = byId("produtos-salvar");
  const clearButton = byId("produtos-limpar");

  addButton.addEventListener("click", async () => {
    try {
      const candidate = normalizeProdutoEntry({
        idProduto: idInput.value,
        nomeProduto: nomeInput.value,
      });

      if (!candidate) {
        setStatus(produtosStatusEl, "Preencha ao menos um campo para adicionar.", true);
        return;
      }

      produtosCadastro.push(candidate);
      await saveProdutosCadastro("Produto adicionado e cadastro salvo.");
      clearProdutoInputs();
      idInput.focus();
    } catch (error) {
      setStatus(produtosStatusEl, `Erro ao adicionar produto: ${error?.message || error}`, true);
    }
  });

  importButton.addEventListener("click", async () => {
    try {
      setStatus(produtosStatusEl, "Selecionando arquivo para importacao...", false);
      const result = await window.api.importarProdutosCadastro();

      if (result?.canceled) {
        setStatus(produtosStatusEl, "Importacao cancelada.", false);
        return;
      }

      produtosCadastro = normalizeEntries(result?.entries, normalizeProdutoEntry);
      renderProdutosTable();
      updateVendaCadastroInfo();
      setStatus(
        produtosStatusEl,
        `Importacao concluida: ${produtosCadastro.length} produto(s) de ${result.filePath}`,
        false
      );
    } catch (error) {
      setStatus(produtosStatusEl, `Erro na importacao: ${error?.message || error}`, true);
    }
  });

  saveButton.addEventListener("click", async () => {
    try {
      await saveProdutosCadastro();
    } catch (error) {
      setStatus(produtosStatusEl, `Erro ao salvar cadastro: ${error?.message || error}`, true);
    }
  });

  clearButton.addEventListener("click", async () => {
    try {
      produtosCadastro = [];
      await saveProdutosCadastro("Cadastro de produtos limpo.");
      clearProdutoInputs();
    } catch (error) {
      setStatus(produtosStatusEl, `Erro ao limpar cadastro: ${error?.message || error}`, true);
    }
  });

  produtosTbodyEl.addEventListener("click", async (event) => {
    const removeButton = event.target.closest("button[data-remove-produto-index]");
    if (!removeButton) return;

    try {
      const index = Number(removeButton.dataset.removeProdutoIndex);
      if (!Number.isFinite(index)) return;

      produtosCadastro.splice(index, 1);
      await saveProdutosCadastro("Produto removido e cadastro salvo.");
    } catch (error) {
      setStatus(produtosStatusEl, `Erro ao remover produto: ${error?.message || error}`, true);
    }
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.tab);
  });
});

setupGenerator({
  prefix: "venda",
  generatingText: "Gerando planilha de venda...",
  generate: (payload) => window.api.gerarPlanilhaVenda(payload),
  buildPayload: () => ({
    maxClientes: Number(byId("venda-clientes").value || 12),
    maxProdutos: Number(byId("venda-produtos").value || 30),
    fileName: byId("venda-nome").value,
    clientesData: clientesCadastro,
    produtosData: produtosCadastro,
  }),
});

setupGenerator({
  prefix: "preco",
  generatingText: "Gerando planilha de preco...",
  generate: (payload) => window.api.gerarPlanilhaPreco(payload),
  buildPayload: () => ({
    maxTabelas: Number(byId("preco-tabelas").value || 6),
    maxProdutos: Number(byId("preco-produtos").value || 30),
    fileName: byId("preco-nome").value,
    clientesData: clientesCadastro,
    produtosData: produtosCadastro,
  }),
});

setupGenerator({
  prefix: "compra",
  generatingText: "Gerando planilha de compra...",
  generate: (payload) => window.api.gerarPlanilhaCompra(payload),
  buildPayload: () => ({
    maxLinhas: Number(byId("compra-linhas").value || 30),
    fileName: byId("compra-nome").value,
  }),
});

setupClientesPanel();
setupProdutosPanel();
loadCadastros();
