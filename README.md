# JSON Table

Cole um JSON, explore como tabela interativa.

`json-table` transforma qualquer JSON em uma grade aninhada de tabelas que
você pode filtrar, congelar, redimensionar, ocultar, editar e exportar — sem
sair do navegador, sem subir arquivo para nenhum servidor.

## Por que existe

Ferramentas comuns para inspecionar JSON dão árvore ou texto formatado. Para
dados tabulares (arrays de objetos), isso é cansativo: muito scroll vertical,
nenhuma noção das colunas. `json-table` automaticamente detecta padrões
tabulares e renderiza como grade, mas continua mostrando árvore para o resto.

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- Sem dependências de runtime além do React (toda a UI é própria)
- CSS único (`src/index.css`), tema escuro fixo

## Setup local

```bash
npm install
npm run dev          # abre em http://localhost:5173 (ou 5174 via launch.json)
```

Scripts disponíveis:

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Serve o build de `dist/` localmente |
| `npm run lint` | ESLint sobre o projeto inteiro |

## Funcionalidades

- **Detecção automática**: arrays de objetos viram tabela colunar; arrays
  mistos viram índice/valor; objetos viram chave/valor; tudo é recursivo.
- **Busca**: a busca expande automaticamente containers que tenham hits no
  subtree, com debounce de 250 ms.
- **Filtros por coluna**: dropdown ao lado de cada cabeçalho na grade de
  registros.
- **Colunas congeladas**: clicar no cabeçalho → "Congelar até esta coluna".
  Indicador azul marca a borda do congelamento.
- **Redimensionamento manual**: arrastar a alça à direita de qualquer
  cabeçalho. Larguras são fixadas; texto ganha ellipsis.
- **Ocultar / reexibir** colunas e linhas por menu de ação.
- **Edição inline**: excluir coluna ou linha edita o JSON-origem; toast
  confirma. JSON sai sincronizado no painel da esquerda.
- **Exportações**: copiar JSON, baixar JSON, exportar CSV (apenas o nível
  tabular detectado na raiz).
- **Cap de linhas**: arrays grandes mostram 200 linhas com botão "Mostrar
  mais" — ajustável em `src/config.ts`.

## Arquitetura

Entry: `src/main.tsx` → `App.tsx`. O `App` alterna entre duas views:

- `views/HomeView.tsx` — tela inicial com textarea para colar JSON.
- `views/GridView.tsx` — workspace com editor à esquerda + grade à direita.

A grade é montada por `components/grid/`:

```
GridRoot ─ provê GridContext (search, togglePath, editValue)
   └── JsonNode (recursivo, decide variant pelo classifyNode.ts)
         ├── PrimitiveCell        ← leaf colorido por tipo
         ├── ObjectTable          ← { } chave/valor
         ├── ArrayTable           ← [ ] índice/valor
         ├── RecordsTable         ← [{...}] colunar (frozen, filters)
         └── CollapsedChip        ← container colapsado
```

Tudo passa por `TableShell` (esqueleto compartilhado: `<div className="node">`,
`<NodeHeader>`, `<table>` com `colgroup`, fallback "sem correspondências",
botão "Mostrar mais", footer).

### Hooks principais (`src/hooks/`)

| Hook | Função |
|---|---|
| `useJsonParser` | Parse com debounce; mantém última versão válida durante edição. |
| `useDebouncedValue` | Debounce genérico. |
| `useColumnResize` | Larguras por coluna; muda layout para `fixed` no primeiro drag. |
| `useShowMore` | Pagina arrays em chunks de `ROW_CAP`. |
| `useDismissOnOutside` | Fecha popups em mousedown fora / Escape / resize / scroll. |
| `useCopy` | `navigator.clipboard.writeText` + toast de confirmação. |

### Utilitários (`src/lib/`)

| Arquivo | Função |
|---|---|
| `classifyNode.ts` | Decide a variant (`object` / `array` / `records`) e descobre colunas. |
| `jsonPath.ts` | Cria/manipula paths como `$.a[0].b`. |
| `search.ts` | Walk recursivo para busca; calcula `revealPaths` para auto-expand. |
| `columnFilter.ts` | Gera opções de filtro únicas por coluna. |
| `collapse.ts` | Coleta paths para auto-colapsar containers profundos. |
| `editData.ts` | Substitui um nó (por referência) no JSON-origem. |
| `exportJson.ts` / `exportCsv.ts` | Serializadores. |
| `clipboard.ts` | Fallback de cópia para navegadores sem `navigator.clipboard`. |

### Configuração (`src/config.ts`)

```ts
DEBOUNCE_MS         // delay de re-parse (ms)
AUTO_COLLAPSE_DEPTH // profundidade a partir da qual auto-colapsa
ROW_CAP             // linhas por chunk em arrays
```

## Contribuindo

1. Faça `npm install` e abra com `npm run dev`.
2. Antes de commitar:
   ```bash
   npm run lint
   npm run build
   ```
3. Commits são em inglês, em estilo declarativo curto. Veja `git log` para
   o padrão.

## Licença

MIT — veja `LICENSE`.
