## Gerador de Planilhas para Importação

Este projeto é um aplicativo desktop construído com **Electron** para auxiliar na geração de planilhas de importação (formato Excel) a partir de cadastros de **clientes** e **produtos**.

O foco é facilitar a criação de arquivos prontos para importar em outros sistemas, com layout padronizado e preparado para impressão.

---

### Principais funcionalidades

- **Geração de planilhas**
  - **Planilha de venda** (`gerar-planilha-venda`)
  - **Planilha de preços** (`gerar-planilha-preco`)
  - **Planilha de compras** (`gerar-planilha-compra`)
  - Os arquivos são salvos na pasta `Documents/PlanilhasImportacao` do usuário, com nome normalizado automaticamente.

- **Cadastro de clientes**
  - Carregamento e salvamento do cadastro em área de dados do próprio aplicativo.
  - Importação de clientes a partir de arquivos **CSV**, **XLS** ou **XLSX**.

- **Cadastro de produtos**
  - Carregamento e salvamento do cadastro em área de dados do próprio aplicativo.
  - Importação de produtos a partir de arquivos **CSV**, **XLS** ou **XLSX**.

- **Geração de layout ajustado para impressão**
  - Ajuste automático de margens e área de impressão.
  - Definição de área de impressão e linhas de título fixas.
  - Aplicação de bordas finas em todas as células da região de dados.

---

### Arquitetura geral

- **`main.js`**
  - Processo principal do Electron.
  - Cria a janela (`BrowserWindow`) e carrega a interface (`index.html`).
  - Registra os handlers IPC (`ipcMain.handle`) responsáveis por:
    - Geração de planilhas (venda, preço, compra).
    - Abertura do caminho do arquivo gerado.
    - Carregar/salvar/importar cadastros de clientes e produtos.

- **`preload.js`**
  - Faz a ponte segura entre o frontend (renderer) e o processo principal.
  - Expõe, via `contextIsolation`, as funções que a interface usa para chamar:
    - Geração de planilhas.
    - Operações sobre clientes e produtos.

- **Pasta `sheets/`**
  - Contém os módulos responsáveis pela geração efetiva das planilhas:
    - `venda.js`
    - `preco.js`
    - `compra.js`
    - `common.js` com utilitários compartilhados:
      - Normalização de nomes de arquivos.
      - Cálculo de pasta de saída.
      - Conversão de número de coluna para letra do Excel.
      - Configuração de margens, área de impressão e rodapé.
      - Aplicação de bordas em um intervalo de células.

- **Pasta `data/`**
  - Módulos que lidam com armazenamento e importação dos cadastros:
    - `clientes-store.js`
    - `produtos-store.js`
  - Usam o caminho de dados do aplicativo (`app.getPath("userData")`) para persistir as informações localmente.

---

### Fluxo de uso do aplicativo

1. **Abrir o aplicativo**
   - Ao iniciar, o Electron cria a janela principal e carrega a interface.

2. **Configurar cadastros**
   - Importar ou editar o cadastro de clientes.
   - Importar ou editar o cadastro de produtos.

3. **Escolher o tipo de planilha**
   - Selecionar se deseja gerar planilha de venda, de preço ou de compra.
   - Informar parâmetros necessários (ex.: nome do arquivo, filtros, etc. – conforme a interface).

4. **Gerar planilha**
   - A interface envia um pedido via IPC para o processo principal.
   - O módulo correspondente em `sheets/` monta a planilha e salva em `Documents/PlanilhasImportacao`.

5. **Abrir o arquivo gerado**
   - A interface pode chamar a ação de “abrir caminho” para abrir a pasta/arquivo no sistema operacional.

---

### Requisitos e execução em desenvolvimento

- **Pré-requisitos**
  - Node.js instalado.

- **Passos básicos (exemplo)**

```bash
npm install
npm start
```

> Os scripts exatos podem variar conforme o conteúdo do `package.json`. Ajuste conforme sua configuração.

---

### Estrutura resumida do projeto

- `main.js` – processo principal do Electron e registro dos IPCs.
- `preload.js` – ponte segura entre frontend e Electron.
- `index.html` / arquivos de interface – camada visual do app.
- `sheets/` – geração e formatação das planilhas.
- `data/` – gerenciamento de cadastros de clientes e produtos.
- `icon.ico` – ícone do aplicativo.

---

### Licença

Defina aqui a licença do projeto (por exemplo, MIT, GPL, uso interno, etc.).

