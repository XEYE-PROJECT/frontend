# Imagen SOLO para probar el build y servirlo en local con Nitro (docker compose up).
# Producción es Cloudflare Workers (integración Git): esta imagen no se despliega.
# Etapa de build. Bases fijadas por digest (Dependabot abre PR cuando cambian).
FROM node:26-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80 AS builder
WORKDIR /app

# pnpm con la misma versión que `packageManager` en package.json (la que generó el lockfile).
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Etapa de runtime: Nitro sirve la SPA y permite sobrescribir la config
# pública por entorno vía variables NUXT_PUBLIC_*.
FROM node:26-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
