/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Vessel, SharedTour, WeatherCondition, Booking, AdCampaign } from './types';
import { VESSELS_DATA } from './data/vessels';
import WeatherWidget from './components/WeatherWidget';
import InteractiveSeaMap from './components/InteractiveSeaMap';
import VesselCard from './components/VesselCard';
import FarpostListRow from './components/FarpostListRow';
import FarvaterHeroSection from './components/FarvaterHeroSection';
import SeaConcierge from './components/SeaConcierge';
import ArchitecturePanel from './components/ArchitecturePanel';
import BookingDrawer from './components/BookingDrawer';
import CaptainsBridge from './components/CaptainsBridge';
import SeaTaxiPanel from './components/SeaTaxiPanel';
import DigitalCaptainHub from './components/DigitalCaptainHub';
import SponsorsGrid from './components/SponsorsGrid';
import SecurityAndTrackingPanel from './components/SecurityAndTrackingPanel';
import ReviewsLogbook from './components/ReviewsLogbook';
import PassengerCabin from './components/PassengerCabin';
import PartnerBridge from './components/PartnerBridge';
import MapToolsPanel from './components/MapToolsPanel';
import VirtualizedVesselList from './components/VirtualizedVesselList';
import SelfHostingModal from './components/SelfHostingModal';
import TelegramHubModal from './components/TelegramHubModal';
import WeChatHubModal from './components/WeChatHubModal';
import AndroidHubModal from './components/AndroidHubModal';
import AdminCommandCenterModal from './components/AdminCommandCenterModal';
import ArSpatialHudModal from './components/ArSpatialHudModal';
import UpperTrayHeader from './components/UpperTrayHeader';
import { initTelegramEnvironment } from './lib/telegramSDK';
import { initWeChatEnvironment } from './lib/wechatSDK';
import { LanguageProvider, useTranslation, Language } from './lib/translations';
import LanguageDropdown from './components/LanguageDropdown';
import { ProjectLineProvider, useProjectLine } from './lib/projectLineContext';
import ProjectLineSwitcher from './components/ProjectLineSwitcher';
import { 
  Anchor, 
  Building2,
  Search, 
  MapPin, 
  Compass, 
  SlidersHorizontal, 
  Gift, 
  Sparkles, 
  FileCode, 
  HelpCircle,
  Ship,
  Navigation,
  Calendar,
  User,
  Phone,
  CheckCircle,
  X,
  Compass as CompassIcon,
  Waves,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  Megaphone,
  Sun,
  Moon,
  Sunset,
  Clock,
  Sliders,
  CloudSun,
  Radio,
  Server,
  Send,
  MessageSquare,
  Smartphone,
  Maximize2
} from 'lucide-react';

function AppContent() {
  const { lang, setLang, t } = useTranslation();
  const { projectLine, details } = useProjectLine();

  // --- Visual Custom Theme Engine (Automatic time-of-day + Manual Override) ---
  const getAutoThemeForCurrentTime = (): 'abyss' | 'pearl' | 'sunset' => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 18) {
      return 'pearl'; // ☀️ Солнечный день (07:00 - 17:59)
    } else if (hour >= 18 && hour < 22) {
      return 'sunset'; // 🌅 Вечерний закат (18:00 - 21:59)
    } else {
      return 'abyss'; // 🌕 Полнолунная ночь (22:00 - 06:59)
    }
  };

  const [isAutoTheme, setIsAutoTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('vlad_sea_theme_auto');
    return saved !== null ? saved === 'true' : true;
  });

  const [manualTheme, setManualTheme] = useState<'abyss' | 'pearl' | 'sunset'>(() => {
    return (localStorage.getItem('vlad_sea_theme_manual') as any) || 'abyss';
  });

  const [theme, setTheme] = useState<'abyss' | 'pearl' | 'sunset'>(() => {
    const savedAuto = localStorage.getItem('vlad_sea_theme_auto');
    const autoEnabled = savedAuto !== null ? savedAuto === 'true' : true;
    if (autoEnabled) {
      return getAutoThemeForCurrentTime();
    }
    return (localStorage.getItem('vlad_sea_theme_manual') as any) || 'abyss';
  });

  // Sync theme based on time of day in Auto mode, or manual preference
  useEffect(() => {
    const syncTheme = () => {
      if (isAutoTheme) {
        setTheme(getAutoThemeForCurrentTime());
      } else {
        setTheme(manualTheme);
      }
    };
    syncTheme();
    const interval = setInterval(syncTheme, 60000); // Re-check every minute
    return () => clearInterval(interval);
  }, [isAutoTheme, manualTheme]);

  const toggleAutoTheme = () => {
    const nextAuto = !isAutoTheme;
    setIsAutoTheme(nextAuto);
    localStorage.setItem('vlad_sea_theme_auto', String(nextAuto));
    if (nextAuto) {
      setTheme(getAutoThemeForCurrentTime());
    } else {
      setTheme(manualTheme);
    }
  };

  const selectManualTheme = (selectedTheme: 'abyss' | 'pearl' | 'sunset') => {
    setIsAutoTheme(false);
    localStorage.setItem('vlad_sea_theme_auto', 'false');
    setManualTheme(selectedTheme);
    localStorage.setItem('vlad_sea_theme_manual', selectedTheme);
    setTheme(selectedTheme);
  };

  // --- Data & Filters State ---
  const [vessels, setVessels] = useState<Vessel[]>(VESSELS_DATA);
  
  // --- Global Bookings Queue state (airbnb/farfar style) ---
  const [bookings, setBookings] = useState<Booking[]>(() => {
    return [
      {
        id: 'B-201',
        vesselId: 'julia-60',
        vesselName: 'Эксклюзивная яхта «Джулия»',
        bookingType: 'hour',
        date: '2026-07-02',
        timeStart: '15:00',
        totalPrice: 60000,
        customerName: 'Евгений Крафт',
        customerPhone: '+7 (902) 555-12-34',
        status: 'pending',
        requestedAt: '2 мин. назад',
        wishesRoute: 'Хотим подойти поближе к маяку Токаревского и сделать фото на закате.',
        wishesConditions: 'Нужны бокалы под шампанское и теплые пледы.'
      },
      {
        id: 'B-202',
        vesselId: 'tuna-hunter',
        vesselName: 'Трофейный катер «Tuna Hunter 28»',
        bookingType: 'day',
        date: '2026-07-03',
        timeStart: '05:00',
        totalPrice: 35000,
        customerName: 'Владимир Ли',
        customerPhone: '+7 (914) 791-88-00',
        status: 'confirmed',
        requestedAt: '1 ч. назад',
        wishesRoute: 'Рыбалка в Амурском заливе на лакедру.',
        wishesConditions: 'Все снасти свои, нужен только лед для рыбы.'
      },
      {
        id: 'B-203',
        vesselId: 'julia-60',
        vesselName: 'Эксклюзивная яхта «Джулия»',
        bookingType: 'hour',
        date: '2026-07-04',
        timeStart: '10:00',
        totalPrice: 90000,
        customerName: 'Ван Вэй (WeChat Pay)',
        customerPhone: '+86 139 1234 5678',
        status: 'confirmed',
        requestedAt: '3 ч. назад',
        wishesRoute: 'Прогулка вокруг острова Русский с заходом в бухту Новик.',
        wishesConditions: 'Услуги шеф-повара (свежие морепродукты).'
      }
    ];
  });

  // --- Global Reviews & Photo Reports State ---
  const [reviews, setReviews] = useState<any[]>(() => {
    return [
      {
        id: 'R-1',
        vesselId: 'julia-60',
        vesselName: 'Эксклюзивная яхта «Джулия»',
        captainName: 'Алексей Бережной',
        customerName: 'Марина К.',
        rating: 5,
        comment: 'Потрясающая прогулка! Капитан Алексей очень вежливый, провел нас по самым красивым бухтам. Дети в восторге от системы Shark Shield, купались абсолютно спокойно.',
        date: '28 июня 2026',
        photos: [
          'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80'
        ]
      },
      {
        id: 'R-2',
        vesselId: 'tuna-hunter',
        vesselName: 'Трофейный катер «Tuna Hunter 28»',
        captainName: 'Игорь Кальмаренко',
        customerName: 'Сергей Д.',
        rating: 5,
        comment: 'Капитан Игорь — настоящий профессионал. Помог вытащить трофейную лакедру на 8.5 кг! Катер оборудован на высшем уровне, эхолот видит всю рыбу на 3D сканере.',
        date: '30 июня 2026',
        photos: [
          'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80'
        ]
      }
    ];
  });

  // --- Global Partner Campaigns & Ad Balance State ---
  const [partnerCampaigns, setPartnerCampaigns] = useState<AdCampaign[]>(() => [
    {
      id: 'CAM-101',
      name: 'Ресторан Zuma — Морские обеды',
      format: 'search_banner',
      status: 'active',
      impressions: 14280,
      clicks: 890,
      ctr: '6.2%',
      spent: '12 400 ₽',
      erid: 'erid: 2Vtzqu8901ZUMA',
      bannerText: '🦀 Ресторан Zuma: Скидка 10% на свежайших камчатских крабов и парных ежей для пассажиров JIV!',
      promoCode: 'ZUMA2026'
    },
    {
      id: 'CAM-102',
      name: 'Водник — Яхтенная экипировка',
      format: 'weather_radar',
      status: 'active',
      impressions: 28900,
      clicks: 1420,
      ctr: '4.9%',
      spent: '18 000 ₽',
      erid: 'erid: 2Vtzqu102VODNIK',
      bannerText: '⚓ Водник: Профессиональная ветрозащитная экипировка и спасательные жилеты с быстрой доставкой на пирс!',
      promoCode: 'VODNIK15'
    }
  ]);
  const [partnerBudget, setPartnerBudget] = useState<number>(42500);

  const [listingsLayout, setListingsLayout] = useState<'grid' | 'farpost_list' | 'map_only'>('farpost_list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  
  // Custom specification toggles
  const [filterSharkRepeller, setFilterSharkRepeller] = useState(false);
  const [filterMusic, setFilterMusic] = useState(false);
  const [filterEchoSounder, setFilterEchoSounder] = useState(false);
  const [filterFreeNow, setFilterFreeNow] = useState(false);

  // Sorting selection
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');

  // Price filtering states
  const [priceMode, setPriceMode] = useState<'hour' | 'day'>('hour');
  const [maxPrice, setMaxPrice] = useState<number>(30000);

  // --- Weather Simulation State ---
  const [weather, setWeather] = useState<WeatherCondition>({
    waveHeight: 0.3,
    windSpeed: 3.5,
    windDirection: 'NE',
    temperatureAir: 22,
    temperatureWater: 18,
    status: 'calm',
    warningMessage: 'Штиль. Отличная видимость. Безопасный выход в открытое море по всей акватории.'
  });

  // --- Navigation & Map Coordination ---
  const [selectedVesselForMap, setSelectedVesselForMap] = useState<Vessel | null>(null);
  const [customRoutePoints, setCustomRoutePoints] = useState<[number, number][]>([]);
  const [customPickupPoint, setCustomPickupPoint] = useState<{ latLon: [number, number]; type: 'pickup' | 'evac' } | null>(null);

  // Top Tray Modals state for Hydromet Center, Radar, Self-Hosting, Telegram, WeChat & Android PWA
  const [isHydrometModalOpen, setIsHydrometModalOpen] = useState<boolean>(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isSelfHostingModalOpen, setIsSelfHostingModalOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isArHudOpen, setIsArHudOpen] = useState<boolean>(false);

  // Initialize Telegram & WeChat WebApp SDKs
  useEffect(() => {
    initTelegramEnvironment();
    initWeChatEnvironment();
  }, []);

  // --- Active Sub-Sections tabs ---
  // 'rent' (Yachts list) | 'shared' (Sea Concierge) | 'architecture' (Specs) | 'captain' (Captain's Bridge) | 'partner' (Partner Bridge) | 'flight' (Digital Captain Hub) | 'auth' (Security & Verification) | 'cabin' (Passenger Cabin)
  const [activeSection, setActiveSection] = useState<'rent' | 'shared' | 'architecture' | 'captain' | 'partner' | 'flight' | 'auth' | 'cabin'>('rent');
  const [authRole, setAuthRole] = useState<'client' | 'captain' | 'partner'>('client');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>('route-1');

  // --- Booking flow state ---
  const [bookingVessel, setBookingVessel] = useState<Vessel | null>(null);
  const [bookingTour, setBookingTour] = useState<SharedTour | null>(null);
  const [successBookingDetails, setSuccessBookingDetails] = useState<any | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [couponNotification, setCouponNotification] = useState<string | null>(null);

  // --- Helper: Dynamic Weather Advice ---
  // If stormy, auto-recommend Novik Bay vessels
  const isStormy = weather.status === 'stormy';

  // Apply filtering rules
  const filteredVessels = vessels.filter(vs => {
    // 1. Category search
    if (selectedCategory !== 'all' && vs.category !== selectedCategory) return false;
    
    // 2. Location search
    if (selectedLocation !== 'all' && !vs.homeport.includes(selectedLocation)) return false;

    // 3. Text search (Name, description, captain, features)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = vs.name.toLowerCase().includes(query);
      const matchDesc = vs.description.toLowerCase().includes(query);
      const matchCap = vs.captainName.toLowerCase().includes(query);
      const matchFeats = vs.features.some(f => f.toLowerCase().includes(query));
      if (!matchName && !matchDesc && !matchCap && !matchFeats) return false;
    }

    // 4. Custom feature toggles
    if (filterSharkRepeller && !vs.hasSharkRepeller) return false;
    if (filterMusic && !vs.hasMusic) return false;
    if (filterEchoSounder && !vs.hasEchoSounder) return false;

    // 5. Price range and mode filtering
    if (priceMode === 'hour') {
      if (vs.priceHour && vs.priceHour > maxPrice) return false;
    } else {
      if (vs.priceDay && vs.priceDay > maxPrice) return false;
      if (!vs.priceDay) return false; // Hide if no daily price option
    }

    // 6. Свободен сейчас (Free now)
    if (filterFreeNow && !vs.isLive) return false;

    return true;
  });

  // Sorting based on user selection, storm safety, etc.
  const processedVessels = [...filteredVessels].sort((a, b) => {
    // If stormy, we also boost protected bays (Novik) to the top!
    if (isStormy) {
      const aProtected = a.homeport.includes('Новик');
      const bProtected = b.homeport.includes('Новик');
      if (aProtected && !bProtected) return -1;
      if (!aProtected && bProtected) return 1;
    }

    if (sortBy === 'price_asc') {
      const pA = priceMode === 'hour' ? (a.priceHour || 0) : (a.priceDay || 0);
      const pB = priceMode === 'hour' ? (b.priceHour || 0) : (b.priceDay || 0);
      return pA - pB;
    } else if (sortBy === 'price_desc') {
      const pA = priceMode === 'hour' ? (a.priceHour || 0) : (a.priceDay || 0);
      const pB = priceMode === 'hour' ? (b.priceHour || 0) : (b.priceDay || 0);
      return pB - pA;
    } else {
      // By rating descending
      return (b.rating || 0) - (a.rating || 0);
    }
  });

  const handleApplyQuickPromo = (code: string) => {
    setPromoInput(code);
    setCouponNotification(`Код "${code}" скопирован. Вставьте его при оформлении бронирования для скидки 50%!`);
    setTimeout(() => setCouponNotification(null), 6000);
  };

  useEffect(() => {
    if (authRole === 'captain' && (activeSection === 'cabin' || activeSection === 'partner')) {
      setActiveSection('captain');
    } else if (authRole === 'partner' && (activeSection === 'cabin' || activeSection === 'captain')) {
      setActiveSection('partner');
    } else if (authRole === 'client' && (activeSection === 'captain' || activeSection === 'partner')) {
      setActiveSection('cabin');
    }
  }, [authRole, activeSection]);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col relative theme-${theme}`} id="app-root-container">
      
      {/* Global Atmospheric High-Res Background Image (from Hero Sunset Yacht View) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img 
          src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2000&q=80" 
          alt="Journey In Vladivostok Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter brightness-75 contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-950/30" />
      </div>

      {/* Dynamic Animated Sea/Water particle mesh in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="sea-waves-backdrop">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[70%] bg-gradient-to-b from-cyan-950/20 via-blue-950/10 to-transparent rotate-[-3deg] blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] w-[80%] h-[50%] bg-gradient-to-t from-slate-900/40 via-cyan-950/5 to-transparent blur-3xl" />
        
        {/* SVG Decorative contour lines mimicking sea depth lines */}
        <svg className="absolute top-1/4 left-0 w-full opacity-5" viewBox="0 0 1440 300" fill="none">
          <path d="M0,150 Q360,100 720,200 T1440,150 L1440,300 L0,300 Z" fill="url(#wave-grad)" />
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Upper Tray Header Component (Two-tier responsive layout with scroll controls & quick menu) */}
      <UpperTrayHeader
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        lang={lang}
        t={t}
        authRole={authRole}
        weather={weather}
        theme={theme}
        isAutoTheme={isAutoTheme}
        toggleAutoTheme={toggleAutoTheme}
        selectManualTheme={selectManualTheme}
        onOpenHydromet={() => setIsHydrometModalOpen(true)}
        onOpenRadar={() => setIsRadarModalOpen(true)}
        onOpenSelfHosting={() => setIsSelfHostingModalOpen(true)}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
        onOpenWeChat={() => setIsWeChatModalOpen(true)}
        onOpenAndroid={() => setIsAndroidModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenArHud={() => setIsArHudOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8" id="app-main-body">
        
        {/* Mobile Navigation controls */}
        <div className="flex md:hidden bg-slate-900/80 rounded-xl p-1 border border-white/5 overflow-x-auto scrollbar-none gap-1" id="mobile-nav-tabs">
          <button
            onClick={() => setActiveSection('rent')}
            id="mob-nav-rent"
            className={`flex-1 min-w-fit px-3 py-2 text-[10px] font-bold text-center rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 ${
              activeSection === 'rent'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Ship className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'ru' ? 'Аренда флота' : lang === 'en' ? 'Fleet Charter' : '舰队租赁'}</span>
          </button>
          <button
            onClick={() => setActiveSection('shared')}
            id="mob-nav-shared"
            className={`flex-1 min-w-fit px-3 py-2 text-[10px] font-bold text-center rounded-lg transition-all whitespace-nowrap shrink-0 ${activeSection === 'shared' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400'}`}
          >
            {lang === 'ru' ? 'Консьерж' : lang === 'en' ? 'Concierge' : '礼宾'}
          </button>
          <button
            onClick={() => setActiveSection('flight')}
            id="mob-nav-flight"
            className={`flex-1 min-w-fit px-3 py-2 text-[10px] font-bold text-center rounded-lg transition-all whitespace-nowrap shrink-0 ${activeSection === 'flight' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400'}`}
          >
            {lang === 'ru' ? 'Капитан' : lang === 'en' ? 'Captain' : '船长'} ✈️
          </button>
          {authRole === 'captain' ? (
            <button
              onClick={() => setActiveSection('captain')}
              id="mob-nav-captain"
              className={`flex-1 min-w-fit px-3 py-2 text-[10px] font-bold text-center rounded-lg transition-all whitespace-nowrap shrink-0 ${activeSection === 'captain' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400'}`}
            >
              {lang === 'ru' ? 'Мостик' : lang === 'en' ? 'Bridge' : '驾驶台'} ⚓
            </button>
          ) : (
            <button
              onClick={() => setActiveSection('cabin')}
              id="mob-nav-cabin"
              className={`flex-1 min-w-fit px-3 py-2 text-[10px] font-bold text-center rounded-lg transition-all whitespace-nowrap shrink-0 ${activeSection === 'cabin' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400'}`}
            >
              {lang === 'ru' ? 'Каюта' : lang === 'en' ? 'Cabin' : '客舱'} 🛋️
            </button>
          )}
          <button
            onClick={() => setActiveSection('auth')}
            id="mob-nav-auth"
            className={`flex-1 min-w-fit px-3 py-2 text-[10px] font-bold text-center rounded-lg transition-all whitespace-nowrap shrink-0 ${activeSection === 'auth' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'}`}
          >
            {lang === 'ru' ? 'Вход' : lang === 'en' ? 'Login' : '登录'} 🔑
          </button>
        </div>

        {/* Dynamic Stormy Alert message at top */}
        {isStormy && (
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md text-rose-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-pulse" id="storm-global-warning-banner">
            <div className="flex items-center gap-2.5">
              <Waves className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">{t('title', 'storm')}</span>
                <span className="text-xs">{t('desc', 'storm')}</span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-500/30 text-[10px] font-mono font-bold text-rose-400 text-center uppercase">
              {t('recommend', 'storm')}
            </div>
          </div>
        )}

        {/* Coupon notification alert banner */}
        {couponNotification && (
          <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-950/25 text-emerald-400 text-xs flex items-center justify-between gap-2 animate-fade-in" id="coupon-alert-banner">
            <span>{couponNotification}</span>
            <button onClick={() => setCouponNotification(null)} className="text-emerald-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: Standard Fleet Rentals & Maps search (Default tab) */}
        {activeSection === 'rent' && (
          <div className="space-y-12" id="rentals-dashboard-view">
            
            {/* Visual Design Hero Section, Weather Ticker & Vintage Routes Map */}
            <FarvaterHeroSection
              weather={weather}
              onSelectVesselsTab={() => {
                const el = document.getElementById('fleet-catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectRoutesTab={() => {
                const el = document.getElementById('sea-map-and-filters-container') || document.getElementById('fleet-catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onBookClick={(vesselId) => {
                if (vesselId) {
                  const v = vessels.find(x => x.id === vesselId);
                  if (v) setBookingVessel(v);
                } else if (vessels.length > 0) {
                  setBookingVessel(vessels[0]);
                }
              }}
              vesselsCount={vessels.length}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(routeId) => setSelectedRouteId(routeId)}
              onOpenArHud={() => setIsArHudOpen(true)}
            />

            {/* SECTION — 01 / FLEET HEADER */}
            <div className="pt-6 border-t border-white/10" id="fleet-catalog-section">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 uppercase tracking-widest mb-1">
                    <span>— 01</span>
                    <span>/</span>
                    <span>ФЛОТ</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-normal text-white tracking-tight">
                    Каждое судно — <span className="font-editorial-italic text-amber-400 text-4xl sm:text-6xl font-normal">со своим характером.</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20 w-fit">
                  <span>ДОСТУПНО СУДОВ:</span>
                  <span className="font-bold text-amber-400">{filteredVessels.length} из {vessels.length}</span>
                </div>
              </div>
            </div>

            {/* Split Grid: Left filters / Right Radar map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Search & Weather center (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Search & Custom filters box */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 space-y-4 shadow-xl">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      {lang === 'ru' ? 'Фильтры флота' : lang === 'en' ? 'Fleet Filters' : '船队筛选'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'ru' 
                        ? 'Точный подбор по парамтрам судна и датам' 
                        : lang === 'en' 
                        ? 'Precise filtering by vessel options and dates' 
                        : '根据船只参数与日期精准筛选'}
                    </p>
                  </div>

                  {/* Search bar input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder={lang === 'ru' 
                        ? "Поиск по названию, опциям («акулы», «сап»)..." 
                        : lang === 'en' 
                        ? "Search by name, options ('shark', 'sup')..." 
                        : "按船名、配置搜索（“防鲨器”、“桨板”)..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      id="vessel-search-input"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Category select selectors */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      {lang === 'ru' ? 'Тип плавсредства' : lang === 'en' ? 'Vessel Type' : '船只类型'}
                    </label>
                    <div className="grid grid-cols-2 gap-2" id="vessel-category-grid">
                      {[
                        { id: 'all', label: lang === 'ru' ? 'Весь флот' : lang === 'en' ? 'All Fleet' : '全部船队' },
                        { id: 'yacht', label: lang === 'ru' ? 'VIP-Яхты' : lang === 'en' ? 'VIP Yachts' : '豪华游艇' },
                        { id: 'boat', label: lang === 'ru' ? 'Катера' : lang === 'en' ? 'Boats' : '高速快艇' },
                        { id: 'jetski', label: lang === 'ru' ? 'Гидроциклы' : lang === 'en' ? 'Jet Skis' : '摩托艇' },
                        { id: 'taxi', label: lang === 'ru' ? 'Морское такси' : lang === 'en' ? 'Sea Taxi' : '水上出租车' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          id={`cat-filter-btn-${cat.id}`}
                          className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-slate-900/30 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location harbor selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      {lang === 'ru' ? 'Район базирования' : lang === 'en' ? 'Base Bay Area' : '停靠港区'}
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      id="location-filter-select"
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="all">{lang === 'ru' ? 'Все районы (Бухты Владивостока)' : lang === 'en' ? 'All Areas (Vladivostok Bays)' : '所有区域（符拉迪沃斯托克海湾）'}</option>
                      <option value="Новик">{lang === 'ru' ? 'о. Русский (бухта Новик)' : lang === 'en' ? 'Russky Isl. (Novik Bay)' : '俄罗斯岛（诺维克湾）'}</option>
                      <option value="Канал">{lang === 'ru' ? 'о. Русский (Канал)' : lang === 'en' ? 'Russky Isl. (Canal)' : '俄罗斯岛（运河）'}</option>
                      <option value="Поспелово">{lang === 'ru' ? 'о. Русский (Поспелово)' : lang === 'en' ? 'Russky Isl. (Pospelovo)' : '俄罗斯岛（波斯佩洛沃）'}</option>
                      <option value="Змеинка">{lang === 'ru' ? 'Бухта Змеинка' : lang === 'en' ? 'Zmeinka Bay' : '兹梅因卡湾'}</option>
                      <option value="Маяк">{lang === 'ru' ? 'Эгершельд (Токаревский маяк)' : lang === 'en' ? 'Egersheld (Tokarevsky Light)' : '埃格尔舍尔德（托卡列夫斯基灯塔）'}</option>
                    </select>
                  </div>

                  {/* Price model & bounds slider */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                        {lang === 'ru' ? 'Модель расчета стоимости' : lang === 'en' ? 'Pricing Model' : '计费模式'}
                      </label>
                      <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setPriceMode('hour');
                            setMaxPrice(30000);
                          }}
                          className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all uppercase ${
                            priceMode === 'hour'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {lang === 'ru' ? 'Почасовая' : lang === 'en' ? 'Hourly' : '按小时'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPriceMode('day');
                            setMaxPrice(130000);
                          }}
                          className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all uppercase ${
                            priceMode === 'day'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {lang === 'ru' ? 'Посуточная' : lang === 'en' ? 'Daily' : '按天'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">{lang === 'ru' ? 'Макс. стоимость:' : lang === 'en' ? 'Max Price:' : '最高价格：'}</span>
                        <span className="text-cyan-400 font-bold">
                          {maxPrice.toLocaleString()} {lang === 'ru' ? '₽' : lang === 'en' ? 'RUB' : '元'} {priceMode === 'hour' ? (lang === 'ru' ? '/ час' : lang === 'en' ? '/ hour' : '/ 小时') : (lang === 'ru' ? '/ сутки' : lang === 'en' ? '/ day' : '/ 天')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={priceMode === 'hour' ? 1000 : 10000}
                        max={priceMode === 'hour' ? 30000 : 130000}
                        step={priceMode === 'hour' ? 500 : 5000}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                        <span>{priceMode === 'hour' ? '1 000 ₽' : '10 000 ₽'}</span>
                        <span>{priceMode === 'hour' ? '30 000 ₽' : '130 000 ₽'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom spec check-boxes */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      {lang === 'ru' ? 'Уникальные опции' : lang === 'en' ? 'Unique Options' : '独特配置'}
                    </label>
                    <div className="space-y-1.5" id="unique-options-checkboxes">
                      <button
                        onClick={() => setFilterSharkRepeller(!filterSharkRepeller)}
                        id="chk-shark-repeller"
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs border transition-all ${
                          filterSharkRepeller 
                            ? 'bg-amber-500/10 border-amber-500/35 text-amber-300' 
                            : 'bg-slate-900/30 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          🛡️ {lang === 'ru' ? 'Австралийский отпугиватель акул' : lang === 'en' ? 'Australian Shark Shield' : '澳大利亚电磁驱鲨器'}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                          {lang === 'ru' ? 'Защита от акул' : lang === 'en' ? 'Shark Shield' : '防鲨保护'}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterMusic(!filterMusic)}
                        id="chk-music-audio"
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs border transition-all ${
                          filterMusic 
                            ? 'bg-rose-500/10 border-rose-500/35 text-rose-300' 
                            : 'bg-slate-900/30 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          🎵 {lang === 'ru' ? 'С музыкой на борту' : lang === 'en' ? 'Music on board' : '船载高档音响'}
                        </span>
                        <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                          {lang === 'ru' ? 'Акустика' : lang === 'en' ? 'Bluetooth / Sub' : '蓝牙 / 重低音'}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterEchoSounder(!filterEchoSounder)}
                        id="chk-echo-sounder"
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs border transition-all ${
                          filterEchoSounder 
                            ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300' 
                            : 'bg-slate-900/30 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          🎣 {lang === 'ru' ? 'С эхолотом для рыбалки' : lang === 'en' ? 'Fishing Sonar' : '专业探鱼器'}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                          {lang === 'ru' ? 'Эхолот 3D' : lang === 'en' ? 'Sonar 3D' : '3D 探鱼仪'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Tucked Tools Launchers */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      {lang === 'ru' ? 'Быстрый доступ к навигации' :
                       lang === 'zh' ? '快捷导航工具' :
                       lang === 'ja' ? 'クイックナビゲーション' :
                       lang === 'ko' ? '빠른 탐색 도구' :
                       'Quick Navigation Tools'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsHydrometModalOpen(true)}
                        id="filter-btn-hydromet"
                        className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between group transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <CloudSun className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
                          <span>
                            {lang === 'ru' ? 'Гидромет' :
                             lang === 'zh' ? '气象水文' :
                             lang === 'ja' ? '気象' :
                             lang === 'ko' ? '기상' :
                             'Hydromet'}
                          </span>
                        </span>
                        <span className="text-[9px] font-mono bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-300 font-bold">LIVE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRadarModalOpen(true)}
                        id="filter-btn-radar"
                        className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-between group transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                          <span>
                            {lang === 'ru' ? 'Радар' :
                             lang === 'zh' ? '雷达' :
                             lang === 'ja' ? 'レーダー' :
                             lang === 'ko' ? '레이더' :
                             'Radar'}
                          </span>
                        </span>
                        <span className="text-[9px] font-mono bg-cyan-400/20 px-1.5 py-0.5 rounded text-cyan-300 font-bold">MAP</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Partner Cards Grid */}
            <SponsorsGrid onApplyPromo={handleApplyQuickPromo} />

            {/* Instant Sea Taxi Calling Panel (Prompt #5 requirement: Морское такси 24/7) */}
            {selectedCategory === 'taxi' && (
              <div className="my-6">
                <SeaTaxiPanel 
                  vessels={vessels} 
                  setVessels={setVessels} 
                  weather={weather}
                  onSuccessBooking={(details) => {
                    setSuccessBookingDetails(details);
                  }}
                />
              </div>
            )}

            {/* List Section: Available Boats and Vessels heading */}
            <div className="space-y-6 pt-4" id="vessels-section-header">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>
                      {lang === 'ru' ? 'Доступные объявления во Владивостоке' : lang === 'en' ? 'Available Vessels in Vladivostok' : '符拉迪沃斯托克可用船只'}
                    </span>
                    <span className="text-xs bg-slate-900 border border-white/5 text-cyan-400 px-2.5 py-1 rounded-full font-mono font-medium">
                      {lang === 'ru' 
                        ? `${processedVessels.length} вариантов` 
                        : lang === 'en' 
                        ? `${processedVessels.length} options` 
                        : `${processedVessels.length} 选项`}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isStormy 
                      ? (lang === 'ru' 
                        ? '⚠️ В связи со штормом в первую очередь отображаются защищенные бухты (Бухта Новик)' 
                        : lang === 'en' 
                        ? '⚠️ Due to the storm, protected bays (Novik Bay) are shown first' 
                        : '⚠️ 鉴于风暴，优先显示受保护的港湾（诺维克湾）') 
                      : (lang === 'ru' 
                        ? 'Единый каталог судов и прямая система онлайн-бронирования.' 
                        : lang === 'en' 
                        ? 'Unified vessel catalog and direct online booking system.' 
                        : '统一游艇目录与直接在线预订系统。')}
                  </p>
                </div>

                {/* View switcher toggle */}
                <div className="flex bg-slate-900/90 rounded-xl p-1 border border-white/5 font-mono text-xs text-slate-400" id="vessels-layout-toggle">
                  <button
                    onClick={() => setListingsLayout('grid')}
                    id="btn-layout-grid-select"
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                      listingsLayout === 'grid' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'hover:text-white'
                    }`}
                  >
                    <span>{lang === 'ru' ? '🏡 Плитка' : lang === 'en' ? '🏡 Grid' : '🏡 网格'}</span>
                  </button>
                  <button
                    onClick={() => setListingsLayout('farpost_list')}
                    id="btn-layout-farpost-select"
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                      listingsLayout === 'farpost_list' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'hover:text-white'
                    }`}
                  >
                    <span>{lang === 'ru' ? '📝 Список' : lang === 'en' ? '📝 List' : '📝 列表'}</span>
                  </button>
                </div>
              </div>

              {/* Sorting and availability toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5" id="vessels-sort-filter-toolbar">
                {/* Sort selector */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mr-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lang === 'ru' ? 'Сортировка:' : lang === 'en' ? 'Sort by:' : '排序方式：'}</span>
                  </span>
                  <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-white/5 text-[11px] font-medium font-mono">
                    <button
                      onClick={() => setSortBy('rating')}
                      id="sort-by-rating"
                      className={`px-3 py-1 rounded-md transition-all ${
                        sortBy === 'rating'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? '★ По рейтингу' : lang === 'en' ? '★ By Rating' : '★ 按评分'}
                    </button>
                    <button
                      onClick={() => setSortBy('price_asc')}
                      id="sort-by-price-asc"
                      className={`px-3 py-1 rounded-md transition-all ${
                        sortBy === 'price_asc'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? '₽ Сначала дешевле' : lang === 'en' ? 'Price: Low to High' : '价格：从低到高'}
                    </button>
                    <button
                      onClick={() => setSortBy('price_desc')}
                      id="sort-by-price-desc"
                      className={`px-3 py-1 rounded-md transition-all ${
                        sortBy === 'price_desc'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? '₽ Сначала дороже' : lang === 'en' ? 'Price: High to Low' : '价格：从高到低'}
                    </button>
                  </div>
                </div>

                {/* Filter Free Now (Live) */}
                <button
                  onClick={() => setFilterFreeNow(!filterFreeNow)}
                  id="filter-free-now"
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2 border transition-all ${
                    filterFreeNow
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filterFreeNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span>{lang === 'ru' ? 'Свободен сейчас' : lang === 'en' ? 'Free now' : '现在空闲'}</span>
                </button>
              </div>

              {/* Grid of Vessels cards / FarPost table row lists (Virtualized for High Performance) */}
              {processedVessels.length > 0 ? (
                <VirtualizedVesselList
                  vessels={processedVessels}
                  listingsLayout={listingsLayout}
                  selectedVesselForMap={selectedVesselForMap}
                  onSelectVesselForMap={(vs) => setSelectedVesselForMap(vs)}
                  onBookVessel={(vs) => setBookingVessel(vs)}
                />
              ) : (
                <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-slate-900/20" id="no-vessels-fallback">
                  <Anchor className="w-10 h-10 text-slate-500 mx-auto animate-bounce" />
                  <h4 className="text-sm font-semibold text-white mt-3">Судов с такими параметрами не найдено</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Попробуйте сбросить поисковый запрос, отключить фильтр защиты от акул или сменить район базирования.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                      setFilterSharkRepeller(false);
                      setFilterMusic(false);
                      setFilterEchoSounder(false);
                    }}
                    id="btn-reset-all-filters"
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Сбросить все фильтры
                  </button>
                </div>
              )}
            </div>

            {/* Post-trip Passenger Reviews Logbook & Rating section */}
            <div className="mt-12 pt-8 border-t border-white/5">
              <ReviewsLogbook 
                vessels={vessels}
                setVessels={setVessels}
                reviews={reviews}
                setReviews={setReviews}
              />
            </div>

          </div>
        )}

        {/* SECTION 2: Sea Concierge ("Морской консьерж" shared outings) */}
        {activeSection === 'shared' && (
          <SeaConcierge 
            onBookSeat={(tour) => {
              setBookingTour(tour);
              setBookingVessel(VESSELS_DATA.find(v => v.id === tour.vesselId) || null);
            }}
          />
        )}

        {/* SECTION 5: Digital Captain & Flight Services Hub */}
        {activeSection === 'flight' && (
          <DigitalCaptainHub vessels={vessels} weather={weather} />
        )}

        {/* SECTION 3: Architecture & System specifications panel */}
        {activeSection === 'architecture' && (
          <ArchitecturePanel />
        )}

        {/* SECTION 4: Captain's Bridge panel */}
        {activeSection === 'captain' && (
          <CaptainsBridge 
            vessels={vessels} 
            setVessels={setVessels} 
            bookings={bookings}
            setBookings={setBookings}
          />
        )}

        {/* SECTION 8: Partner Bridge panel ("Мостик Партнёра & Рекламодателя") */}
        {activeSection === 'partner' && (
          <PartnerBridge 
            campaigns={partnerCampaigns}
            setCampaigns={setPartnerCampaigns}
            budgetBalance={partnerBudget}
            setBudgetBalance={setPartnerBudget}
            onGoToFleetRental={() => setActiveSection('rent')}
          />
        )}

        {/* SECTION 7: Passenger Cabin panel ("Пассажирская каюта") */}
        {activeSection === 'cabin' && (
          <PassengerCabin
            vessels={vessels}
            setVessels={setVessels}
            bookings={bookings}
            setBookings={setBookings}
            reviews={reviews}
            setReviews={setReviews}
            activeRole={authRole}
            onRoleChange={(newRole) => {
              setAuthRole(newRole);
              setActiveSection(newRole === 'captain' ? 'captain' : newRole === 'partner' ? 'partner' : 'cabin');
            }}
            onNavigateSection={setActiveSection}
          />
        )}

        {/* SECTION 6: Authorization & Security Panel (Passenger/Captain dual tracks) */}
        {activeSection === 'auth' && (
          <div className="space-y-6" id="auth-tab-view">
            <SecurityAndTrackingPanel
              vessels={vessels}
              selectedVessel={selectedVesselForMap}
              onSelectVessel={setSelectedVesselForMap}
              onSetCustomRoute={setCustomRoutePoints}
              onSetPickupPoint={setCustomPickupPoint}
              currentRoutePoints={customRoutePoints}
              currentPickupPoint={customPickupPoint}
              activeRole={authRole}
              onRoleChange={(newRole) => {
                setAuthRole(newRole);
                if (activeSection === 'cabin' || activeSection === 'captain' || activeSection === 'partner') {
                  setActiveSection(newRole === 'captain' ? 'captain' : newRole === 'partner' ? 'partner' : 'cabin');
                }
              }}
            />
          </div>
        )}

      </main>

      {/* Primary Slide-out Booking Drawer Component */}
      {(bookingVessel || bookingTour) && (
        <BookingDrawer 
          vessel={bookingVessel}
          tour={bookingTour}
          weatherStatus={weather.status}
          bookings={bookings}
          onAddBooking={(newBooking) => setBookings(prev => [newBooking, ...prev])}
          onClose={() => {
            setBookingVessel(null);
            setBookingTour(null);
          }}
          onSuccess={(details) => {
            setSuccessBookingDetails(details);
            setBookingVessel(null);
            setBookingTour(null);
          }}
        />
      )}

      {/* Elegant SUCCESS BOOKING BOARDING PASS OVERLAY */}
      {successBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in" id="boarding-pass-overlay">
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
            
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-xl font-extrabold text-white tracking-tight">Посадочный талон оформлен!</h4>
              <p className="text-xs text-slate-400">
                Ваша бронь подтверждена. Мы сформировали судовой талон для капитана судна.
              </p>
            </div>

            {/* Boarding Ticket Container */}
            <div className="bg-slate-950 border border-white/5 rounded-2xl overflow-hidden font-mono text-xs text-left">
              {/* Ticket header */}
              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-950 p-4 border-b border-dashed border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">СУДНО</span>
                  <span className="font-bold text-cyan-400 font-sans">{successBookingDetails.vesselName}</span>
                </div>
                <CompassIcon className="w-5 h-5 text-cyan-400 animate-spin [animation-duration:15s]" />
              </div>

              {/* Ticket details */}
              <div className="p-4 space-y-3 border-b border-dashed border-white/10 text-slate-300">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 block">ДАТА ВЫХОДА</span>
                    <span className="font-bold text-white">{successBookingDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">ВРЕМЯ ОТПЛЫТИЯ</span>
                    <span className="font-bold text-white">{successBookingDetails.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 block">ТИП АРЕНДЫ</span>
                    <span className="font-bold text-cyan-400 uppercase">
                      {successBookingDetails.bookingType === 'hour' ? 'Почасовой' : successBookingDetails.bookingType === 'day' ? 'Посуточный' : 'По местам'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">ПРОДОЛЖИТЕЛЬНОСТЬ</span>
                    <span className="font-bold text-white">
                      {successBookingDetails.duration} {successBookingDetails.bookingType === 'seat' ? 'ч.' : 'ч.'}
                    </span>
                  </div>
                </div>

                {successBookingDetails.seatsCount && (
                  <div>
                    <span className="text-[9px] text-slate-500 block">КОЛИЧЕСТВО МЕСТ</span>
                    <span className="font-bold text-white">{successBookingDetails.seatsCount} чел.</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">
                      {projectLine === 'ru' ? 'Платежная система:' : projectLine === 'cn' ? '支付网关:' : 'Gateway Provider:'}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      projectLine === 'ru' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      projectLine === 'cn' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {projectLine === 'ru' ? '🔴 СБП / Банковская карта' :
                       projectLine === 'cn' ? '🟢 WeChat Pay (微信支付)' :
                       '🔵 Stripe / Apple Pay'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-white/5">
                    <span className="text-slate-500">{projectLine === 'cn' ? '已付总额:' : 'Оплачено / Total Paid:'}</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {projectLine === 'ru' && `${successBookingDetails.totalPrice.toLocaleString()} ₽`}
                      {projectLine === 'cn' && `¥${Math.round(successBookingDetails.totalPrice / 12.3).toLocaleString()} CNY (${successBookingDetails.totalPrice.toLocaleString()} ₽)`}
                      {projectLine === 'intl' && `$${Math.round(successBookingDetails.totalPrice / 88.5).toLocaleString()} USD (${successBookingDetails.totalPrice.toLocaleString()} ₽)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Captain contact block */}
              <div className="p-4 bg-slate-900/60 space-y-2 text-xs leading-relaxed">
                <div className="text-[9px] text-slate-500 block font-mono">КАПИТАН / СВЯЗЬ / CONTACT</div>
                <div className="flex justify-between font-sans">
                  <span className="font-semibold text-white">{successBookingDetails.captainName}</span>
                  <span className="text-cyan-400 font-mono">{successBookingDetails.captainPhone}</span>
                </div>
                {projectLine === 'ru' && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 font-sans text-left leading-normal">
                    <p>* Координаты пирса для Яндекс.Навигатора отправлены по СМС.</p>
                    <div className="flex items-center gap-1 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping animate-[ping_1.5s_infinite]" />
                      <span>Проверка ФЗ-152 и ФЗ-218 успешна (НБКИ/БКИ скоринг капитана)</span>
                    </div>
                  </div>
                )}
                {projectLine === 'cn' && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 font-sans text-left leading-normal">
                    <p>* 微信服务通知和电子登船码已向随行乘客发出。请提前1小时与船长确认航行事项。</p>
                    <div className="flex items-center gap-1 text-yellow-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping animate-[ping_1.5s_infinite]" />
                      <span>中华人民共和国《个人信息保护法》(PIPL) 加密标准申报</span>
                    </div>
                  </div>
                )}
                {projectLine === 'intl' && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 font-sans text-left leading-normal">
                    <p>* Port of departure coordinates synced directly to your Google Calendar. Invoice copy dispatched.</p>
                    <div className="flex items-center gap-1 text-cyan-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping animate-[ping_1.5s_infinite]" />
                      <span>EU GDPR & CCPA COMPLIANT. LOCAL LOGS EXPORTABLE</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action controls */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  window.open(`tel:${successBookingDetails.captainPhone}`);
                }}
                id="btn-call-captain"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Позвонить капитану</span>
              </button>
              <button
                onClick={() => setSuccessBookingDetails(null)}
                id="btn-close-boarding-overlay"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Вернуться к поиску
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          TUCKED TRAY MODALS: HYDROMET CENTER & RADAR
         ========================================== */}
      
      {/* 1. Hydromet Center Overlay Modal */}
      {isHydrometModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200" id="hydromet-modal">
          <div className="relative max-w-4xl w-full bg-slate-900/95 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <CloudSun className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
                    <span>
                      {lang === 'ru' ? 'Гидрометцентр Владивостока' :
                       lang === 'zh' ? '符拉迪沃斯托克气象水文中心' :
                       lang === 'ja' ? 'ウラジオストク気象水文学センター' :
                       lang === 'ko' ? '블라디보스토크 기상 수문 센터' :
                       'Vladivostok Hydromet Center'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      LIVE METEO
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {lang === 'ru' ? 'Залив Петра Великого • Прогноз погоды и волнения моря' :
                     lang === 'zh' ? '彼得大帝湾 • 天气与海浪预报' :
                     lang === 'ja' ? 'ピョートル大帝湾 • 天気・波浪予報' :
                     lang === 'ko' ? '표트르 대제 만 • 날씨 및 파도 예보' :
                     'Peter the Great Gulf • Weather & Sea Wave Forecast'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHydrometModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all font-mono text-xs flex items-center gap-1.5 shrink-0"
                id="btn-close-hydromet-modal"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {lang === 'ru' ? 'Закрыть ✖' :
                   lang === 'zh' ? '关闭 ✖' :
                   lang === 'ja' ? '閉じる ✖' :
                   lang === 'ko' ? '닫기 ✖' :
                   'Close ✖'}
                </span>
              </button>
            </div>

            {/* Modal Content: Weather Widget */}
            <div className="pt-1">
              <WeatherWidget 
                currentWeather={weather} 
                onWeatherChange={(w) => {
                  setWeather(w);
                  setSelectedVesselForMap(null);
                }}
                onOpenFullRadarMap={() => setIsRadarModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Radar Overlay Modal */}
      {isRadarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200" id="radar-modal">
          <div className="relative max-w-6xl w-full bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
                    <span>
                      {lang === 'ru' ? 'Интерактивный радар акватории JIV' :
                       lang === 'zh' ? '航道互动雷达' :
                       lang === 'ja' ? '航路インタラクティブレーダー' :
                       lang === 'ko' ? '항로 대화형 레이더' :
                       'Interactive Fairway Radar'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {lang === 'ru' ? '34 СУДНА В ЭФИРЕ' :
                       lang === 'zh' ? '34 艘船只在线' :
                       lang === 'ja' ? '34 隻ライブ' :
                       lang === 'ko' ? '34 척 실시간' :
                       '34 VESSELS LIVE'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {lang === 'ru' ? 'Морская карта, AIS-трекинг, прокладка маршрутов и точка подачи' :
                     lang === 'zh' ? '海图、AIS 追踪、路线规划与接送点' :
                     lang === 'ja' ? '海図、AIS トラッキング、ルート作成、乗船ポイント' :
                     lang === 'ko' ? '해도, AIS 추적, 경로 계획 및 탑승 지점' :
                     'Nautical chart, AIS tracking, route planning & pickup point'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRadarModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all font-mono text-xs flex items-center gap-1.5 shrink-0"
                id="btn-close-radar-modal"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {lang === 'ru' ? 'Закрыть ✖' :
                   lang === 'zh' ? '关闭 ✖' :
                   lang === 'ja' ? '閉じる ✖' :
                   lang === 'ko' ? '닫기 ✖' :
                   'Close ✖'}
                </span>
              </button>
            </div>

            {/* Modal Content: Interactive Sea Map & Tools */}
            <div className="overflow-y-auto space-y-4 pr-1 grow">
              <InteractiveSeaMap 
                vessels={filteredVessels}
                selectedVessel={selectedVesselForMap}
                onSelectVessel={setSelectedVesselForMap}
                weatherStatus={weather.status}
                routePoints={customRoutePoints}
                pickupPoint={customPickupPoint}
                onRouteDraw={setCustomRoutePoints}
                onMapClick={(lat, lon) => {
                  setCustomPickupPoint({
                    latLon: [lat, lon],
                    type: 'pickup'
                  });
                }}
              />

              <MapToolsPanel
                currentRoutePoints={customRoutePoints}
                onSetCustomRoute={setCustomRoutePoints}
                currentPickupPoint={customPickupPoint}
                onSetPickupPoint={setCustomPickupPoint}
                selectedVessel={selectedVesselForMap}
                triggerToast={(msg) => {
                  setCouponNotification(msg);
                  setTimeout(() => setCouponNotification(null), 6000);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Self-Hosting & Cloud Migration Control Panel Modal */}
      <SelfHostingModal
        isOpen={isSelfHostingModalOpen}
        onClose={() => setIsSelfHostingModalOpen(false)}
        lang={lang}
      />

      {/* 4. Telegram Mini App & Bot Control Hub Modal */}
      <TelegramHubModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        lang={lang}
      />

      {/* 5. WeChat Mini App & WeChat Pay Control Hub Modal */}
      <WeChatHubModal
        isOpen={isWeChatModalOpen}
        onClose={() => setIsWeChatModalOpen(false)}
        lang={lang}
      />

      {/* 6. Android PWA & PWABuilder Control Hub Modal */}
      <AndroidHubModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        lang={lang}
      />

      {/* 7. Hidden Shadow Admin Command Center Modal (Triple click logo Easter Egg) */}
      <AdminCommandCenterModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* 8. Augmented Reality Marine Visor HUD Modal (Spatial Glasses View) */}
      <ArSpatialHudModal
        isOpen={isArHudOpen}
        onClose={() => setIsArHudOpen(false)}
        vessels={vessels}
        selectedVessel={selectedVesselForMap}
        onSelectVessel={setSelectedVesselForMap}
        lang={lang}
      />

      {/* Decorative Elegant Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80 py-6 text-center text-xs text-slate-500 space-y-2" id="main-app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-slate-400">JIV Fleet Vladivostok © 2026 — Акватория Владивостока</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>Shark Shield™ Safety System</span>
            <span>•</span>
            <span>Peter the Great Gulf Marine Charter</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ProjectLineProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ProjectLineProvider>
  );
}
