const ExcelJS = require("exceljs");
const {
  applyBorders,
  applyPageSetup,
  parsePositiveInt,
  resolveOutputTarget,
} = require("./common");

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE6D9F7" },
};

const HEADER_LABELS = ["ID FORN", "FORNECEDOR", "ID PROD", "PRODUTO", "QTD", "PRECO"];
const COLUMN_WIDTHS = [12, 28, 12, 28, 8, 12];

async function generatePlanilhaCompra(payload = {}) {
  const maxLinhas = parsePositiveInt(payload.maxLinhas ?? payload.maxProdutos, 30);
  const { outDir, outPath } = resolveOutputTarget(payload.fileName, "Importacao_Compra");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Compra");

  worksheet.getCell("A1").value = "COMPRA";
  worksheet.getCell("A1").font = { bold: true, size: 12 };

  for (let i = 0; i < COLUMN_WIDTHS.length; i += 1) {
    worksheet.getColumn(1 + i).width = COLUMN_WIDTHS[i];
  }

  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];

  for (let i = 0; i < HEADER_LABELS.length; i += 1) {
    const headerCell = worksheet.getCell(2, 1 + i);
    headerCell.value = HEADER_LABELS[i];
    headerCell.font = { bold: true };
    headerCell.alignment = { horizontal: "center", vertical: "middle" };
    headerCell.fill = HEADER_FILL;
  }

  for (let row = 3; row < 3 + maxLinhas; row += 1) {
    worksheet.getCell(row, 1).numFmt = "@";
    worksheet.getCell(row, 2).numFmt = "@";
    worksheet.getCell(row, 3).numFmt = "@";
    worksheet.getCell(row, 4).numFmt = "@";
    worksheet.getCell(row, 5).numFmt = "0";
    worksheet.getCell(row, 6).numFmt = "0.00";
  }

  const maxColumn = 6;
  const maxRow = 2 + maxLinhas;

  applyBorders(worksheet, maxRow, maxColumn);
  applyPageSetup(worksheet, {
    maxRow,
    maxColumn,
    footerText: `Registros de compra: ${maxLinhas}`,
    printTitlesRow: "1:2",
  });

  await workbook.xlsx.writeFile(outPath);

  return { outPath, outDir };
}

module.exports = { generatePlanilhaCompra };
