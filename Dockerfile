# syntax=docker/dockerfile:1.7

# -- Build --
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prepare && pnpm build
RUN pnpm exec tsup server.ts --format esm --external better-sqlite3 --outDir dist
RUN pnpm prune --prod

# -- Runtime --
FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/static ./static
COPY --from=build /app/words.csv ./words.csv

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
