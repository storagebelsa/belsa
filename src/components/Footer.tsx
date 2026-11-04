'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

export default function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang].footer;

  return (
    <footer className="belsa-footer-light">
      <div className="belsa-container">
        
        {/* 1. Header Bar: Brand Partnership & Quality Certification */}
        <div className="footer-light-header">
          <div className="footer-light-brand-row">
            <Link href="/" className="footer-light-logo" title="BELSA Hydraulic & Pneumatic">
              <img src="/images/logo_clean.webp" alt="BELSA HYDRAULIC PNEUMATIC" />
            </Link>
            <div className="footer-light-divider" />
            <div className="footer-light-rmw-group">
              <span className="footer-light-label">A Brand of:</span>
              <a 
                href="https://rafitama.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-light-rmw-card"
                title="Kunjungi website PT. Rafitama Millenial Wahyudi"
              >
                <img src="/images/logo_rmw_clean.png" alt="PT. Rafitama Millenial Wahyudi" className="footer-light-rmw-img" />
              </a>
            </div>
          </div>

          <div className="footer-light-iso-card">
            <img 
              src="/images/logo_iso_clean.png" 
              alt="TÜV Rheinland Certified ISO 9001:2015 ID 9000019727" 
              className="footer-light-iso-img"
            />
            <div className="footer-light-iso-info">
              <strong className="footer-light-iso-title">ISO 9001:2015</strong>
              <span className="footer-light-iso-sub">TÜV Rheinland Certified</span>
              <span className="footer-light-iso-id">ID: 9000019727</span>
            </div>
          </div>
        </div>

        {/* 2. Main 4-Column Grid */}
        <div className="footer-light-grid">
          
          {/* Col 1: Brand Info & Direct Contact */}
          <div className="footer-light-col-about">
            <h3 className="footer-light-title">BELSA</h3>
            <p className="footer-light-desc">
              {lang === 'id' 
                ? 'Produsen silinder hidrolik dan pneumatik, hydraulic power pack, perakitan selang hidrolik, serta pemasok process valve untuk industri di Indonesia.' 
                : 'Specialist in precision hydraulic & pneumatic cylinder manufacturing, industrial hose assemblies, and trusted fluid control components in Indonesia.'}
            </p>
            
            <div className="footer-light-contact-list">
              <a href="mailto:sales@belsa.id" className="footer-light-contact-item">
                <div className="footer-light-icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 18" fill="none">
                    <rect width="24" height="18" rx="3" fill="#D3232A"/>
                    <path d="M3 4l9 6.5 9-6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>sales@belsa.id</span>
              </a>

              <a href="https://wa.me/6281119168752" target="_blank" rel="noopener noreferrer" className="footer-light-contact-item">
                <div className="footer-light-icon-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                </div>
                <span>+62 811-1916-8752 (WhatsApp)</span>
              </a>

              <div className="footer-light-hours">
                <span className="footer-light-hours-dot" />
                <span>{lang === 'id' ? 'Senin – Jumat 08:30 – 17:00 WIB' : 'Mon – Fri 08:30 – 17:00 WIB'}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Core Products */}
          <div className="footer-light-col-links">
            <h3 className="footer-light-title">
              {lang === 'id' ? 'Produk Utama' : 'Core Products'}
            </h3>
            <ul className="footer-light-links">
              <li><Link href="/products/silinder-hidrolik-pneumatik">{lang === 'id' ? 'Silinder Hidrolik & Pneumatik' : 'Hydraulic & Pneumatic Cylinder'}</Link></li>
              <li><Link href="/products/selang-hidrolik-industri">{lang === 'id' ? 'Selang Hidrolik & Industri' : 'Industrial & Hydraulic Hose'}</Link></li>
              <li><Link href="/products/process-valve">Process Valve</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="footer-light-col-links">
            <h3 className="footer-light-title">
              {lang === 'id' ? 'Navigasi Cepat' : 'Quick Navigation'}
            </h3>
            <ul className="footer-light-links">
              <li><Link href="/">{lang === 'id' ? 'Beranda' : 'Home'}</Link></li>
              <li><Link href="/about-us">{lang === 'id' ? 'Tentang BELSA' : 'About Us'}</Link></li>
              <li><Link href="/products">{lang === 'id' ? 'Kategori Produk' : 'Product Categories'}</Link></li>
              <li className="hide-on-mobile"><Link href="/catalogue">{lang === 'id' ? 'Katalog Online' : 'Interactive Catalogue'}</Link></li>
              <li><Link href="/calculator">{lang === 'id' ? 'Kalkulator Teknis' : 'Engineering Calculator'}</Link></li>
              <li><Link href="/projects">{lang === 'id' ? 'Daftar Proyek' : 'Project Portfolio'}</Link></li>
              <li><Link href="/contact-us">{lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}</Link></li>
            </ul>
          </div>

          {/* Col 4: Facilities & Google Maps */}
          <div className="footer-light-col-facilities">
            <h3 className="footer-light-title">
              {lang === 'id' ? 'Kantor & Fasilitas' : 'Offices & Facilities'}
            </h3>

            {/* Head Office */}
            <div className="footer-light-facility-item">
              <div className="footer-light-facility-head">
                <span className="footer-light-facility-label">{lang === 'id' ? 'Head Office' : 'Head Office'}</span>
                <a 
                  href="https://www.google.com/maps/place/Nabel+Sakha+Building/@-6.259055,106.6080465,1346m/data=!3m1!1e3!4m6!3m5!1s0x2e69fc750c1499af:0x6a880c03d8ec12b1!8m2!3d-6.2589089!4d106.6079929!16s%2Fg%2F119vrtf59?entry=ttu&g_ep=EgoyMDI2MTEwMS4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-light-map-link"
                  title="Lihat lokasi Head Office di Google Maps"
                >
                  Maps ↗
                </a>
              </div>
              <p className="footer-light-facility-text">
                Jl. Scientia Garden T/07, Scientia Boulevard, Gading Serpong, Kab. Tangerang – Banten 15334
              </p>
            </div>

            {/* Workshop */}
            <div className="footer-light-facility-item">
              <div className="footer-light-facility-head">
                <span className="footer-light-facility-label">{lang === 'id' ? 'Workshop' : 'Workshop'}</span>
                <a 
                  href="https://maps.app.goo.gl/CPFtJNBygVUNbXiQ9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-light-map-link"
                  title="Lihat lokasi workshop di Google Maps"
                >
                  Maps ↗
                </a>
              </div>
              <p className="footer-light-facility-text">
                Kawasan Pergudangan Sunrise Bizpark, Jl. Raya Prabu Siliwangi Km 3,5, Pasar Kemis, Tangerang
              </p>
            </div>

            {/* Warehouse */}
            <div className="footer-light-facility-item">
              <div className="footer-light-facility-head">
                <span className="footer-light-facility-label">{lang === 'id' ? 'Gudang' : 'Warehouse'}</span>
                <a 
                  href="https://share.google/uIQQJRmvrwHyUn94o" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-light-map-link"
                  title="Lihat lokasi gudang di Google Maps"
                >
                  Maps ↗
                </a>
              </div>
              <p className="footer-light-facility-text">
                Kawasan Pergudangan Sunrise Bizpark, Pasar Kemis, Tangerang
              </p>
            </div>

          </div>

        </div>

        {/* 3. Bottom Strip */}
        <div className="footer-light-bottom">
          <p className="footer-light-copy">
            © 2026 <strong>BELSA</strong> &bull; Merek dagang milik{' '}
            <a href="https://rafitama.com" target="_blank" rel="noopener noreferrer" className="footer-light-copy-link">
              PT. Rafitama Millenial Wahyudi
            </a>
            . {lang === 'id' ? 'Hak cipta dilindungi.' : 'All Rights Reserved.'}
          </p>

          <div className="footer-light-socials">
            <a href="https://www.youtube.com/@nabelsakhagroup" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-light-social-btn" title="YouTube BELSA / PT. Rafitama Millenial Wahyudi">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </a>
            <a href="https://www.instagram.com/nabelsakha/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-light-social-btn" title="Instagram BELSA / PT. Rafitama Millenial Wahyudi">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://id.linkedin.com/company/rafitamawahyudi" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-light-social-btn" title="LinkedIn PT. Rafitama Millenial Wahyudi">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
