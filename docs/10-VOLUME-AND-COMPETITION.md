# 10 — Search Volume & Competition Proxies + Live API Gate
**Date:** 2026-08-22

## Status of live Keyword Planner / DataForSEO

**Blocked:** No DataForSEO (or Google Ads Keyword Planner) credentials are present in the isolated Dianetics vault or environment.

Without login credentials, **exact SA monthly search volume, CPC, and competition index cannot be pulled live**.

### What is required from you
1. DataForSEO login + password (or API key), **or**
2. Confirm seo.linkdaddy.com webhook credentials that proxy DataForSEO, **or**
3. Google Ads account with Keyword Planner access for ZA.

Endpoint once keyed:
`POST https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live`
- location: South Africa
- language: en
- up to 700 keywords per request from `docs/07-phrases-flat.txt`

## Relative volume tiers (research proxies from SERP density + press + commercial competition)

### TIER_A_HIGH
- High relative demand — dense SERP, national press, multiple commercial players
- SA monthly proxy range: **500–5,000+ (national + commercial intent)**
- Examples:
  - executive burnout recovery
  - burnout recovery South Africa
  - work stress recovery
  - how to recover from burnout
  - burnout treatment South Africa

### TIER_B_MED
- Medium — clear intent, fewer dedicated landing pages
- SA monthly proxy range: **100–800**
- Examples:
  - how to stop overreacting
  - can't switch off from work
  - successful but empty
  - emotional numbness
  - high functioning burnout
  - irritability after work

### TIER_C_LONGTAIL
- Long-tail / geo — lower volume, higher conversion fit for PSL
- SA monthly proxy range: **10–200**
- Examples:
  - executive burnout Johannesburg
  - burnout recovery Cape Town professionals
  - stop overreacting Sandton
  - load shedding stress and work pressure
  - burned out but can't quit job South Africa

### TIER_D_MECHANISM
- Mechanism / book intent — lower volume, highest filter quality
- SA monthly proxy range: **10–150**
- Examples:
  - reactive mind explained
  - Dianetics book South Africa
  - why do I react without thinking
  - stored stress reactions

## Competition notes (qualitative)
| Term class | Competition character | Opportunity |
|------------|----------------------|-------------|
| executive burnout SA | High — luxury clinics, news | Differentiate on price + self-help book + non-clinical |
| how to stop overreacting | Medium — global psych blogs | Rank with SA geo + able filter |
| successful but empty | Medium-low dedicated SA pages | Strong content gap |
| burned out can't quit SA | Validated by press, thin product pages | High intent trapped-stress cluster |
| reactive mind / Dianetics book | Low commercial SERP in SA self-help | Mechanism + book conversion |
| geo long-tails (Sandton, Durban…) | Low | SILO spoke advantage |

## Priority scoring for first ranking pages (until live volumes arrive)

Score = demand proxy × able-fit × SERP gap × conversion clarity

| Priority | Seed phrase | Why |
|----------|-------------|-----|
| 1 | executive burnout recovery / rest doesn't fix | Highest validated demand + able audience |
| 2 | how to stop overreacting / emotional triggers | Clear problem → mechanism → book |
| 3 | successful but empty / high achiever emptiness | Able filter perfect; thin SA competition |
| 4 | burned out but can't quit (SA trapped) | Press-validated; unique local angle |
| 5 | emotional numbness / shutdown after stress | Competitor language; underserved book angle |
| 6 | irritability / short fuse after work | High emotion; family-cost motivation |
| 7 | can't switch off from work | 75% stat alignment |

## Next action when credentials arrive
1. Batch `07-phrases-flat.txt` into DataForSEO Keyword Overview (ZA, en).
2. Write results to `docs/11-LIVE-KEYWORD-VOLUMES.csv`.
3. Re-rank priority list by actual volume × KD.
4. Feed top 50 into page generation pipeline.
