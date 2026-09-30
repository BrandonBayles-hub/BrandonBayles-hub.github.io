# brandonbayles-hub.github.io

User GitHub Pages site. Source = `main`, root. **Each folder below is published by a
different pipeline. Never recreate this repo or delete folders you did not publish —
that is how the campaign tracker went 404 on 2026-09-29.**

| Path | Publisher | Notes |
|---|---|---|
| `implementation-prototype/academy/` | `scripts/export-academy.mjs` in `entrata-product/implementation-prototype` (manual copy) | Slim Max Academy export |
| `implementation-prototype/campaign-status/` | GitHub Actions `update-campaign-status.yml` in `entrata-product/implementation-prototype` (every 15 min, deploy key) | A2P campaign tracker for Paige. Do not hand-edit; the bot overwrites it. |

Publishing rule: clone, add or replace **only your own folder**, commit, push. Keep
`.nojekyll` at the root so `_next/` assets are served.
