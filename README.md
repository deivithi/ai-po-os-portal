# AI PO OS Portal

Repositorio de deploy do portal estatico `AI Operating System do PO Salesforce`.

## Publicacao

- Hosting: GitHub Pages
- Deploy automatico: GitHub Pages via GitHub Actions
- Publicacao principal: workflow `Deploy GitHub Pages`
- Refresh agendado do radar: workflow `Refresh Radar Vivo`
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
- O deploy acontece automaticamente a cada push na branch `main` pelo workflow dedicado do Pages.
- O workflow `Refresh Radar Vivo` roda manualmente e por agenda, gera `data/radar_health.json`, faz commit se houver diferenca e publica o portal na mesma execucao.
- A rota `prompts/` agora inclui fundamentos, biblioteca, builder orientado por contexto e overlays por fornecedor.
