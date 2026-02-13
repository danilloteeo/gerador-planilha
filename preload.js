const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  gerarPlanilhaVenda: (payload) => ipcRenderer.invoke("gerar-planilha-venda", payload),
  gerarPlanilhaPreco: (payload) => ipcRenderer.invoke("gerar-planilha-preco", payload),
  gerarPlanilhaCompra: (payload) => ipcRenderer.invoke("gerar-planilha-compra", payload),
  abrirCaminho: (fullPath) => ipcRenderer.invoke("abrir-caminho", fullPath),
  carregarClientesCadastro: () => ipcRenderer.invoke("clientes-carregar"),
  salvarClientesCadastro: (entries) => ipcRenderer.invoke("clientes-salvar", entries),
  importarClientesCadastro: () => ipcRenderer.invoke("clientes-importar-arquivo"),
  carregarProdutosCadastro: () => ipcRenderer.invoke("produtos-carregar"),
  salvarProdutosCadastro: (entries) => ipcRenderer.invoke("produtos-salvar", entries),
  importarProdutosCadastro: () => ipcRenderer.invoke("produtos-importar-arquivo"),
});
