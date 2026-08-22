/**
 * Demo: print SA-voice content messages for Wave 1 briefs (no LLM call).
 * Proves the wire: brief → system prompt + user payload.
 *
 *   npx tsx scripts/print-wave1-content-messages.ts
 */
import { getWave1Briefs, buildContentMessages } from '../src/modules/dianetics/content_agent';

const briefs = getWave1Briefs();
console.log(`Wave 1 briefs: ${briefs.length}\n`);

for (const brief of briefs) {
  const messages = buildContentMessages({ brief });
  console.log('='.repeat(72));
  console.log(`BRIEF: ${brief.briefId}`);
  console.log(`H1: ${brief.h1}`);
  console.log(`cluster=${brief.cluster} geo=${brief.geo || 'national'} serp=${brief.serpOpportunity}`);
  console.log(`system prompt chars: ${messages[0].content.length}`);
  console.log(`user payload chars: ${messages[1].content.length}`);
  console.log('--- user payload preview ---');
  console.log(messages[1].content.slice(0, 500) + '...\n');
}

console.log('Wire OK: every brief uses SA_CONTENT_RUNTIME_SYSTEM_PROMPT as system message.');
