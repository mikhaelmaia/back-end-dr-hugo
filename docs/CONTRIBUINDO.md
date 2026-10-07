# Contribuindo

Padrões de branches, commits e Pull Requests do projeto, extraídos do histórico do Git.

> **Como ler:** o histórico considerado são os 196 commits da `develop` (dez/2025 – jul/2026) e os 13 *merge commits* de PR da `main`.

## Sumário

- [Branches](#branches)
- [Commits](#commits)
- [Pull Requests e merges](#pull-requests-e-merges)
- [Checklist antes do PR](#checklist-antes-do-pr)
- [Regras inegociáveis](#regras-inegociáveis)

## Branches

| Branch | Papel | Origem |
|---|---|---|
| `main` | Recebeu os PRs `develop` → `main` até 19/02/2026 (#13); hoje está defasada em relação à `develop` | Histórico e responsável do projeto |
| `develop` | Branch de trabalho. **Push nela dispara o deploy de produção no Coolify** | Responsável do projeto |
| `feature/<nome>` | Trabalho de cada funcionalidade | Convenção informada pelo responsável. O remoto só tem `main` e `develop`; os commits do histórico foram feitos direto em `develop` |

## Commits

Padrão do histórico: **Conventional Commits em português**:

```text
<tipo>(<escopo>): <descrição no infinitivo, em minúsculas>
```

Exemplos reais:

```text
feat(medical-records): implementar módulo de ficha médica para atualização e consulta
fix(build): ajustar nixpack build
fix(deploy): ajustar cors
feat(email): ajustar template de emails
```

| Aspecto | Histórico |
|---|---|
| Tipos | `feat` (188) e `fix` (8). Commits de documentação, como "atualizar termos de uso", saem como `feat(docs)` |
| Escopo | Quase sempre presente, em inglês e minúsculo: `base-project` (26), `app` (19), `user` (11), `institution` (9), `swagger`, `email`, `doctors`/`doctor`, `media`… |
| Singular e plural no escopo | Alternam: `user`/`users`, `doctor`/`doctors`, `institution`/`institutions`, `patient`/`patients`, `medical-record`/`medical-records` |
| Idioma | Descrição em português do Brasil; tipo e escopo em inglês |
| Verbo | Infinitivo ("implementar", "ajustar", "definir", "remover") |
| Mensagens genéricas | `melhorias gerais` / `general fixes` somam 11 ocorrências |
| Variações de formato | `feat (base-project): initial commit` (espaço antes do parêntese) e `feat(auth); finalizar contexto de autenticação` (`;` no lugar de `:`) |
| Corpo e rodapé | Não utilizados |
| Tamanho | Um commit costuma conter uma mudança única |

## Pull Requests e merges

Histórico: 13 PRs, todos `develop` → `main` (jan–fev/2026), mesclados pelo GitHub com *merge commit* (`Merge pull request #N from mikhaelmaia/develop`); o corpo dos últimos é `Hotfix: Ajustes Gerais`. Depois disso, o trabalho foi commitado direto na `develop` (história linear, sem novos PRs).

## Checklist antes do PR

- [ ] `npm run lint` e `npm run build` passam em `dr-hugo-back-end/`.
- [ ] Nenhum `.env`, segredo ou dado pessoal real no diff.
- [ ] Se mexeu em entidade: migration criada e testada (`migration:run`/`migration:revert`).
- [ ] Variáveis novas em `configuration.ts` e em `.env.example`, e cadastradas no Coolify antes do deploy.
- [ ] Rotas novas: constantes em `paths.ts`, regra de acesso definida (`@Public`/`@Roles`), Swagger documentado.
- [ ] Documentação em `docs/` atualizada ([FEATURES_PROJETO.md](FEATURES_PROJETO.md) para rotas e acessos, [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) para tabelas, [INTEGRACOES.md](INTEGRACOES.md) para integrações).
- [ ] Testado localmente pelo Swagger ([EXECUCAO_LOCAL.md](EXECUCAO_LOCAL.md)).

## Regras inegociáveis

1. **Nunca** commitar segredos, `.env` ou credenciais. O `.env.example` não leva valores reais.
2. **Nunca** copiar segredos ou dados de produção para a máquina local (dados de saúde e pessoais).
3. **Nunca** rodar `schema:drop`/`schema:sync` contra produção e **nunca** editar uma migration já aplicada.
4. `synchronize` do TypeORM continua `false`: o esquema só muda por migration.
5. A `develop` publica em produção: o que entra nela vai ao ar.
