import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function sanitize(input, maxLen = 100) {
  if (typeof input !== 'string') return 'Unknown';
  return input.trim().slice(0, maxLen);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const ipAddress = request.headers.get('x-real-ip') || 
                      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      '127.0.0.1';

    // Sanitize input để chống DB Bloat attack
    const logEntry = {
      roblox_username: sanitize(body.roblox_username || body.username, 50),
      roblox_id: sanitize(String(body.roblox_id || body.userId), 20),
      discord_user: sanitize(body.discord_user || body.discord, 50),
      executor: sanitize(body.executor, 50),
      script_slug: sanitize(body.script_slug, 30),
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    };

    await supabaseAdmin.from('execution_logs').insert([logEntry]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
