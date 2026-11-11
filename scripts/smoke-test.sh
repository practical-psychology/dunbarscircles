#!/usr/bin/env bash
# Production smoke test (#75): routes, sitemap URLs, static assets, security
# and cache headers, real 404s, debug routes removed, metadata.
# Usage: scripts/smoke-test.sh https://dunbarscircles.web.app
# Browser checks (console errors, mobile layout, keyboard) are manual; see
# docs/ops/QA.md section "Live smoke test".
set -euo pipefail
BASE="${1:?base url required}"
BASE="${BASE%/}"
fail=0
ok()   { echo "ok   $1"; }
bad()  { echo "FAIL $1"; fail=1; }
check() { # name expected actual
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (expected $2, got $3)"; fi
}
has() { # name needle haystack
  if printf '%s' "$3" | grep -qF -- "$2"; then ok "$1"; else bad "$1 (missing: $2)"; fi
}
code() { curl -s -o /dev/null -m 20 -w '%{http_code}' "$1"; }
hdr()  { curl -sI -m 20 "$1" | tr -d '\r' | awk -v k="$(echo "$2" | tr 'A-Z' 'a-z'):" 'tolower($1)==k {sub(/^[^:]*: */,""); print; exit}'; }

# --- App routes (must match firebase.json rewrites) ---
for r in / /onboarding /radial /levels /network /digital /lifecycle /dashboard \
         /contacts /contacts/import /contacts/edit/new /sitemap /privacy /about /evidence; do
  check "route $r 200" 200 "$(code "$BASE$r")"
done

# --- Real 404s and debug routes removed ---
check "unknown route 404"        404 "$(code "$BASE/definitely-not-a-page")"
check "missing asset 404"        404 "$(code "$BASE/assets/missing-file.js")"
check "/firebase-test 404"       404 "$(code "$BASE/firebase-test")"
check "/color-contrast-test 404" 404 "$(code "$BASE/color-contrast-test")"
has   "404 page has home link" 'href="/"' "$(curl -s -m 20 "$BASE/definitely-not-a-page")"

# --- Crawl files and static assets ---
for f in /robots.txt /sitemap.xml /manifest.json /favicon.svg /favicon.ico \
         /apple-touch-icon.png /icon-192.png /icon-512.png /og-image.png /circles-preview.svg; do
  check "asset $f 200" 200 "$(code "$BASE$f")"
done

# Every URL in the sitemap must resolve on this host.
sitemap="$(curl -s -m 20 "$BASE/sitemap.xml")"
for u in $(printf '%s' "$sitemap" | grep -o '<loc>[^<]*</loc>' | sed 's#</*loc>##g'); do
  path="/${u#https://*/}"; [ "$path" = "/$u" ] && path="/"
  check "sitemap ${path} 200" 200 "$(code "$BASE$path")"
done

# --- Headers ---
check "home no-cache"   "no-cache" "$(hdr "$BASE/" Cache-Control)"
check "nosniff"         "nosniff"  "$(hdr "$BASE/" X-Content-Type-Options)"
check "frame options"   "SAMEORIGIN" "$(hdr "$BASE/" X-Frame-Options)"
check "referrer policy" "strict-origin-when-cross-origin" "$(hdr "$BASE/" Referrer-Policy)"
has   "HSTS"            "max-age=" "$(hdr "$BASE/" Strict-Transport-Security)"
has   "permissions policy" "camera=()" "$(hdr "$BASE/" Permissions-Policy)"
csp="$(hdr "$BASE/" Content-Security-Policy)$(hdr "$BASE/" Content-Security-Policy-Report-Only)"
has   "CSP present"     "default-src" "$csp"

# Hashed JS bundle from index.html: 200 and immutable.
body="$(curl -s -m 20 "$BASE/")"
js="$(printf '%s' "$body" | grep -o '/assets/[^"]*\.js' | head -1 || true)"
if [ -n "$js" ]; then
  check "bundle $js 200" 200 "$(code "$BASE$js")"
  has   "bundle immutable" "immutable" "$(hdr "$BASE$js" Cache-Control)"
else
  bad "bundle reference in index.html"
fi

# --- Metadata ---
has "home content"     "Dunbar's Circles" "$body"
has "canonical apex"   'rel="canonical" href="https://dunbarscircles.com/' "$body"
has "og:image"         'og:image' "$body"
has "noscript message" '<noscript' "$body"
if printf '%s' "$body" | grep -q 'content="noindex'; then bad "production page is noindex"; else ok "indexable (no static noindex)"; fi

sha="$(printf '%s' "$body" | grep -o 'name="build-sha" content="[^"]*"' | sed 's/.*content="//;s/"$//' || true)"
echo "info live build-sha: ${sha:-not present (deployed before RELEASE.md)}"

# --- HTTPS redirect (custom domain only; web.app is HTTPS-only already) ---
case "$BASE" in
  https://dunbarscircles.com)
    loc="$(curl -sI -m 20 http://dunbarscircles.com/ | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}')"
    check "http -> https" "https://dunbarscircles.com/" "$loc"
    wloc="$(curl -sI -m 20 https://www.dunbarscircles.com/ | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}')"
    check "www -> apex" "https://dunbarscircles.com/" "$wloc"
    ;;
esac

exit $fail
