const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const { generatePlanilhaVenda } = require("./sheets/venda");
const { generatePlanilhaPreco } = require("./sheets/preco");
const { generatePlanilhaCompra } = require("./sheets/compra");
const {
  importClientesFromFile,
  loadClientesCadastro,
  saveClientesCadastro,
} = require("./data/clientes-store");
const {
  importProdutosFromFile,
  loadProdutosCadastro,
  saveProdutosCadastro,
} = require("./data/produtos-store");

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 820,
    minHeight: 620,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

function registerIpcHandlers() {
  const userDataPath = app.getPath("userData");

  ipcMain.handle("gerar-planilha-venda", async (_event, payload) => {
    return generatePlanilhaVenda(payload);
  });

  ipcMain.handle("gerar-planilha-preco", async (_event, payload) => {
    return generatePlanilhaPreco(payload);
  });

  ipcMain.handle("gerar-planilha-compra", async (_event, payload) => {
    return generatePlanilhaCompra(payload);
  });

  ipcMain.handle("abrir-caminho", async (_event, fullPath) => {
    await shell.openPath(fullPath);
    return true;
  });

  ipcMain.handle("clientes-carregar", async () => {
    return loadClientesCadastro(userDataPath);
  });

  ipcMain.handle("clientes-salvar", async (_event, entries) => {
    return saveClientesCadastro(userDataPath, entries);
  });

  ipcMain.handle("clientes-importar-arquivo", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Planilhas e CSV", extensions: ["csv", "xls", "xlsx"] },
        { name: "Todos os arquivos", extensions: ["*"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, filePath: "", entries: [] };
    }

    const filePath = result.filePaths[0];
    const importedEntries = importClientesFromFile(filePath);
    const savedEntries = saveClientesCadastro(userDataPath, importedEntries);

    return { canceled: false, filePath, entries: savedEntries };
  });

  ipcMain.handle("produtos-carregar", async () => {
    return loadProdutosCadastro(userDataPath);
  });

  ipcMain.handle("produtos-salvar", async (_event, entries) => {
    return saveProdutosCadastro(userDataPath, entries);
  });

  ipcMain.handle("produtos-importar-arquivo", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Planilhas e CSV", extensions: ["csv", "xls", "xlsx"] },
        { name: "Todos os arquivos", extensions: ["*"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, filePath: "", entries: [] };
    }

    const filePath = result.filePaths[0];
    const importedEntries = importProdutosFromFile(filePath);
    const savedEntries = saveProdutosCadastro(userDataPath, importedEntries);

    return { canceled: false, filePath, entries: savedEntries };
  });
}

app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
