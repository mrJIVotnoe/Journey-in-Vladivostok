/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vessel, SharedTour, MapPoint } from '../types';

// Demonstration dataset: Strictly 1 example vessel per category (VIP, Active, Taxi)
// marked with isDemo: true for UI testing and captain onboarding demo.
export const VESSELS_DATA: Vessel[] = [
  {
    id: 'demo-vip-julia',
    name: 'Яхта VIP «Джулия» [Демо-образ]',
    category: 'yacht',
    description: 'Демонстрационный образец карточки VIP-яхты для капитанов-судовладельцев. Длина 60 футов, система защиты от акул Shark Shield, каюты флайбридж и панорамный салон.',
    capacity: 15,
    speed: 45,
    homeport: 'Бухта Новик',
    coordinates: { x: 42, y: 68 },
    latLon: [43.0031, 131.8385],
    priceHour: 18500,
    priceDay: 130000,
    rating: 5.0,
    reviewsCount: 1,
    captainName: 'Капитан Александр Г.',
    captainPhone: '+7 (914) 700-00-00',
    images: [
      '/src/assets/images/vladivostok_yacht_hero_1794278080396.jpg'
    ],
    features: ['Shark Shield (Защита от акул)', 'Флайбридж', 'Теплая каюта', 'Акустика JBL Marine'],
    hasSharkRepeller: true,
    allowedActivities: ['VIP-круизы', 'Морские экскурсии', 'Купание'],
    isLive: true,
    responseTime: 10,
    isCaptainVerified: true,
    verifiedQualification: true,
    isDemo: true
  },
  {
    id: 'demo-active-jetski',
    name: 'Гидроцикл BRP SeaDoo RXT-300 [Демо-образ]',
    category: 'jetski',
    description: 'Демонстрационный образец карточки техники для активного отдыха. Реактивный гидроцикл 300 л.с., гидрокостюмы и спасательные жилеты в комплекте.',
    capacity: 2,
    speed: 127,
    homeport: 'о. Русский (Поспелово)',
    coordinates: { x: 48, y: 46 },
    latLon: [43.0645, 131.8954],
    priceHour: 3500,
    rating: 5.0,
    reviewsCount: 1,
    captainName: 'Инструктор Денис М.',
    captainPhone: '+7 (994) 000-00-00',
    images: [
      '/src/assets/images/vessel_catamaran_bay_1794278107495.jpg'
    ],
    features: ['Мощность 300 л.с.', 'Аудиосистема BRP', 'Инструктаж включен'],
    hasMusic: true,
    allowedActivities: ['Скоростной драйв', 'Прыжки на волнах'],
    isLive: true,
    responseTime: 5,
    isCaptainVerified: true,
    verifiedQualification: true,
    isDemo: true
  },
  {
    id: 'demo-taxi-boat',
    name: 'Морское такси «Русский Экспресс» [Демо-образ]',
    category: 'taxi',
    description: 'Демонстрационный образец карточки морского такси и островных трансферов. Закрытый салон, обогрев, быстрая высадка на пирсы и необорудованные берега.',
    capacity: 8,
    speed: 55,
    homeport: 'Бухта Змеинка',
    coordinates: { x: 55, y: 48 },
    latLon: [43.0872, 131.9168],
    priceHour: 1200,
    rating: 5.0,
    reviewsCount: 1,
    captainName: 'Капитан Игорь П.',
    captainPhone: '+7 (914) 000-00-00',
    images: [
      '/src/assets/images/vessel_catamaran_bay_1794278107495.jpg'
    ],
    features: ['Круглосуточно 24/7', 'Тент от брызг', 'Трансфер на острова'],
    allowedActivities: ['Трансфер на острова', 'Экстренный выезд'],
    isLive: true,
    responseTime: 8,
    isCaptainVerified: true,
    verifiedQualification: true,
    isDemo: true
  }
];

export const SHARED_TOURS_DATA: SharedTour[] = [];

export const MAP_POINTS_DATA: MapPoint[] = [
  {
    id: 'tokarevsky-pt',
    name: 'Токаревский маяк',
    type: 'lighthouse',
    coordinates: { x: 31, y: 57 },
    description: 'Один из старейших действующих маяков Дальнего Востока России, основан в 1876 году. Обозначает вход в пролив Босфор Восточный.'
  },
  {
    id: 'novik-pt',
    name: 'Бухта Новик (яхт-клуб)',
    type: 'harbor',
    coordinates: { x: 42, y: 69 },
    description: 'Глубокая, вытянутая бухта острова Русский. Защищенное место от штормов и южных ветров. Базирование катеров и яхт.'
  },
  {
    id: 'zmeinka-pt',
    name: 'Бухта Змеинка',
    type: 'harbor',
    coordinates: { x: 56, y: 49 },
    description: 'Крупная лодочная стоянка во Владивостоке. Удобная отправная точка для морских трансферов.'
  },
  {
    id: 'uliss-pt',
    name: 'Бухта Улисс',
    type: 'harbor',
    coordinates: { x: 63, y: 41 },
    description: 'Базирование рыболовных и скоростных катеров во Владивостоке.'
  },
  {
    id: 'pospelovo-pt',
    name: 'о. Русский (Поспелово)',
    type: 'sight',
    coordinates: { x: 48, y: 47 },
    description: 'Побережье острова Русский около Русского моста. Место старта гидроциклов и катеров.'
  }
];
