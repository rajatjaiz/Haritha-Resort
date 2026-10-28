#!/usr/bin/env bash
# Pushes non-empty values from .env to Vercel's Production environment (team scope: Hathras_Hst).
# Usage: scripts/vercel-env.sh [path-to-env-file]   (run `npx vercel login` and `npx vercel link` first)
set -euo pipefail
SCOPE="${VERCEL_SCOPE:-Hathras_Hst}"
FILE="${1:-.env}"
SKIP=" PORT "                       # local-only
while IFS= read -r line || [ -n "$line" ]; do
  [[ "$line" =~ ^[[:space:]]*# || -z "${line//[[:space:]]/}" ]] && continue
  key="${line%%=*}"; val="${line#*=}"; key="${key//[[:space:]]/}"
  val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  [[ "$SKIP" == *" $key "* ]] && continue
  if [ -z "$val" ]; then echo "- skipping $key (empty)"; continue; fi
  if [ "$key" = "PUBLIC_URL" ] && [[ "$val" == http://localhost* ]]; then echo "- skipping PUBLIC_URL (localhost) - set it to your Vercel URL"; continue; fi
  printf '%s' "$val" | npx vercel env add "$key" production --scope "$SCOPE" --force >/dev/null && echo "+ $key"
done < "$FILE"
echo "Done. Redeploy with: npx vercel --prod --scope $SCOPE"
