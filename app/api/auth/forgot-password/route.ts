import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { connectDB } from '@/lib/mongoose';
import { User } from '@/lib/models/User';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.updateOne(
      { _id: user._id },
      { resetToken: token, resetTokenExpiry: expiry },
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'PawPantry <onboarding@resend.dev>',
      to: user.email,
      subject: 'Reset your PawPantry password',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#F5EFE4;padding:40px 32px;border-radius:16px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px;">
            <span style="font-size:24px;">🐾</span>
            <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#1A1A1A;">PawPantry</span>
          </div>
          <h1 style="font-family:Georgia,serif;font-size:28px;color:#1A1A1A;margin:0 0 12px;">Reset your password</h1>
          <p style="color:#6B6157;font-size:15px;line-height:1.6;margin:0 0 32px;">
            Hi ${user.name}, we received a request to reset your password. Click the button below to choose a new one.
            This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#C84B31;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
            Reset password
          </a>
          <p style="color:#6B6157;font-size:13px;margin-top:32px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
          <hr style="border:none;border-top:1px solid #E8DCC4;margin:32px 0 16px;" />
          <p style="color:#6B6157;font-size:12px;margin:0;">© PawPantry · Never run out of dog food again</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
