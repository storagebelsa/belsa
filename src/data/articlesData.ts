export interface ArticleItem {
  id: string;
  slug: string;
  category: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  content: { id: string; en: string };
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  author?: string;
}

export const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: 'iso-15552-guide',
    slug: 'panduan-standar-silinder-iso-15552',
    category: 'Pneumatic Cylinder',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Panduan Lengkap Standar Silinder ISO 15552: Cara Membaca Kode & Dimensi Mounting',
      en: 'Complete Guide to ISO 15552 Pneumatic Cylinders: Code Decoding & Mounting Dimensions'
    },
    summary: {
      id: 'Memahami standar internasional ISO 15552 untuk silinder profil pneumatik, aturan interchangeability antar-brand (Festo, SMC, Parker), dan cara membaca blok kode pemesanan secara presisi.',
      en: 'A comprehensive technical overview of ISO 15552 pneumatic profile cylinders, brand interchangeability, and precision model code breakdown.'
    },
    content: {
      id: `Standar ISO 15552 (menggantikan standar terdahulu ISO 6431) adalah standar internasional paling umum yang mengatur dimensi pemasangan (mounting dimensions), ukuran bore (Ø32 mm hingga Ø320 mm), serta tekanan operasional silinder profil pneumatik.

### Mengapa Standar ISO 15552 Sangat Penting Bagi Industri?
1. **Interchangeability (Dapat Dipertukarkan Langsung)**: Silinder dengan standar ISO 15552 memiliki pitch baut dudukan (mounting hole centers), diameter rod, dan ulir rod yang identik di seluruh dunia. Artinya, silinder seri BELSA ACI/BMC dapat langsung menggantikan silinder brand internasional seperti SMC CP96/C96, Festo DNC/DSBC, atau Parker P1D tanpa perlu mengubah bracket mesin Anda.
2. **Profile Tube dengan Sensor Groove**: Tabung silinder dilengkapi celah sensor magnetik terintegrasi, memudahkan pemasangan auto-switch reed/solid-state tanpa bracket tambahan yang menonjol.
3. **Cushioning Udara Kedua Sisi**: Dilengkapi adjustable cushion needle dengan seal peredam benturan kinetik di akhir langkah (stroke), memperpanjang usia pakai seal piston.

### Cara Membaca Kode Pemesanan (How to Order):
Pada seri BELSA ACI, kode dipecah menjadi beberapa slot:
- **Slot 1: Seri Silinder** (ACI = Profile ISO 15552)
- **Slot 2: Tipe Dudukan Mounting** (FA = Flange depan, LB = Foot mounting, CA/CB = Clevis)
- **Slot 3: Ukuran Bore** (Contoh: 100 = Ø100 mm)
- **Slot 4: Panjang Stroke** (Contoh: 400 = 400 mm)
- **Slot 5 & 6: Material Rod & Seal** (STS304 Stainless, Seal Viton tahan panas)

Untuk menghitung gaya dorong silinder ISO 15552 pada tekanan pabrik Anda, gunakan [Kalkulator Silinder BELSA](/calculator).`,
      en: `The ISO 15552 international standard (succeeding the previous ISO 6431 standard) establishes universal mounting dimensions, standard bore diameters (Ø32 mm up to Ø320 mm), and operating pressure ratings for industrial pneumatic profile cylinders.

### Why is ISO 15552 Critical for Plant Engineering?
1. **Global Interchangeability (100% Direct Drop-in)**: Pneumatic cylinders conforming to ISO 15552 share identical mounting hole centers, rod diameters, thread pitches, and pin dimensions worldwide. This means BELSA ACI and BMC series profile cylinders can directly replace international brands such as SMC CP96/C96, Festo DNC/DSBC, and Parker P1D without needing any bracket or machine modifications.
2. **Profile Aluminum Barrel with Integrated Sensor Slots**: The extrusion profile incorporates clean recessed grooves on multiple faces for flush-mounted magnetic reed and solid-state sensors, eliminating protruding sensor brackets.
3. **Dual-End Adjustable Air Cushioning**: Both front and rear end-caps feature adjustable needle valves and elastomeric cushion seals that absorb kinetic impact at stroke ends, significantly extending piston seal operational life.

### How to Decode the Order Code (How to Order):
Taking the BELSA ACI series as an example, the model code is structured systematically:
- **Code Segment 1: Cylinder Series** (ACI = Profile ISO 15552 Standard)
- **Code Segment 2: Mounting Configuration** (FA = Front Flange, LB = Foot Brackets, CA/CB = Rear Clevis)
- **Code Segment 3: Piston Bore Diameter** (e.g. 100 = Ø100 mm)
- **Code Segment 4: Stroke Length** (e.g. 400 = 400 mm travel)
- **Code Segment 5 & 6: Rod Material & Seal Options** (STS304 Stainless Rod, High-Temp Viton FKM seals)

To calculate cylinder thrust output and air consumption for your plant operating pressure, use the [BELSA Pneumatic & Hydraulic Calculator](/calculator).`
    },
    date: '2026-11-04',
    readTime: '5 min baca',
    image: 'https://lh3.googleusercontent.com/d/1tjCeUMjsccQLkKuZgQX6bJXeBqAevPi7',
    tags: ['Pneumatik', 'ISO 15552', 'How to Order', 'Bore & Stroke']
  },
  {
    id: 'barlow-formula-honing',
    slug: 'rumus-barlow-ketebalan-pipa-honing-hidrolik',
    category: 'Hydraulic Engineering',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Rumus Barlow: Perhitungan Ketebalan Dinding Tabung Pipa Honed ST52 Silinder Hidrolik',
      en: 'Barlow Formula: Calculating Wall Thickness for ST52 Honed Hydraulic Tubes'
    },
    summary: {
      id: 'Panduan teknis menghitung ketebalan minimum pipa seamless honed tube, safety factor tegangan luluh (yield strength), dan batas toleransi pembesaran (oversize) saat rekondisi silinder.',
      en: 'Engineering calculation guide for seamless honed tube wall thickness using Barlow formula and standard yield strength safety factors.'
    },
    content: {
      id: `Tabung silinder hidrolik (Honed Tube) menahan tekanan fluida bertekanan tinggi yang bekerja ke arah radial ke luar (hoop stress). Kegagalan menghitung ketebalan dinding dapat menyebabkan tabung menggelembung (swelling) atau pecah saat terjadi lonjakan tekanan (pressure shock).

### Rumus Barlow untuk Tabung Bertekanan:
Rumus standar Barlow yang digunakan oleh insinyur hidrolik adalah:
\`\`\`
t_min = (P × OD) / (2 × σ_allow + P)
\`\`\`
Di mana:
- **P**: Tekanan kerja maksimal atau tekanan uji (Bar / MPa)
- **OD**: Diameter luar tabung (Outer Diameter) dalam mm
- **σ_allow**: Tegangan tarik izin material (Allowable Stress) = Tegangan Luluh (Yield Strength) / Safety Factor
- **Safety Factor**: Direkomendasikan minimal 2.15 hingga 3.0 untuk operasional industri berat

### Karakteristik Material Tabung Standar BELSA:
- **DIN 2391 / EN 10305-1 Grade E355 (ST52 / ST52.4 BK+S)**:
  - Yield Strength (Re): ≥ 520 N/mm²
  - Tensile Strength (Rm): ≥ 600 N/mm²
  - Kekasaran Dinding Dalam: Ra ≤ 0.4 µm (H8 Tolerance)
  - Sangat tahan terhadap gesekan piston seal dan tekanan kejut hingga 350 Bar.

Anda dapat menghitung ketebalan pipa honing dan mengecek batas keamanan secara instan di [Kalkulator Barlow BELSA](/calculator).`,
      en: `Hydraulic cylinder barrels (seamless honed tubes) must reliably withstand extreme internal fluid pressures exerting continuous outward radial tension (hoop stress). Failing to calculate adequate wall thickness can result in tube swelling, internal bypass leakage, or catastrophic rupture under hydraulic pressure spikes.

### Barlow Formula for Cylindrical Pressure Vessels:
The industry-standard Barlow formula used by fluid power design engineers is:
\`\`\`
t_min = (P × OD) / (2 × σ_allow + P)
\`\`\`
Where:
- **P**: Maximum design working pressure or test pressure (Bar / MPa)
- **OD**: Tube outer diameter in mm
- **σ_allow**: Material allowable tensile stress = Yield Strength (Re) / Safety Factor
- **Safety Factor**: Recommended minimum 2.15 to 3.0 for heavy industrial and mobile machinery applications

### Standard Material Characteristics at BELSA:
- **DIN 2391 / EN 10305-1 Grade E355 (ST52 / ST52.4 BK+S)**:
  - Yield Strength (Re): ≥ 520 N/mm²
  - Tensile Strength (Rm): ≥ 600 N/mm²
  - Internal Bore Roughness: Ra ≤ 0.4 µm (H8 Tolerance precision honed)
  - Exceptional endurance against dynamic seal friction and pressure spikes up to 350 Bar.

Calculate your exact tube wall thickness and safety margin instantly using the [BELSA Barlow Formula Calculator](/calculator).`
    },
    date: '2026-11-02',
    readTime: '6 min baca',
    image: 'https://lh3.googleusercontent.com/d/1yZEz3Q1avpVWBHAc8ey3m71OZ1PtxbZ9',
    tags: ['Hidrolik', 'Rumus Barlow', 'Honed Tube', 'Kalkulasi Teknik']
  },
  {
    id: 'seal-materials-guide',
    slug: 'material-seal-hidrolik-nbr-pu-viton-fkm',
    category: 'Seal Kit & Materials',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Perbandingan Karakteristik Seal NBR, Polyurethane (PU), dan FKM (Viton) pada Suhu & Tekanan Ekstrem',
      en: 'Comparing NBR, Polyurethane (PU), and FKM (Viton) Seals in Extreme Temperature and Pressure'
    },
    summary: {
      id: 'Memilih material seal yang tepat untuk rod seal, piston seal, dan wiper pada silinder hidrolik dan pneumatik guna mencegah kebocoran akibat suhu panas dan gesekan tinggi.',
      en: 'How to select the right seal material for hydraulic and pneumatic cylinders to prevent leaks caused by high operating temperatures and mechanical friction.'
    },
    content: {
      id: `Kebocoran oli pada silinder hidrolik lebih dari 80% disebabkan oleh pemilihan material seal yang tidak cocok dengan suhu fluida, jenis pelumas, atau kecepatan gesek rod.

### Perbandingan 3 Material Seal Utama:

1. **Polyurethane (PU / TPU)**:
   - **Ketahanan Tekanan**: Sangat tinggi (mampu menahan hingga 400 Bar tanpa backup ring).
   - **Ketahanan Gesek (Wear Resistance)**: Paling baik dibanding karet konvensional.
   - **Suhu Operasional**: -30°C hingga +90°C.
   - **Aplikasi Terbaik**: Piston seal dan U-cup rod seal silinder hidrolik standar alat berat dan mesin pabrik.

2. **Nitrile Butadiene Rubber (NBR)**:
   - **Ketahanan Tekanan**: Sedang (hingga 160 Bar dengan backup ring).
   - **Kompatibilitas Fluida**: Sangat baik dengan oli mineral berbasis minyak bumi, air, dan gemuk.
   - **Suhu Operasional**: -25°C hingga +100°C.
   - **Aplikasi Terbaik**: O-ring statis, silinder pneumatik standar, dan wiper dust seal.

3. **Fluoroelastomer (FKM / Viton®)**:
   - **Ketahanan Suhu**: Luar biasa tinggi (tahan hingga +200°C berkelanjutan).
   - **Ketahanan Kimia**: Kebal terhadap oli sintetis agresif, ester fosfat (skydrol), dan bahan kimia industri.
   - **Kelemahan**: Ketahanan gesek mekanis lebih rendah dibanding PU pada tekanan sangat tinggi.
   - **Aplikasi Terbaik**: Silinder industri peleburan baja (steel mill), pabrik kaca, boiler, dan industri kimia.

Di BELSA, semua seri silinder (seperti BMG140, BMG210, dan ACI) menyediakan opsi upgrade seal FKM (Viton) tahan panas secara langsung pada kode pemesanan.`,
      en: `More than 80% of hydraulic cylinder fluid leakage is directly attributable to improper seal material selection relative to fluid temperature, lubricant type, or rod velocity.

### Comparison of the 3 Primary Industrial Seal Materials:

1. **Polyurethane (PU / TPU)**:
   - **Pressure Rating**: Superior (withstands up to 400 Bar without anti-extrusion backup rings).
   - **Mechanical Wear Resistance**: Highest among elastomeric seals, resilient against abrasive grit.
   - **Operating Temperature Range**: -30°C to +90°C.
   - **Primary Application**: Dynamic piston seals and U-cup rod seals for standard industrial machinery and earthmoving equipment.

2. **Nitrile Butadiene Rubber (NBR)**:
   - **Pressure Rating**: Moderate (up to 160 Bar when paired with backup rings).
   - **Fluid Compatibility**: Exceptional with petroleum-based mineral oils, water, and greases.
   - **Operating Temperature Range**: -25°C to +100°C.
   - **Primary Application**: Static O-rings, standard pneumatic cylinders, and elastomer wiper dust seals.

3. **Fluoroelastomer (FKM / Viton®)**:
   - **Temperature Capability**: Outstanding (continuous duty up to +200°C).
   - **Chemical Resistance**: Immune to synthetic lubricants, phosphate esters (Skydrol), acids, and industrial chemicals.
   - **Trade-off**: Lower mechanical tear resistance compared to PU under extreme pressure cycling.
   - **Primary Application**: Cylinders in steel rolling mills, glass manufacturing, boilers, foundries, and chemical processing plants.

At BELSA, every cylinder series (such as BMG140, BMG210, and ACI) offers an optional factory-installed FKM (Viton) seal kit upgrade directly selectable in the model code.`
    },
    date: '2026-11-01',
    readTime: '4 min baca',
    image: '/images/culture_parts_warehouse.webp',
    tags: ['Seal Kit', 'Viton', 'Polyurethane', 'Maintenance']
  },
  {
    id: 'hydraulic-troubleshooting-leak',
    slug: 'penyebab-silinder-hidrolik-bocor-cara-mengatasi',
    category: 'Troubleshooting & Maintenance',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Penyebab Utama Kebocoran Silinder Hidrolik & Solusi Perbaikan Overhaul',
      en: 'Primary Causes of Hydraulic Cylinder Leakage & Overhaul Repair Solutions'
    },
    summary: {
      id: 'Identifikasi gejala kebocoran eksternal (rod seal bocor) vs kebocoran internal (drift/piston seal bypass) dan langkah rekondisi silinder hidrolik pabrik.',
      en: 'Troubleshooting external rod leaks and internal piston bypass drift on industrial hydraulic cylinders with overhaul guidelines.'
    },
    content: {
      id: `Silinder hidrolik yang mengalami kebocoran menyebabkan penurunan efisiensi mesin, pemborosan oli, bahaya keselamatan kerja, dan risiko terhentinya lini produksi pabrik (downtime).

### 1. Kebocoran Eksternal (Oli Menetes di Rod Silinder)
- **Penyebab**:
  - Goresan atau pitting pada batang piston rod akibat debu tajam yang lolos dari wiper seal.
  - Bending (kelurusan rod bengkok) akibat beban samping (side load).
  - Seal rod mengeras atau getas karena suhu oli melebihi batas desain.
- **Solusi**:
  - Lakukan hard chrome re-plating dan grinding rod ke toleransi f7.
  - Ganti rod seal kit dengan material bertoleransi suhu lebih tinggi.

### 2. Kebocoran Internal (Bypass / Piston Drift)
- **Gejala**: Silinder tidak mampu menahan beban dan perlahan turun sendiri (drift) meskipun valve kontrol dalam posisi terkunci.
- **Penyebab**:
  - Dinding tabung pipa honing tergores akibat partikel gram logam dalam oli.
  - Seal piston robek atau aus akibat gesekan kering.
- **Solusi**:
  - Lakukan inspeksi visual ke dalam tabung silinder. Jika goresan dalam, workshop BELSA dapat melakukan re-honing atau mengganti tube dengan ST52 baru.
  - Kuras oli dan pasang filter hidrolik BELSA untuk memastikan kontaminasi partikel di bawah standar ISO 4406.

Untuk konsultasi rekondisi atau pembuatan silinder pengganti darurat, hubungi tim teknis di [Kontak Kami](/contact-us).`,
      en: `Hydraulic cylinder leakage degrades mechanical efficiency, contaminates production environments, wastes expensive hydraulic oil, and risks catastrophic factory breakdown downtime.

### 1. External Leakage (Fluid Weeping or Dripping at the Piston Rod)
- **Root Causes**:
  - Scoring or micro-pitting on the hard chrome rod surface caused by airborne contaminants bypassing a worn wiper seal.
  - Rod deflection or bending caused by uncorrected lateral side loading.
  - Rod seal embrittlement or hardening from oil operating temperatures exceeding material limits.
- **Remedies**:
  - Re-chrome and precision-grind the rod back to ISO f7 tolerance.
  - Upgrade rod seals to high-temperature FKM or dual-lip polyurethane configurations.

### 2. Internal Leakage (Piston Bypass Drift)
- **Symptom**: The cylinder fails to hold its position and slowly creeps or drifts under load even when directional valves are locked in neutral.
- **Root Causes**:
  - Longitudinal scoring on the inner honed tube wall caused by metallic wear debris circulating in the oil.
  - Piston seal rupture, extrusion, or permanent compression set from dry friction.
- **Remedies**:
  - Perform bore boroscope inspection. For deep scores, the BELSA workshop performs precision re-honing or replaces the tube with new ST52 honed stock.
  - Flush the circuit and install BELSA pressure line filters to maintain particulate cleanliness below ISO 4406 standards.

For emergency overhaul consultation or bespoke replacement cylinders, reach our engineering team via [Contact Us](/contact-us).`
    },
    date: '2026-10-28',
    readTime: '5 min baca',
    image: '/images/facility_metrology_inspection.webp',
    tags: ['Troubleshooting', 'Maintenance', 'Overhaul', 'Silinder Hidrolik']
  },
  {
    id: 'hydraulic-hose-selection',
    slug: 'panduan-memilih-selang-hidrolik-sae-100-r1-r2-4sp',
    category: 'Hose & Fittings',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Klasifikasi Selang Hidrolik SAE 100 R1AT, R2AT, 4SP, dan 4SH Sesuai Tekanan Kerja',
      en: 'Classification of Hydraulic Hoses SAE 100 R1AT, R2AT, 4SP, and 4SH by Working Pressure'
    },
    summary: {
      id: 'Panduan standar kawat anyam (wire braid) vs spiral kawat baja (wire spiral) pada selang hidrolik bertekanan tinggi untuk mencegah ledakan selang (hose bursting).',
      en: 'Technical guide on selecting wire braid vs wire spiral high pressure hydraulic hoses to prevent catastrophic bursting under extreme pressure.'
    },
    content: {
      id: `Memilih selang hidrolik tidak boleh hanya berdasarkan diameter dalam (ID). Tekanan kerja dinamis (Dynamic Working Pressure) dan siklus impuls lonjakan tekanan harus dihitung secara teliti.

### Klasifikasi Konstruksi Selang Hidrolik:
1. **SAE 100 R1AT (1SN)**:
   - Konstruksi: 1 lapis anyaman kawat baja tarik tinggi (Single Wire Braid).
   - Penggunaan: Saluran tekanan rendah hingga sedang (hingga 225 Bar pada ukuran kecil).
   - Kelebihan: Sangat lentur, radius belok (bend radius) kecil.
2. **SAE 100 R2AT (2SN)**:
   - Konstruksi: 2 lapis anyaman kawat baja (Double Wire Braid).
   - Penggunaan: Standar umum saluran utama mesin pabrik dan alat konstruksi (hingga 400 Bar).
3. **EN 856 4SP & 4SH (Multi-Spiral)**:
   - Konstruksi: 4 lapis spiral kawat baja berkekuatan tinggi berselang-seling.
   - Penggunaan: Saluran dengan impuls tekanan kejut ekstrem (surge pressure), seperti mesin press hidrolik besar, crusher, dan injeksi plastik.
   - Kelebihan: Tahan terhadap kelelahan impuls (impulse fatigue) hingga jutaan siklus kerja.

Workshop BELSA menyediakan perakitan selang hidrolik lengkap dengan crimping fitting presisi dan pengetesan uji hidrostatik. Kunjungi katalog selang di [Selang Hidrolik Industri](/products/selang-hidrolik-industri).`,
      en: `Selecting hydraulic hose assemblies solely by inside diameter (ID) is a critical error. Dynamic working pressure, peak impulse surges, and minimum bend radii must all be factored into the engineering specification.

### Industry Hose Construction Classifications:
1. **SAE 100 R1AT (1SN)**:
   - Construction: Single high-tensile steel wire braid reinforcement.
   - Application: Low-to-medium pressure return lines and auxiliary pilot circuits (up to 225 Bar for small bores).
   - Key Advantage: High flexibility, compact outer diameter, and tight bend radius.
2. **SAE 100 R2AT (2SN)**:
   - Construction: Two braids of high-tensile steel wire.
   - Application: The universal standard for primary plant machinery and mobile hydraulic circuits (up to 400 Bar).
3. **EN 856 4SP & 4SH (Multi-Spiral Steel Wire)**:
   - Construction: Four alternating spiral layers of heavy-gauge high-tensile steel wire.
   - Application: Heavy-duty circuits subjected to severe pressure spikes and repetitive shock loading, such as forging presses, rock crushers, injection molding machines, and mining equipment.
   - Key Advantage: Unmatched resistance to impulse fatigue over millions of operational pressure cycles.

The BELSA workshop supplies custom crimped hydraulic hose assemblies complete with certified hydrostatic test pressure reports. Explore our full line at [Industrial Hydraulic Hoses](/products/selang-hidrolik-industri).`
    },
    date: '2026-10-22',
    readTime: '4 min baca',
    image: '/images/facility_hose_warehouse.webp',
    tags: ['Selang Hidrolik', 'Fittings', 'Tekanan Tinggi', 'SAE 100']
  },
  {
    id: 'hpu-sizing-reservoir-pump',
    slug: 'panduan-menghitung-kapasitas-tangki-pompa-hydraulic-power-unit-hpu',
    category: 'Hydraulic Engineering',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Panduan Menghitung Kapasitas Tangki & Flow Rate Pompa pada Hydraulic Power Unit (HPU)',
      en: 'Engineering Guide: Sizing Hydraulic Reservoir Capacity and Pump Flow Rate for HPUs'
    },
    summary: {
      id: 'Pedoman teknis menentukan ukuran tangki oli (rule of thumb 3-5x flow rate), pemilihan pompa hidrolik (gear vs piston pump), efisiensi disipasi panas, dan fungsi baffle plate pada unit HPU industri.',
      en: 'Technical rules of thumb for sizing hydraulic oil reservoirs (3-5x pump flow rate), pump selection (gear vs piston), thermal dissipation, and baffle plate integration for industrial HPUs.'
    },
    content: {
      id: `Hydraulic Power Unit (HPU) adalah jantung dari sistem hidrolik industri yang bertugas menyuplai fluida bertekanan ke seluruh aktuator silinder dan motor hidrolik. Kesalahan dalam menentukan ukuran tangki oli (reservoir) dan kapasitas pompa dapat memicu overheating, kavitasi pompa, dan degradasi oli secara cepat.

### 1. Aturan Penentuan Kapasitas Tangki Oli (Reservoir Sizing):
Standar perancangan industri menggunakan aturan praktis (*rule of thumb*):
\`\`\`
Volume Tangki Minimal (Liter) = 3 s.d. 5 × Debit Pompa (Liter per Menit / LPM)
\`\`\`
*Contoh*: Jika pompa hidrolik Anda memiliki flow rate 30 LPM, maka volume oli efektif yang disarankan adalah minimal **90 hingga 150 Liter**.

Mengapa tangki harus cukup besar?
- **Pelepas Panas (Heat Dissipation)**: Memberikan waktu yang cukup bagi oli yang panas setelah bersirkulasi di aktuator untuk mendingin sebelum dihisap kembali.
- **Pelepasan Udara & Busa (Deaeration)**: Memungkinkan gelembung udara naik ke permukaan dan lepas, mencegah kavitasi pompa.
- **Pengendapan Kotoran (Sedimentation)**: Partikel mikro aus memiliki kesempatan mengendap di dasar tangki sebelum melewati suction strainer.

### 2. Fitur Kritis di Dalam Tangki HPU Standar BELSA:
- **Baffle Plate (Pelat Penyekat)**: Memisahkan kompartemen *suction* (hisap) dan *return* (kembali). Oli dipaksa mengalir memutar mengitari baffle, memaksimalkan disipasi panas dan mencegah oli berbusa langsung dihisap kembali.
- **Level Gauge & Temperature Sensor**: Indikator ketinggian oli terintegrasi dengan termometer untuk monitoring visual suhu operasi (standar ideal: 45°C - 55°C).
- **Return Line Diffuser & Magnet Plug**: Mengurangi turbulensi fluida dan menangkap serpihan logam magnetik di dasar tangki.

### 3. Pemilihan Pompa: Gear Pump vs Vane Pump vs Piston Pump:
- **External Gear Pump**: Ekonomis, toleran terhadap kontaminasi ringan, tekanan kerja hingga 210 Bar. Sangat cocok untuk HPU mesin press ringan, lifter, dan power pack standar.
- **Variable Displacement Piston Pump**: Efisiensi energi tertinggi (aliran berkurang saat tekanan tercapai/pressure compensated), mampu menahan tekanan tinggi hingga 350 Bar. Wajib untuk sistem kontinyu tugas berat seperti pabrik peleburan baja dan mesin injeksi plastik.

Butuh HPU kustom dengan desain sesuai kapasitas daya listrik dan ruang pabrik Anda? Konsultasikan bersama [Tim Engineering BELSA](/contact-us).`,
      en: `A Hydraulic Power Unit (HPU) serves as the heart of any industrial hydraulic system, converting electrical or mechanical power into controlled hydraulic fluid power. Miscalculating reservoir capacity or pump flow rate inevitably induces rapid fluid overheating, pump cavitation, and premature component destruction.

### 1. Reservoir Sizing Rules of Thumb:
The proven industry standard for continuous industrial stationary systems specifies:
\`\`\`
Minimum Reservoir Volume (Liters) = 3 to 5 × Pump Output Flow (Liters per Minute / LPM)
\`\`\`
*Example*: For a pump delivering 30 LPM, the active fluid reservoir should hold at least **90 to 150 Liters**.

Why is adequate reservoir sizing vital?
- **Thermal Dissipation**: Provides sufficient dwell time for returning heated oil to radiate heat through the steel tank walls before re-entering suction lines.
- **Air Separation (Deaeration)**: Allows entrained micro-air bubbles to rise and release, safeguarding the pump from catastrophic cavitation shock.
- **Contaminant Settling**: Enables heavy wear particles to settle safely on the tank bottom prior to filtration.

### 2. Critical Internal Tank Features on BELSA HPUs:
- **Internal Baffle Plate**: Divides the tank longitudinally between the suction intake and return line. Returning fluid is forced to circulate along tank walls, optimizing thermal conduction and eliminating turbulence.
- **Level & Temperature Gauge**: Integrated visual glass column with built-in bimetallic dial thermometer (recommended target operating window: 45°C - 55°C).
- **Return Line Diffusers & Magnetic Drain Plugs**: Slows fluid discharge velocity below 1.5 m/s and traps ferrous particulate at the tank basin.

### 3. Pump Technology Selection:
- **External Gear Pumps**: Cost-effective, robust against mild contamination, operating pressures up to 210 Bar. Ideal for intermittent scissor lifts, log splitters, and workshop clamping fixtures.
- **Axial Piston Pumps (Pressure Compensated)**: Superior energy efficiency (de-strokes flow upon reaching target pressure without venting over a relief valve), handling working pressures up to 350 Bar. Essential for continuous-duty steel mill machines, stamping presses, and heavy plastic extrusion lines.

Request custom HPU CAD modeling and fabrication engineering at [Contact BELSA](/contact-us).`
    },
    date: '2026-10-18',
    readTime: '6 min baca',
    image: '/images/facility_workshop_machining_fleet.webp',
    tags: ['HPU', 'Power Unit', 'Tangki Hidrolik', 'Pompa Hidrolik', 'Flow Rate']
  },
  {
    id: 'cylinder-force-thrust-pull-calculation',
    slug: 'cara-menghitung-gaya-dorong-tarik-silinder-hidrolik-pneumatik',
    category: 'Calculation & Sizing',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Cara Menghitung Gaya Dorong (Thrust) & Gaya Tarik (Pull Force) Silinder Sesuai Tekanan Kerja',
      en: 'How to Calculate Push (Thrust) and Pull Force for Hydraulic and Pneumatic Cylinders'
    },
    summary: {
      id: 'Rumus praktis menghitung gaya dorong (advance) dan gaya tarik (retract) silinder berdasarkan diameter bore, diameter piston rod, dan tekanan fluida, serta faktor beban dinamis (load ratio).',
      en: 'Practical formulas for computing cylinder push (advance) and pull (retract) force using bore diameter, rod diameter, and fluid pressure with industrial dynamic load ratio guidelines.'
    },
    content: {
      id: `Sering terjadi kasus di lapangan di mana silinder hidrolik atau pneumatik gagal mengangkat beban atau bergerak tersendat (*stalling*). Masalah ini umumnya terjadi karena perancang hanya menghitung beban statis tanpa mempertimbangkan pengurangan luas area batang rod (*annulus area*) serta rasio beban dinamis (*load ratio*).

### 1. Rumus Gaya Dorong Piston (Thrust / Extension Force):
Saat silinder mendorong keluar (ekstensi), seluruh permukaan piston terkena tekanan fluida:
\`\`\`
F_dorong (Newton) = P (Pascal) × A_piston (m²)
\`\`\`
Atau dalam satuan industri praktis (Bar dan cm):
\`\`\`
F_dorong (kgf) = Tekanan (Bar) × [π × (D_bore / 2)² / 10]
\`\`\`
*Contoh*: Silinder dengan Bore Ø100 mm pada tekanan hidrolik 140 Bar:
- Luas Piston = π × 5² = 78.54 cm²
- Gaya Dorong Teoretis = 140 Bar × 78.54 cm² ≈ **10,995 kgf (± 11 Ton)**.

### 2. Rumus Gaya Tarik Piston (Pull / Retraction Force):
Saat silinder menarik kembali (retraksi), volume fluida berkurang karena adanya batang piston rod yang memakan ruang:
\`\`\`
A_efektif_tarik = A_piston - A_rod
F_tarik (kgf) = Tekanan (Bar) × [A_piston - A_rod]
\`\`\`
*Contoh*: Jika silinder bore Ø100 mm di atas menggunakan Rod Ø50 mm:
- Luas Rod = π × 2.5² = 19.63 cm²
- Luas Efektif Tarik = 78.54 - 19.63 = 58.91 cm²
- Gaya Tarik Teoretis = 140 Bar × 58.91 cm² ≈ **8,247 kgf (± 8.2 Ton)**.
*Perhatikan: Gaya tarik selalu lebih kecil sekitar 20% - 35% dibandingkan gaya dorong!*

### 3. Faktor Beban Kerja Dinamis (Load Ratio Sizing):
Jangan pernah mendesain silinder bekerja pada kapasitas teoretis 100%! Gesekan internal seal (*breakaway friction*) dan inersia akselerasi memerlukan cadangan gaya (*safety margin*):
- **Beban Lambat / Klem Statis**: Gunakan Load Ratio 70% (Gaya Desain = Beban Aktual / 0.70).
- **Kecepatan Standar (100 - 300 mm/s)**: Gunakan Load Ratio 50% (Gaya Desain = 2× Beban Aktual).
- **Kecepatan Tinggi (> 500 mm/s)**: Gunakan Load Ratio 30% - 40% untuk mencegah hentakan ekstrem di akhir langkah.

Hitung kapasitas gaya dan kebutuhan volume silinder mesin Anda secara instan di [Kalkulator Teknis BELSA](/calculator).`,
      en: `A recurring failure mode in industrial machinery is cylinder stalling or intermittent stick-slip motion. This almost always stems from sizing cylinders against bare static loads without compensating for rod annulus area reductions and dynamic load ratio requirements.

### 1. Piston Extension Force (Push / Thrust):
During the extension stroke, working fluid pressurizes the full face of the piston crown:
\`\`\`
F_push (Newtons) = Pressure (Pascals) × Piston Area (m²)
\`\`\`
In practical plant metric units (Bar and cm):
\`\`\`
F_push (kgf) = Pressure (Bar) × [π × (D_bore / 2)² / 10]
\`\`\`
*Example*: A cylinder with Bore Ø100 mm operated at 140 Bar hydraulic pressure:
- Piston Area = π × 5² = 78.54 cm²
- Theoretical Push Force = 140 Bar × 78.54 cm² ≈ **10,995 kgf (approx. 11 Metric Tons)**.

### 2. Piston Retraction Force (Pull / Annulus Force):
During the return stroke, fluid acts only upon the annular ring surrounding the chrome rod:
\`\`\`
Net Retract Area = Piston Area - Rod Area
F_pull (kgf) = Pressure (Bar) × [A_piston - A_rod]
\`\`\`
*Example*: With the same Ø100 mm bore paired with an Ø50 mm rod:
- Rod Cross Section = π × 2.5² = 19.63 cm²
- Net Retract Area = 78.54 - 19.63 = 58.91 cm²
- Theoretical Pull Force = 140 Bar × 58.91 cm² ≈ **8,247 kgf (approx. 8.2 Metric Tons)**.
*Crucial takeaway: Cylinder pull capacity is universally 20% to 35% lower than push force!*

### 3. Dynamic Load Ratio & Engineering Safety Sizing:
Never size a cylinder at 100% theoretical force output. Seal breakout friction and inertial acceleration forces demand strategic sizing reserves:
- **Static Clamping / Slow Positioning**: Use a 70% Load Ratio (Design Force = Target Load / 0.70).
- **Standard Velocity (100 - 300 mm/s)**: Use a 50% Load Ratio (Design Force = 2× Target Load).
- **High-Speed Pneumatics (> 500 mm/s)**: Limit load ratio to 30% - 40% to prevent excessive kinetic impact at end-of-stroke cushioning.

Calculate exact cylinder thrust, pull, and volume requirements instantly using the [BELSA Engineering Calculator](/calculator).`
    },
    date: '2026-10-15',
    readTime: '5 min baca',
    image: '/images/facility_material_warehouse.webp',
    tags: ['Kalkulasi Gaya', 'Bore & Stroke', 'Thrust Force', 'Pull Force', 'Silinder Industri']
  },
  {
    id: 'hard-chrome-plating-salt-spray-standards',
    slug: 'standar-hard-chrome-plating-uji-salt-spray-batang-rod-silinder',
    category: 'Manufacturing & Quality',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Standar Ketebalan Hard Chrome Plating & Uji Salt Spray pada Batang Rod Silinder Hidrolik',
      en: 'Hard Chrome Plating Thickness Standards and Salt Spray Corrosion Testing for Hydraulic Cylinder Rods'
    },
    summary: {
      id: 'Pentingnya ketebalan lapisan Hard Chrome 20-30 mikron dengan kekerasan min 65 HRC dan uji korosi kabut garam (Salt Spray Test ASTM B117) untuk menjamin keawetan silinder di lingkungan keras.',
      en: 'The critical role of 20-30 micron Hard Chrome electroplating at 65+ HRC hardness and ASTM B117 neutral salt spray corrosion testing to prevent rod pitting in abrasive operating environments.'
    },
    content: {
      id: `Piston rod (batang as silinder) adalah komponen dinamis yang langsung terpapar dengan lingkungan luar pabrik: debu abrasif, kelembapan asam, cipratan air pendingin, hingga benturan mekanis. Lapisan Hard Chrome bukan sekadar pemanis visual, melainkan pelindung utama yang menjaga seal hidrolik dari keausan prematur.

### 1. Spesifikasi Teknis Hard Chrome Rod Standar BELSA:
- **Material Inti (Base Steel)**: Menggunakan baja karbon kualitas tinggi DIN CK45, C45E, atau baja paduan 42CrMo4 untuk aplikasi beban kejut ekstrem.
- **Ketebalan Lapisan Chrome (Plating Thickness)**: Minimal 20 µm hingga 30 µm (mikron) terdistribusi merata di seluruh keliling as.
- **Tingkat Kekerasan Permukaan (Surface Hardness)**: Minimum **65 HRC s.d. 70 HRC (HV 850 - 1000)**, sangat tahan terhadap goresan partikel gram logam dan pasir silika.
- **Kekasaran Permukaan (Surface Roughness)**: Ra ≤ 0.2 µm, Rz ≤ 1.6 µm melalui proses *micro-finish centerless grinding* dan *super-finishing polish*. Permukaan super halus ini penting agar bibir seal tidak terkelupas saat rod bergerak cepat.

### 2. Pengujian Ketahanan Korosi: Salt Spray Test (ASTM B117 / ISO 9227):
Titik korosi mikro (*pitting*) pada batang rod adalah penyebab nomor 1 kebocoran seal hidrolik. Sebelum dipasang pada silinder seri BELSA (BMG, NMC, ACI), batang rod diuji di dalam *Salt Spray Chamber* dengan kabut garam 5% NaCl pada suhu 35°C:
- **Standar Normal**: Lolos uji kabut garam minimal 96 jam tanpa timbul bintik karat (Rating 9 menurut ISO 10289).
- **Grade Heavy-Duty / Marine**: Batang rod dengan perlakuan *Induction Hardening* dan *Double Chrome Plating* mampu bertahan hingga **200 s.d. 500 jam Salt Spray**, direkomendasikan untuk pabrik kelapa sawit, industri pupuk, pelabuhan, dan area pesisir.

### 3. Tips Mencegah Kerusakan Rod di Lapangan:
1. Pasang *protective bellows / rod boots* jika silinder dipasang di dekat hopper semen, debu batu bara, atau serbuk kayu.
2. Jangan biarkan silinder terparkir dalam posisi rod menjulur keluar (*fully extended*) dalam jangka waktu lama saat mesin *shut down*.
3. Periksa dan ganti seal wiper (*dust seal*) setiap kali melakukan servis rutin.

Butuh batang rod custom dengan material khusus stainless steel AISI 304/316 atau induction hardened? Hubungi tim [Fabrikasi BELSA](/contact-us).`,
      en: `The cylinder piston rod is a critical dynamic member continuously exposed to hostile ambient factory environments: abrasive dust, caustic fumes, cutting fluids, and incidental mechanical shock. Hard Chrome plating is far from cosmetic—it is an engineered barrier protecting hydraulic seals from destructive micro-abrasion.

### 1. BELSA Precision Hard Chrome Rod Standards:
- **Base Substrate**: Precision-drawn DIN CK45 / C45E carbon steel, or 42CrMo4 high-tensile alloy steel for shock-loaded hydraulic applications.
- **Chrome Plating Thickness**: Minimum 20 µm to 30 µm (microns) uniformly deposited around the circumference.
- **Surface Hardness**: Minimum **65 HRC to 70 HRC (HV 850 - 1000)**, imparting exceptional defense against airborne silica, slag, and metal particulate scratching.
- **Surface Roughness**: Ra ≤ 0.2 µm, Rz ≤ 1.6 µm achieved through multi-stage centerless grinding and mirror-polishing. This micro-finish creates an ideal hydrodynamic fluid film without tearing elastomeric seal lips.

### 2. Corrosion Testing: Neutral Salt Spray (ASTM B117 / ISO 9227):
Microscopic corrosion pitting on a piston rod operates like a razor blade against dynamic seals. Before assembly into BELSA hydraulic and pneumatic cylinders, rod stock undergoes rigorous accelerated testing in a salt spray chamber (5% NaCl fog at 35°C):
- **Standard Industrial Line**: Minimum 96 hours continuous exposure without pitting corrosion (ISO 10289 Rating 9).
- **Marine & Aggressive Duty Line**: Induction hardened rods with dual-layer micro-crack chrome plating achieving **200 to 500+ hours Salt Spray Endurance**, specified for offshore cranes, fertilizer plants, palm oil mills, and coastal facilities.

### 3. Factory Best Practices for Rod Preservation:
1. Install flexible elastomeric rod protective boots (bellows) in areas with falling fly ash, cement clinker, or blast furnace slag.
2. Avoid leaving hydraulic cylinders parked in a fully extended stroke state during protracted plant shutdowns.
3. Periodically inspect and replace the rod wiper (scraper) seal before particulate breaches the front gland bushing.

Explore bespoke chrome rod fabrication or induction hardening solutions at [BELSA Engineering](/contact-us).`
    },
    date: '2026-10-11',
    readTime: '5 min baca',
    image: '/images/facility_cnc_mazak.webp',
    tags: ['Hard Chrome', 'Piston Rod', 'Salt Spray Test', 'Korosi', 'ASTM B117']
  },
  {
    id: 'hydraulic-solenoid-valve-symbols-center',
    slug: 'cara-membaca-simbol-solenoid-directional-valve-hidrolik-spool-center',
    category: 'Process Valve & Automation',
    author: 'Tim Engineering BELSA',
    title: {
      id: 'Cara Membaca Simbol Diagram Solenoid Valve Hidrolik 4/3 & 4/2 Way Spool Center',
      en: 'How to Read Hydraulic 4/3 and 4/2 Way Solenoid Directional Valve Symbols and Center Conditions'
    },
    summary: {
      id: 'Panduan membaca diagram skematik simbol katup pengarah ISO 1219, port P-T-A-B, dan perbedaan karakteristik spool All-Blocked (Closed Center), Open Center, Tandem, dan Float Center.',
      en: 'A comprehensive guide to interpreting ISO 1219 hydraulic directional control valve schematics, port designations (P, T, A, B), and practical differences between Open, Closed, Tandem, and Float center spools.'
    },
    content: {
      id: `Solenoid Directional Control Valve (seperti seri BELSA B4WE6 dan B4WE10) bertugas mengarahkan aliran oli untuk memajukan, memundurkan, atau mengunci posisi silinder hidrolik. Memahami diagram simbol skematik standar ISO 1219 adalah keahlian wajib bagi teknisi mesin pabrik.

### 1. Nomenklatur Jalur & Posisi Valve (Contoh: 4/3 Way):
- **Angka Pertama (4 Jalur / Port)**:
  - **P (Pressure)**: Jalur masuk oli bertekanan dari pompa.
  - **T (Tank)**: Jalur buang oli kembali ke tangki.
  - **A & B (Work Ports)**: Dua jalur kerja yang terhubung ke sisi silinder (cap end dan rod end).
- **Angka Kedua (3 Posisi)**:
  - Kotak Kiri (Posisi a): Mengarahkan P ke A dan B ke T (Silinder maju).
  - Kotak Tengah (Posisi Netral 0): Kondisi saat kedua solenoid mati (de-energized) dipegang oleh pegas (spring centered).
  - Kotak Kanan (Posisi b): Mengarahkan P ke B dan A ke T (Silinder mundur).

### 2. Perbedaan 4 Tipe Spool Center (Kondisi Netral):
Posisi netral (tengah) menentukan perilaku sistem saat mesin berhenti sejenak:

1. **Closed Center (Semua Port Tertutup - Tipe E)**:
   - Simbol: Port P, T, A, dan B terblokir semua di tengah.
   - Fungsi: Menahan posisi silinder di tempatnya (*holding position*) dan mempertahankan tekanan sistem. Umum digunakan pada beberapa sirkuit cabang paralel.
2. **Open Center / Motor Spool (Tipe H)**:
   - Simbol: Semua port P, T, A, dan B saling terhubung ke Tank.
   - Fungsi: Mengalirkan oli pompa langsung kembali ke tangki tanpa beban (menghilangkan panas saat idle) dan membiarkan aktuator bergerak bebas (bebas didorong manual).
3. **Tandem Center (P to T, A & B Blocked - Tipe G)**:
   - Simbol: P langsung terhubung ke T, sedangkan A dan B tertutup rapat.
   - Fungsi: Sangat populer di industri! Pompa dapat membongkar beban (*unloading*) dengan tekanan mendekati 0 Bar saat idle, sementara silinder tetap terkunci kuat menahan beban.
4. **Float Center (P Blocked, A & B to T - Tipe J)**:
   - Simbol: P tertutup rapat, sedangkan saluran silinder A dan B mengalir ke tangki.
   - Fungsi: Digunakan pada motor hidrolik atau mekanisme floating blade (seperti blade buldoser) agar dapat mengikuti kontur permukaan tanpa tekanan hidrolik aktif.

Lihat spesifikasi teknis dan pilihan spool valve directional lengkap di katalog [Process & Directional Valve BELSA](/products/process-valve).`,
      en: `Hydraulic Directional Control Solenoid Valves (such as BELSA B4WE6 and B4WE10 series) govern fluid routing to extend, retract, or hydraulically lock actuators. Interpreting ISO 1219 graphic symbols and spool center conditions is essential for automated machinery design.

### 1. Port and Position Designations (e.g., 4/3-Way Valve):
- **First Digit (4 Ports)**:
  - **P (Pressure Inlet)**: Pressurized fluid supply from the hydraulic pump.
  - **T (Tank Return)**: Low-pressure line returning fluid to the reservoir.
  - **A & B (Work Ports)**: Working service lines plumbed to the cylinder ports (blind end & rod end).
- **Second Digit (3 Envelope Positions)**:
  - Left Box (Position a): Directs P to A, and B to T (Cylinder extends).
  - Center Box (Neutral Position 0): Spring-centered default state when both solenoids are de-energized.
  - Right Box (Position b): Directs P to B, and A to T (Cylinder retracts).

### 2. The 4 Essential Spool Center Configurations:
The center envelope profile dictates circuit behavior whenever the machine pauses:

1. **Closed Center (All Ports Blocked - Spool Symbol E)**:
   - Schematic: P, T, A, and B are completely dead-ended in neutral.
   - Behavior: Hydraulically holds the cylinder firmly under load and maintains circuit pressure. Ideal for multi-valve parallel manifold circuits.
2. **Open Center (All Ports to Tank - Spool Symbol H)**:
   - Schematic: All four lines (P, T, A, B) interconnect freely to Tank.
   - Behavior: Vents pump flow to tank at minimal backpressure while letting the cylinder rod or hydraulic motor rotate/float freely under external loads.
3. **Tandem Center (P-to-T Bypassed, A & B Blocked - Spool Symbol G)**:
   - Schematic: P routes straight to T, while cylinder service lines A & B are hermetically sealed.
   - Behavior: An industrial gold standard. Enables pump unloading at zero workload (eliminating heat generation while idle) while locking the cylinder firmly in place.
4. **Float Center (P Blocked, A & B to Tank - Spool Symbol J)**:
   - Schematic: Pump line P is blocked, while actuator ports A and B drain freely to Tank.
   - Behavior: Crucial for hydraulic motor free-wheeling and floating implements (such as grader blades or snow plows) allowing compliance with surface contours without mechanical binding.

Explore full industrial valve datasheets, coil voltages, and subplate options in the [BELSA Process & Directional Valve Catalogue](/products/process-valve).`
    },
    date: '2026-10-06',
    readTime: '6 min baca',
    image: '/images/facility_production_floor.webp',
    tags: ['Solenoid Valve', 'Directional Valve', 'ISO 1219', 'Spool Center', 'Hidrolik']
  }
];
