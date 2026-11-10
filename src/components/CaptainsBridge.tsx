import React, { useState, useEffect } from 'react';
import { Vessel, Booking } from '../types';
import { 
  Ship, 
  TrendingUp, 
  Clock, 
  Star, 
  Anchor, 
  Upload, 
  Languages, 
  Navigation, 
  Bell, 
  Send, 
  Check, 
  X, 
  Plus, 
  Minus, 
  CheckCircle, 
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Eye,
  Camera,
  ShieldAlert,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface CaptainsBridgeProps {
  vessels: Vessel[];
  setVessels: React.Dispatch<React.SetStateAction<Vessel[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export default function CaptainsBridge({ vessels, setVessels, bookings, setBookings }: CaptainsBridgeProps) {
  const { lang, t } = useTranslation();

  // --- Simulated Captain State ---
  const myVesselIds = ['julia-60', 'tuna-hunter'];
  const myVessels = vessels.filter(v => myVesselIds.includes(v.id));

  const [selectedVesselId, setSelectedVesselId] = useState<string>(myVessels[0]?.id || 'julia-60');
  const currentEditingVessel = vessels.find(v => v.id === selectedVesselId) || vessels[0];

  // Tab internal to Captain's Bridge
  const [bridgeTab, setBridgeTab] = useState<'dashboard' | 'fleet' | 'bookings' | 'integrations'>('dashboard');

  // --- Simulated Earnings and Bookings ---
  const [weeklyEarnings, setWeeklyEarnings] = useState<number>(315000);
  const [responseTimeScore, setResponseTimeScore] = useState<number>(14); // in seconds
  const [responseRate, setResponseRate] = useState<number>(99); // 99%
  const [captainRating, setCaptainRating] = useState<number>(4.95);

  // Telegram Webhook Simulation states
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(true);
  const [telegramBotToken, setTelegramBotToken] = useState<string>('729485028:AAH_F1gKx9vEIsL23u9uW3O_v2L2pW828');
  const [telegramChatId, setTelegramChatId] = useState<string>('449102931');
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.vladiwater.ru/webhooks/telegram');
  const [showTelegramToast, setShowTelegramToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Hidden/collapsible controls for clean Captain UI
  const [showWeChatLoc, setShowWeChatLoc] = useState<boolean>(false);
  const [showDevSettings, setShowDevSettings] = useState<boolean>(false);

  // Voluntary Qualification States
  const [captainVerified, setCaptainVerified] = useState<boolean>(true);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [gimsLicenseInput, setGimsLicenseInput] = useState<string>('79АВ001234');
  const [passportInput, setPassportInput] = useState<string>('0518 948120');
  const [boatTicketInput, setBoatTicketInput] = useState<string>('Р 09-12 ВЛ');

  // Multilingual content state - Chinese translation lookup
  const [vesselTranslations, setVesselTranslations] = useState<Record<string, { nameZh: string; descZh: string }>>({
    'julia-60': {
      nameZh: '豪华尊贵游艇“朱莉娅”号 (Julia 60)',
      descZh: '豪华双层动力游艇，长60英尺（18米），VIP级别。本船最大特色是配备了澳大利亚创新的防鲨系统（Shark Shield），确保您在彼得大帝湾开阔海域中游泳时绝对安全。飞桥甲板宽敞、真皮内饰、设备齐全的厨房以及3间豪华客舱。'
    },
    'tuna-hunter': {
      nameZh: '极品金枪鱼捕猎者号 (Tuna Hunter 28)',
      descZh: '日本专业级运动海钓艇，专门配备了在开阔海域捕捞金枪鱼、鰤鱼（鰤子鱼）和鱿鱼的顶级设备。船上安装了Raymarine 3D三维声呐、强力拉力绞车、拖钓支架、活饵养殖舱以及宽敞的解鱼台。船长是海上运动钓鱼大师。'
    }
  });

  // Effect: Fetch server-side booking leads and merge into local bookings state
  useEffect(() => {
    async function syncBackendBookings() {
      try {
        const res = await fetch('/api/v1/bookings');
        if (res.ok) {
          const data = await res.json();
          if (data.bookings && Array.isArray(data.bookings)) {
            setBookings(prev => {
              const existingIds = new Set(prev.map(b => b.id));
              const newFromBackend: Booking[] = data.bookings
                .filter((b: any) => !existingIds.has(b.id))
                .map((b: any) => ({
                  id: b.id,
                  vesselId: b.vesselId,
                  vesselName: b.vesselTitle,
                  bookingType: 'entire_yacht',
                  date: b.date,
                  timeStart: '12:00',
                  totalPrice: b.totalPrice,
                  customerName: b.customerName,
                  customerPhone: b.customerContact,
                  status: b.status || 'pending',
                  requestedAt: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
              return [...newFromBackend, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn('Backend booking sync warning:', err);
      }
    }

    syncBackendBookings();
  }, []);

  // Photo Upload simulated list
  const [simulatedUploadedPhotos, setSimulatedUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80'
  ]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // --- Publish New Vessel Listing Modal State ---
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [newVesselName, setNewVesselName] = useState<string>('');
  const [newVesselCategory, setNewVesselCategory] = useState<'yacht' | 'boat' | 'jetski' | 'taxi'>('yacht');
  const [newVesselHomeport, setNewVesselHomeport] = useState<string>('Бухта Новик');
  const [newVesselPriceHour, setNewVesselPriceHour] = useState<number>(12000);
  const [newVesselPriceDay, setNewVesselPriceDay] = useState<number>(75000);
  const [newVesselCapacity, setNewVesselCapacity] = useState<number>(10);
  const [newVesselSpeed, setNewVesselSpeed] = useState<number>(38);
  const [newVesselCaptainName, setNewVesselCaptainName] = useState<string>('Капитан Виктор');
  const [newVesselCaptainPhone, setNewVesselCaptainPhone] = useState<string>('+7 (914) 790-33-44');
  const [newVesselSharkShield, setNewVesselSharkShield] = useState<boolean>(true);
  const [newVesselMusic, setNewVesselMusic] = useState<boolean>(true);
  const [newVesselEchoSounder, setNewVesselEchoSounder] = useState<boolean>(false);
  const [newVesselImageUrl, setNewVesselImageUrl] = useState<string>('https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80');

  // --- Promote Listing Modal State ---
  const [showPromoteModal, setShowPromoteModal] = useState<boolean>(false);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string>('nspk_sbp');

  // --- Handler: Publish New Vessel Listing ---
  const handlePublishVesselSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVesselName.trim()) {
      triggerToast(lang === 'ru' ? 'Укажите название судна!' : 'Enter vessel name!');
      return;
    }

    const newVesselObj: Vessel = {
      id: `vessel-${Date.now()}`,
      name: newVesselName,
      category: newVesselCategory,
      description: `Новое судно капитана ${newVesselCaptainName}, базирование: ${newVesselHomeport}. Профессиональное оборудование, теплая каюта и высочайший уровень безопасности.`,
      capacity: newVesselCapacity,
      speed: newVesselSpeed,
      homeport: newVesselHomeport,
      coordinates: { x: 48, y: 52 },
      latLon: [43.05, 131.85],
      priceHour: newVesselPriceHour,
      priceDay: newVesselPriceDay,
      rating: 5.0,
      reviewsCount: 1,
      captainName: newVesselCaptainName,
      captainPhone: newVesselCaptainPhone,
      images: [
        newVesselImageUrl,
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80'
      ],
      features: [
        'Теплая каюта',
        newVesselSharkShield ? '🛡️ Отпугиватель акул' : 'Спасательные жилеты',
        newVesselMusic ? '🎵 Музыкальная система' : 'Навигатор',
        'Кухня & Мангал'
      ],
      hasSharkRepeller: newVesselSharkShield,
      hasMusic: newVesselMusic,
      hasEchoSounder: newVesselEchoSounder,
      allowedActivities: ['Прогулки', 'Морские обеды', 'Фотосессия'],
      isLive: true,
      status: 'free',
      responseTime: 12
    };

    setVessels(prev => [newVesselObj, ...prev]);
    setSelectedVesselId(newVesselObj.id);
    setShowPublishModal(false);
    setNewVesselName('');

    triggerToast(
      lang === 'ru'
        ? `🎉 Объявление «${newVesselName}» бесплатно опубликовано на этапе запуска платформы (0 ₽)!`
        : lang === 'zh' || lang === 'zh-TW'
        ? `🎉 船只“${newVesselName}”在上线初期免费发布成功！`
        : `🎉 Vessel "${newVesselName}" published for free during the platform launch phase!`
    );
  };

  // --- Handler: Promote Vessel to TOP-1 ---
  const handlePromoteVesselSubmit = () => {
    if (!currentEditingVessel) return;

    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        return {
          ...v,
          isTopPromoted: true,
          promoBadge: '🔥 VIP TOP-1'
        };
      }
      return v;
    }));

    setShowPromoteModal(false);

    triggerToast(
      lang === 'ru'
        ? `⚡ Судно «${currentEditingVessel.name}» бесплатно закреплено в ТОП-1 на этапе запуска платформы (0 ₽)!`
        : lang === 'zh' || lang === 'zh-TW'
        ? `⚡ 船只“${currentEditingVessel.name}”已在平台初期免费置顶至 TOP-1！`
        : `⚡ Vessel "${currentEditingVessel.name}" promoted to TOP-1 for free during launch!`
    );
  };

  // --- Handler: Change price quickly (30-second task goal) ---
  const handleQuickPriceChange = (amount: number) => {
    if (!currentEditingVessel) return;
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        const currentPrice = v.priceHour || 5000;
        const newPrice = Math.max(1000, Math.min(130000, currentPrice + amount));
        return { ...v, priceHour: newPrice };
      }
      return v;
    }));

    triggerToast(
      lang === 'ru' 
        ? `Цена обновлена: ${((currentEditingVessel.priceHour || 0) + amount).toLocaleString()} ₽/час`
        : lang === 'en'
        ? `Price updated: ${((currentEditingVessel.priceHour || 0) + amount).toLocaleString()} ₽/hour`
        : `价格已更新：${((currentEditingVessel.priceHour || 0) + amount).toLocaleString()} 卢布/小时`
    );
  };

  const handleUpdatePriceDirectly = (newPrice: number) => {
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        return { ...v, priceHour: newPrice };
      }
      return v;
    }));
  };

  const handleUpdatePriceDayDirectly = (newPrice: number) => {
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        return { ...v, priceDay: newPrice };
      }
      return v;
    }));
  };

  // --- Handler: Update Real-time Status ---
  const handleUpdateStatus = (newStatus: 'free' | 'trip' | 'maintenance') => {
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        return { ...v, status: newStatus };
      }
      return v;
    }));

    const statusText = 
      newStatus === 'free' 
        ? (lang === 'ru' ? 'Свободен' : lang === 'en' ? 'Free' : '空闲中') 
        : newStatus === 'trip' 
        ? (lang === 'ru' ? 'На рейсе' : lang === 'en' ? 'On Trip' : '航行中') 
        : (lang === 'ru' ? 'Техпомощь' : lang === 'en' ? 'Maintenance' : '维护中');

    triggerToast(
      lang === 'ru' 
        ? `Статус изменен на: ${statusText}` 
        : lang === 'en' 
        ? `Status updated to: ${statusText}` 
        : `船只状态已变更为：${statusText}`
    );
  };

  // --- Handler: Update FarPost Specifications ---
  const handleUpdateSpec = (key: keyof Vessel, value: any) => {
    setVessels(prev => prev.map(v => {
      if (v.id === selectedVesselId) {
        return { ...v, [key]: value };
      }
      return v;
    }));
  };

  // --- Handler: Update WeChat Chinese content ---
  const handleUpdateTranslation = (field: 'nameZh' | 'descZh', value: string) => {
    setVesselTranslations(prev => ({
      ...prev,
      [selectedVesselId]: {
        ...prev[selectedVesselId],
        [field]: value
      }
    }));
    triggerToast(
      lang === 'ru' 
        ? 'Перевод для WeChat сохранен в локальной базе' 
        : lang === 'en' 
        ? 'Translation for WeChat saved to local database' 
        : '微信多语言翻译内容已成功保存至本地数据库'
    );
  };

  // --- Simulated quick photo upload ---
  const handleSimulatedPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setTimeout(() => {
        const fakeUrls = [
          'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1621275471769-e6aa344546d5?auto=format&fit=crop&w=400&q=80'
        ];
        const randomUrl = fakeUrls[Math.floor(Math.random() * fakeUrls.length)];
        setSimulatedUploadedPhotos(prev => [randomUrl, ...prev]);
        
        // Add photo to current vessel
        setVessels(prev => prev.map(v => {
          if (v.id === selectedVesselId) {
            return {
              ...v,
              images: [randomUrl, ...v.images]
            };
          }
          return v;
        }));

        setIsUploading(false);
        triggerToast(
          lang === 'ru'
            ? '⚡ Фото успешно оптимизировано и загружено!'
            : lang === 'en'
            ? '⚡ Photo successfully optimized and uploaded!'
            : '⚡ 照片已成功优化并上传！'
        );
      }, 900);
    }
  };

  // --- Telegram Webhook action simulation ---
  const handleTestTelegramNotification = () => {
    if (!telegramEnabled) {
      triggerToast(
        lang === 'ru' 
          ? '⚠️ Включите Telegram Bot интеграцию сначала!' 
          : lang === 'en' 
          ? '⚠️ Enable Telegram Bot Integration first!' 
          : '⚠️ 请先开启电报机器人集成开关！'
      );
      return;
    }
    
    // Simulate notification
    setToastMessage(
      lang === 'ru'
        ? `🤖 Бот @vladiwater_bot: Новое бронирование! Яхта «${currentEditingVessel.name}». Клиент: Евгений Крафт. Сумма: ${(currentEditingVessel.priceHour ? currentEditingVessel.priceHour * 4 : 40000).toLocaleString()} ₽. Подтвердите в 1 клик.`
        : lang === 'en'
        ? `🤖 Bot @vladiwater_bot: New Booking! Yacht "${currentEditingVessel.name}". Client: Eugene Kraft. Amount: ${(currentEditingVessel.priceHour ? currentEditingVessel.priceHour * 4 : 40000).toLocaleString()} ₽. Confirm in 1-click.`
        : `🤖 机器人 @vladiwater_bot：收到新预订订单！船只：“${currentEditingVessel.name}”。客户：尤金·克拉夫特。订单金额：${(currentEditingVessel.priceHour ? currentEditingVessel.priceHour * 4 : 40000).toLocaleString()} 卢布。支持一键快速确认。`
    );
    setShowTelegramToast(true);
    setTimeout(() => {
      setShowTelegramToast(false);
    }, 8000);
  };

  // --- Confirm Booking Request in < 30 seconds ---
  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'declined') => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: action } : b));
    
    // Sync with backend API
    try {
      await fetch(`/api/v1/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
    } catch (err) {
      console.warn('Backend booking sync warning:', err);
    }
    
    const targeted = bookings.find(b => b.id === bookingId);
    if (action === 'confirmed') {
      setWeeklyEarnings(prev => prev + (targeted?.totalPrice || 0));
      // Simulate sending Telegram hook confirmation
      if (telegramEnabled) {
        setToastMessage(
          lang === 'ru'
            ? `🚀 Webhook Telegram: Статус заказа ${bookingId} изменен на ПОДТВЕРЖДЕН. Клиент оповещен в Telegram/Viber.`
            : lang === 'en'
            ? `🚀 Webhook Telegram: Booking ${bookingId} status changed to CONFIRMED. Client notified via Telegram/Viber.`
            : `🚀 电报 Webhook：订单 ${bookingId} 的状态已更新为“已确认”，客户已在 Telegram/Viber 收到通知。`
        );
        setShowTelegramToast(true);
        setTimeout(() => setShowTelegramToast(false), 5000);
      } else {
        triggerToast(
          lang === 'ru' 
            ? `Заказ ${bookingId} успешно подтвержден!` 
            : lang === 'en' 
            ? `Booking ${bookingId} successfully confirmed!` 
            : `订单 ${bookingId} 已成功确认！`
        );
      }
    } else {
      triggerToast(
        lang === 'ru' 
          ? `Заказ ${bookingId} отклонен` 
          : lang === 'en' 
          ? `Booking ${bookingId} declined` 
          : `订单 ${bookingId} 已被拒绝`
      );
    }
  };

  // --- Trigger general on-screen notification ---
  const [systemNotification, setSystemNotification] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setSystemNotification(msg);
    setTimeout(() => setSystemNotification(null), 4000);
  };

  return (
    <div className="relative text-slate-100 text-left" id="captains-bridge-container">
      
      {/* Toast alert system */}
      {systemNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 text-cyan-300 backdrop-blur-md shadow-2xl flex items-center gap-3 animate-slide-in font-mono text-xs max-w-sm">
          <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
          <span>{systemNotification}</span>
        </div>
      )}

      {/* Floating simulated Telegram notification HUD */}
      {showTelegramToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl border border-blue-500/40 bg-slate-950 text-white shadow-2xl animate-bounce-short max-w-sm font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-2 text-left">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400">Telegram Bot API (Live)</span>
            </div>
            <button onClick={() => setShowTelegramToast(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-mono text-left">
            {toastMessage}
          </p>
          <div className="mt-3 flex gap-2 justify-end">
            <button 
              onClick={() => {
                handleBookingAction('B-201', 'confirmed');
                setShowTelegramToast(false);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded text-[10px] flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> 
              <span>{lang === 'ru' ? 'Подтвердить за 15с' : lang === 'en' ? 'Confirm in 15s' : '15秒内快捷确认'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bridge Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8 text-left">
        <div>
          <div className="flex items-center gap-2">
            <Anchor className="w-6 h-6 text-cyan-400 animate-spin [animation-duration:20s]" />
            <h1 className="text-2xl font-black tracking-tight text-white font-sans uppercase">
              {lang === 'ru' ? 'Капитанский мостик' : lang === 'en' ? 'Captains Bridge' : '船长驾驶舱'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ru' 
              ? 'Рабочая среда судовладельца • Управление флотом, объектами и спецификациями' 
              : lang === 'en' 
              ? 'Vessel Owner Workspace • Management of fleet, bookings and specifications' 
              : '船东工作台 • 结合定位、评分信用系统与多语言智能支持'}
          </p>
        </div>

        {/* Actions & Vessel Selection */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Publish New Listing */}
          <button
            onClick={() => setShowPublishModal(true)}
            id="btn-captain-publish-listing"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shrink-0 font-mono"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>{lang === 'ru' ? 'Опубликовать объявление' : lang === 'zh' || lang === 'zh-TW' ? '发布新船只' : 'Publish Listing'}</span>
          </button>

          {/* Action 2: Boost Listing */}
          <button
            onClick={() => setShowPromoteModal(true)}
            id="btn-captain-promote-listing"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shrink-0 font-mono"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>{lang === 'ru' ? 'Продвинуть в ТОП-1' : lang === 'zh' || lang === 'zh-TW' ? '置顶 ТОП-1' : 'Promote to TOP-1'}</span>
          </button>

          <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5 ml-1">
            {myVessels.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVesselId(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  selectedVesselId === v.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {v.name.length > 15 ? `${v.name.slice(0, 14)}…` : v.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inner Sub-Navigation tabs */}
      <div className="flex border-b border-white/5 pb-px mb-6 overflow-x-auto gap-2 scrollbar-none" id="bridge-tabs">
        <button
          onClick={() => setBridgeTab('dashboard')}
          className={`pb-3 px-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all whitespace-nowrap shrink-0 ${
            bridgeTab === 'dashboard'
              ? 'border-cyan-400 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ru' ? '🎛️ Панель приборов' : lang === 'en' ? '🎛️ Dashboard' : '🎛️ 控制仪表盘'}
        </button>
        <button
          onClick={() => setBridgeTab('fleet')}
          className={`pb-3 px-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all whitespace-nowrap shrink-0 ${
            bridgeTab === 'fleet'
              ? 'border-cyan-400 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ru' ? '📝 Спецификации судна' : lang === 'en' ? '📝 Vessel Specs' : '📝 船只规格'}
        </button>
        <button
          onClick={() => setBridgeTab('bookings')}
          className={`pb-3 px-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            bridgeTab === 'bookings'
              ? 'border-cyan-400 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>{lang === 'ru' ? '📅 Входящие Брони' : lang === 'en' ? '📅 Incoming Bookings' : '📅 预约申请'}</span>
          <span>({bookings.filter(b => b.status === 'pending').length})</span>
        </button>
        <button
          onClick={() => setBridgeTab('integrations')}
          className={`pb-3 px-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all whitespace-nowrap shrink-0 ${
            bridgeTab === 'integrations'
              ? 'border-cyan-400 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'ru' ? '🔔 Уведомления в Telegram' : lang === 'en' ? '🔔 Telegram Alerts' : '🔔 电报订单通知'}
        </button>
      </div>

      {/* --- TAB 1: DASHBOARD --- */}
      {bridgeTab === 'dashboard' && (
        <div className="space-y-8 text-left" id="bridge-dashboard-tab">
          
          {/* Captain Identity & GIMS Verification Banner with Real Photo */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg shadow-amber-500/20 shrink-0">
                <img 
                  src="/src/assets/images/marine_captain_portrait_1794278122165.jpg" 
                  alt="Капитан Александр Петрович"
                  className="w-full h-full object-cover object-center"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-sans">
                    Капитан Александр Петрович
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    ГИМС ВЕРИФИЦИРОВАН
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Удостоверение ГИМС МЧС РФ: 79АВ001234 · Категория: Морское прогулочное судно до 20м
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                  <span>Стаж: 18 лет в заливе Петра Великого</span>
                  <span>·</span>
                  <span className="text-amber-400">Суда в управлении: «Джулия» (60 футов), «Tuna Hunter»</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowVerificationModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Документы и Патент</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Metric 1: Weekly Revenue */}
            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
              <TrendingUp className="w-5 h-5 text-cyan-400 mb-3" />
              <span className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Доход за неделю' : lang === 'en' ? 'Weekly Earnings' : '本周总收入'}</span>
              <span className="text-2xl font-black text-white font-sans mt-1 block">
                {weeklyEarnings.toLocaleString()} ₽
              </span>
              <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
                {lang === 'ru' ? '▲ +22% к прошлому периоду' : lang === 'en' ? '▲ +22% vs last week' : '▲ 较上周增长 22%'}
              </span>
            </div>

            {/* Metric 2: Next departure */}
            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              <Clock className="w-5 h-5 text-amber-400 mb-3" />
              <span className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Ближайший выход' : lang === 'en' ? 'Next Departure' : '最近出航班次'}</span>
              <span className="text-lg font-bold text-white font-sans mt-1 block">
                {lang === 'ru' ? 'Сегодня в 15:00' : lang === 'en' ? 'Today at 15:00' : '今天 15:00'}
              </span>
              <span className="text-[10px] text-amber-300 font-mono mt-2 block">
                {lang === 'ru' ? '⛵ Эксклюзив «Джулия» • 4 ч.' : lang === 'en' ? '⛵ Exclusive "Julia" • 4h' : '⛵ “朱莉娅”尊享巡游 • 4小时'}
              </span>
            </div>

            {/* Metric 3: Response Speed */}
            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <Clock className="w-5 h-5 text-emerald-400 mb-3" />
              <span className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Скорость ответа' : lang === 'en' ? 'Response Rate Score' : '平均响应速度评分'}</span>
              <span className="text-2xl font-black text-white font-sans mt-1 block">
                {responseTimeScore} {lang === 'ru' ? 'секунд' : lang === 'en' ? 'seconds' : '秒'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
                {lang === 'ru' ? '🔥 Быстрее 98% капитанов залива' : lang === 'en' ? '🔥 Faster than 98% of captains' : '超越湾区 98% 的签约船长'}
              </span>
            </div>

            {/* Metric 4: Rating */}
            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full pointer-events-none" />
              <Star className="w-5 h-5 text-yellow-400 mb-3 fill-yellow-400" />
              <span className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Текущий рейтинг' : lang === 'en' ? 'Current Rating' : '当前星级信用'}</span>
              <span className="text-2xl font-black text-white font-sans mt-1 block flex items-center gap-1.5">
                {captainRating.toFixed(2)} <span className="text-xs text-slate-400">/ 5.0</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-2 block">
                {lang === 'ru' ? 'Рейтинг напрямую влияет на выдачу флота!' : lang === 'en' ? 'Rating directly affects search rank!' : '星级评分直接决定船只搜索排序！'}
              </span>
            </div>

          </div>

          {/* Voluntary Document & Qualification Verification Section */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden text-left shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    {lang === 'ru' ? 'Добровольная проверка документов и квалификации' : 'Voluntary Document & Qualification Verification'}
                  </h3>
                  {captainVerified ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {lang === 'ru' ? 'ПОДТВЕРЖДЁННАЯ КВАЛИФИКАЦИЯ' : 'VERIFIED QUALIFICATION'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      {lang === 'ru' ? 'ДОБРОВОЛЬНО (НЕ ВЕРИФИЦИРОВАНО)' : 'OPTIONAL (NOT VERIFIED)'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-1">
                  {lang === 'ru'
                    ? 'Проверка документов является полностью добровольной и НЕ ограничивает публикацию ваших объявлений. Прошедшие проверку капитаны получают особый статус «Подтверждённая квалификация», золотой знак доверия и приоритетный рейтинг при поиске.'
                    : 'Document verification is strictly voluntary and does NOT restrict publishing listings. Verified captains receive a "Verified Qualification" badge and priority ranking.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowVerificationModal(true)}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-2 shadow-lg ${
                  captainVerified
                    ? 'bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {captainVerified
                    ? (lang === 'ru' ? 'Управление верификацией' : 'Manage Qualification')
                    : (lang === 'ru' ? 'Пройти верификацию' : 'Verify Qualification')}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">{lang === 'ru' ? 'Права ГИМС МЧС:' : 'GIMS LICENSE:'}</span>
                <span className="font-bold text-slate-200">{captainVerified ? `№ ${gimsLicenseInput}` : '— Не предоставлено —'}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">{lang === 'ru' ? 'Судовой билет МЧС:' : 'VESSEL REGISTRATION:'}</span>
                <span className="font-bold text-slate-200">{captainVerified ? boatTicketInput : '— Не предоставлено —'}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">{lang === 'ru' ? 'Преимущество в Поиске:' : 'SEARCH ADVANTAGE:'}</span>
                <span className={`font-bold ${captainVerified ? 'text-amber-400' : 'text-slate-400'}`}>
                  {captainVerified
                    ? (lang === 'ru' ? '★ Золотой знак +25% к рейтингу' : '★ Gold Badge +25% Rank')
                    : (lang === 'ru' ? 'Стандартное отображение' : 'Standard Ranking')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Price control panel */}
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 bg-cyan-500/10 border-b border-l border-cyan-500/20 px-3 py-1 rounded-bl-xl font-mono text-[9px] text-cyan-400 uppercase tracking-widest">
              {lang === 'ru' ? 'Быстрая цена • Цель 30 сек' : lang === 'en' ? 'Quick Price • 30s target' : '快捷限时定价 • 30秒内生效'}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              <div className="lg:col-span-4 space-y-2 text-left">
                <span className="text-xs bg-cyan-500/10 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-500/20">
                  {currentEditingVessel?.category === 'yacht' 
                    ? (lang === 'ru' ? 'VIP ЯХТА' : lang === 'en' ? 'VIP YACHT' : 'VIP 豪华游艇') 
                    : (lang === 'ru' ? 'КАСТИНГ-КАТЕР' : lang === 'en' ? 'FISHING BOAT' : '专业垂钓艇')}
                </span>
                <h3 className="text-lg font-black text-white font-sans uppercase">
                  {currentEditingVessel?.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed text-left">
                  {lang === 'ru'
                    ? 'Отрегулируйте тарифы аренды в один клик. Изменения моментально транслируются в общую поисковую выдачу и WeChat мини-приложение.'
                    : lang === 'en'
                    ? 'Adjust rental rates in a single click. Changes are instantly pushed to general search and the WeChat mini-app.'
                    : '一键调整租赁价格费率。价格变动将实时同步推送至网页版搜索以及微信多语言小程序客户端。'}
                </p>
                <div className="flex gap-2 pt-1 text-left">
                  <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400 font-mono">
                    📍 {lang === 'ru' ? currentEditingVessel?.homeport : lang === 'en' ? (currentEditingVessel?.id === 'julia-60' ? 'Novik Bay, Russky Island' : 'Ulysses Bay') : (currentEditingVessel?.id === 'julia-60' ? '诺维克湾，俄罗斯岛' : '尤利西斯湾')}
                  </span>
                </div>
              </div>

              {/* Price adjustments controls */}
              <div className="lg:col-span-8 bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  
                  {/* Hourly rate */}
                  {currentEditingVessel?.priceHour && (
                    <div className="space-y-1.5 flex-1 text-left">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Почасовая ставка (₽/час)' : lang === 'en' ? 'Hourly rate (₽/hour)' : '每小时价格 (₽/小时)'}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleQuickPriceChange(-1000)}
                          className="p-2 bg-slate-900 border border-white/10 hover:border-red-500/30 hover:bg-red-950/20 rounded-lg text-slate-300 hover:text-red-400 transition-all"
                          title="-1000 ₽"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <input 
                          type="number"
                          value={currentEditingVessel.priceHour}
                          onChange={(e) => handleUpdatePriceDirectly(Number(e.target.value))}
                          className="w-28 text-center bg-slate-900 border border-white/10 rounded-lg py-1.5 text-sm font-black text-white font-mono focus:outline-none focus:border-cyan-400"
                        />

                        <button 
                          onClick={() => handleQuickPriceChange(1000)}
                          className="p-2 bg-slate-900 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-950/20 rounded-lg text-slate-300 hover:text-emerald-400 transition-all"
                          title="+1000 ₽"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Daily rate */}
                  {currentEditingVessel?.priceDay && (
                    <div className="space-y-1.5 flex-1 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-6 pt-4 sm:pt-0 text-left">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Посуточный чартер (₽/сутки)' : lang === 'en' ? 'Daily charter (₽/day)' : '按天租赁价格 (₽/天)'}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            if (currentEditingVessel.priceDay) {
                              handleUpdatePriceDayDirectly(Math.max(10000, currentEditingVessel.priceDay - 5000));
                              triggerToast(lang === 'ru' ? 'Посуточный тариф снижен на 5 000 ₽' : lang === 'en' ? 'Daily rate decreased by 5,000 ₽' : '按天租赁价格下调 5,000 ₽');
                            }
                          }}
                          className="p-2 bg-slate-900 border border-white/10 hover:border-red-500/30 hover:bg-red-950/20 rounded-lg text-slate-300 hover:text-red-400 transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <input 
                          type="number"
                          value={currentEditingVessel.priceDay}
                          onChange={(e) => handleUpdatePriceDayDirectly(Number(e.target.value))}
                          className="w-32 text-center bg-slate-900 border border-white/10 rounded-lg py-1.5 text-sm font-black text-white font-mono focus:outline-none focus:border-cyan-400"
                        />

                        <button 
                          onClick={() => {
                            if (currentEditingVessel.priceDay) {
                              handleUpdatePriceDayDirectly(currentEditingVessel.priceDay + 5000);
                              triggerToast(lang === 'ru' ? 'Посуточный тариф повышен на 5 000 ₽' : lang === 'en' ? 'Daily rate increased by 5,000 ₽' : '按天租赁价格上调 5,000 ₽');
                            }
                          }}
                          className="p-2 bg-slate-900 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-950/20 rounded-lg text-slate-300 hover:text-emerald-400 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Quick actions presets */}
                <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-left">
                  <span className="text-[10px] text-slate-500 font-mono">{lang === 'ru' ? 'Пресеты быстрого изменения цены:' : lang === 'en' ? 'Quick price presets:' : '价格调整快捷预设：'}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleQuickPriceChange(-2000)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded text-[10px] font-mono text-rose-400"
                    >
                      {lang === 'ru' ? 'Скидка -2 000 ₽' : lang === 'en' ? 'Promo -2,000 ₽' : '优惠 -2,000 ₽'}
                    </button>
                    <button 
                      onClick={() => handleQuickPriceChange(5000)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded text-[10px] font-mono text-emerald-400"
                    >
                      {lang === 'ru' ? 'Наценка +5 000 ₽' : lang === 'en' ? 'Extra +5,000 ₽' : '加价 +5,000 ₽'}
                    </button>
                    <button 
                      onClick={() => {
                        if (currentEditingVessel.id === 'julia-60') {
                          handleUpdatePriceDirectly(15000);
                          handleUpdatePriceDayDirectly(130000);
                        } else {
                          handleUpdatePriceDirectly(4500);
                          handleUpdatePriceDayDirectly(35000);
                        }
                        triggerToast(lang === 'ru' ? 'Сброшено на заводские базовые тарифы' : lang === 'en' ? 'Reset to baseline tariffs' : '已重置为默认基准价格');
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded text-[10px] font-mono text-slate-400"
                    >
                      {lang === 'ru' ? 'Сброс' : lang === 'en' ? 'Reset' : '重置'}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Real-time Status Toggle Card */}
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 px-3 py-1 rounded-bl-xl font-mono text-[9px] text-emerald-400 uppercase tracking-widest">
              {lang === 'ru' ? 'Статус судна в реальном времени • Синхронизация' : lang === 'en' ? 'Real-time Vessel Status • Sync' : '船只状态实时同步仪表盘'}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    (currentEditingVessel.status || 'free') === 'free' ? 'bg-emerald-500 animate-pulse' : 
                    (currentEditingVessel.status || 'free') === 'trip' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse'
                  }`} />
                  {lang === 'ru' ? 'Морской статус «На лету»' : lang === 'en' ? 'Vessel "On-the-Fly" Status' : '海上航行状态实时调整'}
                </h3>
                <p className="text-xs text-slate-400 text-left">
                  {lang === 'ru' 
                    ? `Текущий статус судна «${currentEditingVessel.name}» отражается на интерактивной карте клиентов в реальном времени.` 
                    : lang === 'en'
                    ? `The current status of yacht "${currentEditingVessel.name}" is reflected on the clients' interactive live map.`
                    : `船只“${currentEditingVessel.name}”的实时地理航行状态将自动呈现在客户终端的交互式海图上。`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/10" id="status-toggle-buttons">
                <button
                  onClick={() => handleUpdateStatus('free')}
                  id="status-btn-free"
                  type="button"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    (currentEditingVessel.status || 'free') === 'free'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {lang === 'ru' ? 'Свободен' : lang === 'en' ? 'Free' : '空闲中'}
                </button>

                <button
                  onClick={() => handleUpdateStatus('trip')}
                  id="status-btn-trip"
                  type="button"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    (currentEditingVessel.status || 'free') === 'trip'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {lang === 'ru' ? 'На рейсе' : lang === 'en' ? 'On Trip' : '航行中'}
                </button>

                <button
                  onClick={() => handleUpdateStatus('maintenance')}
                  id="status-btn-maintenance"
                  type="button"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    (currentEditingVessel.status || 'free') === 'maintenance'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  {lang === 'ru' ? 'Техпомощь' : lang === 'en' ? 'Maintenance' : '维护中'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Active Bookings Panel */}
          <div className="space-y-4 text-left">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-2">
              <span>{lang === 'ru' ? 'Текущая очередь выхода' : lang === 'en' ? 'Current Departure Queue' : '当前待发出海队列'}</span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bookings.map((b) => (
                <div 
                  key={b.id}
                  className={`bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border transition-all hover:translate-y-[-4px] shadow-lg relative flex flex-col justify-between ${
                    b.status === 'pending' 
                      ? 'border-amber-500/40 shadow-amber-950/10' 
                      : b.status === 'confirmed'
                      ? 'border-emerald-500/30'
                      : 'border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-slate-500 font-mono">{b.requestedAt}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                      b.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : b.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {b.status === 'pending' 
                        ? (lang === 'ru' ? '⏱️ Ожидает' : lang === 'en' ? '⏱️ Pending' : '⏱️ 待审批') 
                        : b.status === 'confirmed' 
                        ? (lang === 'ru' ? '⚓ Подтвержден' : lang === 'en' ? '⚓ Confirmed' : '⚓ 已确认') 
                        : (lang === 'ru' ? '❌ Отклонен' : lang === 'en' ? '❌ Declined' : '❌ 已拒绝')}
                    </span>
                  </div>

                  <div className="space-y-3 mb-5 text-left">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono block">{lang === 'ru' ? 'СУДНО' : lang === 'en' ? 'VESSEL' : '船只'}</span>
                      <h4 className="text-xs font-bold text-white tracking-tight">{b.vesselName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-left">
                      <div>
                        <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'ГОСТЬ' : lang === 'en' ? 'CUSTOMER' : '乘客'}</span>
                        <span className="font-semibold text-white">{b.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'ДАТА И ВРЕМЯ' : lang === 'en' ? 'DATE & TIME' : '日期与时间'}</span>
                        <span className="font-mono text-cyan-400">{b.date}, {b.timeStart}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2 text-left">
                      <div>
                        <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'ПРОДОЛЖИТЕЛЬНОСТЬ' : lang === 'en' ? 'DURATION' : '时长/席位'}</span>
                        <span className="font-semibold text-slate-300">
                          {b.duration} {b.bookingType === 'hour' ? (lang === 'ru' ? 'ч.' : lang === 'en' ? 'h.' : '小时') : (lang === 'ru' ? 'дн.' : lang === 'en' ? 'd.' : '天')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'К ОПЛАТЕ' : lang === 'en' ? 'TOTAL PRICE' : '实付金额'}</span>
                        <span className="font-mono font-bold text-emerald-400">{b.totalPrice.toLocaleString()} ₽</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex gap-2">
                    {b.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleBookingAction(b.id, 'confirmed')}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" /> {lang === 'ru' ? 'Одобрить' : lang === 'en' ? 'Approve' : '审批同意'}
                        </button>
                        <button 
                          onClick={() => handleBookingAction(b.id, 'declined')}
                          className="p-1.5 bg-slate-950 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          title={lang === 'ru' ? 'Отклонить' : 'Decline'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center py-1 bg-slate-950 rounded text-[10px] font-mono text-slate-400">
                        {b.status === 'confirmed' ? (lang === 'ru' ? 'Связь: ' : 'Phone: ') + b.customerPhone : (lang === 'ru' ? 'Заказ отменен' : 'Order cancelled')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SPECIFICATIONS (FARPOST & WECHAT) --- */}
      {bridgeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="bridge-fleet-specs-tab">
          
          {/* Left spec form */}
          <div className="lg:col-span-12 bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="text-left">
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  {lang === 'ru' ? 'Спецификации судна (Владивосток)' : lang === 'en' ? 'Vessel Specifications (Vladivostok)' : '船只规格（海参崴本地）'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ru' ? 'Заполните технические поля, характерные для водных объявлений Приморья' : lang === 'en' ? 'Fill in the technical parameters specific to Primorsky Krai maritime listings' : '填写符合滨海边疆区本地水上船舶申报规范的专业技术参数信息'}
                </p>
              </div>
              <span className="text-[10px] bg-slate-950 border border-white/5 px-2.5 py-1 rounded-full font-mono text-amber-400">
                SPEC ID: {selectedVesselId === 'julia-60' ? '921104' : '884392'}
              </span>
            </div>

            {/* Harbor choice list */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                📍 {lang === 'ru' ? 'Район базирования (Точка привязки)' : lang === 'en' ? 'Homeport / Boarding Area' : '📍 船只常驻泊位码头区'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {['Поспелово (о. Русский)', 'Канал (о. Русский)', 'Бухта Новик', 'Бухта Змеинка', 'Токаревский Маяк'].map(port => {
                  const isSelected = currentEditingVessel.homeport.includes(port.split(' ')[0]);
                  
                  let localizedPortName = port;
                  if (lang === 'en') {
                    if (port.includes('Поспелово')) localizedPortName = 'Pospelovo (Russky)';
                    if (port.includes('Канал')) localizedPortName = 'Canal (Russky)';
                    if (port.includes('Новик')) localizedPortName = 'Novik Bay';
                    if (port.includes('Змеинка')) localizedPortName = 'Zmeinka Bay';
                    if (port.includes('Токаревский')) localizedPortName = 'Tokarevsky Lighthouse';
                  } else if (lang === 'zh') {
                    if (port.includes('Поспелово')) localizedPortName = '波斯佩洛沃 (俄罗斯岛)';
                    if (port.includes('Канал')) localizedPortName = '运河码头 (俄罗斯岛)';
                    if (port.includes('Новик')) localizedPortName = '诺维克湾码头';
                    if (port.includes('Змеинка')) localizedPortName = '兹梅因卡湾码头';
                    if (port.includes('Токаревский')) localizedPortName = '托卡列夫斯基灯塔';
                  }

                  return (
                    <button
                      key={port}
                      onClick={() => {
                        handleUpdateSpec('homeport', port);
                        triggerToast(lang === 'ru' ? `Порт привязки изменен на: ${port}` : lang === 'en' ? `Homeport changed to: ${localizedPortName}` : `泊位码头区已变更为：${localizedPortName}`);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-lg' 
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5 mb-1.5 opacity-70" />
                      {localizedPortName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              
              {/* Capacity */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  {lang === 'ru' ? 'Вместимость (пассажиров)' : lang === 'en' ? 'Max Capacity (pax)' : '最大载客人数'}
                </label>
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  <button 
                    onClick={() => handleUpdateSpec('capacity', Math.max(1, currentEditingVessel.capacity - 1))}
                    className="p-1 bg-slate-900 border border-white/10 rounded"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-sm font-black text-white font-mono">
                    {currentEditingVessel.capacity} {lang === 'ru' ? 'человек' : lang === 'en' ? 'pax' : '人'}
                  </span>
                  <button 
                    onClick={() => handleUpdateSpec('capacity', currentEditingVessel.capacity + 1)}
                    className="p-1 bg-slate-900 border border-white/10 rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Speed */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  {lang === 'ru' ? 'Скорость хода (узлы / км/ч)' : lang === 'en' ? 'Cruise Speed (knots / km/h)' : '设计巡航航速（节 / 公里/小时）'}
                </label>
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  <button 
                    onClick={() => handleUpdateSpec('speed', Math.max(5, currentEditingVessel.speed - 5))}
                    className="p-1 bg-slate-900 border border-white/10 rounded"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex-1 text-center text-sm font-black text-white font-mono">
                    {currentEditingVessel.speed} {lang === 'ru' ? 'км/ч' : 'km/h'} ({Math.round(currentEditingVessel.speed / 1.852)} {lang === 'ru' ? 'узлов' : 'knots'})
                  </span>
                  <button 
                    onClick={() => handleUpdateSpec('speed', currentEditingVessel.speed + 5)}
                    className="p-1 bg-slate-900 border border-white/10 rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Safety & Fishing systems checkboxes */}
            <div className="space-y-3 pt-2 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                {lang === 'ru' ? 'Специализированное оборудование судна' : lang === 'en' ? 'Specialized Onboard Equipment' : '专业级随船系统设备'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Shark Repeller */}
                <div 
                  onClick={() => {
                    const nextVal = !currentEditingVessel.hasSharkRepeller;
                    handleUpdateSpec('hasSharkRepeller', nextVal);
                    let updatedFeats = [...currentEditingVessel.features];
                    if (nextVal && !updatedFeats.includes('Система отпугивания акул (Shark Shield)')) {
                      updatedFeats.push('Система отпугивания акул (Shark Shield)');
                    } else if (!nextVal) {
                      updatedFeats = updatedFeats.filter(f => !f.includes('акул') && !f.includes('Shark'));
                    }
                    handleUpdateSpec('features', updatedFeats);
                    triggerToast(lang === 'ru' ? `Отпугиватель акул Shark Shield: ${nextVal ? 'Включен' : 'Отключен'}` : lang === 'en' ? `Shark Shield Repeller: ${nextVal ? 'Enabled' : 'Disabled'}` : `防鲨保护电波屏障：${nextVal ? '已开启' : '已关闭'}`);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    currentEditingVessel.hasSharkRepeller 
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' 
                      : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <ShieldAlert className={`w-4 h-4 ${currentEditingVessel.hasSharkRepeller ? 'text-rose-400 animate-pulse' : 'text-slate-600'}`} />
                    <div className="text-left">
                      <span className="text-xs font-bold block">{lang === 'ru' ? 'Отпугиватель акул Shark Shield' : lang === 'en' ? 'Shark Shield Repeller' : '防鲨电波屏障 (Shark Shield)'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ru' ? 'Австралийский электро-барьер' : lang === 'en' ? 'Australian electromagnetic barrier' : '澳大利亚深海电磁防护层'}</span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={!!currentEditingVessel.hasSharkRepeller} 
                    readOnly 
                    className="accent-rose-500" 
                  />
                </div>

                {/* Echo Sounder */}
                <div 
                  onClick={() => {
                    const nextVal = !currentEditingVessel.hasEchoSounder;
                    handleUpdateSpec('hasEchoSounder', nextVal);
                    let updatedFeats = [...currentEditingVessel.features];
                    if (nextVal) {
                      updatedFeats.push('Снасти на тунца/кальмара');
                      updatedFeats.push('Профессиональный 3D-эхолот');
                    } else {
                      updatedFeats = updatedFeats.filter(f => !f.includes('тунец') && !f.includes('кальмар') && !f.includes('эхолот'));
                    }
                    handleUpdateSpec('features', updatedFeats);
                    triggerToast(lang === 'ru' ? `Снасти для тунца/кальмара: ${nextVal ? 'Добавлены' : 'Убраны'}` : lang === 'en' ? `Tuna/Squid Tackle: ${nextVal ? 'Added' : 'Removed'}` : `深海探鱼及钓具配置：${nextVal ? '已升级' : '已恢复默认'}`);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    currentEditingVessel.hasEchoSounder 
                      ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-300' 
                      : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <div className="text-left">
                      <span className="text-xs font-bold block">{lang === 'ru' ? 'Снасти на тунца / кальмара' : lang === 'en' ? 'Tuna & Squid Deep-Sea Gear' : '金枪鱼/鱿鱼专业深海钓具'}</span>
                      <span className="text-[9px] text-slate-400">{lang === 'ru' ? 'Включая мощный 3D-эхолот' : lang === 'en' ? 'Includes powerful 3D sonar' : '包含专业 Raymarine 3D 声纳'}</span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={!!currentEditingVessel.hasEchoSounder} 
                    readOnly 
                    className="accent-cyan-400" 
                  />
                </div>

              </div>
            </div>

            {/* Quick Photo Upload */}
            <div className="space-y-3 pt-2 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                📸 {lang === 'ru' ? 'Быстрая загрузка медиафайлов' : lang === 'en' ? 'Fast Media Upload' : '📸 手动添加或更新随船相册照片'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-dashed border-white/10 bg-slate-950 hover:bg-slate-900/80 transition-colors p-5 rounded-2xl text-center relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleSimulatedPhotoUpload}
                    id="mobile-photo-upload-input"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Camera className="w-7 h-7 text-cyan-400 mx-auto mb-2 animate-pulse" />
                  <span className="text-xs font-bold text-white block">
                    {isUploading ? (lang === 'ru' ? 'Загрузка и сжатие...' : 'Compressing & uploading...') : (lang === 'ru' ? 'Перетащите фото судна' : 'Drag & drop vessel photo')}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    {lang === 'ru' ? 'Автоматическая оптимизация под мобильные 4G Приморья' : 'Auto-optimized for Vladivostok LTE'}
                  </span>
                </div>

                <div className="flex gap-2 items-center overflow-x-auto bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                  {currentEditingVessel.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img src={img} alt="vessel-preview" className="w-full h-full object-cover" />
                      <div className="absolute top-0.5 right-0.5 bg-slate-950/80 p-0.5 rounded text-[8px] text-slate-300 font-mono">
                        {i === 0 ? (lang === 'ru' ? 'Главное' : 'Main') : `${i+1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle button for hidden WeChat localization (preserves code, hides clutter for Captain) */}
            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWeChatLoc(!showWeChatLoc)}
                className="text-[11px] font-mono text-slate-500 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>
                  {showWeChatLoc
                    ? (lang === 'ru' ? '▲ Скрыть локализацию WeChat' : '▲ Hide WeChat Localization')
                    : (lang === 'ru' ? '🌐 Настройки перевода на китайский (WeChat) — Показать' : '🌐 Chinese WeChat Localization — Expand')}
                </span>
              </button>
            </div>

          </div>

          {/* Hidden/Collapsible WeChat Mini-app compatibility */}
          {showWeChatLoc && (
            <div className="lg:col-span-12 bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 text-left transition-all">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Languages className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                    {lang === 'ru' ? 'Локализация WeChat (Китайский)' : lang === 'en' ? 'WeChat Localization (Chinese)' : '微信小程序多语言本地化翻译'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ru' ? 'Перевод названия и преимуществ для туристов из КНР' : lang === 'en' ? 'Translation of name and benefits for tourists from China' : '为来自中国大陆及港澳台的出海游客专门提供的高效翻译及呈现'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Название на китайском (WeChat title)' : lang === 'en' ? 'Chinese title (WeChat Pay app)' : '微信小程序显示的中文船名'}</label>
                    <input 
                      type="text"
                      value={vesselTranslations[selectedVesselId]?.nameZh || ''}
                      onChange={(e) => handleUpdateTranslation('nameZh', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                      placeholder="豪华双层动力游艇"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">{lang === 'ru' ? 'Описание судна (Chinese WeChat description)' : lang === 'en' ? 'Chinese description (WeChat app)' : '微信展示的中文船舶特色详情介绍'}</label>
                    <textarea 
                      rows={4}
                      value={vesselTranslations[selectedVesselId]?.descZh || ''}
                      onChange={(e) => handleUpdateTranslation('descZh', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans leading-relaxed"
                      placeholder="豪华尊贵游艇，配备最新款防鲨装置..."
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-cyan-950/20 border border-cyan-500/15 space-y-3 text-left">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'ru' ? 'Мини-программа WeChat Pay' : lang === 'en' ? 'WeChat Pay Mini-Program' : '微信 / 支付宝海外版小程序直连'}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed text-left">
                    {lang === 'ru'
                      ? 'Текст автоматически рендерится в китайском каталоге «JIV» для бесконтактной аренды туристами у причалов Новик и Токаревский Маяк.'
                      : lang === 'en'
                      ? 'Text is automatically rendered in the Chinese catalog of "JIV" for contactless rent by tourists at Novik and Tokarevsky piers.'
                      : '翻译内容将自动呈现在面向大中华区境外游客的中文版 JIV 游艇租赁手册中。'}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-white/5">
                    API HOOK: <span className="text-emerald-400">active</span> • Sync latency: 1.2s
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- TAB 3: BOOKING QUEUE (LIST VIEW) --- */}
      {bridgeTab === 'bookings' && (
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 text-left" id="bridge-bookings-queue-tab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="text-left">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                {lang === 'ru' ? 'Журнал навигации и заказов' : lang === 'en' ? 'Navigation & Bookings Log' : '订单与日常航次执行日志'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'ru' ? 'Список входящих заявок из всех источников: JIV Web, WeChat Pay, Telegram Бот' : lang === 'en' ? 'List of incoming requests from all channels: JIV Web, WeChat Pay, Telegram Bot' : '汇总呈现来自于各方渠道（包含 JIV Web 端、微信多语言版小程序和电报机器人终端）的全部预订。'}
              </p>
            </div>
            
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {lang === 'ru' ? 'Ожидает' : lang === 'en' ? 'Pending' : '待处理'} ({bookings.filter(b => b.status === 'pending').length})
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {lang === 'ru' ? 'Подтверждено' : lang === 'en' ? 'Confirmed' : '已确认'} ({bookings.filter(b => b.status === 'confirmed').length})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-medium">{lang === 'ru' ? 'ID Заказа' : lang === 'en' ? 'ID' : '订单号'}</th>
                  <th className="pb-3 font-medium">{lang === 'ru' ? 'Судно' : lang === 'en' ? 'Vessel' : '船只'}</th>
                  <th className="pb-3 font-medium">{lang === 'ru' ? 'Заказчик' : lang === 'en' ? 'Customer' : '订位客户'}</th>
                  <th className="pb-3 font-medium">{lang === 'ru' ? 'Дата & Время' : lang === 'en' ? 'Date & Time' : '出海时间段'}</th>
                  <th className="pb-3 font-medium">{lang === 'ru' ? 'Тариф' : lang === 'en' ? 'Tariff' : '计费类型'}</th>
                  <th className="pb-3 font-medium text-right">{lang === 'ru' ? 'Сумма' : lang === 'en' ? 'Total' : '订单金额'}</th>
                  <th className="pb-3 font-medium text-center">{lang === 'ru' ? 'Статус' : lang === 'en' ? 'Status' : '状态'}</th>
                  <th className="pb-3 font-medium text-center">{lang === 'ru' ? 'Действие' : lang === 'en' ? 'Actions' : '审批操作'}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <React.Fragment key={b.id}>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 font-mono font-bold text-slate-300">
                        {b.id}
                      </td>
                      <td className="py-4">
                        <div className="text-left">
                          <span className="font-semibold text-white block text-xs">{b.vesselName}</span>
                          <span className="text-[10px] text-slate-500 block">{lang === 'ru' ? 'Капитан: Алексей Бережной' : lang === 'en' ? 'Captain: Alexey Berezhnoy' : '船长：阿列克谢·别列日诺伊'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-left">
                          <span className="text-slate-200 font-medium block">{b.customerName}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{b.customerPhone}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-mono text-cyan-400 text-left">
                          {b.date}, {b.timeStart} ({b.hoursCount || b.seatsCount || 3} {b.bookingType === 'hour' ? (lang === 'ru' ? 'ч' : lang === 'en' ? 'h' : '小时') : b.bookingType === 'seat' ? (lang === 'ru' ? 'мест' : lang === 'en' ? 'seats' : '席位') : (lang === 'ru' ? 'д' : lang === 'en' ? 'd' : '天')})
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          b.bookingType === 'hour' ? 'bg-cyan-500/10 text-cyan-400' : b.bookingType === 'seat' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {b.bookingType === 'hour' 
                            ? (lang === 'ru' ? 'ПОЧАСОВОЙ' : lang === 'en' ? 'HOURLY' : '计时制') 
                            : b.bookingType === 'seat' 
                            ? (lang === 'ru' ? 'БИЛЕТ' : lang === 'en' ? 'TICKET/SEAT' : '单座票') 
                            : (lang === 'ru' ? 'ПОСУТОЧНЫЙ' : lang === 'en' ? 'DAILY' : '按天制')}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono font-extrabold text-emerald-400">
                        {b.totalPrice.toLocaleString()} ₽
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          b.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : b.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {b.status === 'pending' 
                            ? (lang === 'ru' ? 'Ожидание' : lang === 'en' ? 'Pending' : '待处理') 
                            : b.status === 'confirmed' 
                            ? (lang === 'ru' ? 'Подтвержден' : lang === 'en' ? 'Confirmed' : '已确认') 
                            : (lang === 'ru' ? 'Отклонен' : lang === 'en' ? 'Declined' : '已拒绝')}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          {b.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleBookingAction(b.id, 'confirmed')}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] rounded transition-colors"
                              >
                                {lang === 'ru' ? 'Одобрить' : lang === 'en' ? 'Approve' : '确认同意'}
                              </button>
                              <button 
                                onClick={() => handleBookingAction(b.id, 'declined')}
                                className="p-1 bg-slate-950 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 rounded transition-colors"
                                title={lang === 'ru' ? 'Отклонить' : 'Decline'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Collapsible Passenger Wishes Row */}
                    {(b.wishesRoute || b.wishesConditions) && (
                      <tr className="bg-slate-950/40 text-[11px] border-b border-white/5">
                        <td colSpan={8} className="py-2.5 px-4 text-slate-400 font-sans">
                          <div className="flex flex-col sm:flex-row gap-4 text-left">
                            {b.wishesRoute && (
                              <div className="flex-1 text-left">
                                <span className="font-bold text-cyan-400 block font-mono text-[9px] uppercase tracking-wider">🧭 {lang === 'ru' ? 'Пожелания по маршруту:' : lang === 'en' ? 'Route Wishes:' : '🧭 航线航道期待：'}</span>
                                <span className="text-slate-300 block mt-1 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-white/5 text-left">{b.wishesRoute}</span>
                              </div>
                            )}
                            {b.wishesConditions && (
                              <div className="flex-1 text-left">
                                <span className="font-bold text-amber-400 block font-mono text-[9px] uppercase tracking-wider">🍽️ {lang === 'ru' ? 'Пожелания по комфорту:' : lang === 'en' ? 'Onboard / Catering Wishes:' : '🍽️ 餐饮舒适及增值服务要求：'}</span>
                                <span className="text-slate-300 block mt-1 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-white/5 text-left">{b.wishesConditions}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Captain Speed warning notice */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{lang === 'ru' ? 'Время ответа влияет на выдачу' : lang === 'en' ? 'Response time affects rankings' : '响应速度直接决定平台搜索曝光率'}</span>
                <p className="text-[10px] text-slate-400 text-left">
                  {lang === 'ru'
                    ? 'Алгоритм JIV выдает катера быстрее ответивших капитанов на 40% выше в ленте поиска!'
                    : lang === 'en'
                    ? 'The JIV ranking algorithm pushes fast-responding captains 40% higher in client search feeds!'
                    : '根据 JIV 平台推荐算法，平均回复确认在1分钟以内的船长在海图搜索中将获得额外40%的曝光率加权！'}
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-slate-900 rounded font-mono text-[10px] text-cyan-400 border border-white/10">
              {lang === 'ru' ? `Ваш средний ответ: ${responseTimeScore} секунд` : lang === 'en' ? `Your avg. response: ${responseTimeScore} seconds` : `您的平均确认时间：${responseTimeScore} 秒`}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 4: CAPTAIN TELEGRAM NOTIFICATIONS --- */}
      {bridgeTab === 'integrations' && (
        <div className="space-y-6 text-left" id="bridge-integrations-tab">
          
          {/* Main Captain Friendly Control Card */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">
                    {lang === 'ru' ? 'Уведомления о бронированиях в Telegram' : lang === 'en' ? 'Telegram Booking Notifications' : '电报出海订单即时通知'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  {lang === 'ru' 
                    ? 'Получайте новые заявки прямо на смартфон и подтверждайте их в 1 клик без лишних настроек' 
                    : lang === 'en' 
                    ? 'Receive new booking requests directly on your smartphone and confirm in 1-click' 
                    : '出海订单消息秒级推送到您的手机电报客户端，支持一键确认或拒绝。'}
                </p>
              </div>

              {/* Telegram Status Switch */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 px-4 rounded-2xl border border-white/5 self-start sm:self-auto">
                <span className={`w-2.5 h-2.5 rounded-full ${telegramEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-bold text-white font-mono">
                  {telegramEnabled 
                    ? (lang === 'ru' ? 'УВЕДОМЛЕНИЯ ВКЛЮЧЕНЫ' : 'ALERTS ACTIVE') 
                    : (lang === 'ru' ? 'ОПОВЕЩЕНИЯ ВЫКЛЮЧЕНЫ' : 'ALERTS OFF')}
                </span>
                <button 
                  onClick={() => {
                    setTelegramEnabled(!telegramEnabled);
                    triggerToast(lang === 'ru' ? `Telegram оповещения: ${!telegramEnabled ? 'Включены' : 'Выключены'}` : `Telegram alerts: ${!telegramEnabled ? 'Enabled' : 'Disabled'}`);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-2 ${
                    telegramEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    telegramEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Captain 3-Step Simple Guide & Quick Test */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left: Simple 3 Steps */}
              <div className="md:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  {lang === 'ru' ? 'Простая настройка за 30 секунд:' : lang === 'en' ? 'Easy 30-Second Connection:' : '简单 3 步快速绑定手机：'}
                </h3>
                
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/20">1</span>
                    <p className="text-left leading-relaxed">
                      {lang === 'ru' ? 'Откройте Telegram и найдите бота' : lang === 'en' ? 'Open Telegram and find bot' : '在 Telegram 查找机器人'} <a href="https://t.me/vladiwater_bot" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold underline">@vladiwater_bot</a>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/20">2</span>
                    <p className="text-left leading-relaxed">
                      {lang === 'ru' ? 'Нажмите кнопку «Старт» (/start) в чате с ботом' : lang === 'en' ? 'Press "Start" (/start) in bot chat' : '在对话框中点击发送 /start 命令'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 border border-cyan-500/20">3</span>
                    <p className="text-left leading-relaxed">
                      {lang === 'ru' ? 'Готово! Новые заявки на ваш катер сразу появятся у вас в телефоне.' : lang === 'en' ? 'Ready! All new booking requests will instantly pop up on your phone.' : '完成！后续所有出海预订都将第一时间推送至您的手机。'}
                    </p>
                  </div>
                </div>

                {/* Telegram Chat ID or Phone number setting */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:flex-1 space-y-1 text-left">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">
                      {lang === 'ru' ? 'Ваш Telegram Chat ID или телефон:' : lang === 'en' ? 'Your Telegram Chat ID / Phone:' : '您的 Telegram Chat ID 或绑定的手机号：'}
                    </label>
                    <input 
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      placeholder="Например: 449102931"
                    />
                  </div>
                  <button
                    onClick={() => triggerToast(lang === 'ru' ? 'ID капитана успешно привязан!' : 'Captain ID saved successfully!')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-white/10 self-end"
                  >
                    {lang === 'ru' ? 'Сохранить' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Right: Quick Test Button Box */}
              <div className="md:col-span-5 bg-gradient-to-br from-cyan-950/30 to-slate-950 p-6 rounded-2xl border border-cyan-500/20 text-left space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {lang === 'ru' ? 'Проверить работу бота' : lang === 'en' ? 'Test Bot Push Notification' : '测试通知发送'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lang === 'ru' 
                      ? 'Нажмите кнопку ниже, чтобы сымитировать поступление нового заказа от туриста.' 
                      : lang === 'en'
                      ? 'Click the button below to simulate receiving a new booking request.'
                      : '点击下方按钮，模拟体验收到来自游客的新预订通知。'}
                  </p>
                </div>

                <button
                  onClick={handleTestTelegramNotification}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'ru' ? '📲 Отправить тестовый заказ в Telegram' : lang === 'en' ? '📲 Send Test Booking Alert' : '📲 发送测试预订提醒'}</span>
                </button>
              </div>

            </div>

            {/* Advanced Geek / Developer Settings Toggle */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDevSettings(!showDevSettings)}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {showDevSettings
                    ? (lang === 'ru' ? '▲ Скрыть настройки для разработчиков (API / Webhooks)' : '▲ Hide Developer Settings')
                    : (lang === 'ru' ? '⚙️ Настройки для разработчиков (Bot Token & Webhook API)' : '⚙️ Developer Settings (Bot Token & Webhooks)')}
                </span>
              </button>
            </div>

          </div>

          {/* Hidden Collapsible Developer & Webhook Panel */}
          {showDevSettings && (
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 text-left transition-all">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-extrabold text-white font-mono uppercase text-left">
                  Developer Configuration & API Webhooks
                </h3>
                <p className="text-xs text-slate-400 text-left">
                  Прямое управление токенами Бота и конфигурацией шлюзов Yandex Cloud / JIV Marine Endpoint
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Bot Token (Telegram API)</label>
                  <input 
                    type="password"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Webhook Endpoint URL</label>
                  <input 
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* WeChat Mini App API Bridge JSON */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    WeChat Mini App Data Gateway (JSON API)
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-400">
                    GET /api/v1/wechat/vessels
                  </span>
                </div>
                <div className="bg-slate-950 rounded-2xl p-4 border border-white/5 text-[10px] font-mono text-cyan-400 overflow-x-auto max-h-48 overflow-y-auto">
                  <pre>{`{
  "status": "success",
  "currency": "CNY",
  "exchange_rate_rub_cny": 0.08,
  "vessel_id": "${selectedVesselId}",
  "vessel_name": "${currentEditingVessel.name}",
  "status": "active_for_wechat_catalog"
}`}</pre>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- MODAL 1: PUBLISH NEW VESSEL LISTING --- */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in relative my-8">
            <button 
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-950/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                  {lang === 'ru' ? 'Новое объявление' : 'New Listing'}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">НСПК / СБП / WeChat / Stripe Sync</span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                <span>{lang === 'ru' ? 'Опубликовать судно или тур во Владивостоке' : 'Publish Vessel Listing'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Заполните параметры плавсредства. На этапе запуска платформы публикация объявлений полностью бесплатна (0 ₽).' 
                  : 'Fill in vessel specs. Publishing is 100% FREE during the platform launch phase (0 ₽).'}
              </p>
            </div>

            <form onSubmit={handlePublishVesselSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Название судна / катера *</label>
                  <input
                    type="text"
                    required
                    value={newVesselName}
                    onChange={(e) => setNewVesselName(e.target.value)}
                    placeholder="напр. Катер «Морской Драйв 38»"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Категория судна *</label>
                  <select
                    value={newVesselCategory}
                    onChange={(e: any) => setNewVesselCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="yacht">⛵ VIP-Яхта (Моторная/Парусная)</option>
                    <option value="boat">⚓ Катер (Морская рыбалка)</option>
                    <option value="jetski">🌊 Гидроцикл (Скоростной)</option>
                    <option value="taxi">🚤 Морское такси (Трансфер)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Район / Бухта базирования</label>
                  <select
                    value={newVesselHomeport}
                    onChange={(e) => setNewVesselHomeport(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="о. Русский (бухта Новик)">о. Русский (бухта Новик)</option>
                    <option value="о. Русский (Канал)">о. Русский (Канал)</option>
                    <option value="Бухта Змеинка">Бухта Змеинка</option>
                    <option value="Эгершельд (Токаревский маяк)">Эгершельд (Токаревский маяк)</option>
                    <option value="о. Русский (Поспелово)">о. Русский (Поспелово)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Вместимость (пассажиров)</label>
                  <input
                    type="number"
                    value={newVesselCapacity}
                    onChange={(e) => setNewVesselCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Цена за 1 час (₽)</label>
                  <input
                    type="number"
                    value={newVesselPriceHour}
                    onChange={(e) => setNewVesselPriceHour(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-cyan-400 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Цена за сутки (₽)</label>
                  <input
                    type="number"
                    value={newVesselPriceDay}
                    onChange={(e) => setNewVesselPriceDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-cyan-400 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">ФИО Капитана</label>
                  <input
                    type="text"
                    value={newVesselCaptainName}
                    onChange={(e) => setNewVesselCaptainName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Телефон Капитана</label>
                  <input
                    type="text"
                    value={newVesselCaptainPhone}
                    onChange={(e) => setNewVesselCaptainPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Unique Features Checks */}
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 font-mono uppercase block">Уникальные опции судна:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVesselSharkShield}
                      onChange={(e) => setNewVesselSharkShield(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <span>🛡️ Shark Shield</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVesselMusic}
                      onChange={(e) => setNewVesselMusic(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <span>🎵 Музыка / Акустика</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVesselEchoSounder}
                      onChange={(e) => setNewVesselEchoSounder(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <span>📡 3D Эхолот</span>
                  </label>
                </div>
              </div>

              {/* Photo Preview Selector & Custom Upload */}
              <div className="space-y-2 text-xs font-mono">
                <label className="text-slate-400 block font-bold">Фотография судна (Превью или закрузка):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=400&q=80'
                  ].map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewVesselImageUrl(url)}
                      className={`relative rounded-xl overflow-hidden border-2 h-16 transition-all ${
                        newVesselImageUrl === url ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <label className="cursor-pointer py-2 px-3 rounded-xl bg-slate-950 border border-dashed border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-[11px] font-mono flex items-center justify-center gap-2 transition-all">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>📁 Загрузить фото вашего судна с устройства</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setNewVesselImageUrl(event.target.result as string);
                              triggerToast('📸 Фото судна успешно загружено в превью!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Free Launch Activation Box */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-emerald-300 font-bold block flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-extrabold">🎁 БЕСПЛАТНО</span>
                    <span>Активация листинга: 0 ₽</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Плата за размещение объявлений временно не взимается (0% комиссия)</span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg font-mono shrink-0"
                >
                  Опубликовать (Бесплатно)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PROMOTE VESSEL TO TOP-1 --- */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setShowPromoteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-950/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
                🔥 VIP BOOST SERVICE
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Продвинуть судно в ТОП-1</span>
              </h2>
              <p className="text-xs text-slate-400">
                Выбранное судно: <strong className="text-amber-300 font-mono">{currentEditingVessel.name}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-2">
                <span>🎁 <strong>Бесплатное продвижение на этапе запуска:</strong> 0 ₽ вместо 1 500 ₽</span>
              </div>
              <span className="text-slate-300 font-bold block pt-1">Преимущества ТОП-1 продвижения:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Первая позиция во всех поисковых фильтрах «Аренда флота»</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Золотая плашка «🔥 VIP TOP-1» с мерцающей подсветкой</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Синхронизация с каталогами WeChat Mini App & Alipay</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-mono hover:text-white"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handlePromoteVesselSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg font-mono flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Закрепить в ТОП-1 (Бесплатно)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: VOLUNTARY QUALIFICATION VERIFICATION --- */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in relative text-left">
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ДОБРОВОЛЬНАЯ КВАЛИФИКАЦИЯ МЧС ГИМС</span>
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Проверка документов Капитана
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Заполнение данного раздела является <strong className="text-amber-300">добровольным</strong>. Вы можете публиковать любые объявления и работать на платформе без верификации.
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-300 block font-bold">Удостоверение маломерного судна ГИМС МЧС:</label>
                <input
                  type="text"
                  value={gimsLicenseInput}
                  onChange={(e) => setGimsLicenseInput(e.target.value)}
                  placeholder="79АВ001234"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block font-bold">Паспортные данные гражданина РФ:</label>
                <input
                  type="text"
                  value={passportInput}
                  onChange={(e) => setPassportInput(e.target.value)}
                  placeholder="0518 948120"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block font-bold">Бортовой номер судна / Судовой билет:</label>
                <input
                  type="text"
                  value={boatTicketInput}
                  onChange={(e) => setBoatTicketInput(e.target.value)}
                  placeholder="Р 09-12 ВЛ"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                ✨ <strong>Что даёт верификация?</strong>
                <br />
                Все ваши объявления получат золотой значок <span className="font-bold text-amber-300">«Подтверждённая квалификация»</span> и будут автоматически подняты выше в поисковой выдаче.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCaptainVerified(false);
                  setShowVerificationModal(false);
                  triggerToast('Статус верификации сброшен.');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 text-slate-400 text-xs font-mono hover:text-white transition-all text-center"
              >
                Отменить верификацию
              </button>

              <button
                type="button"
                onClick={() => {
                  setCaptainVerified(true);
                  setShowVerificationModal(false);
                  triggerToast('🎉 Документы проверены! Вам присвоен статус «Подтверждённая квалификация».');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all shadow-lg font-mono flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Подтвердить квалификацию</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
