# -ANGULAR-TaskManager
TaskManager — Kanban (Angular 18 + TS) z Drag&amp;Drop (CDK), offline-first (IndexedDB/Dexie), i18n (pl/en), PWA w produkcji i prostą kolaboracją (BroadcastChannel / opcjonalny WebSocket).

## Demo
- (tu wstaw link do hostingu, np. GitHub Pages / Vercel)
- Zrzuty ekranu w `./assets/screens` (opcjonalnie)

## Najważniejsze funkcje
- Kolumny i karty z **przeciąganiem** między kolumnami i w obrębie kolumn
- **Persist** w IndexedDB (Dexie) – działa offline i po odświeżeniu
- **i18n** (pl/en) z przełącznikiem języka
- **PWA** w buildzie produkcyjnym
- **Live-collab (local)** między kartami przeglądarki (BroadcastChannel)
- A11y, responsywność, prosty dark UI

## Stack
- Angular 18 (Standalone, Signals), Angular CDK Drag&Drop
- Dexie (IndexedDB), RxJS
- @ngx-translate/core
- Zod (walidacja patchy)
- Service Worker (Angular PWA) — **tylko produkcja**

## Szybki start (dev)
```bash
npm install
npm start           # http://localhost:4200
