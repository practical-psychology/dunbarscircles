# Domain, registrar and DNS (WEB-006 to WEB-010, WEB-019 to WEB-021)

Console-side steps only the domain owner can perform. Tick each box and date it.

## Domain research record (WEB-006, retrospective)

Chosen: `dunbarscircles.com`. Shortlist and trademark check were not recorded when it was bought. Record now: alternatives considered, renewal price, and a quick trademark search for "Dunbar's Circles" in the owner's jurisdiction. [ ]

## Registrar security (WEB-007, WEB-008)

- [ ] MFA (authenticator app or security key) on the registrar account
- [ ] Registrar/transfer lock on
- [ ] Auto-renew on, payment method valid; expiry date: **\_\_**
- [ ] WHOIS privacy on
- [ ] Recovery email and backup codes stored in a password manager
- [ ] Second trusted contact/delegate recorded

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

Canonical host is the apex `https://dunbarscircles.com` (WEB-009). Metadata, sitemap and robots already use it.
