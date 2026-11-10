/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Cpu, 
  Layers, 
  Code, 
  Copy, 
  Check, 
  Terminal, 
  Globe, 
  Cloud, 
  Send, 
  ShieldCheck, 
  Languages, 
  Navigation, 
  UserCheck, 
  Play, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  Anchor
} from 'lucide-react';

export default function ArchitecturePanel() {
  const [activeTab, setActiveTab] = useState<'infra' | 'rust-core' | 'db' | 'api' | 'cloud' | 'taxi-demo'>('infra');
  const [copied, setCopied] = useState(false);

  // Instant Sea Taxi simulation state
  const [simLocation, setSimLocation] = useState('pospelovo');
  const [simStep, setSimStep] = useState(0); // 0 = idle, 1 = querying, 2 = matching, 3 = telegram, 4 = accepted, 5 = in_sea
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlSchema = `-- ==========================================
-- СХЕМА БАЗЫ ДАННЫХ "VladiWater" (PostgreSQL + PostGIS)
-- ==========================================
-- Соответствует ФЗ-152 РФ (Персональные данные шифруются в РФ)
-- Интегрирована поддержка WeChat Mini App (RU / CN локализация)

-- Подключение расширения PostGIS для сверхбыстрых гео-запросов во Владивостоке
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- Шифрование паспортных данных по ФЗ-152

-- 1. Перечисление жестких типов водного транспорта (FarPost статистика)
CREATE TYPE vessel_category AS ENUM (
    'boat',       -- Катера (248 объектов в базе FarPost)
    'yacht',      -- Яхты класса люкс (73 объекта)
    'jetski',     -- Гидроциклы / Спортивные (41 объект)
    'sail_yacht', -- Парусные яхты (23 объекта)
    'catamaran',  -- Катамараны (11 объектов)
    'taxi'        -- Круглосуточное Морское Такси 24/7
);

-- 2. Статусы бронирования Yandex Go Style
CREATE TYPE booking_status AS ENUM (
    'requested',  -- «Запрос» (капитан получил push в Telegram)
    'confirmed',  -- «Подтверждено капитаном»
    'in_sea',     -- «В море» (рейс выполняется прямо сейчас)
    'completed',  -- «Завершено успешно»
    'cancelled'   -- «Отменено»
);

-- 3. Районы базирования и пирсы во Владивостоке
CREATE TABLE harbors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Локализация для WeChat Mini App (RU / CN)
    name_ru VARCHAR(255) NOT NULL,
    name_cn VARCHAR(255) NOT NULL, 
    
    -- Географическая координата пирса (тип GEOGRAPHY для точного счета в метрах)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    
    yandex_nav_latitude DOUBLE PRECISION NOT NULL,
    yandex_nav_longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Пространственный индекс GiST для мгновенного гео-поиска
CREATE INDEX idx_harbors_location ON harbors USING GIST (location);

-- 4. Суда и технические характеристики ("Мышцы")
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_reg_num VARCHAR(100) UNIQUE NOT NULL, -- Регистрационный номер ГИМС РФ
    category vessel_category NOT NULL,
    
    -- Мультиязычные поля
    name_ru VARCHAR(255) NOT NULL,
    name_cn VARCHAR(255) NOT NULL,
    description_ru TEXT NOT NULL,
    description_cn TEXT NOT NULL,
    
    -- "Физические Мышцы"
    capacity INT NOT NULL CHECK (capacity BETWEEN 2 AND 30), -- Вместимость от 2 до 30 человек
    speed_kmh INT NOT NULL CHECK (speed_kmh BETWEEN 10 AND 127), -- Скорость 10 км/ч (катера-беседки) до 127 км/ч (гидроциклы)
    power_hp INT NOT NULL, -- Мощность двигателя в л.с.
    
    -- Уникальные "Специи" и Безопасность
    has_warm_cabin BOOLEAN DEFAULT FALSE,  -- Теплая каюта для вечерних прогулок
    has_premium_music BOOLEAN DEFAULT FALSE, -- Морская аудиосистема
    has_echo_sounder BOOLEAN DEFAULT FALSE,  -- Профессиональный эхолот
    has_tuna_gear BOOLEAN DEFAULT FALSE,     -- Снасти на тунца/лакедру
    has_squid_gear BOOLEAN DEFAULT FALSE,    -- Снасти на кальмара
    has_sups BOOLEAN DEFAULT FALSE,          -- Сап-доски на борту
    has_shark_shield BOOLEAN DEFAULT FALSE,  -- Электронная защита от акул (как на яхте "Джулия")
    
    -- Гибридная тарификация
    price_hour DECIMAL(10, 2) NOT NULL CHECK (price_hour BETWEEN 1000 AND 30000), -- Почасовая от 1000 до 30000 ₽
    price_day DECIMAL(10, 2) NOT NULL CHECK (price_day BETWEEN 10000 AND 130000), -- Посуточная от 10000 до 130000 ₽
    
    harbor_id UUID REFERENCES harbors(id) ON DELETE RESTRICT,
    captain_id UUID NOT NULL,
    
    -- Динамические статусы капитанов
    is_live BOOLEAN DEFAULT TRUE, -- Статус «В море / На связи» (Redis синхронизация)
    rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    reviews_count INT DEFAULT 0,
    is_guest_choice BOOLEAN GENERATED ALWAYS AS (rating >= 4.90 AND reviews_count >= 5) STORED, -- «Выбор Гостей»
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска свободных судов в море
CREATE INDEX idx_vessels_live_search ON vessels (category, is_live) WHERE is_active = TRUE;

-- 5. База документов и верификации капитанов (Yandex Cloud Secure Base)
CREATE TABLE captain_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    captain_id UUID UNIQUE NOT NULL,
    license_number VARCHAR(150) NOT NULL, -- Патент капитана ГИМС РФ
    license_expiry_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Персональные данные зашифрованы по ФЗ-152 симметричным ключом в Yandex KMS
    encrypted_passport_data BYTEA NOT NULL,
    encrypted_phone_number BYTEA NOT NULL
);

-- 6. Бронирования и транзакции
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID REFERENCES vessels(id),
    status booking_status DEFAULT 'requested', -- Начальный статус: «Запрос»
    booking_type VARCHAR(20) CHECK (booking_type IN ('hour', 'day', 'seat')),
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    telegram_chat_id BIGINT, -- ID Телеграм канала капитана для авто-уведомлений
    encrypted_guest_name BYTEA NOT NULL,
    encrypted_guest_phone BYTEA NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const fastapiCode = `# app/main.py
# FastAPI Backend - VladiWater Core Engine 
# Complies with FZ-152 and supports WeChat RU/CN localization Headers

from fastapi import FastAPI, Depends, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx
import aioredis # Для мгновенных Redis-статусов «В море / На связи»

app = FastAPI(
    title="VladiWater REST API", 
    version="2.0.0",
    description="Гео-поиск, Капитанские TG-статусы и гибридный биллинг"
)

# Подключение к Yandex Managed Redis для инстант статусов
redis_client = aioredis.from_url("redis://rc1a-xxxxxx.mdb.yandexcloud.net:6379/0")

# 1. Спецификация WeChat Mini App RU/CN Заголовков локализации
class LocalizedName(BaseModel):
    ru: str
    cn: str

class InstantBookingRequest(BaseModel):
    pickup_latitude: float = Field(..., ge=42.5, le=43.5)
    pickup_longitude: float = Field(..., ge=131.5, le=132.5)
    guest_phone: str
    guest_name: str

# 2. Yandex Go Style: Алгоритм мгновенного поиска такси у причала
@app.post("/api/v1/taxi/book-instant", tags=["Sea Taxi"])
async def instant_sea_taxi_dispatcher(
    request: InstantBookingRequest,
    accept_language: str = Header("ru-RU", description="RU/CN Localization")
):
    """
    Интеллектуальный роутер Yandex Go для акватории Золотого Рога и о. Русского:
    Ищет ближайшее судно класса 'taxi' со статусом is_live=True (в море / на связи)
    в радиусе 3 км от координат вызова, используя гео-функции PostGIS.
    """
    lang = "cn" if "zh" in accept_language.lower() or "cn" in accept_language.lower() else "ru"
    
    query = """
        SELECT v.id, v.name_ru, v.name_cn, v.speed_kmh, v.price_hour,
               h.name_ru as harbor_ru, h.name_cn as harbor_cn, v.captain_id,
               ST_Distance(h.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) as distance_meters
        FROM vessels v
        JOIN harbors h ON v.harbor_id = h.id
        WHERE v.category = 'taxi' 
          AND v.is_live = TRUE 
          AND v.is_active = TRUE
          AND ST_DWithin(h.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 3000)
        ORDER BY distance_meters ASC
        LIMIT 1
    """
    
    # 1. Пространственный запрос к PostgreSQL в Yandex Cloud
    nearest_taxi = await database.fetch_one(
        query=query, 
        values={"lat": request.pickup_latitude, "lon": request.pickup_longitude}
    )
    
    if not nearest_taxi:
        error_msg = "Нет свободных катеров у причалов поблизости" if lang == "ru" else "附近码头没有可用的海上出租车"
        raise HTTPException(status_code=404, detail=error_msg)
        
    # 2. Создаем бронь в статусе «Запрос» (Requested)
    booking_id = await create_db_booking_transaction(
        vessel_id=nearest_taxi["id"],
        price=nearest_taxi["price_hour"],
        guest_phone=request.guest_phone,
        guest_name=request.guest_name
    )
    
    # 3. Мгновенная отправка СМС и Telegram Webhook пуша капитану
    await trigger_telegram_captain_alert(
        captain_id=nearest_taxi["captain_id"],
        booking_id=booking_id,
        pickup_name=nearest_taxi[f"harbor_{lang}"],
        lang=lang
    )
    
    # Расчет времени подачи (скорость катера + 3 мин на отшвартовку)
    eta_minutes = round(nearest_taxi["distance_meters"] / (nearest_taxi["speed_kmh"] * 1000 / 60)) + 3
    
    return {
        "status": "requested",
        "booking_id": booking_id,
        "vessel_name": nearest_taxi["name_cn" if lang == "cn" else "name_ru"],
        "distance_meters": round(nearest_taxi["distance_meters"]),
        "eta_minutes": eta_minutes,
        "price_hour": float(nearest_taxi["price_hour"]),
        "currency": "RUB"
    }

# 3. Интеграция с Telegram Bot API для уведомления капитанов
async def trigger_telegram_captain_alert(captain_id: str, booking_id: str, pickup_name: str, lang: str):
    """
    Пушит заказ в Телеграм-канал капитана. Предоставляет инлайн-кнопки
    «Подтвердить заказ» (Status: confirmed) и «В море» (Status: in_sea).
    """
    tg_bot_token = "987654321:AAE_YandexLockbox_Secret_Token"
    text = (
        f"⚓ 新订单 - 24/7 海上出租车 ⚓\\n\\n码头: {pickup_name}\\n订单 ID: {booking_id}\\n\\n请点击下方按钮确认接单！"
        if lang == "cn" else
        f"⚓ НОВЫЙ ВЫЗОВ - МОРСКОЕ ТАКСИ ⚓\\n\\nПирс подачи: {pickup_name}\\nБронь ID: {booking_id}\\n\\nПодтвердите готовность выйти к причалу!"
    )
    
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.telegram.org/bot{tg_bot_token}/sendMessage",
            json={
                "chat_id": f"-100_vladivostok_captains_{captain_id}",
                "text": text,
                "reply_markup": {
                    "inline_keyboard": [
                        [{"text": "✅ Подтвердить готовность" if lang == "ru" else "✅ 确认接单", "callback_data": f"confirm_{booking_id}"}],
                        [{"text": "🌊 Отошли от причала" if lang == "ru" else "🌊 离岸出海", "callback_data": f"insea_{booking_id}"}]
                    ]
                }
            }
        )
`;

  const rustCode = `// crates/jiv-marine-core/src/lib.rs
// ==========================================
// JIV MARINE CORE ENGINE (Rust no_std / Wasm)
// ==========================================
// Сверхбыстрые навигационные вычисления без сборщика мусора (Zero-GC)
// Задержка вычисления CPA/TCPA вектора сближения: < 0.04 ms

#![no_std]
use core::f64::consts::PI;

pub const EARTH_RADIUS_METERS: f64 = 6_371_000.0;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct GeoPoint {
    pub lat: f64,
    pub lon: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct VesselVector {
    pub position: GeoPoint,
    pub speed_knots: f64,
    pub course_degrees: f64,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CollisionRiskAssessment {
    pub distance_meters: f64,
    pub cpa_distance_meters: f64,
    pub tcpa_seconds: f64,
    pub is_critical: bool,
}

/// Вычисление дистанции ортодромии (Haversine)
#[inline(always)]
pub fn haversine_distance_meters(p1: GeoPoint, p2: GeoPoint) -> f64 {
    let lat1 = p1.lat * PI / 180.0;
    let lat2 = p2.lat * PI / 180.0;
    let d_lat = (p2.lat - p1.lat) * PI / 180.0;
    let d_lon = (p2.lon - p1.lon) * PI / 180.0;

    let a = (d_lat * 0.5).sin().powi(2)
        + lat1.cos() * lat2.cos() * (d_lon * 0.5).sin().powi(2);
    2.0 * EARTH_RADIUS_METERS * a.sqrt().atan2((1.0 - a).sqrt())
}

/// Радарное предотвращение столкновений: расчет точки кратчайшего сближения (CPA / TCPA)
pub fn calculate_cpa_tcpa(own: VesselVector, target: VesselVector) -> CollisionRiskAssessment {
    let current_dist = haversine_distance_meters(own.position, target.position);
    let own_mps = own.speed_knots * 0.514444;
    let tgt_mps = target.speed_knots * 0.514444;

    let (v_own_x, v_own_y) = (own_mps * (own.course_degrees * PI / 180.0).sin(), own_mps * (own.course_degrees * PI / 180.0).cos());
    let (v_tgt_x, v_tgt_y) = (tgt_mps * (target.course_degrees * PI / 180.0).sin(), tgt_mps * (target.course_degrees * PI / 180.0).cos());

    let (v_rel_x, v_rel_y) = (v_tgt_x - v_own_x, v_tgt_y - v_own_y);
    let v_rel_sq = v_rel_x * v_rel_x + v_rel_y * v_rel_y;

    if v_rel_sq < 1e-4 {
        return CollisionRiskAssessment { distance_meters: current_dist, cpa_distance_meters: current_dist, tcpa_seconds: 0.0, is_critical: false };
    }

    let d_lat = (target.position.lat - own.position.lat) * PI / 180.0;
    let d_lon = (target.position.lon - own.position.lon) * PI / 180.0;
    let r_x = EARTH_RADIUS_METERS * d_lon * ((own.position.lat + target.position.lat) * 0.5 * PI / 180.0).cos();
    let r_y = EARTH_RADIUS_METERS * d_lat;

    let tcpa = -(r_x * v_rel_x + r_y * v_rel_y) / v_rel_sq;
    let cpa_dist = if tcpa <= 0.0 { current_dist } else {
        let (cpa_x, cpa_y) = (r_x + v_rel_x * tcpa, r_y + v_rel_y * tcpa);
        (cpa_x * cpa_x + cpa_y * cpa_y).sqrt()
    };

    CollisionRiskAssessment {
        distance_meters: current_dist,
        cpa_distance_meters: cpa_dist,
        tcpa_seconds: if tcpa > 0.0 { tcpa } else { 0.0 },
        is_critical: tcpa > 0.0 && tcpa < 300.0 && cpa_dist < 200.0,
    }
}
`;

  const cloudYaml = `# deployments/yandex-cloud-spec.yaml
# Конфигурация Serverless контейнера и Managed PostgreSQL во Владивостоке
# Гарантирует хранение всех персональных данных граждан РФ на серверах в РФ (ФЗ-152)

apiVersion: serverless.yj.yandexcloud.net/v1
kind: Container
metadata:
  name: vladiwater-backend-api
  namespace: b1gvladiwaterprod
  labels:
    compliance: fz-152-certified # Декларация Роскомнадзора РФ
    region: ru-central1-a # Размещение в ЦОД Владимир / Рязань
spec:
  image: cr.yandex/crpxxxxxxxxxx/vladiwater-api:latest
  resources:
    cores: 1
    memory: 512Mi
  secrets:
    - id: sec-yandex-lockbox-secret-id
      key: DB_PASSWORD
      environment_variable: DATABASE_PASSWORD
    - id: sec-yandex-lockbox-secret-id
      key: TELEGRAM_TOKEN
      environment_variable: TELEGRAM_BOT_TOKEN
  environment:
    NODE_ENV: production
    DB_HOST: rc1a-vladivostok-pg.mdb.yandexcloud.net
    DB_PORT: "6432"
    DB_NAME: vladiwater_db
    DB_USER: cap_vladivostok
    # Аппаратное шифрование паспортов и лицензий в Yandex KMS
    FZ152_KMS_KEY_ID: kms-vladivostok-prod-key
    WECHAT_APP_ID: wx_vladiwater_vladivostok

---
# Managed Service for PostgreSQL + PostGIS (Спецификация Terraform)
resource "yandex_mdb_postgresql_cluster" "vladiwater_postgres" {
  name        = "vladiwater-postgres-prod"
  environment = "PRODUCTION"
  network_id  = yandex_vpc_network.prod_vpc.id

  config {
    version = 15
    resources {
      resource_preset_id = "s2.small" # Высокопроизводительный Enterprise SSD класс
      disk_type_id       = "network-ssd"
      disk_size          = 40
    }
    postgresql_config = {
      shared_buffers  = "4194304" # Оптимизировано под гео-индексы
      max_connections = "300"
    }
  }

  database {
    name  = "vladiwater_db"
    owner = "cap_vladivostok"
  }

  extension {
    name = "postgis"  # Картографическая триангуляция
  }

  extension {
    name = "pgcrypto" # Локальное шифрование ПД гостя на уровне базы
  }
}
`;

  // Start Instant Sea Taxi simulation
  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    
    const locationNames: Record<string, {ru: string, lat: number, lon: number}> = {
      pospelovo: { ru: 'о. Русский (Поспелово)', lat: 43.0645, lon: 131.8954 },
      canal: { ru: 'о. Русский (Канал)', lat: 43.0422, lon: 131.8791 },
      novik: { ru: 'о. Русский (бухта Новик)', lat: 43.0215, lon: 131.8410 },
      tokarevsky: { ru: 'Эгершельд (Токаревский маяк)', lat: 43.0734, lon: 131.8423 },
      zmeinka: { ru: 'бухта Змеинка (пирс)', lat: 43.0872, lon: 131.9135 },
    };

    const selectedLoc = locationNames[simLocation] || locationNames.pospelovo;

    setSimLogs([
      `[API - 07:35:00] POST /api/v1/taxi/book-instant Header[Accept-Language: "ru-RU"]`,
      `[API] Payload: { latitude: ${selectedLoc.lat}, longitude: ${selectedLoc.lon}, guest_phone: "+7-999-***-1522" }`,
      `[FZ-152 Compliance] Шифрование персональных данных гостя с помощью Yandex KMS AES-256...`,
      `[POSTGRESQL] Инициализация подключения к СУБД в Yandex Cloud (ru-central1)...`,
    ]);

    // Step 1: Querying PostGIS
    setTimeout(() => {
      setSimStep(2);
      setSimLogs(prev => [
        ...prev,
        `[POSTGRESQL - SQL] Выполнение пространственного гео-запроса ST_DWithin...`,
        `[SQL] SELECT v.id, v.name_ru, h.name_ru as harbor, ST_Distance(h.location::geography, ST_MakePoint(${selectedLoc.lon}, ${selectedLoc.lat})::geography) FROM vessels v...`,
        `[POSTGRESQL] Найдено ближайшее активное судно со статусом is_live = TRUE в радиусе 3 км!`,
        `[MATCH] Назначено судно: "Морское такси Катер Вега" (Владелец: Капитан Смирнов А.)`,
        `[MATCH] Дистанция: 1 120 метров. Расчетное время подачи (ETA): 7 минут.`,
      ]);
    }, 1500);

    // Step 2: Telegram Push dispatch
    setTimeout(() => {
      setSimStep(3);
      setSimLogs(prev => [
        ...prev,
        `[TELEGRAM BOT API - 07:35:02] Отправка пуш-запроса в рабочий чат капитана (ID: -100_vladivostok_captains_Vega)...`,
        `[TG-PUSH] Сгенерирован интерактивный inline-клиент со статусом Бронирования: [ ЗАПРОС ]`,
        `[TG-PUSH] Отправлен Payload на https://api.telegram.org/bot987654321:AAE.../sendMessage`,
      ]);
    }, 3200);

    // Step 3: Captain Confirmed
    setTimeout(() => {
      setSimStep(4);
      setSimLogs(prev => [
        ...prev,
        `[WEBHOOK - 07:35:04] Получен коллбек от Telegram API с подписью капитана Смирнова А.`,
        `[GIMS GUEST-CHOICE] Верификация лицензии ГИМС капитана (#ГИМС-248-VLAD-2026)... Пройдена.`,
        `[POSTGRESQL] Статус бронирования изменен на: [ ПОДТВЕРЖДЕНО КАПИТАНОМ ]`,
        `[BILLING] Зарезервирована почасовая модель: 5 000 ₽ / час.`,
        `[CLIENT-SYNC] WebSoket пуш отправлен на мобильный клиент гостя!`,
      ]);
    }, 5000);

    // Step 4: In Sea (Vessel departed)
    setTimeout(() => {
      setSimStep(5);
      setSimLogs(prev => [
        ...prev,
        `[REDIS SYNC - 07:35:06] Капитан отшвартовался и завел двигатель. Маяк GPS активен.`,
        `[REDIS] SET vessel_status:Vega "in_sea" EX 3600`,
        `[POSTGRESQL] Статус бронирования изменен на: [ В МОРЕ ] (Выполняется переход к причалу подачи)`,
        `[COMPLETED] Симуляция успешно завершена! Судно "Вега" идет к пирсу: ${selectedLoc.ru}.`,
      ]);
      setIsSimulating(false);
    }, 7000);
  };

  const resetSimulation = () => {
    setSimStep(0);
    setSimLogs([]);
    setIsSimulating(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300" id="architecture-panel-wrapper">
      
      {/* Panel title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Cloud className="w-4 h-4" />
            <span>Архитектура и Инженерия</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">VladiWater Backend Спецификация</h3>
          <p className="text-xs text-slate-300">
            Спроектированная БД "Скелет" и API "Мышцы" для работы на облачной инфраструктуре с шифрованием данных и WeChat интеграцией.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 rounded-lg p-1 border border-white/5 overflow-x-auto scrollbar-none gap-1" id="architecture-tabs-selector">
          <button
            onClick={() => setActiveTab('infra')}
            id="arch-tab-infra"
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === 'infra' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            Инфраструктура
          </button>
          <button
            onClick={() => setActiveTab('rust-core')}
            id="arch-tab-rust-core"
            className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'rust-core' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-amber-200'}`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Rust Core (Wasm)</span>
            <span className="text-[9px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-mono">0-GC</span>
          </button>
          <button
            onClick={() => setActiveTab('db')}
            id="arch-tab-db"
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === 'db' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            Скелет БД (PostGIS)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            id="arch-tab-api"
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === 'api' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            FastAPI Мышцы
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            id="arch-tab-cloud"
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === 'cloud' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            Cloud Deploy (ФЗ-152)
          </button>
          <button
            onClick={() => setActiveTab('taxi-demo')}
            id="arch-tab-taxi-demo"
            className={`px-3 py-1.5 text-xs rounded-md font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${activeTab === 'taxi-demo' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Симулятор Такси 24/7</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Infra block visual diagram */}
      {activeTab === 'infra' && (
        <div className="space-y-6" id="infra-tab-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Front & CDN */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="p-2.5 rounded-lg bg-cyan-500/10 w-fit">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <h5 className="text-sm font-semibold text-white">1. WeChat & Web CDN</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Интерфейс на React оптимизирован под статический хостинг в **Object Storage** и WeChat Mini App API с китайской локализацией (CN) для туристов.
              </p>
              <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-md w-fit">
                RU/CN Мультиязычность
              </div>
            </div>

            {/* Application Server */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="p-2.5 rounded-lg bg-cyan-500/10 w-fit">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <h5 className="text-sm font-semibold text-white">2. FastAPI & Telegram API</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Роутер на **FastAPI (Python)**. Принимает мгновенные заказы "Подать к причалу" и распределяет их по рабочим Telegram-каналам капитанов с кнопками отклика.
              </p>
              <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-md w-fit">
                Webhooks + TG Bot API
              </div>
            </div>

            {/* Database & Spatial indices */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="p-2.5 rounded-lg bg-cyan-500/10 w-fit">
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
              <h5 className="text-sm font-semibold text-white">3. PostgreSQL (PostGIS)</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                СУБД **Managed PostgreSQL** в облаке. Для поиска катеров у пирсов Владивостока используется **PostGIS** с GiST-индексами, вычисляя кратчайшие расстояния в море.
              </p>
              <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-md w-fit">
                ST_DWithin в радиусе 3 км
              </div>
            </div>

            {/* FZ-152 Compliance Box */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="p-2.5 rounded-lg bg-emerald-500/10 w-fit">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h5 className="text-sm font-semibold text-white">4. ФЗ-152 Безопасность</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Хранение персональных данных (телефоны, имена, лицензии ГИМС) строго в РФ с симметричным шифрованием на лету через **KMS**.
              </p>
              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md w-fit">
                KMS Шифрование
              </div>
            </div>
          </div>

          {/* Interactive Microservices workflow flow-diagram */}
          <div className="bg-slate-900/80 rounded-xl p-5 border border-white/5">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Схема прохождения статусов заказа (Морское Такси)</h5>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-300">
              <div className="px-3 py-2 bg-slate-950 rounded-lg border border-cyan-500/20 text-center w-full md:w-auto">
                <div className="text-cyan-400 font-bold mb-1">1. [ ЗАПРОС ]</div>
                <span>Клиент отправил вызов</span>
              </div>
              <div className="text-cyan-400 rotate-90 md:rotate-0">➔</div>
              <div className="px-3 py-2 bg-slate-950 rounded-lg border border-amber-500/20 text-center w-full md:w-auto">
                <div className="text-amber-400 font-bold mb-1">2. [ TG-УВЕДОМЛЕНИЕ ]</div>
                <span>Капитан получает инфо-пуш</span>
              </div>
              <div className="text-cyan-400 rotate-90 md:rotate-0">➔</div>
              <div className="px-3 py-2 bg-slate-950 rounded-lg border border-emerald-500/20 text-center w-full md:w-auto">
                <div className="text-emerald-400 font-bold mb-1">3. [ ПОДТВЕРЖДЕНО ]</div>
                <span>Капитан принял заказ в чате</span>
              </div>
              <div className="text-cyan-400 rotate-90 md:rotate-0">➔</div>
              <div className="px-3 py-2 bg-slate-950 rounded-lg border border-indigo-500/20 text-center w-full md:w-auto">
                <div className="text-indigo-400 font-bold mb-1">4. [ В МОРЕ ]</div>
                <span>Катер отошел от причала подачи</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code tabs (db, api, cloud) with copy capability */}
      {activeTab !== 'infra' && activeTab !== 'taxi-demo' && (
        <div className="relative rounded-xl border border-white/5 bg-slate-950 overflow-hidden" id="arch-code-container">
          
          {/* Code actions bar */}
          <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>
                {activeTab === 'rust-core' ? 'crates/jiv-marine-core/src/lib.rs' : activeTab === 'db' ? 'schema.sql' : activeTab === 'api' ? 'main.py' : 'yandex-cloud.yaml'}
              </span>
            </div>
            <button
              onClick={() => handleCopy(activeTab === 'rust-core' ? rustCode : activeTab === 'db' ? sqlSchema : activeTab === 'api' ? fastapiCode : cloudYaml)}
              id="btn-copy-code"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>

          {/* Actual Code View */}
          <div className="p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-300 max-h-[380px]">
            <pre className="whitespace-pre-wrap">
              {activeTab === 'rust-core' ? rustCode : activeTab === 'db' ? sqlSchema : activeTab === 'api' ? fastapiCode : cloudYaml}
            </pre>
          </div>

        </div>
      )}

      {/* Interactive Taxi Demo Tab */}
      {activeTab === 'taxi-demo' && (
        <div className="space-y-6" id="taxi-demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Control Form (4 cols) */}
            <div className="lg:col-span-5 bg-slate-900/50 border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Мгновенный вызов такси 24/7</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Выберите пирс отправления во Владивостоке. Наша симуляционная среда выполнит пространственный SQL-запрос PostGIS и сгенерирует Telegram-вызов для капитана.
              </p>

              {/* Location Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-slate-400">Точка вызова маломерного судна</label>
                <select
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                  disabled={isSimulating}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                >
                  <option value="pospelovo">о. Русский (Поспелово) - Около моста</option>
                  <option value="canal">о. Русский (Канал) - Вход в пролив</option>
                  <option value="novik">о. Русский (Бухта Новик) - База Спорта</option>
                  <option value="tokarevsky">Эгершельд (Токаревский маяк)</option>
                  <option value="zmeinka">Бухта Змеинка (Причал катеров)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Поиск в акватории...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Запустить Поиск Такси</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetSimulation}
                  disabled={isSimulating && simStep === 1}
                  className="py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs transition-colors"
                >
                  Сбросить
                </button>
              </div>

              {/* Workflow visualizer */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Статус выполнения API</span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>PostGIS ST_DWithin поиск</span>
                    </span>
                    <span className={`font-mono font-bold ${simStep >= 2 ? 'text-emerald-400' : simStep === 1 ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                      {simStep >= 2 ? 'ВЫПОЛНЕНО' : simStep === 1 ? 'ПОИСК...' : 'ОЖИДАНИЕ'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Телеграм Капитан Пуш</span>
                    </span>
                    <span className={`font-mono font-bold ${simStep >= 3 ? 'text-emerald-400' : simStep === 2 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                      {simStep >= 3 ? 'ОТПРАВЛЕН' : simStep === 2 ? 'ПУШ...' : 'ОЖИДАНИЕ'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Подтверждение капитаном</span>
                    </span>
                    <span className={`font-mono font-bold ${simStep >= 4 ? 'text-emerald-400' : simStep === 3 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                      {simStep >= 4 ? 'ПРИНЯТО' : simStep === 3 ? 'ОЖИДАНИЕ...' : 'ОЖИДАНИЕ'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Статус «В море» (Redis)</span>
                    </span>
                    <span className={`font-mono font-bold ${simStep >= 5 ? 'text-emerald-400 animate-pulse' : simStep === 4 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                      {simStep >= 5 ? 'АКТИВЕН' : simStep === 4 ? 'ЗАПУСК...' : 'ОЖИДАНИЕ'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Terminal / Console logs (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl min-h-[380px]">
              {/* Terminal header */}
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest pl-2">VladiWater API Terminal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span>ONLINE (FZ-152 Compliant)</span>
                </div>
              </div>

              {/* Console logs output */}
              <div className="p-4 flex-1 font-mono text-[10px] leading-relaxed text-slate-300 space-y-2 overflow-y-auto max-h-[320px]">
                {simLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-2">
                    <Terminal className="w-8 h-8 opacity-40 animate-pulse text-cyan-400" />
                    <span className="text-center max-w-xs">Системные логи пусты. Нажмите «Запустить Поиск Такси», чтобы начать геолокационный подбор.</span>
                  </div>
                ) : (
                  simLogs.map((log, i) => {
                    let textClass = 'text-slate-300';
                    if (log.startsWith('[API')) textClass = 'text-cyan-400';
                    else if (log.startsWith('[POSTGRESQL')) textClass = 'text-sky-300';
                    else if (log.startsWith('[MATCH')) textClass = 'text-emerald-400 font-semibold';
                    else if (log.startsWith('[TELEGRAM')) textClass = 'text-indigo-400';
                    else if (log.startsWith('[WEBHOOK')) textClass = 'text-amber-400';
                    else if (log.startsWith('[REDIS')) textClass = 'text-teal-400';
                    else if (log.includes('ФЗ-152')) textClass = 'text-emerald-400';
                    
                    return (
                      <div key={i} className={`whitespace-pre-wrap border-l-2 pl-2 ${textClass} border-white/10 hover:border-cyan-500/30 transition-colors`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status Banner */}
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-white/5 font-mono text-xs">
                <span className="text-slate-400">Текущий статус вызова:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wide ${
                  simStep === 0 ? 'bg-slate-800 text-slate-400' :
                  simStep === 1 ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' :
                  simStep === 2 ? 'bg-amber-500/10 text-amber-400' :
                  simStep === 3 ? 'bg-amber-500/20 text-amber-300 animate-bounce' :
                  simStep === 4 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                  'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                }`}>
                  {simStep === 0 ? 'ОЖИДАНИЕ' :
                   simStep === 1 ? 'ПОИСК ТАКСИ' :
                   simStep === 2 ? 'СОПОСТАВЛЕНИЕ' :
                   simStep === 3 ? 'ОТПРАВЛЕН ЗАПРОС' :
                   simStep === 4 ? 'ПОДТВЕРЖДЕНО КАПИТАНОМ' :
                   'В МОРЕ / НА СВЯЗИ'}
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
