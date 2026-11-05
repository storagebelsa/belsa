'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GOOGLE_SCRIPT_URL } from '@/lib/googleSheetsConfig';
import { formatProductImageUrl } from '@/lib/imageUtils';
import { HtoConfig, HtoBlock, HtoColumn, HtoRow } from '@/types/hto';
import {
  BELSA_CATEGORIES,
  BelsaCategory,
  BelsaProductSeries,
  BELSA_CATALOGUE_FULL
} from '@/data/belsaCatalogueFull';
import { DEFAULT_ARTICLES, ArticleItem } from '@/data/articlesData';
import Link from 'next/link';

export default function BelsaAdminPage() {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  // Tab: 'editor' | 'list' | 'articles'
  const [activeTab, setActiveTab] = useState<'editor' | 'list' | 'articles'>('list');

  // Articles Management State
  const [articlesList, setArticlesList] = useState<ArticleItem[]>([]);
  const [articleSearch, setArticleSearch] = useState('');
  const [isArticleFormOpen, setIsArticleFormOpen] = useState(false);
  const [editingArticleSlug, setEditingArticleSlug] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Article Form Fields
  const [artSlug, setArtSlug] = useState('');
  const [artCategory, setArtCategory] = useState('Hydraulic Engineering');
  const [artAuthor, setArtAuthor] = useState('Tim Engineering BELSA');
  const [artDate, setArtDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [artReadTime, setArtReadTime] = useState('5 min baca');
  const [artTitleId, setArtTitleId] = useState('');
  const [artTitleEn, setArtTitleEn] = useState('');
  const [artSummaryId, setArtSummaryId] = useState('');
  const [artSummaryEn, setArtSummaryEn] = useState('');
  const [artContentId, setArtContentId] = useState('');
  const [artContentEn, setArtContentEn] = useState('');
  const [artTags, setArtTags] = useState('Silinder, Hidrolik, Standar');
  const [artImageUrl, setArtImageUrl] = useState('/images/prod_cylinder_clean.webp');
  const [artImagePreview, setArtImagePreview] = useState('/images/prod_cylinder_clean.webp');
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [isCompressingArtImg, setIsCompressingArtImg] = useState(false);

  // Editing state: if non-null, admin is editing an existing product
  const [editingProduct, setEditingProduct] = useState<BelsaProductSeries | null>(null);

  // Form State: Basic Info
  const [series, setSeries] = useState('');
  const [category, setCategory] = useState<BelsaCategory>('Air Cylinder');
  const [name, setName] = useState('');
  const [taglineId, setTaglineId] = useState('');
  const [taglineEn, setTaglineEn] = useState('');
  const [boreSizes, setBoreSizes] = useState('40, 50, 63, 80, 100');
  const [standardStrokes, setStandardStrokes] = useState('25, 50, 75, 100, 150, 200, 250, 300, 500');
  const [maxStroke, setMaxStroke] = useState('2000');
  const [mountings, setMountings] = useState('B, LB, FA, FB, CA, CB, TC');
  const [hasDoubleRod, setHasDoubleRod] = useState(true);

  // Form State: Specs
  const [fluid, setFluid] = useState('Udara Bertekanan (Air)');
  const [proofPressure, setProofPressure] = useState('1.5 MPa (15 kgf/cm²)');
  const [maxPressure, setMaxPressure] = useState('0.99 MPa (9.9 kgf/cm²)');
  const [tempRange, setTempRange] = useState('5°C ~ 60°C');
  const [speedRange, setSpeedRange] = useState('50 ~ 600 mm/sec');
  const [cushion, setCushion] = useState('Air Cushion kedua sisi');

  // Form State: Dynamic HTO Builder
  const [htoTotalSlots, setHtoTotalSlots] = useState<number>(8);
  const [htoSlotDelimiters, setHtoSlotDelimiters] = useState<Record<number, string>>({});
  const [htoBlocks, setHtoBlocks] = useState<HtoBlock[]>([
    {
      id: 'block_1',
      title: '① Tipe Dudukan / Mounting Style',
      slotIndex: 2,
      displayType: 'table',
      columns: [
        { id: 'col_desc', label: 'Keterangan Dudukan' }
      ],
      rows: [
        { id: 'r1', code: 'B', label: 'Standard (Dasar)', values: { col_desc: 'Standard (Dasar)' } },
        { id: 'r2', code: 'LB', label: 'Foot Mounting (Kaki)', values: { col_desc: 'Foot Mounting (Kaki)' } },
        { id: 'r3', code: 'FA', label: 'Front Flange (Rod Side)', values: { col_desc: 'Front Flange (Rod Side)' } },
        { id: 'r4', code: 'FB', label: 'Rear Flange (Head Side)', values: { col_desc: 'Rear Flange (Head Side)' } },
        { id: 'r5', code: 'CA', label: 'Single Clevis', values: { col_desc: 'Single Clevis' } },
        { id: 'r6', code: 'CB', label: 'Double Clevis', values: { col_desc: 'Double Clevis' } }
      ]
    },
    {
      id: 'block_2',
      title: '② Ukuran Tabung (Bore Ø mm)',
      slotIndex: 3,
      displayType: 'chips',
      chipValues: ['40', '50', '63', '80', '100'],
      rows: []
    },
    {
      id: 'block_3',
      title: '③ Panjang Langkah (Stroke mm)',
      slotIndex: 4,
      displayType: 'stroke_matrix',
      standardStrokes: [25, 50, 75, 100, 150, 200, 250, 300, 500],
      maxStroke: 2000,
      rows: []
    }
  ]);

  // Image upload & Auto-compression
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
    savedPercent: number;
    format: string;
    dimensions: string;
  } | null>(null);

  // Status & Modal Popup
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    productSeries?: string;
  } | null>(null);

  // Live Catalog Data List
  const [allCatalogueProducts, setAllCatalogueProducts] = useState<BelsaProductSeries[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [listCategoryFilter, setListCategoryFilter] = useState('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('belsa_admin_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPinError('');
        sessionStorage.setItem('belsa_admin_auth', 'true');
      } else {
        setPinError(data.message || 'PIN salah. Masukkan PIN admin BELSA.');
      }
    } catch {
      setPinError('Gagal memverifikasi PIN. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('belsa_admin_auth');
    setPinInput('');
  };

  // Fetch all active products from /api/catalogue
  const fetchCatalogueData = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/catalogue');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllCatalogueProducts(json.data);
      } else {
        setAllCatalogueProducts(BELSA_CATALOGUE_FULL);
      }
    } catch (err) {
      console.error('Error fetching catalogue data:', err);
      setAllCatalogueProducts(BELSA_CATALOGUE_FULL);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Fetch all active articles from /api/articles
  const fetchArticlesData = async () => {
    try {
      const res = await fetch('/api/articles');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setArticlesList(json.data);
      } else {
        setArticlesList(DEFAULT_ARTICLES);
      }
    } catch {
      setArticlesList(DEFAULT_ARTICLES);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCatalogueData();
      fetchArticlesData();
    }
  }, [isAuthenticated]);

  // Filtered products in Tab List - sorted A-Z
  const filteredProducts = useMemo(() => {
    return allCatalogueProducts
      .filter((p) => {
        const matchCat = listCategoryFilter === 'ALL' || p.category === listCategoryFilter;
        const q = listSearch.toLowerCase().trim();
        const matchSearch =
          !q ||
          p.series.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.subTitle.id.toLowerCase().includes(q) ||
          p.subTitle.en.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        return matchCat && matchSearch;
      })
      .sort((a, b) => a.series.localeCompare(b.series, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allCatalogueProducts, listCategoryFilter, listSearch]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WebP, GIF, dan sejenisnya).');
      return;
    }

    setIsCompressing(true);
    setCompressionStats(null);
    setImageFile(file);

    try {
      const origSize = file.size;
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        // Maximum dimension 1200px (crystal sharp for catalog products, yet very compact)
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsCompressing(false);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Auto convert to WebP format (0.82 quality)
        let compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
        let format = 'WebP';

        // Fallback to JPEG if WebP encoding is not supported
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          format = 'JPEG';
        }

        // Calculate approximate size in bytes from base64
        const head = compressedDataUrl.indexOf(',') + 1;
        const compBytes = Math.round(((compressedDataUrl.length - head) * 3) / 4);
        const savedPercent = Math.max(0, Math.round((1 - compBytes / origSize) * 100));

        setCompressionStats({
          originalSize: formatFileSize(origSize),
          compressedSize: formatFileSize(compBytes),
          savedPercent,
          format,
          dimensions: `${width} × ${height} px`
        });

        // Show instant preview
        setImagePreview(compressedDataUrl);
        setImageBase64(compressedDataUrl);

        // Auto upload to /api/upload to save physical file in public/uploads/catalogue/
        const prefix = (series || file.name.replace(/\.[^/.]+$/, '') || 'prod')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_');

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: compressedDataUrl,
              fileName: prefix,
              folder: 'catalogue'
            })
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            setFallbackImageUrl(uploadData.url);
            // Tetap gunakan compressedDataUrl untuk preview lokal agar 100% mulus & tidak terganggu koneksi eksternal
          }
        } catch (upErr) {
          console.warn('Auto upload error, falling back to data URL:', upErr);
        } finally {
          setIsCompressing(false);
        }
      };

      img.onerror = () => {
        alert('Gagal memproses gambar. Pastikan file valid.');
        setIsCompressing(false);
      };

      img.src = objectUrl;
    } catch (err) {
      console.error('Compression error:', err);
      setIsCompressing(false);
    }
  };

  // Reset form to clean Add mode
  const handleResetForm = () => {
    setEditingProduct(null);
    setSeries('');
    setCategory('Air Cylinder');
    setName('');
    setTaglineId('');
    setTaglineEn('');
    setBoreSizes('40, 50, 63, 80, 100');
    setStandardStrokes('25, 50, 75, 100, 150, 200, 250, 300, 500');
    setMaxStroke('2000');
    setImageFile(null);
    setImageBase64('');
    setImagePreview('');
    setFallbackImageUrl('');
    setIsCompressing(false);
    setCompressionStats(null);
    setHtoTotalSlots(8);
    setHtoSlotDelimiters({});
    setHtoBlocks([
      {
        id: 'block_1',
        title: '① Tipe Dudukan / Mounting Style',
        slotIndex: 2,
        displayType: 'table',
        columns: [{ id: 'col_desc', label: 'Keterangan Dudukan' }],
        rows: [
          { id: 'r1', code: 'B', label: 'Standard (Dasar)', values: { col_desc: 'Standard (Dasar)' } },
          { id: 'r2', code: 'LB', label: 'Foot Mounting (Kaki)', values: { col_desc: 'Foot Mounting (Kaki)' } }
        ]
      }
    ]);
    setSubmitMessage(null);
  };

  // Trigger Edit Mode for a product
  const handleStartEdit = (prod: BelsaProductSeries) => {
    setEditingProduct(prod);
    setSeries(prod.code);
    setCategory(prod.category as BelsaCategory);
    setName(prod.subTitle.id || prod.subTitle.en || '');
    setTaglineId(prod.features.id ? prod.features.id.join('\n') : '');
    setTaglineEn(prod.features.en ? prod.features.en.join('\n') : '');
    setBoreSizes(prod.boreSizes ? prod.boreSizes.join(', ') : '');
    setStandardStrokes(prod.standardStrokes ? prod.standardStrokes.join(', ') : '');
    setMaxStroke(prod.maxStroke ? prod.maxStroke.toString() : '2000');
    setFallbackImageUrl(prod.image || '');
    setImagePreview(prod.image || '');
    setImageFile(null);
    setImageBase64('');
    setIsCompressing(false);
    setCompressionStats(null);

    if (prod.htoConfig) {
      setHtoTotalSlots(prod.htoConfig.totalSlots || 8);
      setHtoSlotDelimiters(prod.htoConfig.slotDelimiters ? { ...prod.htoConfig.slotDelimiters } : {});
      setHtoBlocks(prod.htoConfig.blocks ? JSON.parse(JSON.stringify(prod.htoConfig.blocks)) : []);
    } else {
      setHtoTotalSlots(8);
      setHtoSlotDelimiters({});
      setHtoBlocks([]);
    }

    setActiveTab('editor');
    setSubmitMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete product handler
  const handleDeleteProduct = async (prod: BelsaProductSeries) => {
    const confirmDelete = window.confirm(
      `HAPUS PRODUK:\n\nApakah Anda yakin ingin menghapus seri "${prod.series}" (${prod.category}) dari katalog?\nProduk ini tidak akan ditampilkan lagi di /catalogue.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: prod.id })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Seri ${prod.series} berhasil dihapus dari katalog.`);
        await fetchCatalogueData();
      } else {
        alert(`Gagal menghapus: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error saat menghapus produk: ${err.message || err}`);
    }
  };

  // Restore factory baseline for a product
  const handleRestoreProduct = async (prod: BelsaProductSeries) => {
    const confirmRestore = window.confirm(
      `PULIHKAN PRODUK:\n\nKembalikan seri "${prod.series}" ke data katalog awal? Semua perubahan yang Anda buat akan dihapus.`
    );
    if (!confirmRestore) return;

    try {
      const res = await fetch('/api/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', id: prod.id })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Seri ${prod.series} berhasil dikembalikan ke data katalog awal.`);
        await fetchCatalogueData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message || err}`);
    }
  };

  // Article Handlers
  const handleOpenNewArticle = () => {
    setEditingArticleSlug(null);
    setEditingArticleId(null);
    setArtSlug('');
    setArtCategory('Hydraulic Engineering');
    setArtAuthor('Tim Engineering BELSA');
    setArtDate(new Date().toISOString().slice(0, 10));
    setArtReadTime('5 min baca');
    setArtTitleId('');
    setArtTitleEn('');
    setArtSummaryId('');
    setArtSummaryEn('');
    setArtContentId('');
    setArtContentEn('');
    setArtTags('Silinder, Hidrolik, Standar');
    setArtImageUrl('/images/belsa_og_logo.png');
    setArtImagePreview('/images/belsa_og_logo.png');
    setIsArticleFormOpen(true);
  };

  const handleEditArticle = (art: ArticleItem) => {
    setEditingArticleSlug(art.slug);
    setEditingArticleId(art.id);
    setArtSlug(art.slug);
    setArtCategory(art.category);
    setArtAuthor(art.author || 'Tim Engineering BELSA');
    setArtDate(art.date);
    setArtReadTime(art.readTime);
    setArtTitleId(art.title.id);
    setArtTitleEn(art.title.en);
    setArtSummaryId(art.summary.id);
    setArtSummaryEn(art.summary.en);
    setArtContentId(art.content.id);
    setArtContentEn(art.content.en);
    setArtTags(art.tags.join(', '));
    setArtImageUrl(art.image);
    setArtImagePreview(art.image);
    setIsArticleFormOpen(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteArticle = async (art: ArticleItem) => {
    const confirmDel = window.confirm(
      `HAPUS PANDUAN ARTIKEL:\n\nApakah Anda yakin ingin menghapus artikel "${art.title.id}"?\nArtikel ini akan dihapus dari web dan Google Sheets.`
    );
    if (!confirmDel) return;

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', slug: art.slug })
      });
      const data = await res.json();
      if (data.success) {
        alert('Artikel berhasil dihapus.');
        await fetchArticlesData();
      } else {
        alert(`Gagal menghapus: ${data.message || data.error}`);
      }
    } catch (err: any) {
      alert(`Error saat menghapus artikel: ${err.message || err}`);
    }
  };

  const handleArtImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    setIsCompressingArtImg(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsCompressingArtImg(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/webp', 0.85);

        // Instantly assign to preview AND artImageUrl so saving will never miss the new image
        setArtImagePreview(compressedBase64);
        setArtImageUrl(compressedBase64);

        // Upload to Google Drive via /api/upload
        try {
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: compressedBase64,
              fileName: `art_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            })
          });
          const upData = await upRes.json();
          const driveDirectUrl = upData.url || upData.imageUrl || upData.driveUrl;
          if (upData.success && driveDirectUrl) {
            setArtImageUrl(driveDirectUrl);
            setArtImagePreview(driveDirectUrl);
          }
        } catch {
          // Keep compressedBase64 as fallback
        } finally {
          setIsCompressingArtImg(false);
        }
      };
      img.src = objectUrl;
    } catch {
      setIsCompressingArtImg(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompressingArtImg) {
      alert('Foto masih dalam proses unggah ke Google Drive. Tunggu beberapa detik lalu klik simpan kembali.');
      return;
    }
    if (!artTitleId.trim()) {
      alert('Judul artikel (Bahasa Indonesia) wajib diisi.');
      return;
    }

    const finalSlug = (artSlug.trim() || artTitleId.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const parsedTags = artTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const articlePayload: ArticleItem = {
      id: editingArticleId || editingArticleSlug || `art_${Date.now()}`,
      slug: finalSlug,
      category: artCategory.trim() || 'Teknik Industri',
      author: artAuthor.trim() || 'Tim Engineering BELSA',
      title: {
        id: artTitleId.trim(),
        en: artTitleEn.trim() || artTitleId.trim(),
      },
      summary: {
        id: artSummaryId.trim(),
        en: artSummaryEn.trim() || artSummaryId.trim(),
      },
      content: {
        id: artContentId.trim(),
        en: artContentEn.trim() || artContentId.trim(),
      },
      date: artDate || new Date().toISOString().slice(0, 10),
      readTime: artReadTime.trim() || '5 min baca',
      image: artImageUrl || '/images/belsa_og_logo.png',
      tags: parsedTags.length > 0 ? parsedTags : ['Teknik'],
    };

    setIsSavingArticle(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          article: articlePayload
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsArticleFormOpen(false);
        await fetchArticlesData();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: editingArticleSlug ? 'Artikel Berhasil Diperbarui' : 'Artikel Baru Berhasil Diterbitkan',
          message: `Artikel "${articlePayload.title.id}" telah disimpan dan langsung aktif di /knowledge-hub/${articlePayload.slug}.`
        });
      } else {
        alert(`Gagal menyimpan artikel: ${data.message || data.error}`);
      }
    } catch (err: any) {
      alert(`Error saat menyimpan artikel: ${err.message || err}`);
    } finally {
      setIsSavingArticle(false);
    }
  };

  const filteredArticlesAdmin = useMemo(() => {
    const q = articleSearch.toLowerCase().trim();
    if (!q) return articlesList;
    return articlesList.filter(
      (a) =>
        a.title.id.toLowerCase().includes(q) ||
        a.title.en.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [articlesList, articleSearch]);

  // Block management
  const addBlock = (type: 'table' | 'chips' | 'stroke_matrix') => {
    const nextSlot = htoBlocks.length + 2;
    const newBlock: HtoBlock = {
      id: `b_${Date.now()}`,
      title: type === 'table' ? 'Tabel Spesifikasi Baru' : type === 'chips' ? 'Pilihan Ukuran Bore' : 'Pilihan Stroke Matrix',
      slotIndex: Math.min(nextSlot, htoTotalSlots),
      displayType: type,
      columns: type === 'table' ? [{ id: 'col_desc', label: 'Keterangan' }] : undefined,
      rows: type === 'table' ? [
        { id: `r_${Date.now()}_1`, code: 'A', label: 'Opsi Standar', values: { col_desc: 'Opsi Standar' } }
      ] : [],
      chipValues: type === 'chips' ? ['40', '50', '63', '80'] : undefined,
      standardStrokes: type === 'stroke_matrix' ? [25, 50, 75, 100, 150, 200, 250, 300] : undefined,
      maxStroke: type === 'stroke_matrix' ? 2000 : undefined
    };
    setHtoBlocks([...htoBlocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    setHtoBlocks(htoBlocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, partial: Partial<HtoBlock>) => {
    const updated = [...htoBlocks];
    updated[index] = { ...updated[index], ...partial };
    setHtoBlocks(updated);
  };

  // Table Columns & Rows
  const addColumn = (bIndex: number) => {
    const updated = [...htoBlocks];
    const block = updated[bIndex];
    if (!block.columns) block.columns = [];
    const colId = `col_${Date.now()}`;
    block.columns.push({ id: colId, label: `Kolom ${block.columns.length + 1}` });
    setHtoBlocks(updated);
  };

  const removeColumn = (bIndex: number, colIndex: number) => {
    const updated = [...htoBlocks];
    const block = updated[bIndex];
    if (block.columns && block.columns.length > 1) {
      block.columns = block.columns.filter((_, i) => i !== colIndex);
      setHtoBlocks(updated);
    }
  };

  const addRow = (bIndex: number) => {
    const updated = [...htoBlocks];
    const block = updated[bIndex];
    const initialVals: Record<string, string> = {};
    block.columns?.forEach(c => { initialVals[c.id] = ''; });
    block.rows.push({
      id: `r_${Date.now()}`,
      code: '',
      label: '',
      values: initialVals
    });
    setHtoBlocks(updated);
  };

  const removeRow = (bIndex: number, rIndex: number) => {
    const updated = [...htoBlocks];
    updated[bIndex].rows = updated[bIndex].rows.filter((_, i) => i !== rIndex);
    setHtoBlocks(updated);
  };

  // Submit Handler: Saves Create or Update to /api/catalogue and background sync to Google Sheets
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const isEditing = Boolean(editingProduct);
      const sCode = series.toUpperCase().trim();
      const sName = name.trim() || `${sCode} Series`;

      const featuresId = taglineId.split('\n').map(s => s.trim()).filter(Boolean);
      const featuresEn = (taglineEn || taglineId).split('\n').map(s => s.trim()).filter(Boolean);

      const parsedBores = boreSizes.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const parsedStrokes = standardStrokes.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

      const dynamicHtoConfig: HtoConfig = {
        codePrefix: sCode,
        separator: '-',
        slotDelimiters: htoSlotDelimiters,
        totalSlots: htoTotalSlots,
        blocks: htoBlocks
      };

      const productPayload: BelsaProductSeries = {
        id: isEditing && editingProduct ? editingProduct.id : `custom_${sCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
        slug: isEditing && editingProduct?.slug ? editingProduct.slug : sCode.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
        series: sCode.endsWith('Series') ? sCode : `${sCode} Series`,
        code: sCode,
        category,
        subTitle: { id: sName, en: sName },
        image: fallbackImageUrl.trim() || imagePreview || '/images/prod_cylinder_clean.webp',
        symbolType: isEditing && editingProduct ? editingProduct.symbolType : 'none',
        features: {
          id: featuresId.length > 0 ? featuresId : ['Hubungi kami untuk detail spesifikasi.'],
          en: featuresEn.length > 0 ? featuresEn : ['Precision manufactured in accordance with industrial standards.']
        },
        boreSizes: parsedBores.length > 0 ? parsedBores : [40, 50, 63, 80, 100],
        standardStrokes: parsedStrokes.length > 0 ? parsedStrokes : [25, 50, 75, 100, 150, 200],
        maxStroke: parseInt(maxStroke, 10) || 2000,
        htoConfig: dynamicHtoConfig
      };

      // 1. Save to /api/catalogue (serverless buffer & local database)
      let isSaved = false;
      let errMsg = '';

      try {
        const resApi = await fetch('/api/catalogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: isEditing ? 'update' : 'create',
            product: productPayload
          })
        });
        const dataApi = await resApi.json();
        if (dataApi.success) {
          isSaved = true;
        } else {
          errMsg = dataApi.message || '';
        }
      } catch (errApi: any) {
        errMsg = errApi?.message || '';
      }

      // 2. Synchronize directly to Google Sheets & Google Drive
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'add_item',
            series: sCode,
            category,
            name: sName,
            tagline: taglineId,
            htoConfig: JSON.stringify(dynamicHtoConfig),
            imageBase64: '',
            imageName: imageFile ? imageFile.name : '',
            imageUrl: fallbackImageUrl.trim() || (imagePreview.startsWith('/') || imagePreview.startsWith('http') ? imagePreview : '')
          })
        });
        isSaved = true;
      } catch (gasErr) {
        console.warn('Google Sheets sync notice:', gasErr);
      }

      if (isSaved) {
        const successTitle = isEditing ? 'Perubahan Berhasil Disimpan' : 'Produk Baru Berhasil Ditambahkan';
        const successText = `${isEditing ? 'Perubahan pada seri' : 'Seri baru'} "${productPayload.series}" (${productPayload.category}) berhasil disimpan ke katalog dan Google Sheets.`;

        setSubmitMessage({
          type: 'success',
          text: successText
        });

        // Trigger Instant Fixed Center Popup (tidak perlu scroll ke atas)
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: successTitle,
          message: successText,
          productSeries: productPayload.code
        });

        // Refresh list
        await fetchCatalogueData();

        if (isEditing) {
          setEditingProduct(productPayload);
        } else {
          handleResetForm();
        }
      } else {
        const displayErr = errMsg || 'Gagal menyimpan ke server atau Google Sheets';
        setSubmitMessage({
          type: 'error',
          text: `Gagal menyimpan: ${displayErr}`
        });
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Gagal Menyimpan Produk',
          message: displayErr
        });
      }
    } catch (err: any) {
      const sysErr = err.message || String(err);
      setSubmitMessage({
        type: 'error',
        text: `Error sistem saat menyimpan: ${sysErr}`
      });
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Error Sistem Saat Menyimpan',
        message: sysErr
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '44px 36px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07)',
          textAlign: 'center'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fef2f2', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626' }}>B</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            BELSA Admin Portal
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '28px', lineHeight: 1.5 }}>
            Masuk untuk menambah, mengedit, atau menghapus produk di katalog BELSA.
          </p>

          <form onSubmit={handlePinSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '1.5rem',
                  letterSpacing: '0.4em',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                autoFocus
              />
            </div>

            {pinError && (
              <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                {pinError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#dc2626',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              Buka Akses Admin &rarr;
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.86rem', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Kembali ke Beranda BELSA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '32px 20px 80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        
        {/* Top Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', color: '#fff' }}>
              B
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                BELSA Master Catalogue & HTO Manager
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Kelola semua produk di <code>/catalogue</code> ({allCatalogueProducts.length} Produk Aktif)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/catalogue"
              target="_blank"
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: '#f1f5f9',
                color: '#0f172a',
                fontSize: '0.88rem',
                textDecoration: 'none',
                fontWeight: 700,
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>👁️</span> Lihat /catalogue
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              background: activeTab === 'list' ? '#dc2626' : '#ffffff',
              color: activeTab === 'list' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: activeTab === 'list' ? 'none' : '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'list' ? '0 4px 14px rgba(220,38,38,0.25)' : 'none'
            }}
          >
            <span>📋</span> Daftar Semua Produk ({allCatalogueProducts.length})
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab !== 'editor') {
                setActiveTab('editor');
              }
            }}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              background: activeTab === 'editor' ? '#dc2626' : '#ffffff',
              color: activeTab === 'editor' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: activeTab === 'editor' ? 'none' : '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'editor' ? '0 4px 14px rgba(220,38,38,0.25)' : 'none'
            }}
          >
            <span>{editingProduct ? '✏️' : '➕'}</span>
            <span>{editingProduct ? `Edit Seri: ${editingProduct.code}` : 'Tambah Produk Baru'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              background: activeTab === 'articles' ? '#dc2626' : '#ffffff',
              color: activeTab === 'articles' ? '#ffffff' : '#475569',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: activeTab === 'articles' ? 'none' : '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'articles' ? '0 4px 14px rgba(220,38,38,0.25)' : 'none'
            }}
          >
            <span>📝</span> Kelola Artikel Knowledge Hub ({articlesList.length})
          </button>
        </div>

        {/* Global Feedback Banner */}
        {submitMessage && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '22px',
            background: submitMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: submitMessage.type === 'success' ? '1.5px solid #bbf7d0' : '1.5px solid #fca5a5',
            color: submitMessage.type === 'success' ? '#16a34a' : '#dc2626',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{submitMessage.text}</span>
            <button
              onClick={() => setSubmitMessage(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', fontWeight: 800 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PRODUCT EDITOR (ADD OR EDIT ANY CATALOGUE PRODUCT)                 */}
        {/* ========================================================================= */}
        {activeTab === 'editor' && (
          <form onSubmit={handleFormSubmit}>
            
            {/* Active Edit Mode Banner */}
            {editingProduct && (
              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #93c5fd',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1d4ed8' }}>
                    ✏️ Sedang Mengedit Seri: {editingProduct.series} ({editingProduct.category})
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#3b82f6' }}>
                    ID: <code>{editingProduct.id}</code> — Perubahan akan langsung terlihat di katalog publik.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✕ Batal Edit & Buat Produk Baru
                </button>
              </div>
            )}

            {/* 1. Basic Product Information */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '22px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#dc2626' }}>1.</span> Informasi Dasar Produk
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                    Kode Seri Produk (Contoh: MPC1, B4WE10, BCC140A) *
                  </label>
                  <input
                    type="text"
                    required
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="e.g. MPC1"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '0.92rem', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                    Kategori Produk *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BelsaCategory)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '0.92rem', fontWeight: 700, boxSizing: 'border-box' }}
                  >
                    {BELSA_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                  Nama Lengkap / Subtitle Produk (Bahasa Indonesia) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Medium Cylinder (Silinder Standar Tie-Rod Aluminium)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                    Poin Fitur & Keunggulan (1 baris per poin - ID)
                  </label>
                  <textarea
                    rows={4}
                    value={taglineId}
                    onChange={(e) => setTaglineId(e.target.value)}
                    placeholder="Dilengkapi cincin magnet bawaan pada piston.&#10;Sistem seal presisi non-lubricated.&#10;Bantalan cushion disempurnakan."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.4, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                    Feature Highlights (English translation)
                  </label>
                  <textarea
                    rows={4}
                    value={taglineEn}
                    onChange={(e) => setTaglineEn(e.target.value)}
                    placeholder="Built-in magnet ring on piston.&#10;Precision non-lubricated seal system.&#10;Improved cushion absorption."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.4, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Image URL / Upload with Auto-Compress to WebP */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 18px',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🖼️</span> Foto Produk (otomatis dikompres ke WebP)
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                    ⚡ Auto-Compress to WebP Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '18px', alignItems: 'start' }}>
                  <div>
                    {/* File selector */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                        Unggah gambar dari komputer (PNG, JPG, JPEG, WebP, otomatis diubah ke WebP):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isCompressing}
                        style={{
                          fontSize: '0.82rem',
                          color: '#334155',
                          padding: '6px 10px',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '8px',
                          width: '100%',
                          background: '#fff',
                          cursor: isCompressing ? 'wait' : 'pointer'
                        }}
                      />
                    </div>

                    {/* Compression status / stats pill */}
                    {isCompressing && (
                      <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Mengompresi resolusi & mengonversi gambar ke WebP...
                      </div>
                    )}

                    {compressionStats && !isCompressing && (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#ecfdf5',
                        border: '1px solid #6ee7b7',
                        marginBottom: '10px',
                        fontSize: '0.78rem',
                        color: '#065f46'
                      }}>
                        <div style={{ fontWeight: 800, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✅</span> Gambar berhasil dikompres (format: {compressionStats.format})
                        </div>
                        <div style={{ color: '#047857', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          <span>Asli: <b>{compressionStats.originalSize}</b></span>
                          <span>&rarr;</span>
                          <span>WebP: <b>{compressionStats.compressedSize}</b></span>
                          <span style={{ background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem' }}>
                            Hemat {compressionStats.savedPercent}%
                          </span>
                          <span>Dimensi: {compressionStats.dimensions}</span>
                        </div>
                      </div>
                    )}

                    {/* Image path / URL */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                        Jalur URL File (Server lokal / Link Share Google Drive didukung otomatis):
                      </label>
                      <input
                        type="text"
                        value={fallbackImageUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          const formatted = formatProductImageUrl(val);
                          setFallbackImageUrl(formatted);
                          setImagePreview(formatted);
                        }}
                        placeholder="/uploads/catalogue/nama.webp atau link share Google Drive"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          background: '#fff',
                          color: '#0f172a',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>💡</span> Tips: Anda bisa langsung paste link share dari <b>Google Drive</b> (otomatis diubah menjadi link gambar langsung).
                      </div>
                      {fallbackImageUrl.includes('googleusercontent.com') && (
                        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <span>☁️</span> Tersimpan di Google Drive BELSA:{' '}
                          <a
                            href="https://drive.google.com/drive/folders/1TZjb_Xp9I41rZFmQwZmWEH8a3EWhre8Z?usp=sharing"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#059669', textDecoration: 'underline', fontWeight: 800 }}
                          >
                            Buka Folder Drive &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '130px',
                      height: '110px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {imagePreview ? (
                        <img
                          src={formatProductImageUrl(imagePreview)}
                          alt="Preview Produk"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('googleusercontent.com/d/')) {
                              const fId = target.src.split('/d/')[1]?.split('?')[0];
                              if (fId) {
                                target.src = `https://drive.google.com/thumbnail?id=${fId}&sz=w800`;
                                return;
                              }
                            }
                            target.src = '/images/prod_cylinder_clean.webp';
                          }}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '4px' }}
                        />
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '1.4rem' }}>📷</span>
                          <span>Tanpa Foto</span>
                        </div>
                      )}
                    </div>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFallbackImageUrl('');
                          setImageFile(null);
                          setImageBase64('');
                          setCompressionStats(null);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          color: '#dc2626',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          textDecoration: 'underline'
                        }}
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Interactive How To Order Matrix Builder */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.04)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#dc2626' }}>2.</span> Konfigurator Tabel How To Order
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                    Atur slot kode, tabel spesifikasi, dan tanda pemisah antar-slot sesuai katalog PDF.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Total Jumlah Slot:
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={htoTotalSlots}
                    onChange={(e) => setHtoTotalSlots(Math.max(2, parseInt(e.target.value, 10) || 8))}
                    style={{ width: '65px', padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Slot Delimiters Editor Bar */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #fecaca',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '22px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚙️</span> Pengaturan Tanda Pemisah Antar-Slot (Delimiters):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {Array.from({ length: Math.max(1, htoTotalSlots - 1) }).map((_, idx) => {
                    const slotNum = idx + 1;
                    const curDelim = htoSlotDelimiters[slotNum] !== undefined ? htoSlotDelimiters[slotNum] : '';
                    return (
                      <div key={slotNum} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 800, color: '#475569' }}>#{slotNum} &rarr; #{slotNum + 1}:</span>
                        <select
                          value={curDelim}
                          onChange={(e) => {
                            setHtoSlotDelimiters({
                              ...htoSlotDelimiters,
                              [slotNum]: e.target.value
                            });
                          }}
                          style={{ padding: '2px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: curDelim ? '#dc2626' : '#64748b' }}
                        >
                          <option value="">(Gabung / "")</option>
                          <option value="-">- (Hubung)</option>
                          <option value="/">/ (Miring)</option>
                          <option value=" "> (Spasi)</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Block Actions Toolbar */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => addBlock('table')}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  + Tambah Tabel Spesifikasi
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('chips')}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  + Tambah Pilihan Ukuran (Chips)
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('stroke_matrix')}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#2563eb', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  + Tambah Stroke Matrix
                </button>
              </div>

              {/* Blocks List */}
              {htoBlocks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', border: '1.5px dashed #cbd5e1', borderRadius: '12px' }}>
                  Belum ada tabel How To Order. Klik tombol di atas untuk menambahkan tabel.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {htoBlocks.map((block, bIdx) => (
                    <div
                      key={block.id}
                      style={{
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '18px',
                        background: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Block Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                          <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.9rem' }}>#{bIdx + 1}</span>
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => updateBlock(bIdx, { title: e.target.value })}
                            placeholder="Judul Tabel (e.g. ② Mounting Style)"
                            style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700, fontSize: '0.88rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Isi Slot #:</span>
                            <input
                              type="number"
                              min={1}
                              max={htoTotalSlots}
                              value={block.slotIndex}
                              onChange={(e) => updateBlock(bIdx, { slotIndex: parseInt(e.target.value, 10) || 1 })}
                              style={{ width: '55px', padding: '5px 8px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontWeight: 800, textAlign: 'center' }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeBlock(bIdx)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            Hapus Tabel
                          </button>
                        </div>
                      </div>

                      {/* Display: Table */}
                      {block.displayType === 'table' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                              Baris Opsi & Kode
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => addColumn(bIdx)}
                                style={{ padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                + Tambah Kolom
                              </button>
                              <button
                                type="button"
                                onClick={() => addRow(bIdx)}
                                style={{ padding: '4px 10px', borderRadius: '6px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                + Tambah Baris
                              </button>
                            </div>
                          </div>

                          {/* Table Headers */}
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b' }}>
                                  <th style={{ padding: '6px 8px', width: '90px' }}>Kode Model</th>
                                  <th style={{ padding: '6px 8px' }}>Nama Opsi</th>
                                  {block.columns?.map((col, cIdx) => (
                                    <th key={col.id} style={{ padding: '6px 8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <input
                                          type="text"
                                          value={col.label}
                                          onChange={(e) => {
                                            const updated = [...htoBlocks];
                                            if (updated[bIdx].columns) updated[bIdx].columns![cIdx].label = e.target.value;
                                            setHtoBlocks(updated);
                                          }}
                                          style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700 }}
                                        />
                                        {block.columns && block.columns.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeColumn(bIdx, cIdx)}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </th>
                                  ))}
                                  <th style={{ padding: '6px 8px', width: '40px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {block.rows.map((row, rIdx) => (
                                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '6px 8px' }}>
                                      <input
                                        type="text"
                                        value={row.code}
                                        onChange={(e) => {
                                          const updated = [...htoBlocks];
                                          updated[bIdx].rows[rIdx].code = e.target.value;
                                          setHtoBlocks(updated);
                                        }}
                                        placeholder="e.g. LB"
                                        style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 800, fontFamily: 'monospace', color: '#dc2626' }}
                                      />
                                    </td>
                                    <td style={{ padding: '6px 8px' }}>
                                      <input
                                        type="text"
                                        value={row.label}
                                        onChange={(e) => {
                                          const updated = [...htoBlocks];
                                          updated[bIdx].rows[rIdx].label = e.target.value;
                                          setHtoBlocks(updated);
                                        }}
                                        placeholder="e.g. Foot Mounting (Kaki)"
                                        style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                      />
                                    </td>
                                    {block.columns?.map((col) => (
                                      <td key={col.id} style={{ padding: '6px 8px' }}>
                                        <input
                                          type="text"
                                          value={row.values?.[col.id] || ''}
                                          onChange={(e) => {
                                            const updated = [...htoBlocks];
                                            if (!updated[bIdx].rows[rIdx].values) updated[bIdx].rows[rIdx].values = {};
                                            updated[bIdx].rows[rIdx].values![col.id] = e.target.value;
                                            setHtoBlocks(updated);
                                          }}
                                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        />
                                      </td>
                                    ))}
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                      <button
                                        type="button"
                                        onClick={() => removeRow(bIdx, rIdx)}
                                        style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        🗑️
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Display: Chips */}
                      {block.displayType === 'chips' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                            Daftar Nilai Opsi (Pisahkan dengan koma):
                          </label>
                          <input
                            type="text"
                            value={block.chipValues?.join(', ') || ''}
                            onChange={(e) => updateBlock(bIdx, { chipValues: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            placeholder="40, 50, 63, 80, 100"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }}
                          />
                        </div>
                      )}

                      {/* Display: Stroke Matrix */}
                      {block.displayType === 'stroke_matrix' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                              Standar Stroke (mm, pisahkan dengan koma):
                            </label>
                            <input
                              type="text"
                              value={block.standardStrokes?.join(', ') || ''}
                              onChange={(e) => updateBlock(bIdx, { standardStrokes: e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) })}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '6px', fontWeight: 700 }}>
                              Max Stroke (mm):
                            </label>
                            <input
                              type="number"
                              value={block.maxStroke || 2000}
                              onChange={(e) => updateBlock(bIdx, { maxStroke: parseInt(e.target.value, 10) || 2000 })}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Save Button Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #fecaca',
              boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingProduct ? `Perbarui data untuk seri ${editingProduct.series}` : 'Publikasikan seri produk baru ke katalog'}
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Perubahan langsung disimpan dan tampil di <code>/catalogue</code>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{ padding: '12px 20px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Batal
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '10px',
                    background: isSubmitting ? '#94a3b8' : '#dc2626',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  {isSubmitting ? 'Menyimpan...' : editingProduct ? '💾 Simpan Perubahan Produk' : '➕ Simpan & Terbitkan Produk'}
                </button>
              </div>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ALL PRODUCTS LIST (BROWSE, SEARCH, FILTER, EDIT, DELETE)           */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.04)' }}>
            
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
                  Daftar Seluruh Produk di /catalogue
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Total <strong>{allCatalogueProducts.length}</strong> produk aktif (katalog master dan kustom). Semua produk bisa diedit atau dihapus.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={fetchCatalogueData}
                  disabled={isLoadingList}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  {isLoadingList ? 'Memuat...' : '🔄 Muat Ulang'}
                </button>

                <button
                  onClick={() => {
                    handleResetForm();
                    setActiveTab('editor');
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#dc2626', color: '#fff', border: 'none', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  + Tambah Produk Baru
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '12px', marginBottom: '18px' }}>
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Cari kode seri atau nama produk (misal: MPC1, B4WE, Silinder)..."
                style={{ width: '100%', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />

              <select
                value={listCategoryFilter}
                onChange={(e) => setListCategoryFilter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontSize: '0.86rem', fontWeight: 700, boxSizing: 'border-box' }}
              >
                <option value="ALL">Semua Kategori (13)</option>
                {BELSA_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Table of Products */}
            {isLoadingList ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <p>Memuat database katalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Tidak ada produk yang cocok dengan pencarian.</p>
                <p style={{ fontSize: '0.85rem' }}>Coba ubah kata kunci pencarian atau filter kategori.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '12px 14px', width: '50px' }}>Foto</th>
                      <th style={{ padding: '12px 14px', width: '120px' }}>Kode Seri</th>
                      <th style={{ padding: '12px 14px' }}>Nama / Spesifikasi</th>
                      <th style={{ padding: '12px 14px', width: '180px' }}>Kategori</th>
                      <th style={{ padding: '12px 14px', width: '130px' }}>How To Order</th>
                      <th style={{ padding: '12px 14px', width: '150px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const blockCount = prod.htoConfig?.blocks?.length || 0;
                      const slotCount = prod.htoConfig?.totalSlots || 0;
                      const isMaster = BELSA_CATALOGUE_FULL.some(m => m.id === prod.id);

                      return (
                        <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s ease' }}>
                          {/* Image */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              {prod.image ? (
                                <img src={prod.image} alt={prod.code} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>-</span>
                              )}
                            </div>
                          </td>

                          {/* Code */}
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.92rem', fontFamily: 'monospace' }}>
                              {prod.code}
                            </span>
                            <div style={{ fontSize: '0.68rem', color: isMaster ? '#64748b' : '#16a34a', fontWeight: 700 }}>
                              {isMaster ? 'Katalog Master' : 'Produk Kustom'}
                            </div>
                          </td>

                          {/* Name & Subtitle */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                              {prod.series}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                              {prod.subTitle.id}
                            </div>
                          </td>

                          {/* Category */}
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#334155',
                              fontWeight: 700
                            }}>
                              {prod.category}
                            </span>
                          </td>

                          {/* HTO Info */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                              {blockCount} Tabel
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {slotCount} Slot Kode
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => handleStartEdit(prod)}
                                title="Edit Spesifikasi & Tabel"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️ Edit
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                title="Hapus Produk dari Katalog"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  color: '#dc2626',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KNOWLEDGE HUB ARTICLES MANAGER                                      */}
        {/* ========================================================================= */}
        {activeTab === 'articles' && (
          <div>
            {/* Header / Subhead with Action Button */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 4px 15px -3px rgba(0,0,0,0.03)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Manajemen Artikel Knowledge Hub
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  Kelola seluruh artikel panduan teknis rekayasa industri di <code>/knowledge-hub</code> ({articlesList.length} Artikel Aktif)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link
                  href="/knowledge-hub"
                  target="_blank"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>👁️</span> Buka /knowledge-hub ↗
                </Link>

                <button
                  type="button"
                  onClick={handleOpenNewArticle}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(220,38,38,0.25)'
                  }}
                >
                  <span>➕</span> Tulis Artikel Baru
                </button>
              </div>
            </div>

            {/* If Article Form is Open */}
            {isArticleFormOpen && (
              <form onSubmit={handleSaveArticle} style={{
                background: '#ffffff',
                border: '1.5px solid #fca5a5',
                borderRadius: '18px',
                padding: '28px',
                marginBottom: '28px',
                boxShadow: '0 10px 25px -5px rgba(220,38,38,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {editingArticleSlug ? `✏️ Edit Artikel: ${artTitleId || editingArticleSlug}` : '➕ Tulis Artikel / Panduan Teknis Baru'}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      Data tersimpan langsung ke Google Sheets (tab Articles) dan terpublikasi ke web <code>/knowledge-hub/[slug]</code>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsArticleFormOpen(false)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Batal
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Kategori Artikel *
                    </label>
                    <input
                      type="text"
                      list="categorySuggestions"
                      value={artCategory}
                      onChange={(e) => setArtCategory(e.target.value)}
                      placeholder="Contoh: Hydraulic Engineering"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                      required
                    />
                    <datalist id="categorySuggestions">
                      <option value="Pneumatic Cylinder" />
                      <option value="Hydraulic Engineering" />
                      <option value="Seal Kit & Materials" />
                      <option value="Troubleshooting & Maintenance" />
                      <option value="Hose & Fittings" />
                      <option value="Process Valve" />
                    </datalist>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Slug URL * (Contoh: <code>rumus-pompa-hidrolik</code>)
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={artSlug}
                        onChange={(e) => setArtSlug(e.target.value)}
                        placeholder="slug-artikel"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (artTitleId) {
                            setArtSlug(artTitleId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                          }
                        }}
                        style={{
                          padding: '0 12px',
                          borderRadius: '10px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Auto Slug
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Estimasi Waktu Baca
                    </label>
                    <input
                      type="text"
                      value={artReadTime}
                      onChange={(e) => setArtReadTime(e.target.value)}
                      placeholder="Contoh: 5 min baca"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Tanggal Publikasi
                    </label>
                    <input
                      type="date"
                      value={artDate}
                      onChange={(e) => setArtDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Titles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Judul Artikel (Bahasa Indonesia) *
                    </label>
                    <input
                      type="text"
                      value={artTitleId}
                      onChange={(e) => setArtTitleId(e.target.value)}
                      placeholder="Contoh: Panduan Memilih Pompa Hidrolik Industri"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Judul Artikel (English)
                    </label>
                    <input
                      type="text"
                      value={artTitleEn}
                      onChange={(e) => setArtTitleEn(e.target.value)}
                      placeholder="Example: Guide to Selecting Industrial Hydraulic Pumps"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Summaries */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Ringkasan Singkat (Bahasa Indonesia)
                    </label>
                    <textarea
                      rows={3}
                      value={artSummaryId}
                      onChange={(e) => setArtSummaryId(e.target.value)}
                      placeholder="Ringkasan 1-2 kalimat untuk kartu artikel dan cuplikan Google SEO..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Ringkasan Singkat (English)
                    </label>
                    <textarea
                      rows={3}
                      value={artSummaryEn}
                      onChange={(e) => setArtSummaryEn(e.target.value)}
                      placeholder="Brief 1-2 sentence excerpt for card overview and SEO description..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Markdown Content Fields */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                      Isi Artikel Lengkap (Bahasa Indonesia)
                    </label>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Format: <code>### Subjudul</code> | <code>1. Poin</code> | <code>- List</code> | <code>**tebal**</code> | <code>[Link](/url)</code> | ```rumus```
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={artContentId}
                    onChange={(e) => setArtContentId(e.target.value)}
                    placeholder="Tulis artikel teknis lengkap di sini..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                      Isi Artikel Lengkap (English)
                    </label>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Full technical article body in English
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={artContentEn}
                    onChange={(e) => setArtContentEn(e.target.value)}
                    placeholder="Write full technical guide in English here..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Tags and Image Upload */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Tags / Kata Kunci (Dipisahkan koma)
                    </label>
                    <input
                      type="text"
                      value={artTags}
                      onChange={(e) => setArtTags(e.target.value)}
                      placeholder="Contoh: Hidrolik, Pompa, Perawatan, Tekanan"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Foto Artikel / Thumbnail
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleArtImageUpload}
                        style={{ fontSize: '0.82rem' }}
                      />
                      {isCompressingArtImg && (
                        <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                          Mengunggah ke Drive...
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        value={artImageUrl}
                        onChange={(e) => {
                          setArtImageUrl(e.target.value);
                          setArtImagePreview(e.target.value);
                        }}
                        placeholder="Atau tempel link gambar (Google Drive/URL)..."
                        style={{
                          width: '100%',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Preview thumbnail if available */}
                {artImagePreview && (
                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px' }}>
                    <img
                      src={artImagePreview}
                      alt="Preview"
                      style={{ width: '60px', height: '50px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Preview Thumbnail Gambar</span>
                      <div style={{ wordBreak: 'break-all', fontSize: '0.72rem' }}>{artImageUrl}</div>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setIsArticleFormOpen(false)}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingArticle || isCompressingArtImg}
                    style={{
                      padding: '11px 24px',
                      borderRadius: '10px',
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: (isSavingArticle || isCompressingArtImg) ? 'not-allowed' : 'pointer',
                      opacity: (isSavingArticle || isCompressingArtImg) ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(220,38,38,0.25)'
                    }}
                  >
                    {isCompressingArtImg
                      ? '⏳ Mengunggah Gambar...'
                      : isSavingArticle
                      ? 'Menyimpan...'
                      : '💾 Simpan Artikel ke Google Sheets & Web'}
                  </button>
                </div>
              </form>
            )}

            {/* Articles Table Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 15px -3px rgba(0,0,0,0.03)'
            }}>
              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Cari judul, kategori, atau tag artikel..."
                    style={{
                      width: '100%',
                      padding: '9px 14px 9px 36px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    🔍
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  Menampilkan <strong>{filteredArticlesAdmin.length}</strong> dari {articlesList.length} artikel
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 14px', width: '70px' }}>Foto</th>
                      <th style={{ padding: '12px 14px' }}>Judul & Slug</th>
                      <th style={{ padding: '12px 14px', width: '180px' }}>Kategori & Tags</th>
                      <th style={{ padding: '12px 14px', width: '140px' }}>Tanggal & Waktu</th>
                      <th style={{ padding: '12px 14px', width: '180px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticlesAdmin.map((art) => (
                      <tr key={art.slug} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <img
                            src={art.image}
                            alt={art.title.id}
                            style={{ width: '54px', height: '46px', objectFit: 'contain', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                          />
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                            {art.title.id}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            <code>/knowledge-hub/{art.slug}</code>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#fee2e2',
                            color: '#dc2626',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            marginBottom: '4px'
                          }}>
                            {art.category}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {art.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem' }}>
                          <div>📅 {art.date}</div>
                          <div>⏱️ {art.readTime}</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Link
                              href={`/knowledge-hub/${art.slug}`}
                              target="_blank"
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#0f172a',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                textDecoration: 'none'
                              }}
                            >
                              👁️ Lihat
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleEditArticle(art)}
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art)}
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#dc2626',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredArticlesAdmin.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                          Tidak ada artikel yang cocok dengan pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL POPUP FEEDBACK (POPUP HASIL SIMPAN - TANPA PERLU SCROLL KE ATAS)    */}
      {/* ========================================================================= */}
      {feedbackModal && feedbackModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
          onClick={() => setFeedbackModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 30px 28px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              border: feedbackModal.type === 'success' ? '2px solid #86efac' : '2px solid #fca5a5',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Cross Button */}
            <button
              type="button"
              onClick={() => setFeedbackModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1rem'
              }}
            >
              ✕
            </button>

            {/* Success / Error Icon Badge */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: feedbackModal.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: feedbackModal.type === 'success' ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 900,
              margin: '0 auto 18px',
              border: feedbackModal.type === 'success' ? '3px solid #bbf7d0' : '3px solid #fca5a5'
            }}>
              {feedbackModal.type === 'success' ? '✓' : '✕'}
            </div>

            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '10px'
            }}>
              {feedbackModal.title}
            </h3>

            <p style={{
              fontSize: '0.92rem',
              color: '#475569',
              lineHeight: 1.55,
              marginBottom: '26px'
            }}>
              {feedbackModal.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {feedbackModal.type === 'success' && (
                <Link
                  href="/catalogue"
                  target="_blank"
                  style={{
                    padding: '13px 20px',
                    borderRadius: '12px',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.94rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <span>Lihat Produk di /catalogue</span>
                  <span style={{ fontSize: '1.1rem' }}>↗</span>
                </Link>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                {feedbackModal.type === 'success' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackModal(null);
                      setActiveTab('list');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      background: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      border: '1.5px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    Daftar Semua Produk
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: feedbackModal.type === 'success' ? '#ffffff' : '#dc2626',
                    color: feedbackModal.type === 'success' ? '#334155' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: feedbackModal.type === 'success' ? '1.5px solid #cbd5e1' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {feedbackModal.type === 'success' ? 'Tutup' : 'Mengerti'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
