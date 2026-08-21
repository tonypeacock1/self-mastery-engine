# 04 — Content Strategy (10 properties)

**Phase 1 platforms:** GitHub + Cloudflare only  
**Properties:** 5 × Cloudflare Pages (`*.pages.dev`) + 5 × GitHub Pages (`*.github.io`)

---

## Property map

| Keyword / role | Cloudflare (conversion) | GitHub ranking org / site |
|----------------|-------------------------|---------------------------|
| Pillar — self mastery SA | self-mastery-sa.pages.dev | self-mastery-sa.github.io |
| Johannesburg | jhb-exec-resilience.pages.dev | jhb-exec-resilience.github.io |
| Cape Town | cape-town-self-mastery.pages.dev | cape-town-self-mastery.github.io |
| Durban | durban-executive-clarity.pages.dev | durban-executive-clarity.github.io |
| Gqeberha / PE | gqeberha-self-mastery.pages.dev | gqeberha-self-mastery.github.io |

Cloudflare sites = conversion (Instant EFT).  
GitHub sites = ranking footprints (same theme, lighter or mirrored content).

---

## Cloudflare site structure (per property)

Keep each site **thin and strong**. Do not build large blogs yet.

### Recommended page count: **1–3 pages**

| Page | Path | Purpose |
|------|------|---------|
| **Home** | `/` or `index.html` | Primary ranking + conversion page |
| **Order** (optional) | `/order.html` | Focused Instant EFT checkout if home gets long |
| **Privacy / Terms** | `/privacy.html` | Trust / compliance |

City spokes stay on their own hosts (not paths on the pillar), so each city has its own homepage.

### Homepage sections (top → bottom)

1. **Hero**  
   - H1 locked to the property keyword (e.g. “Self-Mastery for High Performers in South Africa”)  
   - Sub: literary self-improvement · R400 · Instant EFT · free SA shipping  
   - Primary CTA → order / EFT widget  

2. **Hero image**  
   - Generated via File.ai → stored on R2 → served from public R2 URL  

3. **Who this is for**  
   - Executives, founders, high performers under pressure  
   - City-specific line on spokes (Johannesburg / Cape Town / …)  

4. **What you receive**  
   - One literary self-mastery volume  
   - Clear, non-clinical benefits (clarity, composure, sustained performance)  

5. **How Instant EFT works**  
   - Order → unique `SM-XXXXXXXX` reference → Instant EFT → confirm → ship 1–2 days  

6. **EFT widget** (Cloudflare sites only)  
   - Calls isolated Worker `/api/resolve-eft` + `/api/process-order`  

7. **Related cities / pillar**  
   - Internal SILO links between the five Cloudflare hosts (use carefully; keep natural)  

8. **FAQ** (non-YMYL)  
   - Shipping, payment matching, returns, “literary only — not medical advice”  

9. **Footer**  
   - Privacy · contact · isolation disclaimer  

### Word count targets
- Pillar home: **900–1,400 words**
- City spoke home: **700–1,100 words** (unique city angle, not duplicate)

---

## GitHub ranking sites (github.io)

- Same keyword theme as the matching Cloudflare property  
- **1 page** is enough to start (`index.html`)  
- **No Instant EFT widget** (or a soft “order on main site” link only)  
- Purpose = ranking footprint + topical relevance  
- Can reuse shortened copy from the Cloudflare twin, rewritten enough to avoid thin duplication  

---

## Image strategy

| Asset | Where generated | Where stored | Where used |
|-------|-----------------|--------------|------------|
| Hero image (per site) | File.ai | R2 bucket | Homepage hero |
| Optional section image | File.ai | R2 | Who it’s for / What you receive |
| Favicon / OG image | File.ai or simple static | R2 or repo | `<meta og:image>` |

**Vault fields**
- File.ai API Key → generation  
- R2 bucket + keys + public base URL → storage + public URLs in HTML  

**Prompt direction (safe)**  
- Calm professional photography / illustration  
- Executive at desk, South African city skyline soft in background, books, natural light  
- No medical imagery, no clinical settings, no trademarked symbols  

---

## Content differentiation rules

1. Each of the 5 keywords owns its H1 and title  
2. City spokes must mention the city in H1 or first 100 words  
3. Body paragraphs must not be copy-paste across hosts  
4. Never use: Dianetics®, Hubbard, auditing, engram, clinical diagnoses, treatment claims  
5. Always frame as literary self-improvement / executive performance  

---

## Build order (executor)

1. Pillar Cloudflare home (content + hero image + EFT shell) — *started*  
2. Four city Cloudflare homes  
3. Deploy Instant EFT Worker + wire widgets  
4. Five GitHub ranking `index.html` pages  
5. Iterate copy and images from keyword research  

---

## Success criteria per Cloudflare site

- [ ] Unique H1 + title + meta description  
- [ ] Hero image from R2  
- [ ] Instant EFT path visible  
- [ ] Non-YMYL disclaimer present  
- [ ] Mobile-readable layout  
- [ ] Live on `*.pages.dev` with HTTP 200  
