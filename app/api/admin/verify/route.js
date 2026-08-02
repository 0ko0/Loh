import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body || !body.password) {
      return NextResponse.json({ success: false, message: 'Mật khẩu không được để trống!' }, { status: 400 });
    }

    // Dùng select() dạng Array thay vì .single() để tránh crash 500 khi thiếu/trùng data
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password');

    if (error) {
      console.error('[Verify Supabase Error]:', error);
      return NextResponse.json({ success: false, message: `Lỗi DB: ${error.message}` }, { status: 500 });
    }

    // Nếu chưa có row admin_password trong DB thì mặc định dùng admin123
    const correctPassword = (data && data.length > 0) ? data[0].value : 'admin123';

    if (body.password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Sai mật khẩu Admin!' }, { status: 401 });
    }
  } catch (error) {
    console.error('[Verify API Crash]:', error);
    return NextResponse.json({ success: false, message: error.message || 'Lỗi Server nội bộ' }, { status: 500 });
  }
}
