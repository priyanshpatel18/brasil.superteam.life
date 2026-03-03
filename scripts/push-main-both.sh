#!/usr/bin/env bash
# Push current main to both origin and prod so both remotes stay in sync.
# Usage: ./scripts/push-main-both.sh
set -e
branch="${1:-main}"
git push origin "$branch"
git push prod "$branch"
