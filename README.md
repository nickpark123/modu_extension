# 모두 (Modu)

Korean restaurant discovery — a personal trust layer across Naver Map, KakaoMap, Google Maps, and more.

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

```bash
npm install
```

## Development

Watch mode — rebuilds to `dist/` on every save:

```bash
npm run dev
```

## Production build

```bash
npm run build
```

Output goes to `dist/`.

## Type check

```bash
npm run type-check
```

## Loading the extension in Chrome

1. Run `npm run build` (or `npm run dev` for watch mode).
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `dist/` folder inside this project.
6. The Modu extension icon will appear in the toolbar.

After any code change during development (`npm run dev` is running), click the **refresh icon** on the extension card in `chrome://extensions` to reload it.

## Project structure

```
src/
  popup/        # Extension popup (React)
  content/      # Content script (injected into pages)
  background/   # Service worker
  shared/       # Constants and utilities shared across contexts
  types/        # TypeScript type definitions
public/
  manifest.json # Chrome Extension Manifest V3
  icons/        # Extension icons (add icon16.png, icon48.png, icon128.png)
```

## Notes

- Icons (`public/icons/icon16.png`, `icon48.png`, `icon128.png`) are not included. Add PNG files there and uncomment the `icons` field in `public/manifest.json` before publishing.
- This extension does **not** collect, store, or republish public reviews, ratings, or user-generated content from any platform.
