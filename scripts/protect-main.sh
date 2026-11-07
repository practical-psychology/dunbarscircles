#!/usr/bin/env bash
# Applies branch protection to main. Requires admin rights: gh auth login first.
# Usage: scripts/protect-main.sh [owner/repo]
set -euo pipefail
REPO="${1:-practical-psychology/dunbarscircles}"
gh api -X PUT "repos/$REPO/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["checks"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0, "dismiss_stale_reviews": true },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
echo "Branch protection applied to $REPO:main"
