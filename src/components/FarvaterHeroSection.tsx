/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, Anchor, ArrowRight, ArrowDown, MapPin, Wind, Waves, Eye, Sunset, ShieldCheck, ChevronRight, Sparkles, Navigation } from 'lucide-react';
import { WeatherCondition, Vessel } from '../types';
import { useTranslation } from '../lib/translations';

interface FarvaterHeroSectionProps {
  weather: WeatherCondition;
  onSelectVesselsTab: () => void;
  onSelectRoutesTab: () => void;
  onBookClick: (vesselId?: string) => void;
  vesselsCount: number;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  onOpenArHud?: () => void;
}

export default function FarvaterHeroSection({
  weather,
  onSelectVesselsTab,
  onSelectRoutesTab,
  onBookClick,
  vesselsCount,
  selectedRouteId,
  onSelectRoute,
  onOpenArHud
}: FarvaterHeroSectionProps) {
  const { lang, t } = useTranslation();
  const [showVintageChartZoom, setShowVintageChartZoom] = useState(false);

  const routesList = [
    {
      id: 'route-1',
      title: 'Русский • Ворошиловская батарея',
      distance: '18 КМ',
      duration: '2 Ч • С ОСТАНОВКОЙ',
      description: 'Маршрут вдоль мыса Вятлина, фортов Владивостокской крепости и Гротов острова Русский.',
      latLon: [42.9811, 131.8901],
      highlightColor: '#f59e0b'
    },
    {
      id: 'route-2',
      title: 'Остров Попова • пляж Пограничный',
      distance: '34 КМ',
      duration: '4 Ч • ПИКНИК НА БОРТУ',
      description: 'Чистейшие бирюзовые пляжи, гроты, высадка на косу и свежие морепродукты.',
      latLon: [42.9572, 131.7210],
      highlightColor: '#22d3ee'
    },
    {
      id: 'route-3',
      title: 'Аскольд • дикие бухты',
      distance: '72 КМ',
      duration: '8 Ч • ДНЕВНОЙ ЧАРТЕР',
      description: 'Заповедный остров с мысом Елагина, заброшенным маяком и стадом оленей у обрыва.',
      latLon: [42.7533, 132.3314],
      highlightColor: '#e11d48'
    },
    {
      id: 'route-4',
      title: 'Закатный круиз по Золотому Рогу',
      distance: '9 КМ',
      duration: '1.5 Ч • С ШАМПАНСКИМ',
      description: 'Проход под Золотым и Русским мостами на закате, вечерняя огненная панорама города.',
      latLon: [43.1098, 131.8920],
      highlightColor: '#f43f5e'
    },
    {
      id: 'route-5',
      title: 'Лежбище пятнистых нерп (ларг)',
      distance: '26 КМ',
      duration: '3 Ч • ЭКСКУРСИЯ С ГИДОМ',
      description: 'Камни Пахтусова и остров Карамзина. Наблюдение за дикими нерпами в естественной среде.',
      latLon: [42.8711, 131.6322],
      highlightColor: '#10b981'
    }
  ];

  return (
    <div className="space-y-12" id="farvater-visual-presentation">
      
      {/* ==========================================
          HERO BANNER SECTION (Ref Image 1 & 5)
         ========================================== */}
      <section className="relative min-h-[82vh] lg:min-h-[88vh] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white shadow-2xl bg-slate-950" id="farvater-hero-container">
        
        {/* Background High-Res Aerial Yacht Image with Gradient Dark Vignette */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden">
          <img 
            src="/src/assets/images/vladivostok_yacht_hero_1794278080396.jpg" 
            alt="Yacht in Golden Horn Bay Vladivostok"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 contrast-110"
          />
          {/* Multi-layered dark gradient scrim to ensure WCAG legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Top Header Row of Hero */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          
          {/* Coordinates badge with gold lead rule */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-amber-400 rounded-full" />
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-widest text-amber-300 uppercase">
              43°06' N • 131°52' E — ВЛАДИВОСТОК
            </span>
          </div>

          {/* Quick status pill badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-amber-400/30 backdrop-blur-md text-amber-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>JOURNEY IN VLADIVOSTOK • НАВИГАЦИЯ 2026</span>
          </div>

        </div>

        {/* Center Editorial Title & Lead Paragraph */}
        <div className="relative z-10 my-auto py-8 max-w-4xl space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.02] sm:leading-[0.98] font-sans">
            Море <span className="font-editorial-italic text-amber-400 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-normal drop-shadow-lg">Владивостока,</span><br />
            по-<br />
            настоящему.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200/90 max-w-xl font-normal leading-relaxed font-sans">
            Яхты, катера и капитаны залива Петра Великого. Прозрачная цена, погода в реальном времени, живая радар-карта акватории.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onSelectVesselsTab}
              id="hero-btn-select-vessel"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-7 py-3.5 rounded-full text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-amber-500/25 flex items-center gap-2 group hover:scale-105"
            >
              <span>Выбрать судно</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {onOpenArHud && (
              <button
                onClick={onOpenArHud}
                id="hero-btn-ar-visor"
                className="bg-slate-900/80 hover:bg-slate-900 text-cyan-300 hover:text-cyan-200 font-mono font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm tracking-wider transition-all border border-cyan-500/40 backdrop-blur-xl shadow-xl shadow-cyan-500/20 flex items-center gap-2 group hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>AR ВИЗОР · HUD ОЧКИ</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Ticker: Marine Live Stats Bar (Matching image 1) */}
        <div className="relative z-10 border-t border-white/10 pt-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">ВЕТЕР</span>
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>{weather.windDirection} {weather.windSpeed} М/С</span>
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">ВОЛНА</span>
            <span className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>{weather.waveHeight} М</span>
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">ВИДИМОСТЬ</span>
            <span className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>12 КМ</span>
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider">ЗАКАТ СЕГОДНЯ</span>
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <Sunset className="w-3.5 h-3.5 text-amber-400" />
              <span>19:42</span>
            </span>
          </div>
        </div>

      </section>

      {/* ==========================================
          CONTINUOUS RUNNING MARQUEE TICKER (Ref Image 3)
         ========================================== */}
      <div className="w-full overflow-hidden bg-slate-900/60 border-y border-white/5 py-4 select-none relative" id="farvater-marquee-ticker">
        <div className="animate-marquee whitespace-nowrap text-lg sm:text-2xl font-sans tracking-wide text-slate-300 items-center gap-8">
          <span className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Эксклюзивные</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Яхты</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Скоростные</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Катера</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Круглосуточное</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Морское такси</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Залив Петра Великого</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Аттестованные</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Капитаны</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Остров Русский & Бухта Новик</span>
          </span>
          <span className="text-slate-600">•</span>
          {/* Duplicate set for infinite seamless marquee loop */}
          <span className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Эксклюзивные</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Яхты</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Скоростные</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Катера</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-3">
            <span>Круглосуточное</span>
            <span className="font-editorial-italic text-amber-400 text-2xl sm:text-3xl font-normal">Морское такси</span>
          </span>
        </div>
      </div>

    </div>
  );
}
