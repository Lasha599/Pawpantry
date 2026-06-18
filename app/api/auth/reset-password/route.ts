import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongoose';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: user._id },
      { password: hashed, resetToken: null, resetTokenExpiry: null },
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
