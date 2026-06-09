import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { UserState } from '@/lib/models/UserState';

export async function GET() {
  try {
    await connectDB();
    const all = await UserState.find({});
    return NextResponse.json({ ok: true, count: all.length, records: all });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
