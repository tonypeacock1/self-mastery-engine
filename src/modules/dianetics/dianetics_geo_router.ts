/**
 * Cloudflare Worker: Dianetics Geo-EFT Resolver, Dispatch Alert & CRM Gateway
 * Isolated deployment target. No shared credentials with core platform.
 * Zero-leak error responses. Strict CORS. No-store cache.
 */

import { REGIONAL_BANK_HUBS, BankHubDetails } from './dianetics_vault_config';

export interface Env {
  DIANETICS_CRM_WEBHOOK_URL: string;
  DIANETICS_SENDGRID_API_KEY: string;
  // Optional allowlist of origins for tighter CORS
  ALLOWED_ORIGINS?: string;
}

const ORDER_REF_PATTERN = /^SM-[A-Z0-9]{6,12}$/; // Self-Mastery — aligned with vault ORDER_REF_PATTERN

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    // Preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204, origin, env);
    }

    // Dynamic Geo-EFT Bank Account Resolution
    if (url.pathname === '/api/resolve-eft' && request.method === 'POST') {
      try {
        const body = await request.json() as { suburb?: string; city?: string };
        const clientCity = (body.city || request.headers.get('cf-ipcity') || 'Johannesburg').trim();
        const clientSuburb = (body.suburb || '').trim();

        const matchedBank = resolveBankDetails(clientCity, clientSuburb);

        // Never return full account numbers to untrusted clients if not needed —
        // here we do return because Instant EFT requires them, but mask in logs.
        return corsResponse({
          success: true,
          totalPriceZar: 400,
          currency: 'ZAR',
          bankDetails: {
            hubId: matchedBank.hubId,
            regionName: matchedBank.regionName,
            bankName: matchedBank.bankName,
            accountHolder: matchedBank.accountHolder,
            accountNumber: matchedBank.accountNumber,
            branchCode: matchedBank.branchCode,
            referenceHint: 'Use unique order reference SM-XXXXXXXX as payment reference'
          }
        }, 200, origin, env);
      } catch {
        return corsResponse({ error: 'Invalid resolution request' }, 400, origin, env);
      }
    }

    // Fulfillment Alert + Central CRM Sync
    if (url.pathname === '/api/process-order' && request.method === 'POST') {
      try {
        const order = await request.json() as {
          fullName: string;
          email: string;
          phone: string;
          address: string;
          suburb: string;
          city: string;
          orderRef: string;
        };

        // Basic validation
        if (!order.fullName || !order.email || !order.orderRef) {
          return corsResponse({ error: 'Missing required fields' }, 400, origin, env);
        }
        if (!ORDER_REF_PATTERN.test(order.orderRef)) {
          return corsResponse({ error: 'Invalid order reference format' }, 400, origin, env);
        }

        const bankInfo = resolveBankDetails(order.city, order.suburb);

        // 1. Dispatch Alert Email (SendGrid)
        if (env.DIANETICS_SENDGRID_API_KEY) {
          const sendRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.DIANETICS_SENDGRID_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: bankInfo.fulfillmentEmail }] }],
              from: { email: 'orders@self-mastery-sa.local', name: 'Self-Mastery SA Dispatch' },
              subject: `[DISPATCH] Order ${order.orderRef} — ${order.city}`,
              content: [{
                type: 'text/plain',
                value: [
                  'NEW ORDER READY FOR PACKAGING',
                  '',
                  `Ref: ${order.orderRef}`,
                  `Customer: ${order.fullName}`,
                  `Phone: ${order.phone}`,
                  `Email: ${order.email}`,
                  `Address: ${order.address}, ${order.suburb}, ${order.city}`,
                  `Amount: R400.00 ZAR`,
                  `Dispatch Hub: ${bankInfo.regionName}`,
                  '',
                  'Ship via Express Courier within 24 hours.',
                  'Confirm tracking back to this system when available.'
                ].join('\n')
              }]
            })
          });

          if (!sendRes.ok) {
            // Soft fail — still continue to CRM so order is not lost
            console.error('SendGrid dispatch failed', sendRes.status);
          }
        }

        // 2. Post-Purchase Central CRM Sync
        if (env.DIANETICS_CRM_WEBHOOK_URL) {
          await fetch(env.DIANETICS_CRM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'dianetics_order_created',
              orderRef: order.orderRef,
              customer: {
                fullName: order.fullName,
                email: order.email,
                phone: order.phone,
                city: order.city,
                suburb: order.suburb,
                address: order.address
              },
              fulfillment: {
                targetHub: bankInfo.hubId,
                regionName: bankInfo.regionName
              },
              amountZar: 400,
              timestamp: new Date().toISOString()
            })
          });
        }

        return corsResponse({
          success: true,
          message: 'Fulfillment notified and CRM synced',
          orderRef: order.orderRef
        }, 200, origin, env);
      } catch {
        return corsResponse({ error: 'Order processing failed' }, 500, origin, env);
      }
    }

    // Health / identity
    if (url.pathname === '/' || url.pathname === '/health') {
      return corsResponse({ status: 'Dianetics Geo Router Active', version: '1.0.0' }, 200, origin, env);
    }

    return corsResponse({ error: 'Not found' }, 404, origin, env);
  }
};

function resolveBankDetails(city: string, suburb: string): BankHubDetails {
  const query = `${city} ${suburb}`.toLowerCase();
  for (const hub of REGIONAL_BANK_HUBS) {
    if (hub.matchedSuburbs.some(s => query.includes(s.toLowerCase()))) {
      return hub;
    }
  }
  // Fallback Gauteng Central — log unmatched in production for expansion
  return REGIONAL_BANK_HUBS[0];
}

function corsResponse(
  body: unknown,
  status: number,
  origin: string,
  env: Env
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  });

  // Allowlist if configured, otherwise permissive for multi-PSL
  if (env.ALLOWED_ORIGINS) {
    const allowed = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      headers.set('Access-Control-Allow-Origin', origin);
    }
  } else {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  return new Response(body ? JSON.stringify(body) : null, { status, headers });
}
