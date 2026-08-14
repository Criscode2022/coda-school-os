#!/bin/sh
set -eu
cd /workspace
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
mkdir -p /tmp
# API on 3001; Angular dev server (with /api proxy) on 8080 for live preview
PORT=3001 HOST=127.0.0.1 npm --prefix apps/api run start:dev >>/tmp/coda-api.log 2>&1 &
npm --prefix apps/web run start >>/tmp/coda-web.log 2>&1 &
