# Product, audience and audit (WEB-002, WEB-003)

**Status:** draft for owner approval. Mark approved by adding name and date at the bottom.

## One-page brief (draft 2026-11-10, #8)

**Product.** Dunbar's Circles is a free, no-account web tool that lets people place their own contacts into Robin Dunbar's layers (about 5, 15, 50, 150 and 500) and see them as diagrams. Data stays in the browser; cloud backup is optional.

**Problem.** People sense that some relationships are drifting but have no simple way to see where their time and attention actually go. Articles about "Dunbar's number" explain the idea but give readers nothing to do with it.

**Audience.**

1. Curious general readers who met "Dunbar's number" in articles, podcasts or books.
2. People reflecting on friendships, loneliness, a move or a life change.
3. Students, teachers and writers who need a clear, honest visual of the layered model.

**Promise (one line).** See who is in your inner circle and who has drifted, in minutes, without giving your contacts to anyone.

**Primary call to action.** "Map My Circles" on the home page, leading to the Contacts page. Secondary: "Take the 10 minute tour". The welcome dialog ends in "Add my first contact" or "Start with sample data".

**Single conversion goal.** A visitor saves a first real contact (`add_contact`) and sees their map (`first_map`). Leading indicator: `cta_click` / `start_tour`. Secondary: reads Evidence & Limitations (`view_evidence`).

**Success measures for the first 30 days.** Share of visitors reaching `add_contact` (target: 10%); median time from landing to first map under 5 minutes (pilot, G6); evidence-page views per 100 visits; zero data-loss reports.

**Principles.** Local-first and private by default. Honest about the science: numbers shown as rough averages with ranges and the 2021 critique linked. No scores, diagnoses or advice on how many friends to have.

**Out of scope.** Clinical assessment; social-network integrations that upload contacts to us; accounts beyond optional Google sign-in for backup; advertising.

**Risks.** Over-reading the numbers (mitigated by /evidence and wording rules in CLAIMS.md); users losing local data when clearing the browser (mitigated by JSON export and optional backup).

## Audit log

| Area                                      | Source audit                                   | Rendered/production check | Owner       |
| ----------------------------------------- | ---------------------------------------------- | ------------------------- | ----------- |
| Source defects (Tier 0-2 backlog)         | Done, fixed in commits 124-128 and this branch | n/a                       | engineering |
| Mobile and browsers                       | n/a                                            | Pending, see QA.md matrix | owner       |
| Production flow (sign-in, backup, export) | n/a                                            | Pending, QA.md section 3  | owner       |

Approved by: **\_\_** Date: **\_\_**
