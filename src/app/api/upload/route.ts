import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GOOGLE_SCRIPT_URL, GOOGLE_DRIVE_FOLDER_ID, GOOGLE_DRIVE_ARTICLES_FOLDER_ID } from '@/lib/googleSheetsConfig';
import { isAuthorizedAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Autentikasi Admin diperlukan untuk mengunggah file.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { image, fileName, folder = 'catalogue', folderId } = body;

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

    const ALLOWED_EXTS = ['webp', 'png', 'jpg'];
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { success: false, message: 'Format gambar tidak diizinkan. Hanya WebP, PNG, dan JPG yang diperbolehkan.' },
        { status: 400 }
      );
    }

    const base64Data = matches[2];
    if (base64Data.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file melebihi batas maksimum 10MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, 'base64');

    const cleanPrefix = (fileName || 'prod')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
    const uniqueName = `${cleanPrefix}_${Date.now()}.${ext}`;

    // 1. Try local filesystem write (works in localhost/dev, safely caught in serverless read-only)
    let publicUrl = '';
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(filePath, buffer);
      publicUrl = `/uploads/${folder}/${uniqueName}`;
    } catch (fsErr) {
      console.warn('Local file write skipped (serverless read-only filesystem):', fsErr);
    }

    let driveUrl = '';
    let storageType = publicUrl ? 'local' : 'google_drive';

    // 2. Upload to Google Drive via Google Apps Script (Auto-Sync)
    const targetFolderId = folderId || (folder === 'articles' ? GOOGLE_DRIVE_ARTICLES_FOLDER_ID : GOOGLE_DRIVE_FOLDER_ID);

    try {
      let gasResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'upload_to_drive',
          folderId: targetFolderId,
          fileName: uniqueName,
          imageBase64: base64Data,
          mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        })
      });

      let gasJson: any = null;
      try {
        gasJson = await gasResponse.json();
      } catch {
        gasJson = null;
      }

      if (gasJson && (gasJson.url || gasJson.imageUrl)) {
        driveUrl = gasJson.url || gasJson.imageUrl;
        storageType = 'google_drive';
      } else if (gasJson && gasJson.status === 'error') {
        console.error('Google Drive folder upload error:', gasJson.message);
        return NextResponse.json({
          success: false,
          message: `Akses folder Google Drive ditolak (${gasJson.message}). Pastikan folder '${folder === 'articles' ? 'Gambar_Artikel' : 'Gambar_Produk'}' (${targetFolderId}) telah dibagikan dengan akses 'Editor' ke akun nabel.sakha.gemilang@gmail.com.`
        }, { status: 403 });
      }
    } catch (gasErr) {
      console.warn('Error uploading to Google Drive via Apps Script:', gasErr);
    }

    // Return the permanent Google Drive URL, localUrl, or fallback
    const finalUrl = driveUrl || publicUrl || image;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      imageUrl: finalUrl,
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
