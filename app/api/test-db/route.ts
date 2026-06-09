import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { ScrapedProduct } from '@/lib/models/ScrapedProduct';

export async function GET() {
  try {
    await connectDB();
    const count = await ScrapedProduct.countDocuments();
    const sample = await ScrapedProduct.find().limit(2).lean();
    return NextResponse.json({ ok: true, scrapedProductCount: count, sample });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
