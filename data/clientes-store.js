const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const STORE_FILE_NAME = "clientes-cadastro.json";

function getStoreFilePath(userDataPath) {
  return path.join(userDataPath, STORE_FILE_NAME);
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeEntry(entry) {
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

function isHeaderRow(rowA, rowB, rowC) {
  const headerText = removeDiacritics(`${rowA} ${rowB} ${rowC}`.toLowerCase());
  return (
    headerText.includes("cliente") ||
    headerText.includes("id cliente") ||
    headerText.includes("id rota") ||
    (headerText.includes("nome") && headerText.includes("rota"))
  );
}

function parseRowsToClientes(rows) {
  const output = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || [];
    const idCliente = normalizeText(row[0]);
    const nomeCliente = normalizeText(row[1]);
    const idRota = normalizeText(row[2]);

    if (index === 0 && isHeaderRow(idCliente, nomeCliente, idRota)) continue;
    if (!idCliente && !nomeCliente && !idRota) continue;

    output.push({ idCliente, nomeCliente, idRota });
  }

  return normalizeEntries(output);
}

function loadClientesCadastro(userDataPath) {
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

function saveClientesCadastro(userDataPath, entries) {
  const filePath = getStoreFilePath(userDataPath);
  const normalized = normalizeEntries(entries);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), "utf8");

  return normalized;
}

function importClientesFromFile(filePath) {
  const workbook = XLSX.readFile(filePath, { raw: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  return parseRowsToClientes(rows);
}

module.exports = {
  importClientesFromFile,
  loadClientesCadastro,
  saveClientesCadastro,
};
