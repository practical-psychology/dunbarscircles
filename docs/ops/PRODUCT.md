# Product, audience and audit (WEB-002, WEB-003)

**Status:** draft for owner approval. Mark approved by adding name and date at the bottom.

## Product

Dunbar's Circles is a free, no-account web tool that lets people place their own contacts into Robin Dunbar's layers (5, 15, 50, 150, 500) and see them as diagrams.

## Audience

1. Curious general readers who met "Dunbar's number" in articles or books.
2. People reflecting on friendships, loneliness or digital overload.
3. Students, teachers and writers who need a clear visual of the layered model.

## Single conversion goal

A visitor starts the interactive tour or adds a first contact (`start_tour`, `add_contact` events; see ANALYTICS.md). Secondary: reads Evidence & Limitations (`view_evidence`).

## Out of scope

Clinical assessment, advice on how many friends to have, social-network integrations that upload contacts.

## Audit log

| Area                                      | Source audit                                   | Rendered/production check | Owner       |
| ----------------------------------------- | ---------------------------------------------- | ------------------------- | ----------- |
| Source defects (Tier 0-2 backlog)         | Done, fixed in commits 124-128 and this branch | n/a                       | engineering |
| Mobile and browsers                       | n/a                                            | Pending, see QA.md matrix | owner       |
| Production flow (sign-in, backup, export) | n/a                                            | Pending, QA.md section 3  | owner       |

Approved by: **\_\_** Date: **\_\_**
