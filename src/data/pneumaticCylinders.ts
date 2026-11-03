export interface MountingOption {
  code: string;
  nameId: string;
  nameEn: string;
  desc: string;
}

export interface PneumaticSeriesItem {
  id: string;
  series: string;
  category: string;
  name: string;
  tagline: {
    id: string;
    en: string;
  };
  image: string;
  boreSizes: number[];
  standardStrokes: number[];
  maxStroke: number;
  mountings: MountingOption[];
  hasDoubleRod: boolean;
  bellowsOptions: { code: string; label: string; maxTemp: string }[];
  rodEndOptions: { code: string; label: string }[];
  specs: {
    fluid: string;
    proofPressure: string;
    maxPressure: string;
    minPressure: string;
    tempRange: string;
    speedRange: string;
    cushion: string;
    strokeTolerance: string;
  };
}

export const baselineAirCylinders: PneumaticSeriesItem[] = [
  {
    id: 'mpc1',
    series: 'MPC1',
    category: 'Air Cylinder',
    name: 'MPC1 Series - Medium Pneumatic Cylinder',
    tagline: {
      id: 'Silinder tie rod standar dengan magnet bawaan dan seal non-lubricated.',
      en: 'Most popular industrial tie-rod cylinder with built-in magnet & non-lubricated seals.'
    },
    image: '/images/cat_thumb_mpc1.png',
    boreSizes: [40, 50, 63, 80, 100],
    standardStrokes: [25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000],
    maxStroke: 2950,
    hasDoubleRod: true,
    mountings: [
      { code: 'B', nameId: 'Standard', nameEn: 'Standard (Basic)', desc: 'Mounting dasar tanpa braket tambahan' },
      { code: 'LB', nameId: 'Foot Mounting', nameEn: 'Foot Mounting', desc: 'Dudukan kaki di kedua ujung silinder' },
      { code: 'FA', nameId: 'Front Flange (Rod Side)', nameEn: 'Rod Side Flange', desc: 'Flange di sisi rod' },
      { code: 'FB', nameId: 'Rear Flange (Head Side)', nameEn: 'Head Side Flange', desc: 'Flange di sisi belakang silinder' },
      { code: 'CA', nameId: 'Single Clevis', nameEn: 'Single Clevis', desc: 'Clevis tunggal di sisi belakang' },
      { code: 'CB', nameId: 'Double Clevis', nameEn: 'Double Clevis', desc: 'Clevis ganda dengan pin' },
      { code: 'TC', nameId: 'Center Trunnion', nameEn: 'Center Trunnion', desc: 'Trunnion di bagian tengah bodi silinder' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
      { code: 'J', label: 'Nylon Tarpaulin (Standar)', maxTemp: 'Max 60°C' },
      { code: 'K', label: 'Neoprene Cloth (Tahan Panas)', maxTemp: 'Max 110°C' },
    ],
    rodEndOptions: [
      { code: '', label: 'Rod End Nut Standard (1 pc)' },
      { code: 'I', label: 'Single Knuckle Joint' },
      { code: 'Y', label: 'Double Knuckle Joint' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.5 MPa (15 kgf/cm²)',
      maxPressure: '0.99 MPa (9.9 kgf/cm²)',
      minPressure: '0.05 MPa (0.5 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 600 mm/sec',
      cushion: 'Air Cushion kedua sisi (dengan bantalan karet)',
      strokeTolerance: '~1000mm ST: +1.4/0, >1000mm: +1.8/0'
    }
  },
  {
    id: 'lpc1',
    series: 'LPC1',
    category: 'Air Cylinder',
    name: 'LPC1 Series - Large Bore Cylinder',
    tagline: {
      id: 'Silinder bore besar Ø125 - Ø300 mm untuk beban berat dan aplikasi struktural.',
      en: 'Large-bore cylinder Ø125 - Ø300 mm for severe mechanical and structural loads.'
    },
    image: '/images/cat_thumb_lpc1.png',
    boreSizes: [125, 140, 150, 160, 180, 200, 250, 300],
    standardStrokes: [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 1000],
    maxStroke: 2950,
    hasDoubleRod: true,
    mountings: [
      { code: 'B', nameId: 'Standard', nameEn: 'Standard (Basic)', desc: 'Mounting dasar' },
      { code: 'LB', nameId: 'Foot Mounting', nameEn: 'Foot Mounting', desc: 'Dudukan kaki' },
      { code: 'FA', nameId: 'Front Flange (Rod Side)', nameEn: 'Rod Side Flange', desc: 'Flange sisi depan' },
      { code: 'FB', nameId: 'Rear Flange (Head Side)', nameEn: 'Head Side Flange', desc: 'Flange sisi belakang' },
      { code: 'CA', nameId: 'Single Clevis', nameEn: 'Single Clevis', desc: 'Clevis tunggal' },
      { code: 'CB', nameId: 'Double Clevis', nameEn: 'Double Clevis', desc: 'Clevis ganda' },
      { code: 'TC', nameId: 'Center Trunnion', nameEn: 'Center Trunnion', desc: 'Trunnion tengah' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
      { code: 'J', label: 'Nylon Tarpaulin', maxTemp: 'Max 60°C' },
      { code: 'K', label: 'Neoprene Tahan Panas', maxTemp: 'Max 110°C' },
    ],
    rodEndOptions: [
      { code: '', label: 'Rod End Nut Standard' },
      { code: 'I', label: 'Single Knuckle Joint' },
      { code: 'Y', label: 'Double Knuckle Joint' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.5 MPa (15 kgf/cm²)',
      maxPressure: '0.99 MPa (9.9 kgf/cm²)',
      minPressure: '0.05 MPa (0.5 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 500 mm/sec',
      cushion: 'Air Cushion kedua sisi',
      strokeTolerance: 'KS Class 2 Standard'
    }
  },
  {
    id: 'ncr',
    series: 'NCR',
    category: 'Air Cylinder',
    name: 'NCR Series - Round Body Cylinder',
    tagline: {
      id: 'Silinder bodi bulat dengan tabung aluminium. Ringkas dan ringan.',
      en: 'Round body aluminum cylinder with streamlined design and lightweight profile.'
    },
    image: '/images/cat_thumb_ncr.png',
    boreSizes: [50, 63, 80, 100],
    standardStrokes: [25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500],
    maxStroke: 1500,
    hasDoubleRod: false,
    mountings: [
      { code: 'B', nameId: 'Basic', nameEn: 'Basic Threaded', desc: 'Dipasang dengan ulir di sisi depan dan belakang' },
      { code: 'LB', nameId: 'Foot Mounting', nameEn: 'Foot Mounting', desc: 'Braket kaki samping' },
      { code: 'FA', nameId: 'Front Flange', nameEn: 'Front Flange', desc: 'Plat flange depan' },
      { code: 'FB', nameId: 'Rear Flange', nameEn: 'Rear Flange', desc: 'Plat flange belakang' },
      { code: 'CB', nameId: 'Double Clevis', nameEn: 'Double Clevis', desc: 'Clevis ganda di sisi belakang' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
      { code: 'J', label: 'Nylon Tarpaulin', maxTemp: 'Max 60°C' },
    ],
    rodEndOptions: [
      { code: '', label: 'Standard Nut (1 pc)' },
      { code: 'I', label: 'Single Knuckle' },
      { code: 'Y', label: 'Double Knuckle' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.5 MPa (15 kgf/cm²)',
      maxPressure: '0.99 MPa (9.9 kgf/cm²)',
      minPressure: '0.05 MPa (0.5 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 600 mm/sec',
      cushion: 'Rubber Bumper Cushion',
      strokeTolerance: '~1000mm ST: +1.4/0, 1001~1500mm: +1.8/0'
    }
  },
  {
    id: 'rc_rmc',
    series: 'RC / RMC',
    category: 'Air Cylinder',
    name: 'RC/RMC Series - Compact Short-Stroke Cylinder',
    tagline: {
      id: 'Silinder kompak untuk ruang pasang terbatas, misalnya clamping, punching, dan press stroke pendek.',
      en: 'Compact short-stroke cylinder optimized for minimal axial space in clamping and press-fitting.'
    },
    image: '/images/cat_thumb_rc.png',
    boreSizes: [12, 16, 20, 25, 32, 40, 50, 63, 80, 100],
    standardStrokes: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100],
    maxStroke: 100,
    hasDoubleRod: true,
    mountings: [
      { code: 'A', nameId: 'Both End Tapped', nameEn: 'Both End Tapped', desc: 'Lubang ulir langsung pada bodi silinder' },
      { code: 'B', nameId: 'Through Hole', nameEn: 'Through Hole', desc: 'Dipasang dengan baut tembus' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
    ],
    rodEndOptions: [
      { code: '', label: 'Female Thread (standar)' },
      { code: 'M', label: 'Male Thread' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.5 MPa (15 kgf/cm²)',
      maxPressure: '0.99 MPa (9.9 kgf/cm²)',
      minPressure: '0.05 MPa (0.5 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 500 mm/sec',
      cushion: 'Rubber Bumper Cushion',
      strokeTolerance: '+1.0 / 0 mm'
    }
  },
  {
    id: 'spc1',
    series: 'SPC1',
    category: 'Air Cylinder',
    name: 'SPC1 Series - Small Precision Cylinder (Alloy)',
    tagline: {
      id: 'Silinder kecil tabung aluminium dengan bushing yang menahan beban samping.',
      en: 'Small precision aluminum cylinder with reinforced bush against lateral deflections.'
    },
    image: '/images/cat_thumb_spc1.png',
    boreSizes: [20, 25, 32, 40],
    standardStrokes: [25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500],
    maxStroke: 650,
    hasDoubleRod: true,
    mountings: [
      { code: 'B', nameId: 'Standard', nameEn: 'Standard', desc: 'Dudukan dasar' },
      { code: 'LB', nameId: 'Foot Mounting', nameEn: 'Foot Mounting', desc: 'Dudukan kaki' },
      { code: 'FA', nameId: 'Rod Side Flange', nameEn: 'Rod Side Flange', desc: 'Flange depan' },
      { code: 'FB', nameId: 'Head Side Flange', nameEn: 'Head Side Flange', desc: 'Flange belakang' },
      { code: 'CA', nameId: 'Single Clevis', nameEn: 'Single Clevis', desc: 'Clevis tunggal' },
      { code: 'CB', nameId: 'Double Clevis', nameEn: 'Double Clevis', desc: 'Clevis ganda' },
      { code: 'TR', nameId: 'Rod Side Trunnion', nameEn: 'Rod Side Trunnion', desc: 'Trunnion depan' },
      { code: 'TH', nameId: 'Head Side Trunnion', nameEn: 'Head Side Trunnion', desc: 'Trunnion belakang' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
      { code: 'J', label: 'Nylon Tarpaulin', maxTemp: 'Max 60°C' },
      { code: 'K', label: 'Neoprene Cloth', maxTemp: 'Max 110°C' },
    ],
    rodEndOptions: [
      { code: '', label: 'Nut Standar (1 pc)' },
      { code: 'I', label: 'Single Knuckle' },
      { code: 'Y', label: 'Double Knuckle' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.5 MPa (15 kgf/cm²)',
      maxPressure: '0.99 MPa (9.9 kgf/cm²)',
      minPressure: '0.05 MPa (0.5 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 600 mm/sec',
      cushion: 'Rubber Bumper Standard',
      strokeTolerance: 'KS Class 2'
    }
  },
  {
    id: 'spc2',
    series: 'SPC2',
    category: 'Air Cylinder',
    name: 'SPC2 Series - Stainless Steel Tube Small Cylinder',
    tagline: {
      id: 'Silinder kecil dengan tabung stainless steel, tahan korosi, cocok untuk area basah dan proses pencucian.',
      en: 'Stainless steel tube small cylinder engineered for corrosive and washdown environments.'
    },
    image: '/images/cat_thumb_spc2.png',
    boreSizes: [20, 25, 32, 40],
    standardStrokes: [25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500],
    maxStroke: 650,
    hasDoubleRod: true,
    mountings: [
      { code: 'B', nameId: 'Standard', nameEn: 'Standard', desc: 'Dudukan dasar SS' },
      { code: 'LB', nameId: 'Foot Stainless', nameEn: 'Stainless Foot', desc: 'Dudukan kaki SS304' },
      { code: 'FA', nameId: 'Front Flange Stainless', nameEn: 'Front Flange SS', desc: 'Flange depan SS' },
      { code: 'FB', nameId: 'Rear Flange Stainless', nameEn: 'Rear Flange SS', desc: 'Flange belakang SS' },
      { code: 'CB', nameId: 'Double Clevis Stainless', nameEn: 'Double Clevis SS', desc: 'Engsel ganda SS' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
      { code: 'J', label: 'Nylon Tarpaulin', maxTemp: 'Max 60°C' },
      { code: 'K', label: 'Neoprene Tahan Kimia', maxTemp: 'Max 110°C' },
    ],
    rodEndOptions: [
      { code: '', label: 'Nut Stainless' },
      { code: 'I', label: 'Single Knuckle SS' },
      { code: 'Y', label: 'Double Knuckle SS' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.5 MPa (15 kgf/cm²)',
      maxPressure: '0.99 MPa (9.9 kgf/cm²)',
      minPressure: '0.05 MPa (0.5 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 600 mm/sec',
      cushion: 'Rubber Bumper Standard',
      strokeTolerance: 'KS Class 2'
    }
  },
  {
    id: 'xpc1',
    series: 'XPC1',
    category: 'Air Cylinder',
    name: 'XPC1 Series - Extra-Large Heavy Pneumatic Cylinder',
    tagline: {
      id: 'Silinder pneumatik bore Ø350 hingga Ø450 mm untuk kebutuhan gaya dorong besar di industri berat.',
      en: 'Extra-large pneumatic cylinder with bore Ø350 to Ø450 mm delivering extreme thrust for heavy industry.'
    },
    image: '/images/cat_thumb_lpc1.png',
    boreSizes: [350, 400, 450],
    standardStrokes: [100, 200, 300, 400, 500, 600, 700, 800, 1000],
    maxStroke: 1000,
    hasDoubleRod: false,
    mountings: [
      { code: 'LB', nameId: 'Heavy-Duty Foot', nameEn: 'Heavy Foot', desc: 'Dudukan kaki baja' },
      { code: 'FA', nameId: 'Front Flange Baja', nameEn: 'Front Flange', desc: 'Flange baja sisi depan' },
      { code: 'FB', nameId: 'Rear Flange Baja', nameEn: 'Rear Flange', desc: 'Flange baja sisi belakang' },
      { code: 'CA', nameId: 'Single Clevis Besar', nameEn: 'Single Clevis', desc: 'Clevis tunggal heavy-duty' },
      { code: 'TC', nameId: 'Center Trunnion', nameEn: 'Center Trunnion', desc: 'Trunnion tengah' },
    ],
    bellowsOptions: [
      { code: '', label: 'Tanpa Bellows', maxTemp: '-' },
      { code: 'J', label: 'Nylon Tarpaulin Besar', maxTemp: 'Max 60°C' },
      { code: 'K', label: 'Neoprene Tahan Panas', maxTemp: 'Max 110°C' },
    ],
    rodEndOptions: [
      { code: '', label: 'Nut Baja' },
      { code: 'I', label: 'Single Knuckle Joint Heavy' },
      { code: 'Y', label: 'Double Knuckle Joint Heavy' },
    ],
    specs: {
      fluid: 'Udara bertekanan',
      proofPressure: '1.6 MPa (16 kgf/cm²)',
      maxPressure: '0.99 MPa (0.99 MPa)',
      minPressure: '0.10 MPa (1.0 kgf/cm²)',
      tempRange: '5°C ~ 60°C',
      speedRange: '50 ~ 500 mm/sec',
      cushion: 'Air Cushion kedua sisi',
      strokeTolerance: '~100mm: +0.8/0, 101~250mm: +1.0/0, 251~630mm: +1.25/0, 631~1000mm: +1.4/0'
    }
  }
];
