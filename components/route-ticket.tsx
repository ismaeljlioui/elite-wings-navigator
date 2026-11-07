"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Plane } from "lucide-react";
import type { Mission } from "@/lib/mission";
import styles from "./route-ticket.module.css";

// The supplied ticket's notches, perforation and detachable stub, adapted to a route preview.
export function RouteTicket({ mission, count, onExplore }: { mission: Mission; count: number; onExplore: () => void }) {
  const [pull, setPull] = useState(0);
  const [held, setHeld] = useState(false);
  const [torn, setTorn] = useState(false);
  const gesture = useRef<{ id: number; x: number; y: number; pull: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const committed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const explore = () => {
    if (!count || committed.current) return;
    committed.current = true;
    setHeld(false); setTorn(true);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) onExplore();
    else timer.current = setTimeout(onExplore, 380);
  };
  const cancel = () => { gesture.current = null; suppressClick.current = true; setHeld(false); setPull(0); };
  return <div className={styles.wrap}>
    <div className={styles.ticket} data-torn={torn || undefined} data-held={held || undefined} style={{ "--pull": `${pull}px`, "--twist": `${pull / 10}deg` } as CSSProperties}>
      <div className={styles.paper}>
        <div className={styles.brand}><span>ELITE WINGS</span><span>ROUTE PREVIEW</span></div>
        <div className={styles.route}>
          <div><strong>{mission.from.code}</strong><span>{mission.from.city}</span></div>
          <Plane size={18} strokeWidth={1.4} aria-hidden="true" />
          <div><strong>{mission.to.code}</strong><span>{mission.to.city}</span></div>
        </div>
        <div className={styles.meta}><span>{mission.distance.toLocaleString()} nm</span><i /><span>{mission.passengers} passengers</span></div>
      </div>
      <div className={styles.stubWrap}>
        <button type="button" className={styles.stub} disabled={!count || torn} aria-label={`Tear ticket to show ${count} matching aircraft`} aria-describedby="route-ticket-help"
          onPointerDown={e => { if (!e.isPrimary || e.button !== 0 || committed.current) return; suppressClick.current = false; e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, pull: 0, moved: false }; setHeld(true); }}
          onPointerMove={e => {
            const g = gesture.current; if (!g || g.id !== e.pointerId) return;
            const dx = e.clientX - g.x, dy = e.clientY - g.y;
            if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
            if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) { cancel(); return; }
            g.pull = Math.max(0, Math.min(80, dx)); setPull(g.pull);
          }}
          onPointerUp={e => {
            const g = gesture.current; if (!g || g.id !== e.pointerId) return;
            gesture.current = null; setHeld(false); suppressClick.current = g.moved;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            if (g.pull >= 48) explore(); else setPull(0);
          }}
          onPointerCancel={cancel}
          onLostPointerCapture={() => { if (gesture.current) cancel(); }}
          onClick={e => { if (e.detail === 0 || !suppressClick.current) explore(); }}>
          <strong>{count}</strong><span>aircraft</span><ArrowRight size={19} aria-hidden="true" /><small>Explore</small>
        </button>
      </div>
    </div>
    <p id="route-ticket-help" className={styles.hint} aria-live="polite">{torn ? "Opening your matches…" : !count ? "Adjust your route to find aircraft" : held && pull >= 48 ? "Release to explore" : "Pull the stub to explore · or click it"}</p>
  </div>;
}
