"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
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
    <img src={src} alt={alt} {...props} onError={() => setFailed(true)} />
  );
}
function Shelf({
  title,
  sub,
  items,
  renderCard,
}: {
  title: string;
  sub: string;
  items: Jet[];
  renderCard: (jet: Jet) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="shelf">
      <div className="section-heading">
        <div>
          <h2>
            {title}
            <ChevronRight size={21} />
          </h2>
          <p>{sub}</p>
        </div>
        <div className="shelf-controls">
          <button
            aria-label={`Scroll ${title} left`}
            onClick={() =>
              ref.current?.scrollBy({ left: -650, behavior: "smooth" })
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label={`Scroll ${title} right`}
            onClick={() =>
              ref.current?.scrollBy({ left: 650, behavior: "smooth" })
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="card-row" ref={ref}>
        {items.map(renderCard)}
      </div>
    </section>
  );
}
export default function Home() {
  const [tab, setTab] = useState<Tab>("Performance");
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("All manufacturers");
  const [minRange, setMinRange] = useState(0);
  const [passengers, setPassengers] = useState(0);
  const [cat, setCat] = useState("All aircraft");
  const [saved, setSaved] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("Recommended");
  const [filters, setFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100);
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
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Tab" && (detail || filters)) {
        const dialog = document.querySelector("[role=dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>(
          "button,input,select,a[href]",
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
      if (e.key === "Escape") {
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
    setMinSpeed(0);
    setStandup(false);
    setSavedOnly(false);
  };
  const filtered = jets.filter(
    (j) =>
      (!query ||
        `${j.Model} ${j.manufacturers}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (manufacturer === "All manufacturers" ||
        j.manufacturers === manufacturer) &&
      j.range >= minRange &&
      Number(j.max_passengers) >= passengers &&
      (cat === "All aircraft" || category(j) === cat) &&
      (!savedOnly || saved.includes(j.id)) &&
      Number(j.base_price) <= maxPrice * 1000000 &&
      (!minSpeed || Number(j.high_speed_cruise) >= minSpeed) &&
      (!standup || Number(j.cabin_height) >= 72),
  );
  const active = !!(
    query ||
    manufacturer !== "All manufacturers" ||
    minRange ||
    passengers ||
    cat !== "All aircraft" ||
    maxPrice < 100 ||
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
  const changeTab = (t: Tab) => {
    setTab(t);
    setMenu(false);
  };
  function Card({ jet: j }: { jet: Jet }) {
    return (
      <article className="jet-card">
        <div className="photo-wrap">
          <button
            className="photo-button"
            onClick={() => setDetail(j)}
            aria-label={`Explore ${displayName(j.Model)}`}
          >
            <Photo
              src={tab === "Interior" ? j.interiorImage : j.image}
              alt={`${maker(j.manufacturers)} ${displayName(j.Model)} ${tab === "Interior" ? "cabin" : "exterior"}`}
            />
          </button>
          <span className="card-badge">{category(j)}</span>
          <button
            className={`heart ${saved.includes(j.id) ? "is-saved" : ""}`}
            aria-label={`${saved.includes(j.id) ? "Unsave" : "Save"} ${j.Model}`}
            aria-pressed={saved.includes(j.id)}
            onClick={() => toggleSaved(j.id)}
          >
            <Heart
              size={21}
              fill={saved.includes(j.id) ? "currentColor" : "#00000035"}
            />
          </button>
          <button
            className={`compare-add ${selected.includes(j.id) ? "is-selected" : ""}`}
            onClick={() => toggleCompare(j.id)}
            aria-label={`${selected.includes(j.id) ? "Remove" : "Compare"} ${j.Model}`}
          >
            {selected.includes(j.id) ? <Check size={14} /> : <Plus size={14} />}
            <span>{selected.includes(j.id) ? "Added" : "Compare"}</span>
          </button>
        </div>
        <div className="card-title">
          <div>
            <p className="maker">{maker(j.manufacturers)}</p>
            <button onClick={() => setDetail(j)}>{displayName(j.Model)}</button>
          </div>
          <span className="price">
            {price(j.base_price)}
            <small>base price</small>
          </span>
        </div>
        <div className="metrics">
          {tab === "Interior" ? (
            <>
              <span>
                <Users />
                {fmt(j.max_passengers)} <small>pax</small>
              </span>
              <span>
                <Maximize />
                {fmt(j.cabin_volume)} <small>ft³</small>
              </span>
              <span>
                <MoveHorizontal />
                {j.cabin_width_text}
              </span>
            </>
          ) : (
            <>
              <span>
                <Globe2 />
                {fmt(j.range)} <small>nm</small>
              </span>
              <span>
                <Gauge />
                {j.high_speed_cruise ? fmt(j.high_speed_cruise) : "—"}{" "}
                {j.high_speed_cruise && <small>ktas</small>}
              </span>
              <span>
                <Users />
                {j.max_passengers ? fmt(j.max_passengers) : "—"}
              </span>
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <>
      <header>
        <div className="topbar">
          <a className="brand" href="/" aria-label="Elite Wings home">
            <span className="brand-symbol">
              <Wind size={34} />
            </span>
            <span>
              ELITE WINGS<small>THE BUSINESS AVIATION AUTHORITY</small>
            </span>
          </a>
          <nav aria-label="Navigator tabs">
            {(["Performance", "Interior", "Compare"] as Tab[]).map((t, i) => {
              const Icon = [Plane, Armchair, Columns3][i];
              return (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => changeTab(t)}
                >
                  <Icon size={23} />
                  <span>{t}</span>
                  {t === "Compare" && selected.length > 0 && (
                    <b>{selected.length}</b>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="header-actions">
            <button
              aria-label="Saved aircraft"
              aria-pressed={savedOnly}
              className={`saved-button ${savedOnly ? "active" : ""}`}
              onClick={() => {
                setSavedOnly(!savedOnly);
                if (tab === "Compare") setTab("Performance");
              }}
            >
              <Heart size={17} /> <span>Saved</span>
              {saved.length > 0 && <b>{saved.length}</b>}
            </button>
            <div className="menu-wrap">
              <button
                className="menu-button"
                aria-label="Open menu"
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                <Menu size={21} />
              </button>
              {menu && (
                <div className="dropdown">
                  <a
                    href="https://elite-wings.com/allaircraft/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Aircraft e-guide <ArrowUpRight size={16} />
                  </a>
                  <a
                    href="https://elite-wings.com/bizjets-navigator/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Elite Wings navigator <ArrowUpRight size={16} />
                  </a>
                  <button
                    onClick={() => {
                      reset();
                      setMenu(false);
                      setTab("Performance");
                    }}
                  >
                    <RotateCcw size={15} /> Reset browsing filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {tab !== "Compare" && (
          <div className="search-area">
            <form
              className="search-bar"
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .getElementById("results")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <label className="search-model">
                <span>Find your aircraft</span>
                <input
                  aria-label="Search aircraft"
                  placeholder="Search by model or brand"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                <span>Manufacturer</span>
                <select
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
                </select>
              </label>
              <label>
                <span>Range</span>
                <select
                  aria-label="Minimum range"
                  value={minRange}
                  onChange={(e) => setMinRange(Number(e.target.value))}
                >
                  <option value={0}>Any distance</option>
                  {[1500, 3000, 5000, 7000].map((n) => (
                    <option value={n} key={n}>
                      {fmt(n)}+ nm
                    </option>
                  ))}
                </select>
              </label>
              <label className="passenger-search">
                <span>Passengers</span>
                <select
                  aria-label="Minimum passengers"
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                >
                  <option value={0}>Any group size</option>
                  {[4, 6, 8, 10, 12, 16].map((n) => (
                    <option value={n} key={n}>
                      {n}+ passengers
                    </option>
                  ))}
                </select>
              </label>
              <button className="search-submit" aria-label="Search">
                <Search size={22} />
              </button>
            </form>
          </div>
        )}
      </header>
      {tab !== "Compare" ? (
        <>
          <div className="category-bar">
            <div className="categories">
              {categories.map((c, i) => {
                const Icon = categoryIcons[i];
                return (
                  <button
                    className={cat === c ? "selected" : ""}
                    key={c}
                    onClick={() => setCat(c)}
                  >
                    <Icon size={23} strokeWidth={1.5} />
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
            <button className="filter-button" onClick={() => setFilters(true)}>
              <SlidersHorizontal size={17} />
              Filters{(maxPrice < 100 || minSpeed > 0 || standup) && <i />}
            </button>
          </div>
          <main id="results">
            <div className="intro">
              <div>
                <div className="eyebrow">
                  <span /> THE BUSINESS JET COLLECTION
                </div>
                <h1>
                  {savedOnly
                    ? "Your next chapter, saved."
                    : tab === "Interior"
                      ? "A different class of cabin."
                      : "Find your extraordinary."}
                </h1>
                <p>
                  {tab === "Interior"
                    ? "Thoughtful spaces. Exceptional comfort. Discover life above the clouds."
                    : "From your next connection to your next continent. Find the jet that takes you there."}
                </p>
              </div>
              <div className="result-controls">
                <span>{filtered.length} aircraft to explore</span>
                <select
                  aria-label="Sort aircraft"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {[
                    "Recommended",
                    "Range: longest first",
                    "Price: low to high",
                    "Speed: fastest first",
                    "Cabin: largest first",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            {active && (
              <div className="filter-summary">
                <span>
                  {savedOnly
                    ? "Saved aircraft"
                    : cat !== "All aircraft"
                      ? cat
                      : "Filtered collection"}{" "}
                  · {filtered.length} results
                </span>
                <button onClick={reset}>
                  Clear all <X size={13} />
                </button>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="empty">
                <Search size={36} />
                <h2>
                  {savedOnly
                    ? "Your collection starts here."
                    : "No aircraft match just yet."}
                </h2>
                <p>
                  {savedOnly
                    ? "Tap a heart on any aircraft to save it for later."
                    : "Try a shorter range or a different passenger count."}
                </p>
                <button className="primary" onClick={reset}>
                  Explore all aircraft <ArrowRight size={17} />
                </button>
              </div>
            ) : active || sort !== "Recommended" ? (
              <div className="jet-grid">
                {sorted.map((j) => (
                  <Card jet={j} key={j.id} />
                ))}
              </div>
            ) : (
              <>
                <Shelf
                  renderCard={(j) => <Card jet={j} key={j.id} />}
                  title={
                    tab === "Interior"
                      ? "Room to make yourself at home"
                      : "Go further. Arrive extraordinary."
                  }
                  sub={
                    tab === "Interior"
                      ? "Flagship cabins, designed around you."
                      : "Long-range icons. A world of possibilities."
                  }
                  items={sorted.filter((j) => j.range >= 5000)}
                />
                <Shelf
                  renderCard={(j) => <Card jet={j} key={j.id} />}
                  title={
                    tab === "Interior"
                      ? "Your own space above it all"
                      : "The sweet spot of business aviation"
                  }
                  sub={
                    tab === "Interior"
                      ? "Space to work, connect, and completely switch off."
                      : "Impressive capability. Perfectly balanced."
                  }
                  items={sorted.filter(
                    (j) => j.range < 5000 && j.range >= 2700,
                  )}
                />
                <div className="editorial">
                  <div className="editorial-icon">
                    <Compass size={34} strokeWidth={1.2} />
                  </div>
                  <div>
                    <span className="eyebrow">A CLEARER PERSPECTIVE</span>
                    <h3>The right aircraft is in the details.</h3>
                    <p>
                      Bring your shortlist together. Compare performance, space,
                      and possibility.
                    </p>
                  </div>
                  <button onClick={() => setTab("Compare")}>
                    Compare aircraft <ArrowUpRight size={19} />
                  </button>
                </div>
                <Shelf
                  renderCard={(j) => <Card jet={j} key={j.id} />}
                  title={
                    tab === "Interior"
                      ? "Small aircraft. Considered comfort."
                      : "Closer destinations. Bigger possibilities."
                  }
                  sub="Discover the light and very light jet collection."
                  items={sorted.filter((j) => j.range < 2700)}
                />
              </>
            )}
          </main>
        </>
      ) : (
        <main className="compare-main">
          <div className="eyebrow">
            <span /> YOUR AIRCRAFT, SIDE BY SIDE
          </div>
          <div className="compare-heading">
            <div>
              <h1>Make the right connection.</h1>
              <p>
                A closer look at what sets your shortlist apart. Compare up to
                three aircraft.
              </p>
            </div>
            {selected.length > 0 && (
              <button className="text-button" onClick={() => setSelected([])}>
                Clear comparison <RotateCcw size={15} />
              </button>
            )}
          </div>
          <div className="compare-picker">
            {[0, 1, 2].map((i) => (
              <label key={i}>
                <span>Aircraft {String(i + 1).padStart(2, "0")}</span>
                <select
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
                </select>
              </label>
            ))}
          </div>
          {comparison.length === 0 ? (
            <div className="empty compare-empty">
              <Columns3 size={45} strokeWidth={1.2} />
              <h2>Your shortlist. A clearer picture.</h2>
              <p>
                Select aircraft above, or add them as you explore the
                collection.
              </p>
              <button className="primary" onClick={() => setTab("Performance")}>
                Explore the collection <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div className="comparison-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>
                      <span className="eyebrow">THE SHORTLIST</span>
                      <p>{comparison.length} of 3 aircraft</p>
                    </th>
                    {comparison.map((j) => (
                      <th key={j.id}>
                        <div className="compare-photo">
                          <Photo src={j.image} alt={j.Model} />
                          <button
                            aria-label={`Remove ${j.Model}`}
                            onClick={() => toggleCompare(j.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="maker">{maker(j.manufacturers)}</p>
                        <h2>{displayName(j.Model)}</h2>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Overview",
                      [
                        ["Category", "business_jet_category", ""],
                        ["Base price", "base_price", ""],
                        ["Model year", "model_year", ""],
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
                    />
                  ))}
                  <tr className="notes-row">
                    <th>Range conditions</th>
                    {comparison.map((j) => (
                      <td key={j.id}>
                        {j.max_range_condition || "Not provided"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}
      <footer>
        <div className="footer-brand">
          ELITE WINGS <span>Perspective for your next horizon.</span>
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
      {selected.length > 0 && tab !== "Compare" && (
        <div className="compare-tray">
          <div className="tray-title">
            <Columns3 size={20} />
            <strong>Your shortlist</strong>
            <span>{selected.length}/3</span>
          </div>
          <div className="tray-jets">
            {comparison.map((j) => (
              <button
                key={j.id}
                onClick={() => toggleCompare(j.id)}
                title={`Remove ${j.Model}`}
              >
                <Photo src={j.image} alt="" />
                <span>{displayName(j.Model)}</span>
                <X size={13} />
              </button>
            ))}
          </div>
          <button className="primary" onClick={() => setTab("Compare")}>
            Compare aircraft <ArrowRight size={17} />
          </button>
          <button
            className="tray-clear"
            aria-label="Clear shortlist"
            onClick={() => setSelected([])}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {filters && (
        <div className="modal-backdrop" onClick={() => setFilters(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Filter aircraft"
            className="filter-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>Refine your flight</h2>
              <button
                autoFocus
                aria-label="Close filters"
                onClick={() => setFilters(false)}
              >
                <X />
              </button>
            </div>
            <p>Find the aircraft that fits your mission.</p>
            <label className="range-filter">
              Maximum base price <strong>${maxPrice}M</strong>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <span>
                $5M<span>$100M</span>
              </span>
            </label>
            <label className="range-filter">
              Minimum high-speed cruise{" "}
              <strong>{minSpeed ? `${minSpeed} ktas` : "Any speed"}</strong>
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={minSpeed}
                onChange={(e) => setMinSpeed(Number(e.target.value))}
              />
            </label>
            <label className="mobile-passengers">
              Minimum passengers
              <select
                aria-label="Filter minimum passengers"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              >
                <option value={0}>Any group size</option>
                {[4, 6, 8, 10, 12, 16].map((n) => (
                  <option key={n} value={n}>
                    {n}+ passengers
                  </option>
                ))}
              </select>
            </label>
            <label className="check-filter">
              <div>
                <strong>Stand-up cabin</strong>
                <p>Cabin height of at least 6 ft</p>
              </div>
              <input
                type="checkbox"
                checked={standup}
                onChange={(e) => setStandup(e.target.checked)}
              />
            </label>
            <div className="modal-footer">
              <button
                className="text-button"
                onClick={() => {
                  setMaxPrice(100);
                  setMinSpeed(0);
                  setStandup(false);
                }}
              >
                Reset filters
              </button>
              <button className="primary" onClick={() => setFilters(false)}>
                Show {filtered.length} aircraft <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
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
            <button
              autoFocus
              className="detail-close"
              aria-label="Close aircraft details"
              onClick={() => setDetail(null)}
            >
              <X size={21} />
            </button>
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
                {tab === "Interior"
                  ? "Life on board"
                  : "Designed for your next horizon"}
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
                <button
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
                </button>
                <button
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
                </button>
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
}: {
  section: string;
  fields: string[][];
  items: Jet[];
}) {
  return (
    <>
      <tr className="table-section">
        <th colSpan={items.length + 1}>{section}</th>
      </tr>
      {fields.map(([label, key, unit]) => (
        <tr key={key}>
          <th>{label}</th>
          {items.map((j) => (
            <td key={j.id}>
              {key === "base_price"
                ? j.base_price
                  ? `$${fmt(j.base_price)}`
                  : "Not provided"
                : fmt(j[key as keyof Jet])}
              {j[key as keyof Jet] != null && unit && <small> {unit}</small>}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
