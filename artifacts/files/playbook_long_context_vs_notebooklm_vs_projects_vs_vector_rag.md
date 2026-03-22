# Playbook — Long Context vs NotebookLM vs Projects vs Vector RAG

## Regra de decisão rápida

- **Long context**: poucos documentos, análise pontual, baixa necessidade de reuso.
- **NotebookLM**: pesquisa assistida, síntese, estudo e exploração com fontes explícitas.
- **Projects**: memória contextual persistente por projeto, sem pipeline próprio de RAG.
- **Vector RAG**: produção auditável, reuso por múltiplos workflows e controle de chunking.

## Como decidir

1. Se o problema é entender e aprender rápido a partir de fontes, comece em NotebookLM.
2. Se o contexto é recorrente, mas ainda cabe dentro do workspace do modelo, use Projects.
3. Se a mesma base precisa alimentar agentes, dashboards e automações, migre para vector RAG.
4. Se a análise é pontual e todo o material cabe na janela do modelo, long context é suficiente.

## Antipadrões

- Jogar toda a base histórica em uma única conversa.
- Misturar pesquisa exploratória com automação operacional crítica.
- Executar ação irreversível sem log, evidência e aprovação humana.

## Fontes oficiais

- Anthropic Prompt Engineering: https://docs.anthropic.com/en/docs/prompt-engineering
- Google Long Context: https://ai.google.dev/gemini-api/docs/long-context
- Google Grounding: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/grounding
- NotebookLM Help: https://support.google.com/notebooklm/answer/15441916
- MCP Architecture: https://modelcontextprotocol.io/docs/concepts/architecture
