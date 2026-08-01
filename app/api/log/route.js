import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.ip || '127.0.0.1');

    const logEntry = {
      roblox_username: body.roblox_username || body.username || 'Unknown_Player',
      roblox_id: String(body.roblox_id || body.userId || '0'),
      discord_user: body.discord_user || body.discord || 'Chưa liên kết',
      executor: body.executor || 'Unknown Executor',
      script_slug: body.script_slug || 'main',
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    };

    await supabase.from('execution_logs').insert([logEntry]);

    return NextResponse.json({ success: true, ip: ipAddress });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}