# AI PO OS Portal

Repositorio de deploy do portal estatico `AI Operating System do PO Salesforce`.

## Publicacao

- Hosting: GitHub Pages
- Deploy automatico: GitHub Pages via GitHub Actions
- Publicacao principal: workflow `Deploy GitHub Pages`
- Refresh agendado do radar: workflow `Refresh Radar Vivo`
- Raiz publicada: `.`
- Runtime hardening: checkout, setup e upload em actions `node24`, com deploy do Pages feito via API oficial em `scripts/deploy_pages.py`

## Estrutura

- `index.html`: Home do portal
- `assets/`: CSS e JavaScript compartilhados
- `data/`: contratos JSON consumidos pelo portal
- `artifacts/`: artefatos web-safe publicados
- `entrar/`, `jornada/`, `trilha/`, `progresso/`, `prompts/`, `matriz/`, `workflows/`, `rag/`, `roadmap/`, `artefatos/`: rotas do portal
- `data/prompt_builder.json`: contrato do builder orientado por contexto do Prompt Studio
- `data/prompt_provider_overlays.json`: contrato dos overlays por fornecedor do Prompt Studio
- `data/study_units.json`, `data/learning_path_templates.json`, `data/adaptive_path_rules.json`, `data/trilha_page.json`: contratos da Trilha Adaptativa
- `data/enter_page.json` e `data/auth_provider.json`: camada de identidade persistente por e-mail neste navegador

## Observacoes

- O portal foi ajustado para funcionar tanto em dominio raiz quanto em subpath de repositorio no GitHub Pages.
- O deploy acontece automaticamente a cada push na branch `main` pelo workflow dedicado do Pages.
- O workflow `Refresh Radar Vivo` roda manualmente e por agenda, gera `data/radar_health.json`, faz commit se houver diferenca e publica o portal na mesma execucao.
- O deploy do Pages nao depende mais de `actions/configure-pages`, `actions/upload-pages-artifact` ou `actions/deploy-pages`, o que elimina a dependencia direta de actions ainda presas em `node20`.
- A rota `prompts/` agora inclui fundamentos, biblioteca, builder orientado por contexto e overlays por fornecedor.
- A rota `trilha/` agora gera um plano de estudo personalizado por horas por dia, dias por semana, foco, nivel e objetivo, persistindo a configuracao localmente.
- A rota `progresso/` agora fecha o loop da Trilha com status por unidade, checkpoints e replanejamento do restante.
- A rota `entrar/` agora liga a jornada a uma identidade local por e-mail, mantendo o portal pronto para subir depois para auth real e sync em nuvem.
