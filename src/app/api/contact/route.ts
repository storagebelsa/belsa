import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';

interface RateRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting to prevent email spam / flooding
const rateLimitMap = new Map<string, RateRecord>();

// Helper to strip HTML tags and prevent injection in emails / sheets
function sanitize(input: any): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + 10 * 60 * 1000 };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + 10 * 60 * 1000;
    }

    if (record.count >= 5) {
      const waitMinutes = Math.ceil((record.resetAt - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak pengiriman pesan dari perangkat Anda. Silakan tunggu ${waitMinutes} menit sebelum mengirim lagi.`
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawName = sanitize(body.name);
    const rawCompany = sanitize(body.company);
    const rawPhone = sanitize(body.phone);
    const rawEmail = String(body.email || '').trim().toLowerCase();
    const rawMessage = sanitize(body.message);
    const rawTopic = sanitize(body.topicLabel || body.topic || 'Umum');

    if (!rawName || !rawEmail || !rawMessage) {
      return NextResponse.json(
        { success: false, message: 'Nama, Email, dan Pesan wajib diisi.' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail) || rawEmail.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    // Record submission count for rate limiting
    record.count += 1;
    rateLimitMap.set(ip, record);

    // Forward to Google Apps Script
    const payload = {
      action: 'submit_contact',
      name: rawName.slice(0, 100),
      company: (rawCompany || '-').slice(0, 100),
      phone: (rawPhone || '-').slice(0, 30),
      email: rawEmail,
      message: rawMessage.slice(0, 2000),
      topic: (rawTopic || 'Umum').slice(0, 100),
      recipientEmail: 'samsul@nabelsakha.com',
      sourceUrl: 'https://belsa.id/contact-us',
      timestamp: new Date().toISOString()
    };

    try {
      const gasRes = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const gasJson = await gasRes.json().catch(() => null);

      if (gasJson && gasJson.status === 'error') {
        console.warn('Google Script submit_contact returned error:', gasJson.message);
      }
    } catch (gasErr) {
      console.warn('Google Script contact sync error:', gasErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Permintaan penawaran teknis Anda berhasil dikirim ke tim engineering BELSA.'
    });
  } catch (err: any) {
    console.error('Contact submit error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
