import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';

export async function GET() {
  const hasUri = !!process.env.MONGODB_URI;
  const hasJwt = !!process.env.JWT_SECRET;

  if (!hasUri) {
    return NextResponse.json({ error: 'MONGODB_URI is not set in environment variables' }, { status: 500 });
  }

  try {
    await connectDB();
    return NextResponse.json({ ok: true, message: 'MongoDB connected successfully', hasUri, hasJwt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message, hasUri, hasJwt }, { status: 500 });
  }
}
