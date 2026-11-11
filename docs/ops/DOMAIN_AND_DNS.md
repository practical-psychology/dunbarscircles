# Domain, registrar and DNS (WEB-006 to WEB-010, WEB-019 to WEB-021)

Console-side steps only the domain owner can perform. Tick each box and date it.

## Domain research record (WEB-006, retrospective)

Chosen: `dunbarscircles.com`. Shortlist and trademark check were not recorded when it was bought. Record now: alternatives considered, renewal price, and a quick trademark search for "Dunbar's Circles" in the owner's jurisdiction. [ ]

## Registrar security (WEB-007, WEB-008)

- [ ] MFA (authenticator app or security key) on the registrar account
- [x] Registrar/transfer lock on (WHOIS shows `clientTransferProhibited`, 2026-11-10)
- [ ] Auto-renew on, payment method valid; expiry date: **2027-11-07** (Namecheap, WHOIS 2026-11-10)
- [ ] WHOIS privacy on
- [ ] Recovery email and backup codes stored in a password manager
- [ ] Second trusted contact/delegate recorded

## Current DNS (recorded 2026-11-10 with `dig +short`)

Nameservers: `dns1.registrar-servers.com`, `dns2.registrar-servers.com` (Namecheap BasicDNS). DNSSEC: unsigned.

| Host    | Type      | Value                                                                         | Purpose                            | Keep?                 |
| ------- | --------- | ----------------------------------------------------------------------------- | ---------------------------------- | --------------------- |
| @       | A         | `199.36.158.100`                                                              | Firebase Hosting                   | yes (Firebase-issued) |
| @       | TXT       | `hosting-site=dunbarscircles`                                                 | Firebase domain verification       | yes, never delete     |
| @       | TXT       | `v=spf1 include:spf.efwd.registrar-servers.com ~all`                          | SPF for Namecheap email forwarding | yes                   |
| @       | MX        | `eforward1`–`eforward5.registrar-servers.com` (priorities 10, 10, 10, 15, 20) | Namecheap email forwarding         | yes                   |
| www     | CNAME     | `dunbarscircles.web.app`                                                      | Firebase; redirects to apex        | yes                   |
| \_dmarc | TXT       | none                                                                          | -                                  | add (below)           |
| @       | AAAA, CAA | none                                                                          | -                                  | optional              |

Recommended additions (owner, at the registrar):

- `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:<your address>` to start monitoring spoofing; move to `p=quarantine` after a month of clean reports.
- Optional CAA: `0 issue "pki.goog"` (Firebase certificates come from Google Trust Services). Only add it if you are sure no other CA is needed, or certificate renewal will fail.

Verified live 2026-11-10: apex 200 over HTTPS, `http://` 301 to `https://`, `www` 301 to `https://dunbarscircles.com/`. Certificate issuer Google Trust Services WR3, valid to 2027-02-05 (auto-renewed).

## Before changing DNS: preserve email (WEB-010)

1. Export current records: `dig +noall +answer dunbarscircles.com ANY`, plus MX, TXT, CNAME.
2. Save MX, SPF (TXT `v=spf1`), DKIM (`*._domainkey`), DMARC (`_dmarc`) exactly. Do not touch them.
3. Only the apex `A`/`AAAA` and `www` records change.

## Attach domain in Firebase (WEB-019)

Firebase console > Hosting > Add custom domain > `dunbarscircles.com`. Firebase shows a TXT verification record and the A records. Add `www.dunbarscircles.com` and choose "Redirect to dunbarscircles.com".

## Cutover table (WEB-020)

| Record               | Type       | Value                 | Notes                                                             |
| -------------------- | ---------- | --------------------- | ----------------------------------------------------------------- |
| @                    | TXT        | value Firebase shows  | verification                                                      |
| @                    | A          | values Firebase shows | remove registrar forwarding/parking A or URL-forward record first |
| www                  | CNAME or A | per Firebase          | then set 301 to apex                                              |
| MX, SPF, DKIM, DMARC | -          | unchanged             | verify with a test email before and after                         |

Lower TTL to 300 a day before; restore to 3600 after.

## Verification (WEB-021)

```
curl -sI http://dunbarscircles.com | head -3     # 301 to https
curl -sI https://www.dunbarscircles.com | head -3 # 301 to https://dunbarscircles.com/
bash scripts/smoke-test.sh https://dunbarscircles.com
```

## Canonical hostname decision record (WEB-009, #15)

- **Status:** Accepted 2026-11-10.
- **Decision:** The canonical host is the apex `https://dunbarscircles.com`. `www.dunbarscircles.com`, `dunbarscircles.web.app` and `dunbarscircles.firebaseapp.com` are secondary.
- **Why apex:** shorter to say and type; Firebase supports apex A records, so no CNAME flattening is needed; the canonical tag, sitemap, robots, Open Graph URLs and JSON-LD already used the apex.
- **How it is enforced:** `www` 301-redirects to the apex (Firebase domain setting). `web.app`/`firebaseapp.com` cannot redirect on Firebase, so every page sets `<link rel="canonical" href="https://dunbarscircles.com/...">` and preview channels set `noindex` (PREVIEW.md).
- **Consequences:** Search Console uses a Domain property (covers all hosts). Firebase Auth must list `dunbarscircles.com` and `www.dunbarscircles.com` under Authorized domains.
