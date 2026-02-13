const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const STORE_FILE_NAME = "produtos-cadastro.json";

function getStoreFilePath(userDataPath) {
  return path.join(userDataPath, STORE_FILE_NAME);
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeEntry(entry) {
  const normalized = {
    idProduto: normalizeText(entry?.idProduto),
    nomeProduto: normalizeText(entry?.nomeProduto),
  };

  if (!normalized.idProduto && !normalized.nomeProduto) {
    return null;
  }

  return normalized;
}

function normalizeEntries(entries) {
  if (!Array.isArray(entries)) return [];

  const output = [];
  for (const entry of entries) {
    const normalized = normalizeEntry(entry);
    if (normalized) output.push(normalized);
  }

  return output;
}

function removeDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isHeaderRow(rowA, rowB) {
  const headerText = removeDiacritics(`${rowA} ${rowB}`.toLowerCase());
  return (
    headerText.includes("produto") ||
    headerText.includes("id produto") ||
    (headerText.includes("id") && headerText.includes("nome"))
  );
}

function parseRowsToProdutos(rows) {
  const output = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || [];
    const idProduto = normalizeText(row[0]);
    const nomeProduto = normalizeText(row[1]);

    if (index === 0 && isHeaderRow(idProduto, nomeProduto)) continue;
    if (!idProduto && !nomeProduto) continue;

    output.push({ idProduto, nomeProduto });
  }

  return normalizeEntries(output);
}

function loadProdutosCadastro(userDataPath) {
  const filePath = getStoreFilePath(userDataPath);
  if (!fs.existsSync(filePath)) return [];

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content);
    return normalizeEntries(parsed);
  } catch {
    return [];
  }
}

function saveProdutosCadastro(userDataPath, entries) {
  const filePath = getStoreFilePath(userDataPath);
  const normalized = normalizeEntries(entries);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), "utf8");

  return normalized;
}

function importProdutosFromFile(filePath) {
  const workbook = XLSX.readFile(filePath, { raw: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  return parseRowsToProdutos(rows);
}

module.exports = {
  importProdutosFromFile,
  loadProdutosCadastro,
  saveProdutosCadastro,
};
