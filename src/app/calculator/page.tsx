'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  calculateCylinderPressure,
  calculateCylinderLoad,
  calculateTubeThickness,
  calculateBoltForceSafety,
  calculateRoundWeight,
  calculatePlateWeight,
  CYLINDER_MATERIALS,
  RECOMMENDED_TORQUE_TABLE,
  getRecommendedTorque,
  recommendBelsaSeries
} from '@/lib/cylinderCalculator';
import './calculator.css';

export type CalculatorTab = 'pressure' | 'thickness' | 'bolt' | 'weight' | 'torque';

function CalculatorContent({ initialTool }: { initialTool?: CalculatorTab }) {
  const { lang } = useLanguage();
  const isId = lang === 'id';

  // Display-only mapping for raw English values from cylinderCalculator.ts (ID UI only)
  const STATUS_ID: Record<string, string> = {
    'Recomended': 'DIREKOMENDASIKAN',
    'Not Recomended': 'TIDAK DISARANKAN',
    "It's Maxed": 'SUDAH BATAS MAKSIMUM',
    'Safe': 'AMAN',
    'Unsafe': 'TIDAK AMAN'
  };
  const statusLabel = (status: string) => (isId ? STATUS_ID[status] || status : status);

  const MATERIAL_DESC_ID: Record<string, string> = {
    'stkm13c': 'JIS G3445, pipa baja karbon untuk struktur mesin (tube silinder seamless standar)',
    'st52': 'DIN 2391 / EN 10305-1, tube seamless honed',
    'aluminium': 'Aluminium 6063 / 6061-T6, tube profil silinder pneumatik',
    'st52_toko': 'Baja karbon ST-52 grade komersial',
    'steel_oem': 'Baja struktural fabrikasi OEM standar'
  };

  const FEATURES_ID: Record<string, string> = {
    'ISO15552 standard, durable wear ring, auto-switch ready, smooth cushioning.': 'Standar ISO 15552, wear ring, siap auto switch, dilengkapi cushion.',
    'Leak-proof rolling diaphragm, low friction, lubrication-free.': 'Rolling diaphragm, gesekan rendah, tanpa pelumasan.',
    'Telescopic double acting high pressure cylinder, multistage stroke.': 'Silinder teleskopik double acting, stroke bertingkat.',
    'Tie-rod compact hydraulic cylinder with wide mounting options.': 'Silinder hidrolik tie rod ringkas dengan banyak pilihan mounting.',
    'Heavy duty tie-rod hydraulic cylinder with cushioned end caps.': 'Silinder hidrolik tie rod heavy duty dengan cushion di kedua ujung.',
    'Standard industrial tie-rod cylinder with magnetic auto-switch.': 'Silinder tie rod industri standar dengan auto switch magnetik.',
    'Heavy duty industrial hydraulic cylinder rated up to 210 bar.': 'Silinder hidrolik industri heavy duty, tekanan kerja hingga 210 bar.',
    'Mill type hydraulic cylinder with bolted end flange construction.': 'Silinder hidrolik tipe mill dengan flange ujung yang dibaut.',
    'High pressure severe duty hydraulic cylinder engineered for 250 bar.': 'Silinder hidrolik tekanan tinggi untuk kerja berat, 250 bar.',
    'Extreme high pressure hydraulic cylinder engineered for 300 bar continuous operating duty.': 'Silinder hidrolik tekanan tinggi untuk operasi kontinu 300 bar.'
  };
  const featuresLabel = (text: string) => (isId ? FEATURES_ID[text] || text : text);
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<CalculatorTab>(initialTool || 'pressure');
  const [copied, setCopied] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [mobileCadExpanded, setMobileCadExpanded] = useState(true);
  const [isToolSwitching, setIsToolSwitching] = useState(false);
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tool = searchParams.get('tool') || searchParams.get('tab');
    if (tool && ['pressure', 'thickness', 'bolt', 'weight', 'torque'].includes(tool)) {
      setActiveTab(tool as CalculatorTab);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  const switchTab = (tab: CalculatorTab) => {
    if (tab === activeTab) return;
    const order: CalculatorTab[] = ['pressure', 'thickness', 'bolt', 'weight', 'torque'];
    const prevIdx = order.indexOf(activeTab);
    const nextIdx = order.indexOf(tab);
    setSlideDir(nextIdx >= prevIdx ? 'right' : 'left');
    setIsToolSwitching(true);
    setActiveTab(tab);

    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    switchTimerRef.current = setTimeout(() => {
      setIsToolSwitching(false);
    }, 240);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tool', tab);
      window.history.replaceState(null, '', url.toString());
      if (window.innerWidth <= 768 && window.scrollY > 80) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // --- 1. State Module 1: Pressure & Load ---
  const [pressureMode, setPressureMode] = useState<'calcPressure' | 'calcLoad'>('calcPressure');
  const [loadTonInput, setLoadTonInput] = useState<number>(7.5);
  const [boreMmInput, setBoreMmInput] = useState<number>(140);
  const [pressureBarInput, setPressureBarInput] = useState<number>(140);

  const pressureResult = useMemo(() => {
    return calculateCylinderPressure({
      loadTon: loadTonInput || 0,
      idTubeMm: boreMmInput || 1
    });
  }, [loadTonInput, boreMmInput]);

  const loadResult = useMemo(() => {
    return calculateCylinderLoad(boreMmInput || 1, pressureBarInput || 0);
  }, [boreMmInput, pressureBarInput]);

  const activeCalculatedPressure = pressureMode === 'calcPressure' ? pressureResult.pressureBar : pressureBarInput;
  const recommendations = useMemo(() => {
    return recommendBelsaSeries(activeCalculatedPressure, boreMmInput);
  }, [activeCalculatedPressure, boreMmInput]);

  // --- 2. State Module 2: Tube Thickness & Honing ---
  const [odMm, setOdMm] = useState<number>(273);
  const [idMm, setIdMm] = useState<number>(225);
  const [thickPressureBar, setThickPressureBar] = useState<number>(300);
  const [materialKey, setMaterialKey] = useState<string>('stkm13c');

  const thicknessResult = useMemo(() => {
    return calculateTubeThickness({
      odMm: odMm || 1,
      idMm: idMm || 1,
      pressureBar: thickPressureBar || 0,
      materialKey
    });
  }, [odMm, idMm, thickPressureBar, materialKey]);

  const tAllowable = useMemo(() => {
    return Math.round(thicknessResult.tCylMin * 2.13 * 100) / 100;
  }, [thicknessResult.tCylMin]);

  const overSizeSafetyAllowance = useMemo(() => {
    return Math.max(0, Math.round((thicknessResult.overSizeDimMax - idMm) * 100) / 100);
  }, [thicknessResult.overSizeDimMax, idMm]);

  // --- 3. State Module 3: Bolt Force ---
  const [boltPressureBar, setBoltPressureBar] = useState<number>(300);
  const [boltTubeIdMm, setBoltTubeIdMm] = useState<number>(225);
  const [boltDiaMm, setBoltDiaMm] = useState<number>(43);
  const [boltQty, setBoltQty] = useState<number>(4);
  const [boltGrade, setBoltGrade] = useState<'8.8' | '10.9' | '12.9'>('8.8');

  const boltResult = useMemo(() => {
    return calculateBoltForceSafety({
      pressureBar: boltPressureBar || 0,
      idTubeMm: boltTubeIdMm || 1,
      boltDiameterMm: boltDiaMm || 1,
      boltQty: boltQty || 1,
      boltGrade
    });
  }, [boltPressureBar, boltTubeIdMm, boltDiaMm, boltQty, boltGrade]);

  // --- 4. State Module 4: Weight ---
  const [weightType, setWeightType] = useState<'round' | 'plate'>('round');
  const [roundOd, setRoundOd] = useState<number>(65);
  const [roundId, setRoundId] = useState<number>(0);
  const [roundLength, setRoundLength] = useState<number>(220);
  const [plateLength, setPlateLength] = useState<number>(250);
  const [plateWidth, setPlateWidth] = useState<number>(130);
  const [plateHeight, setPlateHeight] = useState<number>(10);
  const [density, setDensity] = useState<number>(7850);

  const roundWeightResult = useMemo(() => {
    return calculateRoundWeight({
      odMm: roundOd || 0,
      idMm: roundId || 0,
      lengthMm: roundLength || 0,
      materialDensityKgM3: density
    });
  }, [roundOd, roundId, roundLength, density]);

  const plateWeightResult = useMemo(() => {
    return calculatePlateWeight({
      lengthMm: plateLength || 0,
      widthMm: plateWidth || 0,
      heightMm: plateHeight || 0,
      materialDensityKgM3: density
    });
  }, [plateLength, plateWidth, plateHeight, density]);

  // --- 5. State Module 5: Torque Table ---
  const [torqueSearch, setTorqueSearch] = useState<string>('');
  const [selectedBoltSize, setSelectedBoltSize] = useState<string>('M24');
  const [torqueGrade, setTorqueGrade] = useState<'8.8' | '10.9' | '12.9'>('8.8');
  const [torqueUnit, setTorqueUnit] = useState<'Nm' | 'Lbf.ft'>('Nm');

  const filteredTorqueTable = useMemo(() => {
    return RECOMMENDED_TORQUE_TABLE.filter((row) => {
      const q = torqueSearch.toLowerCase().trim();
      if (q && !row.metricSize.toLowerCase().includes(q) && !row.inchSize.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [torqueSearch]);

  const activeTorqueRow = useMemo(() => {
    const found = RECOMMENDED_TORQUE_TABLE.find((r) => r.metricSize === selectedBoltSize);
    return found || filteredTorqueTable[0] || RECOMMENDED_TORQUE_TABLE[7];
  }, [selectedBoltSize, filteredTorqueTable]);

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateWaLink = (msg: string) => {
    return `https://wa.me/6281119168752?text=${encodeURIComponent(msg)}`;
  };

  const handleResetActiveTab = () => {
    if (activeTab === 'pressure') {
      setPressureMode('calcPressure');
      setLoadTonInput(7.5);
      setBoreMmInput(140);
      setPressureBarInput(140);
    } else if (activeTab === 'thickness') {
      setOdMm(273);
      setIdMm(225);
      setThickPressureBar(300);
      setMaterialKey('stkm13c');
    } else if (activeTab === 'bolt') {
      setBoltPressureBar(300);
      setBoltTubeIdMm(225);
      setBoltDiaMm(43);
      setBoltQty(4);
      setBoltGrade('8.8');
    } else if (activeTab === 'weight') {
      setWeightType('round');
      setRoundOd(65);
      setRoundId(0);
      setRoundLength(220);
      setPlateLength(250);
      setPlateWidth(130);
      setPlateHeight(10);
      setDensity(7850);
    } else if (activeTab === 'torque') {
      setTorqueSearch('');
      setSelectedBoltSize('M24');
      setTorqueGrade('8.8');
      setTorqueUnit('Nm');
    }
  };

  // Shared CAD SVG Renderer (Prefix prevents duplicate SVG <defs> IDs between mobile sticky monitor & desktop HUD)
  const renderCadSvg = (tab: CalculatorTab, idPrefix: string) => {
    if (tab === 'pressure') {
      const chamberHeight = Math.min(84, Math.max(30, (boreMmInput / 320) * 84));
      const chamberY = 68 - chamberHeight / 2;
      const pistonX = 190;
      const rodHeight = Math.max(14, chamberHeight * 0.45);
      const rodY = 68 - rodHeight / 2;

      return (
        <svg viewBox="0 0 520 135" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`${idPrefix}fluidGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D3232A" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D3232A" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`${idPrefix}rodGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          <rect x="30" y="18" width="300" height="100" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          <rect
            x="42"
            y={chamberY}
            width="276"
            height={chamberHeight}
            fill="#0B1120"
            stroke="#D3232A"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <rect
            x="44"
            y={chamberY + 1}
            width={pistonX - 44}
            height={chamberHeight - 2}
            fill={`url(#${idPrefix}fluidGrad)`}
          />
          <rect
            x={pistonX}
            y={chamberY + 1}
            width="26"
            height={chamberHeight - 2}
            fill="#64748B"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            rx="2"
          />
          <rect
            x={pistonX + 26}
            y={rodY}
            width="240"
            height={rodHeight}
            fill={`url(#${idPrefix}rodGrad)`}
            stroke="#64748B"
            strokeWidth="1.5"
            rx="2"
          />
          <path
            d={`M 75 68 L ${pistonX - 12} 68 M ${pistonX - 22} 62 L ${pistonX - 10} 68 L ${pistonX - 22} 74`}
            stroke="#F87171"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="18" r="6" fill="#D3232A" stroke="#F87171" strokeWidth="1.5" />
          <circle cx="290" cy="18" r="6" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
        </svg>
      );
    }

    if (tab === 'thickness') {
      const cx = 120;
      const cy = 80;
      const maxR = 60;
      const rOd = maxR;
      const ratioId = Math.min(0.92, Math.max(0.25, idMm / odMm));
      const rId = ratioId * rOd;
      const ratioMax = Math.min(0.96, Math.max(ratioId, thicknessResult.overSizeDimMax / odMm));
      const rMax = ratioMax * rOd;

      const isSafeWall = thicknessResult.statusText === 'Recomended';
      const isMaxed = thicknessResult.statusText === "It's Maxed";
      const wallColor = isSafeWall ? '#1E293B' : isMaxed ? '#3730A3' : '#450A0A';
      const strokeColor = isSafeWall ? '#38BDF8' : isMaxed ? '#F59E0B' : '#EF4444';
      const limitColor = isSafeWall ? '#38BDF8' : '#F59E0B';

      return (
        <svg viewBox="0 0 520 160" preserveAspectRatio="xMidYMid meet">
          <line x1={cx - 70} y1={cy} x2={cx + 70} y2={cy} stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
          <line x1={cx} y1={cy - 70} x2={cx} y2={cy + 70} stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx={cx} cy={cy} r={rOd} fill={wallColor} stroke={strokeColor} strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r={rMax} fill="rgba(56, 189, 248, 0.12)" stroke={limitColor} strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx={cx} cy={cy} r={rId} fill="#0B1120" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="3" fill="#D3232A" />

          <g transform="translate(225, 15)">
            <rect x="0" y="0" width="280" height="130" rx="8" fill="#0B1120" stroke="#1E293B" strokeWidth="1" />
            <circle cx="15" cy="22" r="4" fill="#38BDF8" />
            <text x="28" y="26" fill="#94A3B8" fontSize="11" fontFamily="monospace">Diameter Luar (OD):</text>
            <text x="265" y="26" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">Ø {odMm} mm</text>

            <circle cx="15" cy="48" r="4" fill="#CBD5E1" />
            <text x="28" y="52" fill="#94A3B8" fontSize="11" fontFamily="monospace">Diameter Dalam (ID):</text>
            <text x="265" y="52" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">Ø {idMm} mm</text>

            <circle cx="15" cy="74" r="4" fill={limitColor} />
            <text x="28" y="78" fill="#94A3B8" fontSize="11" fontFamily="monospace">Batas ID Honing Maks:</text>
            <text x="265" y="78" fill={limitColor} fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">Ø {thicknessResult.overSizeDimMax} mm</text>

            <line x1="12" y1="92" x2="268" y2="92" stroke="#1E293B" strokeWidth="1" />
            <text x="15" y="112" fill="#64748B" fontSize="10" fontFamily="monospace">Sisa Batas Honing:</text>
            <text x="265" y="112" fill={overSizeSafetyAllowance > 0 ? '#4ADE80' : '#F87171'} fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              {overSizeSafetyAllowance > 0 ? `+${overSizeSafetyAllowance} mm` : 'HABIS (0 mm)'}
            </text>
          </g>
        </svg>
      );
    }

    if (tab === 'bolt') {
      const cx = 120;
      const cy = 80;
      const rFlange = 62;
      const rPcd = 48;
      const rBore = 25;

      const bolts = [];
      for (let i = 0; i < boltQty; i++) {
        const angle = (2 * Math.PI * i) / boltQty - Math.PI / 2;
        bolts.push({
          bx: cx + rPcd * Math.cos(angle),
          by: cy + rPcd * Math.sin(angle)
        });
      }

      const boltColor = boltResult.isSafe ? '#22C55E' : '#EF4444';
      const boltStroke = boltResult.isSafe ? '#4ADE80' : '#F87171';

      return (
        <svg viewBox="0 0 520 160" preserveAspectRatio="xMidYMid meet">
          <rect x={cx - rFlange} y={cy - rFlange} width={rFlange * 2} height={rFlange * 2} rx="14" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={rPcd} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={rBore} fill="#0B1120" stroke="#D3232A" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={rBore * 0.55} fill="rgba(211, 35, 42, 0.25)" />
          <circle cx={cx} cy={cy} r="3" fill="#EF4444" />
          <text x={cx} y={cy + 4} fill="#F87171" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">P</text>

          {bolts.map((b, idx) => (
            <g key={idx}>
              <circle cx={b.bx} cy={b.by} r="6.5" fill="#0B1120" stroke="#334155" strokeWidth="1.5" />
              <circle cx={b.bx} cy={b.by} r="4" fill={boltColor} stroke={boltStroke} strokeWidth="1" />
            </g>
          ))}

          <g transform="translate(225, 15)">
            <rect x="0" y="0" width="280" height="130" rx="8" fill="#0B1120" stroke="#1E293B" strokeWidth="1" />
            <circle cx="15" cy="22" r="4" fill="#38BDF8" />
            <text x="28" y="26" fill="#94A3B8" fontSize="11" fontFamily="monospace">Susunan Baut:</text>
            <text x="265" y="26" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">{boltQty}x M{boltDiaMm} (Gr {boltGrade})</text>

            <circle cx="15" cy="48" r="4" fill="#EF4444" />
            <text x="28" y="52" fill="#94A3B8" fontSize="11" fontFamily="monospace">Gaya Silinder × SF 2:</text>
            <text x="265" y="52" fill="#F87171" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">{(boltResult.safetyFactorCylinderForceN / 1000).toFixed(1)} kN</text>

            <circle cx="15" cy="74" r="4" fill={boltColor} />
            <text x="28" y="78" fill="#94A3B8" fontSize="11" fontFamily="monospace">Total Kapasitas Baut:</text>
            <text x="265" y="78" fill={boltColor} fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">{(boltResult.totalBoltForceN / 1000).toFixed(1)} kN</text>

            <line x1="12" y1="92" x2="268" y2="92" stroke="#1E293B" strokeWidth="1" />
            <text x="15" y="112" fill="#64748B" fontSize="10" fontFamily="monospace">Status:</text>
            <text x="265" y="112" fill={boltResult.isSafe ? '#4ADE80' : '#EF4444'} fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              {boltResult.isSafe ? `AMAN (SF ${boltResult.safetyFactor}x)` : 'TIDAK AMAN (OVERLOAD)'}
            </text>
          </g>
        </svg>
      );
    }

    if (tab === 'weight') {
      // Dynamic geometry for Round Bar / Hollow Tube
      const barLen = Math.min(165, Math.max(68, 68 + (roundLength / 2000) * 97));
      const xLeft = Math.round(115 - barLen / 2);
      const xRight = Math.round(115 + barLen / 2);
      const ryOd = Math.min(46, Math.max(16, 16 + (roundOd / 350) * 30));
      const rxOd = Math.round(ryOd * 0.45 * 10) / 10;
      const cy = 74;
      const yTop = cy - ryOd;
      const yBot = cy + ryOd;

      const idRatio = roundOd > 0 ? Math.min(0.88, Math.max(0, roundId / roundOd)) : 0;
      const ryId = Math.max(idRatio > 0 ? 4 : 0, Math.round(ryOd * idRatio * 10) / 10);
      const rxId = Math.max(idRatio > 0 ? 2.5 : 0, Math.round(rxOd * idRatio * 10) / 10);

      // Dynamic geometry for 3D Isometric Plate
      const pL = Math.min(95, Math.max(42, 42 + (plateLength / 2000) * 53));
      const pW = Math.min(75, Math.max(34, 34 + (plateWidth / 1500) * 41));
      const pT = Math.min(34, Math.max(6, 6 + (plateHeight / 150) * 28));

      const pCx = 115;
      const pCy = 76 - pT / 2;
      // Isometric projection vectors
      const dxL = pL * 0.86;
      const dyL = pL * 0.28;
      const dxW = pW * 0.78;
      const dyW = -pW * 0.34;

      const ptLeft = { x: pCx - (dxL + dxW) / 2, y: pCy - (dyL + dyW) / 2 };
      const ptTop = { x: ptLeft.x + dxW, y: ptLeft.y + dyW };
      const ptRight = { x: ptTop.x + dxL, y: ptTop.y + dyL };
      const ptFront = { x: ptLeft.x + dxL, y: ptLeft.y + dyL };

      return (
        <svg viewBox="0 0 520 160" preserveAspectRatio="xMidYMid meet">
          {weightType === 'round' ? (
            <g>
              <defs>
                <linearGradient id={`${idPrefix}metalBody`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
              </defs>

              {/* Dynamic Cylinder Body */}
              <path
                d={`M ${xLeft} ${yTop} L ${xRight} ${yTop} A ${rxOd} ${ryOd} 0 0 1 ${xRight} ${yBot} L ${xLeft} ${yBot} A ${rxOd} ${ryOd} 0 0 1 ${xLeft} ${yTop}`}
                fill={`url(#${idPrefix}metalBody)`}
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <ellipse cx={xRight} cy={cy} rx={rxOd} ry={ryOd} fill="#1E293B" stroke="#475569" strokeWidth="1.2" strokeDasharray="3 3" />
              <ellipse cx={xLeft} cy={cy} rx={rxOd} ry={ryOd} fill="#334155" stroke="#38BDF8" strokeWidth="2" />

              {/* Dynamic Inner Hollow Bore (if ID > 0) */}
              {roundId > 0 && (
                <>
                  <line x1={xLeft} y1={cy - ryId} x2={xRight} y2={cy - ryId} stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                  <line x1={xLeft} y1={cy + ryId} x2={xRight} y2={cy + ryId} stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                  <ellipse
                    cx={xLeft}
                    cy={cy}
                    rx={rxId}
                    ry={ryId}
                    fill="#0B1120"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* Centerline & Length Dimension */}
              <line x1={xLeft - 14} y1={cy} x2={xRight + 14} y2={cy} stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
              <line x1={xLeft} y1="134" x2={xRight} y2="134" stroke="#94A3B8" strokeWidth="1.5" />
              <path d={`M ${xLeft + 5} 131 L ${xLeft} 134 L ${xLeft + 5} 137 M ${xRight - 5} 131 L ${xRight} 134 L ${xRight - 5} 137`} stroke="#94A3B8" strokeWidth="1.5" fill="none" />
              <text x="115" y="149" fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">L: {roundLength} mm (Ø{roundOd})</text>

              {/* Unified Right Callout Panel */}
              <g transform="translate(225, 15)">
                <rect x="0" y="0" width="280" height="130" rx="8" fill="#0B1120" stroke="#1E293B" strokeWidth="1" />
                <circle cx="15" cy="24" r="4" fill="#38BDF8" />
                <text x="28" y="28" fill="#94A3B8" fontSize="11" fontFamily="monospace">Tipe Material:</text>
                <text x="265" y="28" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">{roundId > 0 ? 'Pipa / Hollow Tube' : 'As Pejal (Solid)'}</text>

                <circle cx="15" cy="52" r="4" fill="#CBD5E1" />
                <text x="28" y="56" fill="#94A3B8" fontSize="11" fontFamily="monospace">Dimensi OD × ID:</text>
                <text x="265" y="56" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">Ø{roundOd} × Ø{roundId} mm</text>

                <circle cx="15" cy="78" r="4" fill="#94A3B8" />
                <text x="28" y="82" fill="#94A3B8" fontSize="11" fontFamily="monospace">Panjang × ρ:</text>
                <text x="265" y="82" fill="#CBD5E1" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">{roundLength}mm ({density})</text>

                <line x1="12" y1="94" x2="268" y2="94" stroke="#1E293B" strokeWidth="1" />
                <text x="15" y="114" fill="#64748B" fontSize="10" fontFamily="monospace">Berat Total:</text>
                <text x="265" y="115" fill="#FF4D55" fontSize="13" fontWeight="bold" textAnchor="end" fontFamily="monospace">{roundWeightResult} Kg</text>
              </g>
            </g>
          ) : (
            <g>
              {/* Top Face */}
              <polygon
                points={`${ptLeft.x},${ptLeft.y} ${ptTop.x},${ptTop.y} ${ptRight.x},${ptRight.y} ${ptFront.x},${ptFront.y}`}
                fill="#334155"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              {/* Left Extrusion Face */}
              <polygon
                points={`${ptLeft.x},${ptLeft.y} ${ptFront.x},${ptFront.y} ${ptFront.x},${ptFront.y + pT} ${ptLeft.x},${ptLeft.y + pT}`}
                fill="#1E293B"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              {/* Right Extrusion Face */}
              <polygon
                points={`${ptFront.x},${ptFront.y} ${ptRight.x},${ptRight.y} ${ptRight.x},${ptRight.y + pT} ${ptFront.x},${ptFront.y + pT}`}
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1.5"
              />

              <text x="115" y="147" fill="#38BDF8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {plateLength} × {plateWidth} × {plateHeight} mm
              </text>

              {/* Unified Right Callout Panel */}
              <g transform="translate(225, 15)">
                <rect x="0" y="0" width="280" height="130" rx="8" fill="#0B1120" stroke="#1E293B" strokeWidth="1" />
                <circle cx="15" cy="24" r="4" fill="#38BDF8" />
                <text x="28" y="28" fill="#94A3B8" fontSize="11" fontFamily="monospace">Bentuk Komponen:</text>
                <text x="265" y="28" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">Plat / Flange Kotak</text>

                <circle cx="15" cy="52" r="4" fill="#CBD5E1" />
                <text x="28" y="56" fill="#94A3B8" fontSize="11" fontFamily="monospace">Panjang × Lebar:</text>
                <text x="265" y="56" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">{plateLength} × {plateWidth} mm</text>

                <circle cx="15" cy="78" r="4" fill="#94A3B8" />
                <text x="28" y="82" fill="#94A3B8" fontSize="11" fontFamily="monospace">Tebal × ρ:</text>
                <text x="265" y="82" fill="#CBD5E1" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">{plateHeight} mm ({density})</text>

                <line x1="12" y1="94" x2="268" y2="94" stroke="#1E293B" strokeWidth="1" />
                <text x="15" y="114" fill="#64748B" fontSize="10" fontFamily="monospace">Berat Total:</text>
                <text x="265" y="115" fill="#FF4D55" fontSize="13" fontWeight="bold" textAnchor="end" fontFamily="monospace">{plateWeightResult} Kg</text>
              </g>
            </g>
          )}
        </svg>
      );
    }

    // Torque
    const cx = 110;
    const cy = 80;
    const hexR = 46;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      pts.push(`${cx + hexR * Math.cos(a)},${cy + hexR * Math.sin(a)}`);
    }
    const lowVal = activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 8, torqueGrade, torqueUnit) : 0;
    const medVal = activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 25, torqueGrade, torqueUnit) : 0;
    const highVal = activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 50, torqueGrade, torqueUnit) : 0;

    return (
      <svg viewBox="0 0 520 160" preserveAspectRatio="xMidYMid meet">
        <polygon points={pts.join(' ')} fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="32" fill="#0B1120" stroke="#475569" strokeWidth="1.5" />

        <text x={cx} y={cy - 5} fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          {activeTorqueRow ? activeTorqueRow.metricSize : selectedBoltSize}
        </text>
        <text x={cx} y={cy + 13} fill="#D3232A" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          GR {torqueGrade}
        </text>

        <path
          d="M 110 22 A 58 58 0 0 1 168 80"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="168,80 162,68 174,72" fill="#F59E0B" />
        <text x="160" y="38" fill="#F59E0B" fontSize="10" fontWeight="bold" fontFamily="monospace">T (CW)</text>

        <g transform="translate(190, 20)">
          <rect x="15" y="28" width="30" height="74" fill="#0B1120" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="15" y1="40" x2="45" y2="40" stroke="#475569" strokeWidth="1" />
          <line x1="15" y1="52" x2="45" y2="52" stroke="#475569" strokeWidth="1" />
          <line x1="15" y1="64" x2="45" y2="64" stroke="#475569" strokeWidth="1" />
          <line x1="15" y1="76" x2="45" y2="76" stroke="#475569" strokeWidth="1" />
          <line x1="15" y1="88" x2="45" y2="88" stroke="#475569" strokeWidth="1" />

          <path d="M 30 16 L 30 26 M 26 22 L 30 26 L 34 22" stroke="#4ADE80" strokeWidth="2" />
          <path d="M 30 114 L 30 104 M 26 108 L 30 104 L 34 108" stroke="#4ADE80" strokeWidth="2" />
          <text x="30" y="9" fill="#4ADE80" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">F_clamp</text>
        </g>

        <g transform="translate(255, 15)">
          <rect x="0" y="0" width="250" height="130" rx="8" fill="#0B1120" stroke="#1E293B" strokeWidth="1" />
          <text x="14" y="24" fill="#94A3B8" fontSize="11" fontFamily="monospace">Pneumatik (≤ 10 Bar):</text>
          <text x="235" y="24" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
            {lowVal > 0 ? `${lowVal} ${torqueUnit}` : '—'}
          </text>

          <text x="14" y="54" fill="#94A3B8" fontSize="11" fontFamily="monospace">{isId ? 'Menengah (10-35 Bar):' : 'Medium (10-35 Bar):'}</text>
          <text x="235" y="54" fill="#F8FAFC" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
            {medVal > 0 ? `${medVal} ${torqueUnit}` : '—'}
          </text>

          <text x="14" y="84" fill="#F87171" fontSize="11" fontFamily="monospace">Hidrolik (&gt; 35 Bar):</text>
          <text x="235" y="84" fill="#EF4444" fontSize="13" fontWeight="bold" textAnchor="end" fontFamily="monospace">
            {highVal > 0 ? `${highVal} ${torqueUnit}` : '—'}
          </text>

          <line x1="12" y1="100" x2="238" y2="100" stroke="#1E293B" strokeWidth="1" />
          <text x="14" y="118" fill="#64748B" fontSize="10" fontFamily="monospace">Alat Ukur:</text>
          <text x="235" y="118" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">Kunci Torsi Terkalibrasi</text>
        </g>
      </svg>
    );
  };

  // Module metadata for Mobile App Top Bar
  const activeModuleMeta = useMemo(() => {
    switch (activeTab) {
      case 'pressure':
        return {
          title: isId ? 'Tekanan & Beban Silinder' : 'Pressure & Thrust Load',
          badge: 'ISO 10100'
        };
      case 'thickness':
        return {
          title: isId ? 'Tebal Tube & Batas Honing' : 'Tube Wall & Honing Limit',
          badge: 'Lamé Stress'
        };
      case 'bolt':
        return {
          title: isId ? 'Kekuatan Baut Tie-Rod' : 'Tie-Rod Bolt Safety',
          badge: 'VDI 2230'
        };
      case 'weight':
        return {
          title: isId ? 'Berat Material & Pipa' : 'Component Mass & Weight',
          badge: 'ASTM A519'
        };
      case 'torque':
        return {
          title: isId ? 'Tabel Torsi Baut' : 'Bolt Torque Matrix',
          badge: 'ISO 898-1'
        };
    }
  }, [activeTab, isId]);

  return (
    <div className="belsa-calc-page">
      <div className="belsa-container">
        
        {/* Desktop Header & Title (Hidden on Mobile App Mode via CSS) */}
        <section className="belsa-page-header belsa-calc-desktop-hero" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{
              background: '#FEF2F2',
              color: 'var(--belsa-red)',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              ISO 9001:2015 Certified
            </span>
            <span style={{
              background: '#F1F5F9',
              color: '#475569',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              Est. 2017
            </span>
          </div>

          <h1 className="heading-hero" style={{ maxWidth: '920px', margin: '0 auto 16px', lineHeight: 1.25 }}>
            {isId ? (
              <>
                Kalkulator Teknik <span style={{ color: 'var(--belsa-red)' }}>Silinder & Hidrolik</span>
              </>
            ) : (
              <>
                Cylinder & Fluid Power <span style={{ color: 'var(--belsa-red)' }}>Engineering Calculator</span>
              </>
            )}
          </h1>
          <p className="subhead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            {isId
              ? 'Alat hitung untuk silinder hidrolik dan pneumatik: tekanan dan beban kerja, tebal dinding tube, batas oversize honing, kekuatan baut tie rod, berat material, dan torsi pengencangan baut.'
              : 'Engineering calculation suite for hydraulic & pneumatic cylinders: pressure, thrust load, tube wall thickness & honing limit, tie-rod bolt force safety, component weight, and bolt tightening torque.'}
          </p>
        </section>

        {/* Desktop 5-Module Navigation Bar (Hidden on Mobile App Mode via CSS) */}
        <nav className="belsa-calc-nav">
          <button
            type="button"
            onClick={() => switchTab('pressure')}
            className={`belsa-calc-tab-btn ${activeTab === 'pressure' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{isId ? 'Tekanan & Beban' : 'Pressure & Load'}</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('thickness')}
            className={`belsa-calc-tab-btn ${activeTab === 'thickness' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" strokeDasharray="3 3" />
            </svg>
            <span>{isId ? 'Tebal Tube & Honing' : 'Tube & Honing'}</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('bolt')}
            className={`belsa-calc-tab-btn ${activeTab === 'bolt' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{isId ? 'Kekuatan Baut' : 'Bolt Force'}</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('weight')}
            className={`belsa-calc-tab-btn ${activeTab === 'weight' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 3v18m-8-7l4-9 4 9H4zm12 0l4-9 4 9h-8z" />
            </svg>
            <span>{isId ? 'Berat Material' : 'Weight & Mass'}</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('torque')}
            className={`belsa-calc-tab-btn ${activeTab === 'torque' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>{isId ? 'Tabel Torsi Baut' : 'Torque Lookup'}</span>
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* MOBILE POCKET ENGINEER APP: COMPACT TOP BAR + STICKY LIVE CAD MONITOR     */}
        {/* ========================================================================= */}
        <div className="belsa-calc-mobile-appbar">
          <div className="belsa-calc-mobile-appbar-left">
            <span className="belsa-calc-mobile-dot" />
            <span className="belsa-calc-mobile-app-title">{activeModuleMeta.title}</span>
            <span className="belsa-calc-mobile-std-pill">{activeModuleMeta.badge}</span>
          </div>
          <button
            type="button"
            onClick={handleResetActiveTab}
            className="belsa-calc-mobile-reset-btn"
            title={isId ? 'Reset Parameter' : 'Reset Parameters'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>

        {/* Sticky Live CAD & Telemetry Monitor (Mobile Only) */}
        <div className="belsa-calc-mobile-monitor">
          <div className="belsa-calc-mobile-monitor-bar">
            <div className="belsa-calc-mobile-monitor-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span>{isId ? 'LIVE CAD & TELEMETRI' : 'LIVE CAD & TELEMETRY'}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileCadExpanded(!mobileCadExpanded)}
              className="belsa-calc-mobile-cad-toggle"
            >
              <span>{mobileCadExpanded ? (isId ? 'Sembunyikan CAD ▴' : 'Compact ▴') : (isId ? 'Tampilkan CAD ▾' : 'Show CAD ▾')}</span>
            </button>
          </div>

          {mobileCadExpanded && (
            <div key={`cad-${activeTab}-${pressureMode}-${weightType}`} className="belsa-calc-mobile-svg-stage belsa-calc-cad-enter" style={{ position: 'relative' }}>
              {isToolSwitching && (
                <div className="belsa-calc-cad-skull-shimmer">
                  <div className="belsa-calc-cad-skull-spinner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'belsaSpin 0.85s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.22" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    <span>{isId ? 'Memuat Modul CAD...' : 'Loading CAD Module...'}</span>
                  </div>
                </div>
              )}
              {renderCadSvg(activeTab, 'mob-')}
            </div>
          )}

          {/* Integrated 3-Col Live Telemetry Readout */}
          {activeTab === 'pressure' && (
            <div className="belsa-calc-mobile-telemetry">
              <div className="belsa-calc-mobile-tel-item is-primary">
                <span className="belsa-calc-mobile-tel-lbl">
                  {pressureMode === 'calcPressure' ? (isId ? 'TEKANAN KERJA' : 'PRESSURE') : (isId ? 'KAPASITAS BEBAN' : 'THRUST LOAD')}
                </span>
                <span className="belsa-calc-mobile-tel-val">
                  {pressureMode === 'calcPressure' ? `${pressureResult.pressureBar} Bar` : `${loadResult.loadTon} Ton`}
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'GAYA DORONG' : 'PUSH FORCE'}</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: '#38BDF8' }}>
                  {pressureMode === 'calcPressure' ? `${pressureResult.pushForceKn} kN` : `${((loadResult.loadKg * 9.80665) / 1000).toFixed(1)} kN`}
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'LUAS PISTON' : 'PISTON AREA'}</span>
                <span className="belsa-calc-mobile-tel-val">{pressureResult.areaCm2} cm²</span>
              </div>
            </div>
          )}

          {activeTab === 'thickness' && (
            <div className="belsa-calc-mobile-telemetry">
              <div className="belsa-calc-mobile-tel-item is-primary">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'MAX ID HONING' : 'MAX HONING ID'}</span>
                <span className="belsa-calc-mobile-tel-val">Ø {thicknessResult.overSizeDimMax} mm</span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'SISA HONING' : 'ALLOWANCE'}</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: overSizeSafetyAllowance > 0 ? '#4ADE80' : '#F87171' }}>
                  {overSizeSafetyAllowance > 0 ? `+${overSizeSafetyAllowance} mm` : '0 mm'}
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">SAFETY FACTOR</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: thicknessResult.safetyFactor >= 2.13 ? '#4ADE80' : '#F59E0B' }}>
                  {thicknessResult.safetyFactor}x ({thicknessResult.tActual}mm)
                </span>
              </div>
            </div>
          )}

          {activeTab === 'bolt' && (
            <div className="belsa-calc-mobile-telemetry">
              <div className="belsa-calc-mobile-tel-item is-primary">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'KAPASITAS BAUT' : 'BOLT CAPACITY'}</span>
                <span className="belsa-calc-mobile-tel-val">{(boltResult.totalBoltForceN / 1000).toFixed(1)} kN</span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'GAYA × SF 2' : 'LOAD × SF 2'}</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: '#F87171' }}>
                  {(boltResult.safetyFactorCylinderForceN / 1000).toFixed(1)} kN
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">STATUS</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: boltResult.isSafe ? '#4ADE80' : '#EF4444' }}>
                  {boltResult.isSafe ? `SAFE (${boltResult.safetyFactor}x)` : 'OVERLOAD'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'weight' && (
            <div className="belsa-calc-mobile-telemetry">
              <div className="belsa-calc-mobile-tel-item is-primary">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'BERAT BERSIH' : 'NET WEIGHT'}</span>
                <span className="belsa-calc-mobile-tel-val">
                  {weightType === 'round' ? roundWeightResult : plateWeightResult} Kg
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'DALAM POUND' : 'IN POUNDS'}</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: '#38BDF8' }}>
                  {((weightType === 'round' ? roundWeightResult : plateWeightResult) * 2.20462).toFixed(1)} Lbs
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'MASSA JENIS' : 'DENSITY'}</span>
                <span className="belsa-calc-mobile-tel-val">{density} kg/m³</span>
              </div>
            </div>
          )}

          {activeTab === 'torque' && (
            <div className="belsa-calc-mobile-telemetry">
              <div className="belsa-calc-mobile-tel-item is-primary">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'TORSI (>35 BAR)' : 'HIGH (>35 BAR)'}</span>
                <span className="belsa-calc-mobile-tel-val">
                  {activeTorqueRow ? `${getRecommendedTorque(activeTorqueRow, 50, torqueGrade, torqueUnit)} ${torqueUnit}` : '—'}
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">10–35 BAR</span>
                <span className="belsa-calc-mobile-tel-val" style={{ color: '#38BDF8' }}>
                  {activeTorqueRow ? `${getRecommendedTorque(activeTorqueRow, 25, torqueGrade, torqueUnit)} ${torqueUnit}` : '—'}
                </span>
              </div>
              <div className="belsa-calc-mobile-tel-item">
                <span className="belsa-calc-mobile-tel-lbl">{isId ? 'UKURAN BAUT' : 'SELECTED BOLT'}</span>
                <span className="belsa-calc-mobile-tel-val">
                  {activeTorqueRow ? activeTorqueRow.metricSize : selectedBoltSize} (Gr {torqueGrade})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ANIMATED TOOL STAGE WITH SKULL SHIMMER TRANSITION                         */}
        {/* ========================================================================= */}
        <div
          key={activeTab}
          className={`belsa-calc-tool-stage slide-${slideDir} ${isToolSwitching ? 'is-switching' : ''}`}
        >
          {isToolSwitching && (
            <div className="belsa-calc-tool-skull-overlay" aria-hidden="true">
              <div className="belsa-calc-tool-skull-card">
                <div className="belsa-calc-tool-skull-header">
                  <div className="belsa-image-skeleton" style={{ width: '48%', height: '20px', borderRadius: '6px' }} />
                  <div className="belsa-image-skeleton" style={{ width: '24%', height: '18px', borderRadius: '6px' }} />
                </div>
                <div className="belsa-image-skeleton" style={{ width: '100%', height: '42px', borderRadius: '10px', marginBottom: '16px' }} />
                <div className="belsa-image-skeleton" style={{ width: '100%', height: '64px', borderRadius: '12px', marginBottom: '14px' }} />
                <div className="belsa-image-skeleton" style={{ width: '100%', height: '64px', borderRadius: '12px' }} />
                <div className="belsa-calc-tool-skull-badge">
                  <div className="belsa-calc-tool-skull-ring">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D3232A" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'belsaSpin 0.9s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  </div>
                  <span>{isId ? 'Memuat Alat Hitung...' : 'Loading Calculator Tool...'}</span>
                </div>
              </div>
            </div>
          )}

        {/* ========================================================================= */}
        {/* MODULE 1: PRESSURE & LOAD CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'pressure' && (
          <div className="belsa-calc-grid-2col">
            
            {/* Left Col: Parameter Input Station */}
            <div className="belsa-calc-card">
              <div className="belsa-calc-card-header">
                <div className="belsa-calc-card-title">
                  <svg viewBox="0 0 24 24"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
                  <span>{isId ? 'Data Silinder' : 'Cylinder Design Parameters'}</span>
                </div>
                <span className="belsa-calc-badge-excel">{isId ? 'Metode: P = F / A' : 'Method: ISO 10100 Standard'}</span>
              </div>

              {/* Mode Switcher */}
              <div className="belsa-calc-mode-switch">
                <button
                  type="button"
                  onClick={() => setPressureMode('calcPressure')}
                  className={`belsa-calc-mode-btn ${pressureMode === 'calcPressure' ? 'active' : ''}`}
                >
                  {isId ? '1. Hitung Tekanan (dari Beban)' : '1. Calculate Pressure'}
                </button>
                <button
                  type="button"
                  onClick={() => setPressureMode('calcLoad')}
                  className={`belsa-calc-mode-btn ${pressureMode === 'calcLoad' ? 'active' : ''}`}
                >
                  {isId ? '2. Hitung Beban (dari Tekanan)' : '2. Calculate Load'}
                </button>
              </div>

              {pressureMode === 'calcPressure' ? (
                <div className="belsa-calc-form-group">
                  <div className="belsa-calc-label-row">
                    <label className="belsa-calc-label">
                      {isId ? 'Beban Kerja Silinder:' : 'Cylinder Target Work Load:'}
                    </label>
                    <span className="belsa-calc-label-val">
                      {loadTonInput} Ton ({(loadTonInput * 1000).toLocaleString('id-ID')} Kg)
                    </span>
                  </div>
                  <div className="belsa-calc-input-row">
                    <button
                      type="button"
                      className="belsa-calc-stepper-btn"
                      onClick={() => setLoadTonInput((v) => Math.max(0.5, Math.round((v - 0.5) * 10) / 10))}
                      aria-label="Decrease load"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0.1"
                      max="500"
                      value={loadTonInput}
                      onChange={(e) => setLoadTonInput(parseFloat(e.target.value) || 0)}
                      className="belsa-calc-input"
                    />
                    <button
                      type="button"
                      className="belsa-calc-stepper-btn"
                      onClick={() => setLoadTonInput((v) => Math.min(500, Math.round((v + 0.5) * 10) / 10))}
                      aria-label="Increase load"
                    >
                      +
                    </button>
                    <span className="belsa-calc-unit-tag">Ton</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={loadTonInput}
                    onChange={(e) => setLoadTonInput(parseFloat(e.target.value))}
                    className="belsa-calc-range"
                  />
                  <div className="belsa-calc-preset-wrap">
                    {[2.5, 5, 10, 25, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLoadTonInput(preset)}
                        className={`belsa-calc-preset-chip ${loadTonInput === preset ? 'active' : ''}`}
                      >
                        {preset} Ton
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="belsa-calc-form-group">
                  <div className="belsa-calc-label-row">
                    <label className="belsa-calc-label">
                      {isId ? 'Tekanan Kerja Sistem:' : 'Working System Pressure:'}
                    </label>
                    <span className="belsa-calc-label-val">
                      {pressureBarInput} Bar ({(pressureBarInput * 0.1).toFixed(1)} MPa)
                    </span>
                  </div>
                  <div className="belsa-calc-input-row">
                    <button
                      type="button"
                      className="belsa-calc-stepper-btn"
                      onClick={() => setPressureBarInput((v) => Math.max(5, v - 5))}
                      aria-label="Decrease pressure"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="1"
                      min="1"
                      max="400"
                      value={pressureBarInput}
                      onChange={(e) => setPressureBarInput(parseFloat(e.target.value) || 0)}
                      className="belsa-calc-input"
                    />
                    <button
                      type="button"
                      className="belsa-calc-stepper-btn"
                      onClick={() => setPressureBarInput((v) => Math.min(400, v + 5))}
                      aria-label="Increase pressure"
                    >
                      +
                    </button>
                    <span className="belsa-calc-unit-tag">Bar</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="350"
                    step="5"
                    value={pressureBarInput}
                    onChange={(e) => setPressureBarInput(parseFloat(e.target.value))}
                    className="belsa-calc-range"
                  />
                  <div className="belsa-calc-preset-wrap">
                    {[10, 70, 140, 210, 250, 350].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPressureBarInput(preset)}
                        className={`belsa-calc-preset-chip ${pressureBarInput === preset ? 'active' : ''}`}
                      >
                        {preset} Bar
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bore Diameter ID */}
              <div className="belsa-calc-form-group" style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">
                    {isId ? 'Diameter Bore (ID Tube):' : 'Cylinder Bore Diameter (ID Tube):'}
                  </label>
                  <span className="belsa-calc-label-val">Ø {boreMmInput} mm</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoreMmInput((v) => Math.max(20, v - 5))}
                    aria-label="Decrease bore"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="1"
                    min="20"
                    max="500"
                    value={boreMmInput}
                    onChange={(e) => setBoreMmInput(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoreMmInput((v) => Math.min(500, v + 5))}
                    aria-label="Increase bore"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">mm</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="350"
                  step="5"
                  value={boreMmInput}
                  onChange={(e) => setBoreMmInput(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
                <div className="belsa-calc-preset-wrap">
                  {[40, 50, 63, 80, 100, 125, 160, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBoreMmInput(preset)}
                      className={`belsa-calc-preset-chip ${boreMmInput === preset ? 'active' : ''}`}
                    >
                      Ø{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula Accordion */}
              <div className="belsa-calc-formula-accordion">
                <button
                  type="button"
                  onClick={() => setShowFormula(!showFormula)}
                  className="belsa-calc-formula-toggle"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
                    {isId ? 'Rumus Perhitungan' : 'Technical Formula Reference (ISO 10100)'}
                  </span>
                  <span>{showFormula ? '▲' : '▼'}</span>
                </button>
                {showFormula && (
                  <div className="belsa-calc-formula-body">
                    <strong>Hukum Pascal dan Luas Piston:</strong><br />
                    • Luas piston: <code>A = 0.25 × π × ID²</code> (cm²)<br />
                    • Tekanan kerja: <code>P = Load (kgf) / A (cm²)</code> (Bar)<br />
                    • Gaya dorong: <code>F = P × A × 0.0980665</code> (kN)
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Live Sticky HUD Cockpit */}
            <div className="belsa-calc-sticky-hud">
              <div className="belsa-calc-cockpit">
                
                {/* Top Deck: CAD Blueprint Visual (Desktop Only; Mobile uses Sticky Top Monitor) */}
                <div className="belsa-calc-cockpit-stage">
                  <div className="belsa-calc-cockpit-header">
                    <div className="belsa-calc-cockpit-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      <span>{isId ? 'Potongan Silinder' : 'Dynamic Cylinder Cross-Section'}</span>
                    </div>
                    <span className="belsa-calc-cockpit-tag">{isId ? 'Gambar CAD' : 'CAD Blueprint'}</span>
                  </div>

                  <div className="belsa-calc-svg-wrapper">
                    {renderCadSvg('pressure', 'desk-')}
                  </div>

                  <div className="belsa-calc-diagram-specs">
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Bore (ID)</span>
                      <span className="belsa-calc-diagram-spec-val">Ø {boreMmInput} mm</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Luas Piston (A)</span>
                      <span className="belsa-calc-diagram-spec-val">{pressureResult.areaCm2} cm²</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Gaya Dorong (F)</span>
                      <span className="belsa-calc-diagram-spec-val" style={{ color: '#38BDF8' }}>
                        {pressureMode === 'calcPressure' ? `${pressureResult.pushForceKn} kN` : `${((loadResult.loadKg * 9.80665) / 1000).toFixed(1)} kN`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Deck: Results & Actions */}
                <div className="belsa-calc-cockpit-results">
                  <div className="belsa-calc-results-grid">
                    <div className="belsa-calc-result-box highlight">
                      <div className="belsa-calc-result-label">
                        <span>{pressureMode === 'calcPressure' ? 'Tekanan Kerja' : 'Kapasitas Dorong'}</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {pressureMode === 'calcPressure' ? (
                          <>
                            {pressureResult.pressureBar} <span className="belsa-calc-result-unit">Bar</span>
                          </>
                        ) : (
                          <>
                            {loadResult.loadTon} <span className="belsa-calc-result-unit">Ton</span>
                          </>
                        )}
                      </div>
                      <div className="belsa-calc-result-sub">
                        {pressureMode === 'calcPressure'
                          ? `= ${pressureResult.pressureMpa} MPa | ${pressureResult.pressurePsi} PSI`
                          : `= ${loadResult.loadKg.toLocaleString('id-ID')} Kgf | ${((loadResult.loadKg * 9.80665) / 1000).toFixed(1)} kN`}
                      </div>
                    </div>

                    <div className="belsa-calc-result-box">
                      <div className="belsa-calc-result-label">
                        <span>Luas Piston</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {pressureResult.areaCm2} <span className="belsa-calc-result-unit">cm²</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        Rumus: 0.25 × π × ID² (π = 3,14)
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="belsa-calc-rec-card">
                    <div className="belsa-calc-rec-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{isId ? 'Seri BELSA yang Sesuai:' : 'Recommended BELSA Series:'}</span>
                    </div>
                    <div className="belsa-calc-rec-list">
                      {recommendations.slice(0, 2).map((rec) => (
                        <Link key={rec.seriesId} href={rec.catalogueUrl} className="belsa-calc-rec-item">
                          <div style={{ flex: 1 }}>
                            <div className="belsa-calc-rec-code">{rec.seriesName}</div>
                            <div className="belsa-calc-rec-desc">{rec.ratedPressure} • {featuresLabel(rec.featuresSnippet)}</div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#D3232A', fontWeight: 700 }}>Lihat →</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="belsa-calc-actions">
                    <a
                      href={generateWaLink(
                        `Halo Tim BELSA, saya sudah menghitung silinder di kalkulator website:\n- Mode: ${pressureMode === 'calcPressure' ? 'Hitung Tekanan' : 'Hitung Beban'}\n- Beban: ${loadTonInput} Ton\n- Bore ID: Ø${boreMmInput} mm\n- Tekanan: ${activeCalculatedPressure} Bar\nMohon info ketersediaan seri dan penawaran harganya.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="belsa-calc-btn-wa"
                    >
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
                      <span>{isId ? 'Tanya via WhatsApp' : 'Consult via WhatsApp'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySummary(
                          `Spesifikasi Silinder BELSA:\n- Beban: ${loadTonInput} Ton\n- Bore: Ø${boreMmInput} mm\n- Tekanan: ${pressureResult.pressureBar} Bar (${pressureResult.pressureMpa} MPa)\n- Gaya: ${pressureResult.pushForceKn} kN`
                        )
                      }
                      className="belsa-calc-btn-copy"
                    >
                      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      <span>{copied ? (isId ? 'Tersalin' : 'Copied!') : (isId ? 'Salin Hasil' : 'Copy Specs')}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: TUBE WALL THICKNESS & HONING OVERSIZE */}
        {/* ========================================================================= */}
        {activeTab === 'thickness' && (
          <div className="belsa-calc-grid-2col">
            
            {/* Left Col: Parameter Input Station */}
            <div className="belsa-calc-card">
              <div className="belsa-calc-card-header">
                <div className="belsa-calc-card-title">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" strokeDasharray="3 3" /></svg>
                  <span>{isId ? 'Dimensi Tube & Material' : 'Tube Dimensions & Material'}</span>
                </div>
                <span className="belsa-calc-badge-excel">{isId ? 'Rumus: Lamé (dinding tebal)' : 'Formula: Lamé & Barlow Stress Analysis'}</span>
              </div>

              <div className="belsa-calc-form-group">
                <label className="belsa-calc-label" style={{ display: 'block', marginBottom: '8px' }}>
                  {isId ? '1. Material Tube:' : '1. Cylinder Tube Material:'}
                </label>
                <select
                  value={materialKey}
                  onChange={(e) => setMaterialKey(e.target.value)}
                  className="belsa-calc-select"
                  style={{ width: '100%' }}
                >
                  {Object.entries(CYLINDER_MATERIALS).map(([key, mat]) => (
                    <option key={key} value={key}>
                      {mat.name} — Tegangan izin: {mat.tensileStrength} kgf/mm² ({isId ? MATERIAL_DESC_ID[key] || mat.description : mat.description})
                    </option>
                  ))}
                </select>
              </div>

              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">{isId ? 'Diameter Luar Tube (OD):' : 'Tube Outer Diameter (OD):'}</label>
                  <span className="belsa-calc-label-val">{odMm} mm</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setOdMm((v) => Math.max(50, v - 5))}
                    aria-label="Decrease OD"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={odMm}
                    onChange={(e) => setOdMm(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setOdMm((v) => Math.min(500, v + 5))}
                    aria-label="Increase OD"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="1"
                  value={odMm}
                  onChange={(e) => setOdMm(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
              </div>

              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">{isId ? 'Bore / Diameter Dalam (ID):' : 'Inner Bore Diameter (ID):'}</label>
                  <span className="belsa-calc-label-val">{idMm} mm</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setIdMm((v) => Math.max(30, v - 5))}
                    aria-label="Decrease ID"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={idMm}
                    onChange={(e) => setIdMm(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setIdMm((v) => Math.min(Math.max(30, odMm - 2), v + 5))}
                    aria-label="Increase ID"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">mm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max={Math.max(30, odMm - 2)}
                  step="1"
                  value={idMm}
                  onChange={(e) => setIdMm(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
              </div>

              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">{isId ? 'Tekanan Kerja Desain:' : 'Design Working Pressure:'}</label>
                  <span className="belsa-calc-label-val">{thickPressureBar} Bar</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setThickPressureBar((v) => Math.max(10, v - 10))}
                    aria-label="Decrease pressure"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={thickPressureBar}
                    onChange={(e) => setThickPressureBar(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setThickPressureBar((v) => Math.min(450, v + 10))}
                    aria-label="Increase pressure"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">Bar</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="450"
                  step="10"
                  value={thickPressureBar}
                  onChange={(e) => setThickPressureBar(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
              </div>

              {/* Formula Accordion */}
              <div className="belsa-calc-formula-accordion">
                <button
                  type="button"
                  onClick={() => setShowFormula(!showFormula)}
                  className="belsa-calc-formula-toggle"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
                    {isId ? 'Rumus Lamé untuk Tube Dinding Tebal' : 'Lamé Thick Cylinder Formula'}
                  </span>
                  <span>{showFormula ? '▲' : '▼'}</span>
                </button>
                {showFormula && (
                  <div className="belsa-calc-formula-body">
                    <strong>Rumus Lamé:</strong><br />
                    • Tebal dinding minimum: <code>t_cyl = (ID / 2) × (√((σ + P)/(σ - P)) - 1)</code><br />
                    • Tebal dinding izin: <code>t_allowable = t_cyl × 2.13</code> (faktor 2.13)<br />
                    • ID honing maksimum: <code>OD - 2 × t_allowable</code>
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Live Sticky HUD Cockpit */}
            <div className="belsa-calc-sticky-hud">
              <div className="belsa-calc-cockpit">
                
                {/* Top Deck: Radial CAD Blueprint Visual */}
                <div className="belsa-calc-cockpit-stage">
                  <div className="belsa-calc-cockpit-header">
                    <div className="belsa-calc-cockpit-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" strokeDasharray="3 3" />
                      </svg>
                      <span>{isId ? 'Penampang Tube & Batas Honing' : 'Radial Tube Section & Honing Limit'}</span>
                    </div>
                    <span className="belsa-calc-cockpit-tag">{isId ? 'Gambar CAD' : 'CAD Blueprint'}</span>
                  </div>

                  <div className="belsa-calc-svg-wrapper">
                    {renderCadSvg('thickness', 'desk-')}
                  </div>

                  <div className="belsa-calc-diagram-specs">
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Tebal Aktual</span>
                      <span className="belsa-calc-diagram-spec-val">{thicknessResult.tActual} mm</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Tebal Min (Lamé)</span>
                      <span className="belsa-calc-diagram-spec-val">{thicknessResult.tCylMin} mm</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Safety Factor</span>
                      <span className="belsa-calc-diagram-spec-val" style={{ color: thicknessResult.safetyFactor >= 2.13 ? '#4ADE80' : '#F87171' }}>
                        {thicknessResult.safetyFactor}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Deck: Results & Actions */}
                <div className="belsa-calc-cockpit-results">
                  <div className="belsa-calc-card-header" style={{ marginBottom: '16px', paddingBottom: '10px' }}>
                    <div className="belsa-calc-card-title">
                      <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{isId ? 'Hasil Cek Tebal & Honing' : 'Thickness & Honing Evaluation'}</span>
                    </div>
                    <span
                      className={`belsa-calc-status-badge ${
                        thicknessResult.statusText === 'Recomended'
                          ? 'belsa-calc-status-safe'
                          : thicknessResult.statusText === "It's Maxed"
                          ? 'belsa-calc-status-warn'
                          : 'belsa-calc-status-danger'
                      }`}
                    >
                      {isId ? statusLabel(thicknessResult.statusText) : (thicknessResult.statusText === 'Recomended' ? 'DIREKOMENDASIKAN' : thicknessResult.statusText)}
                    </span>
                  </div>

                  <div className="belsa-calc-results-grid">
                    <div className="belsa-calc-result-box highlight">
                      <div className="belsa-calc-result-label">
                        <span>Oversize ID Honing Maksimum</span>
                        <span style={{ fontSize: '0.7rem', color: '#D3232A' }}>Batas Honing</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {thicknessResult.overSizeDimMax} <span className="belsa-calc-result-unit">mm</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        OD ({odMm} mm) - 2 × t_allowable ({tAllowable} mm)
                      </div>
                    </div>

                    <div className="belsa-calc-result-box">
                      <div className="belsa-calc-result-label">
                        <span>Sisa Batas Honing</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {overSizeSafetyAllowance > 0 ? `+${overSizeSafetyAllowance}` : '0'} <span className="belsa-calc-result-unit">mm</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        Pemakanan maksimum untuk honing ulang
                      </div>
                    </div>
                  </div>

                  {/* Metric Rows */}
                  <div className="belsa-calc-metric-table">
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Tebal Dinding Aktual:</span>
                      <strong className="belsa-calc-metric-val">{thicknessResult.tActual} mm</strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Tebal Minimum (Rumus Lamé):</span>
                      <strong className="belsa-calc-metric-val">{thicknessResult.tCylMin} mm</strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Tebal Izin (Faktor 2.13):</span>
                      <strong className="belsa-calc-metric-val" style={{ color: '#D3232A' }}>{tAllowable} mm</strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Safety Factor Dinding:</span>
                      <strong className="belsa-calc-metric-val" style={{ color: thicknessResult.safetyFactor >= 2.13 ? '#15803D' : '#B91C1C' }}>
                        {thicknessResult.safetyFactor}x
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="belsa-calc-actions">
                    <a
                      href={generateWaLink(
                        `Halo Tim BELSA, saya ingin tanya jasa honing ulang tube silinder:\n- Material: ${materialKey}\n- OD: ${odMm} mm | ID: ${idMm} mm\n- Tekanan: ${thickPressureBar} Bar\n- Batas ID Honing Maks: ${thicknessResult.overSizeDimMax} mm\nMohon estimasi biaya honing ulang atau ganti tube baru.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="belsa-calc-btn-wa"
                    >
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
                      <span>{isId ? 'Tanya Jasa Honing' : 'Consult Honing Service'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySummary(
                          `Hasil Cek Tube Silinder BELSA:\n- Material: ${materialKey}\n- OD: ${odMm} mm, ID: ${idMm} mm\n- Tebal Aktual: ${thicknessResult.tActual} mm\n- Tebal Min Lamé: ${thicknessResult.tCylMin} mm\n- Max Oversize Honing ID: ${thicknessResult.overSizeDimMax} mm\n- Status: ${statusLabel(thicknessResult.statusText)}`
                        )
                      }
                      className="belsa-calc-btn-copy"
                    >
                      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      <span>{copied ? (isId ? 'Tersalin' : 'Copied!') : (isId ? 'Salin Hasil' : 'Copy Specs')}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: BOLT FORCE SAFETY CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'bolt' && (
          <div className="belsa-calc-grid-2col">
            
            {/* Left Col: Parameter Input Station */}
            <div className="belsa-calc-card">
              <div className="belsa-calc-card-header">
                <div className="belsa-calc-card-title">
                  <svg viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span>{isId ? 'Data Baut Tie Rod' : 'Tie-Rod Bolt Parameters'}</span>
                </div>
                <span className="belsa-calc-badge-excel">{isId ? 'Metode: Kapasitas Tarik Baut' : 'Standard: VDI 2230 Bolt Evaluation'}</span>
              </div>

              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">{isId ? 'Tekanan Kerja Sistem:' : 'Working System Pressure:'}</label>
                  <span className="belsa-calc-label-val">{boltPressureBar} Bar</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoltPressureBar((v) => Math.max(10, v - 10))}
                    aria-label="Decrease pressure"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={boltPressureBar}
                    onChange={(e) => setBoltPressureBar(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoltPressureBar((v) => Math.min(450, v + 10))}
                    aria-label="Increase pressure"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">Bar</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="450"
                  step="10"
                  value={boltPressureBar}
                  onChange={(e) => setBoltPressureBar(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
              </div>

              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">{isId ? 'Diameter Bore (ID Tube):' : 'Cylinder Bore (ID):'}</label>
                  <span className="belsa-calc-label-val">Ø {boltTubeIdMm} mm</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoltTubeIdMm((v) => Math.max(32, v - 5))}
                    aria-label="Decrease bore"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={boltTubeIdMm}
                    onChange={(e) => setBoltTubeIdMm(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoltTubeIdMm((v) => Math.min(400, v + 5))}
                    aria-label="Increase bore"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">mm</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="400"
                  step="1"
                  value={boltTubeIdMm}
                  onChange={(e) => setBoltTubeIdMm(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
              </div>

              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row">
                  <label className="belsa-calc-label">{isId ? 'Diameter Baut Tie Rod:' : 'Bolt Diameter:'}</label>
                  <span className="belsa-calc-label-val">M{boltDiaMm}</span>
                </div>
                <div className="belsa-calc-input-row">
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoltDiaMm((v) => Math.max(8, v - 2))}
                    aria-label="Decrease bolt diameter"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={boltDiaMm}
                    onChange={(e) => setBoltDiaMm(parseFloat(e.target.value) || 0)}
                    className="belsa-calc-input"
                  />
                  <button
                    type="button"
                    className="belsa-calc-stepper-btn"
                    onClick={() => setBoltDiaMm((v) => Math.min(80, v + 2))}
                    aria-label="Increase bolt diameter"
                  >
                    +
                  </button>
                  <span className="belsa-calc-unit-tag">mm</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="80"
                  step="1"
                  value={boltDiaMm}
                  onChange={(e) => setBoltDiaMm(parseFloat(e.target.value))}
                  className="belsa-calc-range"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="belsa-calc-form-group">
                  <label className="belsa-calc-label" style={{ display: 'block', marginBottom: '8px' }}>
                    {isId ? 'Jumlah Baut:' : 'Bolt Quantity:'}
                  </label>
                  <div className="belsa-calc-input-row">
                    <button
                      type="button"
                      className="belsa-calc-stepper-btn"
                      onClick={() => setBoltQty((v) => Math.max(2, v - 2))}
                      aria-label="Decrease bolt count"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="32"
                      value={boltQty}
                      onChange={(e) => setBoltQty(parseInt(e.target.value) || 1)}
                      className="belsa-calc-input"
                      style={{ width: '100%', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      className="belsa-calc-stepper-btn"
                      onClick={() => setBoltQty((v) => Math.min(32, v + 2))}
                      aria-label="Increase bolt count"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="belsa-calc-form-group">
                  <label className="belsa-calc-label" style={{ display: 'block', marginBottom: '8px' }}>
                    {isId ? 'Grade Baut:' : 'Bolt Strength Grade:'}
                  </label>
                  <select
                    value={boltGrade}
                    onChange={(e) => setBoltGrade(e.target.value as any)}
                    className="belsa-calc-select"
                    style={{ width: '100%' }}
                  >
                    <option value="8.8">Grade 8.8 (Standar)</option>
                    <option value="10.9">{isId ? 'Grade 10.9' : 'Grade 10.9 (High Tensile)'}</option>
                    <option value="12.9">{isId ? 'Grade 12.9' : 'Grade 12.9 (Ultra High)'}</option>
                  </select>
                </div>
              </div>

              {/* Formula Accordion */}
              <div className="belsa-calc-formula-accordion">
                <button
                  type="button"
                  onClick={() => setShowFormula(!showFormula)}
                  className="belsa-calc-formula-toggle"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
                    {isId ? 'Rumus Beban Baut & Safety Factor' : 'Bolt Load & Safety Factor Formula'}
                  </span>
                  <span>{showFormula ? '▲' : '▼'}</span>
                </button>
                {showFormula && (
                  <div className="belsa-calc-formula-body">
                    <strong>Kekuatan Baut Tie Rod:</strong><br />
                    • Gaya silinder × SF 2: <code>F_cyl_sf = 2 × P × A</code><br />
                    • Luas penampang baut: <code>A_s = 0.25 × π × d²</code><br />
                    • Kapasitas total baut: <code>F_bolt = n × A_s × σ_tensile</code><br />
                    • Syarat aman: <code>F_bolt ≥ F_cyl_sf</code>
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Live Sticky HUD Cockpit */}
            <div className="belsa-calc-sticky-hud">
              <div className="belsa-calc-cockpit">
                
                {/* Top Deck: Flange Bolt Pattern CAD Blueprint */}
                <div className="belsa-calc-cockpit-stage">
                  <div className="belsa-calc-cockpit-header">
                    <div className="belsa-calc-cockpit-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8" cy="8" r="2" />
                        <circle cx="16" cy="8" r="2" />
                        <circle cx="8" cy="16" r="2" />
                        <circle cx="16" cy="16" r="2" />
                      </svg>
                      <span>{isId ? 'Pola Baut Flange & Gaya Tarik' : 'Flange Bolt Pattern & Tensile Stress'}</span>
                    </div>
                    <span className="belsa-calc-cockpit-tag">{isId ? 'Gambar CAD' : 'CAD Blueprint'}</span>
                  </div>

                  <div className="belsa-calc-svg-wrapper">
                    {renderCadSvg('bolt', 'desk-')}
                  </div>

                  <div className="belsa-calc-diagram-specs">
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Jumlah Baut</span>
                      <span className="belsa-calc-diagram-spec-val">{boltQty}x M{boltDiaMm}</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Kapasitas / Baut</span>
                      <span className="belsa-calc-diagram-spec-val">{(boltResult.singleBoltCapacityN / 1000).toFixed(1)} kN</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">{isId ? 'Faktor Keamanan' : 'Safety Margin'}</span>
                      <span className="belsa-calc-diagram-spec-val" style={{ color: boltResult.isSafe ? '#4ADE80' : '#F87171' }}>
                        {boltResult.safetyFactor}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Deck: Results & Actions */}
                <div className="belsa-calc-cockpit-results">
                  <div className="belsa-calc-card-header" style={{ marginBottom: '16px', paddingBottom: '10px' }}>
                    <div className="belsa-calc-card-title">
                      <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{isId ? 'Hasil Cek Baut' : 'Bolt Safety Evaluation'}</span>
                    </div>
                    <span
                      className={`belsa-calc-status-badge ${
                        boltResult.isSafe ? 'belsa-calc-status-safe' : 'belsa-calc-status-danger'
                      }`}
                    >
                      {boltResult.isSafe ? 'AMAN' : 'TIDAK AMAN'}
                    </span>
                  </div>

                  <div className="belsa-calc-results-grid">
                    <div className="belsa-calc-result-box highlight">
                      <div className="belsa-calc-result-label">
                        <span>Kapasitas Baut (F_bolt)</span>
                        <span style={{ fontSize: '0.7rem', color: '#D3232A' }}>Gaya Tahan</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {(boltResult.totalBoltForceN / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}{' '}
                        <span className="belsa-calc-result-unit">kN</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        Total {boltQty} baut × Ø{boltDiaMm} mm Grade {boltGrade}
                      </div>
                    </div>

                    <div className="belsa-calc-result-box">
                      <div className="belsa-calc-result-label">
                        <span>Gaya Silinder × SF 2</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {(boltResult.safetyFactorCylinderForceN / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}{' '}
                        <span className="belsa-calc-result-unit">kN</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        2 × Tekanan {boltPressureBar} Bar × Luas Piston
                      </div>
                    </div>
                  </div>

                  <div className="belsa-calc-metric-table">
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Gaya Silinder (F_base):</span>
                      <strong className="belsa-calc-metric-val">{(boltResult.cylinderBaseForceN / 1000).toFixed(1)} kN</strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Kapasitas per Baut:</span>
                      <strong className="belsa-calc-metric-val">{(boltResult.singleBoltCapacityN / 1000).toFixed(1)} kN / baut</strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">Rasio Keamanan (F_bolt / F_cyl_sf):</span>
                      <strong className="belsa-calc-metric-val" style={{ color: boltResult.isSafe ? '#15803D' : '#B91C1C' }}>
                        {boltResult.safetyFactor}x
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="belsa-calc-actions">
                    <a
                      href={generateWaLink(
                        `Halo Tim BELSA, saya ingin tanya soal kekuatan baut silinder:\n- Bore: Ø${boltTubeIdMm} mm | Tekanan: ${boltPressureBar} Bar\n- Baut: ${boltQty}x M${boltDiaMm} Grade ${boltGrade}\n- Status: ${boltResult.isSafe ? 'AMAN' : 'TIDAK AMAN'}\nMohon rekomendasi spesifikasi silinder BELSA yang sesuai.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="belsa-calc-btn-wa"
                    >
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
                      <span>{isId ? 'Tanya via WhatsApp' : 'Consult via WhatsApp'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySummary(
                          `Kekuatan Baut Silinder BELSA:\n- Bore: Ø${boltTubeIdMm} mm, Tekanan: ${boltPressureBar} Bar\n- Baut: ${boltQty}x M${boltDiaMm} Grade ${boltGrade}\n- Kapasitas Baut: ${(boltResult.totalBoltForceN / 1000).toFixed(1)} kN\n- Gaya Silinder × SF 2: ${(boltResult.safetyFactorCylinderForceN / 1000).toFixed(1)} kN\n- Status: ${boltResult.isSafe ? 'AMAN' : 'TIDAK AMAN'}`
                        )
                      }
                      className="belsa-calc-btn-copy"
                    >
                      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      <span>{copied ? (isId ? 'Tersalin' : 'Copied!') : (isId ? 'Salin Hasil' : 'Copy Specs')}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: WEIGHT & MASS CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'weight' && (
          <div className="belsa-calc-grid-2col">
            
            {/* Left Col: Parameter Input Station */}
            <div className="belsa-calc-card">
              <div className="belsa-calc-card-header">
                <div className="belsa-calc-card-title">
                  <svg viewBox="0 0 24 24"><path d="M12 3v18m-8-7l4-9 4 9H4zm12 0l4-9 4 9h-8z" /></svg>
                  <span>{isId ? 'Dimensi & Massa Jenis Material' : 'Dimensions & Density'}</span>
                </div>
                <span className="belsa-calc-badge-excel">{isId ? 'Metode: Volume × Massa Jenis' : 'Standard: ASTM A519 / ST52 Density'}</span>
              </div>

              {/* Mode Switcher */}
              <div className="belsa-calc-mode-switch">
                <button
                  type="button"
                  onClick={() => setWeightType('round')}
                  className={`belsa-calc-mode-btn ${weightType === 'round' ? 'active' : ''}`}
                >
                  {isId ? '1. Round Bar & Pipa' : '1. Round Bar & Pipe'}
                </button>
                <button
                  type="button"
                  onClick={() => setWeightType('plate')}
                  className={`belsa-calc-mode-btn ${weightType === 'plate' ? 'active' : ''}`}
                >
                  {isId ? '2. Plat & Flange Kotak' : '2. Plate & Flange'}
                </button>
              </div>

              {/* Quick Material Presets & Compact Density Input */}
              <div className="belsa-calc-form-group">
                <div className="belsa-calc-label-row" style={{ marginBottom: '6px' }}>
                  <label className="belsa-calc-label">
                    {isId ? 'Material & Massa Jenis:' : 'Material & Density:'}
                  </label>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={density}
                      onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                      className="belsa-calc-input"
                      style={{ height: '30px', width: '78px', padding: '0 8px', fontSize: '0.82rem', textAlign: 'right' }}
                    />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#D3232A' }}>kg/m³</span>
                  </div>
                </div>
                <div className="belsa-calc-preset-wrap" style={{ marginTop: 0 }}>
                  {[
                    { label: 'ST-52', rho: 7850 },
                    { label: 'SS304', rho: 7930 },
                    { label: 'Alu 6061', rho: 2700 },
                    { label: 'Cast Iron', rho: 7200 },
                    { label: 'Brass', rho: 8500 },
                    { label: 'Copper', rho: 8960 }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setDensity(item.rho)}
                      className={`belsa-calc-preset-chip ${density === item.rho ? 'active' : ''}`}
                    >
                      {item.label} ({item.rho})
                    </button>
                  ))}
                </div>
              </div>

              {weightType === 'round' ? (
                <>
                  <div className="belsa-calc-form-group" style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <div className="belsa-calc-label-row">
                      <label className="belsa-calc-label">Diameter Luar (OD):</label>
                      <span className="belsa-calc-label-val">Ø {roundOd} mm</span>
                    </div>
                    <div className="belsa-calc-input-row">
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setRoundOd((v) => Math.max(10, v - 5))}
                        aria-label="Decrease OD"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={roundOd}
                        onChange={(e) => setRoundOd(parseFloat(e.target.value) || 0)}
                        className="belsa-calc-input"
                      />
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setRoundOd((v) => Math.min(350, v + 5))}
                        aria-label="Increase OD"
                      >
                        +
                      </button>
                      <span className="belsa-calc-unit-tag">mm</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="350"
                      step="1"
                      value={roundOd}
                      onChange={(e) => setRoundOd(parseFloat(e.target.value))}
                      className="belsa-calc-range"
                    />
                  </div>

                  <div className="belsa-calc-form-group">
                    <div className="belsa-calc-label-row">
                      <label className="belsa-calc-label">{isId ? 'Diameter Dalam (ID — 0 = Pejal):' : 'Inner Bore (ID — 0 = Solid):'}</label>
                      <span className="belsa-calc-label-val">{roundId === 0 ? (isId ? '0 mm (Pejal)' : '0 mm (Solid)') : `Ø ${roundId} mm`}</span>
                    </div>
                    <div className="belsa-calc-input-row">
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setRoundId((v) => Math.max(0, v - 5))}
                        aria-label="Decrease ID"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={roundId}
                        onChange={(e) => setRoundId(parseFloat(e.target.value) || 0)}
                        className="belsa-calc-input"
                      />
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setRoundId((v) => Math.min(Math.max(0, roundOd - 2), v + 5))}
                        aria-label="Increase ID"
                      >
                        +
                      </button>
                      <span className="belsa-calc-unit-tag">mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, roundOd - 2)}
                      step="1"
                      value={roundId}
                      onChange={(e) => setRoundId(parseFloat(e.target.value))}
                      className="belsa-calc-range"
                    />
                    <div className="belsa-calc-preset-wrap">
                      {[0, 32, 40, 50, 63, 80, 100].filter((p) => p === 0 || p < roundOd).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRoundId(preset)}
                          className={`belsa-calc-preset-chip ${roundId === preset ? 'active' : ''}`}
                        >
                          {preset === 0 ? (isId ? '0 (As Pejal)' : '0 (Solid Rod)') : `ID Ø${preset}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="belsa-calc-form-group">
                    <div className="belsa-calc-label-row">
                      <label className="belsa-calc-label">{isId ? 'Panjang Batang / Pipa:' : 'Bar / Tube Length:'}</label>
                      <span className="belsa-calc-label-val">{roundLength} mm</span>
                    </div>
                    <div className="belsa-calc-input-row">
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setRoundLength((v) => Math.max(10, v - 20))}
                        aria-label="Decrease length"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={roundLength}
                        onChange={(e) => setRoundLength(parseFloat(e.target.value) || 0)}
                        className="belsa-calc-input"
                      />
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setRoundLength((v) => Math.min(2000, v + 20))}
                        aria-label="Increase length"
                      >
                        +
                      </button>
                      <span className="belsa-calc-unit-tag">mm</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={roundLength}
                      onChange={(e) => setRoundLength(parseFloat(e.target.value))}
                      className="belsa-calc-range"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="belsa-calc-form-group" style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <div className="belsa-calc-label-row">
                      <label className="belsa-calc-label">Panjang Plat:</label>
                      <span className="belsa-calc-label-val">{plateLength} mm</span>
                    </div>
                    <div className="belsa-calc-input-row">
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setPlateLength((v) => Math.max(10, v - 20))}
                        aria-label="Decrease length"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={plateLength}
                        onChange={(e) => setPlateLength(parseFloat(e.target.value) || 0)}
                        className="belsa-calc-input"
                      />
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setPlateLength((v) => Math.min(2000, v + 20))}
                        aria-label="Increase length"
                      >
                        +
                      </button>
                      <span className="belsa-calc-unit-tag">mm</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={plateLength}
                      onChange={(e) => setPlateLength(parseFloat(e.target.value))}
                      className="belsa-calc-range"
                    />
                  </div>

                  <div className="belsa-calc-form-group">
                    <div className="belsa-calc-label-row">
                      <label className="belsa-calc-label">Lebar Plat:</label>
                      <span className="belsa-calc-label-val">{plateWidth} mm</span>
                    </div>
                    <div className="belsa-calc-input-row">
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setPlateWidth((v) => Math.max(10, v - 20))}
                        aria-label="Decrease width"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={plateWidth}
                        onChange={(e) => setPlateWidth(parseFloat(e.target.value) || 0)}
                        className="belsa-calc-input"
                      />
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setPlateWidth((v) => Math.min(1500, v + 20))}
                        aria-label="Increase width"
                      >
                        +
                      </button>
                      <span className="belsa-calc-unit-tag">mm</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1500"
                      step="10"
                      value={plateWidth}
                      onChange={(e) => setPlateWidth(parseFloat(e.target.value))}
                      className="belsa-calc-range"
                    />
                  </div>

                  <div className="belsa-calc-form-group">
                    <div className="belsa-calc-label-row">
                      <label className="belsa-calc-label">Tebal Plat:</label>
                      <span className="belsa-calc-label-val">{plateHeight} mm</span>
                    </div>
                    <div className="belsa-calc-input-row">
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setPlateHeight((v) => Math.max(1, v - 2))}
                        aria-label="Decrease thickness"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={plateHeight}
                        onChange={(e) => setPlateHeight(parseFloat(e.target.value) || 0)}
                        className="belsa-calc-input"
                      />
                      <button
                        type="button"
                        className="belsa-calc-stepper-btn"
                        onClick={() => setPlateHeight((v) => Math.min(150, v + 2))}
                        aria-label="Increase thickness"
                      >
                        +
                      </button>
                      <span className="belsa-calc-unit-tag">mm</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      step="1"
                      value={plateHeight}
                      onChange={(e) => setPlateHeight(parseFloat(e.target.value))}
                      className="belsa-calc-range"
                    />
                    <div className="belsa-calc-preset-wrap">
                      {[6, 8, 10, 12, 16, 20, 25, 32, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPlateHeight(preset)}
                          className={`belsa-calc-preset-chip ${plateHeight === preset ? 'active' : ''}`}
                        >
                          {preset} mm
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Formula Accordion */}
              <div className="belsa-calc-formula-accordion">
                <button
                  type="button"
                  onClick={() => setShowFormula(!showFormula)}
                  className="belsa-calc-formula-toggle"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
                    {isId ? 'Rumus Volume & Berat' : 'Volume & Metal Mass Formula'}
                  </span>
                  <span>{showFormula ? '▲' : '▼'}</span>
                </button>
                {showFormula && (
                  <div className="belsa-calc-formula-body">
                    <strong>Perhitungan Berat:</strong><br />
                    • Round / Tube: <code>M = 0.25 × π × (OD² - ID²) × L × ρ / 10⁶</code><br />
                    • Plat Kotak: <code>M = L × W × T × ρ / 10⁶</code><br />
                    • 1 kg = 2.20462 lbs
                  </div>
                )}
              </div>

            </div>

            {/* Right Col: Live Sticky HUD Cockpit */}
            <div className="belsa-calc-sticky-hud">
              <div className="belsa-calc-cockpit">
                
                {/* Top Deck: 3D Axonometric CAD Blueprint */}
                <div className="belsa-calc-cockpit-stage">
                  <div className="belsa-calc-cockpit-header">
                    <div className="belsa-calc-cockpit-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2">
                        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                      </svg>
                      <span>{isId ? 'Gambar Isometrik Komponen' : '3D Axonometric Component Projection'}</span>
                    </div>
                    <span className="belsa-calc-cockpit-tag">{isId ? 'Gambar CAD' : 'CAD Blueprint'}</span>
                  </div>

                  <div className="belsa-calc-svg-wrapper">
                    {renderCadSvg('weight', 'desk-')}
                  </div>

                  <div className="belsa-calc-diagram-specs">
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Bentuk</span>
                      <span className="belsa-calc-diagram-spec-val">{isId ? (weightType === 'round' ? (roundId > 0 ? 'Pipa' : 'As Pejal') : 'Plat') : (weightType === 'round' ? (roundId > 0 ? 'Hollow Pipe' : 'Solid Shaft') : 'Square Plate')}</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Massa Jenis</span>
                      <span className="belsa-calc-diagram-spec-val">{density} kg/m³</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Berat Bersih</span>
                      <span className="belsa-calc-diagram-spec-val" style={{ color: '#D3232A' }}>
                        {weightType === 'round' ? `${roundWeightResult} Kg` : `${plateWeightResult} Kg`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Deck: Results & Actions */}
                <div className="belsa-calc-cockpit-results">
                  <div className="belsa-calc-results-grid">
                    <div className="belsa-calc-result-box highlight">
                      <div className="belsa-calc-result-label">
                        <span>Berat Material</span>
                        <span style={{ fontSize: '0.7rem', color: '#D3232A' }}>Berat Bersih</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {weightType === 'round' ? roundWeightResult : plateWeightResult}{' '}
                        <span className="belsa-calc-result-unit">Kg</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        = {((weightType === 'round' ? roundWeightResult : plateWeightResult) * 2.20462).toFixed(2)} Lbs
                      </div>
                    </div>

                    <div className="belsa-calc-result-box">
                      <div className="belsa-calc-result-label">
                        <span>Massa Jenis</span>
                      </div>
                      <div className="belsa-calc-result-val">
                        {density}{' '}
                        <span className="belsa-calc-result-unit">kg/m³</span>
                      </div>
                      <div className="belsa-calc-result-sub">
                        Massa jenis material yang dipilih
                      </div>
                    </div>
                  </div>

                  <div className="belsa-calc-metric-table">
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">{isId ? 'Bentuk Komponen:' : 'Component Geometry:'}</span>
                      <strong className="belsa-calc-metric-val">
                        {weightType === 'round'
                          ? roundId > 0
                            ? (isId ? 'Pipa Berongga (Hollow Tube)' : 'Hollow Pipe / Tube')
                            : (isId ? 'As Bulat Pejal (Solid Bar)' : 'Solid Round Bar')
                          : (isId ? 'Plat Kotak / Flange' : 'Square Plate / Flange')}
                      </strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">{isId ? 'Dimensi Aktual:' : 'Actual Dimensions:'}</span>
                      <strong className="belsa-calc-metric-val">
                        {weightType === 'round'
                          ? `Ø${roundOd} × Ø${roundId} × ${roundLength} mm`
                          : `${plateLength} × ${plateWidth} × ${plateHeight} mm`}
                      </strong>
                    </div>
                    <div className="belsa-calc-metric-row">
                      <span className="belsa-calc-metric-label">{isId ? 'Estimasi Berat (Lbs):' : 'Estimated Weight (Lbs):'}</span>
                      <strong className="belsa-calc-metric-val" style={{ color: '#D3232A' }}>
                        {((weightType === 'round' ? roundWeightResult : plateWeightResult) * 2.20462).toFixed(2)} Lbs
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="belsa-calc-actions">
                    <a
                      href={generateWaLink(
                        `Halo Tim BELSA, saya ingin tanya fabrikasi komponen:\n- Tipe: ${weightType === 'round' ? 'Round Bar / Tube' : 'Plat Kotak'}\n- Estimasi Berat: ${weightType === 'round' ? roundWeightResult : plateWeightResult} Kg\n- Massa jenis: ${density} kg/m³\nMohon penawaran harga material dan jasa permesinan.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="belsa-calc-btn-wa"
                    >
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
                      <span>{isId ? 'Tanya via WhatsApp' : 'Consult via WhatsApp'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySummary(
                          `Estimasi Berat Material BELSA:\n- Tipe: ${weightType === 'round' ? 'Round Bar' : 'Plat'}\n- Berat: ${weightType === 'round' ? roundWeightResult : plateWeightResult} Kg\n- Massa jenis: ${density} kg/m³`
                        )
                      }
                      className="belsa-calc-btn-copy"
                    >
                      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      <span>{copied ? (isId ? 'Tersalin' : 'Copied!') : (isId ? 'Salin Hasil' : 'Copy Specs')}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: BOLT TIGHTENING TORQUE TABLE (SPLIT WORKBENCH LAYOUT) */}
        {/* ========================================================================= */}
        {activeTab === 'torque' && (
          <div className="belsa-calc-grid-2col">
            
            {/* Left Col: Interactive Table Station */}
            <div className="belsa-calc-card">
              <div className="belsa-calc-card-header">
                <div className="belsa-calc-card-title">
                  <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                  <span>{isId ? 'Tabel Torsi Pengencangan Baut' : 'Torque Standard Matrix Table'}</span>
                </div>
                <span className="belsa-calc-badge-excel">{isId ? 'Acuan: Tabel Rekomendasi Torsi' : 'Standard: ISO 898-1 Torque Matrix'}</span>
              </div>

              {/* Mobile Quick Grade & Unit Controls (Visible on Mobile right above the table) */}
              <div className="belsa-calc-mobile-torque-controls">
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <select
                    value={torqueGrade}
                    onChange={(e) => setTorqueGrade(e.target.value as any)}
                    className="belsa-calc-select"
                    style={{ width: '100%', height: '38px', fontSize: '0.82rem' }}
                  >
                    <option value="8.8">Grade 8.8 (Std)</option>
                    <option value="10.9">Grade 10.9 (+40%)</option>
                    <option value="12.9">Grade 12.9 (+70%)</option>
                  </select>
                  <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setTorqueUnit('Nm')}
                      className={`belsa-calc-mode-btn ${torqueUnit === 'Nm' ? 'active' : ''}`}
                      style={{ flex: 1, padding: '6px 8px', fontSize: '0.78rem' }}
                    >
                      Nm
                    </button>
                    <button
                      type="button"
                      onClick={() => setTorqueUnit('Lbf.ft')}
                      className={`belsa-calc-mode-btn ${torqueUnit === 'Lbf.ft' ? 'active' : ''}`}
                      style={{ flex: 1, padding: '6px 8px', fontSize: '0.78rem' }}
                    >
                      Lbf.ft
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Cari ukuran baut (contoh: M16, 1/2, M24)"
                  value={torqueSearch}
                  onChange={(e) => setTorqueSearch(e.target.value)}
                  className="belsa-calc-input"
                  style={{ height: '40px', fontSize: '0.86rem' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                  {filteredTorqueTable.length} ukuran
                </span>
              </div>

              {/* Scrollable Table */}
              <div className="belsa-calc-table-wrap" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <table className="belsa-calc-table">
                  <thead>
                    <tr>
                      <th>Metrik</th>
                      <th>Inci</th>
                      <th style={{ textAlign: 'center' }}>≤ 10 Bar</th>
                      <th style={{ textAlign: 'center' }}>10 - 35 Bar</th>
                      <th style={{ textAlign: 'center', color: '#D3232A' }}>&gt; 35 Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTorqueTable.map((row) => {
                      const lowVal = getRecommendedTorque(row, 8, torqueGrade, torqueUnit);
                      const medVal = getRecommendedTorque(row, 25, torqueGrade, torqueUnit);
                      const highVal = getRecommendedTorque(row, 50, torqueGrade, torqueUnit);
                      const isSelected = activeTorqueRow && activeTorqueRow.metricSize === row.metricSize;

                      return (
                        <tr
                          key={row.metricSize}
                          onClick={() => setSelectedBoltSize(row.metricSize)}
                          className={isSelected ? 'active' : ''}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ fontWeight: 800, color: isSelected ? '#D3232A' : '#0F172A', fontFamily: 'monospace' }}>
                            {row.metricSize} {isSelected ? '▶' : ''}
                          </td>
                          <td style={{ fontWeight: 600, color: '#475569', fontFamily: 'monospace' }}>{row.inchSize}</td>
                          <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                            {lowVal > 0 ? `${lowVal}` : '—'}
                          </td>
                          <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}>
                            {medVal > 0 ? `${medVal}` : '—'}
                          </td>
                          <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 800, color: '#D3232A', background: isSelected ? '#FEE2E2' : '#FFF5F5' }}>
                            {highVal > 0 ? `${highVal}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '14px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#64748B', lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--belsa-red)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <em>{isId ? 'Ketuk baris ukuran baut untuk melihat visualisasi torsi live di monitor atas/kanan.' : 'Tap any bolt size row to inspect its live torque mechanics on the monitor.'}</em>
              </div>

            </div>

            {/* Right Col: Live Torque Inspector Cockpit (Sticky HUD) */}
            <div className="belsa-calc-sticky-hud">
              <div className="belsa-calc-cockpit">
                
                {/* Top Deck: Hex Bolt CAD Mechanics */}
                <div className="belsa-calc-cockpit-stage">
                  <div className="belsa-calc-cockpit-header">
                    <div className="belsa-calc-cockpit-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                      <span>{isId ? 'Torsi & Preload Baut' : 'Torque Mechanics & Pre-Load Vector'}</span>
                    </div>
                    <span className="belsa-calc-cockpit-tag">{isId ? 'Gambar CAD' : 'CAD Blueprint'}</span>
                  </div>

                  <div className="belsa-calc-svg-wrapper">
                    {renderCadSvg('torque', 'desk-')}
                  </div>

                  <div className="belsa-calc-diagram-specs">
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Ukuran Dipilih</span>
                      <span className="belsa-calc-diagram-spec-val">{activeTorqueRow ? `${activeTorqueRow.metricSize}` : selectedBoltSize}</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">{isId ? 'Setara Inci' : 'Inch Equivalent'}</span>
                      <span className="belsa-calc-diagram-spec-val">{activeTorqueRow ? activeTorqueRow.inchSize : '—'}</span>
                    </div>
                    <div className="belsa-calc-diagram-spec-item">
                      <span className="belsa-calc-diagram-spec-label">Torsi Hidrolik</span>
                      <span className="belsa-calc-diagram-spec-val" style={{ color: '#D3232A' }}>
                        {activeTorqueRow ? `${getRecommendedTorque(activeTorqueRow, 50, torqueGrade, torqueUnit)} ${torqueUnit}` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Deck: Controls & Actions */}
                <div className="belsa-calc-cockpit-results">
                  
                  {/* Selector Controls inside Cockpit */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Grade Baut:
                      </span>
                      <select
                        value={torqueGrade}
                        onChange={(e) => setTorqueGrade(e.target.value as any)}
                        className="belsa-calc-select"
                        style={{ width: '100%', height: '38px', fontSize: '0.84rem' }}
                      >
                        <option value="8.8">Grade 8.8 (Standar)</option>
                        <option value="10.9">Grade 10.9 (+40%)</option>
                        <option value="12.9">Grade 12.9 (+70%)</option>
                      </select>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Satuan Torsi:
                      </span>
                      <div className="belsa-calc-preset-wrap" style={{ marginTop: 0 }}>
                        <button
                          type="button"
                          onClick={() => setTorqueUnit('Nm')}
                          className={`belsa-calc-preset-chip ${torqueUnit === 'Nm' ? 'active' : ''}`}
                          style={{ flex: 1, textAlign: 'center' }}
                        >
                          Nm
                        </button>
                        <button
                          type="button"
                          onClick={() => setTorqueUnit('Lbf.ft')}
                          className={`belsa-calc-preset-chip ${torqueUnit === 'Lbf.ft' ? 'active' : ''}`}
                          style={{ flex: 1, textAlign: 'center' }}
                        >
                          Lbf.ft
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="belsa-calc-actions">
                    <a
                      href={generateWaLink(
                        `Halo Tim BELSA, saya ingin tanya torsi pengencangan baut silinder:\n- Ukuran: ${activeTorqueRow ? activeTorqueRow.metricSize : selectedBoltSize} (${activeTorqueRow ? activeTorqueRow.inchSize : ''})\n- Grade Baut: ${torqueGrade}\n- Torsi Rekomendasi: ${activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 50, torqueGrade, torqueUnit) : ''} ${torqueUnit}\nMohon konfirmasi nilai torsi dan urutan pengencangannya.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="belsa-calc-btn-wa"
                    >
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.14-1.31C8.58 21.53 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
                      <span>{isId ? 'Tanya Tim Engineering' : 'Ask Engineering Team'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySummary(
                          `Torsi Pengencangan Baut BELSA:\n- Baut: ${activeTorqueRow ? activeTorqueRow.metricSize : selectedBoltSize} (Grade ${torqueGrade})\n- Torsi Low (≤10 Bar): ${activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 8, torqueGrade, torqueUnit) : ''} ${torqueUnit}\n- Torsi Med (10-35 Bar): ${activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 25, torqueGrade, torqueUnit) : ''} ${torqueUnit}\n- Torsi High (>35 Bar): ${activeTorqueRow ? getRecommendedTorque(activeTorqueRow, 50, torqueGrade, torqueUnit) : ''} ${torqueUnit}`
                        )
                      }
                      className="belsa-calc-btn-copy"
                    >
                      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                      <span>{copied ? (isId ? 'Tersalin' : 'Copied!') : (isId ? 'Salin Torsi' : 'Copy')}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FIXED NATIVE MOBILE BOTTOM APP NAVIGATION BAR (5 MODULES)                 */}
      {/* ========================================================================= */}
      <nav className="belsa-calc-bottom-nav" aria-label="Calculator Module Navigation">
        <button
          type="button"
          onClick={() => switchTab('pressure')}
          className={`belsa-calc-bottom-tab ${activeTab === 'pressure' ? 'is-active' : ''}`}
        >
          <span className="belsa-calc-bottom-indicator" />
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>{isId ? 'Tekanan' : 'Pressure'}</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('thickness')}
          className={`belsa-calc-bottom-tab ${activeTab === 'thickness' ? 'is-active' : ''}`}
        >
          <span className="belsa-calc-bottom-indicator" />
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" strokeDasharray="3 3" />
          </svg>
          <span>{isId ? 'Tube' : 'Tube'}</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('bolt')}
          className={`belsa-calc-bottom-tab ${activeTab === 'bolt' ? 'is-active' : ''}`}
        >
          <span className="belsa-calc-bottom-indicator" />
          <svg viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{isId ? 'Baut' : 'Bolt'}</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('weight')}
          className={`belsa-calc-bottom-tab ${activeTab === 'weight' ? 'is-active' : ''}`}
        >
          <span className="belsa-calc-bottom-indicator" />
          <svg viewBox="0 0 24 24">
            <path d="M12 3v18m-8-7l4-9 4 9H4zm12 0l4-9 4 9h-8z" />
          </svg>
          <span>{isId ? 'Berat' : 'Weight'}</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('torque')}
          className={`belsa-calc-bottom-tab ${activeTab === 'torque' ? 'is-active' : ''}`}
        >
          <span className="belsa-calc-bottom-indicator" />
          <svg viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>{isId ? 'Torsi' : 'Torque'}</span>
        </button>
      </nav>
    </div>
  );
}

export function CalculatorView({ initialTool }: { initialTool?: CalculatorTab }) {
  return (
    <Suspense
      fallback={
        <div className="belsa-container" style={{ padding: '48px 16px 80px' }}>
          <div className="belsa-image-skeleton" style={{ height: '140px', borderRadius: '18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D3232A" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'belsaSpin 0.9s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>Memuat Kalkulator Teknik...</span>
          </div>
          <div className="belsa-image-skeleton" style={{ height: '320px', borderRadius: '20px' }} />
        </div>
      }
    >
      <CalculatorContent initialTool={initialTool} />
    </Suspense>
  );
}

export default function CalculatorPage() {
  return <CalculatorView />;
}
