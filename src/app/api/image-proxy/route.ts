import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'drive.google.com',
  'belsa.id',
  'www.belsa.id'
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const noCacheHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'CDN-Cache-Control': 'no-store',
    'Netlify-CDN-Cache-Control': 'no-store',
    'Netlify-Vary': 'query',
  };

  try {
    // 1. Safe handling for local public asset paths (/images/... or /uploads/...)
    let localRelPath = '';
    if (imageUrl.startsWith('/images/') || imageUrl.startsWith('/uploads/')) {
      localRelPath = imageUrl.split('?')[0];
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const parsed = new URL(imageUrl);
        if (parsed.pathname.startsWith('/images/') || parsed.pathname.startsWith('/uploads/')) {
          const reqHost = req.headers.get('host') || '';
          if (parsed.host === reqHost || parsed.hostname === 'belsa.id' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            localRelPath = parsed.pathname;
          }
        }
      } catch {
        // ignore parse error
      }
    }

    if (localRelPath) {
      const safePath = path.normalize(localRelPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullLocalPath = path.join(process.cwd(), 'public', safePath);
      
      // Ensure the resolved path remains inside public directory
      const publicRoot = path.join(process.cwd(), 'public');
      if (fullLocalPath.startsWith(publicRoot) && fs.existsSync(fullLocalPath)) {
        const fileBuffer = fs.readFileSync(fullLocalPath);
        const ext = path.extname(fullLocalPath).toLowerCase();
        const mimeMap: Record<string, string> = {
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml',
        };
        const contentType = mimeMap[ext] || 'image/png';
        const base64 = fileBuffer.toString('base64');
        const dataUri = `data:${contentType};base64,${base64}`;
        return NextResponse.json({ dataUri, contentType }, { headers: noCacheHeaders });
      }
    }

    // 2. Strict validation for remote URLs to prevent Server-Side Request Forgery (SSRF)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: 'URL gambar tidak valid' }, { status: 400, headers: noCacheHeaders });
    }

    // Enforce HTTPS only
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Hanya protokol HTTPS yang diizinkan untuk keamanan' },
        { status: 403, headers: noCacheHeaders }
      );
    }

    // Validate hostname strictly against allowlist
    const hostname = parsedUrl.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.has(hostname) && !hostname.endsWith('.googleusercontent.com')) {
      return NextResponse.json(
        { error: `Domain '${hostname}' tidak diizinkan untuk image proxy.` },
        { status: 403, headers: noCacheHeaders }
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BELSA Image Proxy',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil gambar: ${response.statusText}` },
        { status: response.status, headers: noCacheHeaders }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    return NextResponse.json(
      { dataUri, contentType },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error proxying image' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
