/**
 * Example build script for Dianetics Engine PSL mini-site.
 * Run after installing dependencies or transpile with ts-node / esbuild.
 * Writes a complete static site (pillar + 4 spokes + Directive 2 files) to ./dist-example/
 *
 * Usage (from package root after TypeScript compile or with tsx):
 *   npx tsx scripts/build-example-site.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DianeticsPslBuilder } from '../src/modules/dianetics/dianetics_psl_builder';
import {
  PILLAR_BODY,
  JOHANNESBURG_BODY,
  CAPE_TOWN_BODY,
  DURBAN_BODY,
  GQEBERHA_BODY
} from '../src/modules/dianetics/example_content';

const OUT_DIR = join(process.cwd(), 'dist-example');

const builder = new DianeticsPslBuilder({
  siteSlug: 'exec-resilience-sa',
  baseUrl: 'https://exec-resilience-sa.pages.dev', // replace with real deployed origin
  platform: 'cloudflare-pages',
  // Leave empty for same-origin (Cloudflare Pages + Workers binding).
  // Set absolute origin for GitHub Pages / Vercel / Netlify / etc.
  workerOrigin: '', // e.g. 'https://dianetics-geo.your-account.workers.dev'
  pillarTitle: 'Executive Burnout Recovery | Classic Self-Improvement Book for SA High Performers',
  pillarH1: 'Master Workplace Stress and Reclaim Executive Clarity',
  pillarMetaDesc:
    'Physical hardcover of the 1950 self-improvement classic for South African executives. Express delivery R400. Instant EFT. Not medical or clinical advice.',
  pillarBodyHtml: PILLAR_BODY,
  spokes: [
    {
      filename: 'johannesburg.html',
      cityKey: 'Johannesburg',
      title: 'Johannesburg Executive Clarity | Dianetics Hardcover Gauteng Delivery',
      h1: 'Gauteng Operators: Offline Clarity for High-Pressure Decision Makers',
      metaDesc:
        'Physical copy of the 1950 self-improvement text delivered express in Johannesburg, Randburg, Sandton, Pretoria. Instant EFT. Commercial book sale only.',
      bodyHtml: JOHANNESBURG_BODY,
      hubId: 'gauteng_central'
    },
    {
      filename: 'cape-town.html',
      cityKey: 'Cape Town',
      title: 'Cape Town Self-Mastery | Physical Dianetics Book Western Cape',
      h1: 'Cape Town Operators: Screen-Free Recovery Protocol',
      metaDesc:
        'Hardcover of the classic 1950 self-improvement volume. Express courier Cape Town, Claremont, Stellenbosch. Instant EFT. Literary sale only.',
      bodyHtml: CAPE_TOWN_BODY,
      hubId: 'western_cape'
    },
    {
      filename: 'durban.html',
      cityKey: 'Durban',
      title: 'Durban Executive Resilience | Dianetics Book KZN Express Delivery',
      h1: 'KZN Coastal Operators: Offline Mental Load Reduction',
      metaDesc:
        'Physical 1950 self-improvement hardcover for Durban, Umhlanga, Ballito. Instant EFT to local Nedbank hub. Commercial literature only.',
      bodyHtml: DURBAN_BODY,
      hubId: 'kzn_coastal'
    },
    {
      filename: 'port-elizabeth.html',
      cityKey: 'Gqeberha',
      title: 'Gqeberha / Port Elizabeth Self-Mastery | Eastern Cape Book Delivery',
      h1: 'Eastern Cape Operators: Durable Offline Reference for Executive Clarity',
      metaDesc:
        'Hardcover of the 1950 classic delivered express in Gqeberha, Port Elizabeth, East London. Instant EFT. Commercial book sale only.',
      bodyHtml: GQEBERHA_BODY,
      hubId: 'eastern_cape'
    }
  ]
});

const files = builder.build();

mkdirSync(OUT_DIR, { recursive: true });

for (const [path, content] of Object.entries(files)) {
  const full = join(OUT_DIR, path);
  writeFileSync(full, content, 'utf8');
  console.log('Wrote', path, `(${content.length} bytes)`);
}

console.log('\nComplete static site written to', OUT_DIR);
console.log('Next: deploy the contents of dist-example/ to your chosen PSL platform.');
console.log('Set workerOrigin in the config if the Worker is not same-origin.');
