# Padrão de projeto

Como o código do back-end está organizado, quais convenções seguir ao escrever código novo e o que não pode quebrar na configuração central. Descreve a branch `develop`.

## Sumário

- [Visão geral da stack](#visão-geral-da-stack)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Anatomia de um módulo](#anatomia-de-um-módulo)
- [Convenções de código](#convenções-de-código)
- [Variações de estilo observadas](#variações-de-estilo-observadas)
- [Núcleo e configurações primordiais](#núcleo-e-configurações-primordiais)
- [Segurança e controle de acesso](#segurança-e-controle-de-acesso)
- [Banco e migrations: pontos de atenção](#banco-e-migrations-pontos-de-atenção)
- [Checklist para criar um módulo novo](#checklist-para-criar-um-módulo-novo)

## Visão geral da stack

| Item | Valor | Origem |
|---|---|---|
| Framework | NestJS 11 (Express) | [package.json](../dr-hugo-back-end/package.json) |
| Linguagem | TypeScript 5.9, `strictNullChecks: false`, `noImplicitAny: false` | [tsconfig.json](../dr-hugo-back-end/tsconfig.json) |
| Banco | PostgreSQL via TypeORM 0.3 (`synchronize: false`) | `database.providers.ts` |
| Cache / chaves temporárias | Redis (ioredis) | `core/modules/cache` |
| Arquivos | MinIO | `core/modules/media` |
| E-mail | `@nestjs-modules/mailer` + templates EJS (envio síncrono) | `core/modules/email` |
| WhatsApp | Z-API via `@nestjs/axios` | `core/modules/whatsapp`, `core/modules/external/z-api` |
| Tempo real | Socket.IO (`@nestjs/websockets`, namespace `/notifications`) | `core/modules/notifications` |
| Autenticação | JWT (`@nestjs/jwt`) + bcrypt | `core/modules/auth` |
| Docs da API | `@nestjs/swagger`, rota `/docs` | `main.ts` |
| Agendamento | `@nestjs/schedule` (`@Cron`) | `app.module.ts` |
| Lint/format | ESLint 9 (flat config) + Prettier (`singleQuote`, `trailingComma: all`) | `eslint.config.mjs`, `.prettierrc` |
| Testes | Jest + supertest (praticamente sem testes escritos; ver [Convenções](#convenções-de-código)) | `package.json` |

## Estrutura de diretórios

O código vive em `dr-hugo-back-end/` (pasta dentro do repositório).

```text
dr-hugo-back-end/
├── src/
│   ├── main.ts                     # bootstrap: pipes, filtros, interceptors, Swagger, CORS
│   ├── app.module.ts               # módulo raiz: guard e interceptors globais
│   ├── core/                       # infraestrutura e recursos transversais (não é "negócio")
│   │   ├── base/                   # classes base: BaseEntity, BaseRepository, BaseService, BaseMapper, BaseController
│   │   ├── config/                 # configuração técnica
│   │   │   ├── environment/        # configuration.ts (variáveis → objeto tipado)
│   │   │   ├── database/           # data source, provider do TypeORM e migrations/
│   │   │   ├── cache/              # redis.config.ts
│   │   │   ├── security/           # AuthGuard, opções do JWT, CORS
│   │   │   ├── interceptors/       # Timeout, Transform, Audit, NoCache
│   │   │   ├── exceptions/         # AllExceptionsFilter e ExceptionResponse
│   │   │   └── media/              # limites do multer
│   │   ├── modules/                # módulos transversais (auth, token, email, media, audit, cache, crypto, domain, external, health, address, qr-code, resolution-key)
│   │   ├── resources/              # arquivos estáticos (termos legais em .md, países em .json)
│   │   ├── utils/                  # funções utilitárias (Optional, datas, formatação, helpers de fluxo)
│   │   └── vo/                     # constantes, enums, erros, paths, decorators, validators, tipos
│   └── modules/                    # módulos de negócio (users, patients, doctors, institutions, medical-records, insights)
│       └── manager.module.ts       # agrega os módulos de negócio
├── test/                           # e2e (apenas o modelo do Nest)
├── Dockerfile / docker-compose.yml   # Dockerfile não é usado em produção (build por Nixpacks); compose é local
└── nest-cli.json                   # copia .ejs, core/**/*.md e core/**/*.json para dist/
```

Papel de cada pasta de `core/vo`: `consts/` (enums de domínio, [paths.ts](../dr-hugo-back-end/src/core/vo/consts/paths.ts) com todas as rotas, [errors.ts](../dr-hugo-back-end/src/core/vo/consts/errors.ts) com o catálogo de erros `E001`–`E126`, mensagens de validação), `decorators/` (`@Public`, `@Roles`, `@CurrentUser`, `@Auditable`, validações de parâmetro), `validators/` (validadores `class-validator` customizados), `types/` (`Page`, `PaginationParams`, `JwtPayload`, `ApplicationResponse`).

## Anatomia de um módulo

Exemplo de referência: [src/modules/patients](../dr-hugo-back-end/src/modules/patients).

```text
patients/
├── patients.module.ts       # declara imports (TypeOrmModule.forFeature, outros módulos), controllers, providers, exports
├── patients.controller.ts   # HTTP: rotas, Swagger, @Public/@Roles/@Auditable; estende BaseController (opcional)
├── patients.service.ts      # regra de negócio; estende BaseService<Entity, Dto, Repository, Mapper>
├── patients.repository.ts   # acesso a dados; estende BaseRepository<Entity>
├── patients.mapper.ts       # Entity ↔ DTO; estende BaseMapper
├── dtos/                    # DTOs com class-validator + decorators do Swagger
├── entities/                # entidades TypeORM (estendem BaseEntity)
└── aggregates/              # sub-recursos do módulo (cada um com sua própria mini-estrutura e, às vezes, seu módulo)
```

Camadas e responsabilidades:

| Camada | Faz | Não faz |
|---|---|---|
| Controller | Declara rota, valida entrada via DTO, delega ao service | Regra de negócio, acesso direto a repositório |
| Service | Regras, orquestração, transações lógicas, ganchos `beforeCreate/postCreate/beforeUpdate/...` | Montar SQL |
| Repository | Consultas (QueryBuilder/`find`), filtros e paginação herdados de `BaseRepository` | Regra de negócio |
| Mapper | Converter entidade ↔ DTO | Acesso a dados |
| Adapter (`*.adapter.ts`) | Isolar uma integração externa e traduzir para o domínio (ex.: [doctor.adapter.ts](../dr-hugo-back-end/src/modules/doctors/doctor.adapter.ts)) | Expor detalhes da API externa ao controller |

`aggregates/` agrupa entidades dependentes de um agregado (ex.: `doctors/aggregates/registration`, `patients/aggregates/documents`).

## Convenções de código

**Nomes.** Arquivos em `kebab-case` com sufixo de papel (`*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.mapper.ts`, `*.module.ts`, `*.entity.ts`, `*.dto.ts`, `*.validator.ts`). Classes em `PascalCase`. Propriedades em `camelCase`; colunas do banco em `snake_case` via `@Column({ name: ... })`. Membros declarados explicitamente como `public`/`private`/`protected`.

**Rotas.** Nunca escreva strings de rota soltas: use as classes de [paths.ts](../dr-hugo-back-end/src/core/vo/consts/paths.ts) (`XxxPaths.BASE`, `XxxPaths.CURRENT_FULL`, etc.). Não há prefixo global (`/patients`, `/auth/login`...). Rotas "do usuário logado" usam `/current`.

**Respostas.** O [TransformInterceptor](../dr-hugo-back-end/src/core/config/interceptors/transform.interceptor.ts) envelopa toda resposta de sucesso (**exceto** `StreamableFile`, usado em downloads/streams, que passa direto):

```json
{ "statusCode": 200, "data": { ... }, "message": "<descrição do status>" }
```

Em erro, o [AllExceptionsFilter](../dr-hugo-back-end/src/core/config/exceptions/all-exceptions.filter.ts) devolve o mesmo envelope com `data` = `{ path, method, name, status, errorCode?, errorName?, message, timestamp }`. Por isso o código dos controllers **retorna o DTO puro** e nunca monta o envelope.

**Erros.** Duas formas, ambas lançam `HttpException`:
1. Erro catalogado: `toHttpException('E029')` ([errors.utils.ts](../dr-hugo-back-end/src/core/utils/errors.utils.ts), catálogo em `errors.ts` com `code`, `name`, `message`, `httpStatus`).
2. Exceção do Nest com mensagem (`NotFoundException`, `BadRequestException`...). Mensagens em português.

Helpers de fluxo em [functions.ts](../dr-hugo-back-end/src/core/utils/functions.ts) (`acceptFalseThrows`, `acceptTrueThrows`, `whenNullThrows`, `until`, `encrypt`, `compare`) e `Optional` ([optional.ts](../dr-hugo-back-end/src/core/utils/optional.ts)) fazem o papel de guard clauses nos services.

**Validação.** `ValidationPipe` global com `transform: true`; DTOs usam `class-validator` com mensagens geradas por [validation-messages.ts](../dr-hugo-back-end/src/core/vo/consts/validation-messages.ts). Validadores próprios em `core/vo/validators/` (CPF/CNPJ, senha forte, data futura, único no banco `@IsUnique`/`IsUniqueComposite`, existe em `ExistsIn`, etc.; na `develop` há também `ExistsInGrant` e `IsEnumKey`, e os validadores de unicidade comparam o hash quando o campo é criptografado). As falhas viram `400` com `message` = lista de strings. Os validadores de banco são providers registrados no `AppModule` e ativados por `useContainer` no `main.ts`.

**Dados pessoais.** Campos sensíveis são criptografados **no mapper/service** com `CryptoService.encrypt` e lidos com `decrypt`; para buscas e unicidade guarda-se um hash (`hashForSearch`) em coluna `*_hash` (ver [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md#dados-pessoais-criptografados)). Nunca use `where email = ...`; use o hash. Dados novos de saúde ou pessoais devem seguir o mesmo padrão.

**Datas.** `main.ts` fixa `TZ=UTC` antes de qualquer import; trate datas como UTC.

**Acesso a dados.** Sempre via repository. `BaseRepository` já filtra `deleted_at IS NULL`, aplica filtros (`eq`, `like`, `ilike`, `in`, `gte`, `lte`, `between`), ordenação restrita a `getAllowedSortColumns()` (por padrão `id`, `createdAt`, `updatedAt`) e paginação (`Page<T>`). Para junções, sobrescreva `findById`/crie métodos no repository (modelo: `PatientsRepository`). Remoção padrão é **soft delete** (`deleted_at`).

**Swagger.** Cada rota documenta `@ApiOperation`, `@ApiResponse` (incluindo erros com `ExceptionResponse`) e, nas protegidas, `@ApiBearerAuth()` no controller. DTOs usam `@ApiProperty` com `description`/`example`.

**Tarefas agendadas.** `@Cron(...)` em services (ver [INTEGRACOES.md](INTEGRACOES.md#tarefas-agendadas)).

**Testes.** O repositório não possui testes unitários (`*.spec.ts`) e o único e2e é o modelo do Nest, que não reflete a aplicação. O Jest está configurado no `package.json` (`rootDir: src`, arquivos `*.spec.ts`).

**Lint/format.** `npm run lint` (com `--fix`) e `npm run format`. Pelo Prettier: aspas simples e vírgula final.

## Variações de estilo observadas

O histórico da `develop` (196 commits, dez/2025 a jul/2026) tem **uma única conta de autoria** (`Robert-Martins`). **Não há evidência de gerações distintas de código por autoria ou época**, então não há "gerações" de código a distinguir (conclusão a partir de `git shortlog`).

Há, porém, **divergências de formatação** dentro da mesma base:

| Estilo | Características | Exemplos |
|---|---|---|
| Formatado pelo Prettier do projeto | 2 espaços, aspas simples, vírgula final | a maior parte de `users/`, `patients/`, `insights/`, `core/modules/auth`, `token`, `whatsapp` |
| Fora do Prettier | 4 espaços, sem vírgula final | `core/modules/address/*`, `core/modules/health/*`, `domain/countries`, `modules/doctors/**/entities/*` e `dtos/doctor-registration-validated.dto.ts`, `modules/institutions/aggregates/representative/*` |

## Núcleo e configurações primordiais

⚠️ Itens abaixo são globais: uma alteração errada afeta todas as rotas.

| Elemento | Onde | Papel | O que **não pode quebrar** |
|---|---|---|---|
| Bootstrap | [main.ts](../dr-hugo-back-end/src/main.ts) | Cria o app com CORS e `bufferLogs`, registra pipe/filtro/interceptor/Swagger, escuta em `PORT` | Ordem: `useContainer(...)` precisa existir para os validadores com injeção; `enableShutdownHooks` fecha Redis ao encerrar |
| Módulo raiz | [app.module.ts](../dr-hugo-back-end/src/app.module.ts) | `ConfigModule` global (`configuration.ts`), `ScheduleModule`, `CoreModule`, `ManagerModule`, `DatabaseModule`, guard e interceptors globais | `ConfigModule.isGlobal` (todos os serviços usam `ConfigService`); os 3 validadores de banco como providers |
| `ValidationPipe` | `main.ts` | `transform: true`; converte erros em `BadRequest` com lista de mensagens | Sem `transform`, DTOs deixam de ser instâncias de classe |
| `AuthGuard` (global) | [auth.guard.ts](../dr-hugo-back-end/src/core/config/security/auth.guard.ts) | Exige `Authorization: Bearer` (ou, com `@ApiKeyAuth()`, o cabeçalho `x-api-key`), verifica JWT, valida o perfil (`@Roles`) e carrega o usuário em `request.currentUser` | **Toda rota é protegida por padrão**; só `@Public()` libera |
| `TimeoutInterceptor` | [timeout.interceptor.ts](../dr-hugo-back-end/src/core/config/interceptors/timeout.interceptor.ts) | Aborta após 30 000 ms (a constante se chama `FIVE_MINUTES`, mas vale 30 s) com `400 "Tempo de consulta expirado"` | Uploads/consultas externas devem caber em 30 s |
| `TransformInterceptor` | transform.interceptor.ts | Envelope `{statusCode, data, message}` | O front depende desse formato |
| `AuditInterceptor` | [audit.interceptor.ts](../dr-hugo-back-end/src/core/config/interceptors/audit.interceptor.ts) | Grava auditoria nas rotas com `@Auditable` | Só age se o handler/classe tem `@Auditable` |
| `ClassSerializerInterceptor` | main.ts | Aplica `@Exclude/@Expose/@Transform` dos DTOs | Evita vazar campos marcados com `@Exclude` |
| `AllExceptionsFilter` | exceptions/ | Formato único de erro + log | Mantém o contrato de erro |
| CORS | [security.providers.ts](../dr-hugo-back-end/src/core/config/security/security.providers.ts) | Lista fixa de origens, métodos e cabeçalhos (`x-session-id`, `x-client-fingerprint` incluídos) | Novo domínio de front precisa entrar aqui |
| Swagger | main.ts | Docs em `/docs`, Bearer | — |
| Banco | [database.providers.ts](../dr-hugo-back-end/src/core/config/database/database.providers.ts) | `synchronize: false`; entidades por *glob* `**/*.entity{.ts,.js}`; SSL por `NODE_ENV` | `synchronize` deve continuar `false`; toda entidade precisa terminar em `.entity.ts` |
| `RedisClient` | [redis.client.ts](../dr-hugo-back-end/src/core/modules/cache/redis/redis.client.ts) | Instância singleton | Falha de conexão não derruba o boot, mas derruba recursos que dependem do Redis (chaves de resolução, validação de CRM) |
| `MinioService` | minio.service.ts | Cria buckets `temp` e `users` no primeiro uso | Novos buckets entram em `minio.buckets.ts` |

## Segurança e controle de acesso

- **Autenticação:** `POST /auth/login` recebe `{ login, password, role }` (login = e-mail ou CPF/CNPJ). Devolve `accessToken` e `refreshToken` (mesmo segredo e mesmo payload `{sub, email, role}`; só muda a validade). `POST /auth/refresh-token` troca por um novo par.
- **Perfis (`UserRole`):** `ADMIN`, `PATIENT`, `DOCTOR`, `INSTITUTION` ([enums.ts](../dr-hugo-back-end/src/core/vo/consts/enums.ts)). O mesmo e-mail/CPF/telefone pode existir em perfis diferentes: a unicidade no banco é por (valor, perfil) e o login exige o `role`.
- **Decorators:**
  - `@Public()` — libera a rota/controller do `AuthGuard`.
  - `@ApiKeyAuth()` — autentica por `x-api-key` em vez de JWT (existe, mas nenhuma rota o usa hoje).
  - `@Roles(UserRole.X, ...)` — restringe por perfil (no método ou na classe). **Sem `@Roles`, qualquer usuário autenticado acessa.**
  - `@CurrentUser('id' | undefined)` — injeta o usuário carregado pelo guard.
  - `@Auditable({ eventType, entityName, mode, entityIdExtractor, dataExtractor })` — registra o evento em `dv_audit`.
  - `@NoCache()` — cabeçalhos de não cache (via `NoCacheInterceptor`).
- **Senhas:** bcrypt (`encrypt`/`compare` em `functions.ts`); regra de senha forte em `is-strong-password.validator.ts`.
- **Tokens de uso único** (confirmação de e-mail, recuperação de senha, troca de e-mail/telefone): tabela `dv_token` (código de 6 dígitos + hash). Links de e-mail carregam uma **chave de resolução** (64 hex, Redis, uso único, 24 h), que o front troca pelos dados via `POST /resolution-keys/resolve`.
- **Resposta de recuperação/confirmação:** vários fluxos retornam sucesso mesmo quando o usuário não existe, para não revelar a existência de contas.
- **Nunca** commite `.env` nem copie segredos de produção para a máquina local ([EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#valores-de-produção-a-partir-do-coolify)).

## Banco e migrations: pontos de atenção

Resumo; detalhes em [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md).

- Toda alteração de esquema = **nova migration** em `src/core/config/database/migrations`, nome `<timestamp>-<DescricaoPascalCase>.ts`, SQL explícito via `queryRunner.query` e método `down` coerente.
- O TypeORM só descobre migrations por *glob* (`migrations/**/*{.ts,.js}`) no *data source* do CLI; a **API não executa migrations sozinha** ao subir (o `DatabaseModule` não define `migrationsRun`).
- Nunca edite uma migration já aplicada em produção; crie outra.
- Entidade nova **sem migration** compila, mas as queries falham no banco.

## Checklist para criar um módulo novo

1. Defina as rotas em [paths.ts](../dr-hugo-back-end/src/core/vo/consts/paths.ts) (classe `XxxPaths extends BasePaths`).
2. Crie a entidade `entities/xxx.entity.ts` estendendo `BaseEntity`, com `@Entity({ name: 'dv_xxx' })` e colunas `snake_case`. Enums novos entram em `core/vo/consts/enums.ts`.
3. Crie a **migration** correspondente (tabela `dv_xxx`, FKs nomeadas `FK_dv_xxx_...`, índices `IDX_dv_xxx_...`) e rode `npm run migration:run` localmente.
4. Crie `dtos/` com `class-validator` + `@ApiProperty` (+ mensagens de `validation-messages.ts`).
5. Crie `xxx.repository.ts` (`BaseRepository`, defina `alias`), `xxx.mapper.ts` (`BaseMapper`), `xxx.service.ts` (`BaseService`) e `xxx.controller.ts`.
6. Declare tudo em `xxx.module.ts` (`TypeOrmModule.forFeature([Xxx])`) e **registre o módulo** em `modules/manager.module.ts` (negócio) ou `core/modules/core.module.ts` (transversal).
7. Defina o acesso: rota protegida por padrão; adicione `@Roles(...)` se for restrita a um perfil, `@Public()` só se for realmente pública.
8. Adicione `@Auditable` nas operações que precisam de trilha de auditoria.
9. Documente no Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`).
10. Se o módulo guarda dados pessoais ou de saúde, criptografe no mapper e use hash para busca (ver o parágrafo "Dados pessoais" em [Convenções de código](#convenções-de-código)).
11. Se usa integração externa, crie um `adapter` e coloque as variáveis novas em `configuration.ts` **e** no [.env.example](../dr-hugo-back-end/.env.example); documente em [INTEGRACOES.md](INTEGRACOES.md).
12. Se o módulo introduz uma regra de acesso, atualize [FEATURES_PROJETO.md](FEATURES_PROJETO.md).
13. Rode `npm run lint`, `npm run build` e teste no Swagger local.
