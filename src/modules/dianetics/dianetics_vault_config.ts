/**
 * Dianetics Engine — Isolated Credential Vault Schema
 * Branch: feature/dianetics-engine
 * Zero cross-contamination with core CAB credentials.
 *
 * EFT pattern aligned with proven SA Instant EFT flow:
 *   1. Customer places order → unique orderRef generated (SM-XXXXXXXX)
 *   2. resolve-eft returns regional bank details + orderRef as payment reference
 *   3. Customer Instant-EFTs using that reference
 *   4. process-order / payment-confirmed marks paid + triggers dispatch + CRM
 *
 * LIVE ACCOUNT NUMBERS: never commit. Inject only via Worker secrets or
 * local vault at deploy time.
 */

export interface BankHubDetails {
  hubId: string;
  regionName: string;
  matchedSuburbs: string[];
  /** Display bank name shown to customer */
  bankName: string;
  /** Account holder name shown to customer */
  accountHolder: string;
  /** Placeholder only — replace from isolated vault before live traffic */
  accountNumber: string;
  branchCode: string;
  /** Email that receives 24h dispatch alerts for this hub */
  fulfillmentEmail: string;
  /** Optional human-readable dispatch / shipping note (never clinical) */
  dispatchNote?: string;
}

export interface DianeticsVaultSchema {
  cloudflareApiKey: string;
  cloudflareAccountId: string;
  githubPat: string;
  githubOrg: string;
  crmWebhookUrl: string;
  sendgridApiKey: string;
  bankHubs: BankHubDetails[];
}

/**
 * Regional banking hubs for Instant EFT resolution.
 * Account numbers are PLACEHOLDERS — replace from isolated vault only.
 * Never commit real account numbers.
 *
 * Structure mirrors the proven single-hub pattern (Bank / Account Name /
 * Account Number / Branch Code / Amount / Reference) used on the existing
 * SA book-fulfillment site, expanded to 4 geo hubs.
 */
export const REGIONAL_BANK_HUBS: BankHubDetails[] = [
  {
    hubId: 'gauteng_central',
    regionName: 'Gauteng (Johannesburg / Randburg / Pretoria)',
    matchedSuburbs: [
      'Randburg', 'Ferndale', 'Sandton', 'Johannesburg', 'Pretoria',
      'Midrand', 'Roodepoort', 'Centurion', 'Fourways', 'Bryanston',
    ],
    bankName: 'First National Bank (FNB)',
    accountHolder: 'Gauteng Self-Mastery Publications',
    accountNumber: 'REPLACE_FROM_VAULT', // never commit live value
    branchCode: '250655',
    fulfillmentEmail: 'dispatch-jhb@example-self-mastery.local',
    dispatchNote: 'Gauteng dispatch hub — ship within 1–2 business days of EFT confirmation',
  },
  {
    hubId: 'western_cape',
    regionName: 'Western Cape (Cape Town / Stellenbosch / Bellville)',
    matchedSuburbs: [
      'Cape Town', 'Bellville', 'Stellenbosch', 'Somerset West',
      'Milnerton', 'Claremont', 'Observatory', 'Sea Point', 'Constantia',
    ],
    bankName: 'Standard Bank',
    accountHolder: 'Cape Town Self-Mastery Literature',
    accountNumber: 'REPLACE_FROM_VAULT',
    branchCode: '051001',
    fulfillmentEmail: 'dispatch-cpt@example-self-mastery.local',
    dispatchNote: 'Western Cape dispatch hub',
  },
  {
    hubId: 'kzn_coastal',
    regionName: 'KwaZulu-Natal (Durban / Umhlanga / Pinetown)',
    matchedSuburbs: [
      'Durban', 'Umhlanga', 'Pinetown', 'Ballito', 'Amanzimtoti',
      'Morningside', 'Berea', 'Westville', 'Hillcrest',
    ],
    bankName: 'Nedbank',
    accountHolder: 'KZN Educational Literature',
    accountNumber: 'REPLACE_FROM_VAULT',
    branchCode: '198765',
    fulfillmentEmail: 'dispatch-dur@example-self-mastery.local',
    dispatchNote: 'KZN dispatch hub',
  },
  {
    hubId: 'eastern_cape',
    regionName: 'Eastern Cape (Gqeberha / Port Elizabeth / East London)',
    matchedSuburbs: [
      'Port Elizabeth', 'Gqeberha', 'Summerstrand', 'East London',
      'Uitenhage', 'Humewood', 'Newton Park',
    ],
    bankName: 'Absa Bank',
    accountHolder: 'Eastern Cape Book Distribution',
    accountNumber: 'REPLACE_FROM_VAULT',
    branchCode: '632005',
    fulfillmentEmail: 'dispatch-pe@example-self-mastery.local',
    dispatchNote: 'Eastern Cape dispatch hub',
  },
];

/** Fixed SKU price in ZAR (cents optional in order systems) */
export const FIXED_PRICE_ZAR = 400;

/**
 * Order reference format: SM-XXXXXXXX (Self-Mastery)
 * Matches the proven ORD-XXXXXXXX pattern from the SA fulfillment site,
 * rebranded to stay non-trademark.
 */
export const ORDER_REF_PATTERN = /^SM-[A-Z0-9]{6,12}$/;

export function generateOrderRef(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SM-${suffix}`;
}

/**
 * Runtime validation for vault integrity.
 * Call at Worker startup or build time.
 */
export function validateVault(schema: Partial<DianeticsVaultSchema>): string[] {
  const errors: string[] = [];
  if (!schema.cloudflareApiKey) errors.push('Missing CLOUDFLARE_DIANETICS_API_KEY');
  if (!schema.cloudflareAccountId) errors.push('Missing CLOUDFLARE_DIANETICS_ACCOUNT_ID');
  if (!schema.githubPat) errors.push('Missing GITHUB_DIANETICS_PAT');
  if (!schema.crmWebhookUrl) errors.push('Missing DIANETICS_CRM_WEBHOOK_URL');
  if (!schema.sendgridApiKey) errors.push('Missing DIANETICS_SENDGRID_API_KEY');
  if (!schema.bankHubs || schema.bankHubs.length < 4) {
    errors.push('REGIONAL_BANK_HUBS incomplete — need 4 regional hubs');
  }
  for (const hub of schema.bankHubs || []) {
    if (!hub.accountNumber || hub.accountNumber.includes('REPLACE')) {
      errors.push(`Hub ${hub.hubId}: live accountNumber not injected`);
    }
  }
  return errors;
}
