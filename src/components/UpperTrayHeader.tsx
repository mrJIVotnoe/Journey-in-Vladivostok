import React, { useRef, useState, useEffect } from 'react';
import { 
  Anchor, 
  Building2, 
  User, 
  Ship, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  CloudSun, 
  Radio, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Zap
} from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';

interface UpperTrayHeaderProps {
  activeSection: string;
  setActiveSection: (section: any) => void;
  lang: string;
  t: (key: string, namespace?: string) => string;
  authRole: 'client' | 'captain' | 'partner';
  weather: {
    windSpeed: number;
    waveHeight: number;
    status: string;
    warningMessage?: string;
  };
  theme: string;
  isAutoTheme: boolean;
  toggleAutoTheme: () => void;
  selectManualTheme: (theme: string) => void;
  onOpenHydromet: () => void;
  onOpenRadar: () => void;
  onOpenSelfHosting: () => void;
  onOpenTelegram: () => void;
  onOpenWeChat: () => void;
  onOpenAndroid: () => void;
  onOpenAdmin?: () => void;
  onOpenArHud?: () => void;
}

export default function UpperTrayHeader({
  activeSection,
  setActiveSection,
  lang,
  t,
  authRole,
  weather,
  theme,
  isAutoTheme,
  toggleAutoTheme,
  selectManualTheme,
  onOpenHydromet,
  onOpenRadar,
  onOpenSelfHosting,
  onOpenTelegram,
  onOpenWeChat,
  onOpenAndroid,
  onOpenAdmin,
  onOpenArHud
}: UpperTrayHeaderProps) {
  const trayScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Triple-click logo Easter Egg detection for Admin Command Center
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<any>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;

    if (clickCountRef.current >= 3) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      if (onOpenAdmin) {
        onOpenAdmin();
      }
      return;
    }

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current < 3) {
        setActiveSection('rent');
      }
      clickCountRef.current = 0;
    }, 400);
  };

  // Check scroll positions to show/hide gradient arrows
  const updateScrollState = () => {
    if (!trayScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trayScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = trayScrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!trayScrollRef.current) return;
    const scrollAmount = direction === 'left' ? -260 : 260;
    trayScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <header className="relative z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl sticky top-0 shadow-2xl shadow-black/80 font-sans" id="main-app-header">
      
      {/* ROW 1: BRANDING & TOP UTILITIES (Logo on Left, Language & Theme on Right across all screen sizes) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand Identity & Title */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0" 
          onClick={handleLogoClick}
          id="main-logo-brand"
        >
          <div className="relative flex items-center justify-center w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 font-extrabold text-sm sm:text-base tracking-tighter shadow-[0_0_18px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-all border border-amber-300/50 shrink-0">
            <span>JIV</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-200 animate-ping" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm md:text-base font-black tracking-wider text-white font-sans uppercase leading-none">
                JOURNEY IN VLADIVOSTOK
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-amber-400/90 font-semibold tracking-widest uppercase mt-0.5">
              MARINA & YACHT CHARTER
            </span>
          </div>
        </div>

        {/* Center Location Tag (Visible on medium/large screens) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="h-4 w-[1px] bg-white/15" />
          <span className="text-[10px] text-slate-300 font-mono tracking-widest uppercase bg-slate-900/60 px-3 py-1 rounded-full border border-white/10">
            {lang === 'ru' ? 'ВЛАДИВОСТОК • ЗАЛИВ ПЕТРА ВЕЛИКОГО' : 'VLADIVOSTOK • PETER THE GREAT GULF'}
          </span>
        </div>

        {/* Top Right Utilities: Language Selector & Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageDropdown />

          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-lg" id="theme-selector-top-header">
            <button
              type="button"
              onClick={toggleAutoTheme}
              className={`px-1.5 sm:px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition-all ${
                isAutoTheme
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={lang === 'ru' ? 'Автоматическая смена по времени суток' : 'Automatic theme'}
            >
              <Clock className={`w-3 h-3 ${isAutoTheme ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Авто' : 'Auto'}</span>
            </button>

            <div className="w-[1px] h-3 bg-white/10" />

            <button
              type="button"
              onClick={() => selectManualTheme('pearl')}
              className={`p-1 sm:px-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1 ${
                theme === 'pearl' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'ru' ? 'Солнечный день' : 'Sunny Day'}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => selectManualTheme('sunset')}
              className={`p-1 sm:px-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1 ${
                theme === 'sunset' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'ru' ? 'Вечерний закат' : 'Sunset'}
            >
              <Sunset className="w-3.5 h-3.5 text-rose-400" />
            </button>

            <button
              type="button"
              onClick={() => selectManualTheme('abyss')}
              className={`p-1 sm:px-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1 ${
                theme === 'abyss' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'ru' ? 'Полнолунная ночь' : 'Full Moon Night'}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

      </div>

      {/* ROW 2: PRIMARY NAVIGATION TABS BAR (Full width dedicated row - No overlapping) */}
      <div className="border-t border-white/5 bg-slate-900/40 py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {/* Rent Fleet Tab */}
          <button
            onClick={() => setActiveSection('rent')}
            id="nav-tab-rent"
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap group shadow-lg ${
              activeSection === 'rent'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30 font-black scale-[1.02]'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-100 border-amber-500/40'
            }`}
          >
            <Ship className={`w-3.5 h-3.5 shrink-0 ${activeSection === 'rent' ? 'text-slate-950' : 'text-amber-400 group-hover:scale-110'}`} />
            <span>{t('rent', 'nav')}</span>
            <span className={`text-[9px] font-mono px-1 py-0.5 rounded font-extrabold uppercase border ${
              activeSection === 'rent' 
                ? 'bg-slate-950/90 text-amber-300 border-amber-300/60' 
                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
            }`}>
              FLEET
            </span>
          </button>

          {/* Sea Concierge & SOS */}
          <button
            onClick={() => setActiveSection('shared')}
            id="nav-tab-shared"
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSection === 'shared'
                ? 'bg-white/10 text-white shadow-inner font-bold border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{t('concierge', 'nav')}</span>
          </button>

          {/* Digital Flights & Sea Taxi */}
          <button
            onClick={() => setActiveSection('flight')}
            id="nav-tab-flight"
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSection === 'flight'
                ? 'bg-white/10 text-white shadow-inner font-bold border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span>{t('captain_hub', 'nav')}</span>
          </button>

          {/* User Cabin / Captain Bridge / Partner */}
          {authRole === 'captain' ? (
            <button
              onClick={() => setActiveSection('captain')}
              id="nav-tab-cabin-captain"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
                activeSection === 'captain'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/30'
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{lang === 'ru' ? 'Мостик Капитана' : 'Captain Bridge'}</span>
            </button>
          ) : authRole === 'partner' ? (
            <button
              onClick={() => setActiveSection('partner')}
              id="nav-tab-cabin-partner"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
                activeSection === 'partner'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                  : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border-cyan-500/30'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{lang === 'ru' ? 'Мостик Партнёра' : 'Partner Hub'}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveSection('cabin')}
              id="nav-tab-cabin"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 border border-rose-500/20 shrink-0 whitespace-nowrap ${
                activeSection === 'cabin'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-rose-500/5 text-rose-300 hover:bg-rose-500/10'
              }`}
            >
              <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{t('cabin', 'nav')}</span>
            </button>
          )}

          {/* Login/Auth */}
          <button
            onClick={() => setActiveSection('auth')}
            id="nav-tab-auth"
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 border border-emerald-500/20 shrink-0 whitespace-nowrap ${
              activeSection === 'auth'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : 'bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t('login')}</span>
          </button>
        </div>
      </div>

      {/* TIER 2: DEDICATED UPPER TOOL TRAY (МОРСКИЕ ИНСТРУМЕНТЫ) */}
      <div className="bg-slate-950/95 border-t border-white/10 px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2 relative shadow-inner">
        
        {/* Tray Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-bold text-slate-300 text-[11px] sm:text-xs">
              {lang === 'ru' ? 'Морской Навигатор:' : 'Marine Tools:'}
            </span>
          </div>
        </div>

        {/* Marine Tools Tray Container */}
        <div className="relative flex-1 min-w-0 flex items-center justify-start sm:justify-end">
          
          {/* Scrollable Container with Marine Tools */}
          <div
            ref={trayScrollRef}
            className="flex items-center gap-2 overflow-x-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 px-1 max-w-full min-w-0 font-mono"
            id="upper-tray-scroll-container"
          >
            {/* 1. Hydromet Center */}
            <button
              type="button"
              onClick={onOpenHydromet}
              id="upper-tray-btn-hydromet"
              className="px-3 py-1 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 shadow-sm group hover:scale-[1.02] whitespace-nowrap"
              title={lang === 'ru' ? 'Открыть Погоду и Радары Гидрометцентра' : 'Open Hydromet Weather Center'}
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
              <span>
                {lang === 'ru' ? 'Гидрометцентр' : 'Hydromet'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded font-bold">
                {weather.windSpeed}{lang === 'ru' ? 'м/с' : 'm/s'}
              </span>
            </button>

            {/* 2. Interactive Radar */}
            <button
              type="button"
              onClick={onOpenRadar}
              id="upper-tray-btn-radar"
              className="px-3 py-1 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 shadow-sm group hover:scale-[1.02] whitespace-nowrap"
              title={lang === 'ru' ? 'Открыть Интерактивный радар судов' : 'Open Interactive Vessels Radar'}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span>
                {lang === 'ru' ? 'Радар Судов' : 'Live Radar'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-400/20 text-cyan-300 rounded font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                34
              </span>
            </button>

            {/* 3. AR Spatial HUD Visor */}
            {onOpenArHud && (
              <button
                type="button"
                onClick={onOpenArHud}
                id="upper-tray-btn-ar-hud"
                className="px-3 py-1 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-200 border border-cyan-400/50 shrink-0 shadow-sm shadow-cyan-500/20 group hover:scale-[1.02] whitespace-nowrap"
                title={lang === 'ru' ? 'Режим дополненной реальности (AR Очки / HUD Визор)' : 'Augmented Reality HUD Visor'}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />
                <span>
                  {lang === 'ru' ? 'AR Визор · Очки' : 'AR Visor'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 font-mono font-bold">
                  RUST
                </span>
              </button>
            )}
          </div>

        </div>

      </div>

    </header>
  );
}
