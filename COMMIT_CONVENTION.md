# Padrão de Commits

> Este documento é apenas um guia de referência para o desenvolvedor. **O Claude nunca deve criar commits neste repositório** — commits são sempre feitos manualmente pelo usuário.

Este é um monorepo com três projetos independentes (`backend/`, `frontend/`, `mobile/`). Cada diretório tem seu próprio escopo de commit, prefixado no início da mensagem.

## Formato geral

```
<escopo>(<tipo>): <descrição curta no imperativo>

[corpo opcional explicando o porquê]

[rodapé opcional: refs, breaking changes]
```

- **escopo**: `backend`, `frontend`, `mobile` ou `geral` (mudanças que afetam mais de um projeto, ex.: `CLAUDE.md`, configs na raiz, docs).
- **tipo**: segue [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
  - `feat` — nova funcionalidade
  - `fix` — correção de bug
  - `refactor` — mudança de código sem alterar comportamento
  - `chore` — tarefas de manutenção (deps, configs, build)
  - `docs` — documentação
  - `test` — testes
  - `style` — formatação, sem mudança de lógica
  - `perf` — melhoria de performance
- **descrição**: minúscula, sem ponto final, no imperativo ("adiciona", "corrige", não "adicionado"/"corrigindo").

### Exemplo geral

```
geral(chore): atualiza CLAUDE.md com instruções do backend
```

---

## `backend/` — API Express + TypeScript

Escopo: `backend`. Use o domínio afetado como contexto quando fizer sentido (`auth`, `users`, `db`, `middleware`, `docs`).

Exemplos:
```
backend(feat): adiciona endpoint de listagem de usuários
backend(fix): corrige validação de token JWT expirado
backend(refactor): move lógica de hash para users.service
backend(chore): atualiza dependências do tsyringe
backend(docs): atualiza swagger.yaml com novo schema de erro
backend(test): adiciona testes unitários para users.service
```

---

## `frontend/` — Next.js (tracker de impressão 3D)

Escopo: `frontend`. Use a entidade de domínio como contexto quando fizer sentido (`printers`, `filaments`, `brands`, `calibrations`, `prints`, `journal`, `settings`, `db`).

Exemplos:
```
frontend(feat): adiciona filtro por marca na página de filamentos
frontend(fix): corrige cálculo de custo em prints com múltiplos filamentos
frontend(refactor): extrai lógica de recalculo para print-calculations
frontend(chore): atualiza shadcn/ui para versão mais recente
frontend(style): ajusta espaçamento no card de impressora
```

---

## `mobile/`

Ainda não iniciado. Ao começar o desenvolvimento, seguir o mesmo padrão:

```
mobile(feat): ...
mobile(fix): ...
mobile(chore): ...
```

---

## Regras gerais

1. Um commit deve conter uma única mudança lógica — evitar misturar `feat` com `refactor` não relacionado no mesmo commit.
2. Mudanças em mais de um diretório (`backend/` + `frontend/`, por exemplo) devem, quando possível, ser separadas em commits distintos por escopo.
3. Mensagens no português ou inglês, mas mantenha consistência dentro de uma mesma sequência de commits.
4. Breaking changes devem ser sinalizados com `!` após o tipo, ex.: `backend(feat)!: remove endpoint legado de login`.
