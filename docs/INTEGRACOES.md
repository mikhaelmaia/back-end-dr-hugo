# Integrações

Sistemas externos com que o back-end conversa (APIs de terceiros, e-mail, WhatsApp, armazenamento, cache), notificações em tempo real, tarefas agendadas e como testá-los com segurança. Descreve a branch `develop`.

## Sumário

- [Visão geral](#visão-geral)
- [CFM — consulta de médicos](#cfm--consulta-de-médicos)
- [CNES — estabelecimentos de saúde](#cnes--estabelecimentos-de-saúde)
- [ReceitaWS — consulta de CNPJ](#receitaws--consulta-de-cnpj)
- [ViaCEP — consulta de CEP](#viacep--consulta-de-cep)
- [SMTP — e-mail](#smtp--e-mail)
- [Z-API — WhatsApp](#z-api--whatsapp)
- [MinIO — arquivos](#minio--arquivos)
- [Redis — cache e chaves temporárias](#redis--cache-e-chaves-temporárias)
- [WebSocket — notificações em tempo real](#websocket--notificações-em-tempo-real)
- [Webhooks e chamadas de entrada](#webhooks-e-chamadas-de-entrada)
- [Tarefas agendadas](#tarefas-agendadas)
- [Como testar localmente](#como-testar-localmente)
- [Riscos de testar contra produção](#riscos-de-testar-contra-produção)
- [Pontos de atenção operacionais](#pontos-de-atenção-operacionais)

## Visão geral

| Integração | Direção | Finalidade | Autenticação | Variáveis | Código |
|---|---|---|---|---|---|
| CFM | Saída (SOAP/HTTP) | Validar CRM, situação e especialidades do médico | Chave no corpo do XML | `CFM_*` | [cfm.service.ts](../dr-hugo-back-end/src/core/modules/external/cfm/cfm.service.ts), [doctor.adapter.ts](../dr-hugo-back-end/src/modules/doctors/doctor.adapter.ts) |
| CNES | Saída (REST) | Validar o CNES e obter dados do estabelecimento de saúde | Nenhuma no código | `CNES_*` | [cnes.service.ts](../dr-hugo-back-end/src/core/modules/external/cnes/cnes.service.ts), [institution.adapter.ts](../dr-hugo-back-end/src/modules/institutions/institution.adapter.ts) |
| ReceitaWS | Saída (REST) | Validar CNPJ e obter dados da empresa/representante | Nenhuma | `RECEITAWS_*` | [receitaws.service.ts](../dr-hugo-back-end/src/core/modules/external/receitaws/receitaws.service.ts) |
| ViaCEP | Saída (REST) | Endereço a partir do CEP | Nenhuma | `VIA_CEP_*` | [viacep.service.ts](../dr-hugo-back-end/src/core/modules/external/viacep/viacep.service.ts), [address.adapter.ts](../dr-hugo-back-end/src/core/modules/address/address.adapter.ts) |
| SMTP | Saída | E-mails transacionais | Usuário/senha SMTP | `SMTP_*` | [core/modules/email](../dr-hugo-back-end/src/core/modules/email) |
| Z-API | Saída (REST) | Mensagens de WhatsApp | Token na URL + `Client-Token` | `ZAPI_*` | [z-api.service.ts](../dr-hugo-back-end/src/core/modules/external/z-api/z-api.service.ts), [core/modules/whatsapp](../dr-hugo-back-end/src/core/modules/whatsapp) |
| MinIO | Saída (S3) | Guardar arquivos | Chave de acesso/secreta | `MINIO_*` | [core/modules/media](../dr-hugo-back-end/src/core/modules/media) |
| Redis | Saída (TCP) | Cache e chaves de uso único | Senha opcional | `REDIS_*` | [core/modules/cache](../dr-hugo-back-end/src/core/modules/cache) |
| PostgreSQL | Saída (TCP) | Banco principal | Usuário/senha | `DATABASE_*` | [config/database](../dr-hugo-back-end/src/core/config/database) |
| Front-end | **Entrada** (HTTP e WebSocket) | Consome a API e recebe notificações | JWT Bearer | CORS fixo no código | [security.providers.ts](../dr-hugo-back-end/src/core/config/security/security.providers.ts) |

Todas as chamadas HTTP de saída usam `@nestjs/axios` com timeout configurável e o cabeçalho `User-Agent: {DV_APP_NAME}/{DV_APP_VERSION}`.

## CFM — consulta de médicos

- **Uso:** `POST /doctors/lookup` e `POST /doctors/current/refresh-data` chamam `CfmService.consultDoctor` (SOAP `Consultar`: `crm`, `uf`, `chave`), interpretando o XML por expressões regulares.
- **Regra de validade** (`DoctorAdapter`): situação `'A'` (Regular) **e** coerência de generalista/especialidades **e** (ser generalista **ou** todas as especialidades informadas existirem no CFM).
- **Efeito:** resultado gravado no Redis por **1 hora** (chave `doctor-validation:<cpf>`). `POST /doctors` só funciona com essa consulta recente para o mesmo CPF.
- **Erros tratados:** timeout, médico não encontrado, falha genérica.
- Sem `CFM_API_URL`/`CFM_API_KEY` a aplicação sobe e apenas registra erro.

## CNES — estabelecimentos de saúde

- **Uso:** `POST /institutions/lookup-cnes` chama `GET {CNES_API_URL}{CNES_ESTABLISHMENT_PATH}/{cnes}`. A resposta é validada (exige `codigo_cnes` e `nome_razao_social`), convertida para dados da instituição e, quando traz CNPJ, esse CNPJ é guardado para a consulta seguinte.
- **Efeito:** cache de 1 h (`cnes-institution-<cnes>` e `cnpj-from-cnes-<cnpj>`). `POST /institutions` **exige** CNES válido; o CNPJ (ReceitaWS) é consultado quando aplicável.
- **Atualização:** `POST /institutions/current/refresh-data` reconsulta CNES/CNPJ.
- Sem `CNES_API_URL`/`CNES_ESTABLISHMENT_PATH` o app sobe e registra erro; o cadastro de instituições falha.

## ReceitaWS — consulta de CNPJ

- **Uso:** `POST /institutions/lookup` chama `GET {RECEITAWS_API_URL}{RECEITAWS_COMPANY_DATA_PATH}/{cnpj}`.
- **Regra de validade:** situação `ATIVA`/`ATIVO` (sem diferenciar maiúsculas).
- **Efeito:** cache de 1 h (`institution-validation-<cnpj>`).
- **Erros tratados:** HTTP 429 (`RATE_LIMIT`), timeout, resposta `status: "ERROR"`, dados incompletos.
- A ReceitaWS limita o número de consultas por minuto no plano gratuito *(informação geral do serviço, não do repositório)*.

## ViaCEP — consulta de CEP

- **Uso:** `GET /address/zip-code/:zipCode` (público) remove não dígitos e chama `GET {VIA_CEP_API_URL}/{cep}/json`.
- **Erros:** CEP inexistente → `400 "CEP não encontrado"`; timeout/falha → mensagem de erro.

## SMTP — e-mail

- **Como envia:** `EmailHelper` monta a mensagem e o `EmailService` envia **de forma síncrona** (a fila em segundo plano da `main` foi removida). **Se o envio falha, o erro sobe** e o fluxo que o chamou falha (por exemplo, um cadastro que acabou de gravar o usuário).
- **Transporte:** host/porta/usuário/senha do ambiente, `secure: true` fixo (TLS implícito) e remetente = `SMTP_USERNAME`.
- **Templates (EJS):** [templates](../dr-hugo-back-end/src/core/modules/email/templates) — cadastro, confirmação de e-mail, redefinição de senha, troca de e-mail. Os `.ejs` são copiados para `dist/` no build.
- **Links:** `{DV_WEB_BASE_URL}{DV_WEB_*_PATH}?t=<chave>`; a chave é de uso único e vale 24 h (Redis).
- **Log estruturado:** cada envio registra `[COMM] channel=email status=started|success|failed … template=…`.

## Z-API — WhatsApp

- **Uso:** `WhatsAppHelper` monta mensagens a partir de modelos (`whatsapp.consts.ts`) e o `ZApiService` envia por `POST {ZAPI_API_URL}/instances/{ZAPI_INSTANCE_ID}/token/{ZAPI_TOKEN}/send-text` ou `send-button-actions` (com botão/link), com o cabeçalho `Client-Token`.
- **Mensagens:** confirmação e aviso de troca de telefone; paciente vinculado a médico/instituição; médico/instituição que recebeu um paciente; instituição que enviou documento ao paciente.
- **Falha:** o envio é tolerante — se a mensagem com botão falha, tenta texto simples; erros são tratados (timeout, 401, 400, 5xx) e apenas **logados** (`[COMM] channel=whatsapp status=… recipient=…`). Os fluxos de vínculo disparam o WhatsApp sem aguardar o resultado.
- Sem `ZAPI_*` o app sobe e as mensagens não são enviadas.

## MinIO — arquivos

- Buckets `temp`, `users` e `patient-documents`, criados no primeiro uso. Até 10 tentativas de conexão com espera crescente.
- Upload: extensão validada contra `MediaType`; nome do objeto = UUID + extensão; limite de 50 MB por arquivo (20 no upload múltiplo). Mídias têm **dono** (`owner_user_id`) e as leituras verificam a posse; os endpoints de vínculo usam leitura "concedida".
- Foto de perfil vai ao bucket `users`; uploads gerais vão a `temp` e são **movidos** ao bucket `patient-documents` quando o documento é salvo.
- Downloads de vários arquivos são entregues como ZIP (`archiver`).
- O cliente usa `MINIO_PORT` e modo *path-style*.

## Redis — cache e chaves temporárias

| Uso | Chave | TTL |
|---|---|---|
| Chave de resolução dos links de e-mail/WhatsApp | `resolution:<64 hex>` | 24 h; apagada ao ser resolvida |
| Chave de resolução do QR Code do paciente | `resolution:<64 hex>` | 5 min |
| Validação de CRM | `doctor-validation:<cpf>` | 1 h |
| Validação de CNES / CNPJ | `cnes-institution-<cnes>`, `cnpj-from-cnes-<cnpj>`, `institution-validation-<cnpj>` | 1 h |
| Consultas TUSS | definido pelo serviço | 5 min |
| Cache genérico (`CacheService`) | definido por quem chama | `REDIS_TTL` (padrão 60 s) |

## WebSocket — notificações em tempo real

- Gateway Socket.IO no namespace `/notifications`, na mesma porta da API. Autentica pelo JWT enviado em `auth.token` no handshake; conexões sem token válido são derrubadas.
- O `NotificationsService` emite para salas por usuário e por perfil. Evento atual: `access-code-used`.
- O CORS do gateway é configurado à parte, no próprio decorator `@WebSocketGateway`, e não segue a lista do CORS HTTP.
- Detalhes em [FEATURES_PROJETO.md](FEATURES_PROJETO.md#tempo-real-websocket).

## Webhooks e chamadas de entrada

**Não há webhooks** nem endpoints de callback de terceiros. As únicas chamadas de entrada são do front-end (HTTP e WebSocket) e de ferramentas como o Swagger. Não há validação de assinatura de terceiros porque nenhum terceiro chama a API.

Rotas públicas relevantes para operações automatizadas: `GET /health`, `POST /auth/*`, `POST /token/validate`, `POST /resolution-keys/resolve`.

## Tarefas agendadas

Registradas com `@nestjs/schedule` (`@Cron`) e executadas **dentro do próprio processo da API**. Com mais de uma instância, cada uma executa (hoje as operações são idempotentes).

| Frequência | Tarefa | Onde | Efeito |
|---|---|---|---|
| A cada minuto | `deleteExpiredTokens` | [token.service.ts](../dr-hugo-back-end/src/core/modules/token/token.service.ts) | Apaga tokens expirados |
| A cada minuto | `deleteExpiredAccessCodes` | [patient-access-code.service.ts](../dr-hugo-back-end/src/modules/patients/aggregates/access-code/patient-access-code.service.ts) | Apaga códigos de acesso expirados e não usados |
| A cada minuto | `updateExpiredRequests` | [user-change-request.service.ts](../dr-hugo-back-end/src/modules/users/aggregates/change-request/user-change-request.service.ts) | Marca solicitações vencidas como `EXPIRED` |
| A cada 5 minutos | `deleteExpiredRequests` | idem | Apaga solicitações expiradas |
| A cada minuto | `revokeExpiredNonPersistentGrants` | [patient-permission-grant.service.ts](../dr-hugo-back-end/src/modules/patients/aggregates/permission-grant/patient-permission-grant.service.ts) | Revoga vínculos **de instituição** não permanentes criados há 15 dias ou mais |
| A cada minuto | `expireAllDocumentsAccessForNonPersistentGrants` | [doctor-grant.service.ts](../dr-hugo-back-end/src/modules/patients/aggregates/doctor-grant/doctor-grant.service.ts) | Para vínculos de médico não permanentes com acesso a todos os documentos há 24 h ou mais, "congela" a lista de documentos e encerra o acesso total |
| A cada hora | `cleanupTempFiles` | [media.service.ts](../dr-hugo-back-end/src/core/modules/media/media.service.ts) | Remove do MinIO e de `dv_media` as mídias do bucket `temp` com mais de 1 dia |

Na inicialização, `TuusCategoryService` também importa o CSV de procedimentos TUSS para `dv_tuus_category`.

## Como testar localmente

Pré-requisito: API rodando ([EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md)). Os exemplos usam `curl`. No Windows PowerShell use `curl.exe` (o `curl` é alias de outro comando) ou, mais simples, o **Swagger** em `http://localhost:3000/docs`.

```bash
# Saúde dos serviços (PostgreSQL, MinIO, Redis)
curl http://localhost:3000/health

# ViaCEP (via API)
curl http://localhost:3000/address/zip-code/01001000

# Login (troque os valores)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"<email-ou-cpf>","password":"<senha>","role":"PATIENT"}'

# Rota protegida
curl http://localhost:3000/users/current -H "Authorization: Bearer <accessToken>"

# Upload de arquivo
curl -X POST http://localhost:3000/media/temp -H "Authorization: Bearer <accessToken>" -F "file=@./exemplo.pdf"
```

Para o WebSocket, use qualquer cliente Socket.IO conectando em `http://localhost:3000/notifications` com `auth: { token: "<accessToken>" }` e envie `ping`.

| Integração | Como testar sem tocar em produção |
|---|---|
| CFM | Peça ao responsável uma URL/chave de teste. Não use a chave de produção. |
| CNES / ReceitaWS / ViaCEP | APIs públicas: use as URLs reais com códigos de exemplo públicos, respeitando limites. |
| SMTP | Conta de teste ou capturador de e-mails ([EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#credenciais-de-serviços-de-terceiros)). Lembre que a falha de envio derruba o fluxo. |
| Z-API | Instância de teste, com seu próprio número; sem `ZAPI_*` as mensagens só falham no log. |
| MinIO / Redis / PostgreSQL | Containers do `docker-compose.yml`. |
| Links de e-mail | Procure no Redis a chave `resolution:*` ou use a tabela `dv_token` para obter o código sem depender do e-mail. |

## Riscos de testar contra produção

- **CFM:** cada consulta usa a cota/contrato da chave de produção e envolve dados de profissionais reais.
- **ReceitaWS:** limite de consultas; excedê-lo gera `RATE_LIMIT` também para usuários reais.
- **SMTP e Z-API de produção:** enviam mensagens **reais** a pessoas reais, em nome da empresa.
- **MinIO/Redis/PostgreSQL de produção:** dados de saúde e pessoais; limpar o cache (`flushAll`) apaga links e validações em andamento.
- O banco de produção não é acessível de fora da rede do Coolify; testes "de fora" devem usar a API pública (`https://api.doutorviu.com.br`) com contas de teste criadas por você.

## Pontos de atenção operacionais

- **Transações no cadastro:** `POST /patients`, `/doctors` e `/institutions` gravam usuário, token de confirmação, perfil e o envio do e-mail de boas-vindas dentro de **uma única transação** (`runInTransaction`, ver [PADRAO_DE_PROJETO.md](PADRAO_DE_PROJETO.md#transações)). Se qualquer etapa falhar (SMTP, CRM duplicado, banco), nada é mantido e o usuário pode repetir o cadastro. Limitação: o e-mail é enviado antes do commit, então, se o commit falhar depois do envio, a pessoa pode receber um e-mail de um cadastro que não existe. O `refresh-data` do médico já usava transação própria.
- **Dependência de cache:** `POST /doctors` e `POST /institutions` dependem da consulta prévia (1 h). Se o Redis reiniciar, o usuário precisa repetir a consulta; links de e-mail e QR em circulação também deixam de funcionar.
- **Parâmetros obrigatórios:** `CFM_API_URL`+`CFM_API_KEY`; `CNES_API_URL`+`CNES_ESTABLISHMENT_PATH`; `RECEITAWS_API_URL`+`RECEITAWS_COMPANY_DATA_PATH`; `VIA_CEP_API_URL`; `SMTP_*`; `ZAPI_*`; `DV_WEB_*`. Faltando, o app sobe e a funcionalidade falha ([EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#referência-das-variáveis)).
- **Mudança de domínio do front:** atualize `DV_WEB_BASE_URL` **e** a lista de origens do CORS em `security.providers.ts` (exige novo deploy). Links já enviados continuam apontando para o domínio antigo.
- **Mudança de URL/credencial de terceiros:** altere a variável no Coolify e reinicie o app ([COOLIFY.md](COOLIFY.md)).
- **Arquivos lidos de `src/`:** termos legais, países e o CSV TUSS são lidos de `process.cwd()/src/core/resources/...`; o app precisa rodar com o diretório `src/` presente (é o caso do build por Nixpacks em produção).
- **Timeout:** toda requisição é abortada em 30 s (`TimeoutInterceptor`), igual ao timeout padrão da ReceitaWS e do CNES. As rotas de upload (`/media/temp`, `/media/temp/multiple`, `PATCH /users/profile-picture`) usam `@RequestTimeout(UPLOAD_REQUEST_TIMEOUT_MS)`, de 5 minutos, para não derrubar envios em conexões lentas.
