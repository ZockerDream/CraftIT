#!/bin/sh
# A bind-mounted data folder is often owned by root. Hand it to the "node" user, then drop root.
set -e
mkdir -p "$DATA_DIR"
chown -R node:node "$DATA_DIR"
exec su-exec node "$@"
