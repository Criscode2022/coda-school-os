FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --prefix apps/api --omit=dev=false \
 && npm install --prefix apps/web --omit=dev=false
COPY apps apps
COPY scripts scripts
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist/web/browser apps/web/dist/web/browser
COPY scripts/start-prod.mjs scripts/start-prod.mjs
COPY package.json ./
EXPOSE 8080
CMD ["node", "scripts/start-prod.mjs"]
