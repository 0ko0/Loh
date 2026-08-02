import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin mật khẩu!' }, { status: 400 });
    }

    // 1. Lấy mật khẩu Admin hiện tại từ DB
    const { data: passData } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .limit(1);

    const correctPassword = (passData && passData.length > 0) ? passData[0].value : 'admin123';

    if (currentPassword !== correctPassword) {
      return NextResponse.json({ success: false, message: 'Mật khẩu hiện tại không đúng!' }, { status: 401 });
    }

    // 2. Cập nhật đè trực tiếp lên tất cả các dòng admin_password
    const { error } = await supabaseAdmin
      .from('settings')
      .update({ value: newPassword })
      .eq('key', 'admin_password');

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
