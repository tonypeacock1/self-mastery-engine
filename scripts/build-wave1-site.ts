/**
 * Wave 1 PSL build — all voice-contract pages (sa_content_voice_v1).
 *
 *   npm run build:wave1
 *   npx tsx scripts/build-wave1-site.ts
 *
 * Output: ./dist-wave1/
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DianeticsPslBuilder, SpokeConfig } from '../src/modules/dianetics/dianetics_psl_builder';
import {
  VOICE_CONTRACT,
  SELF_MASTERY_PILLAR_BODY,
  EXECUTIVE_BURNOUT_PILLAR_BODY,
  EXECUTIVE_BURNOUT_JHB_BODY,
  CANT_SWITCH_OFF_BODY,
  STOP_SNAPPING_BODY,
  SUCCESSFUL_BUT_EMPTY_BODY
} from '../src/modules/dianetics/wave1_content';
import { buildPageBrief, BuildPageBriefInput } from '../src/modules/dianetics/page_brief';
import { packageForPsl, validateBodyHtmlAgainstVoice } from '../src/modules/dianetics/content_agent';

const OUT_DIR = join(process.cwd(), 'dist-wave1');

interface PageSpec {
  input: BuildPageBriefInput;
  body: string;
  filename?: string;
  cityKey?: string;
}

const pages: PageSpec[] = [
  {
    input: {
      briefId: 'self-mastery-sa-pillar',
      role: 'pillar',
      primaryKeyword: 'self mastery for high performers',
      secondaryKeywords: ['self mastery', 'composure for professionals South Africa'],
      serpOpportunity: 'HIGH',
      cluster: 'self_mastery_performance',
      hubId: 'gauteng_central'
    },
    body: SELF_MASTERY_PILLAR_BODY
  },
  {
    input: {
      briefId: 'executive-burnout-johannesburg',
      role: 'spoke',
      primaryKeyword: 'executive burnout recovery Johannesburg',
      secondaryKeywords: ['high performer stress Johannesburg'],
      serpOpportunity: 'HIGH',
      cluster: 'burnout_exhaustion',
      geo: 'Johannesburg',
      hubId: 'gauteng_central'
    },
    body: EXECUTIVE_BURNOUT_JHB_BODY,
    filename: 'johannesburg.html',
    cityKey: 'Johannesburg'
  },
  {
    input: {
      briefId: 'executive-burnout-recovery-sa',
      role: 'spoke',
      primaryKeyword: 'executive burnout recovery',
      secondaryKeywords: ['burnout recovery South Africa', 'high functioning burnout'],
      serpOpportunity: 'HIGH',
      cluster: 'burnout_exhaustion',
      hubId: 'gauteng_central'
    },
    body: EXECUTIVE_BURNOUT_PILLAR_BODY,
    filename: 'executive-burnout-recovery.html',
    cityKey: 'Burnout recovery'
  },
  {
    input: {
      briefId: 'cant-switch-off',
      role: 'spoke',
      primaryKeyword: "can't switch off from work",
      secondaryKeywords: ['why am I still exhausted after sleeping', "burned out but can't quit"],
      serpOpportunity: 'HIGH',
      cluster: 'sa_trapped_stress',
      hubId: 'gauteng_central'
    },
    body: CANT_SWITCH_OFF_BODY,
    filename: 'cant-switch-off.html',
    cityKey: "Can't switch off"
  },
  {
    input: {
      briefId: 'short-temper-reactivity',
      role: 'spoke',
      primaryKeyword: 'how to stop snapping at people',
      secondaryKeywords: ['short temper', 'why do I overreact to small things'],
      serpOpportunity: 'HIGH',
      cluster: 'reactivity_composure',
      hubId: 'gauteng_central'
    },
    body: STOP_SNAPPING_BODY,
    filename: 'stop-snapping.html',
    cityKey: 'Stop snapping'
  },
  {
    input: {
      briefId: 'successful-but-empty',
      role: 'spoke',
      primaryKeyword: 'successful but empty',
      secondaryKeywords: ['high achiever emptiness', 'why do successful people feel empty'],
      serpOpportunity: 'HIGH',
      cluster: 'successful_empty',
      hubId: 'gauteng_central'
    },
    body: SUCCESSFUL_BUT_EMPTY_BODY,
    filename: 'successful-but-empty.html',
    cityKey: 'Successful but empty'
  }
];

const packagedPages: { briefId: string; path: string; h1: string; title: string }[] = [];
const spokes: SpokeConfig[] = [];
let pillarTitle = '';
let pillarH1 = '';
let pillarMeta = '';
let pillarBody = '';

for (const page of pages) {
  const fails = validateBodyHtmlAgainstVoice(page.body);
  if (fails.length) {
    console.error(`Voice validation failed for ${page.input.briefId}:`, fails);
    process.exit(1);
  }
  const brief = buildPageBrief(page.input);
  const packaged = packageForPsl(brief, page.body);

  if (!page.filename) {
    pillarTitle = packaged.title;
    pillarH1 = packaged.h1;
    pillarMeta = packaged.metaDesc;
    pillarBody = packaged.bodyHtml;
    packagedPages.push({ briefId: packaged.briefId, path: '/', h1: packaged.h1, title: packaged.title });
  } else {
    spokes.push({
      filename: page.filename,
      cityKey: page.cityKey || page.filename,
      title: packaged.title,
      h1: packaged.h1,
      metaDesc: packaged.metaDesc,
      bodyHtml: packaged.bodyHtml,
      hubId: packaged.hubId || 'gauteng_central'
    });
    packagedPages.push({
      briefId: packaged.briefId,
      path: `/${page.filename}`,
      h1: packaged.h1,
      title: packaged.title
    });
  }
  console.log('OK', packaged.briefId, '→', packaged.h1);
}

const builder = new DianeticsPslBuilder({
  siteSlug: 'self-mastery-sa',
  baseUrl: 'https://self-mastery-sa.pages.dev',
  platform: 'cloudflare-pages',
  workerOrigin: '',
  pillarTitle,
  pillarH1,
  pillarMetaDesc: pillarMeta,
  pillarBodyHtml: pillarBody,
  spokes
});

const files = builder.build();
mkdirSync(OUT_DIR, { recursive: true });
for (const [path, content] of Object.entries(files)) {
  writeFileSync(join(OUT_DIR, path), content, 'utf8');
  console.log('Wrote', path, `(${content.length} bytes)`);
}

writeFileSync(
  join(OUT_DIR, 'content-manifest.json'),
  JSON.stringify(
    {
      voiceContract: VOICE_CONTRACT,
      baseUrl: 'https://self-mastery-sa.pages.dev',
      pages: packagedPages,
      builtAt: new Date().toISOString()
    },
    null,
    2
  ),
  'utf8'
);

console.log('\nWave 1 full SILO written to', OUT_DIR);
console.log(`Pages: ${packagedPages.length} | voiceContract: ${VOICE_CONTRACT}`);
