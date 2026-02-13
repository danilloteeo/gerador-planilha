const fs = require("fs");
const os = require("os");
const path = require("path");

const ZERO_MARGINS = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  header: 0,
  footer: 0,
};

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function normalizeFileName(rawFileName, defaultPrefix) {
  const fallback = `${defaultPrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const trimmed = rawFileName ? String(rawFileName).trim() : "";
  if (!trimmed) return fallback;

  const safeName = trimmed.replace(/[\\/:*?"<>|]/g, "_");
  if (/\.xlsx$/i.test(safeName)) return safeName;
  if (/\.xls$/i.test(safeName)) return safeName.replace(/\.xls$/i, ".xlsx");
  return `${safeName}.xlsx`;
}

function resolveOutputTarget(rawFileName, defaultPrefix) {
  const fileName = normalizeFileName(rawFileName, defaultPrefix);
  const outDir = path.join(os.homedir(), "Documents", "PlanilhasImportacao");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, fileName);

  return { fileName, outDir, outPath };
}

function toExcelColumnName(columnIndex) {
  let index = columnIndex;
  let result = "";

  while (index > 0) {
    const remainder = (index - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    index = Math.floor((index - 1) / 26);
  }

  return result;
}

function createThinBorder() {
  return {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

function applyBorders(worksheet, maxRow, maxColumn) {
  for (let row = 1; row <= maxRow; row += 1) {
    for (let col = 1; col <= maxColumn; col += 1) {
      worksheet.getCell(row, col).border = createThinBorder();
    }
  }
}

function applyPageSetup(worksheet, { maxRow, maxColumn, footerText, printTitlesRow = "1:3" }) {
  const lastColumnName = toExcelColumnName(maxColumn);
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: ZERO_MARGINS,
    printArea: `A1:${lastColumnName}${maxRow}`,
    printTitlesRow,
  };

  worksheet.headerFooter.oddFooter = `&L${footerText}`;
}

module.exports = {
  applyBorders,
  applyPageSetup,
  parsePositiveInt,
  resolveOutputTarget,
};
