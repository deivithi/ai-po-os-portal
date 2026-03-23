# Setup do sync em nuvem no portal

Este guia conecta a rota `Entrar` do portal a um projeto Supabase para autenticar por e-mail e sincronizar:

- trilha
- flags
- XP
- progresso
- analytics local
- sessao do dia
- retomada

## 1. Criar ou abrir seu projeto Supabase

No painel do Supabase, crie um projeto e copie:

- `Project URL`
- `anon public key`

Voce vai colar esses dois valores na rota:

- `https://deivithi.github.io/ai-po-os-portal/entrar/`

## 2. Configurar autenticacao por e-mail

No Supabase Auth:

- habilite login por e-mail
- mantenha `shouldCreateUser` permitido
- use OTP por e-mail como caminho principal

Observacao:

- o portal tambem lida bem com magic link porque o client foi configurado com `detectSessionInUrl`
- para a UX mais direta do produto, o fluxo principal desta fase e OTP manual

## 3. Configurar redirect URLs

Adicione pelo menos estas URLs no projeto:

- `https://deivithi.github.io/ai-po-os-portal/`
- `https://deivithi.github.io/ai-po-os-portal/entrar/`

Se futuramente houver dominio proprio, inclua tambem as URLs desse dominio.

## 4. Executar o SQL de suporte

Abra o SQL Editor do Supabase e rode o arquivo:

- `supabase_cloud_sync_setup.sql`

O script cria:

- `public.learner_profiles`
- `public.learner_sync_state`

Tambem ativa:

- `Row Level Security`
- policies para cada usuario ler e atualizar apenas o proprio snapshot
- triggers para `updated_at`

## 5. Conectar o portal

Na rota `Entrar`:

1. salve seu e-mail local, se ainda nao tiver feito isso
2. cole `Project URL`
3. cole `anon key`
4. clique para salvar o provider
5. envie o codigo OTP
6. cole o codigo recebido por e-mail
7. finalize o login

## 6. Sincronizar o estado

Depois da autenticacao, use os controles:

- `Sincronizar agora`: faz merge entre o estado local e a nuvem
- `Puxar nuvem`: trata o remoto como fonte principal
- `Enviar local`: sobe o snapshot atual do navegador

Use `merge` como padrao.

## 7. O que fica sincronizado

O snapshot do portal inclui:

- preferencias da trilha adaptativa
- progresso por unidade
- flags de revisao
- sessao do dia
- analytics de estudo
- estado de retomada
- identidade do aluno

## 8. O que continua local-first

Mesmo sem provider configurado, o portal continua funcionando.

O desenho desta fase e:

- local-first por padrao
- nuvem opcional
- persistencia entre dispositivos quando o aluno decide ativar

## 9. Leitura de produto

Esta fase nao exige backend privado nem service role key no navegador.

O setup foi pensado para:

- GitHub Pages
- leveza
- rastreabilidade
- ownership claro dos dados
- subida futura para produto vendavel
