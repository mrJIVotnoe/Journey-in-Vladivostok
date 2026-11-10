# 🤖 AGENTS.md — System Architecture & Technical Specification for AI Agents & Auditors

Welcome to the **Journey In Vladivostok (JIV)** repository context guide. This document is designed for LLMs, AI coding assistants (Antigravity, Gemini, Claude, Cursor, GitHub Copilot), and technical auditors analyzing or modifying the codebase.

---

## 📐 1. High-Level Architecture Overview

JIV is built as a **Full-Stack Hybrid Single-Page Application (SPA)** with an integrated Node.js/Express backend server:

```
[ Browser / Client ] 
       │
       ├──► React 19 + TypeScript 5.7
       ├──► Tailwind CSS v4 + Motion
       ├──► TanStack Virtual (@tanstack/react-virtual) -> DOM Virtualization
       └──► Lucide Icons
       │
       ▼ (REST API / JSON Proxy & OAuth Callbacks)
[ Express.js Server (server.ts) ]
       │
       ├──► /api/ai/chat ───────────► Google Gemini API (@google/genai SDK)
       ├──► /api/auth/oauth/* ──────► OAuth 2.0 Engine (Yandex, Google, Apple, WeChat)
       ├──► /api/health ────────────► Health Checks & Telemetry
       └──► Static Asset Server ────► Production Single-File Bundle (dist/server.cjs)
```

---

## 📁 2. Key Directories and Components Breakdown

- `/server.ts` — Main Express entry point. Handles server-side API proxying (Gemini AI), OAuth 2.0 authorization flows, state token rotation with TTL cleanup, and static production serving.
- `/src/App.tsx` — Main application controller. Manages state for vessels, filtering, map selection, active views (`fleet`, `cabin`, `partner`, `reviews`, `security`), and time-of-day themes.
- `/src/components/VirtualizedVesselList.tsx` — High-performance virtualized vessel container using `@tanstack/react-virtual`. Dynamically calculates responsive grid/list dimensions and renders only visible items in the DOM.
- `/src/components/VesselCard.tsx` — Card component displaying vessel specs, pricing (hourly/daily in RUB/CNY), captain credentials, GIMS/MCHS safety verification badges, and booking triggers.
- `/src/components/FarpostListRow.tsx` — Compact list view row optimized for fast FarPost-style scanning.
- `/src/components/SecurityAndTrackingPanel.tsx` — Comprehensive security, authentication, and vessel telemetry dashboard. Implements Russian email domain verification (152-ФЗ/547-ФЗ), dual-mode email authentication (Magic OTP vs. Hashed Passwords), SMS/Flash Call verification, and OAuth status inspect modals.
- `/src/components/PassengerCabin.tsx` — Passenger portal for managing active bookings, viewing captain contact details, issuing reviews, and triggering emergency SOS protocols.
- `/src/components/PartnerBridge.tsx` — Owner/Partner portal for listing new vessels, uploading GIMS licenses/photos, and configuring advertising campaigns.
- `/src/components/FarvaterHeroSection.tsx` — Hero section with dynamic nautical statistics, Vladivostok weather integration, and search filters.
- `/crates/jiv-marine-core/` — High-performance Rust crate (`no_std` / Wasm compatible) providing zero-GC nautical geometry, CPA/TCPA marine radar collision avoidance vectors, GIMS safety models, and NMEA checksum verification.
- `/src/lib/rustMarineCore.ts` — High-efficiency TypeScript & WebAssembly bridge executing deterministic Rust nautical algorithms in the client browser with sub-millisecond latency.
- `/src/components/ArSpatialHudModal.tsx` — Augmented Reality Marine Visor (Spatial Glasses HUD) providing live holographic compass, bathymetric sonar soundings, radar reticles, and real-time target locking.
- `/src/lib/vesselLocalization.ts` — Multi-language engine supporting Russian (RU), English (EN), and Simplified Chinese (ZH).

---

## 🔒 3. Security & Compliance Enforcement

When working on this codebase, AI agents **MUST** preserve the following security guarantees:

1. **No Client-Side Secrets:** Gemini API keys (`GEMINI_API_KEY`) and OAuth secret keys must strictly reside on the server (`server.ts`). Never prefix server secrets with `VITE_`.
2. **PostMessage Origin Protection:** In `SecurityAndTrackingPanel.tsx`, the window listener for OAuth popup callbacks must strictly validate `event.origin === window.location.origin` to block cross-origin postMessage spoofing.
3. **Russian Email Domain Law Compliance (152-ФЗ / 547-ФЗ):** Russian email authorization requires restricting logins/registrations to validated domestic domains (`@yandex.ru`, `@mail.ru`, `@bk.ru`, `@inbox.ru`, `@rambler.ru`, `@яндекс.рф`).
4. **Password Hashing Standard:** Passwords are never stored in plain text. Always assume Argon2id or SHA-256 + Salt encryption standards.
5. **State Token Rotation:** Server-side OAuth state tokens in `oauthStateStore` must enforce a 10-minute TTL with periodic cleanup intervals to prevent memory leaks and replay attacks.

---

## 🚀 4. Performance Optimization Standards

- **DOM Virtualization:** Any component rendering large collections of vessels or logs must use `@tanstack/react-virtual` to keep DOM node counts under 500 items.
- **Lazy Execution:** SDKs and third-party API clients should initialize lazily inside handler functions rather than at top-level module load time to prevent startup crashes.

---

## 🛠️ 5. Build & Deployment Commands

- `npm run dev` — Starts dev server via `tsx server.ts` on port `3000`.
- `npm run build` — Builds frontend via Vite and bundles backend via `esbuild` to `dist/server.cjs`.
- `npm start` — Executes production CommonJS server via `node dist/server.cjs`.
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`).

---

*This document is maintained for AI Agent context alignment.*
