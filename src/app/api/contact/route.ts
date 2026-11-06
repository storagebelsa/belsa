import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, phone, email, message, topic, topicLabel } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Nama, Email, dan Pesan wajib diisi.' },
        { status: 400 }
      );
    }

    // Forward to Google Apps Script
    const payload = {
      action: 'submit_contact',
      name: String(name).trim(),
      company: String(company || '-').trim(),
      phone: String(phone || '-').trim(),
      email: String(email).trim(),
      message: String(message).trim(),
      topic: String(topicLabel || topic || 'Umum').trim(),
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
