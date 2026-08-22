/**
 * Dianetics PSL Static Site Builder
 * Generates pure static HTML SILO mini-sites for Cloudflare Pages, GitHub Pages,
 * Vercel, Netlify, Render, Deno Deploy, etc.
 * Directive 2 compliant (sitemap, robots, llms.txt, llms-full.txt).
 * Zero-footprint architecture. Progressive EFT widget.
 * Strict SILO: pillar links to spokes; spokes link only to pillar.
 */

import { REGIONAL_BANK_HUBS, BankHubDetails } from './dianetics_vault_config';

export interface SpokeConfig {
  filename: string;           // e.g. johannesburg.html
  cityKey: string;            // display name for nav
  title: string;
  h1: string;
  metaDesc: string;
  bodyHtml: string;           // unique content from LLM Agent
  hubId: string;              // matches REGIONAL_BANK_HUBS hubId
}

export interface PslSiteConfig {
  siteSlug: string;           // internal identifier
  baseUrl: string;            // final deployed root, e.g. https://exec-resilience-sa.pages.dev
  platform: 'cloudflare-pages' | 'github-pages' | 'vercel' | 'netlify' | 'other';
  /** Absolute origin of the Cloudflare Worker for /api/resolve-eft and /api/process-order.
   *  Required for non-Cloudflare-Pages platforms. Leave empty for same-origin binding. */
  workerOrigin?: string;
  pillarTitle: string;
  pillarH1: string;
  pillarMetaDesc: string;
  pillarBodyHtml: string;
  spokes: SpokeConfig[];
}

export class DianeticsPslBuilder {
  private config: PslSiteConfig;

  constructor(config: PslSiteConfig) {
    this.config = config;
  }

  /** Build complete file map for static deploy */
  build(): Record<string, string> {
    const files: Record<string, string> = {};

    // Pillar
    files['index.html'] = this.renderPage({
      title: this.config.pillarTitle,
      h1: this.config.pillarH1,
      metaDesc: this.config.pillarMetaDesc,
      bodyHtml: this.config.pillarBodyHtml,
      canonicalPath: '/',
      isPillar: true,
      hubId: 'gauteng_central'
    });

    // Spokes (canonical paths strip .html for Cloudflare Pages pretty URLs)
    for (const spoke of this.config.spokes) {
      const canonPath = this.prettyPath(spoke.filename);
      files[spoke.filename] = this.renderPage({
        title: spoke.title,
        h1: spoke.h1,
        metaDesc: spoke.metaDesc,
        bodyHtml: spoke.bodyHtml,
        canonicalPath: canonPath,
        isPillar: false,
        hubId: spoke.hubId
      });
    }

    // Directive 2 files
    files['robots.txt'] = this.generateRobotsTxt();
    files['sitemap.xml'] = this.generateSitemap();
    files['llms.txt'] = this.generateLlmsTxt(false);
    files['llms-full.txt'] = this.generateLlmsTxt(true);

    // Platform-specific
    if (this.config.platform === 'cloudflare-pages') {
      files['_headers'] = this.generateCloudflareHeaders();
    }

    return files;
  }

  private renderPage(opts: {
    title: string;
    h1: string;
    metaDesc: string;
    bodyHtml: string;
    canonicalPath: string;
    isPillar: boolean;
    hubId: string;
  }): string {
    const canonical = `${this.config.baseUrl}${opts.canonicalPath === '/' ? '' : opts.canonicalPath}`;
    const hub = REGIONAL_BANK_HUBS.find(h => h.hubId === opts.hubId) || REGIONAL_BANK_HUBS[0];

    // SILO navigation only
    const navHtml = opts.isPillar
      ? this.config.spokes
          .map(s => `<a href="${this.prettyPath(s.filename)}">${this.escape(s.cityKey)}</a>`)
          .join(' · ')
      : `<a href="/">Self-Mastery Home</a>`;

    const jsonLd = this.generateJsonLd(opts, hub, canonical);

    return `<!DOCTYPE html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${this.escape(opts.title)}</title>
<meta name="description" content="${this.escape(opts.metaDesc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Self-Mastery Publications SA">
<meta name="geo.region" content="ZA">
<meta name="geo.placename" content="South Africa">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_ZA">
<meta property="og:site_name" content="Self-Mastery Publications SA">
<meta property="og:title" content="${this.escape(opts.title)}">
<meta property="og:description" content="${this.escape(opts.metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${this.config.baseUrl}/images/og-book.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Dianetics: The Modern Science of Mental Health hardcover">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${this.escape(opts.title)}">
<meta name="twitter:description" content="${this.escape(opts.metaDesc)}">
<meta name="twitter:image" content="${this.config.baseUrl}/images/og-book.jpg">
<style>
/* Critical CSS only – zero external dependencies, zero footprint */
:root{--text:#1a1a1a;--muted:#555;--border:#ddd;--accent:#0a5}
body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65;color:var(--text);max-width:720px;margin:0 auto;padding:1.25rem 1rem}
h1{font-size:1.65rem;line-height:1.25;margin:0 0 1rem}
h2{font-size:1.25rem;margin:1.75rem 0 0.75rem}
nav{font-size:0.95rem;margin-bottom:1.5rem}
nav a{color:var(--accent);text-decoration:none;margin-right:0.5rem}
.disclaimer{background:#f7f7f7;border-left:4px solid #666;padding:0.85rem 1rem;margin:1.5rem 0;font-size:0.9rem}
.eft-widget{border:1px solid var(--border);padding:1.25rem;margin:2rem 0;border-radius:6px;background:#fafafa}
.product-shot{display:flex;gap:1rem;align-items:flex-start;margin:1rem 0 1.25rem;flex-wrap:wrap}
.product-shot img{width:140px;height:auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.12);background:#111}
.product-caption{flex:1;min-width:180px;font-size:0.92rem;color:var(--muted);margin:0}
.eft-widget label{display:block;margin:0.6rem 0 0.2rem;font-weight:600;font-size:0.9rem}
.eft-widget input{width:100%;padding:0.55rem 0.65rem;border:1px solid #ccc;border-radius:4px;font-size:1rem;box-sizing:border-box}
.eft-widget button{margin-top:0.75rem;padding:0.65rem 1.25rem;background:var(--accent);color:#fff;border:none;border-radius:4px;font-size:1rem;cursor:pointer;font-weight:600}
.bank-panel{display:none;background:#eef6ff;padding:1rem;margin-top:1rem;border-radius:4px;border:1px solid #cce}
.bank-panel.visible{display:block}
footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #eee;font-size:0.85rem;color:var(--muted)}
</style>
<script type="application/ld+json">
${jsonLd}
</script>
</head>
<body>
<nav>${navHtml}</nav>
<article>
<h1>${this.escape(opts.h1)}</h1>
${opts.bodyHtml}

<div class="disclaimer" role="note">
<strong>Important disclaimer:</strong> This page sells the physical self-improvement book <em>Dianetics: The Modern Science of Mental Health</em> (first published 1950). It is commercial literature for personal development only. It is not medical advice, clinical therapy, psychological counselling, or any form of treatment. Consult a qualified professional for health-related concerns.
</div>

<section class="eft-widget" id="order" aria-labelledby="order-h">
<h2 id="order-h">Order the Physical Hardcover – R400 Total</h2>
<div class="product-shot">
<picture>
<source type="image/webp" srcset="/images/dianetics-hardcover.webp">
<img src="/images/dianetics-hardcover.jpg" width="280" height="448" alt="Dianetics: The Modern Science of Mental Health — hardcover book cover" loading="lazy" decoding="async">
</picture>
<p class="product-caption"><strong>Dianetics: The Modern Science of Mental Health</strong> by L. Ron Hubbard (hardcover). Publisher materials state more than 20 million copies sold worldwide and translations into 50 languages. First published 1950.</p>
</div>
<p>Book + 24-hour express courier anywhere in major South African metros. Instant EFT. Bank details resolve to your nearest regional fulfillment hub.</p>

<form id="eft-form" novalidate>
<label for="fullName">Full Name</label>
<input type="text" id="fullName" name="fullName" required autocomplete="name" placeholder="As on ID / bank">

<label for="email">Email</label>
<input type="email" id="email" name="email" required autocomplete="email">

<label for="phone">Mobile (SA)</label>
<input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="08x xxx xxxx">

<label for="address">Street Address</label>
<input type="text" id="address" name="address" required autocomplete="street-address">

<label for="suburb">Suburb</label>
<input type="text" id="suburb" name="suburb" required>

<label for="city">City</label>
<input type="text" id="city" name="city" required placeholder="Johannesburg / Cape Town / Durban / Gqeberha">

<button type="submit">Generate Instant EFT Details + Unique Order Reference</button>
</form>

<div id="bank-panel" class="bank-panel" role="region" aria-live="polite"></div>
</section>
</article>

<footer>
<p>Self-Mastery Publications SA · Physical book fulfillment only · Express courier within 24 hours of Instant EFT confirmation</p>
<p><a href="/">Return to Executive Self-Mastery</a></p>
</footer>

<script>
/* Progressive enhancement – page remains fully functional without JS */
(function () {
  const form = document.getElementById('eft-form');
  const panel = document.getElementById('bank-panel');
  if (!form || !panel) return;

  // Absolute Worker origin for multi-platform PSL support (injected at build time)
  const API_BASE = '${this.config.workerOrigin || ""}';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const orderRef = 'DIA-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    panel.innerHTML = '<p>Resolving nearest bank hub…</p>';
    panel.classList.add('visible');

    try {
      const resolveRes = await fetch(API_BASE + '/api/resolve-eft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: data.city, suburb: data.suburb })
      });
      const resolve = await resolveRes.json();
      if (!resolve.success) throw new Error('resolve failed');

      const b = resolve.bankDetails;
      panel.innerHTML = [
        '<h3>Instant EFT Payment Details</h3>',
        '<p><strong>Amount:</strong> R400.00 ZAR</p>',
        '<p><strong>Payment Reference (critical):</strong> ' + orderRef + '</p>',
        '<p><strong>Bank:</strong> ' + b.bankName + '</p>',
        '<p><strong>Account Holder:</strong> ' + b.accountHolder + '</p>',
        '<p><strong>Account Number:</strong> ' + b.accountNumber + '</p>',
        '<p><strong>Branch Code:</strong> ' + b.branchCode + '</p>',
        '<p><strong>Fulfillment Region:</strong> ' + b.regionName + '</p>',
        '<p>After you have completed the Instant EFT, click the button below to notify dispatch.</p>',
        '<button type="button" id="confirm-btn">I Have Paid – Notify Fulfillment</button>'
      ].join('');

      document.getElementById('confirm-btn').addEventListener('click', async function () {
        this.disabled = true;
        this.textContent = 'Sending…';
        try {
          const proc = await fetch(API_BASE + '/api/process-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              address: data.address,
              suburb: data.suburb,
              city: data.city,
              orderRef: orderRef
            })
          });
          const result = await proc.json();
          if (result.success) {
            panel.innerHTML += '<p style="color:#0a5;font-weight:600;margin-top:1rem">Order confirmed. Regional dispatch notified. You will receive tracking by email within the SLA window.</p>';
          } else {
            panel.innerHTML += '<p style="color:#c00">Confirmation failed. Please keep your order reference and contact support.</p>';
          }
        } catch {
          panel.innerHTML += '<p style="color:#c00">Network error on confirmation. Keep your order reference.</p>';
        }
      });
    } catch {
      panel.innerHTML = '<p style="color:#c00">Unable to resolve bank details at this moment. Please retry or use the Gauteng Standard Bank details as temporary fallback and contact support with your order reference.</p>';
    }
  });
})();
</script>
</body>
</html>`;
  }

  /** SA place graph: Wikidata Q + Wikipedia + coordinates */
  private static readonly PLACES: Record<
    string,
    { name: string; qid: string; wiki: string; lat: number; lng: number; region: string }
  > = {
    'south-africa': {
      name: 'South Africa',
      qid: 'Q258',
      wiki: 'https://en.wikipedia.org/wiki/South_Africa',
      lat: -30.5595,
      lng: 22.9375,
      region: 'ZA'
    },
    johannesburg: {
      name: 'Johannesburg',
      qid: 'Q34647',
      wiki: 'https://en.wikipedia.org/wiki/Johannesburg',
      lat: -26.2041,
      lng: 28.0473,
      region: 'Gauteng'
    },
    gauteng: {
      name: 'Gauteng',
      qid: 'Q133083',
      wiki: 'https://en.wikipedia.org/wiki/Gauteng',
      lat: -26.2708,
      lng: 28.1123,
      region: 'Gauteng'
    },
    pretoria: {
      name: 'Pretoria',
      qid: 'Q3926',
      wiki: 'https://en.wikipedia.org/wiki/Pretoria',
      lat: -25.7479,
      lng: 28.2293,
      region: 'Gauteng'
    },
    sandton: {
      name: 'Sandton',
      qid: 'Q1026420',
      wiki: 'https://en.wikipedia.org/wiki/Sandton',
      lat: -26.1052,
      lng: 28.056,
      region: 'Gauteng'
    },
    'cape-town': {
      name: 'Cape Town',
      qid: 'Q5465',
      wiki: 'https://en.wikipedia.org/wiki/Cape_Town',
      lat: -33.9249,
      lng: 18.4241,
      region: 'Western Cape'
    },
    durban: {
      name: 'Durban',
      qid: 'Q5468',
      wiki: 'https://en.wikipedia.org/wiki/Durban',
      lat: -29.8587,
      lng: 31.0218,
      region: 'KwaZulu-Natal'
    },
    gqeberha: {
      name: 'Gqeberha',
      qid: 'Q125434',
      wiki: 'https://en.wikipedia.org/wiki/Gqeberha',
      lat: -33.9608,
      lng: 25.6022,
      region: 'Eastern Cape'
    }
  };

  /** Parent + child topic entities (non-medical framing only) */
  private static readonly TOPICS = [
    {
      name: 'Self-help',
      qid: 'Q6498453',
      wiki: 'https://en.wikipedia.org/wiki/Self-help'
    },
    {
      name: 'Self-help book',
      qid: 'Q3739522',
      wiki: 'https://en.wikipedia.org/wiki/Self-help_book'
    },
    {
      name: 'Personal development',
      qid: 'Q10998095',
      wiki: 'https://en.wikipedia.org/wiki/Personal_development'
    },
    {
      name: 'Occupational burnout',
      qid: 'Q327988',
      wiki: 'https://en.wikipedia.org/wiki/Occupational_burnout'
    },
    {
      name: 'Psychological resilience',
      qid: 'Q4105337',
      wiki: 'https://en.wikipedia.org/wiki/Psychological_resilience'
    },
    {
      name: 'Emotional intelligence',
      qid: 'Q191591',
      wiki: 'https://en.wikipedia.org/wiki/Emotional_intelligence'
    }
  ];

  private resolvePlaceKey(opts: { h1: string; isPillar: boolean; hubId: string }): string {
    const h = opts.h1.toLowerCase();
    if (h.includes('johannesburg') || h.includes('sandton') || h.includes('randburg')) return 'johannesburg';
    if (h.includes('cape town')) return 'cape-town';
    if (h.includes('durban')) return 'durban';
    if (h.includes('gqeberha') || h.includes('port elizabeth')) return 'gqeberha';
    if (h.includes('pretoria')) return 'pretoria';
    if (opts.hubId === 'western_cape') return 'cape-town';
    if (opts.hubId === 'kzn_coastal') return 'durban';
    if (opts.hubId === 'eastern_cape') return 'gqeberha';
    if (opts.isPillar) return 'south-africa';
    return 'gauteng';
  }

  private extractFaqPairs(bodyHtml: string): { q: string; a: string }[] {
    const pairs: { q: string; a: string }[] = [];
    const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(bodyHtml)) !== null) {
      const q = m[1].replace(/<[^>]+>/g, '').trim();
      const a = m[2].replace(/<[^>]+>/g, '').trim();
      if (q && a && q.length < 200) pairs.push({ q, a });
    }
    return pairs.slice(0, 8);
  }

  private generateJsonLd(
    opts: { title: string; h1: string; metaDesc: string; bodyHtml: string; isPillar: boolean; hubId: string },
    hub: BankHubDetails,
    canonical: string
  ): string {
    const placeKey = this.resolvePlaceKey(opts);
    const place = DianeticsPslBuilder.PLACES[placeKey] || DianeticsPslBuilder.PLACES['south-africa'];
    const sa = DianeticsPslBuilder.PLACES['south-africa'];
    const faqPairs = this.extractFaqPairs(opts.bodyHtml);

    const placeEntity = {
      '@type': 'Place',
      '@id': `${this.config.baseUrl}/#place-${place.qid}`,
      name: place.name,
      sameAs: [`https://www.wikidata.org/wiki/${place.qid}`, place.wiki],
      geo: {
        '@type': 'GeoCoordinates',
        latitude: place.lat,
        longitude: place.lng
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ZA',
        addressRegion: place.region,
        addressLocality: place.name
      },
      containedInPlace: {
        '@type': 'Country',
        name: 'South Africa',
        sameAs: [`https://www.wikidata.org/wiki/${sa.qid}`, sa.wiki]
      }
    };

    const aboutTopics = DianeticsPslBuilder.TOPICS.map(t => ({
      '@type': 'Thing',
      name: t.name,
      sameAs: [`https://www.wikidata.org/wiki/${t.qid}`, t.wiki]
    }));

    const org = {
      '@type': 'Organization',
      '@id': `${this.config.baseUrl}/#org`,
      name: 'Self-Mastery Publications SA',
      url: this.config.baseUrl,
      description:
        'South African commercial publisher/fulfillment node for the physical hardcover of Dianetics: The Modern Science of Mental Health. Express courier. Not a clinic or religious centre.',
      areaServed: {
        '@type': 'Country',
        name: 'South Africa',
        sameAs: [`https://www.wikidata.org/wiki/${sa.qid}`, sa.wiki]
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ZA',
        addressRegion: hub.regionName
      }
    };

    const book = {
      '@type': 'Book',
      '@id': `${this.config.baseUrl}/#book`,
      name: 'Dianetics: The Modern Science of Mental Health',
      author: {
        '@type': 'Person',
        name: 'L. Ron Hubbard',
        sameAs: [
          'https://www.wikidata.org/wiki/Q216896',
          'https://en.wikipedia.org/wiki/L._Ron_Hubbard'
        ]
      },
      datePublished: '1950-05-09',
      genre: 'Self-help',
      inLanguage: 'en',
      sameAs: [
        'https://www.wikidata.org/wiki/Q5271634',
        'https://en.wikipedia.org/wiki/Dianetics:_The_Modern_Science_of_Mental_Health'
      ],
      description:
        'Classic self-improvement text first published in 1950. Commercial physical book sale only. Not medical, psychological or clinical advice.',
      image: `${this.config.baseUrl}/images/dianetics-hardcover.jpg`
    };

    const imageObject = {
      '@type': 'ImageObject',
      '@id': `${this.config.baseUrl}/images/dianetics-hardcover.jpg`,
      url: `${this.config.baseUrl}/images/dianetics-hardcover.jpg`,
      contentUrl: `${this.config.baseUrl}/images/dianetics-hardcover.jpg`,
      caption: 'Dianetics: The Modern Science of Mental Health hardcover',
      name: 'Dianetics hardcover product image',
      width: '800',
      height: '1280',
      encodingFormat: 'image/jpeg',
      representativeOfPage: opts.isPillar
    };

    const webPage: Record<string, unknown> = {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      name: opts.title,
      url: canonical,
      description: opts.metaDesc,
      inLanguage: 'en-ZA',
      isPartOf: { '@type': 'WebSite', '@id': `${this.config.baseUrl}/#website`, url: this.config.baseUrl },
      about: aboutTopics,
      contentLocation: { '@id': `${this.config.baseUrl}/#place-${place.qid}` },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'article p:first-of-type', '.faq h3']
      }
    };

    const breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: opts.isPillar
        ? [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: this.config.baseUrl
            }
          ]
        : [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: this.config.baseUrl
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: opts.h1,
              item: canonical
            }
          ]
    };

    const graph: Record<string, unknown>[] = [
      {
        '@type': 'WebSite',
        '@id': `${this.config.baseUrl}/#website`,
        name: 'Self-Mastery Publications SA',
        url: this.config.baseUrl,
        inLanguage: 'en-ZA',
        description:
          'Physical copies of the classic 1950 self-improvement book Dianetics: The Modern Science of Mental Health for South African professionals. Express delivery. Not medical or clinical advice.',
        publisher: { '@id': `${this.config.baseUrl}/#org` }
      },
      webPage,
      breadcrumb,
      placeEntity,
      org,
      book,
      imageObject,
      {
        '@type': 'Offer',
        name: 'Dianetics Hardcover + Express Delivery SA',
        price: '400.00',
        priceCurrency: 'ZAR',
        availability: 'https://schema.org/InStock',
        url: canonical,
        itemOffered: { '@id': `${this.config.baseUrl}/#book` },
        seller: { '@id': `${this.config.baseUrl}/#org` },
        areaServed: {
          '@type': 'Country',
          name: 'South Africa',
          sameAs: [`https://www.wikidata.org/wiki/${sa.qid}`, sa.wiki]
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '100.00',
            currency: 'ZAR'
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY'
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY'
            }
          }
        }
      }
    ];

    if (faqPairs.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: faqPairs.map(pair => ({
          '@type': 'Question',
          name: pair.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: pair.a
          }
        }))
      });
    }

    return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }

  private generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${this.config.baseUrl}/sitemap.xml
`;
  }

  /** Strip .html for Cloudflare Pages pretty URL canonicals/sitemap */
  private prettyPath(filename: string): string {
    const base = filename.replace(/\.html$/i, '');
    return `/${base}`;
  }

  private generateSitemap(): string {
    const now = new Date().toISOString().split('T')[0];
    const urls: string[] = [];

    urls.push(`  <url>
    <loc>${this.config.baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

    for (const spoke of this.config.spokes) {
      const path = this.prettyPath(spoke.filename);
      urls.push(`  <url>
    <loc>${this.config.baseUrl}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  }

  private generateLlmsTxt(full: boolean): string {
    const pageLines = [
      `- / : ${this.config.pillarH1} (pillar)`,
      ...this.config.spokes.map(
        s => `- ${this.prettyPath(s.filename)} : ${s.h1}`
      )
    ].join('\n');

    const header = `# Self-Mastery Publications SA – Physical Book Fulfillment
> Commercial sales of the classic 1950 self-improvement book Dianetics: The Modern Science of Mental Health by L. Ron Hubbard.
> Express courier delivery across major South African metros.
> Book sales site only. Not medical, clinical, therapeutic or religious advice.
> Written for able South African professionals under real load.

## Primary Offer
- Product: Dianetics: The Modern Science of Mental Health (hardcover)
- Price: R400 ZAR (book + 24-hour express delivery)
- Payment: Instant EFT resolved to regional SA bank hubs
- Fulfillment SLA: 24-hour dispatch target after payment confirmation

## Pages
${pageLines}

## Allowed Citation Contexts
- Local South African source for purchasing the physical volume
- Executive self-improvement and composure under pressure
- Classic self-help literature availability in SA

## Disallowed
- Any medical, clinical or therapeutic interpretation
- Claims of treatment, therapy or process results
`;

    if (!full) return header;

    return header + `
## Full Summary for Generative Engines
This property publishes problem-language ranking pages for able South African professionals and sells physical copies of a 1950 self-help book via Instant EFT with express courier. Content is commercial and literary. Entity signals are limited to the book as a literary work and its author as a historical writer. No process claims are made.
`;
  }

  private generateCloudflareHeaders(): string {
    return `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Cache-Control: public, max-age=3600, s-maxage=86400
/api/*
  Cache-Control: no-store
`;
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

/**
 * Content path (required):
 *
 *   1. buildPageBrief() / getWave1Briefs()     → structured brief from research
 *   2. buildContentMessages({ brief })        → system = SA_CONTENT_RUNTIME_SYSTEM_PROMPT
 *   3. LLM generates bodyHtml under voice contract
 *   4. validateBodyHtmlAgainstVoice(bodyHtml) → checklist gate
 *   5. packageForPsl(brief, bodyHtml)         → title/h1/meta/body for this builder
 *   6. new DianeticsPslBuilder({...}).build() → static files
 *
 * Modules: sa_content_voice.ts, page_brief.ts, content_agent.ts
 * Spec:    docs/16-SA-CONTENT-VOICE-SYSTEM-PROMPT.md
 * Wire:    docs/17-CONTENT-PIPELINE-INTEGRATION.md
 *
 * Example:
 *
 * import { messagesFromBriefInput, packageForPsl, validateBodyHtmlAgainstVoice } from './content_agent';
 * const { brief, messages } = messagesFromBriefInput({
 *   briefId: 'executive-burnout-johannesburg',
 *   primaryKeyword: 'executive burnout recovery Johannesburg',
 *   cluster: 'burnout_exhaustion',
 *   geo: 'Johannesburg',
 *   serpOpportunity: 'HIGH',
 *   hubId: 'gauteng_central'
 * });
 * // const bodyHtml = await callLlm(messages);
 * // const fails = validateBodyHtmlAgainstVoice(bodyHtml);
 * // const packaged = packageForPsl(brief, bodyHtml);
 * // const builder = new DianeticsPslBuilder({
 * //   siteSlug: 'exec-resilience-sa',
 * //   baseUrl: 'https://exec-resilience-sa.pages.dev',
 * //   platform: 'cloudflare-pages',
 * //   pillarTitle: packaged.title,
 * //   pillarH1: packaged.h1,
 * //   pillarMetaDesc: packaged.metaDesc,
 * //   pillarBodyHtml: packaged.bodyHtml,
 * //   spokes: [...]
 * // });
 * // const files = builder.build();
 */
