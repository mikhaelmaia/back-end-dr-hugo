# Deploy

Como o back-end do Doutor Viu é publicado em produção, o que acontece durante o deploy, como verificar e como voltar atrás.

## Sumário

- [Resumo do processo](#resumo-do-processo)
- [Antes de publicar](#antes-de-publicar)
- [Passo a passo](#passo-a-passo)
- [O que acontece durante o deploy](#o-que-acontece-durante-o-deploy)
- [Migrations em produção](#migrations-em-produção)
- [Verificação pós-deploy](#verificação-pós-deploy)
- [Sintomas e causas](#sintomas-e-causas)
- [Rollback](#rollback)
- [O que não faz parte do processo](#o-que-não-faz-parte-do-processo)

## Resumo do processo

| Item | Valor | Fonte |
|---|---|---|
| Ambientes | **Apenas produção** (não há homologação/staging) | Responsável do projeto |
| Plataforma | **Coolify**, conectado ao repositório do GitHub por GitHub App (ver [COOLIFY.md](COOLIFY.md)) | Responsável do projeto |
| Gatilho | **Deploy automático ao atualizar a branch `develop`** | Responsável do projeto |
| Build | **Nixpacks**, com Base Directory `/dr-hugo-back-end` | Responsável do projeto |
| Start Command | `npm run start:migrate:prod` (aplica as migrations e inicia o app) | Responsável do projeto |
| Node | 20 | Responsável do projeto |
| URL de produção | `https://api.doutorviu.com.br` (Swagger em `/docs`, saúde em `/health`) | Responsável do projeto |
| Banco, Redis e MinIO | Containers no mesmo Coolify; o PostgreSQL só aceita conexões da rede interna Docker | Responsável do projeto |
| Backups | Não há backup configurado | Responsável do projeto |
| CI | **Não há** workflows de CI no repositório (sem `.github/`) | Leitura do repositório |

⚠️ Como o deploy dispara em `develop`, **qualquer push/merge nela vai para produção**. Para mudar a branch monitorada, veja [COOLIFY.md](COOLIFY.md#trocar-a-branch-do-deploy-automático).

> O histórico mostra Pull Requests `develop` → `main` até o #13 (19/02/2026). Desde então a `develop` recebeu dezenas de commits (até 02/07/2026) sem novos PRs para a `main`, que ficou defasada e não representa a produção.

## Antes de publicar

Rode na sua máquina, dentro de `dr-hugo-back-end/`:

```bash
npm run lint        # ⚠️ usa --fix: altera arquivos; revise o diff antes de commitar
npm run build       # compila para dist/
npm test            # hoje não há testes unitários (ver PADRAO_DE_PROJETO.md)
```

Checklist:

- [ ] **Build local passa** (`npm run build`). Se falhar aqui, o deploy falha.
- [ ] **Migrations:** se mudou entidade, existe migration nova, testada localmente com `migration:run` (e `migration:revert`). Ela é aplicada pelo Start Command no deploy ([Migrations em produção](#migrations-em-produção)).
- [ ] **Variáveis novas:** toda variável nova está em `configuration.ts`, no [.env.example](../dr-hugo-back-end/.env.example) **e já cadastrada no Coolify** antes do deploy (o app sobe sem a maioria delas e a funcionalidade falha).
- [ ] **Impacto no front-end:** o contrato de resposta é `{statusCode, data, message}` e o CORS é uma lista fixa. Mudou rota, campo, regra de acesso ou domínio?
- [ ] **Impacto em integrações:** mudou uso de CFM, CNES, ReceitaWS, ViaCEP, SMTP, Z-API, MinIO ou Redis? Veja [INTEGRACOES.md](INTEGRACOES.md).
- [ ] **`CRYPTO_KEY`:** nunca altere em produção. Os dados pessoais estão criptografados com ela ([BANCO_DE_DADOS.md](BANCO_DE_DADOS.md#dados-pessoais-criptografados)).
- [ ] **E-mail é síncrono:** falha de SMTP derruba os fluxos que enviam e-mail.
- [ ] **Documentação** atualizada (`docs/`) se o comportamento mudou.

## Passo a passo

1. Trabalhe em branch de feature a partir da `develop` (`feature/...`; ver [CONTRIBUINDO.md](CONTRIBUINDO.md)).
2. Faça merge na `develop`.
3. **O merge/push em `develop` dispara o deploy no Coolify.** Acompanhe em *Deployments* do app (ver [COOLIFY.md](COOLIFY.md)).
4. O Start Command aplica as migrations pendentes e inicia o app.
5. Faça a [verificação pós-deploy](#verificação-pós-deploy).

## O que acontece durante o deploy

1. O Coolify recebe o evento do GitHub, clona a branch `develop` e faz o build com **Nixpacks** a partir de `/dr-hugo-back-end`.
2. O app é iniciado com `npm run start:migrate:prod`, isto é, `npm run migration:run && node dist/main.js` ([package.json](../dr-hugo-back-end/package.json)):
   - `migration:run` aplica as migrations pendentes usando o `.env`/variáveis do ambiente e o [data-source.ts](../dr-hugo-back-end/src/core/config/database/data-source.ts);
   - em seguida o app sobe, escutando em `PORT` (padrão 3000).
3. Ao subir, a aplicação conecta ao PostgreSQL, Redis e MinIO, registra as tarefas agendadas e importa o CSV TUSS.
4. As variáveis vêm do Coolify; não há `.env` no repositório.
5. Se a migration falhar, o app **não inicia** (o `&&` interrompe a sequência).

## Migrations em produção

- Aplicadas **a cada início do app** pelo Start Command (`npm run start:migrate:prod`). Só as migrations ainda não registradas na tabela `migrations` são executadas.
- O banco de produção foi gerado do zero com as migrations atuais (versão 1.0.0 de produção); a reorganização de 30/03/2026 (commit `5f2b183`) não o afetou.

Cuidados:

- Nunca rode `schema:sync` ou `schema:drop` em produção.
- Uma migration aplicada com o código antigo ainda em execução deve ser compatível com ele (apenas adicionar colunas/tabelas); remover ou renomear algo exige que o código já não use o item antigo.
- O CLI liga SSL conforme `NODE_ENV` (`production` → SSL; outro valor → sem SSL).
- Não edite nem reorganize migrations já aplicadas.

## Verificação pós-deploy

1. No Coolify, o deploy terminou com sucesso e o app está em execução (logs sem `Error`).
2. `GET https://api.doutorviu.com.br/health` → `status: "healthy"` com PostgreSQL, MinIO e Redis `healthy`.
   - O endpoint **responde HTTP 200 mesmo quando `unhealthy`**; leia o JSON.
3. `https://api.doutorviu.com.br/docs` abre o Swagger.
4. Teste uma rota pública simples (`GET /address/zip-code/01001000`) e um login com conta de teste.
5. Nos logs, procure: `Conexão com o Redis estabelecida`, `MinIO inicializado com sucesso` (aparece no primeiro uso do MinIO, por exemplo ao chamar `/health`), `Importação de categorias TUSS concluída` e a ausência de `Falha ao…`.
6. Se o deploy teve migration, confirme a tabela/coluna nova no banco.
7. Se mexeu em e-mail, dispare um fluxo de teste (recuperação de senha). Se mexeu em notificações, conecte um cliente Socket.IO em `/notifications`.

## Sintomas e causas

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Deploy falha no build | Erro de TypeScript/dependência | Reproduzir com `npm ci && npm run build` localmente |
| App reinicia em loop ou não sobe | Faltou variável obrigatória (`CRYPTO_KEY`, `REDIS_HOST`/`REDIS_PORT`, `DATABASE_*`, `MINIO_ENDPOINT`) ou a migration falhou | Ver logs; conferir variáveis no Coolify ([EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#o-que-impede-a-aplicação-de-subir)) |
| `relation "..." does not exist` / coluna inexistente | Migration não aplicada | Ver o log do início do app (`migration:run`) |
| Login falha para todos / erro "Falha ao descriptografar valor" | `CRYPTO_KEY` diferente da usada para gravar os dados | Restaurar a chave original |
| `/health` com PostgreSQL `unhealthy` | Host/credencial do banco | Conferir `DATABASE_*` |
| `/health` com MinIO `unhealthy`; uploads falham | Endpoint, porta, SSL ou credenciais incorretos | Conferir `MINIO_ENDPOINT`/`MINIO_PORT`/`MINIO_USE_SSL`/chaves |
| `/health` com Redis `unhealthy` | Host/porta/senha | Conferir `REDIS_*` |
| Navegador bloqueado por CORS | Domínio do front não está em `security.providers.ts` | Ajustar e redeployar |
| Links de e-mail com `undefined` ou domínio errado | `DV_WEB_*` mal configuradas | Corrigir no Coolify e reiniciar |
| Cadastro ou recuperação de senha retorna erro 500 | Envio de e-mail é síncrono e o SMTP falhou | Conferir `SMTP_*` (porta 465, TLS implícito) e o log `[COMM] channel=email status=failed` |
| WhatsApp não chega | `ZAPI_*` incorreto (falha só vai para o log `[COMM] channel=whatsapp`) | Conferir `ZAPI_*` e a instância na Z-API |
| Cadastro de instituição/médico falha na validação | `CNES_*` / `CFM_*` ausentes ou serviço fora do ar | Conferir variáveis e a disponibilidade da API |
| Cadastro de médico/instituição falha ("realize a consulta antes") | Cache da consulta expirou (1 h) ou Redis reiniciado | Repetir a consulta |
| 400 "Tempo de consulta expirado" | Requisição passou de 30 s | Ver integrações externas lentas |

## Rollback

- **Código:** no Coolify, o rollback é **manual**: acesse a lista de deploys do app e execute a versão desejada ([COOLIFY.md](COOLIFY.md#rollback-pelo-coolify)). A alternativa é fazer `git revert` do commit em `develop`; o push dispara novo deploy.
- ⚠️ **Rollback de código não desfaz migration.** Como o Start Command aplica as migrations a cada início, reimplantar uma versão anterior não reverte o esquema. Para reverter uma migration é preciso executar `migration:revert` (que pode apagar dados) ou criar uma migration corretiva.
- Variáveis de ambiente alteradas não voltam sozinhas: restaure os valores anteriores no Coolify e reinicie.
- Dados em Redis (chaves de resolução, cache) não são restaurados; links de e-mail já enviados podem deixar de funcionar se o Redis for recriado.

## O que não faz parte do processo

- **`Dockerfile` e `docker-compose.yml` do repositório:** não são usados em produção. O `docker-compose.yml` serve para subir a rede local de desenvolvimento.
- **Workflows de CI:** não existem no repositório.
- Não há outros ambientes além do produtivo.
