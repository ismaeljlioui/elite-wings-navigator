"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Pointer position is measured against the stationary frame, never the tilted card. */
export default function TiltCard({ children }: { children: ReactNode }) {
  const card = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 });
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function animate() {
    if (frame.current) return;
    let previous = 0;
    const tick = (time: number) => {
      const s = state.current;
      const dt = previous ? Math.min((time - previous) / 16.67, 2) : 1;
      previous = time;
      s.vx = (s.vx + (s.tx - s.x) * 0.16 * dt) * Math.pow(0.72, dt);
      s.vy = (s.vy + (s.ty - s.y) * 0.16 * dt) * Math.pow(0.72, dt);
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const settled =
        Math.abs(s.tx - s.x) +
          Math.abs(s.ty - s.y) +
          Math.abs(s.vx) +
          Math.abs(s.vy) <
        0.025;
      if (settled) {
        s.x = s.tx;
        s.y = s.ty;
        s.vx = 0;
        s.vy = 0;
      }
      if (card.current) {
        card.current.style.setProperty("--rx", `${-s.y * 0.035}deg`);
        card.current.style.setProperty("--ry", `${s.x * 0.035}deg`);
        card.current.style.setProperty("--px", `${50 + s.x * 0.5}%`);
        card.current.style.setProperty("--py", `${50 + s.y * 0.5}%`);
      }
      frame.current = settled ? 0 : requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }
  function reset() {
    state.current.tx = 0;
    state.current.ty = 0;
    animate();
  }
  return (
    <div
      className="tilt-frame"
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        state.current.tx = Math.max(
          -100,
          Math.min(100, (((e.clientX - r.left) / r.width) * 2 - 1) * 100),
        );
        state.current.ty = Math.max(
          -100,
          Math.min(100, (((e.clientY - r.top) / r.height) * 2 - 1) * 100),
        );
        animate();
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <article className="jet-card" ref={card}>
        {children}
      </article>
    </div>
  );
}
