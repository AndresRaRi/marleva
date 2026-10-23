FROM node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS base
RUN apt-get update && apt-get install --no-install-recommends -y openssl=3.0.22-1~deb12u1 \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build
WORKDIR /build
ENV MIGRATION_DATABASE_URL=postgresql://fixture:fixture@127.0.0.1:54322/postgres
RUN corepack enable && corepack prepare pnpm@12.11.2 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm ci:prepare && pnpm --filter @marleva/api build \
    && pnpm --filter @marleva/api deploy --prod /runtime

FROM gcr.io/distroless/cc-debian13:nonroot@sha256:83b9b50586253821cf63ffcec87d3d94265a093ad30da232039af962dd8f4edf AS runtime
ENV NODE_ENV=production
COPY --from=build /usr/local/bin/node /usr/local/bin/node
WORKDIR /workspace/apps/api
COPY --from=build --chown=65532:65532 /runtime/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /build/apps/api/package.json ./package.json
COPY --from=build --chown=65532:65532 /build/apps/api/dist ./dist
COPY --from=build --chown=65532:65532 /build/packages/config /workspace/packages/config
USER 65532:65532
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["/usr/local/bin/node", "-e", "fetch('http://127.0.0.1:3000/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
ENTRYPOINT ["/usr/local/bin/node"]
CMD ["dist/main.js"]
