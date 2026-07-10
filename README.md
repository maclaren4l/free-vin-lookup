# VIN Decoder

A modern web app that decodes any vehicle VIN into full specifications, standard &
optional equipment, safety recalls, NCAP crash-test ratings, and a representative photo —
powered **entirely by free, open data** with **no API keys and no paywalls**.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8) ![License: MIT](https://img.shields.io/badge/License-MIT-green)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmaclaren4l%2Ffree-vin-lookup)

> One click deploys a copy to Vercel — no API keys or environment variables required.

## Features

- **Full spec decode** — engine, drivetrain, body, dimensions, plant of manufacture, and more.
- **Standard & safety equipment** — airbags, ABS/ESC/TPMS, and ADAS features.
- **Available options** — equipment NHTSA lists as *optional* (not standard), broken out as tiles.
- **Safety recalls** — open manufacturer recalls with summary, consequence, and remedy.
- **NHTSA safety ratings** — official NCAP 5-star crash-test results.
- **Representative photo** — closest-match image from Wikimedia Commons, with attribution.
- **Per-brand theming** — the UI re-colors to each make (Polestar, Ford, Tesla, BMW, …).
- Sample VINs, recent-search history, live validation with VIN check-digit verification.

## Honest data note

The only genuinely free, open, no-key VIN source is the **NHTSA vPIC API**. It decodes
trim-level *standard/optional* equipment from manufacturers' Part 565 filings — but **true
per-VIN factory build-sheet / "as-built" option data is proprietary and not available for
free.** Every equipment and options section is labeled accordingly. No fabricated data.

## Data sources (all free, no key)

| Data | Source |
| --- | --- |
| VIN specifications | [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/) |
| Safety recalls | [NHTSA Recalls API](https://www.nhtsa.gov/nhtsa-datasets-and-apis) |
| Crash-test ratings | [NHTSA NCAP Safety Ratings API](https://api.nhtsa.gov/SafetyRatings) |
| Vehicle imagery | [Wikimedia Commons](https://commons.wikimedia.org/) |

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · lucide-react.
External calls are proxied through server route handlers (`app/api/*`), so the browser
never makes cross-origin requests and the payloads are normalized server-side.

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

No environment variables or API keys are required.

## Project structure

```
app/
  page.tsx              # hero + search + results orchestration
  api/decode|image|recalls|safety/route.ts   # server proxies to free APIs
components/
  vin-search.tsx        # input, validation, sample chips, recent searches
  results/              # result shell, spec sections, options tiles, recalls, ratings, image
lib/
  vin.ts                # 17-char + check-digit validation
  nhtsa.ts, normalize.ts, recalls.ts, safety.ts, image.ts, brands.ts
```

## License

MIT
