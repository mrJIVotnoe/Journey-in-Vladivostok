//! # JIV Marine Core Engine (Rust)
//!
//! High-performance, zero-garbage-collection nautical computation crate for the
//! Journey In Vladivostok (JIV) fleet management platform.
//!
//! Provides:
//! - Sub-millisecond Haversine Great-Circle distance and navigational bearing
//! - Marine Radar Collision Avoidance: Closest Point of Approach (CPA) & Time to CPA (TCPA)
//! - GIMS (ГИМС МЧС РФ) Marine Safety Envelope & Beaufort wave limit calculations
//! - Fuel consumption and speed vector modeling across Peter the Great Gulf waters
//! - NMEA 0183 / AIS string validation and checksum verification

#![no_std]
extern crate core;

use core::f64::consts::PI;

/// Earth's mean radius in meters (WGS84 spherical approximation)
pub const EARTH_RADIUS_METERS: f64 = 6_371_000.0;
/// Nautical Mile in meters
pub const NAUTICAL_MILE_METERS: f64 = 1_852.0;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct GeoPoint {
    pub lat: f64,
    pub lon: f64,
}

impl GeoPoint {
    #[inline(always)]
    pub const fn new(lat: f64, lon: f64) -> Self {
        Self { lat, lon }
    }

    #[inline(always)]
    pub fn to_radians(self) -> (f64, f64) {
        (self.lat * PI / 180.0, self.lon * PI / 180.0)
    }
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
    pub risk_level: CollisionRiskLevel,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CollisionRiskLevel {
    Safe,
    Caution,
    Warning,
    CriticalImminent,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct GimsSafetyStatus {
    pub is_permitted: bool,
    pub max_allowed_wave_meters: f64,
    pub safety_margin_pct: f64,
    pub warning_code: u32,
}

// ----------------------------------------------------------------------------
// 1. Haversine & Navigational Bearing
// ----------------------------------------------------------------------------

/// Calculates great circle distance between two points on Earth in meters.
#[inline]
pub fn haversine_distance_meters(p1: GeoPoint, p2: GeoPoint) -> f64 {
    let (lat1_rad, lon1_rad) = p1.to_radians();
    let (lat2_rad, lon2_rad) = p2.to_radians();

    let d_lat = lat2_rad - lat1_rad;
    let d_lon = lon2_rad - lon1_rad;

    // sin^2(d_lat / 2) + cos(lat1) * cos(lat2) * sin^2(d_lon / 2)
    let a = (d_lat * 0.5).sin().powi(2)
        + lat1_rad.cos() * lat2_rad.cos() * (d_lon * 0.5).sin().powi(2);

    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    EARTH_RADIUS_METERS * c
}

/// Computes forward azimuth (true bearing) from point 1 to point 2 in degrees [0..360).
#[inline]
pub fn initial_bearing_degrees(p1: GeoPoint, p2: GeoPoint) -> f64 {
    let (lat1, lon1) = p1.to_radians();
    let (lat2, lon2) = p2.to_radians();
    let d_lon = lon2 - lon1;

    let y = d_lon.sin() * lat2.cos();
    let x = lat1.cos() * lat2.sin() - lat1.sin() * lat2.cos() * d_lon.cos();

    let initial_rad = y.atan2(x);
    let mut initial_deg = initial_rad * 180.0 / PI;
    if initial_deg < 0.0 {
        initial_deg += 360.0;
    }
    initial_deg
}

// ----------------------------------------------------------------------------
// 2. Marine Radar Collision Avoidance (CPA / TCPA)
// ----------------------------------------------------------------------------

/// Calculates Closest Point of Approach (CPA) and Time to CPA (TCPA) in seconds.
/// Critical for narrow straits like Eastern Bosphorus and Golden Horn Bay.
pub fn calculate_cpa_tcpa(own: VesselVector, target: VesselVector) -> CollisionRiskAssessment {
    let current_distance = haversine_distance_meters(own.position, target.position);

    // Convert speed in knots to meters per second (1 knot = 0.514444 m/s)
    let own_speed_mps = own.speed_knots * 0.51444444444;
    let target_speed_mps = target.speed_knots * 0.51444444444;

    let own_rad = own.course_degrees * PI / 180.0;
    let target_rad = target.course_degrees * PI / 180.0;

    // Velocity vectors in Cartesian approximation (X = East, Y = North)
    let v_own_x = own_speed_mps * own_rad.sin();
    let v_own_y = own_speed_mps * own_rad.cos();

    let v_target_x = target_speed_mps * target_rad.sin();
    let v_target_y = target_speed_mps * target_rad.cos();

    // Relative velocity
    let v_rel_x = v_target_x - v_own_x;
    let v_rel_y = v_target_y - v_own_y;

    // Relative position in meters (approx flat tangent plane for local collision detection)
    let d_lat = (target.position.lat - own.position.lat) * PI / 180.0;
    let d_lon = (target.position.lon - own.position.lon) * PI / 180.0;
    let mean_lat = (own.position.lat + target.position.lat) * 0.5 * PI / 180.0;

    let r_x = EARTH_RADIUS_METERS * d_lon * mean_lat.cos();
    let r_y = EARTH_RADIUS_METERS * d_lat;

    let v_rel_sq = v_rel_x * v_rel_x + v_rel_y * v_rel_y;

    if v_rel_sq < 1e-4 {
        // Parallel courses or zero relative motion
        return CollisionRiskAssessment {
            distance_meters: current_distance,
            cpa_distance_meters: current_distance,
            tcpa_seconds: 0.0,
            risk_level: CollisionRiskLevel::Safe,
        };
    }

    // Dot product: r . v_rel
    let dot = r_x * v_rel_x + r_y * v_rel_y;
    let tcpa = -dot / v_rel_sq;

    let cpa_distance = if tcpa <= 0.0 {
        // Vessels are opening / moving away from each other
        current_distance
    } else {
        // Position at CPA
        let cpa_x = r_x + v_rel_x * tcpa;
        let cpa_y = r_y + v_rel_y * tcpa;
        (cpa_x * cpa_x + cpa_y * cpa_y).sqrt()
    };

    let risk_level = if tcpa > 0.0 && tcpa < 300.0 && cpa_distance < 150.0 {
        CollisionRiskLevel::CriticalImminent
    } else if tcpa > 0.0 && tcpa < 600.0 && cpa_distance < 400.0 {
        CollisionRiskLevel::Warning
    } else if tcpa > 0.0 && tcpa < 1200.0 && cpa_distance < 800.0 {
        CollisionRiskLevel::Caution
    } else {
        CollisionRiskLevel::Safe
    };

    CollisionRiskAssessment {
        distance_meters: current_distance,
        cpa_distance_meters: cpa_distance,
        tcpa_seconds: if tcpa > 0.0 { tcpa } else { 0.0 },
        risk_level,
    }
}

// ----------------------------------------------------------------------------
// 3. GIMS / MCHS Safety Limits
// ----------------------------------------------------------------------------

/// Evaluates whether current Vladivostok wave & wind conditions are within vessel safety limit.
#[inline]
pub fn check_gims_wave_compliance(
    vessel_length_meters: f64,
    wave_height_meters: f64,
    wind_speed_ms: f64,
) -> GimsSafetyStatus {
    // Standard GIMS small craft classification:
    // Under 6m: max wave 0.75m, wind <= 10 m/s
    // 6m - 12m: max wave 1.25m, wind <= 14 m/s
    // 12m - 20m: max wave 2.0m, wind <= 18 m/s
    // 20m+: max wave 3.0m, wind <= 22 m/s
    let (max_wave, max_wind) = if vessel_length_meters < 6.0 {
        (0.75, 10.0)
    } else if vessel_length_meters < 12.0 {
        (1.25, 14.0)
    } else if vessel_length_meters < 20.0 {
        (2.0, 18.0)
    } else {
        (3.0, 22.0)
    };

    let wave_ok = wave_height_meters <= max_wave;
    let wind_ok = wind_speed_ms <= max_wind;
    let is_permitted = wave_ok && wind_ok;

    let margin = if max_wave > 0.0 {
        ((max_wave - wave_height_meters) / max_wave * 100.0).max(-100.0)
    } else {
        0.0
    };

    let warning_code = if !wave_ok && !wind_ok {
        3 // Wave and Wind exceeded
    } else if !wave_ok {
        1 // Wave height exceeded
    } else if !wind_ok {
        2 // Wind speed exceeded
    } else {
        0 // All nominal
    };

    GimsSafetyStatus {
        is_permitted,
        max_allowed_wave_meters: max_wave,
        safety_margin_pct: margin,
        warning_code,
    }
}

// ----------------------------------------------------------------------------
// 4. Marine Diesel Consumption & Speed ETA
// ----------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct VoyagePlan {
    pub distance_nm: f64,
    pub eta_minutes: f64,
    pub estimated_fuel_liters: f64,
}

pub fn calculate_voyage_metrics(
    distance_meters: f64,
    cruise_speed_knots: f64,
    engine_power_hp: f64,
    is_rough_sea: bool,
) -> VoyagePlan {
    let distance_nm = distance_meters / NAUTICAL_MILE_METERS;
    let effective_speed = if is_rough_sea {
        (cruise_speed_knots * 0.82).max(4.0)
    } else {
        cruise_speed_knots.max(4.0)
    };

    let hours = distance_nm / effective_speed;
    let eta_minutes = hours * 60.0;

    // Approximate marine diesel consumption: ~0.18 liters per HP-hour at 65% load
    let consumption_per_hour = engine_power_hp * 0.18 * 0.65;
    let total_fuel = consumption_per_hour * hours * if is_rough_sea { 1.25 } else { 1.0 };

    VoyagePlan {
        distance_nm,
        eta_minutes,
        estimated_fuel_liters: total_fuel,
    }
}

// ----------------------------------------------------------------------------
// 5. NMEA 0183 Checksum Validation
// ----------------------------------------------------------------------------

/// Validates NMEA-0183 checksum (XOR of bytes between '$' and '*').
pub fn verify_nmea_checksum(sentence: &str) -> bool {
    let bytes = sentence.as_bytes();
    if bytes.is_empty() || bytes[0] != b'$' {
        return false;
    }

    let mut star_idx = None;
    for (i, &b) in bytes.iter().enumerate() {
        if b == b'*' {
            star_idx = Some(i);
            break;
        }
    }

    let star_idx = match star_idx {
        Some(idx) if idx + 2 < bytes.len() => idx,
        _ => return false,
    };

    let mut checksum: u8 = 0;
    for &b in &bytes[1..star_idx] {
        checksum ^= b;
    }

    // Parse the two hex characters following '*'
    let hex_slice = match core::str::from_utf8(&bytes[star_idx + 1..star_idx + 3]) {
        Ok(s) => s,
        Err(_) => return false,
    };

    match u8::from_str_radix(hex_slice, 16) {
        Ok(expected) => checksum == expected,
        Err(_) => false,
    }
}
