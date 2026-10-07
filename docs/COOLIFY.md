# Coolify (hospedagem)

Como o back-end do Doutor Viu está hospedado no Coolify: como acessar o projeto, ver os containers (back-end, PostgreSQL, Redis, MinIO), conferir/editar variáveis, trocar a branch do deploy e diagnosticar problemas.

> ⚠️ **Os caminhos de painel abaixo foram descritos de memória** sobre o Coolify e podem mudar entre versões. Os nomes de menus, abas e botões são aproximados; em caso de diferença, siga a documentação oficial do Coolify. O que vem do projeto está marcado: *(informado pelo responsável)* ou *(lido no código)*.

## Sumário

- [Arranjo da hospedagem](#arranjo-da-hospedagem)
- [Acessar o projeto e ver os containers](#acessar-o-projeto-e-ver-os-containers)
- [Configuração do app do back-end](#configuração-do-app-do-back-end)
- [Como o Coolify executa a aplicação](#como-o-coolify-executa-a-aplicação)
- [Trocar a branch do deploy automático](#trocar-a-branch-do-deploy-automático)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados e demais serviços](#banco-de-dados-e-demais-serviços)
- [Acessar o banco de dados](#acessar-o-banco-de-dados)
- [Logs e console](#logs-e-console)
- [Rollback pelo Coolify](#rollback-pelo-coolify)
- [Integrações que apontam para o app](#integrações-que-apontam-para-o-app)
- [Diagnóstico rápido](#diagnóstico-rápido)

## Arranjo da hospedagem

| Item | Situação | Fonte |
|---|---|---|
| Plataforma | Coolify, conectado ao repositório GitHub do projeto por **GitHub App** | *(informado)* |
| Deploy | Automático ao atualizar a branch configurada, hoje **`develop`** | *(informado)* |
| Build | **Nixpacks**. O `Dockerfile` e o `docker-compose.yml` do repositório não são usados em produção | *(informado)* |
| Start Command | `npm run start:migrate:prod` (aplica as migrations e inicia o app) | *(informado)* |
| Ambientes | Somente produção | *(informado)* |
| PostgreSQL, Redis, MinIO | Containers criados e gerenciados **no mesmo Coolify** do back-end | *(informado)* |
| Acesso ao PostgreSQL | Aceita apenas conexões da rede interna Docker; não é acessível de fora | *(informado)* |
| Acesso ao MinIO pelo app | Pela rede interna do Coolify | *(informado)* |
| Backups | Não há backup configurado | *(informado)* |
| Monitoramento | Configurado no próprio Coolify | *(informado)* |
| Domínio da API | `api.doutorviu.com.br` | *(informado)* |
| Node | 20 | *(informado)* |

Esta documentação descreve a branch `develop`, que é a monitorada pelo Coolify. Não estão no repositório: o nome do projeto no Coolify, a URL do painel e o tipo/tamanho do servidor.

## Acessar o projeto e ver os containers

1. Abra o painel do Coolify da empresa (endereço e credenciais com quem administra o servidor) e faça login.
2. Menu **Projects** → escolha o projeto do Doutor Viu → o ambiente **production**.
3. Dentro do ambiente aparecem os **recursos** (cada um é um item clicável):
   - a **aplicação** do back-end (origem: repositório GitHub);
   - o banco **PostgreSQL**;
   - o **Redis**;
   - o **MinIO**.
4. Em cada recurso, o cabeçalho mostra o **status** (Running / Stopped / Degraded), e há abas como *Configuration*, *Deployments* (apenas no app), *Logs*, *Terminal* e botões *Restart/Stop/Redeploy*.

## Configuração do app do back-end

No recurso da aplicação, os campos a conferir (nomes de memória):

| Campo | Valor |
|---|---|
| **Source / Git Repository** | `mikhaelmaia/back-end-dr-hugo`, **Branch** = `develop`, conectado por GitHub App |
| **Build Pack** | *Nixpacks* |
| **Base Directory** | `/dr-hugo-back-end` (o `package.json` fica nessa subpasta) |
| **Ports Exposes** | `3000` (porta padrão da aplicação) |
| **Domains** | `api.doutorviu.com.br` |
| **Auto Deploy** | Ligado (deploy ao receber push na branch) |
| **Start Command** | `npm run start:migrate:prod` |
| **Rede** | App, PostgreSQL, Redis e MinIO se enxergam na rede interna do Docker |
| **Environment Variables** | Ver abaixo |
| **Health check** | `GET /health` na porta 3000, configurado no Coolify |

## Como o Coolify executa a aplicação

- Clona o repositório na branch configurada e faz o build com **Nixpacks** (não usa o `Dockerfile`).
- Inicia o app com o Start Command `npm run start:migrate:prod`: `npm run migration:run && node dist/main.js` ([package.json](../dr-hugo-back-end/package.json)). As migrations são aplicadas a cada início e, em seguida, o app sobe.
- A aplicação escuta em `PORT` (padrão 3000).
- **Processo único:** a própria API roda as tarefas agendadas (`@Cron`); não há worker separado.

## Trocar a branch do deploy automático

Hoje o deploy dispara ao atualizar `develop` *(informado)*. Para mudar, por exemplo, para `main`:

1. Abra o recurso da **aplicação** → **Configuration** → aba **General**.
2. Na seção de origem do código (*Git Source* / *Git Repository*), altere o campo **Branch** de `develop` para a desejada (ex.: `main`).
3. **Salve**.
4. Confirme que **Auto Deploy** continua ligado (costuma ficar em **Advanced**). Como a conexão é por GitHub App, o Coolify gerencia o webhook do GitHub.
5. Faça um **Redeploy** manual para validar a nova branch.

⚠️ Mudar a branch muda **o que vai para produção**.

## Variáveis de ambiente

- No app: **Configuration** → **Environment Variables**. Lá você vê, cria, edita e apaga. Valores marcados como secretos aparecem ocultos.
- Variáveis da `develop` que precisam existir no app: `CNES_*`, `ZAPI_*` e os caminhos `DV_WEB_*` de permissão, vínculos e documento. A `FRONTEND_URL` não é mais lida.
- A lista de variáveis esperadas, o que cada uma faz e quais impedem o boot: [EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#referência-das-variáveis) e [.env.example](../dr-hugo-back-end/.env.example).
- `DATABASE_HOST`, `REDIS_HOST` e `MINIO_ENDPOINT` apontam para os **nomes internos** dos recursos na rede do Coolify (cada recurso mostra seu *host/URL interno* na própria página).
- **Alterou variável?** É necessário reiniciar/redeployar o app para a aplicação ler os novos valores.
- Variável nova no código precisa estar cadastrada **antes** do deploy.
- ⚠️ Nunca cole segredos em issues, commits ou chats. Tabela do que pode ou não ser copiado para a máquina local: [EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#valores-de-produção-a-partir-do-coolify).

## Banco de dados e demais serviços

- **PostgreSQL, Redis e MinIO** são containers do mesmo Coolify; as credenciais (usuário, senha, nome do banco, chaves) ficam na página de cada recurso e são as mesmas informadas nas variáveis `DATABASE_*`, `REDIS_*` e `MINIO_*` do app.
- Os dados ficam em **volumes** do Docker gerenciados pelo Coolify. ⚠️ Parar/recriar o recurso sem volume persistente apaga os dados.
- **PostgreSQL:** aceita apenas conexões da rede interna Docker.
- **MinIO:** o app o acessa pela rede interna do Coolify, usando `MINIO_ENDPOINT` (sem porta), `MINIO_PORT`, `MINIO_USE_SSL` e as chaves.
- **Backups:** não há backup configurado.

## Acessar o banco de dados

O Postgres **não está acessível de fora da rede do Coolify** *(informado)*. A forma de consulta descrita aqui é o **Terminal do próprio recurso** no Coolify: abra o recurso PostgreSQL → **Terminal** (ou *Execute Command*) e rode:

```bash
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

(As variáveis existem no container do Postgres oficial; se não, use os valores exibidos na página do recurso.)

⚠️ Operações de escrita em produção (UPDATE/DELETE/migrations) alteram dados de saúde e pessoais. Não rode `schema:drop`/`schema:sync` ([BANCO_DE_DADOS.md](BANCO_DE_DADOS.md#comandos)).

## Logs e console

- **Logs da aplicação:** recurso do app → **Logs** (stdout do container). A aplicação loga com o logger do Nest: conexão com Redis/MinIO, execução das tarefas agendadas, erros de integração.
- **Logs de deploy:** recurso do app → **Deployments** → deploy desejado (saída do build).
- **Console:** recurso do app → **Terminal** abre um shell no container.
- **Logs de Postgres/Redis/MinIO:** aba **Logs** de cada recurso.

## Rollback pelo Coolify

O Coolify permite reimplantar uma versão anterior, e o processo é **manual**: acesse a lista de deploys do app e execute a versão desejada. Limitação: **não desfaz migrations** nem restaura dados. Procedimento completo em [DEPLOY.md](DEPLOY.md#rollback).

## Integrações que apontam para o app

| Quem chama | Para quê |
|---|---|
| Front-end (`https://doutorviu.com.br`, `https://www.doutorviu.com.br`) | Consome a API em `https://api.doutorviu.com.br` (origens liberadas no CORS do código) |
| Navegadores de desenvolvedores | `https://api.doutorviu.com.br/docs` (Swagger) |
| Monitoramento do Coolify | `GET /health` |

Não há webhooks de terceiros apontando para o app ([INTEGRACOES.md](INTEGRACOES.md#webhooks-e-chamadas-de-entrada)).

## Diagnóstico rápido

| Situação | Onde olhar |
|---|---|
| Site/API fora do ar | Status do app no Coolify; logs; se o app reinicia em loop, falta variável ([DEPLOY.md](DEPLOY.md#sintomas-e-causas)) |
| Deploy não disparou ao dar push | Branch configurada ≠ branch do push; Auto Deploy desligado; webhook do GitHub falhando (GitHub → Settings → Webhooks → *Recent Deliveries*) |
| Deploy falhou | *Deployments* → log do build |
| App não sobe depois do deploy | Log do início: o Start Command aplica as migrations antes do app; erro de migration impede o start |
| `/health` com serviço `unhealthy` | Status do recurso correspondente (Postgres/Redis/MinIO) e variáveis |
| Erro de conexão ao banco após mexer no Postgres | Credenciais/host mudaram; atualizar `DATABASE_*` e reiniciar o app |
| Mudei variável e nada mudou | Falta reiniciar/redeployar |
