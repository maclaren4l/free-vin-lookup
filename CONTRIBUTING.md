# Contributing

Thanks for considering a contribution to Free VIN Lookup.

## Getting started

```bash
git clone https://github.com/maclaren4l/free-vin-lookup.git
cd free-vin-lookup
npm install
npm run dev
# open http://localhost:3000
```

No environment variables or API keys are required — every data source is free and keyless.

## Before opening a PR

- `npm run build` should complete without TypeScript errors.
- Test at least one VIN decode end-to-end in the browser; this app has no automated test suite yet, so manual verification is the safety net.
- Keep new dependencies to a minimum — the project intentionally stays lightweight.

## The one rule that matters most

This project's core promise is **honest, free, keyless data**. If you add a feature:

- Don't fabricate or approximate data (e.g. don't synthesize a fake factory build sheet). If a data point isn't available from a free source, either omit it or clearly label it as unavailable/approximate.
- If you introduce a data source that requires an API key or has usage limits, gate it behind an opt-in and don't make it required for the app to work.

## Reporting bugs / requesting features

Open a GitHub issue with as much detail as you can — a VIN that reproduces the problem is the most useful thing you can include for decode-related bugs.
