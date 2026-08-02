import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin mật khẩu!' }, { status: 400 });
    }

    // 1. Kiểm tra mật khẩu hiện tại bằng Service Role (Bypass RLS an toàn trên Server)
    const { data: passData } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    const correctPassword = passData?.value || 'admin123';

    if (currentPassword !== correctPassword) {
      return NextResponse.json({ success: false, message: 'Mật khẩu hiện tại không đúng!' }, { status: 401 });
    }

    // 2. Cập nhật mật khẩu mới vào Database
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key: 'admin_password', value: newPassword }, { onConflict: 'key' });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
