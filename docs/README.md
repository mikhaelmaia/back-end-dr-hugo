# Documentação técnica — Doutor Viu Back-End

Índice da documentação do back-end. Descreve a branch **`develop`** (a que o Coolify publica). Todos os documentos estão em português do Brasil. Em caso de conflito entre a documentação e o código, **vale o código**.

## Documentos

| Documento | Quando ler |
|---|---|
| [EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md) | Vai rodar o projeto na sua máquina, criar o banco, preencher o `.env` ou precisa da tabela de variáveis |
| [PADRAO_DE_PROJETO.md](PADRAO_DE_PROJETO.md) | Vai escrever código: estrutura, camadas, convenções, configurações globais, checklist de módulo novo |
| [FEATURES_PROJETO.md](FEATURES_PROJETO.md) | Quer saber o que o sistema faz e **quem pode acessar cada rota** |
| [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) | Vai mexer em tabelas, migrations, enums ou fazer backup |
| [INTEGRACOES.md](INTEGRACOES.md) | Vai trabalhar com CFM, ReceitaWS, ViaCEP, e-mail, MinIO, Redis ou tarefas agendadas |
| [DEPLOY.md](DEPLOY.md) | Vai publicar em produção, verificar um deploy ou fazer rollback |
| [COOLIFY.md](COOLIFY.md) | Precisa mexer no Coolify: containers, variáveis, branch do deploy, acesso ao banco, logs |
| [CONTRIBUINDO.md](CONTRIBUINDO.md) | Vai abrir branch, commit ou PR |

## Trilhas por objetivo

**Sou novo no projeto**
1. [README da raiz](../README.md) → 2. [EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md) → 3. [FEATURES_PROJETO.md](FEATURES_PROJETO.md) → 4. [PADRAO_DE_PROJETO.md](PADRAO_DE_PROJETO.md) → 5. [CONTRIBUINDO.md](CONTRIBUINDO.md)

**Vou implementar uma funcionalidade**
[PADRAO_DE_PROJETO.md](PADRAO_DE_PROJETO.md) (checklist de módulo) → [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) (se houver tabela) → [INTEGRACOES.md](INTEGRACOES.md) (se houver sistema externo) → [FEATURES_PROJETO.md](FEATURES_PROJETO.md) (atualizar acessos) → [CONTRIBUINDO.md](CONTRIBUINDO.md)

**Vou publicar**
[DEPLOY.md](DEPLOY.md) (checklist e verificação) → [COOLIFY.md](COOLIFY.md) → [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) (se tem migration)

**Estou em um incidente**
[DEPLOY.md](DEPLOY.md#sintomas-e-causas) (sintomas) → [COOLIFY.md](COOLIFY.md#diagnóstico-rápido) (logs, containers, variáveis) → [INTEGRACOES.md](INTEGRACOES.md) (serviço externo) → [DEPLOY.md](DEPLOY.md#rollback) (rollback)

## Outros arquivos de referência

| Arquivo | Conteúdo |
|---|---|
| [dr-hugo-back-end/.env.example](../dr-hugo-back-end/.env.example) | Modelo comentado de variáveis de ambiente |
| [Swagger local](http://localhost:3000/docs) / `https://api.doutorviu.com.br/docs` | Documentação interativa da API (gerada do código) |

Não havia documentação anterior dentro de `docs/` (a pasta foi criada junto com estes documentos). O único texto prévio era o README padrão do NestJS em `dr-hugo-back-end/README.md`, que passou a apontar para este índice.
