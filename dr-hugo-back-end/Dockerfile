# =========================
# Stage 1 - Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas arquivos necessários para instalar dependências
COPY package*.json ./

RUN npm ci

# Copia o restante do código
COPY . .

# Build da aplicação
RUN npm run build

# =========================
# Stage 2 - Production
# =========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário do stage de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]