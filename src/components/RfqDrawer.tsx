'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRfq } from '@/context/RfqContext';
import { useLanguage } from '@/context/LanguageContext';

export default function RfqDrawer() {
  const { items, totalCount, removeItem, updateQuantity, clearCart, isDrawerOpen, setIsDrawerOpen } = useRfq();
  const { lang } = useLanguage();
  const isId = lang === 'id';

  const [picName, setPicName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isDrawerOpen) return null;

  const generateRfqMessage = () => {
    let msg = `*PERMINTAAN PENAWARAN HARGA (RFQ) - BELSA*\n`;
    msg += `-------------------------------------------\n`;
    msg += `Perusahaan: ${companyName.trim() || '—'}\n`;
    msg += `Nama PIC: ${picName.trim() || '—'}\n`;
    msg += `No. Kontak / WA: ${phone.trim() || '—'}\n`;
    if (notes.trim()) {
      msg += `Catatan: ${notes.trim()}\n`;
    }
    msg += `\n*Daftar Produk (${totalCount} item):*\n`;

    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.series}* (${item.code})\n`;
      msg += `   • Kategori: ${item.category}\n`;
      if (item.htoCode) {
        msg += `   • Kode Pemesanan: ${item.htoCode}\n`;
      }
      msg += `   • Jumlah: ${item.quantity} unit\n`;
    });

    msg += `\n-------------------------------------------\n`;
    msg += `Mohon dikirimkan penawaran harga, info ketersediaan stok, dan estimasi lead time. Terima kasih.`;
    return msg;
  };

  const handleSendWhatsApp = () => {
    const text = generateRfqMessage();
    const waUrl = `https://wa.me/6281119168752?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopySummary = () => {
    const text = generateRfqMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F9FAFB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEE2E2', color: 'var(--belsa-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--belsa-dark)' }}>
                {isId ? 'Keranjang RFQ' : 'Quotation Request Cart'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                {items.length} {isId ? 'tipe produk' : 'product types'} ({totalCount} unit)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                {isId ? 'Kosongkan' : 'Clear'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              style={{
                background: '#E5E7EB',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                color: '#4B5563',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                  </svg>
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--belsa-dark)', marginBottom: '8px' }}>
                {isId ? 'Keranjang RFQ masih kosong' : 'Your RFQ Cart is Empty'}
              </h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
                {isId
                  ? 'Buka katalog dan klik "+ Tambah ke Penawaran" pada produk yang Anda butuhkan. Daftar produk akan terkumpul di sini.'
                  : 'Browse our catalog and click "+ Add to RFQ" to compile cylinder or machinery component specifications for formal quotation.'}
              </p>
              <Link
                href="/products"
                onClick={() => setIsDrawerOpen(false)}
                className="belsa-btn belsa-btn-primary"
                style={{ display: 'inline-block' }}
              >
                {isId ? 'Lihat Produk' : 'Explore Products'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, idx) => (
                  <div
                    key={`${item.id}_${item.htoCode || ''}_${idx}`}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '14px',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {item.image && (
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            background: '#F9FAFB',
                            border: '1px solid #F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.series}
                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                          />
                        </div>
                      )}

                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--belsa-dark)' }}>
                            {item.series}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id, item.htoCode)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9CA3AF',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              fontSize: '0.85rem',
                            }}
                            title="Hapus produk"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block' }}>
                          {item.category} • Kode: {item.code}
                        </span>

                        {item.htoCode && (
                          <div
                            style={{
                              marginTop: '6px',
                              background: '#F3F4F6',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontFamily: 'monospace',
                              color: 'var(--belsa-red)',
                              fontWeight: 600,
                              wordBreak: 'break-all',
                            }}
                          >
                            HTO: {item.htoCode}
                          </div>
                        )}

                        {/* Quantity Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                            {isId ? 'Jumlah:' : 'Qty:'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D1D5DB', borderRadius: '6px', overflow: 'hidden' }}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.htoCode)}
                              style={{
                                width: '28px',
                                height: '26px',
                                background: '#F9FAFB',
                                border: 'none',
                                borderRight: '1px solid #D1D5DB',
                                cursor: 'pointer',
                                fontWeight: 700,
                              }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600 }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.htoCode)}
                              style={{
                                width: '28px',
                                height: '26px',
                                background: '#F9FAFB',
                                border: 'none',
                                borderLeft: '1px solid #D1D5DB',
                                cursor: 'pointer',
                                fontWeight: 700,
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inquiry Details Form */}
              <div
                style={{
                  marginTop: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                  {isId ? 'Data Pemesan (opsional)' : 'Requestor Information (Optional)'}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      {isId ? 'Nama Perusahaan' : 'Company / Factory Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PT. Industri Maju Bersama"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        {isId ? 'Nama PIC' : 'Contact Person'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bpk. Hendra"
                        value={picName}
                        onChange={(e) => setPicName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        {isId ? 'No. WhatsApp' : 'WhatsApp Number'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      {isId ? 'Catatan (bore khusus, material rod, target kirim):' : 'Additional Notes (Custom bore, materials, deadline):'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={isId ? 'Tulis kebutuhan khusus atau target pengiriman...' : 'Special requirements or delivery target...'}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={handleSendWhatsApp}
              style={{
                width: '100%',
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
              </svg>
              <span>{isId ? 'Kirim RFQ via WhatsApp' : 'Send RFQ via Official WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="belsa-btn belsa-btn-outline"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '0.86rem',
                padding: '10px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {copied ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
                {copied ? (isId ? 'Rincian RFQ sudah disalin' : 'RFQ Summary Copied!') : (isId ? 'Salin Rincian RFQ' : 'Copy RFQ Summary')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
