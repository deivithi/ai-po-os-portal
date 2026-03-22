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
- `data/prompt_builder.json`: contrato do builder orientado por contexto do Prompt Studio
- `data/prompt_provider_overlays.json`: contrato dos overlays por fornecedor do Prompt Studio

## Observacoes

- O portal foi ajustado para funcionar tanto em dominio raiz quanto em subpath de repositorio no GitHub Pages.
- O deploy acontece automaticamente a cada push na branch `main`.
- A rota `prompts/` agora inclui fundamentos, biblioteca, builder orientado por contexto e overlays por fornecedor.
