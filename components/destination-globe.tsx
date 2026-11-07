"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import createGlobe, { type Globe } from "cobe";
import { geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Airport } from "@/lib/mission";
import land from "@/data/land.json";
import styles from "./destination.module.css";

// Adapted from the supplied GlobeCdn: monochrome COBE, route arcs and draggable rotation.
export function DestinationGlobe({ from, to }: { from: Airport; to: Airport }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const globe = useRef<Globe | null>(null);
  const middle = geoInterpolate(from.coordinates as [number, number], to.coordinates as [number, number])(.5);
  const initial = { phi: Math.PI * 1.5 - middle[0] * Math.PI / 180, theta: middle[1] * Math.PI / 180 };
  const view = useRef(initial);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [rotating, setRotating] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [reduced, setReduced] = useState(false);
  const paint = () => globe.current?.update(view.current);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => { setReduced(preference.matches); if (preference.matches) setRotating(false); };
    motion(); preference.addEventListener("change", motion);
    const failed = () => { setFallback(true); setRotating(false); };
    el.addEventListener("webglcontextlost", failed);
    let warmup = 0;
    const resize = () => {
      const size = el.clientWidth;
      if (!size) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (globe.current) { globe.current.update({ width: size * dpr, height: size * dpr }); return; }
      try {
        if (!el.getContext("webgl2") && !el.getContext("webgl")) { failed(); return; }
        globe.current = createGlobe(el, {
          devicePixelRatio: dpr, width: size * dpr, height: size * dpr,
          ...view.current, dark: 0, diffuse: 1.5, mapSamples: 16000, mapBrightness: 10,
          baseColor: [1, 1, 1], markerColor: [0, 0, 0], glowColor: [.96, .96, .95],
          markerElevation: .02, opacity: .7,
          markers: [from, to].map((a, i) => ({ location: [a.coordinates[1], a.coordinates[0]], size: .025, id: `destination-${i}` })),
          arcs: [{ from: [from.coordinates[1], from.coordinates[0]], to: [to.coordinates[1], to.coordinates[0]] }],
          arcColor: [0, 0, 0], arcWidth: .6, arcHeight: .25,
        });
        // COBE loads its embedded map texture asynchronously; repaint while it decodes.
        const start = performance.now();
        const reveal = () => { globe.current?.update(view.current); if (performance.now() - start < 1200) warmup = requestAnimationFrame(reveal); };
        warmup = requestAnimationFrame(reveal);
      } catch { failed(); }
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    return () => { cancelAnimationFrame(warmup); observer.disconnect(); preference.removeEventListener("change", motion); el.removeEventListener("webglcontextlost", failed); globe.current?.destroy(); globe.current = null; };
  }, [from, to]);

  useEffect(() => {
    if (!rotating || reduced || fallback) return;
    let frame = 0, previous = 0;
    const tick = (time: number) => {
      if (!document.hidden && !drag.current) {
        view.current.phi += Math.min(previous ? time - previous : 16, 40) * .000065;
        globe.current?.update(view.current);
      }
      previous = time; frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rotating, reduced, fallback]);

  const projection = geoOrthographic().rotate([-middle[0], -middle[1]]).translate([200, 200]).scale(158);
  const path = geoPath(projection);
  return <div className={styles.globeWrap}>
    <div className={styles.globe}>
      {fallback ? <svg viewBox="0 0 400 400" role="img" aria-label={`Route from ${from.city} to ${to.city}`}>
        <circle cx="200" cy="200" r="158" fill="#f0f0ef" />
        <path d={path(land as unknown as GeoPermissibleObjects) || ""} fill="#c0c0bd" />
        <path d={path({ type: "LineString", coordinates: [from.coordinates, to.coordinates] }) || ""} fill="none" stroke="#18181b" strokeWidth="2" />
      </svg> : <>
        <canvas ref={canvas} tabIndex={0} role="img" aria-label={`Interactive globe: ${from.city} to ${to.city}. Drag or use arrow keys to rotate.`}
          onPointerDown={e => { if (!e.isPrimary || e.button !== 0) return; setRotating(false); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; }}
          onPointerMove={e => { const p = drag.current; if (!p || p.id !== e.pointerId) return; view.current.phi += (e.clientX - p.x) / 220; view.current.theta = Math.max(-1.4, Math.min(1.4, view.current.theta + (e.clientY - p.y) / 300)); drag.current = { id: p.id, x: e.clientX, y: e.clientY }; paint(); }}
          onPointerUp={e => { drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
          onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
          onKeyDown={e => { if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(e.key)) return; e.preventDefault(); setRotating(false); if (e.key === "Home") view.current = initial; else if (e.key === "ArrowLeft" || e.key === "ArrowRight") view.current.phi += e.key === "ArrowRight" ? .12 : -.12; else view.current.theta = Math.max(-1.4, Math.min(1.4, view.current.theta + (e.key === "ArrowUp" ? .12 : -.12))); paint(); }} />
        {[from, to].map((a, i) => <span key={a.id} className={styles.marker} style={{ positionAnchor: `--cobe-destination-${i}`, opacity: `var(--cobe-visible-destination-${i}, 0)` } as CSSProperties}>{a.code}</span>)}
      </>}
    </div>
    {!fallback && <div className={styles.globeControls}>
      <span>Drag to explore</span>
      {!reduced && <button type="button" aria-label={rotating ? "Pause globe rotation" : "Rotate globe"} aria-pressed={rotating} onClick={() => setRotating(!rotating)}>{rotating ? <Pause size={13} /> : <Play size={13} />}</button>}
      <button type="button" aria-label="Center selected route" onClick={() => { setRotating(false); view.current = initial; paint(); }}><RotateCcw size={14} /></button>
    </div>}
  </div>;
}
