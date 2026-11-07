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

## Mission-led demo

The local demo now offers a geographic mission planner, 12 departure/destination airports, range + maximum-seat screening, cabin/price/range ordering, comparison summaries, difference filtering, and CSV shortlist export. There are no live bookings, charter quotes, availability feeds, or operational suitability assessments. Route distance uses a great-circle calculation; maximum seating and published range are independent guide values and do not establish payload/range performance.

Geographic land data: Natural Earth, public domain, `ne_110m_land.geojson` from https://github.com/nvkelso/natural-earth-vector. Airport coordinates: OurAirports via https://github.com/datasets/airport-codes, normalized to [longitude, latitude].

Mission calculation tests: `node --experimental-strip-types --test tests/mission.test.mjs` (Node 22.6+). These check coordinate ordering, representative transatlantic and transpacific distances, symmetry, and missing capacity handling.

## Presentation sequence

1. Start on Performance with all 33 aircraft and range sorting. Move over a card to show the restrained tilt; open its details.
2. Switch to Interior to show the cabin photography and dimensions.
3. Open Destination. Choose New York → London for 8 passengers. Drag the globe, then tear the route ticket (or use Show aircraft) to reveal 21 matches.
4. Add two or three aircraft to comparison. Switch Exterior/Cabin, use Differences only, and export the shortlist.
5. Remove the route or use Reset to return to the full collection.

## Final demo check — 6 November 2026

- Production build and TypeScript validation passed; all 6 calculation/filter tests passed.
- All 33 exterior and 33 interior images loaded in the local browser review.
- Verified search, saved-aircraft toggles and empty state, combined filters, range/cruise endpoints, Reset/Done, detail dismissal, shortlist capacity, comparison photos/differences, and CSV export contents.
- Destination: airport changes, swapping, passenger updates, no-match disabled actions, route application, ticket drag/cancel/keyboard activation checked across the finishing passes.
- Responsive checks at 1600 × 1000, 1280 × 720, 390 × 844, and 320 × 740. Comparison scrolls inside its table; the page has no horizontal overflow.
- Final refinements: whitespace-tolerant search; view/filter changes start at the top of a single scrolling canvas; mobile details show the active view’s image without overlapping photographs; comparison preserves exact guide prices and labels guide model years explicitly.
- Uses historical supplied guide data and externally hosted images. This is a navigator demo, with no booking or live-availability service.
