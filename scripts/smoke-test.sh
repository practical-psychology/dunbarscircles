#!/usr/bin/env bash
# Production smoke test: status codes, cache headers, 404 behaviour, crawl files.
# Usage: scripts/smoke-test.sh https://dunbarscircles.web.app
set -euo pipefail
BASE="${1:?base url required}"
fail=0
check() { # name expected actual
  if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1 (expected $2, got $3)"; fail=1; fi
}
code() { curl -s -o /dev/null -m 20 -w '%{http_code}' "$1"; }
hdr()  { curl -sI -m 20 "$1" | tr -d '\r' | awk -v k="$(echo "$2" | tr A-Z a-z):" 'tolower($1)==k {sub(/^[^:]*: */,""); print; exit}'; }

check "home 200"           200 "$(code "$BASE/")"
check "levels 200"         200 "$(code "$BASE/levels")"
check "privacy 200"        200 "$(code "$BASE/privacy")"
check "unknown route 404"  404 "$(code "$BASE/definitely-not-a-page")"
check "missing asset 404"  404 "$(code "$BASE/assets/missing-file.js")"
check "robots 200"         200 "$(code "$BASE/robots.txt")"
check "sitemap 200"        200 "$(code "$BASE/sitemap.xml")"
check "home no-cache"      "no-cache" "$(hdr "$BASE/" Cache-Control)"
check "nosniff"            "nosniff" "$(hdr "$BASE/" X-Content-Type-Options)"
body="$(curl -s -m 20 "$BASE/")"
echo "$body" | grep -q "Dunbar's Circles" && echo "ok   home content" || { echo "FAIL home content"; fail=1; }
exit $fail
