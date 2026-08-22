/**
 * Page brief builder for PSL ranking pages.
 * Turns keyword + geo + cluster research into a structured brief that the content agent
 * (and human editors) use under the SA voice system prompt.
 *
 * Research inputs: docs/11–15 (volumes, SERP, structure plan), docs/16 (voice).
 */

import { ContentCluster, sampleOpeningFor } from './sa_content_voice';

export type PageRole = 'pillar' | 'spoke' | 'cluster_support';

export interface PageBrief {
  /** Internal id e.g. burnout-recovery-jhb */
  briefId: string;
  role: PageRole;
  /** Primary ranking phrase (H1 seed) */
  primaryKeyword: string;
  /** Secondary phrases for H2 / FAQ / internal density */
  secondaryKeywords: string[];
  /** SERP opportunity label from research */
  serpOpportunity: 'HIGH' | 'MEDIUM' | 'HARD' | 'UNKNOWN';
  cluster: ContentCluster;
  /** City or region for local colour; empty for national pillar */
  geo: string;
  /** Suggested title tag */
  title: string;
  /** Suggested H1 */
  h1: string;
  /** Meta description seed */
  metaDesc: string;
  /** Target word count */
  wordCountMin: number;
  wordCountMax: number;
  /** FAQ questions from long-tail SERP language */
  faqQuestions: string[];
  /** Sibling internal link labels (paths filled at build time) */
  internalLinkHints: string[];
  /** Sample opening to few-shot the LLM */
  sampleOpening: string;
  /** Soft CTA angle */
  ctaAngle: string;
  /** Hub id for Instant EFT resolution when this is a conversion page */
  hubId?: string;
  /** Notes for the writer / model */
  writerNotes: string[];
}

export interface BuildPageBriefInput {
  briefId: string;
  role?: PageRole;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  serpOpportunity?: PageBrief['serpOpportunity'];
  cluster: ContentCluster;
  geo?: string;
  faqQuestions?: string[];
  internalLinkHints?: string[];
  hubId?: string;
  writerNotes?: string[];
}

function titleCaseKeyword(kw: string): string {
  // Display casing for titles/H1s: capitalise words, keep small connectors lower
  const small = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'from', 'but']);
  const parts = kw.trim().replace(/\s+/g, ' ').split(' ');
  return parts
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && small.has(lower)) return lower;
      if (lower === "can't" || lower === "doesn't" || lower === "won't") {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function buildTitle(primary: string, geo: string, role: PageRole): string {
  const base = titleCaseKeyword(primary);
  if (geo) {
    return `${base} | ${geo}, South Africa`;
  }
  if (role === 'pillar') {
    return `${base} | South Africa`;
  }
  return `${base} | Self-Mastery SA`;
}

function buildH1(primary: string, geo: string): string {
  const p = titleCaseKeyword(primary);
  if (geo && !p.toLowerCase().includes(geo.toLowerCase())) {
    return `${p} in ${geo}`;
  }
  return p;
}

function buildMeta(primary: string, geo: string): string {
  const place = geo || 'South Africa';
  return `${titleCaseKeyword(primary)} — practical clarity for able professionals in ${place}. Physical self-improvement book, Instant EFT, express delivery. Not medical advice.`;
}

const DEFAULT_FAQ_BY_CLUSTER: Record<ContentCluster, string[]> = {
  burnout_exhaustion: [
    'Why does rest not fix my exhaustion?',
    'How do I recover from burnout when I cannot quit?',
    'What is high-functioning burnout?',
    'Why am I still exhausted after sleeping?'
  ],
  reactivity_composure: [
    'Why do I overreact to small things?',
    'How do I stop snapping at people?',
    'Why am I more reactive when tired?',
    'How do I keep composure under pressure?'
  ],
  successful_empty: [
    'Why do successful people feel empty?',
    'Why do I feel empty after winning?',
    'What is high achiever emptiness?'
  ],
  self_sabotage: [
    'Why do I sabotage myself near success?',
    'Why do I get in my own way?',
    'How do I stop self sabotage patterns?'
  ],
  self_mastery_performance: [
    'What is self mastery for high performers?',
    'How do professionals build composure under load?',
    'What does self mastery mean in practical terms?'
  ],
  sa_trapped_stress: [
    'How do I cope with burnout when I cannot quit?',
    'How do I handle load shedding stress at work?',
    'What is trapped stress when money pressure is real?'
  ],
  numbness_shutdown: [
    'Why do I feel emotionally numb after stress?',
    'How do I feel alive again after chronic stress?',
    'Why does emotional numbness happen to high performers?'
  ],
  people_load: [
    'How do I stop absorbing other people\'s stress?',
    'Why am I exhausted by people at work?',
    'What is people pleasing exhaustion?'
  ],
  overthinking: [
    'How do I break the cycle of overthinking?',
    'Why can\'t I switch off from work thoughts?',
    'How do I quiet mental noise after hours?'
  ],
  other: [
    'What is this page for?',
    'Is this medical advice?',
    'How does Instant EFT ordering work in South Africa?'
  ]
};

/**
 * Build a structured page brief from research inputs.
 * This brief is the user-side payload for content generation under SA_CONTENT_RUNTIME_SYSTEM_PROMPT.
 */
export function buildPageBrief(input: BuildPageBriefInput): PageBrief {
  const role = input.role || (input.geo ? 'spoke' : 'pillar');
  const geo = input.geo || '';
  const secondary = input.secondaryKeywords || [];
  const faq =
    input.faqQuestions && input.faqQuestions.length > 0
      ? input.faqQuestions
      : DEFAULT_FAQ_BY_CLUSTER[input.cluster] || DEFAULT_FAQ_BY_CLUSTER.other;

  const wordMin = role === 'pillar' ? 900 : 700;
  const wordMax = role === 'pillar' ? 1400 : 1100;

  return {
    briefId: input.briefId,
    role,
    primaryKeyword: input.primaryKeyword,
    secondaryKeywords: secondary,
    serpOpportunity: input.serpOpportunity || 'UNKNOWN',
    cluster: input.cluster,
    geo,
    title: buildTitle(input.primaryKeyword, geo, role),
    h1: buildH1(input.primaryKeyword, geo),
    metaDesc: buildMeta(input.primaryKeyword, geo),
    wordCountMin: wordMin,
    wordCountMax: wordMax,
    faqQuestions: faq,
    internalLinkHints: input.internalLinkHints || [],
    sampleOpening: sampleOpeningFor(input.cluster),
    ctaAngle:
      'Soft close: physical book as answers + something to apply; Instant EFT R400 express SA; decide for yourself. No hard sell.',
    hubId: input.hubId,
    writerNotes: [
      'Ranking surface = problem language + able framing. Book name only in conversion close.',
      'SA-specific recognition required in opening.',
      'FAQ must stay non-YMYL.',
      ...(input.writerNotes || [])
    ]
  };
}

/** Wave 1 seed briefs from docs/15 structure plan — operators can expand. */
export function wave1BriefSeeds(): BuildPageBriefInput[] {
  return [
    {
      briefId: 'self-mastery-sa-pillar',
      role: 'pillar',
      primaryKeyword: 'self mastery for high performers',
      secondaryKeywords: ['self mastery', 'composure for professionals South Africa'],
      serpOpportunity: 'HIGH',
      cluster: 'self_mastery_performance',
      geo: '',
      hubId: 'gauteng_central',
      internalLinkHints: ['executive burnout recovery', 'can\'t switch off from work', 'short temper']
    },
    {
      briefId: 'executive-burnout-recovery-sa',
      role: 'pillar',
      primaryKeyword: 'executive burnout recovery',
      secondaryKeywords: [
        'burnout recovery South Africa',
        'how to recover from burnout that sleep doesn\'t fix',
        'high functioning burnout'
      ],
      serpOpportunity: 'HIGH',
      cluster: 'burnout_exhaustion',
      hubId: 'gauteng_central',
      internalLinkHints: ['can\'t switch off from work', 'self mastery', 'Johannesburg executive burnout']
    },
    {
      briefId: 'executive-burnout-johannesburg',
      role: 'spoke',
      primaryKeyword: 'executive burnout recovery Johannesburg',
      secondaryKeywords: ['high performer stress Johannesburg', 'professional burnout Johannesburg'],
      serpOpportunity: 'HIGH',
      cluster: 'burnout_exhaustion',
      geo: 'Johannesburg',
      hubId: 'gauteng_central',
      internalLinkHints: ['executive burnout recovery', 'Sandton high performer stress']
    },
    {
      briefId: 'cant-switch-off',
      role: 'cluster_support',
      primaryKeyword: 'can\'t switch off from work',
      secondaryKeywords: ['why am I still exhausted after sleeping', 'burned out but can\'t quit'],
      serpOpportunity: 'HIGH',
      cluster: 'sa_trapped_stress',
      hubId: 'gauteng_central'
    },
    {
      briefId: 'short-temper-reactivity',
      role: 'cluster_support',
      primaryKeyword: 'how to stop snapping at people',
      secondaryKeywords: ['short temper', 'why do I overreact to small things', 'stop overreacting'],
      serpOpportunity: 'HIGH',
      cluster: 'reactivity_composure'
    },
    {
      briefId: 'successful-but-empty',
      role: 'cluster_support',
      primaryKeyword: 'successful but empty',
      secondaryKeywords: ['high achiever emptiness', 'why do successful people feel empty'],
      serpOpportunity: 'HIGH',
      cluster: 'successful_empty'
    }
  ];
}
