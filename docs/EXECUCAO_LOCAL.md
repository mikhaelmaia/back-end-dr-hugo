# Execução local

Como colocar o back-end do Doutor Viu para rodar na sua máquina, do `git clone` ao primeiro request, e referência completa das variáveis de ambiente.

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Do clone ao primeiro run](#do-clone-ao-primeiro-run)
- [Instalação das dependências](#instalação-das-dependências)
- [Banco de dados PostgreSQL](#banco-de-dados-postgresql)
- [Redis e MinIO locais](#redis-e-minio-locais)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Credenciais de serviços de terceiros](#credenciais-de-serviços-de-terceiros)
- [Migrations e dados de desenvolvimento](#migrations-e-dados-de-desenvolvimento)
- [Subindo a aplicação e documentação da API](#subindo-a-aplicação-e-documentação-da-api)
- [Banco local x banco em nuvem](#banco-local-x-banco-em-nuvem)
- [Referência das variáveis](#referência-das-variáveis)
- [Problemas comuns](#problemas-comuns)

## Pré-requisitos

| Item | Versão | Origem da informação |
|---|---|---|
| Node.js | **20** | Versão usada em produção (informada pelo responsável). O `package.json` não declara `engines`. |
| npm | o que acompanha o Node 20 | O projeto usa `package-lock.json`. |
| PostgreSQL | **16** | Versão do container local: o [docker-compose.yml](../dr-hugo-back-end/docker-compose.yml) usa `postgres:16-alpine`. A versão de produção não está no repositório. |
| Redis | **7** | Versão do container local: `redis:7-alpine` no docker-compose. **É obrigatório**: a aplicação não sobe sem `REDIS_HOST`/`REDIS_PORT` válidos. |
| MinIO | `latest` no docker-compose | Armazenamento de arquivos. O cliente exige `MINIO_ENDPOINT` para a aplicação subir (ver [MinIO local](#minio-local)). |
| Docker + Docker Compose v2 | qualquer versão recente | Opcional; sobe Postgres, Redis e MinIO pelo `docker-compose.yml`. |
| Git | qualquer | |

> A estrutura do repositório tem uma pasta intermediária: o código está em `dr-hugo-back-end/` dentro do clone. Todos os comandos `npm` rodam **dentro dela**.

## Do clone ao primeiro run

```bash
git clone https://github.com/mikhaelmaia/back-end-dr-hugo.git
cd back-end-dr-hugo/dr-hugo-back-end

# 1. Variáveis de ambiente (copie o modelo e preencha)
cp .env.example .env          # Windows (PowerShell): Copy-Item .env.example .env

# 2. Dependências
npm ci

# 3. Postgres, Redis e MinIO em containers (usa os valores do seu .env)
docker compose up -d postgres redis minio

# 4. Criar as tabelas
npm run migration:run

# 5. Subir a API em modo desenvolvimento (recarrega ao salvar)
npm run start:dev
```

Teste: abra `http://localhost:3000/health` e `http://localhost:3000/docs`.

> Esta documentação descreve a branch **`develop`**, que é a de trabalho do time e a que o Coolify publica (ver [CONTRIBUINDO.md](CONTRIBUINDO.md)). Depois do clone: `git checkout develop`. A `main` está defasada (último commit em 19/02/2026) e difere bastante.

## Instalação das dependências

- Use `npm ci` (instala exatamente o `package-lock.json`). Use `npm install` apenas ao adicionar/atualizar pacotes.
- **Dependências novas na `develop`:** `socket.io`/`@nestjs/websockets` (notificações em tempo real), `archiver` (download de documentos em ZIP), `csv-parse` (importação TUSS). O `ngrok` foi removido.
- **Download pesado:** o `package.json` lista `puppeteer`, que por padrão baixa um Chromium na instalação (centenas de MB). O código atual **não importa** o Puppeteer, então se a sua rede for lenta você pode pular o download definindo `PUPPETEER_SKIP_DOWNLOAD=1` antes do `npm ci` (variável do próprio Puppeteer; *confirmada de memória*, não está no repositório).
- **Passo nativo:** `bcrypt` possui binário nativo. Na maioria dos sistemas o `npm` baixa um binário pré-compilado; se falhar, instale as ferramentas de compilação C/C++ do seu sistema (o projeto não fixa nenhuma).
- O build copia assets configurados em [nest-cli.json](../dr-hugo-back-end/nest-cli.json): templates `.ejs`, `core/**/*.md` e `core/**/*.json`.

## Banco de dados PostgreSQL

**Versão do container local: 16** (a do `docker-compose.yml` do projeto; a versão de produção não está no código).

**Instalar sem prender ao SO:** use o container (opção 3 abaixo), ou o instalador oficial em [postgresql.org/download](https://www.postgresql.org/download/) para o seu sistema, ou o gerenciador de pacotes do seu SO.

O banco deve existir **antes** de rodar migrations ou a API; o nome é o `DATABASE_NAME` do seu `.env`. As extensões/tabelas são criadas pelas migrations.

### Três formas de criar o banco

**1. Interface gráfica** (pgAdmin, DBeaver, DataGrip, etc.): conecte-se ao servidor, clique com o botão direito em *Databases* → *Create/New database* e informe o mesmo nome de `DATABASE_NAME`.

**2. Linha de comando** (`psql` instalado):

```bash
psql -h localhost -p 5432 -U <usuario_admin> -c 'CREATE DATABASE "<DATABASE_NAME>";'
# ou, com o utilitário:
createdb -h localhost -p 5432 -U <usuario_admin> <DATABASE_NAME>
```

**3. Container** (nenhum Postgres instalado na máquina):

```bash
# Via docker-compose do projeto: cria usuário/senha/banco com os valores do .env
docker compose up -d postgres

# Ou um container avulso:
docker run -d --name dv-postgres -e POSTGRES_USER=<usuario> -e POSTGRES_PASSWORD=<senha> \
  -e POSTGRES_DB=<DATABASE_NAME> -p 5432:5432 postgres:16-alpine
```

No caminho 3 o banco já nasce criado (`POSTGRES_DB`).

## Redis e MinIO locais

O `docker-compose.yml` possui 4 serviços: `api`, `postgres`, `redis`, `minio`. **Para desenvolvimento, suba apenas as dependências** e rode a API pelo `npm` no seu computador:

```bash
docker compose up -d postgres redis minio
docker compose ps
docker compose down        # para tudo (mantém volumes)
docker compose down -v     # ⚠️ apaga também os dados dos volumes
```

Detalhes do compose:

| Serviço | Imagem | Portas no host | Credenciais (lidas do `.env`) |
|---|---|---|---|
| postgres | `postgres:16-alpine` | 5432 | `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` |
| redis | `redis:7-alpine` | 6379 | `REDIS_PASSWORD` (vira `--requirepass`; **defina um valor**, vazio quebra o comando) |
| minio | `minio/minio:latest` | 9000 (API), 9001 (console web) | `MINIO_ACCESS_KEY` (usuário root), `MINIO_SECRET_KEY` (senha root, mínimo de 8 caracteres) |
| api | build do Dockerfile (uso local; em produção o build é por Nixpacks) | 3000 | `env_file: .env` |

- Se quiser a API **também em container** (`docker compose up --build`), no `.env` use os **nomes dos serviços** como host: `DATABASE_HOST=postgres`, `REDIS_HOST=redis`, `MINIO_ENDPOINT=minio`. Com a API no host, use `localhost`.
- O compose cria os volumes `postgres_data`, `redis_data`, `minio_data`.
- Console do MinIO: `http://localhost:9001` (usuário/senha = `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`). Os buckets `temp`, `users` e `patient-documents` são criados automaticamente pela API no primeiro acesso ao MinIO.

### MinIO local

O cliente MinIO usa `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, as chaves e o modo *path-style* ([minio.service.ts](../dr-hugo-back-end/src/core/modules/media/minio/minio.service.ts)). Com o compose, use `MINIO_ENDPOINT=localhost`, `MINIO_PORT=9000`, `MINIO_USE_SSL=false`. Os buckets `temp`, `users` e `patient-documents` são criados no primeiro acesso (por exemplo, ao chamar `/health` ou fazer um upload).

> Na `main` a porta não era repassada ao cliente; isso foi corrigido na `develop`.

## Variáveis de ambiente

O modelo comentado está em [dr-hugo-back-end/.env.example](../dr-hugo-back-end/.env.example). Cada variável tem a anotação `[OBRIGATÓRIA]`, `[FUNCIONAL]`, `[OPCIONAL]` ou `[SEM EFEITO]`. A tabela completa está em [Referência das variáveis](#referência-das-variáveis).

### Conjunto mínimo para desenvolvimento

Valores **fictícios e locais**. Gere os segredos você mesmo.

```dotenv
NODE_ENV=development
PORT=3000
DV_APP_NAME=doutor-viu-api
DV_APP_VERSION=0.0.1
CRYPTO_KEY=<64 caracteres hex: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=dv_dev
DATABASE_PASSWORD=<invente uma senha local>
DATABASE_NAME=dv_dev

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<invente uma senha local>

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=<usuário local>
MINIO_SECRET_KEY=<senha local com 8+ caracteres>

JWT_SECRET=<string aleatória longa>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### O que impede a aplicação de subir

| Variável | Por quê |
|---|---|
| `CRYPTO_KEY` | `CryptoService` lança erro no construtor se ausente ou se não tiver 64 caracteres hex. ⚠️ Os dados pessoais dos usuários ficam criptografados com ela: **não troque a chave de um banco que já tem dados**. |
| `REDIS_HOST`, `REDIS_PORT` | [redis.config.ts](../dr-hugo-back-end/src/core/config/cache/redis.config.ts) lança erro de validação. `REDIS_PORT` não tem padrão nesse arquivo. |
| `DATABASE_*` | O TypeORM não consegue conectar e, esgotadas as tentativas padrão do `@nestjs/typeorm`, a inicialização falha. |
| `MINIO_ENDPOINT` | O cliente MinIO valida o endpoint ao ser construído (comportamento da biblioteca `minio`, não do código do projeto). |

Sem estas, a aplicação sobe, mas a funcionalidade falha: `JWT_SECRET` (login e WebSocket), `SMTP_*` (e-mail: o envio é **síncrono**, então a falha também derruba o fluxo que o chamou, como o cadastro), `DV_WEB_*` (links de e-mail, WhatsApp e QR Code), `CFM_*`, `RECEITAWS_*`, `CNES_*`, `VIA_CEP_*` (cadastros e consulta de CEP) e `ZAPI_*` (WhatsApp: falhas só são logadas).

### Variáveis que apontam para o front-end

`DV_WEB_BASE_URL` + `DV_WEB_*_PATH` formam os links de e-mail, WhatsApp e do QR Code (`{BASE_URL}{PATH}?t=<chave>`). Na `develop` a variável `FRONTEND_URL` **não é mais lida**.

- O CORS do back-end libera `http://localhost:5173` ([security.providers.ts](../dr-hugo-back-end/src/core/config/security/security.providers.ts)), e o front local roda nessa porta (Vite).
- Para o ambiente local, troque **apenas o domínio** pelo local e **mantenha os caminhos que já estão no seu `.env` de produção/dev**:

| Variável | Produção (valor atual no seu `.env`) | Local |
|---|---|---|
| `DV_WEB_BASE_URL` | `https://doutorviu.com.br` | `http://localhost:5173` |
| `DV_WEB_LOGIN_PATH` | copie do seu `.env` | o mesmo caminho |
| `DV_WEB_FORGOT_PASSWORD_PATH` | copie do seu `.env` | o mesmo caminho |
| `DV_WEB_EMAIL_CONFIRMATION_PATH` | copie do seu `.env` | o mesmo caminho |
| `DV_WEB_PROFILE_CHANGE_CONFIRMATION_PATH` | copie do seu `.env` | o mesmo caminho |
| `DV_WEB_PERMISSION_REQUEST_PATH` | copie do seu `.env` | o mesmo caminho |
| `DV_WEB_GRANTED_DOCTOR_PATH`, `DV_WEB_GRANTED_INSTITUTION_PATH`, `DV_WEB_GRANTED_PATIENT_PATH`, `DV_WEB_DOCUMENT_FORM_PATH` | copie do seu `.env` | o mesmo caminho |
| `DV_WEB_EMAIL_CHANGE_CONFIRMATION_PATH`, `DV_WEB_PHONE_CHANGE_CONFIRMATION_PATH` | lidas, mas sem uso no código | pode copiar ou deixar vazias |

> Os caminhos das telas do front **não estão no repositório**; só você os conhece. Se o seu front local usa outra porta, o CORS precisa liberá-la (hoje só `5173`).

### Valores de produção a partir do Coolify

Os valores de produção estão nas variáveis de ambiente do app no Coolify (ver [COOLIFY.md](COOLIFY.md)).

⚠️ **Não copie segredos de produção para a sua máquina.** Uma máquina de desenvolvimento tem controles mais fracos e o `.env` pode vazar (backup, sincronização, compartilhamento de tela).

| Variável | Pode copiar de produção? | Observação |
|---|---|---|
| `DV_APP_NAME`, `DV_APP_VERSION`, `PORT` | ✅ Sim | Não sensíveis. |
| `DV_WEB_*_PATH` | ✅ Sim | Caminhos públicos do front. |
| `DV_WEB_BASE_URL` | ❌ Troque | Devem apontar para o front **local**. |
| `RECEITAWS_*`, `VIA_CEP_*`, `CNES_*`, `*_TIMEOUT` | ✅ Sim | URLs públicas de APIs de terceiros. |
| `CFM_API_URL` | ✅ Sim | URL do serviço. |
| `CFM_API_KEY` | ❌ Não | Chave contratada; peça uma de teste, se existir. |
| `CRYPTO_KEY` | ❌ Não | Gere uma nova (ver acima). Com a de produção você conseguiria descriptografar os dados pessoais de produção. |
| `ZAPI_*` | ❌ Não | Com as credenciais de produção você enviaria WhatsApp reais a pacientes. Use uma instância de teste ou deixe vazio (as mensagens apenas falham no log). |
| `JWT_SECRET` | ❌ Não | Gere uma nova; com a de produção, tokens locais valeriam em produção. |
| `DATABASE_*`, `REDIS_*`, `MINIO_*` | ❌ Não | Use os containers locais. O banco de produção contém dados pessoais e de saúde. |
| `SMTP_*` | ❌ Não | Use uma conta de teste (ver abaixo). Com a de produção você enviaria e-mails reais a partir do domínio da empresa. |

## Credenciais de serviços de terceiros

Os nomes de menus abaixo são **descritos de memória** e podem mudar; consulte a documentação oficial de cada provedor.

- **E-mail (SMTP):** o código só precisa de host, porta, usuário e senha. Opções para desenvolvimento: (a) conta de e-mail de teste do seu provedor de e-mail, gerando uma "senha de aplicativo" na área de segurança da conta; (b) uma ferramenta de captura de e-mails local/SaaS (tipo "mailbox de teste") que forneça host/porta/credenciais SMTP e não entregue de verdade. Lembre: o transporte usa TLS implícito (`secure: true`), normalmente porta 465.
- **CFM (`CFM_API_KEY`):** chave do serviço de consulta de médicos, obtida junto ao CFM por quem contratou o serviço. Não é possível obtê-la só pelo código.
- **Z-API (WhatsApp):** credenciais (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`) obtidas na conta da Z-API que contratou a instância. Sem elas, as mensagens só falham no log.
- **CNES:** o código não envia chave; informe a URL base e o caminho do recurso do serviço de CNES utilizado.
- **ReceitaWS e ViaCEP:** o código não envia chave. Basta informar a URL base (veja a documentação pública de cada serviço). A ReceitaWS tem limite de consultas (o código trata HTTP 429).

Detalhes das integrações em [INTEGRACOES.md](INTEGRACOES.md).

## Migrations e dados de desenvolvimento

- As migrations ficam em [src/core/config/database/migrations](../dr-hugo-back-end/src/core/config/database/migrations). O `synchronize` está **desligado**; o esquema só muda por migrations.
- O CLI lê o `.env` (via `dotenv`) e usa [data-source.ts](../dr-hugo-back-end/src/core/config/database/data-source.ts).

```bash
npm run migration:run       # aplica as pendentes
npm run migration:revert    # desfaz a última
npm run migration:generate -- src/core/config/database/migrations/NomeDaMigration   # gera a partir das entidades
npm run migration:create -- src/core/config/database/migrations/NomeDaMigration     # cria vazia
```

- ⚠️ **As migrations foram reorganizadas** em 30/03/2026 (commit `5f2b183`): o histórico antigo foi substituído por 8 migrations novas, pensadas para um **banco vazio**. Em desenvolvimento, **recrie o banco do zero** se ele foi criado antes dessa data.
- **Não há seeds** no repositório. Dados de desenvolvimento são criados pela própria API:
  1. `POST /patients` (público) cria um paciente; `POST /doctors` exige a consulta prévia `/doctors/lookup` (CFM) e `POST /institutions` exige `/institutions/lookup-cnes` (CNES) e, quando o CNES traz CNPJ, `/institutions/lookup` (ReceitaWS) — ver [INTEGRACOES.md](INTEGRACOES.md).
  2. O usuário nasce **inativo** e precisa confirmar o e-mail (`POST /auth/confirm-email`). Sem SMTP funcional, a alternativa para desenvolvimento é ativar direto no banco (`UPDATE dv_user SET is_active = true WHERE id = '<uuid>'` — o e-mail fica **criptografado** em `dv_user.email`, então localize o usuário pelo `id`/`name`) ou ler o código/hash na tabela `dv_token`.
  3. O usuário `ADMIN` não tem rota de cadastro (o cadastro só permite paciente, médico e instituição); é criado diretamente no banco.
- Para a criação do banco, ver [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md).

## Subindo a aplicação e documentação da API

| Comando | Uso |
|---|---|
| `npm run start:dev` | Desenvolvimento, com *watch*. |
| `npm run start` | Sem *watch*. |
| `npm run start:debug` | *watch* + inspetor Node. |
| `npm run build` e `npm run start:prod` | Compila para `dist/` e roda `node dist/main`. |

A API escuta em `PORT` (padrão **3000**), sem prefixo global de rota.

| Ambiente | Swagger (documentação interativa) | Health check |
|---|---|---|
| Local | `http://localhost:3000/docs` | `http://localhost:3000/health` |
| Produção | `https://api.doutorviu.com.br/docs` | `https://api.doutorviu.com.br/health` |

> No Swagger, use o botão **Authorize** com o `accessToken` do `POST /auth/login` (esquema Bearer).

## Banco local x banco em nuvem

A API **não tem** um seletor de ambiente: ela se conecta ao banco indicado por `DATABASE_HOST/PORT/USER/PASSWORD/NAME`. Trocar de banco é trocar essas variáveis.

- **SSL é decidido por `NODE_ENV`:** `production` → SSL ligado com `rejectUnauthorized: false`; qualquer outro valor → SSL desligado. Vale tanto para a API ([database.providers.ts](../dr-hugo-back-end/src/core/config/database/database.providers.ts)) quanto para o CLI de migrations ([data-source.ts](../dr-hugo-back-end/src/core/config/database/data-source.ts)).
- **Log do TypeORM:** só em `NODE_ENV=development`, e inclui **as queries** (e os erros).
- **Fuso horário:** `main.ts` força `process.env.TZ = 'UTC'` antes de qualquer import, para não haver diferença de datas entre dev (UTC-3) e produção (UTC).
- O banco de produção **não é acessível de fora da rede do Coolify** (informação do responsável do projeto). Portanto, em condições normais, você não consegue apontar sua máquina para ele; para consultar, veja [COOLIFY.md](COOLIFY.md).

⚠️ **Comandos destrutivos:** `npm run schema:drop` apaga todo o esquema do banco apontado; `schema:sync` altera o esquema à revelia das migrations; `migration:revert` desfaz a última migration (perda de dados possível). **Antes de rodar qualquer um, confira `DATABASE_HOST` no seu `.env`.** Nunca rode `schema:*` contra produção.

⚠️ **Dados pessoais:** o banco de produção guarda dados de saúde e dados pessoais de pacientes e médicos (LGPD). Não restaure dumps de produção em ambiente de desenvolvimento sem anonimizar.

## Referência das variáveis

"Bloqueia o boot" = a aplicação não inicia sem a variável. Origem: busquei cada leitura no código.

| Variável | Para que serve | Onde é lida | Padrão | Bloqueia o boot? |
|---|---|---|---|---|
| `PORT` | Porta HTTP | [main.ts](../dr-hugo-back-end/src/main.ts) | `3000` | Não |
| `NODE_ENV` | SSL do banco; log do TypeORM | [database.providers.ts](../dr-hugo-back-end/src/core/config/database/database.providers.ts), [data-source.ts](../dr-hugo-back-end/src/core/config/database/data-source.ts) | — | Não |
| `DV_APP_NAME` | `User-Agent` das chamadas externas | [configuration.ts](../dr-hugo-back-end/src/core/config/environment/configuration.ts) → serviços CFM/ReceitaWS/ViaCEP/CNES/Z-API | — | Não |
| `DV_APP_VERSION` | Idem | idem | — | Não |
| `DV_ENV` | **Nada** (ninguém lê) | — | — | Não |
| `CRYPTO_KEY` | Criptografia AES-256-GCM de dados pessoais e de auditoria; HMAC dos hashes de busca | [crypto.service.ts](../dr-hugo-back-end/src/core/modules/crypto/crypto.service.ts) | — | **Sim** (64 hex) |
| `DV_WEB_BASE_URL` | Base dos links de e-mail, WhatsApp e QR Code | [email.helper.ts](../dr-hugo-back-end/src/core/modules/email/email.helper.ts), [whatsapp.helper.ts](../dr-hugo-back-end/src/core/modules/whatsapp/whatsapp.helper.ts), [patient-access-code.service.ts](../dr-hugo-back-end/src/modules/patients/aggregates/access-code/patient-access-code.service.ts) | — | Não |
| `DV_WEB_LOGIN_PATH` | Link "ir para o login" | idem | — | Não |
| `DV_WEB_FORGOT_PASSWORD_PATH` | Link de redefinição de senha | idem | — | Não |
| `DV_WEB_EMAIL_CONFIRMATION_PATH` | Link de confirmação de e-mail (cadastro) | idem | — | Não |
| `DV_WEB_EMAIL_CHANGE_CONFIRMATION_PATH` | Lida em `configuration.ts`; **nenhum código usa** `web.emailChangeConfirmationPath` | configuration.ts | — | Não |
| `DV_WEB_PHONE_CHANGE_CONFIRMATION_PATH` | Lida em `configuration.ts`; **nenhum código usa** `web.phoneChangeConfirmationPath` | configuration.ts | — | Não |
| `DV_WEB_PROFILE_CHANGE_CONFIRMATION_PATH` | Link de confirmação de troca de e-mail/telefone | email.helper.ts, whatsapp.helper.ts | — | Não |
| `DV_WEB_PERMISSION_REQUEST_PATH` | Destino do QR Code de acesso do paciente | patient-access-code.service.ts | — | Não |
| `DV_WEB_GRANTED_DOCTOR_PATH` | Link nas mensagens de WhatsApp (médico vinculado) | whatsapp.helper.ts | — | Não |
| `DV_WEB_GRANTED_INSTITUTION_PATH` | Idem (instituição vinculada) | whatsapp.helper.ts | — | Não |
| `DV_WEB_GRANTED_PATIENT_PATH` | Idem (paciente vinculado) | whatsapp.helper.ts | — | Não |
| `DV_WEB_DOCUMENT_FORM_PATH` | Link do documento enviado por instituição | whatsapp.helper.ts | — | Não |
| `DATABASE_HOST` | Host do Postgres | configuration.ts / data-source.ts | — | **Sim** |
| `DATABASE_PORT` | Porta do Postgres | idem | `5432` | Não |
| `DATABASE_USER` | Usuário | idem | — | **Sim** |
| `DATABASE_PASSWORD` | Senha | idem | — | **Sim** |
| `DATABASE_NAME` | Nome do banco | idem | — | **Sim** |
| `SMTP_HOST` | Servidor SMTP | [email.provider.ts](../dr-hugo-back-end/src/core/modules/email/email.provider.ts) | — | Não |
| `SMTP_PORT` | Porta SMTP | idem | `587` | Não |
| `SMTP_USERNAME` | Usuário SMTP e remetente (`from`) | idem | — | Não |
| `SMTP_PASSWORD` | Senha SMTP | idem | — | Não |
| `SMTP_SECURE` | Lida, **mas ignorada** (`secure: true` fixo) | configuration.ts | `false` | Não |
| `SMTP_FROM` | **Nada** (ninguém lê) | — | — | Não |
| `JWT_SECRET` | Assinatura dos tokens | [jwt.options.ts](../dr-hugo-back-end/src/core/config/security/jwt.options.ts) | — | Não (login falha) |
| `JWT_EXPIRES_IN` | Validade do access token | idem | — (sem expiração se vazio) | Não |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token | [jwt-provider.service.ts](../dr-hugo-back-end/src/core/modules/auth/aggregates/jwt-provider.service.ts) | — | Não |
| `REDIS_HOST` | Host do Redis | [redis.config.ts](../dr-hugo-back-end/src/core/config/cache/redis.config.ts) | — | **Sim** |
| `REDIS_PORT` | Porta do Redis | idem | — (sem padrão aqui) | **Sim** |
| `REDIS_PASSWORD` | Senha do Redis | idem | sem senha | Não |
| `REDIS_DB` | Banco lógico | idem | `0` | Não |
| `REDIS_TTL` | TTL padrão do cache (s) | idem | `60` | Não (inválido → erro) |
| `MINIO_ENDPOINT` | Host do MinIO (sem porta) | [minio.service.ts](../dr-hugo-back-end/src/core/modules/media/minio/minio.service.ts) | — | **Sim** |
| `MINIO_PORT` | Porta da API do MinIO (também compõe a URL do objeto quando difere de 80/443) | idem | — no cliente; `9000` em configuration.ts | Não |
| `MINIO_ACCESS_KEY` | Chave de acesso | idem | — | Sim\* |
| `MINIO_SECRET_KEY` | Chave secreta (**lida direto do ambiente**, não consta em `configuration.ts`) | idem | — | Sim\* |
| `MINIO_USE_SSL` | `true` → HTTPS | idem | `false` | Não |
| `CFM_API_URL` | URL do serviço CFM | [cfm.service.ts](../dr-hugo-back-end/src/core/modules/external/cfm/cfm.service.ts) | — | Não (só loga erro) |
| `CFM_API_KEY` | Chave do CFM | idem | — | Não (só loga erro) |
| `CFM_API_TIMEOUT` | Timeout (ms) | idem | `5000` | Não |
| `RECEITAWS_API_URL` | URL base da ReceitaWS | [receitaws.service.ts](../dr-hugo-back-end/src/core/modules/external/receitaws/receitaws.service.ts) | — | Não (só loga erro) |
| `RECEITAWS_COMPANY_DATA_PATH` | Caminho do CNPJ | idem | — | Não (só loga erro) |
| `RECEITAWS_API_TIMEOUT` | Timeout (ms) | idem | `30000` | Não |
| `VIA_CEP_API_URL` | URL base do ViaCEP | [viacep.service.ts](../dr-hugo-back-end/src/core/modules/external/viacep/viacep.service.ts) | — | Não (só loga erro) |
| `VIA_CEP_API_TIMEOUT` | Timeout (ms) | idem | `3000` | Não |
| `CNES_API_URL` | URL base da API de CNES | [cnes.service.ts](../dr-hugo-back-end/src/core/modules/external/cnes/cnes.service.ts) | — | Não (só loga erro) |
| `CNES_ESTABLISHMENT_PATH` | Caminho do estabelecimento | idem | — | Não (só loga erro) |
| `CNES_API_TIMEOUT` | Timeout (ms) | idem | `30000` | Não |
| `ZAPI_API_URL` | URL base da Z-API (WhatsApp) | [z-api.service.ts](../dr-hugo-back-end/src/core/modules/external/z-api/z-api.service.ts) | — | Não (só loga erro) |
| `ZAPI_INSTANCE_ID` | ID da instância | idem | — | Não (só loga erro) |
| `ZAPI_TOKEN` | Token da instância (vai na URL) | idem | — | Não (só loga erro) |
| `ZAPI_CLIENT_TOKEN` | Cabeçalho `Client-Token` | idem | — | Não |
| `ZAPI_API_TIMEOUT` | Timeout (ms) | idem | `5000` | Não |

\* O cliente MinIO é construído no boot com estas credenciais; a **validação** de que funcionam só ocorre no primeiro uso (`getClient()`/`/health`), com até 10 tentativas.

Também lida pelo Node (não é do projeto): `npm_package_version` (versão no `/health`; só existe quando iniciado via `npm`, no container o valor cai para `1.0.0`).

**Conferência com o `.env.example` anterior:** ele listava `DV_ENV` e `SMTP_FROM`, que ninguém lê, e não listava `PORT`, `NODE_ENV`, `CFM_API_URL`, `CFM_API_KEY` e `CFM_API_TIMEOUT`, que o código lê. Além disso, `SMTP_SECURE`, `DV_WEB_EMAIL_CHANGE_CONFIRMATION_PATH` e `DV_WEB_PHONE_CHANGE_CONFIRMATION_PATH` são lidas em `configuration.ts` mas não têm uso. A seção `# Api Key` do modelo anterior estava vazia (a autenticação por API key usa um valor guardado por usuário no banco, não uma variável).

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `CRYPTO_KEY não definida` / `deve conter 64 caracteres hex` ao iniciar | Chave ausente ou com tamanho errado | Gere com o comando da seção [Conjunto mínimo](#conjunto-mínimo-para-desenvolvimento). |
| `REDIS_HOST é obrigatório` / `REDIS_PORT deve ser um número válido…` | Variável ausente ou fora de 1–65535 | Preencha as duas no `.env`. |
| API não conecta ao Postgres | Container parado, porta/host errados, ou banco não criado | `docker compose ps`; confira `DATABASE_*`; crie o banco (seção [Banco](#banco-de-dados-postgresql)). |
| Erro de SSL ao falar com Postgres local | `NODE_ENV=production` liga SSL | Use `NODE_ENV=development` localmente. |
| `relation "dv_user" does not exist` | Migrations não aplicadas | `npm run migration:run`. |
| `/health` mostra MinIO `unhealthy` / uploads falham | Endpoint, porta, SSL ou chaves incorretos; MinIO fora do ar | Confira `MINIO_*` (local: `localhost`, `9000`, `false`) e `docker compose ps`. |
| Redis em loop de erro no compose | `REDIS_PASSWORD` vazio (comando `--requirepass` sem valor) | Defina uma senha. |
| Cadastro/recuperação de senha responde erro 500 | O envio de e-mail é síncrono e o SMTP falhou | Veja o log (`[COMM] channel=email status=failed`). Confirme porta 465 e credenciais; para desenvolvimento use um SMTP de teste. |
| Login não encontra usuários depois de trocar `CRYPTO_KEY` | E-mail/CPF são buscados por hash gerado com a chave | Restaure a chave original ou recrie o banco de desenvolvimento. |
| WhatsApp não é enviado | `ZAPI_*` ausente/inválido (falha só vai para o log `[COMM] channel=whatsapp`) | Preencha ou ignore em desenvolvimento. |
| Links dos e-mails com `undefined` | `DV_WEB_BASE_URL`/`DV_WEB_*_PATH` vazios | Preencha. |
| "Tempo de consulta expirado" | O `TimeoutInterceptor` aborta requisições com mais de 30 s (5 min nas rotas de upload) | Veja se uma API externa está lenta. |
| Erro de CORS no navegador | Origem do front fora da lista (`doutorviu.com.br`, `www.doutorviu.com.br`, `localhost:5173`) | Rodar o front na porta 5173 ou ajustar [security.providers.ts](../dr-hugo-back-end/src/core/config/security/security.providers.ts). |
| `/domain/terms/*` ou `/domain/countries/*` falham; log `Arquivo CSV não encontrado` (TUSS) | Esses serviços leem arquivos de `process.cwd()/src/core/resources/...`; funcionam rodando da pasta do projeto, mas não de um diretório sem `src/` | Rode os comandos dentro de `dr-hugo-back-end/`. |
| Teste e2e (`npm run test:e2e`) falha | O teste existente é o modelo do Nest (espera `GET /` = `Hello World!`) e precisa de todos os serviços | Não é um teste real do projeto. |
