import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import { UserState } from '@/lib/models/UserState';

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const doc = await UserState.findOne({ userId });
    return NextResponse.json({
      dogs:          doc?.dogs          ?? [],
      subscriptions: doc?.subscriptions ?? [],
      history:       doc?.history       ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dogs, subscriptions, history } = await req.json();
    await connectDB();
    await UserState.findOneAndUpdate(
      { userId },
      { dogs, subscriptions, history, updatedAt: new Date() },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
