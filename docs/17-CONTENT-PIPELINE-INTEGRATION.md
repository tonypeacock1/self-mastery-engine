# 17 — Content Pipeline Integration (Voice → Brief → PSL)

**Date:** 2026-08-22  
**Status:** Wired in code

---

## Pipeline

```
Research corpus (docs 05–15)
        ↓
page_brief.buildPageBrief() / getWave1Briefs()
        ↓
content_agent.buildContentMessages()
   system = sa_content_voice.SA_CONTENT_RUNTIME_SYSTEM_PROMPT
   user   = structured brief + FAQ + few-shot opening
        ↓
LLM (operator / CI / control panel)
        ↓
content_agent.validateBodyHtmlAgainstVoice()
        ↓
content_agent.packageForPsl(brief, bodyHtml)
        ↓
DianeticsPslBuilder.build()  → static HTML + schema + EFT widget + robots/sitemap/llms
```

---

## Modules

| File | Role |
|------|------|
| `src/modules/dianetics/sa_content_voice.ts` | Runtime system prompt, sample openings, editor checklist |
| `src/modules/dianetics/page_brief.ts` | PageBrief type, `buildPageBrief()`, Wave 1 seeds |
| `src/modules/dianetics/content_agent.ts` | `buildContentMessages()`, `packageForPsl()`, `validateBodyHtmlAgainstVoice()` |
| `src/modules/dianetics/dianetics_psl_builder.ts` | Static site assembler (unchanged contract: injects bodyHtml) |
| `src/modules/dianetics/example_content.ts` | Fallback example bodies only — not production voice |

Canonical voice research: [docs/16-SA-CONTENT-VOICE-SYSTEM-PROMPT.md](./16-SA-CONTENT-VOICE-SYSTEM-PROMPT.md)

---

## Operator usage

```ts
import {
  messagesFromBriefInput,
  validateBodyHtmlAgainstVoice,
  packageForPsl,
  getWave1Briefs
} from './src/modules/dianetics/content_agent';
import { DianeticsPslBuilder } from './src/modules/dianetics/dianetics_psl_builder';

// 1) Brief from research seed
const { brief, messages } = messagesFromBriefInput({
  briefId: 'executive-burnout-johannesburg',
  primaryKeyword: 'executive burnout recovery Johannesburg',
  secondaryKeywords: ['high performer stress Johannesburg'],
  cluster: 'burnout_exhaustion',
  geo: 'Johannesburg',
  serpOpportunity: 'HIGH',
  hubId: 'gauteng_central'
});

// 2) messages[0] is always SA_CONTENT_RUNTIME_SYSTEM_PROMPT
//    Send `messages` to your LLM; receive bodyHtml fragment

// 3) Gate
const fails = validateBodyHtmlAgainstVoice(bodyHtml);
if (fails.length) throw new Error(fails.join('; '));

// 4) Package + build
const page = packageForPsl(brief, bodyHtml);
const builder = new DianeticsPslBuilder({
  siteSlug: 'exec-resilience-sa',
  baseUrl: 'https://exec-resilience-sa.pages.dev',
  platform: 'cloudflare-pages',
  pillarTitle: page.title,
  pillarH1: page.h1,
  pillarMetaDesc: page.metaDesc,
  pillarBodyHtml: page.bodyHtml,
  spokes: [/* same pattern per spoke */]
});
const files = builder.build();
```

Wave 1 batch:

```ts
const briefs = getWave1Briefs();
// for each brief → buildContentMessages → LLM → validate → package → PSL
```

---

## Hard rules

1. **No bodyHtml for ranking pages without the voice system prompt.**
2. Ranking surface stays problem language + able framing; book appears in soft close.
3. PSL builder still owns H1, EFT widget, JSON-LD, robots, sitemap, llms.txt.
4. `example_content.ts` is for the sample dist only until Wave 1 pages are regenerated under this pipeline.

---

## Next engineering steps (optional)

- Control-panel button: select Wave 1 brief → show messages → accept bodyHtml → write to dist
- CI job: fail build if `voiceContract !== 'sa_content_voice_v1'` on production content manifest
- Replace `example_content.ts` bodies with first voice-generated set after human review
