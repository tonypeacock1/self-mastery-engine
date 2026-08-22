/**
 * Content agent — wires SA voice system prompt + page brief into LLM message payloads.
 *
 * Flow:
 *   research (docs 11–15) → buildPageBrief() → buildContentMessages() → LLM → bodyHtml
 *   bodyHtml + title/h1/meta from brief → DianeticsPslBuilder (static shell + EFT widget)
 *
 * This module does not call an LLM itself. It produces the contract every generator must use.
 */

import {
  SA_CONTENT_RUNTIME_SYSTEM_PROMPT,
  SA_VOICE_EDITOR_CHECKLIST,
  sampleOpeningFor
} from './sa_content_voice';
import { PageBrief, buildPageBrief, wave1BriefSeeds, BuildPageBriefInput } from './page_brief';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ContentGenerationRequest {
  brief: PageBrief;
  /** Optional extra operator instructions for this page only */
  extraInstructions?: string;
}

export interface ContentGenerationResult {
  briefId: string;
  title: string;
  h1: string;
  metaDesc: string;
  /** HTML fragment for article body — inject as pillarBodyHtml / spoke.bodyHtml */
  bodyHtml: string;
  cluster: string;
  geo: string;
  hubId?: string;
  voiceContract: 'sa_content_voice_v1';
}

/**
 * Build the exact message array to send to the content LLM.
 * System = SA voice runtime prompt.
 * User = structured brief + output rules.
 */
export function buildContentMessages(req: ContentGenerationRequest): LlmMessage[] {
  const b = req.brief;
  const sample = b.sampleOpening || sampleOpeningFor(b.cluster);

  const userParts: string[] = [
    'Write the ranking-page article body for the following brief.',
    '',
    `BRIEF ID: ${b.briefId}`,
    `ROLE: ${b.role}`,
    `PRIMARY KEYWORD (H1 is rendered separately — align body to this phrase): ${b.primaryKeyword}`,
    `SECONDARY KEYWORDS: ${b.secondaryKeywords.join('; ') || '(none)'}`,
    `SERP OPPORTUNITY: ${b.serpOpportunity}`,
    `CLUSTER: ${b.cluster}`,
    `GEO: ${b.geo || 'South Africa (national)'}`,
    `TARGET WORD COUNT: ${b.wordCountMin}–${b.wordCountMax}`,
    '',
    'SUGGESTED TITLE (for context): ' + b.title,
    'SUGGESTED H1 (for context — do not output H1 tag): ' + b.h1,
    '',
    'FAQ QUESTIONS TO ANSWER IN A FAQ SECTION:',
    ...b.faqQuestions.map((q, i) => `${i + 1}. ${q}`),
    '',
    'INTERNAL LINK HINTS (mention naturally as text; use placeholder href="#"):',
    ...(b.internalLinkHints.length
      ? b.internalLinkHints.map(h => `- ${h}`)
      : ['- (none specified)']),
    '',
    'CTA ANGLE: ' + b.ctaAngle,
    '',
    'WRITER NOTES:',
    ...b.writerNotes.map(n => `- ${n}`),
    '',
    'FEW-SHOT OPENING STYLE (match this register, do not copy verbatim unless it fits):',
    sample,
    '',
    'OUTPUT RULES:',
    '- Return ONLY the HTML body fragment (p, h2, h3, ul, ol, section.faq).',
    '- Do not include <h1>, <html>, <body>, nav, footer, or Instant EFT form markup.',
    '- Include an FAQ block with the questions above and substantive answers.',
    '- End with a soft bridge paragraph toward ordering the physical book via Instant EFT (decide-for-yourself tone).',
    '- South African Standard English; specific before abstract.'
  ];

  if (req.extraInstructions) {
    userParts.push('', 'EXTRA OPERATOR INSTRUCTIONS:', req.extraInstructions);
  }

  return [
    { role: 'system', content: SA_CONTENT_RUNTIME_SYSTEM_PROMPT },
    { role: 'user', content: userParts.join('\n') }
  ];
}

/**
 * Convenience: brief input → messages in one call.
 */
export function messagesFromBriefInput(
  input: BuildPageBriefInput,
  extraInstructions?: string
): { brief: PageBrief; messages: LlmMessage[] } {
  const brief = buildPageBrief(input);
  return {
    brief,
    messages: buildContentMessages({ brief, extraInstructions })
  };
}

/**
 * Package LLM bodyHtml with brief metadata for the PSL builder.
 * Call after the model returns the HTML fragment.
 */
export function packageForPsl(
  brief: PageBrief,
  bodyHtml: string
): ContentGenerationResult {
  return {
    briefId: brief.briefId,
    title: brief.title,
    h1: brief.h1,
    metaDesc: brief.metaDesc,
    bodyHtml: bodyHtml.trim(),
    cluster: brief.cluster,
    geo: brief.geo,
    hubId: brief.hubId,
    voiceContract: 'sa_content_voice_v1'
  };
}

/**
 * Lightweight validator — returns list of failed checklist items (empty = pass).
 * Does not replace human review.
 */
export function validateBodyHtmlAgainstVoice(bodyHtml: string): string[] {
  const failures: string[] = [];
  const html = bodyHtml || '';
  const lower = html.toLowerCase();

  if (!html.trim()) {
    failures.push('Empty bodyHtml');
    return failures;
  }
  if (/<h1[\s>]/i.test(html)) {
    failures.push('Contains H1 — shell renders H1 separately');
  }
  if (/<html[\s>]|<body[\s>]/i.test(html)) {
    failures.push('Contains html/body wrapper — fragment only');
  }
  if (/eft-widget|resolve-eft|process-order/i.test(html)) {
    failures.push('Contains EFT widget markup — builder injects widget');
  }
  // Soft YMYL red flags
  if (
    /\b(diagnose|diagnosed|cure depression|treat anxiety|ptsd treatment|prescription)\b/i.test(
      html
    )
  ) {
    failures.push('Possible YMYL medical claim language');
  }
  if (
    /\b(engram|thetan|operating thetan|clearing course|auditing session)\b/i.test(html)
  ) {
    failures.push('Trademark doctrine jargon on ranking surface');
  }
  if (/\b(you'?ve got this|hold space|inner child work|manifest your)\b/i.test(html)) {
    failures.push('US wellness / therapy-speak register');
  }
  // Encourage SA signal on non-trivial pages
  if (
    html.length > 400 &&
    !/\b(south africa|johannesburg|cape town|durban|gauteng|sandton|load shedding|robot|gqeberha|pretoria|randburg)\b/i.test(
      lower
    )
  ) {
    failures.push('Weak or missing South African local signal');
  }

  return failures;
}

export function getEditorChecklist(): readonly string[] {
  return SA_VOICE_EDITOR_CHECKLIST;
}

/** Export Wave 1 briefs ready for generation jobs. */
export function getWave1Briefs(): PageBrief[] {
  return wave1BriefSeeds().map(buildPageBrief);
}

export {
  buildPageBrief,
  wave1BriefSeeds,
  SA_CONTENT_RUNTIME_SYSTEM_PROMPT
};
