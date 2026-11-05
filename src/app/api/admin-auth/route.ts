import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const correctPin = process.env.ADMIN_PIN || '241353';

    if (!pin || String(pin).trim() !== String(correctPin).trim()) {
      return NextResponse.json(
        { success: false, message: 'PIN Admin tidak sesuai' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Autentikasi admin berhasil'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memverifikasi PIN' },
      { status: 500 }
    );
  }
}
