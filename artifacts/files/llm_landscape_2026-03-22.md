# Radar de LLMs - 2026-03-22

Este artefato e uma curadoria de estudo.

Ele **nao substitui** a matriz operacional do projeto. O objetivo aqui e acompanhar o mercado e registrar quais familias de modelos merecem observacao, teste e eventualmente entrada no harness do portal.

## Modelos e familias para acompanhar

### OpenAI - GPT-5 family

- A documentacao oficial da API destaca `Latest: GPT-5.4` na navegacao de modelos.
- A lista atual de modelos mostra `GPT-5.4`, `GPT-5.4 pro`, `GPT-5.4 mini` e `GPT-5.4 nano`, enquanto `GPT-5.1` e `GPT-5.2` aparecem como geracoes anteriores.
- Leitura pratica: acompanhar a familia GPT-5 como referencia fechada para uso geral, agents, Codex e workflows de producao, com `GPT-5.4` como foco principal de estudo.

Fonte oficial:
- https://developers.openai.com/api/docs/models

### Anthropic - Claude 4.6

- A Anthropic recomenda `Claude Opus 4.6` para tarefas mais complexas.
- `Claude Sonnet 4.6` aparece como melhor equilibrio entre velocidade e inteligencia.

Fonte oficial:
- https://docs.anthropic.com/en/docs/about-claude/models/all-models

### Google - Gemini 3.1 / 3 / 2.5

- O Vertex AI coloca `Gemini 3.1 Pro` como leitura atual de reasoning-first e `Gemini 3 Pro` como linha avancada para agentic, multimodalidade e long context.
- Leitura pratica: linha forte para multimodalidade, ecossistema Google, grounding e integracao com Vertex.

Fonte oficial:
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro

### Google - Gemma 3n / Gemma 3

- `Gemma 3n` virou leitura central para edge/on-device e dispositivos do dia a dia, com audio, texto e visao.
- Leitura pratica: estudar `Gemma 3n` para open weights em dispositivos e manter `Gemma 3` como referencia open multimodal.

Fonte oficial:
- https://ai.google.dev/gemma/docs/gemma-3n
- https://ai.google.dev/gemma/docs/core

### xAI - Grok 4.20

- A xAI descreve `Grok 4.20` como o modelo flagship mais novo.
- A pagina oficial destaca janela de contexto de `2,000,000`, reasoning, structured outputs e tool calling.

Fonte oficial:
- https://docs.x.ai/docs/models

### Alibaba - Qwen3 family

- Alibaba apresenta Qwen3 como a nova geracao open-source da familia.
- O anuncio oficial fala em hybrid reasoning, MCP, tool use e resultados top-tier em benchmarks como AIME25, LiveCodeBench, BFCL e Arena-Hard.

Fonte oficial:
- https://www.alibabacloud.com/blog/alibaba-introduces-qwen3-setting-new-benchmark-in-open-source-ai-with-hybrid-reasoning_602192

### DeepSeek - DeepSeek-V3.2

- A DeepSeek posiciona `DeepSeek-V3.2` como o modelo oficial atual do servico.
- O release oficial afirma nivel de topo entre modelos open source em avaliacoes de agentes e tool use.

Fonte oficial:
- https://api-docs.deepseek.com/zh-cn/news/news251201

### Kimi - Kimi K2 Thinking

- O Vertex AI lista `Kimi K2 Thinking` entre os open models disponiveis.
- Leitura pratica: manter no radar como representante importante do ecossistema chines.

Fonte oficial:
- https://cloud.google.com/vertex-ai/generative-ai/docs/models

### ZAI.org - GLM 5 / GLM 4.7

- O Vertex AI lista `GLM 5` e `GLM 4.7` entre os open models.
- Leitura pratica: familia que merece observacao continua no radar, especialmente para comparativos futuros.

Fonte oficial:
- https://cloud.google.com/vertex-ai/generative-ai/docs/models

## Regra de uso no portal

1. Radar de mercado serve para **observacao e estudo**.
2. Matriz operacional serve para **decisao dentro do sistema**.
3. Um modelo so deve entrar na matriz depois de:
   - criterio claro de comparacao
   - teste no harness
   - leitura de risco e controle
   - evidencias suficientes para o contexto do projeto
