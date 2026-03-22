# Guia de Estudo: IA Aplicada para Product Owners Salesforce, RAG e Governança

Este guia sintetiza as estratégias, ferramentas e princípios fundamentais para a implementação de Inteligência Artificial em ecossistemas empresariais, com foco especial na atuação do Product Owner (PO) Salesforce e na gestão avançada de contexto e governança.

---

## 1. Conceitos Fundamentais e Arquitetura de Contexto

A eficácia de um sistema de IA não reside apenas na qualidade do prompt, mas na arquitetura de dados e no contexto fornecido ao modelo.

### Janelas de Contexto (Context Windows)
A janela de contexto funciona como a "memória de curto prazo" do modelo. 
*   **Evolução:** Modelos iniciais processavam 8.000 tokens; modelos modernos como o Gemini e o GPT-5.4 suportam de 1 milhão a 2 milhões de tokens.
*   **Capacidade Proporcional:** 1 milhão de tokens equivalem a aproximadamente 50.000 linhas de código, 8 romances de tamanho médio ou transcrições de mais de 200 episódios de podcast.
*   **In-Context Learning:** Grandes janelas permitem que o modelo aprenda novas tarefas apenas com os dados fornecidos no prompt (ex: tradução de línguas raras com gramáticas e dicionários incluídos no contexto).

### Otimização e Custos
*   **Context Caching:** Técnica essencial para reduzir custos e latência em fluxos de trabalho recorrentes. Permite "armazenar" arquivos e contextos pesados (PDFs, vídeos, documentos) e pagar apenas pela manutenção horária, reduzindo o custo de entrada/saída em até 4 vezes (ex: Gemini Flash).
*   **Posicionamento da Query:** Para melhor desempenho em janelas longas, a pergunta ou comando principal deve ser inserido ao final do prompt, após todo o contexto.

---

## 2. Matriz de Decisão: Estratégias de Recuperação de Dados

A escolha entre utilizar a janela de contexto nativa ou sistemas externos de busca depende da frequência de reuso e do volume de dados.

| Estratégia | Quando utilizar | Benefícios |
| :--- | :--- | :--- |
| **Long Context** | Análises pontuais, poucos documentos, baixa necessidade de reuso. | Simplicidade; sem necessidade de infraestrutura adicional. |
| **NotebookLM** | Pesquisa assistida, síntese, estudo e exploração com fontes explícitas. | Grounding (ancoragem) forte com citações diretas das fontes. |
| **Projects (Contexto Persistente)** | Contexto recorrente que cabe no workspace do modelo. | Memória contextual persistente sem pipeline de RAG complexo. |
| **Vector RAG** | Produção auditável, reuso por múltiplos workflows, controle de chunking. | Escalabilidade para bases gigantescas e integração com agentes. |

---

## 3. Guia do Product Owner Salesforce para IA

Para um PO Salesforce, a IA deixa de ser um "chatbot" e passa a ser infraestrutura operacional. A tese central de operação foca em cinco pilares:

1.  **Modelo certo para cada tarefa:** Escolha baseada em raciocínio complexo (GPT-5.4 flagship) vs. baixa latência e custo (GPT-5.4-mini ou nano).
2.  **Contexto confiável:** Utilização de fontes verificadas e grounding.
3.  **Base de conhecimento reutilizável:** Evitar o antipadrão de "jogar toda a base em uma única conversa".
4.  **Workflows auditáveis:** Registro de logs e evidências de processamento.
5.  **Aprovação humana:** Essencial para pontos críticos e ações irreversíveis.

### Sistema Mínimo de Alta Alavancagem
*   **RAG Local:** Com citações por arquivo e linha para garantir verificabilidade.
*   **NotebookLM:** Para pesquisa rápida e fundamentada (grounded).
*   **Schemas de Saída:** Definir formatos estruturados para que os requisitos virem artefatos verificáveis.

---

## 4. Prática: Questões de Resposta Curta

**Pergunta 1:** O que caracteriza o fenômeno de "muitos disparos" (*many-shot in-context learning*) e qual sua vantagem?
**Resposta sugerida:** É a técnica de fornecer centenas ou milhares de exemplos de uma tarefa dentro do contexto do prompt. A vantagem é que o desempenho pode se assemelhar ao de modelos que passaram por ajuste fino (*fine-tuning*) específico, sem a necessidade de retreinar o modelo.

**Pergunta 2:** Quais são os principais riscos de não utilizar aprovação humana em fluxos de IA?
**Resposta sugerida:** O risco de executar ações irreversíveis sem evidências ou auditoria, além da possibilidade de alucinações que comprometem processos críticos de negócio.

**Pergunta 3:** Como o *Context Caching* auxilia na viabilidade econômica de projetos de IA?
**Resposta sugerida:** Ele reduz o custo de processamento de tokens de entrada repetitivos, permitindo que o desenvolvedor pague um valor menor por hora pelo armazenamento do contexto em vez de pagar o preço total de entrada a cada nova interação.

**Pergunta 4:** Qual o impacto da extensão do contexto na latência do modelo?
**Resposta sugerida:** Geralmente, consultas mais longas apresentam uma latência maior, especialmente no tempo para gerar o primeiro token (*time to first token*).

---

## 5. Propostas de Redação e Discussão Profunda

**Tema 1: A IA como Infraestrutura vs. IA como Ferramenta Ad Hoc**
Disserte sobre a mudança de paradigma proposta para Product Owners Salesforce, onde os requisitos deixam de ser textos soltos e passam a ser artefatos verificáveis dentro de workflows auditáveis. Como essa mudança impacta a governança de dados na plataforma?

**Tema 2: O Equilíbrio entre Custo, Latência e Inteligência**
Analise a matriz de modelos da OpenAI (GPT-5.4, mini e nano). Em quais cenários um PO deve priorizar o raciocínio complexo em detrimento do custo, e como o uso de subagentes com modelos "mini" pode otimizar a operação de uma organização?

---

## 6. Glossário de Termos Importantes

*   **Agente (Agent):** Sistemas de IA que mantêm o estado de suas ações e objetivos, utilizando texto como base para entender o mundo e realizar tarefas.
*   **Chunking:** Processo de fragmentação de dados para otimização de busca em sistemas RAG.
*   **Context Window (Janela de Contexto):** Limite de tokens que um modelo consegue "enxergar" e processar simultaneamente em uma única interação.
*   **Grounding (Ancoragem):** Técnica de conectar a resposta da IA a fontes de dados reais e verificáveis para reduzir alucinações.
*   **MCP (Model Context Protocol):** Protocolo para arquitetura e conexão de modelos a diferentes contextos e servidores.
*   **Needle-in-a-Haystack (Agulha no Palheiro):** Teste de avaliação que mede a capacidade de um modelo de encontrar uma informação específica dentro de uma enorme massa de dados.
*   **RAG (Retrieval-Augmented Generation):** Técnica que recupera informações de uma base de conhecimento externa para alimentar o modelo de IA com contexto relevante antes da geração da resposta.
*   **Token:** Unidade básica de processamento de texto em modelos de linguagem (podendo ser palavras, partes de palavras ou caracteres).