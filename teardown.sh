#!/usr/bin/env bash
source "$(dirname "$0")/utils.sh"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Resolve rafiki directory whether run from rewards-platform root or rafiki-instance00
if [ -d "$SCRIPT_DIR/rafiki-instance00" ]; then
  RAFIKI_DIR="$SCRIPT_DIR/rafiki-instance00"
elif [ -f "$SCRIPT_DIR/package.json" ] && grep -q "@interledger/rafiki" "$SCRIPT_DIR/package.json" 2>/dev/null; then
  RAFIKI_DIR="$SCRIPT_DIR"
else
  log_error "Could not locate rafiki-instance00 directory!"
  exit 1
fi

log_info "Stopping any running localenv tunnel processes..."
pkill -f "localenv-tunnel-setup.js" 2>/dev/null || true

log_info "Tearing down Rafiki Postgres compose stack..."
(cd "$RAFIKI_DIR" && pnpm localenv:compose:psql down --volumes --remove-orphans) 2>/dev/null || true

log_info "Tearing down Rafiki TigerBeetle compose stack..."
(cd "$RAFIKI_DIR" && pnpm localenv:compose down --volumes --remove-orphans) 2>/dev/null || true

log_info "Pruning stopped containers..."
docker container prune -f

log_info "Pruning unused networks..."
docker network prune -f

log_success "Teardown complete! All containers, volumes, networks, and tunnels cleaned up."
