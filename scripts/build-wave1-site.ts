/**
 * Wave 1 PSL build using voice-contract content (sa_content_voice_v1).
 *
 *   npx tsx scripts/build-wave1-site.ts
 *
 * Uses wave1_content.ts bodies generated under SA_CONTENT_RUNTIME_SYSTEM_PROMPT.
 * Output: ./dist-wave1/
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DianeticsPslBuilder } from '../src/modules/dianetics/dianetics_psl_builder';
import {
  VOICE_CONTRACT,
  SELF_MASTERY_PILLAR_BODY,
  EXECUTIVE_BURNOUT_JHB_BODY
} from '../src/modules/dianetics/wave1_content';
import { buildPageBrief } from '../src/modules/dianetics/page_brief';
import { packageForPsl, validateBodyHtmlAgainstVoice } from '../src/modules/dianetics/content_agent';

const OUT_DIR = join(process.cwd(), 'dist-wave1');

// Pillar brief + body (self mastery)
const pillarBrief = buildPageBrief({
  briefId: 'self-mastery-sa-pillar',
  role: 'pillar',
  primaryKeyword: 'self mastery for high performers',
  secondaryKeywords: ['self mastery', 'composure for professionals South Africa'],
  serpOpportunity: 'HIGH',
  cluster: 'self_mastery_performance',
  hubId: 'gauteng_central'
});

const pillarFails = validateBodyHtmlAgainstVoice(SELF_MASTERY_PILLAR_BODY);
if (pillarFails.length) {
  console.error('Pillar voice validation failed:', pillarFails);
  process.exit(1);
}
const pillar = packageForPsl(pillarBrief, SELF_MASTERY_PILLAR_BODY);

// Johannesburg spoke
const jhbBrief = buildPageBrief({
  briefId: 'executive-burnout-johannesburg',
  role: 'spoke',
  primaryKeyword: 'executive burnout recovery Johannesburg',
  secondaryKeywords: ['high performer stress Johannesburg'],
  serpOpportunity: 'HIGH',
  cluster: 'burnout_exhaustion',
  geo: 'Johannesburg',
  hubId: 'gauteng_central'
});
const jhbFails = validateBodyHtmlAgainstVoice(EXECUTIVE_BURNOUT_JHB_BODY);
if (jhbFails.length) {
  console.error('JHB voice validation failed:', jhbFails);
  process.exit(1);
}
const jhb = packageForPsl(jhbBrief, EXECUTIVE_BURNOUT_JHB_BODY);

console.log('Voice contract:', VOICE_CONTRACT);
console.log('Pillar packaged:', pillar.briefId, pillar.h1);
console.log('Spoke packaged:', jhb.briefId, jhb.h1);

const builder = new DianeticsPslBuilder({
  siteSlug: 'self-mastery-sa',
  baseUrl: 'https://self-mastery-sa.pages.dev',
  platform: 'cloudflare-pages',
  workerOrigin: '',
  pillarTitle: pillar.title,
  pillarH1: pillar.h1,
  pillarMetaDesc: pillar.metaDesc,
  pillarBodyHtml: pillar.bodyHtml,
  spokes: [
    {
      filename: 'johannesburg.html',
      cityKey: 'Johannesburg',
      title: jhb.title,
      h1: jhb.h1,
      metaDesc: jhb.metaDesc,
      bodyHtml: jhb.bodyHtml,
      hubId: jhb.hubId || 'gauteng_central'
    }
  ]
});

const files = builder.build();
mkdirSync(OUT_DIR, { recursive: true });
for (const [path, content] of Object.entries(files)) {
  writeFileSync(join(OUT_DIR, path), content, 'utf8');
  console.log('Wrote', path, `(${content.length} bytes)`);
}

// Manifest for CI / control panel
writeFileSync(
  join(OUT_DIR, 'content-manifest.json'),
  JSON.stringify(
    {
      voiceContract: VOICE_CONTRACT,
      pages: [
        { briefId: pillar.briefId, path: '/', h1: pillar.h1 },
        { briefId: jhb.briefId, path: '/johannesburg.html', h1: jhb.h1 }
      ],
      builtAt: new Date().toISOString()
    },
    null,
    2
  ),
  'utf8'
);

console.log('\nWave 1 site written to', OUT_DIR);
console.log('All bodies passed validateBodyHtmlAgainstVoice.');
