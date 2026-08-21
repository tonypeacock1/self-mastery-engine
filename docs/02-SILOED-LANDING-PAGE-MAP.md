# 02 — Siloed Non-YMYL Landing Page Map

**Goal:** Turn the commercial intent of the existing book-fulfillment site into a clean landing page that can sit in front of (or replace) the 5-page SILO, without any Dianetics® / Hubbard / auditing / clinical language.

**Hard rules**
- Literary / self-improvement framing only  
- No processes, no clinical outcomes, no religious claims  
- No “Dianetics”, “Hubbard”, “auditing”, “engram”, “reactive mind”  
- R400 fixed SKU, Instant EFT, free SA shipping messaging OK  

---

## Recommended information architecture

```
/                         ← Landing (conversion page)
/order                    ← Optional dedicated checkout (or modal on /)
/johannesburg             ← Spoke (or path on same host)
/cape-town
/durban
/gqeberha                 (or /port-elizabeth)
/privacy
/terms
```

For pure Cloudflare Pages / GitHub Pages static deploys, prefer:

```
index.html                ← Landing + Instant EFT widget
johannesburg.html
cape-town.html
durban.html
gqeberha.html
robots.txt / sitemap.xml / llms.txt
```

---

## Landing page sections (top → bottom)

1. **Hero**  
   - H1: e.g. “Executive Burnout Recovery & Self-Mastery for High Performers”  
   - Sub: South Africa · R400 · Free shipping · Instant EFT  
   - Primary CTA → scroll to order / open EFT widget  

2. **Who this is for**  
   - Executives, founders, high performers under sustained pressure  
   - Johannesburg · Cape Town · Durban · Gqeberha  

3. **What you receive**  
   - One physical self-mastery volume (literary)  
   - Clear reading path for personal development  
   - No medical claims  

4. **How ordering works (EFT)**  
   - Place order → unique reference `SM-XXXXXXXX`  
   - Instant EFT to the regional account shown  
   - Confirmation within 24h → ship 1–2 business days  

5. **Instant EFT widget** (progressive enhancement)  
   - Calls `/api/resolve-eft` with city/suburb  
   - Displays Bank / Account Name / Number / Branch / Amount / **Reference**  
   - Collects name, email, phone, address → `/api/process-order`  

6. **City spokes** (internal links)  
   - Short cards linking to Johannesburg / Cape Town / Durban / Gqeberha pages  

7. **FAQ** (non-YMYL)  
   - Shipping times, EFT matching, returns policy, language (EN)  
   - Explicit: this is literary self-improvement material, not medical advice  

8. **Footer**  
   - Privacy · Terms · Contact  
   - Trademark disclaimer if any residual brand risk remains  

---

## Copy framing (safe vs unsafe)

| Unsafe (do not use)              | Safe alternative                          |
|----------------------------------|-------------------------------------------|
| Dianetics®                       | Self-mastery / executive performance      |
| Auditing session                 | Structured self-reflection exercises      |
| Clear the reactive mind          | Improve focus and emotional composure     |
| Treat depression / anxiety       | Support personal development under stress |
| Hubbard / LRH                    | (omit entirely)                           |

---

## Relation to the 5-page SILO

- **Option A (recommended first):** Landing page is the pillar (`index.html`). Four city pages are thin spokes that deep-link back to the same EFT widget.  
- **Option B:** Landing page is a separate conversion host; SILO pages rank informationally and funnel to the landing `/order`.  

Both stay inside the isolated Cloudflare / GitHub credentials vault. Never share PSL accounts with CAB campaigns.

---

## Next build step

Use `DianeticsPslBuilder` with the cleaned literary body blocks in `example_content.ts`, inject `workerOrigin`, set `baseUrl` to the chosen landing host, run `npm run build:example`.
