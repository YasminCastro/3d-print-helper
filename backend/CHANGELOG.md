# Changelog

## 2026-08-05

### Corrigido
- **Crash loop do app `backend` no PM2** (`ecosystem.config.js`, `dist/server.js`): o gerador do Prisma Client (`prisma-client`, v7.9.1) emitia código ESM puro (`import.meta.url`) em `src/generated/prisma/client.ts`, incompatível com o projeto, que compila e roda como CommonJS (`"type": "commonjs"` no `package.json`). Isso causava `SyntaxError: Cannot use 'import.meta' outside a module` a cada boot, gerando restarts sucessivos no PM2.
  - Adicionado `moduleFormat = "cjs"` ao bloco `generator client` em `prisma/schema.prisma`.
  - Client regenerado (`npm run db:generate`) e projeto recompilado (`npm run build`).
