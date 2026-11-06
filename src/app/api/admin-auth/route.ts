import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPin } from '@/lib/adminAuth';

interface AttemptRecord {
  fails: number;
  lockedUntil: number;
}

// In-memory brute force tracker per client IP
const attemptStore = new Map<string, AttemptRecord>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';
    const now = Date.now();
    const record = attemptStore.get(ip) || { fails: 0, lockedUntil: 0 };

    if (record.lockedUntil > now) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan PIN salah. Akses dikunci sementara. Silakan tunggu ${waitMinutes} menit lagi.`
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const pin = body?.pin;

    if (!pin || !verifyAdminPin(pin)) {
      record.fails += 1;
      if (record.fails >= 5) {
        record.lockedUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
      }
      attemptStore.set(ip, record);

      const remaining = Math.max(0, 5 - record.fails);
      const remainingMsg = remaining > 0 ? ` (Sisa percobaan: ${remaining})` : ' (Akun terkunci 15 menit)';
      return NextResponse.json(
        { success: false, message: `PIN Admin tidak sesuai${remainingMsg}` },
        { status: 401 }
      );
    }

    // Success: reset failed attempts for this IP
    attemptStore.delete(ip);

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
