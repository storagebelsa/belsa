import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GOOGLE_SCRIPT_URL, GOOGLE_DRIVE_FOLDER_ID } from '@/lib/googleSheetsConfig';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, fileName, folder = 'catalogue' } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Tidak ada data gambar yang dikirim' },
        { status: 400 }
      );
    }

    // Match data URL prefix: data:image/(webp|jpeg|png|...);base64,...
    const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { success: false, message: 'Format base64 gambar tidak valid' },
        { status: 400 }
      );
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Target directory local fallback: public/uploads/<folder>
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanPrefix = (fileName || 'prod')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
    const uniqueName = `${cleanPrefix}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Save local copy
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${folder}/${uniqueName}`;

    let driveUrl = '';
    let storageType = 'local';

    // 2. Upload to Google Drive via Google Apps Script (Auto-Sync)
    try {
      const gasResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'upload_to_drive',
          folderId: GOOGLE_DRIVE_FOLDER_ID,
          fileName: uniqueName,
          imageBase64: base64Data,
          mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        })
      });

      const gasText = await gasResponse.text();
      try {
        const gasJson = JSON.parse(gasText);
        if (gasJson.url || gasJson.imageUrl) {
          driveUrl = gasJson.url || gasJson.imageUrl;
          storageType = 'google_drive';
        }
      } catch (parseErr) {
        console.warn('Could not parse Google Apps Script upload response:', gasText);
      }
    } catch (gasErr) {
      console.warn('Error uploading to Google Drive via Apps Script:', gasErr);
    }

    // If Google Drive returned a direct CDN link, use it! Otherwise fallback to local publicUrl
    const finalUrl = driveUrl || publicUrl;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      driveUrl: driveUrl || null,
      localUrl: publicUrl,
      storageType,
      fileName: uniqueName,
      sizeBytes: buffer.length
    });
  } catch (err: any) {
    console.error('Error handling upload:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menyimpan gambar' },
      { status: 500 }
    );
  }
}
