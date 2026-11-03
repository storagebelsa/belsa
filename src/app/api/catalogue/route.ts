import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BELSA_CATALOGUE_FULL, BelsaProductSeries } from '@/data/belsaCatalogueFull';

interface CatalogueOverrides {
  deletedIds: string[];
  customItems: BelsaProductSeries[];
  modifiedItems: Record<string, BelsaProductSeries>;
}

const OVERRIDES_FILE = path.join(process.cwd(), 'src', 'data', 'catalogueOverrides.json');

function getOverrides(): CatalogueOverrides {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const content = fs.readFileSync(OVERRIDES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
        customItems: Array.isArray(parsed.customItems) ? parsed.customItems : [],
        modifiedItems: parsed.modifiedItems && typeof parsed.modifiedItems === 'object' ? parsed.modifiedItems : {}
      };
    }
  } catch (err) {
    console.error('Error reading catalogueOverrides.json:', err);
  }
  return { deletedIds: [], customItems: [], modifiedItems: {} };
}

function saveOverrides(data: CatalogueOverrides) {
  try {
    const dir = path.dirname(OVERRIDES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing catalogueOverrides.json:', err);
    throw err;
  }
}

// GET /api/catalogue - Returns all active products
export async function GET() {
  try {
    const overrides = getOverrides();
    const deletedSet = new Set(overrides.deletedIds);

    // 1. Process master products (filter deleted, apply modifications)
    const masterProcessed: BelsaProductSeries[] = [];
    for (const item of BELSA_CATALOGUE_FULL) {
      if (deletedSet.has(item.id)) continue;
      if (overrides.modifiedItems[item.id]) {
        masterProcessed.push(overrides.modifiedItems[item.id]);
      } else {
        masterProcessed.push(item);
      }
    }

    // 2. Process custom products
    const customProcessed: BelsaProductSeries[] = [];
    for (const item of overrides.customItems) {
      if (deletedSet.has(item.id)) continue;
      if (overrides.modifiedItems[item.id]) {
        customProcessed.push(overrides.modifiedItems[item.id]);
      } else {
        customProcessed.push(item);
      }
    }

    const allProducts = [...masterProcessed, ...customProcessed];
    allProducts.sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));

    return NextResponse.json({
      success: true,
      count: allProducts.length,
      data: allProducts
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memuat katalog' },
      { status: 500 }
    );
  }
}

// POST /api/catalogue - Handles Create, Update, Delete, and Reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, product, id } = body;
    const overrides = getOverrides();

    if (action === 'create') {
      if (!product || !product.series || !product.code) {
        return NextResponse.json({ success: false, message: 'Data produk tidak lengkap' }, { status: 400 });
      }
      
      const newProduct: BelsaProductSeries = {
        ...product,
        id: product.id || `custom_${product.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`
      };

      // Remove from deletedIds if present
      overrides.deletedIds = overrides.deletedIds.filter(dId => dId !== newProduct.id);
      // Add to customItems
      overrides.customItems.push(newProduct);

      saveOverrides(overrides);
      return NextResponse.json({ success: true, message: `Seri ${newProduct.series} berhasil ditambahkan ke katalog!`, data: newProduct });
    }

    if (action === 'update') {
      if (!product || !product.id) {
        return NextResponse.json({ success: false, message: 'ID produk diperlukan untuk update' }, { status: 400 });
      }

      // Check if product is in customItems
      const customIdx = overrides.customItems.findIndex(item => item.id === product.id);
      if (customIdx !== -1) {
        overrides.customItems[customIdx] = product;
      } else {
        // It's a master catalogue product or modification override
        overrides.modifiedItems[product.id] = product;
      }

      // Ensure it is not in deletedIds
      overrides.deletedIds = overrides.deletedIds.filter(dId => dId !== product.id);

      saveOverrides(overrides);
      return NextResponse.json({ success: true, message: `Perubahan pada seri ${product.series} berhasil disimpan!`, data: product });
    }

    if (action === 'delete') {
      const targetId = id || (product && product.id);
      if (!targetId) {
        return NextResponse.json({ success: false, message: 'ID produk diperlukan untuk penghapusan' }, { status: 400 });
      }

      // Remove from customItems if present
      overrides.customItems = overrides.customItems.filter(item => item.id !== targetId);
      // Remove from modifiedItems if present
      delete overrides.modifiedItems[targetId];
      // Add to deletedIds if not already there
      if (!overrides.deletedIds.includes(targetId)) {
        overrides.deletedIds.push(targetId);
      }

      saveOverrides(overrides);
      return NextResponse.json({ success: true, message: `Produk berhasil dihapus dari katalog!` });
    }

    if (action === 'reset') {
      if (id) {
        // Reset single product to original master baseline
        overrides.deletedIds = overrides.deletedIds.filter(dId => dId !== id);
        delete overrides.modifiedItems[id];
        saveOverrides(overrides);
        return NextResponse.json({ success: true, message: `Produk berhasil dipulihkan ke versi master katalog!` });
      } else {
        // Full reset
        saveOverrides({ deletedIds: [], customItems: [], modifiedItems: {} });
        return NextResponse.json({ success: true, message: `Seluruh katalog berhasil di-reset ke baseline resmi pabrik!` });
      }
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenal' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memproses aksi katalog' },
      { status: 500 }
    );
  }
}
