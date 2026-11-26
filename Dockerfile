# CraftIT server: Node 22 with the built-in SQLite driver, no native build step.
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=9150 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data

WORKDIR /app

RUN apk add --no-cache su-exec

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server
COPY public ./public
# The in-game changelog page reads this file.
COPY Changelog.md ./

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p /app/data && chown -R node:node /app/data

EXPOSE 9150
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/status > /dev/null || exit 1

# Starts as root only to fix the data folder owner, then runs as "node".
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
