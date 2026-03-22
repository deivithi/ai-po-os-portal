# AI PO OS Portal

Repositorio de deploy do portal estatico `AI Operating System do PO Salesforce`.

## Publicacao

- Hosting: GitHub Pages
- Deploy automatico: GitHub Pages a partir da branch `main`
- Raiz publicada: `.`

## Estrutura

- `index.html`: Home do portal
- `assets/`: CSS e JavaScript compartilhados
- `data/`: contratos JSON consumidos pelo portal
- `artifacts/`: artefatos web-safe publicados
- `jornada/`, `prompts/`, `matriz/`, `workflows/`, `rag/`, `roadmap/`, `artefatos/`: rotas do portal

## Observacoes

- O portal foi ajustado para funcionar tanto em dominio raiz quanto em subpath de repositorio no GitHub Pages.
- O deploy acontece automaticamente a cada push na branch `main`.
