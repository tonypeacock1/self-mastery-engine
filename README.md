# Self-Mastery Engine

Isolated SILO toolkit for executive burnout recovery / self-mastery static sites.

**Control plane (operator UI, vault, keyword research):** stays on [cloud.linkdaddy.com/dianetics-engine](https://cloud.linkdaddy.com/dianetics-engine)

**Execution plane (this repo):** builder, Worker, content templates, docs — used to generate and deploy the Cloudflare Pages + GitHub ranking sites.

## Sites

| Role | Cloudflare Pages | GitHub (code) |
|------|------------------|---------------|
| Pillar | self-mastery-sa.pages.dev | tonypeacock1/self-mastery-sa |
| Johannesburg | jhb-exec-resilience.pages.dev | tonypeacock1/jhb-exec-resilience |
| Cape Town | cape-town-self-mastery.pages.dev | tonypeacock1/cape-town-self-mastery |
| Durban | durban-executive-clarity.pages.dev | tonypeacock1/durban-executive-clarity |
| Gqeberha | gqeberha-self-mastery.pages.dev | tonypeacock1/gqeberha-self-mastery |

## Platforms (Phase 1)

GitHub + Cloudflare only. Netlify / Vercel / Render / Deno can be added later for footprint diversity after the first five sites are live and converting.

## Layout

```
src/modules/dianetics/   PSL builder, geo-EFT Worker, vault schema, example content
worker/                  Cloudflare Worker (deploy separately)
docs/                    EFT structure, landing map, subdomain names
dist-example/            Pre-built static example (if present)
```

## Hard rules

- Literary / self-improvement framing only (non-YMYL)
- No Dianetics® / Hubbard / auditing / clinical language in public copy
- Live bank numbers never committed — Worker secrets / vault only
- Zero shared credentials with main CAB campaigns
