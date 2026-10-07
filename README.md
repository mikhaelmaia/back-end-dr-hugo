# Doutor Viu — Back-End

API do sistema médico Doutor Viu: cadastro e autenticação de pacientes, médicos e instituições; ficha médica e documentos do paciente; compartilhamento controlado com médicos e instituições por código/QR (vínculos); notificações por WhatsApp e em tempo real; validação de CRM (CFM), CNES e CNPJ.

- Repositório: <https://github.com/mikhaelmaia/back-end-dr-hugo>
- Produção: `https://api.doutorviu.com.br` — documentação interativa em `/docs`, saúde em `/health`
- Código da aplicação: pasta [dr-hugo-back-end/](dr-hugo-back-end/)

## Stack

NestJS 11 · TypeScript · PostgreSQL (TypeORM) · Redis · MinIO · JWT · Socket.IO · Swagger · Docker · hospedagem no Coolify.

## Início rápido

Pré-requisitos: Node 20, Docker (para Postgres/Redis/MinIO). Detalhes e problemas comuns em [docs/EXECUCAO_LOCAL.md](docs/EXECUCAO_LOCAL.md).

```bash
git clone https://github.com/mikhaelmaia/back-end-dr-hugo.git
cd back-end-dr-hugo
git checkout develop            # branch de trabalho e de produção
cd dr-hugo-back-end
cp .env.example .env            # preencha (ver docs/EXECUCAO_LOCAL.md)
npm ci
docker compose up -d postgres redis minio
npm run migration:run
npm run start:dev               # http://localhost:3000/docs
```

## Documentação

| Documento | Quando ler |
|---|---|
| [docs/EXECUCAO_LOCAL.md](docs/EXECUCAO_LOCAL.md) | Rodar o projeto localmente; variáveis de ambiente |
| [docs/PADRAO_DE_PROJETO.md](docs/PADRAO_DE_PROJETO.md) | Escrever código no padrão do projeto |
| [docs/FEATURES_PROJETO.md](docs/FEATURES_PROJETO.md) | Saber o que existe e quem acessa cada rota |
| [docs/BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md) | Tabelas, migrations, backup |
| [docs/INTEGRACOES.md](docs/INTEGRACOES.md) | CFM, ReceitaWS, ViaCEP, e-mail, MinIO, Redis, cron |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Publicar, verificar e fazer rollback |
| [docs/COOLIFY.md](docs/COOLIFY.md) | Operar o Coolify (containers, variáveis, branch do deploy) |
| [docs/CONTRIBUINDO.md](docs/CONTRIBUINDO.md) | Branches, commits e PRs |

Índice completo e trilhas por objetivo (novo no projeto, implementar, publicar, incidente): [docs/README.md](docs/README.md).

## Comandos principais

Dentro de `dr-hugo-back-end/`:

| Comando | Para quê |
|---|---|
| `npm run start:dev` | Servidor com *watch* |
| `npm run build` / `npm run start:prod` | Compilar e rodar o build |
| `npm run lint` / `npm run format` | Lint (com `--fix`) e Prettier |
| `npm run migration:run` / `migration:revert` | Aplicar / desfazer migrations |
| `npm run migration:generate -- <caminho>` | Gerar migration a partir das entidades |
| `npm test` | Testes (hoje sem testes reais) |

## Estrutura resumida

```text
.
├── docs/                   # documentação técnica (este índice)
└── dr-hugo-back-end/       # aplicação NestJS
    ├── src/
    │   ├── core/           # infraestrutura e módulos transversais (auth, e-mail, mídia, auditoria…)
    │   └── modules/        # módulos de negócio (users, patients, doctors, institutions, medical-records, insights)
    ├── Dockerfile          # não usado em produção (o build é por Nixpacks)
    └── docker-compose.yml  # Postgres, Redis e MinIO para desenvolvimento
```

## Branches e deploy

`develop` é a branch de trabalho e **o push nela dispara o deploy em produção** (Coolify); a `main` está defasada. Fluxo e regras em [docs/CONTRIBUINDO.md](docs/CONTRIBUINDO.md) e [docs/DEPLOY.md](docs/DEPLOY.md).
