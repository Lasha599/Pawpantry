import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { ScrapedProduct } from '@/lib/models/ScrapedProduct';

export async function GET() {
  try {
    await connectDB();
    const products = await ScrapedProduct.find({ category: 'dog-food' })
      .sort({ scrapedAt: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
