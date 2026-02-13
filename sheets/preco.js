const ExcelJS = require("exceljs");
const {
  applyBorders,
  applyPageSetup,
  parsePositiveInt,
  resolveOutputTarget,
} = require("./common");

const NARROW_COLUMN_WIDTH = 5.5;
const PRODUCT_NAME_COLUMN_WIDTH = 22;

const CLIENT_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF4CCCC" },
};

const PRODUCT_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF2CC" },
};

function normalizeClienteEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const output = [];
  for (const entry of entries) {
    const normalized = {
      idCliente: entry?.idCliente ? String(entry.idCliente).trim() : "",
      nomeCliente: entry?.nomeCliente ? String(entry.nomeCliente).trim() : "",
      idRota: entry?.idRota ? String(entry.idRota).trim() : "",
    };

    if (normalized.idCliente || normalized.nomeCliente || normalized.idRota) {
      output.push(normalized);
    }
  }

  return output;
}

function normalizeProdutoEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const output = [];
  for (const entry of entries) {
    const normalized = {
      idProduto: entry?.idProduto ? String(entry.idProduto).trim() : "",
      nomeProduto: entry?.nomeProduto ? String(entry.nomeProduto).trim() : "",
    };

    if (normalized.idProduto || normalized.nomeProduto) {
      output.push(normalized);
    }
  }

  return output;
}

async function generatePlanilhaPreco(payload = {}) {
  const clientesData = normalizeClienteEntries(payload.clientesData);
  const produtosData = normalizeProdutoEntries(payload.produtosData);
  const requestedMaxClientes = parsePositiveInt(payload.maxClientes ?? payload.maxTabelas, 12);
  const requestedMaxProdutos = parsePositiveInt(payload.maxProdutos, 30);
  const maxClientes = Math.max(requestedMaxClientes, clientesData.length);
  const maxProdutos = Math.max(requestedMaxProdutos, produtosData.length);
  const { outDir, outPath } = resolveOutputTarget(payload.fileName, "Importacao_Preco");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Preco");

  worksheet.getCell("A1").value = "PRECO";

  worksheet.getColumn("A").width = 4;
  worksheet.getColumn("B").width = NARROW_COLUMN_WIDTH;
  worksheet.getColumn("C").width = PRODUCT_NAME_COLUMN_WIDTH;
  for (let i = 0; i < maxClientes; i += 1) {
    worksheet.getColumn(4 + i).width = NARROW_COLUMN_WIDTH;
  }

  worksheet.views = [{ state: "frozen", xSplit: 3, ySplit: 3 }];

  for (let row = 4; row < 4 + maxProdutos; row += 1) {
    const dataIndex = row - 4;
    const produto = produtosData[dataIndex] || null;
    const productIdCell = worksheet.getCell(row, 2);
    const productNameCell = worksheet.getCell(row, 3);

    productIdCell.value = produto ? produto.idProduto : null;
    productNameCell.value = produto ? produto.nomeProduto : null;
    productIdCell.numFmt = "@";
    productIdCell.fill = PRODUCT_FILL;
    productNameCell.fill = PRODUCT_FILL;
  }

  for (let col = 4; col < 4 + maxClientes; col += 1) {
    const dataIndex = col - 4;
    const cliente = clientesData[dataIndex] || null;
    const routeCell = worksheet.getCell(1, col);
    const clientIdCell = worksheet.getCell(2, col);
    const clientNameCell = worksheet.getCell(3, col);

    routeCell.value = cliente ? cliente.idRota : null;
    clientIdCell.value = cliente ? cliente.idCliente : null;
    clientNameCell.value = cliente ? cliente.nomeCliente : null;
    routeCell.numFmt = "@";
    clientIdCell.numFmt = "@";

    routeCell.fill = CLIENT_FILL;
    clientIdCell.fill = CLIENT_FILL;
    clientNameCell.fill = CLIENT_FILL;
    clientNameCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      textRotation: 90,
      wrapText: true,
    };
  }

  worksheet.getRow(3).height = 86;

  const maxColumn = 3 + maxClientes;
  const maxRow = 3 + maxProdutos;

  applyBorders(worksheet, maxRow, maxColumn);
  applyPageSetup(worksheet, {
    maxRow,
    maxColumn,
    footerText: `Clientes selecionados: ${maxClientes}`,
  });

  await workbook.xlsx.writeFile(outPath);

  return { outPath, outDir };
}

module.exports = { generatePlanilhaPreco };
