import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, message: 'Password is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();
    
    if (error || !data?.value) {
      return NextResponse.json({ success: false, message: 'Admin authentication is misconfigured' }, { status: 500 });
    }

    const correctPassword = data.value;

    // Chống Timing Attack
    if (safeCompare(password, correctPassword)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Incorrect Password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
