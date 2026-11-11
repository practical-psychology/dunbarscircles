# Numerical claims register (WEB-024)

| #   | Claim as shown                            | Status                         | Source                                    | Wording rule                                                                  |
| --- | ----------------------------------------- | ------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Layers of about 5, 15, 50, 150, 500       | Supported as averages          | Zhou et al. 2005; Hill & Dunbar 2003      | Always "about" or "roughly"; never "limit"                                    |
| 2   | Layers are cumulative (15 includes the 5) | Per Dunbar's model             | Zhou et al. 2005                          | State once per page that layers nest                                          |
| 3   | 150 for humans                            | Contested                      | Dunbar 1992, 1993; Lindenfors et al. 2021 | Show as "roughly 150 (estimates range about 100–250)"; link /evidence         |
| 4   | Scaling ratio about 3                     | Supported in several data sets | Zhou et al. 2005                          | "roughly three times"                                                         |
| 5   | Layers beyond 500 (1,500+)                | Weaker evidence                | Dunbar's later work                       | Label "beyond the evidenced layers" / tentative; never show 5K–50K as a layer |
| 6   | Time/frequency per layer (if shown)       | Approximate                    | Dunbar's work on contact frequency        | Label as typical, varies by person                                            |

## Where each claim appears (checked 2026-11-10)

| Claim   | Files                                                                                                                                                      |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1, 2, 4 | `src/pages/HomePage.tsx` (layers section, hero strip), `src/pages/EvidencePage.tsx`, `public/circles-preview.svg`, `components/welcome-modal.tsx`          |
| 3       | `src/data/dunbarLevels.ts` and `data/dunbarLevels.ts` (Active Network description), `HomePage.tsx` FAQ and layers note, `EvidencePage.tsx`                 |
| 5       | `components/network-diagram.tsx` legend ("Beyond 500 (tentative, not well evidenced)"), `components/level-details.tsx`, `HomePage.tsx` "Outer Layers" card |
| 6       | `components/contact-manager.tsx` default contact frequency per layer                                                                                       |

Removed on 2026-11-10: "Extended (5K–50K)" and "5,000–50,000 people" (no evidenced layer of that size), and "150–1,500" for the social layers (now "about 150–500").

Before launch: search the source for every number, check each against this table, and have the scientific reviewer (QA.md section 5) initial it.
