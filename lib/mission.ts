export type Airport = {
  id: string;
  city: string;
  name: string;
  code: string;
  coordinates: number[];
};
export type Mission = {
  from: Airport;
  to: Airport;
  passengers: number;
  distance: number;
};
/** Great-circle distance in nautical miles. Earth mean radius: 3440.065 nm. */
export function distanceNm(a: number[], b: number[]): number {
  const rad = Math.PI / 180;
  const [lon1, lat1] = a.map((v) => v * rad);
  const [lon2, lat2] = b.map((v) => v * rad);
  const h =
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  return Math.round(
    3440.065 *
      2 *
      Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h))),
  );
}
export function meetsMission(
  j: { range: number; max_passengers: number | null },
  m: Mission,
): boolean {
  return (
    j.range >= m.distance &&
    j.max_passengers !== null &&
    j.max_passengers >= m.passengers
  );
}
