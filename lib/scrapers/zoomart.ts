import * as cheerio from 'cheerio';

const BASE = 'https://zoomart.ge';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ka,en;q=0.9',
};

export type ScrapedItem = {
  name: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  store: string;
  storeUrl: string;
  category: string;
  weight: string;
  brand: string;
};

function extractBarcode(href: string): string | null {
  const slug = href.split('/').pop() || '';
  const segments = slug.split('-');
  // Barcode is the last segment, 8–13 digits (EAN)
  const last = segments[segments.length - 1];
  return /^\d{8,13}$/.test(last) ? last : null;
}

function extractWeight(name: string): string {
  const match = name.match(/(\d+[\.,]?\d*)\s*(კგ|გრ|kg|gr|g)\b/i);
  if (!match) return '';
  const unit = match[2].toLowerCase();
  return `${match[1]} ${unit === 'კგ' || unit === 'kg' ? 'kg' : 'g'}`;
}

function extractBrand(name: string): string {
  // Brand is usually the first word(s) before a space+Georgian+space pattern
  const first = name.split(' ')[0];
  return first || '';
}

async function scrapePage(pageNum: number): Promise<ScrapedItem[]> {
  const url =
    pageNum === 1
      ? `${BASE}/dogs/dzaghli-sakvebi`
      : `${BASE}/dogs/dzaghli-sakvebi?page=${pageNum}`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const items: ScrapedItem[] = [];

  // Each product is an <a> tag pointing to a product detail URL
  $('a[href*="/dogs/dzaghli-sakvebi/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!href.includes('/dogs/dzaghli-sakvebi/')) return;

    const barcode = extractBarcode(href);
    if (!barcode) return;

    const fullUrl = href.startsWith('http') ? href : `${BASE}${href}`;
    const image = `${BASE}/files/products/${barcode}.png`;

    // Name: from link text, img alt, or fallback to URL slug
    const rawName =
      $(el).text().trim() ||
      $(el).find('img').attr('alt')?.trim() ||
      (href.split('/').pop() || '').split('-').slice(0, -1).join(' ');

    if (!rawName || rawName.length < 3) return;

    // Price: search within the product card container
    const card = $(el).closest(
      '.product, .product-item, .product_item, [class*="product"]',
    );
    const priceRaw =
      card.find('[class*="price"], .price, .cost').first().text() ||
      $(el).parent().text();
    const priceMatch = priceRaw.match(/(\d+[\.,]\d+|\d+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;

    items.push({
      name: rawName,
      price,
      currency: 'GEL',
      image,
      url: fullUrl,
      store: 'ZooMart',
      storeUrl: BASE,
      category: 'dog-food',
      weight: extractWeight(rawName),
      brand: extractBrand(rawName),
    });
  });

  return items;
}

export async function scrapeZooMart(pages = 5): Promise<ScrapedItem[]> {
  const all: ScrapedItem[] = [];
  const seen = new Set<string>();

  for (let p = 1; p <= pages; p++) {
    const items = await scrapePage(p);
    for (const item of items) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        all.push(item);
      }
    }
    if (p < pages) await new Promise(r => setTimeout(r, 400));
  }

  return all;
}
