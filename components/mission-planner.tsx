"use client";
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, ArrowDownUp, X, Minus, Plus, Users, Navigation } from "lucide-react";
import { AppSelect } from "@/components/ui/app-select";
import { RouteTicket } from "./route-ticket";
import { DestinationGlobe } from "./destination-globe";
import airports from "@/data/airports.json";
import aircraft from "@/data/aircraft.json";
import { type Mission, distanceNm, meetsMission } from "@/lib/mission";
import styles from "./destination.module.css";

export default function MissionPlanner({ onClose, onApply, current }: {
  onClose: () => void; onApply: (mission: Mission) => void; current: Mission | null;
}) {
  const [fromId, setFrom] = useState(current?.from.id || "KTEB");
  const [toId, setTo] = useState(current?.to.id || "EGLF");
  const [pax, setPax] = useState(current?.passengers || 8);
  const from = airports.find(a => a.id === fromId)!;
  const to = airports.find(a => a.id === toId)!;
  const distance = distanceNm(from.coordinates, to.coordinates);
  const mission = { from, to, passengers: pax, distance };
  const matches = aircraft.filter(j => meetsMission(j, mission));
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Backdrop className={styles.backdrop} />
      <Dialog.Popup className={styles.popup}>
        <header className={styles.header}>
          <div className={styles.heading}><Navigation size={17} /><Dialog.Title>Destination</Dialog.Title></div>
          <Dialog.Close className={styles.close} aria-label="Close destination planner"><X size={18} /></Dialog.Close>
        </header>
        <div className={styles.body}>
          <section className={styles.visual} aria-label="Route preview">
            <div className={styles.previewHeading}><span>YOUR ROUTE</span><span>Great-circle distance</span></div>
            <DestinationGlobe key={`${from.id}-${to.id}`} from={from} to={to} />
            <RouteTicket key={`${from.id}-${to.id}-${pax}`} mission={mission} count={matches.length} onExplore={() => onApply(mission)} />
          </section>
          <form className={styles.form} onSubmit={e => { e.preventDefault(); if (matches.length) onApply(mission); }}>
            <div className={styles.intro}><h2>Where to?</h2><Dialog.Description>Find the right aircraft for your next journey.</Dialog.Description></div>
            <div className={styles.airports}>
              <div className={styles.field}>
                <label htmlFor="departure-airport">Departure</label>
                <AppSelect id="departure-airport" aria-label="Departure airport" value={fromId} onChange={e => { if (e.target.value === toId) setTo(fromId); setFrom(e.target.value); }}>
                  {airports.map(a => <option key={a.id} value={a.id}>{a.city} · {a.code}</option>)}
                </AppSelect><small>{from.name}</small>
              </div>
              <div className={styles.swapRow}><span /><button type="button" className={styles.swap} aria-label="Swap departure and destination" onClick={() => { setFrom(toId); setTo(fromId); }}><ArrowDownUp size={16} /></button><span /></div>
              <div className={styles.field}>
                <label htmlFor="destination-airport">Arrival</label>
                <AppSelect id="destination-airport" aria-label="Destination airport" value={toId} onChange={e => { if (e.target.value === fromId) setFrom(toId); setTo(e.target.value); }}>
                  {airports.map(a => <option key={a.id} value={a.id}>{a.city} · {a.code}</option>)}
                </AppSelect><small>{to.name}</small>
              </div>
            </div>
            <div className={styles.passengers}>
              <span><Users size={16} />Passengers</span>
              <div className={styles.stepper}>
                <button type="button" disabled={pax <= 1} aria-label="Fewer passengers" onClick={() => setPax(n => n - 1)}><Minus size={15} /></button>
                <output aria-live="polite" aria-label="Passenger count">{pax}</output>
                <button type="button" disabled={pax >= 19} aria-label="More passengers" onClick={() => setPax(n => n + 1)}><Plus size={15} /></button>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.submit} disabled={!matches.length}>Show {matches.length} aircraft<ArrowRight size={17} /></button>
              <p className={styles.note}>{matches.length ? "Based on published range and seating. Actual capability depends on payload, conditions and reserves." : "No aircraft match this route and group size. Try fewer passengers or another destination."}</p>
            </div>
          </form>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
