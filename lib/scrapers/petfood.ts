import * as cheerio from 'cheerio';
import type { ScrapedItem } from './zoomart';

const BASE = 'https://www.petfood.ge';
const CATEGORY = `${BASE}/product-category/%E1%83%AB%E1%83%90%E1%83%A6%E1%83%9A%E1%83%98/`;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ka,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

async function scrapePage(url: string): Promise<ScrapedItem[]> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const items: ScrapedItem[] = [];

  // WooCommerce product cards
  $('.product, .type-product').each((_, el) => {
    const link = $(el).find('a').first();
    const productUrl = link.attr('href') || '';
    if (!productUrl || !productUrl.includes('petfood.ge')) return;

    const name =
      $(el).find('.wd-entities-title, .product-title, h3, h2').first().text().trim() ||
      link.attr('title')?.trim() ||
      '';
    if (!name) return;

    const priceText =
      $(el).find('.woocommerce-Price-amount, .price').first().text().trim();
    const priceMatch = priceText.match(/(\d+[\.,]\d+|\d+)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;

    const image =
      $(el).find('img').first().attr('src') ||
      $(el).find('img').first().attr('data-src') ||
      '';

    const weightMatch = name.match(/(\d+[\.,]?\d*)\s*(კგ|გრ|kg|g)\b/i);
    const weight = weightMatch ? `${weightMatch[1]} ${weightMatch[2]}` : '';

    items.push({
      name,
      price,
      currency: 'GEL',
      image,
      url: productUrl,
      store: 'PetFood',
      storeUrl: BASE,
      category: 'dog-food',
      weight,
      brand: name.split(' ')[0],
    });
  });

  return items;
}

export async function scrapePetFood(pages = 3): Promise<ScrapedItem[]> {
  const all: ScrapedItem[] = [];
  const seen = new Set<string>();

  for (let p = 1; p <= pages; p++) {
    const url = p === 1 ? CATEGORY : `${CATEGORY}page/${p}/`;
    const items = await scrapePage(url);
    for (const item of items) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        all.push(item);
      }
    }
    if (p < pages) await new Promise(r => setTimeout(r, 500));
  }

  return all;
}
