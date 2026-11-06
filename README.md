# Elite Wings Jet Navigator

A Next.js App Router application with Performance, Interior, and Compare views. Includes 33 aircraft, combined search/filter controls, sorting, detail dialogs, and a three-aircraft comparison. Saved aircraft and shortlist selections persist locally in the visitor's browser.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` generates the static production application in `out/`. Deploy `out/` with a static host; the Sites deployment is owner-private through the hosting access layer. A standalone local/static copy does not provide its own authentication.

## Sources and units

- `data/aircraft.json` is extracted from **Sheet3** of the user-supplied `Bizjets_Guide_V01 (1).xlsx` (33 aircraft). Textual numeric values were normalized for filtering; missing specifications remain missing. These are historical guide values, not verified current manufacturer specifications or offers.
- Remote exterior and interior image URLs come from https://elite-wings.com/bizjets-navigator/. The e-guide is linked at https://elite-wings.com/allaircraft/. Images stay hosted on Elite Wings and remain subject to their availability and respective owners' rights. Some photographs depict a later model-family variant (notably CJ3/CJ4); imagery is explicitly illustrative.
- Prices: USD. Range: nautical miles. Speeds: ktas. Runway distances/altitude: feet. Cabin volume/baggage: cubic feet. Raw numeric cabin height/width/length: inches; readable dimension strings come from the guide.
- Missing values are never substituted from another aircraft. Compact card prices are rounded; the comparison table retains exact supplied prices.

## Validation

Production compilation and TypeScript checks pass. Browser smoke checks cover search, combined filter empty states, Interior, saved aircraft, details, and comparison. Responsive layouts are checked at desktop/tablet and mobile widths.
