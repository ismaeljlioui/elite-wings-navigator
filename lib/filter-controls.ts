export const RANGE_MAX = 8000;
export const RANGE_STEP = 250;
export const clampRange = (value: number) => Math.min(RANGE_MAX, Math.max(0, Number.isFinite(value) ? value : 0));
export const snapRange = (value: number) => clampRange(Math.round(value / RANGE_STEP) * RANGE_STEP);
export function rangeKeyTarget(key: string, current: number): number | null {
  const deltas: Record<string, number> = {ArrowRight:250, ArrowUp:250, ArrowLeft:-250, ArrowDown:-250, PageUp:1000, PageDown:-1000};
  return key === 'Home' ? 0 : key === 'End' ? RANGE_MAX : key in deltas ? snapRange(current + deltas[key]) : null;
}
export const PRICE_GROUPS = ['Light jets', 'Midsize jets', 'Large cabin', 'Long range'];
type PricedJet = {base_price:number|null; range:number; business_jet_category:string};
export function buildPriceBins(jets: PricedJet[]) {
  const bins = Array.from({length:20}, (_, i) => ({min:i*5, max:(i+1)*5, values:[0,0,0,0], prices:[] as number[]}));
  for (const jet of jets) {
    if (jet.base_price == null || !Number.isFinite(jet.base_price) || jet.base_price < 0 || jet.base_price > 100_000_000) continue;
    const price = jet.base_price / 1_000_000;
    const bin = bins[Math.min(19,Math.floor(price/5))];
    const group = jet.range >= 5000 ? 3 : jet.business_jet_category === 'Large' ? 2 : /midsize/i.test(jet.business_jet_category) ? 1 : 0;
    bin.values[group]++;
    bin.prices.push(price);
  }
  return bins;
}
