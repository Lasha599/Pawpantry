import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { ScrapedProduct } from '@/lib/models/ScrapedProduct';
import { scrapeZooMart } from '@/lib/scrapers/zoomart';
import { scrapePetFood } from '@/lib/scrapers/petfood';

export const maxDuration = 60;

// Protect with a secret — accepts header OR query param
function isAuthorized(req: NextRequest): boolean {
  const header = req.headers.get('x-scrape-secret');
  const query = new URL(req.url).searchParams.get('secret');
  return header === process.env.SCRAPE_SECRET || query === process.env.SCRAPE_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const results = { zoomart: 0, petfood: 0, errors: [] as string[] };

  // Scrape ZooMart
  try {
    const items = await scrapeZooMart(5);
    for (const item of items) {
      await ScrapedProduct.findOneAndUpdate(
        { url: item.url },
        { ...item, scrapedAt: new Date() },
        { upsert: true },
      );
    }
    results.zoomart = items.length;
  } catch (e: unknown) {
    results.errors.push(`ZooMart: ${e instanceof Error ? e.message : 'error'}`);
  }

  // Scrape PetFood
  try {
    const items = await scrapePetFood(3);
    for (const item of items) {
      await ScrapedProduct.findOneAndUpdate(
        { url: item.url },
        { ...item, scrapedAt: new Date() },
        { upsert: true },
      );
    }
    results.petfood = items.length;
  } catch (e: unknown) {
    results.errors.push(`PetFood: ${e instanceof Error ? e.message : 'error'}`);
  }

  return NextResponse.json({ ok: true, ...results });
}

// Called by Vercel cron
export async function GET(req: NextRequest) {
  return POST(req);
}
