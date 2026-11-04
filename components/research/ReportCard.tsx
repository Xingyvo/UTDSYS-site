import Link from "next/link";
import type { ResearchReport } from "@/lib/content";
import { formatDate, formatPct, formatPrice, upside } from "@/lib/research";
import RatingBadge from "@/components/research/RatingBadge";

/** A report's summary card on the index; the whole card opens its page. */
export default function ReportCard({ report }: { report: ResearchReport }) {
  return (
    <Link
      href={`/fundamental-research/${report.slug}`}
      className="group grid overflow-hidden rounded-sm border border-navy/12 bg-white/60 transition hover:border-navy/30 hover:shadow-[0_12px_40px_-20px_rgb(14_24_48/0.35)] lg:grid-cols-[1.6fr_1fr]"
    >
      <div className="flex flex-col p-6 sm:p-8 md:p-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy/60">
          <span className="font-mono font-semibold tracking-[0.04em] text-ink">
            {report.exchange}: {report.ticker}
          </span>
          {report.sample && (
            <span className="rounded-sm border border-dashed border-navy/25 px-1.5 text-xs text-navy/50">
              Sample
            </span>
          )}
          <span className="ml-auto">{formatDate(report.date)}</span>
        </div>
        <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {report.company}
        </h2>
        <p className="font-display mt-3 text-xl leading-snug tracking-tight text-signal-deep md:text-2xl">
          {report.headline}
        </p>
        <p className="mt-3 text-base font-medium text-ink">{report.analysts.join(" · ")}</p>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-navy/70">{report.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 pt-8">
          {/* only say what's there; nothing is promised before it's published */}
          {(report.pdf || report.model) && (
            <span className="inline-flex items-center rounded-full border border-navy/15 px-6 py-3 text-sm font-medium text-navy/50">
              {report.pdf ? "Full Report Available" : "Full Model Available"}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-signal-deep">
            Track the Call
            <span aria-hidden="true" className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>

      {/* the call and the numbers */}
      <aside className="border-t border-navy/10 bg-offwhite/70 p-6 sm:p-8 md:p-10 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-navy/45">
            Rating
          </span>
          <RatingBadge rating={report.rating} size="lg" />
        </div>
        <div className="mt-8 font-mono tabular-nums">
          <span className="text-[0.75rem] uppercase tracking-[0.08em] text-navy/45">
            {report.horizon ?? "12-month"} price target
          </span>
          <div className="font-display mt-2 text-5xl font-semibold tracking-tight text-ink [font-variant-numeric:lining-nums]">
            {formatPrice(report.currency, report.priceTarget)}
          </div>
          <div className="mt-2 text-sm text-navy/60">
            {formatPct(upside(report))} from {formatPrice(report.currency, report.priceAtPublication)}
          </div>
        </div>
        <dl className="mt-8 divide-y divide-navy/10 border-t border-navy/10 font-mono text-sm tabular-nums">
          {report.metrics.map((m) => (
            <div key={m.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 py-3">
              <dt className="text-[0.75rem] uppercase tracking-[0.08em] text-navy/50">{m.label}</dt>
              <dd className="whitespace-nowrap text-right text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </Link>
  );
}
