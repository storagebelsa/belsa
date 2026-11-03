'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import TwoToneTitle from '@/components/TwoToneTitle';

interface CultureSlide {
  id: number;
  image: string;
  badgeId: string;
  badgeEn: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
}

interface CultureCarouselProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
}

const slides: CultureSlide[] = [
  {
    id: 1,
    image: '/images/culture_training_briefing.webp',
    badgeId: 'Pelatihan & K3',
    badgeEn: 'Safety & Training',
    titleId: 'Briefing K3 & Pelatihan Teknis',
    titleEn: 'Safety Briefing & Technical Training',
    descId: 'Briefing keselamatan kerja dan pelatihan berkala untuk tim mengenai standar manufaktur silinder di workshop.',
    descEn: 'Regular occupational safety briefings and engineering training sessions for workshop technicians.'
  },
  {
    id: 2,
    image: '/images/culture_customer_visit.webp',
    badgeId: 'Kunjungan Klien',
    badgeEn: 'Customer Visit',
    titleId: 'Kunjungan Industri & Diskusi Drawing',
    titleEn: 'Client Facility Tour & Drawing Review',
    descId: 'Klien industri berkunjung ke fasilitas kami untuk meninjau drawing teknis, jadwal produksi, dan spesifikasi silinder kustom.',
    descEn: 'Industrial clients visiting our manufacturing plant to review CAD drawings, production schedules, and custom cylinder specs.'
  },
  {
    id: 3,
    image: '/images/facility_lathe_machinists.webp',
    badgeId: 'Machining',
    badgeEn: 'Machining Precision',
    titleId: 'Pembubutan Silinder Ukuran Besar',
    titleEn: 'Heavy-Duty Lathe Machining',
    descId: 'Operator bubut berpengalaman mengerjakan komponen silinder berdiameter besar sesuai toleransi drawing.',
    descEn: 'Experienced machinists turning large-diameter cylinder barrels and components to strict engineering tolerances.'
  },
  {
    id: 4,
    image: '/images/culture_parts_warehouse.webp',
    badgeId: 'Gudang Komponen',
    badgeEn: 'Parts Warehouse',
    titleId: 'Penyimpanan Spare Part & Komponen',
    titleEn: 'Component Inventory & Parts Storage',
    descId: 'Penyimpanan seal kit, rod end, clevis mounting, dan fitting hidrolik tersusun rapi dengan sistem inventaris yang teratur.',
    descEn: 'Organized racking system for seal kits, rod ends, clevis mountings, and hydraulic fittings ensuring fast assembly.'
  },
  {
    id: 5,
    image: '/images/culture_workshop_banner.webp',
    badgeId: 'Area Workshop',
    badgeEn: 'Workshop Facility',
    titleId: 'Lantai Workshop & Standar 5S',
    titleEn: 'Clean Workshop Floor & 5S Culture',
    descId: 'Area kerja workshop tertata rapi dan bersih mengikuti prinsip 5S untuk menjaga efisiensi alur kerja dan keselamatan tim.',
    descEn: 'Orderly, well-maintained workshop floor compliant with 5S methodology ensuring optimal manufacturing safety.'
  },
  {
    id: 6,
    image: '/images/facility_metrology_inspection.webp',
    badgeId: 'Quality Control',
    badgeEn: 'Quality Control',
    titleId: 'Pemeriksaan Dimensi & Kalibrasi',
    titleEn: 'Metrology & Dimensional Inspection',
    descId: 'Pemeriksaan kebulatan tube, ketebalan lapisan hard chrome, dan dimensi alur seal dengan alat ukur presisi.',
    descEn: 'Inner bore roundness check, hard chrome layer thickness measurement, and seal groove verification with calibrated metrology gauges.'
  }
];

export default function CultureCarousel({ title, subtitle, eyebrow }: CultureCarouselProps) {
  const { lang } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>('.belsa-carousel-card');
    if (card) {
      const cardWidth = card.offsetWidth + 24; // width + gap
      const newIndex = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), slides.length - 1));
    }

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scrollToSlide = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('.belsa-carousel-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  const scrollPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.belsa-carousel-card');
    const scrollAmount = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.belsa-carousel-card');
    const scrollAmount = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="belsa-carousel-wrapper">
      {/* Header with Title and Navigation Controls */}
      {title ? (
        <div className="belsa-carousel-header">
          <div style={{ maxWidth: '640px' }}>
            {eyebrow && (
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--belsa-red)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '6px'
              }}>
                {eyebrow}
              </span>
            )}
            <h2 className="heading-section" style={{ margin: '0 0 8px', fontSize: '1.95rem' }}>
              <TwoToneTitle text={title} />
            </h2>
            {subtitle && (
              <p style={{ color: 'var(--belsa-gray)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            <div className="belsa-carousel-counter">
              <span className="belsa-carousel-counter-active">0{activeIndex + 1}</span>
              <span className="belsa-carousel-counter-total">/ 0{slides.length}</span>
            </div>
            <div className="belsa-carousel-nav">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollLeft}
                aria-label="Previous Slide"
                className={`belsa-carousel-btn ${!canScrollLeft ? 'is-disabled' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollRight}
                aria-label="Next Slide"
                className={`belsa-carousel-btn ${!canScrollRight ? 'is-disabled' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="belsa-carousel-header">
          <div className="belsa-carousel-counter">
            <span className="belsa-carousel-counter-active">0{activeIndex + 1}</span>
            <span className="belsa-carousel-counter-total">/ 0{slides.length}</span>
          </div>
          <div className="belsa-carousel-nav">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Previous Slide"
              className={`belsa-carousel-btn ${!canScrollLeft ? 'is-disabled' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollRight}
              aria-label="Next Slide"
              className={`belsa-carousel-btn ${!canScrollRight ? 'is-disabled' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Horizontal scrolling track */}
      <div ref={trackRef} className="belsa-carousel-track">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`belsa-carousel-card ${idx === activeIndex ? 'is-active' : ''}`}
            onClick={() => scrollToSlide(idx)}
          >
            <div className="belsa-carousel-img-container">
              <img
                src={slide.image}
                alt={lang === 'id' ? slide.titleId : slide.titleEn}
                className="belsa-carousel-img"
                loading="lazy"
              />
              <span className="belsa-carousel-badge">
                <span className="belsa-carousel-badge-dot" />
                {lang === 'id' ? slide.badgeId : slide.badgeEn}
              </span>
              <span className="belsa-carousel-card-num">0{slide.id}</span>
            </div>
            <div className="belsa-carousel-body">
              <h3 className="belsa-carousel-title">
                {lang === 'id' ? slide.titleId : slide.titleEn}
              </h3>
              <p className="belsa-carousel-desc">
                {lang === 'id' ? slide.descId : slide.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicator Dots */}
      <div className="belsa-carousel-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`belsa-carousel-dot ${idx === activeIndex ? 'is-active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
