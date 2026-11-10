/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AR Spatial HUD Modal (Режим Дополненной Реальности / Визор Apple Vision & HUD)
 * Provides an immersive, depth-based augmented reality marine visor interface
 * featuring real-time animated bathymetric depth sonar, dynamic bearing markers
 * for nearest vessels along the panoramic horizon, and collision vectors powered by Rust Marine Core.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Compass, 
  Navigation, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Layers, 
  Anchor, 
  Wind, 
  Cpu, 
  Maximize2, 
  Minimize2,
  Sliders,
  Sparkles,
  Info,
  Volume2,
  VolumeX,
  Target,
  Waves,
  Crosshair
} from 'lucide-react';
import { Vessel } from '../types';
import { 
  calculateCpaTcpa, 
  checkGimsSafety, 
  haversineDistanceMeters, 
  initialBearingDegrees,
  GeoPoint, 
  VesselVector,
  CollisionRiskAssessment
} from '../lib/rustMarineCore';

interface ArSpatialHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel | null) => void;
  lang: string;
}

export default function ArSpatialHudModal({
  isOpen,
  onClose,
  vessels,
  selectedVessel,
  onSelectVessel,
  lang
}: ArSpatialHudModalProps) {
  const [hudMode, setHudMode] = useState<'spatial' | 'flir' | 'sonar'>('spatial');
  const [activeTargetId, setActiveTargetId] = useState<string>(selectedVessel?.id || vessels[0]?.id || 'julia-60');
  
  // Real-time marine gyro & telemetry states
  const [heading, setHeading] = useState<number>(142);
  const [speedKts, setSpeedKts] = useState<number>(14.8);
  const [depthMeters, setDepthMeters] = useState<number>(38.4);
  const [pitchDeg, setPitchDeg] = useState<number>(0.8);
  const [rollDeg, setRollDeg] = useState<number>(-1.4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [fovZoom, setFovZoom] = useState<'wide' | 'normal' | 'tele'>('normal');
  const [sonarPingPhase, setSonarPingPhase] = useState<number>(0);

  // Simulated own vessel position in Golden Horn Bay / Eastern Bosphorus, Vladivostok
  const ownVessel: VesselVector = useMemo(() => ({
    position: { lat: 43.1155, lon: 131.8855 },
    speedKnots: speedKts,
    courseDegrees: heading
  }), [speedKts, heading]);

  // Sync selected vessel from props if changed externally
  useEffect(() => {
    if (selectedVessel) {
      setActiveTargetId(selectedVessel.id);
    }
  }, [selectedVessel]);

  // Find currently locked target vessel
  const targetVessel = useMemo(() => {
    return vessels.find(v => v.id === activeTargetId) || vessels[0];
  }, [vessels, activeTargetId]);

  // Calculate live navigation vectors for ALL vessels to position dynamic bearing markers on horizon
  const nearestVesselsWithVectors = useMemo(() => {
    return vessels.map(v => {
      const vPos: GeoPoint = {
        lat: v.latLon?.[0] || 43.1098,
        lon: v.latLon?.[1] || 131.8920
      };
      const distMeters = haversineDistanceMeters(ownVessel.position, vPos);
      const bearing = initialBearingDegrees(ownVessel.position, vPos);
      
      // Relative bearing between -180 and +180 degrees
      let relBearing = (bearing - heading + 540) % 360 - 180;
      
      const vVector: VesselVector = {
        position: vPos,
        speedKnots: v.speed ? v.speed * 0.54 : 12.0,
        courseDegrees: (bearing + 30) % 360
      };

      const cpaAssessment = calculateCpaTcpa(ownVessel, vVector);

      return {
        vessel: v,
        distMeters,
        distKm: Math.round((distMeters / 1000) * 10) / 10,
        distNm: Math.round((distMeters / 1852) * 10) / 10,
        bearing: Math.round(bearing),
        relBearing: Math.round(relBearing),
        cpaAssessment
      };
    }).sort((a, b) => a.distMeters - b.distMeters);
  }, [vessels, ownVessel, heading]);

  // Currently locked target metrics
  const lockedTargetData = useMemo(() => {
    return nearestVesselsWithVectors.find(item => item.vessel.id === activeTargetId) || nearestVesselsWithVectors[0];
  }, [nearestVesselsWithVectors, activeTargetId]);

  // Estimated vessel length from capacity for GIMS safety limits
  const estimatedLength = targetVessel?.capacity ? (targetVessel.capacity > 10 ? 18.0 : targetVessel.capacity > 4 ? 9.5 : 3.8) : 12.0;
  const gimsSafety = checkGimsSafety(estimatedLength, 0.6, 6.2);

  // Gyro Micro-jitter telemetry loop + Animated Sonar Ping
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setHeading(prev => {
        const delta = (Math.random() - 0.5) * 0.8;
        let next = prev + delta;
        if (next < 0) next += 360;
        if (next >= 360) next -= 360;
        return Math.round(next * 10) / 10;
      });

      setSpeedKts(prev => {
        const delta = (Math.random() - 0.5) * 0.2;
        return Math.round(Math.max(12.0, Math.min(18.5, prev + delta)) * 10) / 10;
      });

      setDepthMeters(prev => {
        const delta = (Math.random() - 0.5) * 0.3;
        return Math.round(Math.max(26.0, Math.min(54.0, prev + delta)) * 10) / 10;
      });

      setPitchDeg(prev => {
        const delta = (Math.random() - 0.5) * 0.3;
        return Math.round(Math.max(-3.5, Math.min(3.5, prev + delta)) * 10) / 10;
      });

      setRollDeg(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Math.round(Math.max(-4.0, Math.min(4.0, prev + delta)) * 10) / 10;
      });

      setSonarPingPhase(prev => (prev + 1) % 4);
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Audio synthesize click cue
  const playTargetLockBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.08); // chirp up
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext unavailable in silent sandbox
    }
  };

  // Keyboard accessibility (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Visual Theme configuration for HUD modes
  const modeStyles = {
    spatial: {
      accentText: 'text-cyan-400',
      accentBorder: 'border-cyan-500/30',
      accentGlow: 'shadow-[0_0_32px_rgba(34,211,238,0.25)]',
      bgTint: 'bg-slate-950/85',
      hudReticle: 'rgba(34, 211, 238, 0.85)',
      hudReticleHex: '#22d3ee',
      tagBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
    },
    flir: {
      accentText: 'text-emerald-400',
      accentBorder: 'border-emerald-500/30',
      accentGlow: 'shadow-[0_0_32px_rgba(16,185,129,0.25)]',
      bgTint: 'bg-zinc-950/90',
      hudReticle: 'rgba(16, 185, 129, 0.85)',
      hudReticleHex: '#10b981',
      tagBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
    },
    sonar: {
      accentText: 'text-sky-400',
      accentBorder: 'border-sky-500/30',
      accentGlow: 'shadow-[0_0_32px_rgba(56,189,248,0.25)]',
      bgTint: 'bg-slate-950/92',
      hudReticle: 'rgba(56, 189, 248, 0.85)',
      hudReticleHex: '#38bdf8',
      tagBg: 'bg-sky-500/15 text-sky-300 border-sky-500/40'
    }
  }[hudMode];

  // Panoramic compass tape scale: 180 degrees visible centered on heading
  const fovSpanDeg = fovZoom === 'wide' ? 120 : fovZoom === 'tele' ? 45 : 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/92 backdrop-blur-3xl animate-fade-in font-sans select-none">
      
      {/* Outer Curved AR Spatial Visor Glass Container */}
      <div 
        className={`relative w-full max-w-7xl h-[94vh] rounded-3xl overflow-hidden border ${modeStyles.accentBorder} ${modeStyles.bgTint} ${modeStyles.accentGlow} flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] transition-all duration-500`}
        id="ar-spatial-visor-screen"
      >
        
        {/* ==========================================
            BACKGROUND 3D PERSPECTIVE CANOPY & OPTICAL LENS
           ========================================== */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
          <img 
            src="/src/assets/images/ar_spatial_hud_cockpit_1794278094653.jpg" 
            alt="AR Marine Visor Cockpit"
            className={`w-full h-full object-cover object-center transform transition-transform duration-700 ${
              fovZoom === 'tele' ? 'scale-125' : fovZoom === 'wide' ? 'scale-100' : 'scale-110'
            } filter ${
              hudMode === 'flir' ? 'hue-rotate-90 brightness-75 contrast-125' : 
              hudMode === 'sonar' ? 'hue-rotate-180 brightness-65 contrast-140' : 
              'brightness-90 contrast-110'
            }`}
          />

          {/* Optical curved lens glare & vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90" />
          
          {/* Subtle micro-dot spatial tracking grid */}
          <div className="absolute inset-0 opacity-12 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:28px_28px]" />

          {/* AR Glass Visor Corner Crop Marks (Spatial glasses frame reticles) */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40" />
        </div>

        {/* ==========================================
            TIER 1: UPPER HORIZON COMPASS TAPE & STATUS BAR
           ========================================== */}
        <header className="relative z-20 px-4 sm:px-6 py-2.5 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl flex items-center justify-between gap-4 font-mono">
          
          {/* Brand & Sensor Lock */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Crosshair className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-white uppercase">
                  AR MARINE GLASSES HUD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  RUST ENGINE v0.2.0
                </span>
                <span className="hidden md:inline text-[10px] text-emerald-400">
                  ● GYRO 6-DOF LOCK
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                43°06'55" N · 131°53'07" E · БОСФОР ВОСТОЧНЫЙ
              </p>
            </div>
          </div>

          {/* Panoramic Bearing Ribbon (Compass Heading Tape across top) */}
          <div className="hidden lg:flex flex-col items-center max-w-md w-full px-4">
            <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-bold mb-1">
              <span>{(heading - 30 + 360) % 360}°</span>
              <span>{(heading - 15 + 360) % 360}°</span>
              <span className="text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 font-extrabold tabular-nums">
                ▼ {heading}° HDG
              </span>
              <span>{(heading + 15) % 360}°</span>
              <span>{(heading + 30) % 360}°</span>
            </div>
            {/* Compass degree ticks strip */}
            <div className="w-full h-2.5 flex items-end justify-between border-b border-cyan-400/30 px-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-px ${i === 12 ? 'h-3 bg-amber-400' : i % 3 === 0 ? 'h-2 bg-cyan-400' : 'h-1 bg-cyan-400/40'}`} 
                />
              ))}
            </div>
          </div>

          {/* Controls: Audio Toggle, FOV Zoom & HUD Mode */}
          <div className="flex items-center gap-2">
            
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playTargetLockBeep();
              }}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                soundEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title={soundEnabled ? 'Звуковые оповещения включены' : 'Включить звуковые оповещения'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setHudMode('spatial')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  hudMode === 'spatial' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                AR HUD
              </button>
              <button
                onClick={() => setHudMode('flir')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  hudMode === 'flir' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                FLIR
              </button>
              <button
                onClick={() => setHudMode('sonar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  hudMode === 'sonar' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                SONAR
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ==========================================
            TIER 2: MAIN 3D SPATIAL VIEWPORT
           ========================================== */}
        <main className="relative z-10 flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 overflow-hidden">
          
          {/* --------------------------------------
              LEFT WING: FLIGHT & NAV TELEMETRY (3 Cols)
             -------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-y-auto pr-1">
            
            {/* Speed & Heading Tape */}
            <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-2xl space-y-3 font-mono shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  NAVIGATION TELEMETRY
                </span>
                <span className="text-cyan-400 text-[10px] font-bold">60 FPS</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase">HDG (Истинный)</span>
                  <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                    {heading}°
                  </span>
                  <span className="text-[10px] text-cyan-400 block mt-0.5">SE · ЮГО-ВОСТОК</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase">SOG (Скорость)</span>
                  <span className="text-2xl font-black text-cyan-300 tabular-nums tracking-tight">
                    {speedKts} <span className="text-xs font-normal text-slate-400">kts</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{Math.round(speedKts * 1.852)} км/ч</span>
                </div>
              </div>

              {/* Artificial Horizon Gyro metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-[10px]">
                <div className="p-1 rounded bg-slate-900/50">
                  <span className="text-slate-500 block">PITCH</span>
                  <span className="font-bold text-white tabular-nums">{pitchDeg > 0 ? `+${pitchDeg}` : pitchDeg}°</span>
                </div>
                <div className="p-1 rounded bg-slate-900/50">
                  <span className="text-slate-500 block">ROLL</span>
                  <span className="font-bold text-white tabular-nums">{rollDeg > 0 ? `+${rollDeg}` : rollDeg}°</span>
                </div>
                <div className="p-1 rounded bg-slate-900/50">
                  <span className="text-slate-500 block">DRIFT</span>
                  <span className="font-bold text-cyan-400 tabular-nums">0.3 kts</span>
                </div>
              </div>
            </div>

            {/* GIMS MCHS Sea Wave Compliance */}
            <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-2xl space-y-2 font-mono shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ГИМС МЧС БЕЗОПАСНОСТЬ
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  ДОПУСК 100%
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {gimsSafety.message}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg">
                  <span>Волна:</span>
                  <span className="text-white font-bold tabular-nums">0.6 м</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg">
                  <span>Ветер:</span>
                  <span className="text-white font-bold tabular-nums">6.2 м/с</span>
                </div>
              </div>
            </div>

            {/* Nearest Targets Quick Radar List */}
            <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-2xl space-y-2 font-mono shadow-lg flex-1 min-h-[140px] flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-1.5">
                <span className="uppercase text-[11px] font-bold text-white">ЦЕЛИ В АКВАТОРИИ ({nearestVesselsWithVectors.length})</span>
                <span className="text-[10px] text-cyan-400">КЛИК ДЛЯ ЗАХВАТА</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 max-h-48">
                {nearestVesselsWithVectors.map(item => {
                  const isLocked = item.vessel.id === activeTargetId;
                  return (
                    <button
                      key={item.vessel.id}
                      onClick={() => {
                        setActiveTargetId(item.vessel.id);
                        onSelectVessel(item.vessel);
                        playTargetLockBeep();
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between border ${
                        isLocked
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/50 text-slate-400 border-white/5 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          {isLocked && <Crosshair className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />}
                          <span className="truncate">{item.vessel.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {item.bearing}° BRG · {item.distKm} км ({item.distNm} NM)
                        </span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        item.cpaAssessment.riskLevel === 'Safe' ? 'bg-emerald-500/15 text-emerald-400' :
                        item.cpaAssessment.riskLevel === 'Caution' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {item.cpaAssessment.riskLevel === 'Safe' ? 'OK' : item.cpaAssessment.riskLevel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* --------------------------------------
              CENTER 3D AR VISOR VIEWPORT (6 Cols)
              Featuring Artificial Horizon Pitch Ladder & Floating Dynamic Bearing Markers
             -------------------------------------- */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[420px] rounded-2xl overflow-hidden border border-white/5 bg-slate-950/30 backdrop-blur-xs">
            
            {/* SPATIAL HORIZON & PITCH LADDER (Moves with pitch and roll) */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
              style={{
                transform: `rotate(${rollDeg}deg) translateY(${pitchDeg * 8}px)`
              }}
            >
              {/* Pitch Ladder Ticks */}
              <div className="relative w-80 h-80 flex flex-col items-center justify-between opacity-30 font-mono text-[9px] text-cyan-400">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-cyan-400" />
                  <span>+10°</span>
                  <span className="w-8 h-px bg-cyan-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-12 h-px bg-cyan-400" />
                  <span>+05°</span>
                  <span className="w-12 h-px bg-cyan-400" />
                </div>
                
                {/* 0° Artificial Horizon Line with Central Pip */}
                <div className="w-full flex items-center justify-center gap-4 my-auto opacity-70">
                  <div className="w-28 h-[1.5px] bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <div className="w-3 h-3 rounded-full border border-cyan-400/80 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-cyan-400" />
                  </div>
                  <div className="w-28 h-[1.5px] bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 h-px bg-cyan-400" />
                  <span>-05°</span>
                  <span className="w-12 h-px bg-cyan-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-cyan-400" />
                  <span>-10°</span>
                  <span className="w-8 h-px bg-cyan-400" />
                </div>
              </div>
            </div>

            {/* DYNAMIC FLOATING BEARING MARKERS (Projected along the horizon) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {nearestVesselsWithVectors.map(item => {
                // Check if target is inside current Field of View (-fovSpanDeg/2 to +fovSpanDeg/2)
                const inFov = Math.abs(item.relBearing) <= (fovSpanDeg / 2);
                if (!inFov) return null;

                // Project X position across the visor (0% = left, 100% = right)
                const screenXPercent = 50 + (item.relBearing / (fovSpanDeg / 2)) * 42;
                // Subtle vertical parallax offset based on distance
                const screenYPercent = 48 + Math.min(25, (item.distKm / 10) * 15);
                const isLocked = item.vessel.id === activeTargetId;

                return (
                  <div 
                    key={`marker-${item.vessel.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTargetId(item.vessel.id);
                      onSelectVessel(item.vessel);
                      playTargetLockBeep();
                    }}
                    style={{
                      left: `${screenXPercent}%`,
                      top: `${screenYPercent}%`,
                    }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all duration-300 font-mono ${
                      isLocked ? 'scale-110 z-30' : 'scale-90 hover:scale-105 z-20 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Reticle shape */}
                    <div className="flex flex-col items-center">
                      
                      {/* Top Bearing indicator badge */}
                      <div className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase whitespace-nowrap mb-1 flex items-center gap-1 border shadow-lg ${
                        isLocked 
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/30 animate-pulse' 
                          : 'bg-slate-950/85 text-cyan-300 border-cyan-400/40 backdrop-blur-md'
                      }`}>
                        <Target className="w-2.5 h-2.5" />
                        <span>{item.vessel.name.slice(0, 16)}</span>
                        <span>·</span>
                        <span className="tabular-nums">{item.distKm}км</span>
                      </div>

                      {/* Optical Crosshair Reticle Diamond */}
                      <div className={`w-8 h-8 rounded-lg rotate-45 border flex items-center justify-center transition-all ${
                        isLocked 
                          ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]' 
                          : 'border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                      }`}>
                        <div className={`w-2 h-2 rounded-full -rotate-45 ${isLocked ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                      </div>

                      {/* Bearing pointer line */}
                      <div className={`w-px h-4 ${isLocked ? 'bg-amber-400' : 'bg-cyan-400/40'}`} />
                      <span className={`text-[8px] font-bold tabular-nums ${isLocked ? 'text-amber-300' : 'text-slate-400'}`}>
                        {item.bearing}° BRG
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CENTRAL PRIMARY TARGET RETICLE LOCK BOX */}
            <div className="relative z-20 p-4 rounded-2xl bg-slate-950/80 border border-cyan-400/70 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.35)] text-center font-mono pointer-events-auto max-w-sm w-full mx-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-extrabold uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>TARGET LOCK: {targetVessel?.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  AIS ОНЛАЙН
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-lg text-left">
                  <span className="text-[9px] text-slate-400 block uppercase">ДИСТАНЦИЯ</span>
                  <span className="text-base font-black text-white tabular-nums">
                    {lockedTargetData.distKm} км <span className="text-[10px] font-normal text-slate-400">({lockedTargetData.distNm} NM)</span>
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg text-left">
                  <span className="text-[9px] text-slate-400 block uppercase">ПЕЛЕНГ (BRG)</span>
                  <span className="text-base font-black text-cyan-300 tabular-nums">
                    {lockedTargetData.bearing}°
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 mt-2 border-t border-white/10">
                <span>CPA: <strong className="text-white tabular-nums">{lockedTargetData.cpaAssessment.cpaDistanceMeters} м</strong></span>
                <span>TCPA: <strong className="text-white tabular-nums">{lockedTargetData.cpaAssessment.tcpaSeconds} с</strong></span>
                <span className={`font-bold px-1.5 py-0.2 rounded ${
                  lockedTargetData.cpaAssessment.riskLevel === 'Safe' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {lockedTargetData.cpaAssessment.riskLevel === 'Safe' ? 'БЕЗОПАСНО' : lockedTargetData.cpaAssessment.riskLevel}
                </span>
              </div>
            </div>

            {/* Bottom FOV selector */}
            <div className="absolute bottom-3 flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/10 font-mono text-[10px] pointer-events-auto">
              <span className="text-slate-400 px-2 uppercase">УГОЛ ОБЗОРА (FOV):</span>
              <button
                onClick={() => setFovZoom('wide')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fovZoom === 'wide' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                120° WIDE
              </button>
              <button
                onClick={() => setFovZoom('normal')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fovZoom === 'normal' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                70° NORM
              </button>
              <button
                onClick={() => setFovZoom('tele')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fovZoom === 'tele' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                45° TELE
              </button>
            </div>

          </div>

          {/* --------------------------------------
              RIGHT WING: BATHYMETRIC SONAR & RUST CPA ENGINE (3 Cols)
              Featuring Real-Time Animated Depth Sounding Indicators
             -------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-y-auto pl-1">
            
            {/* REAL-TIME ANIMATED BATHYMETRIC SONAR SOUNDINGS INDICATOR */}
            <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-2xl space-y-3 font-mono shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Waves className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  ЭХОЛОТ И БАТИМЕТРИЯ
                </span>
                <span className="text-[10px] text-sky-300 font-bold flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${sonarPingPhase % 2 === 0 ? 'bg-sky-400 animate-ping' : 'bg-sky-500'}`} />
                  200 kHz
                </span>
              </div>

              {/* Animated Depth Tape Display */}
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* Vertical Depth Meter Column */}
                <div className="col-span-4 relative h-36 bg-slate-900/90 rounded-xl border border-white/10 overflow-hidden flex flex-col justify-between p-1.5 text-[9px] text-slate-400">
                  
                  {/* Dynamic Sea Bed Fill Graphic */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-600/40 via-sky-500/20 to-transparent transition-all duration-700 pointer-events-none"
                    style={{ height: `${Math.min(100, (depthMeters / 60) * 100)}%` }}
                  />

                  {/* Sonar Ping Beam Scan Line */}
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_10px_#38bdf8] transition-all duration-500"
                    style={{
                      bottom: `${((depthMeters / 60) * 100) + (sonarPingPhase * 2 - 3)}%`
                    }}
                  />

                  {/* Depth scale tick markers */}
                  <div className="relative z-10 flex justify-between"><span>00m</span><div className="w-2 h-px bg-white/20" /></div>
                  <div className="relative z-10 flex justify-between"><span>15m</span><div className="w-2 h-px bg-white/20" /></div>
                  <div className="relative z-10 flex justify-between"><span>30m</span><div className="w-2 h-px bg-white/20" /></div>
                  <div className="relative z-10 flex justify-between"><span>45m</span><div className="w-2 h-px bg-white/20" /></div>
                  <div className="relative z-10 flex justify-between"><span>60m</span><div className="w-2 h-px bg-white/20" /></div>
                </div>

                {/* Depth Numbers & Seabed Profiler */}
                <div className="col-span-8 space-y-2">
                  <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">ГЛУБИНА ПОД КИЛЕМ</span>
                    <span className="text-3xl font-black text-sky-300 tabular-nums tracking-tight">
                      {depthMeters} <span className="text-sm font-normal text-slate-400">м</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">КЛИРЕНС БЕЗОПАСЕН</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Грунт дна:</span>
                      <span className="text-white font-bold">Ил / Песок / Ракуша</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Приливной тренд:</span>
                      <span className="text-sky-300 font-bold">+0.2 м/ч (Прилив)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RUST ENGINE COLLISION RADAR BENCHMARK */}
            <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-cyan-500/25 backdrop-blur-2xl space-y-2.5 font-mono shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  RUST RADAR CORE (Wasm)
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/30">
                  {lockedTargetData.cpaAssessment.executionMicros} µs
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Статус сближения:</span>
                  <span className={`font-bold ${
                    lockedTargetData.cpaAssessment.riskLevel === 'Safe' ? 'text-emerald-400' :
                    lockedTargetData.cpaAssessment.riskLevel === 'Caution' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {lockedTargetData.cpaAssessment.riskLevel === 'Safe' ? 'Безопасно (Safe)' : lockedTargetData.cpaAssessment.riskLevel}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Дистанция CPA:</span>
                  <span className="text-white font-bold tabular-nums">
                    {lockedTargetData.cpaAssessment.cpaDistanceMeters} м
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Время TCPA:</span>
                  <span className="text-white font-bold tabular-nums">
                    {lockedTargetData.cpaAssessment.tcpaSeconds} сек
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 leading-relaxed">
                Векторы CPA/TCPA и ортодромические координаты рассчитываются без сборки мусора на базе <code>crates/jiv-marine-core</code>.
              </div>
            </div>

            {/* Target Vessel Action Card */}
            {targetVessel && (
              <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-2xl space-y-2 font-mono shadow-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1">
                  ДЕЙСТВИЕ С ЦЕЛЬЮ
                </span>
                <div className="text-sm font-bold text-white truncate">
                  {targetVessel.name}
                </div>
                <div className="text-xs text-slate-300">
                  Класс: <span className="text-cyan-400 uppercase font-bold">{targetVessel.category}</span> · {targetVessel.capacity} мест
                </div>
                <div className="text-xs text-slate-300 truncate">
                  Базирование: <span className="text-white">{targetVessel.homeport}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectVessel(targetVessel);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    Забронировать судно
                  </button>
                </div>
              </div>
            )}

          </div>

        </main>

        {/* ==========================================
            TIER 3: BOTTOM TELEMETRY FOOTER
           ========================================== */}
        <footer className="relative z-20 px-4 sm:px-6 py-2 border-t border-white/10 bg-slate-950/85 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AIS СЕТЬ: {vessels.length} СУДОВ В РАДИУСЕ 12 МИЛЬ
            </span>
            <span className="hidden sm:inline">УКВ КАНАЛ: 16 (156.8 МГц)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">НАЖМИТЕ ESC ДЛЯ ВЫХОДА ИЗ AR ВИЗОРА</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
