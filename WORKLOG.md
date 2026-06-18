# Modu — Work Log

This file tracks what has been built, why decisions were made, and what's next.
Updated after every prompt or meaningful change.

---

## Session 1 — Project Skeleton

**Prompt:** Create the basic project skeleton for Modu (Chrome extension).

### What was built

| File / Dir | Purpose |
|---|---|
| `package.json` | React 18, TypeScript 5, Vite 5, `@types/chrome` |
| `public/manifest.json` | Manifest V3 — popup, content script, service worker |
| `tsconfig.json` | Strict TS, bundler module resolution, react-jsx |
| `vite.config.ts` | Three rollup entry points: popup HTML, content script, background SW |
| `src/popup/` | React popup shell (`App.tsx`, `main.tsx`) |
| `src/content/index.ts` | Placeholder content script |
| `src/background/index.ts` | Placeholder service worker |
| `src/shared/index.ts` | Shared constants (`EXTENSION_NAME`, `EXTENSION_NAME_KO`) |
| `src/types/index.ts` | Core types: `ModuEntry`, `Platform` |
| `popup.html` | Popup HTML entry at project root |
| `README.md` | Install / build / load instructions |

### Key decisions

- **Vite over webpack** — faster DX, simpler config for a small extension.
- **No `@crxjs/vite-plugin`** — that plugin is in beta and has stability issues. Instead, three explicit rollup `input` entries with a custom `entryFileNames` rule to land `content.js` and `background.js` at the dist root (required by `manifest.json` path refs).
- **`popup.html` at project root** — Vite preserves HTML output paths relative to `root`. Placing `popup.html` at the project root ensures Vite outputs `dist/popup.html`, which is what `manifest.json`'s `action.default_popup` references.
- **`manifest.json` in `public/`** — Vite copies `public/` to `dist/` as-is, so the manifest lands at `dist/manifest.json` with zero extra config.
- **No scraping policy enforced in types** — `ModuEntry` holds only URL + user-entered data; no review text, rating counts, or usernames.

### Build output

```
dist/
  manifest.json
  popup.html
  content.js
  background.js
  assets/popup-[hash].js
```

---

## Session 2 — Popup UI (static)

**Prompt:** Build the first popup UI (no real functionality yet).

### What was built

| File | Purpose |
|---|---|
| `src/popup/App.tsx` | Full popup layout — header, action buttons, placeholder sections |
| `src/popup/App.css` | Compact, extension-friendly stylesheet |

### UI structure

```
┌─────────────────────────────────────┐
│  Modu  모두                          │
│  Your personal restaurant trust…    │
├─────────────────────────────────────┤
│ [Detect Restaurant] [Add] [Saved]   │
├─────────────────────────────────────┤
│  CURRENT PAGE         — placeholder │
│  DETECTED RESTAURANT  — placeholder │
│  MY MODU RATING       — placeholder │
│  PUBLIC SOURCES       — placeholder │
└─────────────────────────────────────┘
```

### Key decisions

- **Plain CSS (not Tailwind or CSS Modules)** — single component, framework weight not justified yet.
- **Buttons are non-functional** — no `onClick` wired; strictly UI-only milestone.
- **`SECTIONS` constant array** — avoids repeated JSX; easy to populate with real data later.

---

## Session 3 — Manual Add Flow + Storage

**Prompt:** Before detection, build a reliable manual-add flow so the extension is usable even when detection fails.

### What was built

| File | Purpose |
|---|---|
| `src/types/index.ts` | Rewrote: `Restaurant`, `UserRestaurantEntry`, `WouldGoAgain`, `Tag`, `ALL_TAGS` |
| `src/shared/platform.ts` | `detectPlatform(url)` — maps hostname to `Platform`; `PLATFORM_LABELS` map |
| `src/shared/storage.ts` | `saveEntry()`, `getEntries()`, `makeCanonicalKey()` over `chrome.storage.local` |
| `src/popup/App.tsx` | Rewritten as a 3-state machine: `home → manual-form → rating-form` |
| `src/popup/HomeView.tsx` | Home screen extracted from old `App.tsx`; "Add Manually" now wired |
| `src/popup/ManualFormView.tsx` | Form: name (required), address, URL, platform selector; prefills from active tab |
| `src/popup/RatingFormView.tsx` | Form: star rating 1–5, would-go-again, tag pills, optional note; calls `saveEntry` |
| `src/popup/App.css` | Extended with all new form, star, tag, and button styles |
| `public/manifest.json` | Added `"storage"` and `"activeTab"` permissions |

### Data model

```
UserRestaurantEntry {
  id            — makeId() (time + random, no UUID dependency)
  restaurant {
    canonicalKey  — norm(name) or norm(name)||norm(address)
    name, address?, platform?, sourceUrl?
  }
  rating        — 1–5 integer
  wouldGoAgain  — 'yes' | 'no' | 'unsure'
  tags          — subset of ALL_TAGS
  note          — string (empty if not provided)
  savedAt       — Date.now()
}
```

### View flow

```
Home
  └─ "Add Manually" click
       ManualFormView  (prefilled with active tab URL + detected platform)
         └─ "Continue →" (name required)
              RatingFormView  (rating + wouldGoAgain required to unlock Save)
                └─ "Save" → chrome.storage.local → back to Home
```

### Key decisions

- **`activeTab` permission (not `tabs`)** — `tabs` triggers a scary install warning ("Read your browsing history"). `activeTab` grants the same URL access in a popup context with no warning. If we need background tab reading later, we'll add `tabs` at that point.
- **`canonicalKey` is intentionally loose** — name-only key when no address. Duplicates are allowed for now. Aggressive auto-merge is deferred until we have more data to inform that logic.
- **`platform === 'unknown'` stored as `undefined`** — avoids polluting the Restaurant record with a meaningless "unknown" field.
- **No UUID library** — `Date.now().toString(36) + Math.random().toString(36)` is sufficient for local IDs. Adds no dependency.
- **Rating + wouldGoAgain are required; tags and note are optional** — minimum viable signal. A user should never be forced to write text to save a memory.
- **Star hover preview** — `hovered` state gives immediate visual feedback before committing a rating click.
- **`max-height: 580px; overflow-y: auto` on `.view`** — Chrome popup height is uncapped but tall popups feel broken. Scrollable view keeps layout predictable across both forms.
- **Save button disabled until both required fields are filled** — avoids saving incomplete entries; no toast/error needed since the visual state is clear.

### What is intentionally missing

- No detection logic — "Detect Restaurant" button is still a no-op.
- No "Saved Places" view — still a no-op button.
- No edit/delete of saved entries.
- No deduplication.

---

## Session 4 — Restaurant Detection (content script → popup)

**Prompt:** Conservative restaurant/page detection for Naver Map, KakaoMap, and Google Maps.

### What was built

| File | Purpose |
|---|---|
| `src/types/index.ts` | Added `Confidence`, `DetectionResult` |
| `src/detection/detectNaver.ts` | Naver Map / Naver Place detection |
| `src/detection/detectKakao.ts` | KakaoMap detection |
| `src/detection/detectGoogle.ts` | Google Maps detection |
| `src/detection/detectUnknown.ts` | Fallback for unsupported pages |
| `src/detection/index.ts` | `runDetection()` — routes to correct detector by hostname |
| `src/content/index.ts` | Message listener: `MODU_DETECT` → `runDetection()` → `sendResponse` |
| `src/popup/DetectionView.tsx` | New view: loading → result + editable confirm form |
| `src/popup/App.tsx` | Added `'detection'` view state + `activeTabId`, `manualPrefill` state |
| `src/popup/HomeView.tsx` | Wired `onDetect` prop; "Detect Restaurant" now functional |
| `src/popup/ManualFormView.tsx` | Added `initialName` + `initialAddress` props for detection prefill |
| `src/popup/App.css` | Loading spinner, confidence badge colors, detection metadata rows, ghost button |

### Detection signals used (conservative)

| Signal | Used for |
|---|---|
| `window.location.hostname` | Classify platform |
| `window.location.pathname` | Identify place page vs. search page |
| `document.title` | Primary name extraction (platform-specific regex strip) |
| `meta[property="og:title"]` | Secondary name fallback |

No DOM selectors for review lists, ratings, comments, or user content.

### Name extraction patterns

| Platform | Title format | Strip pattern |
|---|---|---|
| Naver Map | `"장소명 : 네이버지도"` | `/^(.+?)\s*:\s*네이버\s*지도$/` |
| KakaoMap | `"장소명 - 카카오맵"` | `/^(.+?)\s*[-–]\s*카카오맵$/` |
| Google Maps | `"Name - Google Maps"` | `/^(.+?)\s*[-·]\s*Google Maps$/i` |

### Confidence levels

| Level | Condition |
|---|---|
| `high` | Known place-page URL pattern + name successfully extracted |
| `medium` | Place URL but no name, or name extracted from non-place URL |
| `low` | Platform hostname recognized but no place URL / no name |
| `none` | Unrecognized hostname (unknown page) |

### Full flow after this session

```
Home
  ├─ "Detect Restaurant" click
  │    DetectionView
  │      • sends MODU_DETECT → content script
  │      • shows loading spinner
  │      • shows DetectionResult: confidence badge + editable name/address
  │      • empty states: error / low-confidence message / not-supported message
  │      └─ "Confirm & Continue" → RatingFormView → Save → Home
  │      └─ "Add Manually Instead" → ManualFormView (prefilled) → RatingFormView → Save → Home
  └─ "Add Manually" click
       ManualFormView (prefilled from active tab URL/platform)
         └─ "Continue →" → RatingFormView → Save → Home
```

### Key decisions

- **Title-only extraction, no live DOM selectors** — Naver/KakaoMap are SPAs that update the DOM dynamically. Title and OG meta are the only signals that are reliably set for any page load. Parsing class-named elements would break on every frontend update.
- **`runDetection()` is pure synchronous** — all signals are available at message-receive time. No async DOM polling, no MutationObserver. Simple and predictable.
- **`DetectionView` owns the message-send** — instead of having `App.tsx` send the message and pass the result down, `DetectionView` fires on mount. This keeps the detection lifecycle inside the component that displays it and avoids stale-result risk if the user re-opens detection.
- **"Add Manually Instead" carries prefill from detection** — even on a failed or low-confidence detect, the URL and platform are known. ManualFormView receives these so the user doesn't have to re-enter what we already know.
- **`manualPrefill` state in `App.tsx`** — allows `DetectionView → ManualFormView` to carry detected name/address while keeping the two views independently navigable.
- **Ghost button for secondary action** — "Add Manually Instead" is subordinate to "Confirm & Continue." Visual hierarchy communicates this without hiding the option.

### What is intentionally missing

- "Saved Places" view — still a no-op button.
- Edit / delete saved entries.
- Home screen live population ("Current Page", "Detected Restaurant" sections still placeholders).
- Deduplication.

---

## Backlog / next up

- [ ] "Saved Places" list view — reads from `chrome.storage.local`, shows all saved entries
- [ ] Populate home "Current Page" section with active tab URL + detected platform on open
- [ ] Edit / delete saved entries
- [ ] Real icon assets (16px, 48px, 128px PNG)
- [ ] Deduplication / merge when same restaurant added twice
