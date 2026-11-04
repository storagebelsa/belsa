import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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
    let targetUrl = imageUrl;

    // Check if local public asset path (either "/images/..." or full URL on same domain "/images/...")
    let localRelPath = '';
    if (imageUrl.startsWith('/')) {
      localRelPath = imageUrl.split('?')[0];
    } else {
      try {
        const parsed = new URL(imageUrl);
        if (parsed.pathname.startsWith('/images/')) {
          localRelPath = parsed.pathname;
        }
      } catch {
        // ignore URL parse error
      }
    }

    if (localRelPath) {
      const safePath = path.normalize(localRelPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullLocalPath = path.join(process.cwd(), 'public', safePath);
      if (fs.existsSync(fullLocalPath)) {
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

    if (imageUrl.startsWith('/')) {
      const host = req.headers.get('host') || '127.0.0.1:3000';
      const proto = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
      targetUrl = `${proto}://${host}${imageUrl}`;
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
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
