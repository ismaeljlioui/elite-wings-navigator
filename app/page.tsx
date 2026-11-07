"use client";
import { AppSelect } from "@/components/ui/app-select";
import { GlassDock } from "@/components/glass-dock";
import { PriceBars } from "@/components/price-bars";
import { CruiseSlider } from "@/components/cruise-slider";
import { RangeScrubber } from "@/components/range-scrubber";
import { Seek } from "@/components/seek";
import { ShortlistStack } from "@/components/shortlist-stack";
import TiltCard from "@/components/tilt-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Plane,
  Armchair,
  Columns3,
  Search,
  SlidersHorizontal,
  Heart,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Plus,
  Globe2,
  Gauge,
  Users,
  Wind,
  MoveHorizontal,
  Maximize,
  Briefcase,
  RotateCcw,
  Menu,
  Compass,
} from "lucide-react";
import source from "../data/aircraft.json";
import MissionPlanner from "../components/mission-planner";
import { type Mission, meetsMission } from "../lib/mission";
type Jet = (typeof source)[number];
type Tab = "Performance" | "Interior" | "Compare";
const jets = source as Jet[];
const fmt = (v: unknown) =>
  typeof v === "number"
    ? v.toLocaleString("en-US")
    : v == null || v === "-"
      ? "Not provided"
      : String(v);
const price = (v: number | null) =>
  v
    ? `$${(v / 1000000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`
    : "Not provided";
const displayName = (s: string) =>
  s
    .replace("CITATION", "Citation")
    .replace("VISION JET", "Vision Jet")
    .replace("Hondajet", "HondaJet")
    .replace("ELITE", "Elite");
const maker = (s: string) =>
  ({
    "TEXTRON CESSNA": "Cessna",
    "CIRRUS AIRCRAFT": "Cirrus",
    "DASSAULT AVIATION": "Dassault",
    "HONDA AIRCRAFT": "Honda Aircraft",
    "PILATUS AIRCRAFT": "Pilatus",
  })[s] || s.charAt(0) + s.slice(1).toLowerCase();
const category = (j: Jet) =>
  j.range >= 5000
    ? "Long range"
    : j.business_jet_category === "Large"
      ? "Large cabin"
      : j.business_jet_category
          .replace(" Jets", "")
          .replace("Super Midsize", "Super midsize")
          .replace("Very Light", "Very light")
          .replace("Super Light", "Super light");
const categories = [
  "All aircraft",
  "Very light",
  "Light",
  "Super light",
  "Midsize",
  "Super midsize",
  "Large cabin",
  "Long range",
];
const categoryIcons = [
  Compass,
  Plane,
  Plane,
  Wind,
  Plane,
  Plane,
  Armchair,
  Globe2,
];
function Photo({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? (
    <div className="image-fallback">
      <Plane size={36} />
      <span>Image unavailable</span>
    </div>
  ) : (
    <img key={src} src={src} alt={alt} {...props} onError={() => setFailed(true)} />
  );
}
export default function Home() {
  const [mission, setMission] = useState<Mission | null>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [compareCabin, setCompareCabin] = useState(false);
  const [tab, setTab] = useState<Tab>("Performance");
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("All manufacturers");
  const [minRange, setMinRange] = useState(0);
  const [passengers, setPassengers] = useState(0);
  const [cat, setCat] = useState("All aircraft");
  const [saved, setSaved] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("Range: longest first");
  const [filters, setFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100);
  const [minPrice, setMinPrice] = useState(0);
  const [minSpeed, setMinSpeed] = useState(0);
  const [standup, setStandup] = useState(false);
  const [detail, setDetail] = useState<Jet | null>(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const read = (key: string) => {
        const v = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(v)
          ? [
              ...new Set(
                v.filter((id: unknown) => jets.some((j) => j.id === id)),
              ),
            ]
          : [];
      };
      setSaved(read("ew-saved"));
      setSelected(read("ew-compare").slice(0, 3));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("ew-saved", JSON.stringify(saved));
        localStorage.setItem("ew-compare", JSON.stringify(selected));
      } catch {}
    }
  }, [saved, selected, ready]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    if (filters)
      document.querySelector<HTMLButtonElement>(".close-sidebar")?.focus();
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Tab" && (detail || filters)) {
        const dialog = document.querySelector("[role=dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>(
          "button,input,select,a[href],[role=slider]",
        );
        if (focusable?.length) {
          const first = focusable[0],
            last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === "Escape" && !e.defaultPrevented) {
        setDetail(null);
        setFilters(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = detail || filters ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
      if (detail || filters) previous?.focus();
    };
  }, [detail, filters]);
  const toggleSaved = (id: number) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleCompare = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
    else
      setToast("Your comparison is full. Remove an aircraft to add another.");
  };
  const reset = () => {
    setQuery("");
    setManufacturer("All manufacturers");
    setMinRange(0);
    setPassengers(0);
    setCat("All aircraft");
    setMaxPrice(100);
    setMinPrice(0);
    setMinSpeed(0);
    setStandup(false);
    setSavedOnly(false);
    setMission(null);
  };
  const searchTerm = query.trim().replace(/\s+/g, " ").toLowerCase();
  const filtered = jets.filter(
    (j) =>
      (!mission || meetsMission(j, mission)) &&
      (!searchTerm ||
        `${j.Model} ${j.manufacturers}`
          .toLowerCase()
          .includes(searchTerm)) &&
      (manufacturer === "All manufacturers" ||
        j.manufacturers === manufacturer) &&
      j.range >= minRange &&
      Number(j.max_passengers) >= passengers &&
      (cat === "All aircraft" || category(j) === cat) &&
      (!savedOnly || saved.includes(j.id)) &&
      Number(j.base_price) <= maxPrice * 1000000 &&
      Number(j.base_price) >= minPrice * 1000000 &&
      (!minSpeed || Number(j.high_speed_cruise) >= minSpeed) &&
      (!standup || Number(j.cabin_height) >= 72),
  );
  const active = !!(
    mission ||
    query ||
    manufacturer !== "All manufacturers" ||
    minRange ||
    passengers ||
    cat !== "All aircraft" ||
    maxPrice < 100 ||
    minPrice > 0 ||
    minSpeed ||
    standup ||
    savedOnly
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "Price: low to high"
      ? Number(a.base_price) - Number(b.base_price)
      : sort === "Cabin: largest first"
        ? Number(b.cabin_volume) - Number(a.cabin_volume)
        : sort === "Speed: fastest first"
          ? Number(b.high_speed_cruise) - Number(a.high_speed_cruise)
          : b.range - a.range,
  );
  const comparison = selected
    .map((id) => jets.find((j) => j.id === id))
    .filter(Boolean) as Jet[];
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>(".dashboard-shell,.compare-main")?.scrollTo({ top: 0, behavior: "instant" });
  }, [tab, searchTerm, manufacturer, minRange, passengers, cat, savedOnly, minPrice, maxPrice, minSpeed, standup, mission, sort]);
  const changeTab = (t: Tab) => {
    setFilters(false);
    setTab(t);
    setMenu(false);
  };
  function comparisonPicker(i: number) {
    return (
                <AppSelect
                  aria-label={`Comparison aircraft ${i + 1}`}
                  value={selected[i] || ""}
                  onChange={(e) => {
                    const next = [...selected];
                    if (e.target.value) next[i] = Number(e.target.value);
                    else next.splice(i, 1);
                    setSelected(next.filter(Boolean));
                  }}
                >
                  <option value="">Select an aircraft</option>
                  {jets
                    .filter(
                      (j) => !selected.includes(j.id) || selected[i] === j.id,
                    )
                    .map((j) => (
                      <option value={j.id} key={j.id}>
                        {maker(j.manufacturers)} {displayName(j.Model)}
                      </option>
                    ))}
                </AppSelect>
    );
  }

  function renderCard(j: Jet) {
    return (
      <TiltCard key={j.id}>
        <div className="card-meta">
          <span data-category={category(j)}>{category(j)}</span>
          <Button
            variant="ghost"
            className={`save-jet ${saved.includes(j.id) ? "is-saved" : ""}`}
            aria-label={`${saved.includes(j.id) ? "Unsave" : "Save"} ${j.Model}`}
            aria-pressed={saved.includes(j.id)}
            onClick={() => toggleSaved(j.id)}
          >
            <Heart
              size={17}
              fill={saved.includes(j.id) ? "currentColor" : "none"}
            />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="photo-button dashboard-photo"
          onClick={() => setDetail(j)}
          aria-label={`Explore ${displayName(j.Model)}`}
        >
          <Photo
            src={tab === "Interior" ? j.interiorImage : j.image}
            alt={`${maker(j.manufacturers)} ${displayName(j.Model)} ${tab === "Interior" ? "cabin" : "exterior"}`}
          />
        </Button>
        <div className="image-card-content">
          <div className="card-title">
            <div>
              <p className="maker">{maker(j.manufacturers)}</p>
              <Button
                variant="ghost"
                className="photo-model-pill"
                onClick={() => setDetail(j)}
              >
                {displayName(j.Model)}
              </Button>
            </div>
            <div className="price">
              {price(j.base_price)}
              <small>Base price · USD</small>
            </div>
          </div>
          <div className="dashboard-specs">
            {(tab === "Interior"
              ? [
                  [
                    j.max_passengers ? fmt(j.max_passengers) : "—",
                    "Max. passengers",
                  ],
                  [
                    j.cabin_volume ? fmt(j.cabin_volume) + " ft³" : "—",
                    "Cabin volume",
                  ],
                  [j.cabin_height_text || "—", "Cabin height"],
                ]
              : [
                  [fmt(j.range) + " nm", "Maximum range"],
                  [
                    j.high_speed_cruise
                      ? fmt(j.high_speed_cruise) + " ktas"
                      : "—",
                    "High-speed cruise",
                  ],
                  [
                    j.max_passengers ? fmt(j.max_passengers) : "—",
                    "Max. passengers",
                  ],
                ]
            ).map(([v, label]) => (
              <div key={label}>
                <strong>{v}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="card-actions">
            <Button
              variant="ghost"
              className={selected.includes(j.id) ? "selected" : ""}
              onClick={() => toggleCompare(j.id)}
              aria-label={`${selected.includes(j.id) ? "Remove" : "Compare"} ${j.Model}`}
            >
              {selected.includes(j.id) ? (
                <Check size={14} />
              ) : (
                <Plus size={14} />
              )}{" "}
              {selected.includes(j.id) ? "In comparison" : "Compare"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDetail(j)}
              aria-label={`View ${j.Model} details`}
            >
              View details <ArrowUpRight size={14} />
            </Button>
          </div>
        </div>
      </TiltCard>
    );
  }

  return (
    <>
      <div className="navigation-dock" data-surface="flat">
        <GlassDock active={plannerOpen ? "Destination" : tab} onSelect={(key) => {
          if (key === "Destination") { setPlannerOpen(true); setFilters(false); }
          else { setPlannerOpen(false); changeTab(key as Tab); }
        }} />
      </div>
      {tab !== "Compare" && <div className="floating-search" data-surface="flat"><Seek value={query} onChange={setQuery} /></div>}
      {tab !== "Compare" ? (
        <div className="dashboard-shell">
          <Button
              variant="ghost"
              className={`sidebar-scrim ${filters ? "open" : ""}`}
              tabIndex={-1}
              aria-hidden={!filters}
              aria-label="Close filter drawer"
              onClick={() => setFilters(false)}
            />
          <aside
            className={`filter-sidebar ${filters ? "open" : ""}`}
            id="aircraft-filters"
            inert={!filters}
            aria-hidden={!filters}
            aria-label="Aircraft filters"
            role={filters ? "dialog" : undefined}
            aria-modal={filters ? true : undefined}
          >
            <a className="sidebar-brand" href="/">ELITE WINGS</a>
            <div className="sidebar-heading">
              <h2>Filters</h2>
              <Button
                variant="ghost"
                className="close-sidebar"
                aria-label="Close filters"
                onClick={() => setFilters(false)}
              >
                <X size={19} />
              </Button>
            </div>
            <div className="filter-scroll-content">
            <div className="sidebar-group">
              <label className="filter-label" htmlFor="manufacturer">
                Manufacturer
              </label>
              <AppSelect
                id="manufacturer"
                aria-label="Manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              >
                <option>All manufacturers</option>
                {[...new Set(jets.map((j) => j.manufacturers))]
                  .sort()
                  .map((m) => (
                    <option key={m} value={m}>
                      {maker(m)}
                    </option>
                  ))}
              </AppSelect>
            </div>
            <fieldset className="sidebar-group aircraft-classes">
              <legend>Aircraft class</legend>
              {categories.map((c) => (
                <label key={c}>
                  <input
                    type="radio"
                    name="aircraft-category"
                    aria-label={c}
                    value={c}
                    checked={cat === c}
                    onChange={() => setCat(c)}
                  />
                  <span>{c}</span>
                  <small>
                    {c === "All aircraft"
                      ? jets.length
                      : jets.filter((j) => category(j) === c).length}
                  </small>
                </label>
              ))}
            </fieldset>
            <div className="sidebar-group">
              <div className="filter-label">
                Base price <span>USD</span>
              </div>
              <PriceBars jets={jets} min={minPrice} max={maxPrice} active={filters} />
              <label className="sr-only" htmlFor="price-range">
                Maximum base price
              </label>
              <input
                id="price-range"
                className="sidebar-range"
                type="range"
                min={minPrice}
                max="100"
                step="1"
                value={maxPrice}
                style={{ background: `linear-gradient(to right, #18181b 0%, #18181b ${(minPrice === 100 ? 100 : ((maxPrice - minPrice) / (100 - minPrice)) * 100)}%, #dfe1e4 ${(minPrice === 100 ? 100 : ((maxPrice - minPrice) / (100 - minPrice)) * 100)}%, #dfe1e4 100%)` }}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-inputs">
                <label>
                  MIN{" "}
                  <div>
                    $
                    <input
                      aria-label="Minimum base price in millions"
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={minPrice}
                      onChange={(e) =>
                        setMinPrice(
                          Math.max(
                            0,
                            Math.min(maxPrice, Number(e.target.value)),
                          ),
                        )
                      }
                    />
                    M
                  </div>
                </label>
                <label>
                  MAX{" "}
                  <div>
                    $
                    <input
                      aria-label="Maximum base price in millions"
                      type="number"
                      min={minPrice}
                      max="100"
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(
                          Math.max(
                            minPrice,
                            Math.min(100, Number(e.target.value)),
                          ),
                        )
                      }
                    />
                    M
                  </div>
                </label>
              </div>
            </div>
            <div className="sidebar-group">
              <label className="filter-label" htmlFor="range">
                Minimum range{" "}
                <strong>{minRange ? fmt(minRange) + " nm" : "Any"}</strong>
              </label>
              <RangeScrubber value={minRange} onChange={setMinRange} active={filters} />
              <div className="range-endpoints">
                <span>0 nm</span>
                <span>8,000 nm</span>
              </div>
            </div>
            <div className="sidebar-group">
              <label className="filter-label" htmlFor="passengers">
                Passengers
              </label>
              <AppSelect
                id="passengers"
                aria-label="Minimum passengers"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              >
                <option value="0">Any group size</option>
                {[4, 6, 8, 10, 12, 16].map((n) => (
                  <option key={n} value={n}>
                    {n}+ passengers
                  </option>
                ))}
              </AppSelect>
            </div>
            <details
              className="sidebar-group advanced-filters"
              open={tab === "Interior"}
            >
              <summary>
                More specifications <Plus size={13} />
              </summary>
              <label className="filter-label" htmlFor="speed">
                Minimum cruise{" "}
                <strong>{minSpeed ? minSpeed + " ktas" : "Any"}</strong>
              </label>
              <CruiseSlider value={minSpeed} onChange={setMinSpeed} />
              <label className="standup-check">
                <input
                  type="checkbox"
                  checked={standup}
                  onChange={(e) => setStandup(e.target.checked)}
                />
                <span>
                  Stand-up cabin<small>At least 6 ft cabin height</small>
                </span>
              </label>
            </details>
            <div className="sidebar-note">
              Specifications from the aircraft guide.
              <br />
              Prices and configurations may vary.
            </div>
            </div>
            <div className="filter-drawer-footer">
              <Button variant="ghost" className="filter-reset" onClick={reset}>Reset</Button>
              <Button variant="ghost" className="filter-done" onClick={() => setFilters(false)}>Done</Button>
            </div>
          </aside>
          <main id="results" className="dashboard-main">
            <div className="dashboard-heading">
              <div>
                <div className="navigator-identity"><span className="navigator-wordmark">ELITE WINGS</span><span className="navigator-edition">Aircraft navigator</span></div>
                <div className="navigator-title-row">
                  <h1>{savedOnly ? "Your collection" : tab === "Interior" ? "Cabin interiors" : "Aircraft performance"}</h1>
                  <span className="result-count" role="status">{filtered.length} aircraft</span>
                </div>
                <p className="navigator-purpose">{tab === "Interior" ? "Space to work. Room to unwind. Find your cabin." : "Find the reach, speed and capacity for your next journey."}</p>
              </div>
              <Button
                variant="ghost"
                className="floating-filter-button"
                aria-label="Open filters"
                title="Filters"
                aria-expanded={filters}
                aria-controls="aircraft-filters"
                onClick={() => setFilters(true)}
              >
                <SlidersHorizontal size={28} strokeWidth={2} /><span className="control-caption">Filters</span>
              </Button>
              <div className="dashboard-tools">
                <Button variant="ghost" className="saved-button" aria-label="Saved aircraft" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}><Heart size={17} fill={savedOnly ? "currentColor" : "none"} /><span>Saved</span>{saved.length > 0 && <b>{saved.length}</b>}</Button>

                <AppSelect
                  aria-label="Sort aircraft"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                  }}
                >
                  {[
                    "Range: longest first",
                    "Price: low to high",
                    "Speed: fastest first",
                    "Cabin: largest first",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
            {mission && (
              <div className="dashboard-mission">
                <Globe2 size={18} />
                <div>
                  <strong>
                    {mission.from.city} <ArrowRight size={13} />{" "}
                    {mission.to.city}
                  </strong>
                  <span>
                    {fmt(mission.distance)} nm · {mission.passengers} passengers
                    · Guide-based screen
                  </span>
                </div>
                <Button variant="ghost" onClick={() => setPlannerOpen(true)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  aria-label="Remove mission"
                  onClick={() => setMission(null)}
                >
                  <X size={15} />
                </Button>
              </div>
            )}
            {active && (
              <div className="active-filter-row">
                {savedOnly && (
                  <Button variant="ghost" onClick={() => setSavedOnly(false)}>
                    Saved <X size={12} />
                  </Button>
                )}
                {cat !== "All aircraft" && (
                  <Button
                    variant="ghost"
                    onClick={() => setCat("All aircraft")}
                  >
                    {cat} <X size={12} />
                  </Button>
                )}
                {manufacturer !== "All manufacturers" && (
                  <Button
                    variant="ghost"
                    onClick={() => setManufacturer("All manufacturers")}
                  >
                    {maker(manufacturer)} <X size={12} />
                  </Button>
                )}
                {(minPrice > 0 || maxPrice < 100) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(100);
                    }}
                  >
                    ${minPrice}–{maxPrice}M <X size={12} />
                  </Button>
                )}
                {minRange > 0 && (
                  <Button variant="ghost" onClick={() => setMinRange(0)}>
                    {fmt(minRange)}+ nm <X size={12} />
                  </Button>
                )}
                {passengers > 0 && (
                  <Button variant="ghost" onClick={() => setPassengers(0)}>
                    {passengers}+ passengers <X size={12} />
                  </Button>
                )}
                {minSpeed > 0 && (
                  <Button variant="ghost" onClick={() => setMinSpeed(0)}>
                    {minSpeed}+ ktas <X size={12} />
                  </Button>
                )}
                {standup && (
                  <Button variant="ghost" onClick={() => setStandup(false)}>
                    Stand-up cabin <X size={12} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="clear-active"
                  onClick={reset}
                >
                  Clear all
                </Button>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="empty">
                <Search size={30} />
                <h2>
                  {savedOnly && saved.length === 0 ? "No saved aircraft yet" : "No matching aircraft"}
                </h2>
                <p>
                  {savedOnly && saved.length === 0
                    ? "Save an aircraft using the heart icon."
                    : "Adjust your filters to explore more aircraft."}
                </p>
                <Button variant="ghost" className="primary" onClick={reset}>
                  Reset filters <RotateCcw size={14} />
                </Button>
              </div>
            ) : (
              <div className="jet-grid">
                {sorted.map(renderCard)}
              </div>
            )}
            <div className="dashboard-end">
              <span>
                {filtered.length} aircraft ·{" "}
                {tab === "Interior"
                  ? "Cabin specifications"
                  : "Performance specifications"}
              </span>
              <span>Guide base prices in USD</span>
            </div>
          <SourceFooter />
          </main>
        </div>
      ) : (
        <main className="compare-main">
          <div className="navigator-identity"><span className="navigator-wordmark">ELITE WINGS</span><span className="navigator-edition">Aircraft navigator</span></div>
          <div className="compare-heading">
            <div>
              <h1>Compare aircraft</h1>
              <p>
                Your shortlist, side by side.
              </p>
            </div>
            {selected.length > 0 && (
              <Button
                variant="ghost"
                className="text-button"
                onClick={() => setSelected([])}
              >
                Clear comparison <RotateCcw size={15} />
              </Button>
            )}
          </div>
          {comparison.length > 0 && (
            <div className="compare-toolbar">
              <div className="segmented" role="group" aria-label="Comparison photography">
                <Button
                  variant="ghost"
                  className={!compareCabin ? "active" : ""}
                  aria-pressed={!compareCabin}
                  onClick={() => setCompareCabin(false)}
                >
                  Exterior
                </Button>
                <Button
                  variant="ghost"
                  className={compareCabin ? "active" : ""}
                  aria-pressed={compareCabin}
                  onClick={() => setCompareCabin(true)}
                >
                  Cabin
                </Button>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={differencesOnly}
                  disabled={comparison.length < 2}
                  onChange={(e) => setDifferencesOnly(e.target.checked)}
                />{" "}
                Differences only
              </label>
              <Button
                variant="ghost"
                onClick={() => {
                  const keys = [
                    "Model",
                    "manufacturers",
                    "range",
                    "high_speed_cruise",
                    "max_passengers",
                    "cabin_volume",
                    "base_price",
                  ] as const;
                  const csv = [
                    "Model,Manufacturer,Range (nm),High-speed cruise (ktas),Maximum passengers,Cabin volume (ft3),Guide base price (USD)",
                    ...comparison.map((j) =>
                      keys
                        .map(
                          (k) =>
                            '"' +
                            String(j[k] ?? "Not provided").replaceAll(
                              '"',
                              '""',
                            ) +
                            '"',
                        )
                        .join(","),
                    ),
                  ].join("\n");
                  const url = URL.createObjectURL(
                    new Blob([csv], { type: "text/csv" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "elite-wings-shortlist.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                  setToast("Your shortlist has been exported.");
                }}
              >
                Export shortlist <ArrowUpRight size={15} />
              </Button>
            </div>
          )}
          {comparison.length === 0 && <div className="compare-picker">
            {[0, 1, 2].map(i => <div className="compare-empty-slot" key={i}>
              <span className="compare-slot-label">Aircraft {String(i + 1).padStart(2, "0")}</span>
              {comparisonPicker(i)}
            </div>)}
          </div>}
          {comparison.length === 0 ? (
            <div className="empty compare-empty">
              <Columns3 size={45} strokeWidth={1.2} />
              <h2>Your shortlist. A clearer picture.</h2>
              <p>
                Select aircraft above, or add them as you explore the
                collection.
              </p>
              <Button
                variant="ghost"
                className="primary"
                onClick={() => setTab("Performance")}
              >
                Explore the collection <ArrowRight size={17} />
              </Button>
            </div>
          ) : (
            <>
              <p className="compare-scroll-hint">Scroll sideways to compare all aircraft <ArrowRight size={13}/></p>
              <div className="comparison-scroll" role="region" aria-label="Scrollable aircraft comparison" tabIndex={0}>
                <table className="comparison-table" aria-label="Aircraft specifications comparison">
                  <thead>
                    <tr>
                      <th>
                        <span className="compare-table-label">Your shortlist</span>
                        <p>{comparison.length} of 3 aircraft</p>
                      </th>
                      {[0, 1, 2].map(i => {
                        const j = comparison[i];
                        return <th key={i} scope="col" className="compare-aircraft-column">
                          <div className="compare-slot-label">Aircraft {String(i + 1).padStart(2, "0")}</div>
                          {comparisonPicker(i)}
                          {j ? <div className="compare-photo">
                            <Photo src={compareCabin ? j.interiorImage : j.image} alt={`${displayName(j.Model)} ${compareCabin ? "cabin" : "exterior"}`} />
                            <Button variant="ghost" aria-label={`Remove ${j.Model}`} onClick={() => toggleCompare(j.id)}><X size={16}/></Button>
                            <span className="compare-category">{category(j)}</span>
                          </div> : <div className="compare-photo compare-vacant"><Plus size={22} strokeWidth={1.5}/><span>Add an aircraft above</span></div>}
                        </th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [
                        "Overview",
                        [
                          ["Category", "business_jet_category", ""],
                          ["Guide base price", "base_price", ""],
                          ["Guide model year", "model_year", ""],
                        ],
                      ],
                      [
                        "Performance",
                        [
                          ["Maximum range", "range", "nm"],
                          ["High-speed cruise", "high_speed_cruise", "ktas"],
                          ["Long-range cruise", "long_range_cruise", "ktas"],
                          ["Takeoff distance", "takeoff_distance", "ft"],
                          ["Landing distance", "landing_distance", "ft"],
                          ["Maximum altitude", "maximum_cruise_altitude", "ft"],
                        ],
                      ],
                      [
                        "Interior",
                        [
                          ["Maximum passengers", "max_passengers", ""],
                          ["Cabin volume", "cabin_volume", "ft³"],
                          ["Cabin height", "cabin_height_text", ""],
                          ["Cabin width", "cabin_width_text", ""],
                          ["Cabin length", "cabin_lenght_text", ""],
                          ["Total baggage", "total_baggage", "ft³"],
                        ],
                      ],
                      [
                        "Flight deck & power",
                        [
                          ["Pilots", "pilots", ""],
                          ["Avionics", "avionics_model", ""],
                          ["Engine", "engine_model", ""],
                        ],
                      ],
                    ].map(([section, fields]) => (
                      <CompareRows
                        key={String(section)}
                        section={String(section)}
                        fields={fields as string[][]}
                        items={comparison}
                        differencesOnly={differencesOnly}
                      />
                    ))}
                    <tr className="notes-row">
                      <th scope="row">Range conditions</th>
                      {comparison.map((j) => (
                        <td key={j.id}>
                          {j.max_range_condition || "Not provided"}
                        </td>
                      ))}
                      {Array.from({length:3-comparison.length}, (_, i) => <td key={`empty-${i}`} aria-label="No aircraft selected">—</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        <SourceFooter />
          </main>
      )}
      {plannerOpen && (
        <MissionPlanner
          current={mission}
          onClose={() => setPlannerOpen(false)}
          onApply={(m) => {
            reset();
            setMission(m);
            setSort("Price: low to high");
            setTab("Performance");
            setPlannerOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {selected.length > 0 && tab !== "Compare" && (
        <ShortlistStack items={comparison.map(j=>({id:j.id,name:displayName(j.Model),maker:maker(j.manufacturers)}))} onRemove={toggleCompare} onCompare={()=>setTab("Compare")} />
      )}
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={detail.Model}
            className="detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              autoFocus
              className="detail-close"
              aria-label="Close aircraft details"
              onClick={() => setDetail(null)}
            >
              <X size={21} />
            </Button>
            <div className="detail-images">
              <Photo
                src={tab === "Interior" ? detail.interiorImage : detail.image}
                alt={`${detail.Model} ${tab === "Interior" ? "interior" : "exterior"}`}
              />
              <Photo
                src={tab === "Interior" ? detail.image : detail.interiorImage}
                alt={`${detail.Model} ${tab === "Interior" ? "exterior" : "interior"}`}
              />
            </div>
            <div className="detail-body">
              <div className="detail-title">
                <div>
                  <p className="maker">
                    {maker(detail.manufacturers)} · {category(detail)}
                  </p>
                  <h2>{displayName(detail.Model)}</h2>
                </div>
                <div className="detail-price">
                  {price(detail.base_price)}
                  <small>Guide base price · USD</small>
                </div>
              </div>
              <div className="detail-stats">
                {[
                  [Globe2, "Maximum range", `${fmt(detail.range)} nm`],
                  [
                    Gauge,
                    "High-speed cruise",
                    detail.high_speed_cruise
                      ? `${fmt(detail.high_speed_cruise)} ktas`
                      : "Not provided",
                  ],
                  [Users, "Passengers", fmt(detail.max_passengers)],
                  [Armchair, "Cabin volume", `${fmt(detail.cabin_volume)} ft³`],
                ].map(([Icon, label, value]) => {
                  const I = Icon as typeof Plane;
                  return (
                    <div key={String(label)}>
                      <I size={20} />
                      <strong>{String(value)}</strong>
                      <span>{String(label)}</span>
                    </div>
                  );
                })}
              </div>
              <h3>
                {tab === "Interior" ? "Life on board" : "Aircraft overview"}
              </h3>
              <p className="description">
                {String(
                  tab === "Interior"
                    ? detail.interior_description ||
                        "Cabin configurations vary by aircraft. Explore the dimensions below to find the right fit for your journey."
                    : detail.description ||
                        "Explore this aircraft’s performance and cabin specifications.",
                ).replaceAll("\\n", "\n")}
              </p>
              <div className="detail-specs">
                {[
                  ["Cabin height", detail.cabin_height_text],
                  ["Cabin width", detail.cabin_width_text],
                  ["Cabin length", detail.cabin_lenght_text],
                  ["Baggage volume", `${fmt(detail.total_baggage)} ft³`],
                  ["Takeoff distance", `${fmt(detail.takeoff_distance)} ft`],
                  ["Avionics", detail.avionics_model],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <span>{label}</span>
                    <strong>{fmt(value)}</strong>
                  </div>
                ))}
              </div>
              <p className="source-note">
                Range conditions: {detail.max_range_condition || "Not provided"}
                . Specifications reflect the supplied guide, not a current sales
                offer. Photography may show a different model-year
                configuration.
              </p>
              <div className="modal-footer">
                <Button
                  variant="ghost"
                  className="text-button"
                  onClick={() => toggleSaved(detail.id)}
                >
                  <Heart
                    size={17}
                    fill={saved.includes(detail.id) ? "currentColor" : "none"}
                  />
                  {saved.includes(detail.id)
                    ? "Saved to collection"
                    : "Save aircraft"}
                </Button>
                <Button
                  variant="ghost"
                  className="primary"
                  onClick={() => toggleCompare(detail.id)}
                >
                  {selected.includes(detail.id) ? (
                    <Check size={17} />
                  ) : (
                    <Plus size={17} />
                  )}{" "}
                  {selected.includes(detail.id)
                    ? "Added to comparison"
                    : "Add to comparison"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
function CompareRows({
  section,
  fields,
  items,
  differencesOnly = false,
}: {
  differencesOnly?: boolean;
  section: string;
  fields: string[][];
  items: Jet[];
}) {
  const visibleFields = fields
        .filter(
          ([, key]) =>
            !differencesOnly ||
            items.length < 2 ||
            new Set(
              items.map((j) => {
                const dimensionKeys: Record<string, string> = {
                  cabin_height_text: "cabin_height",
                  cabin_width_text: "cabin_width",
                  cabin_lenght_text: "cabin_length",
                };
                const v = key === "business_jet_category" ? category(j) : j[(dimensionKeys[key] || key) as keyof Jet];
                return typeof v === "string"
                  ? v.trim().replace(/\s+/g, " ").toLowerCase()
                  : v;
              }),
            ).size > 1,
        );
  if (visibleFields.length === 0) return null;
  return (
    <>
      <tr className="table-section">
        <th colSpan={4}>{section}</th>
      </tr>
      {visibleFields
        .map(([label, key, unit]) => (
          <tr key={key}>
            <th scope="row">{label}</th>
            {items.map((j) => (
              <td key={j.id}>
                {key === "base_price"
                  ? (j.base_price == null ? "Not provided" : j.base_price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }))
                  : key === "business_jet_category"
                    ? category(j)
                  : key === "model_year"
                    ? String(j[key as keyof Jet] ?? "Not provided")
                    : fmt(j[key as keyof Jet])}
                {j[key as keyof Jet] != null && unit && <small> {unit}</small>}
              </td>
            ))}
            {Array.from({length:3-items.length}, (_, i) => <td key={`empty-${i}`} aria-label="No aircraft selected">—</td>)}
          </tr>
        ))}
    </>
  );
}

function SourceFooter() {
  return (
      <footer>
        <div className="footer-brand">
          ELITE WINGS <span>Business jet navigator.</span>
        </div>
        <p>
          Specifications from the supplied aircraft guide · Base prices in USD ·
          Imagery © respective owners via{" "}
          <a
            href="https://elite-wings.com/allaircraft/"
            target="_blank"
            rel="noreferrer"
          >
            Elite Wings <ArrowUpRight size={11} />
          </a>
        </p>
        <span>
          Guide values may differ from current configurations. Model-family
          imagery is illustrative.
        </span>
      </footer>
  );
}
