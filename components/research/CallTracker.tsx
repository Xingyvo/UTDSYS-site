"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ResearchReport } from "@/lib/content";
import type { PricePoint, Quote } from "@/lib/quotes";
import { UP, callStatus, formatPct, formatPrice, moveColor } from "@/lib/research";

const NAVY = "#1b2a4a";
const INK = "#0e1830";
const TARGET = "#1d3fb8";
const POLL_MS = 60_000;
const DAY = 86_400_000;

type Range = "call" | "1m" | "3m" | "6m" | "ytd" | "1y";
const RANGES: { id: Range; label: string }[] = [
  { id: "call", label: "Since call" },
  { id: "1m", label: "1M" },
  { id: "3m", label: "3M" },
  { id: "6m", label: "6M" },
  { id: "ytd", label: "YTD" },
  { id: "1y", label: "1Y" },
];

// The market's clock, not the viewer's: identical on server and client.
const dayFmt = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
const timeFmt = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});
// axis labels: "Oct 6" for short ranges, "Oct" (or the year in January) for long
const tickDayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
const tickMonthFmt = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "America/New_York" });
const nyMonth = (t: number) => new Date(t - 5 * 3_600_000).getUTCMonth();

const PAD = { top: 16, right: 64, bottom: 30, left: 4 };
const PILL_H = 18;

/** Round gridline values, about `n` of them, the way a price axis reads. */
function niceTicks(lo: number, hi: number, n: number) {
  const raw = (hi - lo) / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(+v.toFixed(6));
  return out;
}

const signed = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;

/** The call, charted live in the style of a quote page: entry, target, and where it trades now. */
export default function CallTracker({
  report,
  initial,
}: {
  report: ResearchReport;
  initial: Quote | null;
}) {
  const [quote, setQuote] = useState(initial);
  const [range, setRange] = useState<Range>("call");
  const [hover, setHover] = useState<number | null>(null);
  // Unknown until measured; the chart waits so it never forces the layout wide.
  const [width, setWidth] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const gid = useId().replace(/:/g, "");

  const callT = Date.parse(`${report.date}T00:00:00Z`);
  const call = report.priceAtPublication;
  const target = report.priceTarget;
  const years = parseInt(report.horizon ?? "1", 10) || 1;
  const horizonEnd = callT + years * 365 * DAY;

  // Refresh while the tab is visible; the server caches, so this is cheap.
  useEffect(() => {
    if (!report.quoteSymbol) return;
    const pull = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/quote?symbol=${encodeURIComponent(report.quoteSymbol!)}`);
        if (res.ok) setQuote(await res.json());
      } catch {
        /* keep the last good quote */
      }
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    document.addEventListener("visibilitychange", pull);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", pull);
    };
  }, [report.quoteSymbol]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width !== null && width < 640 ? 260 : 360;

  const points = useMemo<PricePoint[]>(() => {
    if (!quote) return [];
    const from =
      range === "call"
        ? callT - DAY
        : range === "ytd"
          ? Date.parse(`${new Date(quote.asOf).getUTCFullYear()}-01-01T00:00:00Z`)
          : quote.asOf - { "1m": 31, "3m": 92, "6m": 183, "1y": 365 }[range] * DAY;
    return quote.points.filter((p) => p.t >= from);
  }, [quote, range, callT]);

  const last = quote?.last ?? null;
  // Has the call closed? Judged on the full history, whatever range is shown.
  const status = useMemo(() => callStatus(report, quote?.points ?? []), [report, quote]);
  const closed = status.state === "closed" ? status : null;
  const toTarget = last === null ? null : target / last - 1;
  const priceProgress = closed
    ? Math.min(1, Math.max(0, (closed.price - call) / (target - call)))
    : last === null
      ? 0
      : Math.min(1, Math.max(0, (last - call) / (target - call)));
  // The call's age comes from the calendar, so it stays right when the feed is down.
  const [now] = useState(() => Date.now());
  const asOf = closed ? closed.t : (quote?.asOf ?? now);
  const timeProgress = Math.min(1, Math.max(0, (asOf - callT) / (horizonEnd - callT)));
  const dayN = Math.max(0, Math.floor((asOf - callT) / DAY));

  // The line takes one colour for the whole range: green if the range is up.
  const first = points[0]?.close ?? call;
  const end = points[points.length - 1]?.close ?? call;
  const lineColor = moveColor(end - first);
  const rangeChange = end / first - 1;

  // scales
  const chart = useMemo(() => {
    if (width === null || points.length < 2) return null;
    const t0 = points[0].t;
    const t1 = points[points.length - 1].t;
    const prices = points.map((p) => p.close);
    const pad = (Math.max(...prices, target, call) - Math.min(...prices, call)) * 0.06;
    const lo = Math.min(...prices, call) - pad;
    const hi = Math.max(...prices, target) + pad;
    const w = width - PAD.left - PAD.right;
    const h = height - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + ((t - t0) / (t1 - t0 || 1)) * w;
    const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * h;
    const line = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.close).toFixed(1)}`).join("");
    const base = (PAD.top + h).toFixed(1);
    const area = `${line}L${x(t1).toFixed(1)},${base}L${x(t0).toFixed(1)},${base}Z`;

    // date labels along the bottom
    const narrow = width < 640;
    let xTicks: { t: number; label: string }[] = [];
    if (t1 - t0 <= 70 * DAY) {
      const every = Math.max(1, Math.round(points.length / (narrow ? 3 : 5)));
      for (let i = every; i < points.length - 1; i += every)
        xTicks.push({ t: points[i].t, label: tickDayFmt.format(points[i].t) });
    } else {
      points.forEach((p, i) => {
        if (i === 0 || nyMonth(p.t) === nyMonth(points[i - 1].t)) return;
        const label = nyMonth(p.t) === 0 ? String(new Date(p.t).getUTCFullYear()) : tickMonthFmt.format(p.t);
        xTicks.push({ t: p.t, label });
      });
      const max = narrow ? 4 : 7;
      const k = Math.ceil(xTicks.length / max);
      xTicks = xTicks.filter((_, i) => i % k === 0);
    }
    xTicks = xTicks.filter((tk) => x(tk.t) > PAD.left + 20 && x(tk.t) < PAD.left + w - 20);

    return {
      width,
      x,
      y,
      w,
      h,
      t0,
      line,
      area,
      yTicks: niceTicks(lo, hi, narrow ? 4 : 6),
      xTicks,
      callX: x(Math.max(callT, t0)),
    };
  }, [points, width, height, call, target, callT]);

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!chart) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left + PAD.left;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(chart.x(p.t) - px) < Math.abs(chart.x(points[best].t) - px)) best = i;
    });
    setHover(best);
  };

  const hp = hover !== null ? points[hover] : null;
  const lastPt = points[points.length - 1];

  // The headline follows the crosshair, as on a quote page.
  const shown = hp?.close ?? last;
  const shownChange = shown === null ? null : shown - call;

  // Price tags on the right edge. Placed in priority order; a tag that would
  // overlap one already placed is dropped, and so is any gridline label it covers.
  const pills: { v: number; text: string; fill: string; y: number }[] = [];
  if (chart) {
    const want = [
      hp && { v: hp.close, fill: INK },
      lastPt && { v: lastPt.close, fill: lineColor },
      { v: target, fill: TARGET },
      { v: call, fill: "#8a93a6" },
    ];
    for (const p of want) {
      if (!p) continue;
      const y = chart.y(p.v);
      if (pills.some((q) => Math.abs(q.y - y) < PILL_H + 1)) continue;
      pills.push({ ...p, y, text: p.v.toFixed(2) });
    }
  }
  const clearOfPills = (y: number) => pills.every((p) => Math.abs(p.y - y) > PILL_H / 2 + 6);

  return (
    <section aria-labelledby="tracker" className="relative mt-6 rounded-sm border border-navy/12 bg-white p-5 md:p-10">
      {/* once a call closes, say so first: its result no longer moves */}
      {closed && (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm border-l-4 border-signal-deep bg-signal/[0.06] px-4 py-3 text-sm text-navy/80">
          <span className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-signal-deep">
            Call closed · {closed.label}
          </span>
          <span>
            Closed {dayFmt.format(closed.t)} at{" "}
            <span className="font-semibold tabular-nums text-ink">{formatPrice(report.currency, closed.price)}</span>, a{" "}
            <span className="font-semibold tabular-nums text-ink">{formatPct(closed.ret)}</span> return from the call. The
            chart keeps running for reference.
          </span>
        </div>
      )}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="tracker" className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-ink">
            {report.exchange}: {report.ticker}
          </h2>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              key={hp ? "hover" : (last ?? "none")}
              className={`font-display text-5xl font-semibold tracking-tight text-ink md:text-6xl ${hp ? "" : "tracker-tick"}`}
              style={{ "--tick": last === null ? NAVY : moveColor(last - call) } as React.CSSProperties}
            >
              {shown === null ? "—" : formatPrice(report.currency, shown)}
            </span>
            {shownChange !== null && (
              <span
                className="text-lg font-semibold tabular-nums md:text-xl"
                style={{ color: moveColor(shownChange) }}
              >
                {signed(shownChange)} ({formatPct(shownChange / call)})
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-navy/55">
            {hp
              ? `${dayFmt.format(hp.t)} · vs the call at ${formatPrice(report.currency, call)}`
              : quote
                ? `Since the call at ${formatPrice(report.currency, call)} · As of ${timeFmt.format(quote.asOf)} ET`
                : `Called at ${formatPrice(report.currency, call)}`}
          </p>
        </div>

        {quote ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-3 py-1 text-xs font-medium text-navy/70">
            <span className="relative flex h-2 w-2">
              {quote.open && (
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: UP }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: quote.open ? UP : "rgb(27 42 74 / 0.3)" }}
              />
            </span>
            {quote.open ? "Live" : "Market closed"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-3 py-1 text-xs font-medium text-navy/60">
            <span className="h-2 w-2 rounded-full bg-navy/25" />
            Prices temporarily unavailable
          </span>
        )}
      </div>

      {/* ranges, as a row of tabs; the range's own change sits at the end */}
      <div className="relative mt-6 flex items-center justify-between gap-3 border-b border-navy/10 pb-3">
        <div className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1.5 sm:px-3 text-sm font-semibold transition ${
                range === r.id ? "bg-signal/10 text-signal-deep" : "text-navy/55 hover:bg-navy/5 hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {points.length > 1 && range !== "call" && (
          <span className="hidden shrink-0 text-sm font-semibold tabular-nums sm:block" style={{ color: lineColor }}>
            {formatPct(rangeChange)}
          </span>
        )}
      </div>

      {/* the chart */}
      <div ref={boxRef} className="relative mt-4 select-none" style={{ height }}>
        {chart && (
          <svg
            width={chart.width}
            height={height}
            className="absolute inset-0 overflow-visible font-sans"
            role="img"
            aria-label={`${report.company} share price, ${points.length} trading days. Called at ${formatPrice(report.currency, call)}, target ${formatPrice(report.currency, target)}${last !== null ? `, now ${formatPrice(report.currency, last)}` : ""}.`}
          >
            <defs>
              <linearGradient id={`${gid}-area`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={lineColor} stopOpacity="0.24" />
                <stop offset="1" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* price grid, labelled on the right */}
            {chart.yTicks.map((v) => (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + chart.w}
                  y1={chart.y(v)}
                  y2={chart.y(v)}
                  stroke={NAVY}
                  strokeOpacity="0.07"
                />
                {clearOfPills(chart.y(v)) && (
                  <text
                    x={PAD.left + chart.w + 8}
                    y={chart.y(v) + 4}
                    className="fill-navy/50 text-[11px] tabular-nums"
                  >
                    {v.toFixed(2)}
                  </text>
                )}
              </g>
            ))}

            {/* dates along the bottom */}
            <line
              x1={PAD.left}
              x2={PAD.left + chart.w}
              y1={PAD.top + chart.h}
              y2={PAD.top + chart.h}
              stroke={NAVY}
              strokeOpacity="0.15"
            />
            {chart.xTicks.map((tk) => (
              <text
                key={tk.t}
                x={chart.x(tk.t)}
                y={height - 8}
                textAnchor="middle"
                className="fill-navy/50 text-[11px]"
              >
                {tk.label}
              </text>
            ))}

            {/* the call price: a dotted reference line, like a previous close */}
            <line
              x1={PAD.left}
              x2={PAD.left + chart.w}
              y1={chart.y(call)}
              y2={chart.y(call)}
              stroke={NAVY}
              strokeOpacity="0.45"
              strokeDasharray="1 3"
              strokeLinecap="round"
            />

            {/* target */}
            <line
              x1={PAD.left}
              x2={PAD.left + chart.w}
              y1={chart.y(target)}
              y2={chart.y(target)}
              stroke={TARGET}
              strokeOpacity="0.7"
              strokeDasharray="6 6"
              className="tracker-march"
            />

            {/* price */}
            <g key={range}>
              <path d={chart.area} fill={`url(#${gid}-area)`} className="tracker-fade" />
              <path
                d={chart.line}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1}
                className="tracker-draw"
              />
            </g>

            {/* the day of the call */}
            {callT >= chart.t0 && (
              <g transform={`translate(${chart.callX}, ${chart.y(call)})`}>
                <circle r="8" fill={NAVY} fillOpacity="0.1" />
                <circle r="3.5" fill={NAVY} />
              </g>
            )}

            {/* the day the call closed, if it's in range */}
            {closed && closed.t >= chart.t0 && (
              <g transform={`translate(${chart.x(closed.t)}, ${chart.y(closed.price)})`}>
                <line y1={-10} y2={-(chart.y(closed.price) - PAD.top)} stroke={TARGET} strokeOpacity="0.35" strokeDasharray="2 3" />
                <circle r="9" fill={TARGET} fillOpacity="0.14" />
                <circle r="4.5" fill={TARGET} stroke="white" strokeWidth="2" />
              </g>
            )}

            {/* now */}
            {lastPt && !hp && (
              <g transform={`translate(${chart.x(lastPt.t)}, ${chart.y(lastPt.close)})`}>
                {quote?.open && <circle r="6" fill={lineColor} className="tracker-pulse" />}
                <circle r="4" fill={lineColor} stroke="white" strokeWidth="2" />
              </g>
            )}

            {/* crosshair */}
            {hp && (
              <g pointerEvents="none">
                <line
                  x1={chart.x(hp.t)}
                  x2={chart.x(hp.t)}
                  y1={PAD.top}
                  y2={PAD.top + chart.h}
                  stroke={NAVY}
                  strokeOpacity="0.45"
                  strokeDasharray="3 3"
                />
                <line
                  x1={PAD.left}
                  x2={PAD.left + chart.w}
                  y1={chart.y(hp.close)}
                  y2={chart.y(hp.close)}
                  stroke={NAVY}
                  strokeOpacity="0.45"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={chart.x(hp.t)}
                  cy={chart.y(hp.close)}
                  r="4.5"
                  fill={lineColor}
                  stroke="white"
                  strokeWidth="2"
                />
                <g
                  transform={`translate(${Math.min(Math.max(chart.x(hp.t), PAD.left + 44), PAD.left + chart.w - 44)}, ${PAD.top + chart.h + 3})`}
                >
                  <rect x="-44" width="88" height={PILL_H} rx="3" fill={INK} />
                  <text y="12.5" textAnchor="middle" className="fill-white text-[11px] font-medium">
                    {dayFmt.format(hp.t)}
                  </text>
                </g>
              </g>
            )}

            {/* price tags on the axis */}
            {pills.map((p) => (
              <g key={p.fill} transform={`translate(${PAD.left + chart.w + 2}, ${p.y - PILL_H / 2})`}>
                <rect width={PAD.right - 4} height={PILL_H} rx="3" fill={p.fill} />
                <text
                  x={(PAD.right - 4) / 2}
                  y="12.5"
                  textAnchor="middle"
                  className="fill-white text-[11px] font-semibold tabular-nums"
                >
                  {p.text}
                </text>
              </g>
            ))}

            <rect
              x={PAD.left}
              y={0}
              width={chart.w}
              height={height}
              fill="transparent"
              style={{ touchAction: "pan-y" }}
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => setHover(null)}
              onPointerCancel={() => setHover(null)}
            />
          </svg>
        )}

        {!chart && width !== null && (
          <div className="flex h-full items-center justify-center text-sm text-navy/40">
            {quote ? "Not enough data for this range" : "Live prices are temporarily unavailable. The call's entry and target are shown above."}
          </div>
        )}
      </div>

      {/* what the two reference lines are */}
      {chart && (
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-navy/60">
          <li className="flex items-center gap-2">
            <svg width="18" height="2" aria-hidden="true">
              <line x1="1" x2="17" y1="1" y2="1" stroke={NAVY} strokeOpacity="0.6" strokeDasharray="1 3" strokeLinecap="round" />
            </svg>
            The call <span className="font-semibold tabular-nums text-ink">{formatPrice(report.currency, call)}</span>
          </li>
          <li className="flex items-center gap-2">
            <svg width="18" height="2" aria-hidden="true">
              <line x1="0" x2="18" y1="1" y2="1" stroke={TARGET} strokeDasharray="4 3" />
            </svg>
            {report.horizon ?? "12-month"} target{" "}
            <span className="font-semibold tabular-nums text-ink">{formatPrice(report.currency, target)}</span>
          </li>
        </ul>
      )}

      {/* progress: price vs time */}
      <dl className="relative mt-8 grid gap-6 border-t border-navy/10 pt-6 font-mono text-[0.75rem] uppercase tracking-[0.08em] md:grid-cols-3">
        {closed ? (
          <div>
            <dt className="text-navy/45">Return, locked at close</dt>
            <dd className="font-display mt-1 text-2xl font-semibold normal-case tracking-tight text-ink">
              {formatPct(closed.ret)}
            </dd>
          </div>
        ) : (
          <div>
            <dt className="text-navy/45">To target</dt>
            <dd className="font-display mt-1 text-2xl font-semibold normal-case tracking-tight text-ink">
              {toTarget === null ? "—" : formatPct(toTarget)}
            </dd>
          </div>
        )}
        <Rail
          label="Price, call → target"
          value={priceProgress}
          note={last === null && !closed ? "—" : `${Math.round(priceProgress * 100)}% of the way`}
          color={UP}
        />
        <Rail
          label={`Time, ${report.horizon ?? "12-month"} hold`}
          value={timeProgress}
          note={`Day ${dayN} of ${Math.round((horizonEnd - callT) / DAY)}`}
          color="rgb(27 42 74 / 0.4)"
        />
      </dl>
    </section>
  );
}

function Rail({ label, value, note, color }: { label: string; value: number; note: string; color: string }) {
  return (
    <div>
      <dt className="flex justify-between text-navy/45">
        <span>{label}</span>
        <span className="tabular-nums text-navy/70">{note}</span>
      </dt>
      <dd className="mt-3 h-1.5 overflow-hidden rounded-sm bg-navy/10">
        <div
          className="tracker-grow h-full rounded-sm"
          style={{ width: `${Math.max(value * 100, 1.5)}%`, background: color }}
        />
      </dd>
    </div>
  );
}
