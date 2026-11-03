// src/lib/cylinderCalculator.ts
// Mathematical and engineering calculation engine matching Calculator.xls (BELSA)
// Supports all 5 modules with identical formulas, safety factors, and unit conversions.

export interface CylinderMaterial {
  name: string;
  tensileStrength: number; // in kgf/mm2
  yieldStrength?: number;
  description: string;
}

export const CYLINDER_MATERIALS: Record<string, CylinderMaterial> = {
  'stkm13c': {
    name: 'STKM-13 C',
    tensileStrength: 38.7,
    description: 'JIS G3445 Carbon Steel Tubes for Machine Structural Purposes (Standard Seamless Cylinder Tube)'
  },
  'st52': {
    name: 'ST-52',
    tensileStrength: 36.0,
    description: 'DIN 2391 / EN 10305-1 High Precision Seamless Honed Tube'
  },
  'aluminium': {
    name: 'Aluminium',
    tensileStrength: 21.8,
    description: 'Aluminium Alloy 6063 / 6061-T6 Pneumatic Profile Cylinder Tube'
  },
  'st52_toko': {
    name: 'ST-52 Toko 17',
    tensileStrength: 17.0,
    description: 'Commercial Grade ST-52 Carbon Steel'
  },
  'steel_oem': {
    name: 'Steel OEM',
    tensileStrength: 20.3,
    description: 'Standard OEM Fabricated Structural Steel'
  }
};

export interface PressureCalcInput {
  loadTon: number; // Beban dalam Ton
  idTubeMm: number; // Bore / Diameter dalam (mm)
}

export interface PressureCalcResult {
  loadKg: number;
  areaCm2: number;
  areaMm2: number;
  pressureBar: number;
  pressureMpa: number;
  pressurePsi: number;
  pushForceKn: number;
}

// 1. Module 1: Pressure Calculator (Sheet: Calculator Pressure)
// Formula: Area = (pi / 4) * (ID_cm)^2; Pressure = Load_kg / Area;
export function calculateCylinderPressure(input: PressureCalcInput): PressureCalcResult {
  const { loadTon, idTubeMm } = input;
  const loadKg = loadTon * 1000;
  const idCm = idTubeMm / 10;
  
  // Excel uses pi/4 approx 0.25 * 3.14 or 3.14159265
  // (0.25 * 3.14 * idCm^2) gives exact match with Calculator.xls
  const areaCm2 = 0.25 * 3.14 * (idCm * idCm);
  const areaMm2 = (Math.PI / 4) * (idTubeMm * idTubeMm);
  
  const pressureBar = areaCm2 > 0 ? loadKg / areaCm2 : 0;
  const pressureMpa = pressureBar * 0.1;
  const pressurePsi = pressureBar * 14.5038;
  const pushForceKn = (pressureBar * 0.1 * areaMm2) / 1000;

  return {
    loadKg,
    areaCm2: Math.round(areaCm2 * 10000) / 10000,
    areaMm2: Math.round(areaMm2 * 100) / 100,
    pressureBar: Math.round(pressureBar * 10000) / 10000,
    pressureMpa: Math.round(pressureMpa * 1000) / 1000,
    pressurePsi: Math.round(pressurePsi * 10) / 10,
    pushForceKn: Math.round(pushForceKn * 100) / 100
  };
}

// Reverse: Calculate Load given Bore & Pressure
export function calculateCylinderLoad(boreMm: number, pressureBar: number): { loadTon: number; loadKg: number } {
  const idCm = boreMm / 10;
  const areaCm2 = 0.25 * 3.14 * (idCm * idCm);
  const loadKg = areaCm2 * pressureBar;
  return {
    loadKg: Math.round(loadKg * 10) / 10,
    loadTon: Math.round((loadKg / 1000) * 1000) / 1000
  };
}

// 2. Module 2: Over Size ID Tube / Thickness Calculator (Sheet: Calculator Over Size ID Tube)
export interface TubeThicknessInput {
  odMm: number;
  idMm: number;
  pressureBar: number;
  materialKey: string;
}

export interface TubeThicknessResult {
  tActual: number; // Actual wall thickness (mm)
  tCylMin: number; // Theoretical minimum wall thickness (Lamé formula)
  safetyFactor: number;
  overSizeDimMax: number; // Max allowable ID after honing (mm)
  isSafe: boolean;
  statusText: 'Recomended' | 'Not Recomended' | "It's Maxed";
}

export function calculateTubeThickness(input: TubeThicknessInput): TubeThicknessResult {
  const { odMm, idMm, pressureBar, materialKey } = input;
  const mat = CYLINDER_MATERIALS[materialKey] || CYLINDER_MATERIALS['stkm13c'];
  const sigma = mat.tensileStrength * 100; // in kg/cm2 (38.7 -> 3870)
  const P = pressureBar;

  const tActual = (odMm - idMm) / 2;

  // Lamé formula: t = (ID / 2) * (sqrt((sigma + P) / (sigma - P)) - 1)
  let tCylMin = 0;
  if (sigma > P) {
    tCylMin = (idMm / 2) * (Math.sqrt((sigma + P) / (sigma - P)) - 1);
  }

  const safetyFactor = tCylMin > 0 ? tActual / tCylMin : 0;

  // In Calculator.xls:
  // Safety factor multiplier for allowable thickness = 2.13
  const tAllowable = tCylMin * 2.13;
  const overSizeDimMax = Math.max(0, odMm - 2 * tAllowable);

  let statusText: 'Recomended' | 'Not Recomended' | "It's Maxed" = 'Recomended';
  let isSafe = true;

  if (safetyFactor < 1.5) {
    statusText = 'Not Recomended';
    isSafe = false;
  } else if (idMm >= overSizeDimMax) {
    statusText = "It's Maxed";
    isSafe = false;
  }

  return {
    tActual: Math.round(tActual * 100) / 100,
    tCylMin: Math.round(tCylMin * 10000) / 10000,
    safetyFactor: Math.round(safetyFactor * 100) / 100,
    overSizeDimMax: Math.round(overSizeDimMax * 100) / 100,
    isSafe,
    statusText
  };
}

// 3. Module 3: Bolt Force Calculator (Sheet: Calculator Bolt)
export interface BoltCalcInput {
  pressureBar: number;
  idTubeMm: number;
  boltDiameterMm: number;
  boltQty: number;
  boltGrade: '8.8' | '10.9' | '12.9';
}

export interface BoltCalcResult {
  cylinderBaseForceN: number;
  safetyFactorCylinderForceN: number;
  singleBoltCapacityN: number;
  totalBoltForceN: number;
  safetyFactor: number;
  isSafe: boolean;
  statusText: 'Safe' | 'Unsafe';
}

export function calculateBoltForceSafety(input: BoltCalcInput): BoltCalcResult {
  const { pressureBar, idTubeMm, boltDiameterMm, boltQty, boltGrade } = input;

  let tensileStrengthNmm2 = 800;
  if (boltGrade === '10.9') tensileStrengthNmm2 = 1000;
  if (boltGrade === '12.9') tensileStrengthNmm2 = 1200;

  // Cylinder Force base:
  const pistonAreaMm2 = 0.25 * 3.14 * (idTubeMm * idTubeMm);
  const pressureMpa = pressureBar / 10;
  const cylinderBaseForceN = pistonAreaMm2 * pressureMpa;
  const safetyFactorCylinderForceN = cylinderBaseForceN * 2.0;

  // Single bolt core/nominal area:
  const singleBoltAreaMm2 = 0.25 * 3.14 * (boltDiameterMm * boltDiameterMm);
  const singleBoltCapacityN = singleBoltAreaMm2 * tensileStrengthNmm2;
  const totalBoltForceN = singleBoltCapacityN * boltQty;

  const isSafe = totalBoltForceN >= safetyFactorCylinderForceN;
  const safetyFactor = safetyFactorCylinderForceN > 0 ? totalBoltForceN / safetyFactorCylinderForceN : 0;

  return {
    cylinderBaseForceN: Math.round(cylinderBaseForceN),
    safetyFactorCylinderForceN: Math.round(safetyFactorCylinderForceN),
    singleBoltCapacityN: Math.round(singleBoltCapacityN),
    totalBoltForceN: Math.round(totalBoltForceN),
    safetyFactor: Math.round(safetyFactor * 100) / 100,
    isSafe,
    statusText: isSafe ? 'Safe' : 'Unsafe'
  };
}

// 4. Module 4: Weight Calculator (Sheet: Calculator Massa)
export interface RoundWeightInput {
  odMm: number;
  idMm: number; // 0 for solid rod
  lengthMm: number;
  materialDensityKgM3?: number; // default steel 7800 kg/m3
}

export interface PlateWeightInput {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  materialDensityKgM3?: number; // default steel 7800 kg/m3
}

export function calculateRoundWeight(input: RoundWeightInput): number {
  const { odMm, idMm, lengthMm, materialDensityKgM3 = 7800 } = input;
  const odM = odMm / 1000;
  const idM = idMm / 1000;
  const lengthM = lengthMm / 1000;
  const areaM2 = (Math.PI / 4) * (odM * odM - idM * idM);
  const volumeM3 = areaM2 * lengthM;
  const weightKg = volumeM3 * materialDensityKgM3;
  return Math.round(weightKg * 1000) / 1000;
}

export function calculatePlateWeight(input: PlateWeightInput): number {
  const { lengthMm, widthMm, heightMm, materialDensityKgM3 = 7800 } = input;
  const lM = lengthMm / 1000;
  const wM = widthMm / 1000;
  const hM = heightMm / 1000;
  const volumeM3 = lM * wM * hM;
  const weightKg = volumeM3 * materialDensityKgM3;
  return Math.round(weightKg * 1000) / 1000;
}

// 5. Module 5: Recommended Bolt Tightening Torque (Sheet1)
export interface TorqueRow {
  metricSize: string;
  metricDiaMm: number;
  torqueNmLow: number; // 25% yield (<= 10 Bar)
  torqueNmMed: number; // 40% yield (10-35 Bar)
  torqueNmHigh: number; // 60% yield (> 35 Bar)
  inchSize: string;
  torqueLbfLow: number;
  torqueLbfMed: number;
  torqueLbfHigh: number;
}

export const RECOMMENDED_TORQUE_TABLE: TorqueRow[] = [
  { metricSize: 'M5', metricDiaMm: 5, torqueNmLow: 2, torqueNmMed: 3.5, torqueNmHigh: 5, inchSize: '3/16"', torqueLbfLow: 1.5, torqueLbfMed: 2.5, torqueLbfHigh: 3.5 },
  { metricSize: 'M6', metricDiaMm: 6, torqueNmLow: 5, torqueNmMed: 8, torqueNmHigh: 12, inchSize: '1/4"', torqueLbfLow: 4, torqueLbfMed: 7, torqueLbfHigh: 10 },
  { metricSize: 'M8', metricDiaMm: 8, torqueNmLow: 9, torqueNmMed: 14, torqueNmHigh: 21, inchSize: '3/8"', torqueLbfLow: 11, torqueLbfMed: 17, torqueLbfHigh: 25 },
  { metricSize: 'M10', metricDiaMm: 10, torqueNmLow: 17, torqueNmMed: 27, torqueNmHigh: 41, inchSize: '7/16"', torqueLbfLow: 17, torqueLbfMed: 27, torqueLbfHigh: 40 },
  { metricSize: 'M12', metricDiaMm: 12, torqueNmLow: 30, torqueNmMed: 47, torqueNmHigh: 71, inchSize: '1/2"', torqueLbfLow: 25, torqueLbfMed: 40, torqueLbfHigh: 60 },
  { metricSize: 'M14', metricDiaMm: 14, torqueNmLow: 51, torqueNmMed: 81, torqueNmHigh: 121, inchSize: '5/8"', torqueLbfLow: 50, torqueLbfMed: 80, torqueLbfHigh: 120 },
  { metricSize: 'M16', metricDiaMm: 16, torqueNmLow: 74, torqueNmMed: 118, torqueNmHigh: 177, inchSize: '3/4"', torqueLbfLow: 90, torqueLbfMed: 142, torqueLbfHigh: 213 },
  { metricSize: 'M20', metricDiaMm: 20, torqueNmLow: 145, torqueNmMed: 229, torqueNmHigh: 344, inchSize: '7/8"', torqueLbfLow: 145, torqueLbfMed: 229, torqueLbfHigh: 344 },
  { metricSize: 'M22', metricDiaMm: 22, torqueNmLow: 195, torqueNmMed: 309, torqueNmHigh: 463, inchSize: '1"', torqueLbfLow: 216, torqueLbfMed: 344, torqueLbfHigh: 515 },
  { metricSize: 'M24', metricDiaMm: 24, torqueNmLow: 250, torqueNmMed: 398, torqueNmHigh: 596, inchSize: '1-1/8"', torqueLbfLow: 318, torqueLbfMed: 505, torqueLbfHigh: 757 },
  { metricSize: 'M27', metricDiaMm: 27, torqueNmLow: 363, torqueNmMed: 577, torqueNmHigh: 865, inchSize: '1-1/4"', torqueLbfLow: 446, torqueLbfMed: 708, torqueLbfHigh: 1062 },
  { metricSize: 'M30', metricDiaMm: 30, torqueNmLow: 497, torqueNmMed: 789, torqueNmHigh: 1183, inchSize: '1-3/8"', torqueLbfLow: 605, torqueLbfMed: 961, torqueLbfHigh: 1441 },
  { metricSize: 'M32', metricDiaMm: 32, torqueNmLow: 612, torqueNmMed: 972, torqueNmHigh: 1457, inchSize: '1-1/2"', torqueLbfLow: 799, torqueLbfMed: 1269, torqueLbfHigh: 1902 },
  { metricSize: 'M33', metricDiaMm: 33, torqueNmLow: 669, torqueNmMed: 1062, torqueNmHigh: 1592, inchSize: '1-5/8"', torqueLbfLow: 1033, torqueLbfMed: 1640, torqueLbfHigh: 2459 },
  { metricSize: 'M36', metricDiaMm: 36, torqueNmLow: 868, torqueNmMed: 1379, torqueNmHigh: 2068, inchSize: '1-3/4"', torqueLbfLow: 1300, torqueLbfMed: 2064, torqueLbfHigh: 3094 },
  { metricSize: 'M38', metricDiaMm: 38, torqueNmLow: 1033, torqueNmMed: 1641, torqueNmHigh: 2461, inchSize: '1-7/8"', torqueLbfLow: 1614, torqueLbfMed: 2562, torqueLbfHigh: 3841 },
  { metricSize: 'M39', metricDiaMm: 39, torqueNmLow: 1123, torqueNmMed: 1784, torqueNmHigh: 2675, inchSize: '2"', torqueLbfLow: 1978, torqueLbfMed: 3141, torqueLbfHigh: 4709 },
  { metricSize: 'M42', metricDiaMm: 42, torqueNmLow: 1389, torqueNmMed: 2206, torqueNmHigh: 3307, inchSize: '2-1/4"', torqueLbfLow: 2860, torqueLbfMed: 4541, torqueLbfHigh: 6808 },
  { metricSize: 'M45', metricDiaMm: 45, torqueNmLow: 1721, torqueNmMed: 2732, torqueNmHigh: 4096, inchSize: '2-1/2"', torqueLbfLow: 3587, torqueLbfMed: 5694, torqueLbfHigh: 8536 },
  { metricSize: 'M48', metricDiaMm: 48, torqueNmLow: 2084, torqueNmMed: 3309, torqueNmHigh: 4691, inchSize: '2-3/4"', torqueLbfLow: 4794, torqueLbfMed: 7611, torqueLbfHigh: 11411 },
  { metricSize: 'M52', metricDiaMm: 52, torqueNmLow: 2666, torqueNmMed: 4233, torqueNmHigh: 6347, inchSize: '3"', torqueLbfLow: 6250, torqueLbfMed: 9920, torqueLbfHigh: 14872 },
  { metricSize: 'M56', metricDiaMm: 56, torqueNmLow: 3303, torqueNmMed: 5243, torqueNmHigh: 7860, inchSize: '3-1/4"', torqueLbfLow: 7970, torqueLbfMed: 12652, torqueLbfHigh: 18968 },
  { metricSize: 'M60', metricDiaMm: 60, torqueNmLow: 4311, torqueNmMed: 6843, torqueNmHigh: 9810, inchSize: '3-1/2"', torqueLbfLow: 9983, torqueLbfMed: 15847, torqueLbfHigh: 23758 },
  { metricSize: 'M64', metricDiaMm: 64, torqueNmLow: 5067, torqueNmMed: 8043, torqueNmHigh: 12058, inchSize: '3-3/4"', torqueLbfLow: 12307, torqueLbfMed: 19536, torqueLbfHigh: 29290 },
  { metricSize: 'M68', metricDiaMm: 68, torqueNmLow: 6045, torqueNmMed: 9596, torqueNmHigh: 14387, inchSize: '4"', torqueLbfLow: 11186, torqueLbfMed: 17756, torqueLbfHigh: 26621 },
  { metricSize: 'M72', metricDiaMm: 72, torqueNmLow: 7116, torqueNmMed: 11296, torqueNmHigh: 16935, inchSize: '4-1/4"', torqueLbfLow: 14200, torqueLbfMed: 22539, torqueLbfHigh: 33791 },
  { metricSize: 'M80', metricDiaMm: 80, torqueNmLow: 8938, torqueNmMed: 14188, torqueNmHigh: 21272, inchSize: '4-1/2"', torqueLbfLow: 16883, torqueLbfMed: 26798, torqueLbfHigh: 40177 },
  { metricSize: 'M90', metricDiaMm: 90, torqueNmLow: 12946, torqueNmMed: 20550, torqueNmHigh: 30809, inchSize: '—', torqueLbfLow: 0, torqueLbfMed: 0, torqueLbfHigh: 0 },
  { metricSize: 'M100', metricDiaMm: 100, torqueNmLow: 17989, torqueNmMed: 28554, torqueNmHigh: 42810, inchSize: '—', torqueLbfLow: 0, torqueLbfMed: 0, torqueLbfHigh: 0 },
];

export function getRecommendedTorque(
  row: TorqueRow,
  pressureBar: number,
  boltGrade: '8.8' | '10.9' | '12.9',
  unit: 'Nm' | 'Lbf.ft'
): number {
  let baseTorque = 0;
  if (unit === 'Nm') {
    if (pressureBar <= 10) baseTorque = row.torqueNmLow;
    else if (pressureBar <= 35) baseTorque = row.torqueNmMed;
    else baseTorque = row.torqueNmHigh;
  } else {
    if (pressureBar <= 10) baseTorque = row.torqueLbfLow;
    else if (pressureBar <= 35) baseTorque = row.torqueLbfMed;
    else baseTorque = row.torqueLbfHigh;
  }

  // Multiplier for Grade 10.9 (+40%) and Grade 12.9 (+70%)
  if (boltGrade === '10.9') return Math.round(baseTorque * 1.4);
  if (boltGrade === '12.9') return Math.round(baseTorque * 1.7);
  return baseTorque;
}

// 6. Smart Product Recommendation based on calculated Pressure & Bore
export interface ProductRecommendation {
  seriesId: string;
  seriesName: string;
  category: string;
  ratedPressure: string;
  featuresSnippet: string;
  catalogueUrl: string;
}

export function recommendBelsaSeries(pressureBar: number, boreMm: number): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];

  if (pressureBar <= 10) {
    recommendations.push({
      seriesId: 'aci',
      seriesName: 'ACI Series',
      category: 'Air Cylinder',
      ratedPressure: 'Max 10 Bar (1.0 MPa)',
      featuresSnippet: 'ISO15552 standard, durable wear ring, auto-switch ready, smooth cushioning.',
      catalogueUrl: '/catalogue?product=aci'
    });
    recommendations.push({
      seriesId: 'bpcbf',
      seriesName: 'BPCBF Series',
      category: 'Air Cylinder',
      ratedPressure: 'Max 10 Bar (1.0 MPa)',
      featuresSnippet: 'Leak-proof rolling diaphragm, low friction, lubrication-free.',
      catalogueUrl: '/catalogue?product=bpcbf'
    });
  } else if (pressureBar <= 70) {
    recommendations.push({
      seriesId: 'btc70hp',
      seriesName: 'BTC70HP Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '7.0 MPa / 70 Bar',
      featuresSnippet: 'Telescopic double acting high pressure cylinder, multistage stroke.',
      catalogueUrl: '/catalogue?product=btc70hp'
    });
    recommendations.push({
      seriesId: 'bcc140a',
      seriesName: 'BCC140A Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '14.0 MPa / 140 Bar',
      featuresSnippet: 'Tie-rod compact hydraulic cylinder with wide mounting options.',
      catalogueUrl: '/catalogue?product=bcc140a'
    });
  } else if (pressureBar <= 140) {
    recommendations.push({
      seriesId: 'bcc140a',
      seriesName: 'BCC140A Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '14.0 MPa / 140 Bar',
      featuresSnippet: 'Heavy duty tie-rod hydraulic cylinder with cushioned end caps.',
      catalogueUrl: '/catalogue?product=bcc140a'
    });
    recommendations.push({
      seriesId: 'nhc140h',
      seriesName: 'NHC140H Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '14.0 MPa / 140 Bar',
      featuresSnippet: 'Standard industrial tie-rod cylinder with magnetic auto-switch.',
      catalogueUrl: '/catalogue?product=nhc140h'
    });
  } else if (pressureBar <= 210) {
    recommendations.push({
      seriesId: 'nhc210h',
      seriesName: 'NHC210H Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '21.0 MPa / 210 Bar',
      featuresSnippet: 'Heavy duty industrial hydraulic cylinder rated up to 210 bar.',
      catalogueUrl: '/catalogue?product=nhc210h'
    });
    recommendations.push({
      seriesId: 'nmc210h',
      seriesName: 'NMC210H Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '21.0 MPa / 210 Bar',
      featuresSnippet: 'Mill type hydraulic cylinder with bolted end flange construction.',
      catalogueUrl: '/catalogue?product=nmc210h'
    });
  } else if (pressureBar <= 250) {
    recommendations.push({
      seriesId: 'nhc250h',
      seriesName: 'NHC250H Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '25.0 MPa / 250 Bar',
      featuresSnippet: 'High pressure severe duty hydraulic cylinder engineered for 250 bar.',
      catalogueUrl: '/catalogue?product=nhc250h'
    });
  } else {
    recommendations.push({
      seriesId: 'nhc300h',
      seriesName: 'NHC300H Series',
      category: 'Hydraulic Cylinder',
      ratedPressure: '30.0 MPa / 300 Bar',
      featuresSnippet: 'Extreme high pressure hydraulic cylinder engineered for 300 bar continuous operating duty.',
      catalogueUrl: '/catalogue?product=nhc300h'
    });
  }

  return recommendations;
}
