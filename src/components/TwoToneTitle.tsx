'use client';

import React from 'react';

interface TwoToneTitleProps {
  text?: string;
  children?: React.ReactNode;
  accentPosition?: 'first' | 'last';
  accentWordsCount?: number;
  accentColor?: string;
}

export default function TwoToneTitle({
  text,
  children,
  accentPosition = 'last',
  accentWordsCount,
  accentColor = 'var(--belsa-red)'
}: TwoToneTitleProps) {
  // If raw children passed, render directly
  if (children) {
    return <>{children}</>;
  }

  if (!text) return null;

  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return <span>{text}</span>;
  }

  // Determine how many words to highlight
  // Default:
  // - 2 words: 1st word black, 2nd word red (e.g. "Alur Pengerjaan", "Fasilitas Workshop", "Profil Perusahaan", "Tentang BELSA")
  // - 3 words: 1st 2 words black, 3rd word red (e.g. "Aktivitas di Workshop", "Daftar Kategori Produk")
  // - 4 words: 1st 2 words black, last 2 words red (e.g. "Pertanyaan yang Sering Diajukan")
  // - 5+ words: last 2 words red
  let count = accentWordsCount;
  if (count === undefined) {
    if (words.length === 2) count = 1;
    else if (words.length === 3) count = 1;
    else if (words.length === 4) count = 2;
    else count = 2;
  }

  if (accentPosition === 'last') {
    const splitIndex = words.length - count;
    const firstPart = words.slice(0, splitIndex).join(' ');
    const secondPart = words.slice(splitIndex).join(' ');
    return (
      <>
        <span>{firstPart}</span>{' '}
        <span style={{ color: accentColor }}>{secondPart}</span>
      </>
    );
  } else {
    const firstPart = words.slice(0, count).join(' ');
    const secondPart = words.slice(count).join(' ');
    return (
      <>
        <span style={{ color: accentColor }}>{firstPart}</span>{' '}
        <span>{secondPart}</span>
      </>
    );
  }
}
