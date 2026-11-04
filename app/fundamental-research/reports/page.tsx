import Link from "next/link";
import content from "@/lib/content";
import { benchmarkFor, byNewest, callStatus, closeOnOrAfter, closeOnOrBefore } from "@/lib/research";
import { fetchQuote } from "@/lib/quotes";
import ReportExhibit from "@/components/research/ReportExhibit";
import TrackRecordTable, { type TrackRow } from "@/components/research/TrackRecordTable";
import Disclosures from "@/components/research/Disclosures";
import JoinFooter from "@/components/research/JoinFooter";
import { eyebrow, pageTitle, sectionHeading } from "@/lib/type";

export const metadata = {
  title: "Published Research — UofT Decision Systems",
  description:
    "Published fundamental research from UofT Decision Systems: every call, dated, with its entry price, target, and performance against its benchmark.",
};

const {
  reportsHeading: heading,
  reportsIntro,
  sampleNotice,
  coverageHeading,
  allHeading,
  trackNote,
  reports,
} = content.fundamentalResearch;

const monthYear = new Intl.DateTimeFormat("en-CA", { month: "short", year: "numeric", timeZone: "UTC" });

/**
 * Each call's return and its benchmark's over the same span: to today while
 * the call is open, and frozen at the closing day once it has closed.
 */
async function trackRecord(): Promise<TrackRow[]> {
  const published = reports.filter((r) => !r.sample);
  const oldest = published.map((r) => r.date).sort()[0];
  const benchSymbols = [...new Set(published.map((r) => benchmarkFor(r).symbol))];
  const [quotes, benches] = await Promise.all([
    Promise.all(published.map((r) => (r.quoteSymbol ? fetchQuote(r.quoteSymbol, r.date) : null))),
    Promise.all(benchSymbols.map((s) => fetchQuote(s, oldest))),
  ]);
  const bench = new Map(benchSymbols.map((s, i) => [s, benches[i]]));

  return published.map((r, i) => {
    const q = quotes[i];
    const b = benchmarkFor(r);
    const bq = bench.get(b.symbol);
    // a hand-entered close needs no prices; the rule needs the history
    const status = r.closed || q ? callStatus(r, q?.points ?? []) : null;
    const closed = status?.state === "closed" ? status : null;
    const current = closed ? closed.price : (q?.last ?? null);
    const ret = current === null ? null : current / r.priceAtPublication - 1;
    const benchStart = bq ? closeOnOrAfter(bq.points, r.date) : null;
    const benchEnd = bq ? (closed ? closeOnOrBefore(bq.points, closed.t) : bq.last) : null;
    const benchRet = benchStart && benchEnd ? benchEnd / benchStart - 1 : null;
    return {
      status: status === null ? null : closed ? { label: closed.label, t: closed.t } : { label: "Open", t: null },
      slug: r.slug,
      company: r.company,
      ticker: r.ticker,
      exchange: r.exchange,
      date: r.date,
      rating: r.rating,
      currency: r.currency,
      entry: r.priceAtPublication,
      target: r.priceTarget,
      current,
      ret,
      relative: ret !== null && benchRet !== null ? ret - benchRet : null,
      benchmark: b.short,
    };
  });
}

export default async function PublishedResearchPage() {
  const sorted = [...reports].sort(byNewest);
  const hasSamples = sorted.some((r) => r.sample);
  const rows = await trackRecord();

  const facts = [
    { label: "Calls Published", value: String(rows.length) },
    { label: "Latest", value: sorted.length ? monthYear.format(new Date(`${sorted[0].date}T00:00:00Z`)) : "—" },
    { label: "Coverage", value: "NYSE · NASDAQ · TSX" },
    { label: "Benchmarks", value: "S&P 500 · S&P/TSX" },
  ];

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6 pt-28 sm:pt-36">
        {/* masthead: what this is, and the record at a glance */}
        <header className="border-b border-navy/12 pb-10">
          <p className={eyebrow}>Fundamental Research</p>
          <div className="mt-4">
            <div className="max-w-3xl">
              <h1 className={pageTitle}>
                {heading}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-navy/70">{reportsIntro}</p>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 border-t border-navy/8 pt-8 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-navy/55">{f.label}</dt>
                  <dd className="font-display whitespace-nowrap text-xl font-semibold tracking-tight text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {hasSamples && (
          <p className="mt-6 rounded-md border border-dashed border-navy/20 px-4 py-3 font-mono text-[0.75rem] uppercase leading-relaxed tracking-[0.08em] text-navy/50">
            {sampleNotice}
          </p>
        )}

        {/* every report, newest first, one at a time with its neighbours
            beside it; the front card opens its page */}
        <section aria-labelledby="coverage" className="mt-12">
          <h2 id="coverage" className="sr-only">
            {coverageHeading}
          </h2>
          <ReportExhibit reports={sorted} label={coverageHeading} />
        </section>

        {/* the record: every call and how it has done since publication */}
        <section aria-labelledby="track-record" className="mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5">
            <h2 id="track-record" className={sectionHeading}>
              {allHeading}
            </h2>
            <span className="text-sm text-navy/50">Select a column to sort.</span>
          </div>
          {/* if the feed is down, say so rather than leave a column of dashes unexplained */}
          {rows.length > 0 && rows.every((r) => r.current === null) && (
            <p className="mb-4 rounded-sm border border-navy/12 bg-white px-4 py-3 text-sm text-navy/65">
              Live prices are temporarily unavailable. Entry prices and targets are shown; returns will update when
              prices are back.
            </p>
          )}
          <TrackRecordTable rows={rows} />
          <p className="mt-4 max-w-4xl text-xs leading-relaxed text-navy/50">{trackNote}</p>
        </section>

        {/* the full method lives on the What We Do page */}
        <p className="mt-16 border-t border-navy/12 pt-8 text-[0.9375rem] leading-relaxed text-navy/70">
          Every call goes through the same six-step process, from screen to monitor.{" "}
          <Link
            href="/fundamental-research#process"
            className="font-semibold text-signal-deep underline decoration-signal-deep/30 underline-offset-4 transition hover:decoration-signal-deep"
          >
            See how we research a name
          </Link>
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-28">
        <JoinFooter className="mt-24" />
        <Disclosures />
      </div>
    </main>
  );
}
