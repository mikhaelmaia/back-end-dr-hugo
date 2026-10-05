# Mapa de funcionalidades e acesso

Quais módulos existem, para que servem, **quem pode acessar cada rota** e as principais jornadas do sistema.

> Em caso de conflito entre este documento e o código, **vale o código**. A tabela de rotas foi extraída dos controllers da branch `develop` (decorators `@Public`, `@Roles`) e do [AuthGuard](../dr-hugo-back-end/src/core/config/security/auth.guard.ts). A documentação interativa (`/docs`, ver [EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md#subindo-a-aplicação-e-documentação-da-api)) é gerada do código e traz os detalhes de cada rota.

## Sumário

- [Perfis de usuário](#perfis-de-usuário)
- [Como ler a tabela de acesso](#como-ler-a-tabela-de-acesso)
- [Tabela de acesso por assunto](#tabela-de-acesso-por-assunto)
- [Tempo real: WebSocket](#tempo-real-websocket)
- [Módulos](#módulos)
- [Jornadas principais](#jornadas-principais)

## Perfis de usuário

Definidos em `UserRole` ([enums.ts](../dr-hugo-back-end/src/core/vo/consts/enums.ts)). Cada usuário tem **um** perfil.

| Perfil | Quem é | Como entra no sistema |
|---|---|---|
| `PATIENT` | Paciente | Autocadastro público (`POST /patients`) |
| `DOCTOR` | Médico | Autocadastro público após consulta de CRM no CFM (`POST /doctors`) |
| `INSTITUTION` | Instituição de saúde (clínica, hospital, laboratório etc.) | Autocadastro público após consulta de CNES/CNPJ (`POST /institutions`) |
| `ADMIN` | Administração da plataforma | Não há rota de cadastro; o perfil precisa existir no banco |

O mesmo e-mail, CPF/CNPJ ou telefone pode existir em perfis diferentes (a unicidade é pelo hash do valor **e** o perfil), e o login exige informar o perfil.

Nos vínculos, `InstitutionalUserRole` (`DOCTOR` | `INSTITUTION`) indica **quem recebe** a permissão do paciente.

## Como ler a tabela de acesso

| Marca | Significado |
|---|---|
| **Público** | `@Public()`: não exige token |
| **Logado** | Exige `Authorization: Bearer <accessToken>`, **de qualquer perfil** (não há `@Roles`) |
| **PATIENT / DOCTOR / INSTITUTION / ADMIN** | Exige token e um dos perfis listados |

Existe também a autenticação por API key (cabeçalho `x-api-key`, decorator `@ApiKeyAuth()`), mas **nenhuma rota a utiliza hoje**. Cada usuário recebe uma API key gerada na criação (guardada criptografada).

## Tabela de acesso por assunto

### Autenticação e tokens

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `POST /auth/login` | Público | Login com e-mail ou CPF/CNPJ + senha + perfil; devolve access e refresh token |
| `POST /auth/refresh-token` | Público | Troca um refresh token válido por novo par |
| `POST /auth/password-recovery` | Público | Inicia recuperação de senha (e-mail com código/link) |
| `POST /auth/password-reset` | Público | Conclui a redefinição |
| `POST /auth/resend-email-confirmation` | Público | Reenvia a confirmação de e-mail |
| `POST /auth/confirm-email` | Público | Confirma o e-mail e ativa a conta |
| `POST /token/validate` | Público | Valida o código de 6 dígitos e devolve o *hash* para concluir a operação |
| `POST /resolution-keys/resolve` | Público | Troca a chave do link (`?t=`) pelos dados, uma única vez |

### Cadastros

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `POST /patients` | Público | Cadastra paciente (usuário inativo até confirmar e-mail). Auditado |
| `POST /doctors/lookup` | Público | Consulta o CRM no CFM; resultado em cache por 1 h |
| `POST /doctors` | Público | Cadastra médico; exige a consulta anterior. Auditado |
| `POST /institutions/lookup-cnes` | Público | Consulta o CNES e guarda o resultado em cache |
| `POST /institutions/lookup` | Público | Consulta o CNPJ (ReceitaWS) e guarda em cache |
| `POST /institutions` | Público | Cadastra instituição; exige a consulta de CNES (e, quando aplicável, de CNPJ). Auditado |

### Conta e perfil do usuário logado

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `GET /users/current` | Logado | Dados do usuário autenticado |
| `PATCH /users/profile-picture` | Logado | Envia/troca a foto de perfil (multipart `file`) |
| `GET /users/profile-picture` | Logado | Obtém a foto de perfil (stream) |
| `POST /user-change-requests/request` | Logado | Pede troca de e-mail ou telefone (exige senha atual). E-mail: link por e-mail; telefone: confirmação por WhatsApp. Auditado |
| `POST /user-change-requests/confirm` | Logado | Confirma a troca |
| `GET /patients/current` | Logado | Dados do paciente logado (404 se não for paciente) |
| `GET /doctors/current` | DOCTOR | Dados do médico logado |
| `POST /doctors/current/refresh-data` | DOCTOR | Reconsulta o CFM e atualiza dados/especialidades. Auditado |
| `PATCH /doctors/current/specialties/:id/toggle` | DOCTOR | Ativa/desativa uma especialidade |
| `GET /institutions/current` | INSTITUTION | Dados da instituição logada |
| `PATCH /institutions/current/address` | Logado | Atualiza o endereço da instituição. Auditado |
| `POST /institutions/current/refresh-data` | INSTITUTION | Reconsulta CNES/CNPJ e atualiza os dados. Auditado |


### Área do paciente: ficha, documentos e código de acesso

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `GET` / `PUT /patient-medical-records` | PATIENT | Consulta / atualiza a ficha médica |
| `POST /patient-documents` | PATIENT | Cria documento médico com um ou mais arquivos (enviados antes em `/media/temp`). Auditado |
| `PUT /patient-documents` | PATIENT | Atualiza documento. Auditado |
| `GET /patient-documents/monthly` | PATIENT | Lista documentos agrupados por mês (paginado) |
| `GET /patient-documents/available-filters` | PATIENT | Valores disponíveis para filtros |
| `GET /patient-documents/:id` | PATIENT | Detalhe de um documento |
| `GET /patient-documents/:id/media/:mediaId/stream` | PATIENT | Visualiza um arquivo do documento |
| `GET /patient-documents/:id/download` | PATIENT | Baixa os arquivos (ZIP) |
| `PATCH /patient-documents/:id/rename` | PATIENT | Renomeia. Auditado |
| `DELETE /patient-documents/:id` | PATIENT | Remove. Auditado |
| `POST /patients-access-code` | PATIENT | Gera código de acesso (6 dígitos, 5 min) + QR Code, definindo o destinatário (`role`: médico ou instituição), quais documentos, se o vínculo é permanente e se libera todos os documentos. Auditado |
| `GET /patients-access-code` | PATIENT | Consulta o código ativo, se houver |
| `DELETE /patients-access-code` | PATIENT | Cancela o código ainda não usado |

### Vínculos entre paciente, médicos e instituições (grants)

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `POST /patient-permission-grants` | DOCTOR, INSTITUTION | Cria o vínculo a partir do código/QR do paciente (`t`). Notifica o paciente em tempo real e por WhatsApp. Auditado |
| `PATCH /patient-permission-grants/revoke` | PATIENT, DOCTOR, INSTITUTION | Revoga um vínculo (o paciente revoga qualquer; médico/instituição revoga o próprio). Auditado |
| `PATCH /patient-permission-grants/:id/like` | PATIENT, DOCTOR, INSTITUTION | Marca/desmarca "curtida" (favorito) do vínculo |
| `GET /patient-permission-grants/patients` | DOCTOR, INSTITUTION | Lista pacientes vinculados |
| `GET /patient-permission-grants/patients/:grantId` | DOCTOR, INSTITUTION | Detalhe do paciente vinculado |
| `GET /patient-permission-grants/patients/:grantId/profile-picture` | DOCTOR, INSTITUTION | Foto do paciente |
| `GET /patient-permission-grants/patients/:grantId/medical-record` | DOCTOR | Ficha médica do paciente vinculado |
| `GET /patient-doctor-grants/granted-doctors` (`/:grantId`, `/:grantId/profile-picture`) | PATIENT | Médicos com acesso: lista, detalhe e foto |
| `PATCH /patient-doctor-grants/:id/toggle-document/:documentId` | PATIENT | Libera/bloqueia um documento para o médico |
| `PATCH /patient-doctor-grants/:id/toggle-all-documents` | PATIENT | Libera/bloqueia todos os documentos |
| `PATCH /patient-doctor-grants/:id/toggle-persistent` | PATIENT | Torna o vínculo permanente ou temporário |
| `PATCH /patient-doctor-grants/:id/like` | PATIENT, DOCTOR | Curtida |
| `GET /patient-doctor-grants/:id/documents` (`/available-filters`, `/:documentId`, `/:documentId/media/:mediaId/stream`, `/:documentId/download`) | DOCTOR, PATIENT | Documentos que o médico pode ver e seus arquivos |
| `GET /patient-institution-grants/granted-institutions` (`/:grantId`, `/:grantId/profile-picture`) | PATIENT | Instituições com acesso |
| `PATCH /patient-institution-grants/:id/like` | PATIENT, INSTITUTION | Curtida |
| `GET /patient-institution-grants/:id/documents` (`/available-filters`, `/:documentId`, `…/stream`, `…/download`) | INSTITUTION, PATIENT | Documentos visíveis à instituição |
| `POST` / `PUT /patient-institution-grants/:id/documents`, `PATCH …/:documentId/rename` | INSTITUTION, PATIENT | A instituição (ou o paciente) cria, atualiza e renomeia documentos do paciente por meio do vínculo. Auditado; há modelo de WhatsApp para avisar o paciente do envio |

### Painel (insights)

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `GET /insights/totals` | PATIENT, DOCTOR, INSTITUTION | Totais (documentos, vínculos, pacientes), conforme o perfil |
| `GET /insights/new-patients` | DOCTOR, INSTITUTION | Pacientes vinculados recentemente |
| `GET /insights/patients/:grantId/profile-picture` | DOCTOR, INSTITUTION | Foto do paciente do painel |

### Arquivos

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `POST /media/temp` | Logado | Upload de 1 arquivo (campo `file`, até 50 MB) no bucket temporário |
| `POST /media/temp/multiple` | Logado | Upload de até 20 arquivos (campo `files`, 50 MB cada) |
| `GET /media/temp/:id/stream` | Logado | Visualiza um arquivo do bucket temporário |

Tipos aceitos (pela extensão): PNG, JPG, JPEG, GIF, PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, TXT, HTML, CSV, ODS, RAR, ZIP.

### Dados de apoio (todos públicos)

| Método e rota | Para que serve |
|---|---|
| `GET /domain/enums/:type` | Valores de enum (`BRAZILIAN_STATE`, `DOCTOR_SPECIALIZATION_TYPE`, `MEDICAL_INSTITUTION_TYPE`, `PATIENT_DOCUMENT_TYPE`, `GENDER`) |
| `GET /domain/terms/all`, `/domain/terms/:type` | Termos de uso e política de privacidade (há versões gerais, de paciente e de médico) |
| `GET /domain/countries/all`, `/domain/countries`, `/domain/countries/:acronym` | Países |
| `GET /domain/medical-documents/descriptions/:type` | Sugestões de descrição para documentos médicos por tipo (alimentadas pela tabela TUSS) |
| `GET /address/zip-code/:zipCode` | Endereço a partir do CEP (ViaCEP) |

### Plataforma

| Método e rota | Acesso | Para que serve |
|---|---|---|
| `GET /health` | Público | Estado de PostgreSQL, MinIO e Redis (HTTP 200 com `status: healthy/unhealthy`) |
| `GET /docs` | Público | Swagger UI |
| `GET /audit` (filtros `eventType`, `entityName`, `entityId`, `authorId`) | ADMIN | Lista eventos de auditoria |
| `GET /audit/:id` | ADMIN | Detalhe de um evento |

## Tempo real: WebSocket

- Namespace `/notifications` (Socket.IO) na mesma porta da API. O token JWT é enviado no handshake em `auth.token` (com ou sem prefixo `Bearer `).
- Todos os perfis autenticados podem conectar. Cada conexão entra nas salas `user:<userId>` e `patient:<id>` / `doctor:<id>` / `institution:<id>`, conforme o perfil.
- Evento emitido hoje: `access-code-used` (para o paciente, quando um médico/instituição usa seu código).
- Mensagem aceita do cliente: `ping` → responde `pong`.
- Código: [core/modules/notifications](../dr-hugo-back-end/src/core/modules/notifications).

## Módulos

| Módulo | Pasta | Função |
|---|---|---|
| Usuários | `modules/users` | Conta base de todos os perfis (dados pessoais criptografados, senha, foto, termos, API key); solicitações de troca de e-mail/telefone (`aggregates/change-request`) |
| Pacientes | `modules/patients` | Dados do paciente e agregados: código de acesso (`access-code`), documentos (`documents`), vínculos (`permission-grant`, `doctor-grant`, `institution-grant`) |
| Médicos | `modules/doctors` | Dados do médico, registro (CRM) e especializações validados no CFM; atualização sob demanda |
| Instituições | `modules/institutions` | Dados da instituição, empresa (CNPJ), representante e dados de saúde (CNES) |
| Ficha médica | `modules/medical-records` | Questionário de saúde do paciente |
| Insights | `modules/insights` | Indicadores para o painel |
| Autenticação, tokens, chaves de resolução | `core/modules/auth`, `token`, `resolution-key` | Login, códigos de uso único e links temporários |
| E-mail e WhatsApp | `core/modules/email`, `whatsapp` | Mensagens transacionais (e-mail por SMTP, WhatsApp via Z-API) |
| Notificações | `core/modules/notifications` | WebSocket |
| Mídia | `core/modules/media` | Upload/armazenamento no MinIO, ZIP de downloads |
| Auditoria | `core/modules/audit` | Trilha de eventos com fingerprint do cliente (dados criptografados) |
| Domínio / Endereço | `core/modules/domain`, `address` | Enums, termos, países, descrições de documentos (TUSS) e CEP |
| Externos | `core/modules/external` | Clientes de CFM, ReceitaWS, ViaCEP, CNES e Z-API |
| Cache, Cripto, QR, Health | `core/modules/*` | Infraestrutura de apoio |

Detalhes técnicos em [PADRAO_DE_PROJETO.md](PADRAO_DE_PROJETO.md); tabelas em [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md); integrações em [INTEGRACOES.md](INTEGRACOES.md).

## Jornadas principais

1. **Cadastro de paciente:** `POST /patients` (aceitando termos) → usuário **inativo** → e-mail com link/código → o front resolve a chave (`/resolution-keys/resolve`), valida o código (`/token/validate`) e chama `POST /auth/confirm-email` → conta ativa → login.
2. **Cadastro de médico:** `POST /doctors/lookup` (CRM, UF, CPF, especialidades) → CFM consultado e resultado em cache por 1 h → `POST /doctors` com o mesmo CPF → usuário inativo; o resultado da validação é registrado em `is_valid` → confirmação de e-mail → login.
3. **Cadastro de instituição:** `POST /institutions/lookup-cnes` (e `/lookup` para o CNPJ) → `POST /institutions` → confirmação de e-mail → login.
4. **Login e sessão:** `POST /auth/login` → `accessToken` + `refreshToken`; renovação em `POST /auth/refresh-token`.
5. **Recuperação de senha:** `POST /auth/password-recovery` → e-mail → `POST /auth/password-reset`.
6. **Troca de e-mail/telefone:** `POST /user-change-requests/request` (senha atual) → confirmação por e-mail (novo endereço) ou WhatsApp (novo telefone) → `POST /user-change-requests/confirm`.
7. **Ficha médica e documentos do paciente:** o paciente preenche a ficha (`/patient-medical-records`) e cadastra documentos: upload em `/media/temp` → `POST /patient-documents` (os arquivos são movidos para o bucket `patient-documents`).
8. **Compartilhar com médico ou instituição:** o paciente gera o código/QR (`POST /patients-access-code`) escolhendo o destinatário, os documentos e se o vínculo é permanente → o médico/instituição lê o QR e chama `POST /patient-permission-grants` → o paciente recebe notificação em tempo real e por WhatsApp → o destinatário consulta pacientes e documentos liberados; o paciente pode liberar/bloquear documentos, tornar o vínculo permanente ou revogá-lo.
9. **Expiração automática:** vínculos de **instituição** não permanentes são revogados após 15 dias; o acesso a **todos** os documentos concedido a um médico em vínculo não permanente é "congelado" após 24 h (ver [INTEGRACOES.md](INTEGRACOES.md#tarefas-agendadas)).
10. **Painel:** `GET /insights/totals` e `/insights/new-patients`.
