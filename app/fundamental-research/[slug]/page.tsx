import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import content from "@/lib/content";
import { formatDate, formatPct, formatPrice, upside } from "@/lib/research";
import { eyebrow, pageTitle, sectionHeading, subHeading } from "@/lib/type";
import { fetchQuote } from "@/lib/quotes";
import RatingBadge from "@/components/research/RatingBadge";
import CallTracker from "@/components/research/CallTracker";
import Disclosures from "@/components/research/Disclosures";
import ReportRecord from "@/components/research/ReportRecord";
import JoinFooter from "@/components/research/JoinFooter";

const { backLabel, reportHeading, reportPending, model, reports } =
  content.fundamentalResearch;

type Props = { params: Promise<{ slug: string }> };

// Only the reports in content exist; anything else is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => reports.map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = reports.find((r) => r.slug === slug);
  if (!report) return {};
  return {
    title: `${report.company} (${report.exchange}:${report.ticker}) — UofT Decision Systems`,
    description: `${report.rating}: ${report.headline}. ${report.summary}`,
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const report = reports.find((r) => r.slug === slug);
  if (!report) notFound();
  const quote = report.quoteSymbol ? await fetchQuote(report.quoteSymbol, report.date) : null;

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-28 sm:pt-36">
        <Link
          href="/fundamental-research/reports"
          className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-navy/60 transition hover:text-signal-deep"
        >
          <span aria-hidden="true" className="transition group-hover:-translate-x-1">
            ←
          </span>
          {backLabel}
        </Link>

        {/* the call in one line; the full card lives on the index */}
        <header className="mt-6 flex flex-wrap items-end justify-between gap-8 border-b border-navy/12 pb-8">
          <div className="max-w-3xl">
            <p className={eyebrow}>
              {report.exchange}: {report.ticker} · Published {formatDate(report.date)}
            </p>
            <h1 className={`${pageTitle} mt-4`}>{report.company}</h1>
            <p className="font-display mt-3 text-xl leading-snug tracking-tight text-signal-deep md:text-2xl">
              {report.headline}
            </p>
            <p className="mt-3 text-base font-medium text-ink">{report.analysts.join(" · ")}</p>
          </div>
          <div className="flex items-center gap-6 font-mono tabular-nums">
            <RatingBadge rating={report.rating} size="lg" />
            <div>
              <div className="text-[0.75rem] uppercase tracking-[0.08em] text-navy/45">
                {report.horizon ?? "12-month"} target
              </div>
              <div className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink [font-variant-numeric:normal]">
                {formatPrice(report.currency, report.priceTarget)}
              </div>
              <div className="text-xs text-navy/55">
                {formatPct(upside(report))} from{" "}
                {formatPrice(report.currency, report.priceAtPublication)}
              </div>
            </div>
          </div>
        </header>

        {report.quoteSymbol && <CallTracker report={report} initial={quote} />}

        {/* the write-up itself */}
        <section aria-labelledby="full-report" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="full-report" className={sectionHeading}>
              {reportHeading}
            </h2>
            {report.pdf && (
              <a
                href={report.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.9375rem] font-medium text-signal-deep underline decoration-signal-deep/30 underline-offset-4 transition hover:decoration-signal-deep"
              >
                Open PDF ↗
              </a>
            )}
          </div>
          {report.pdf ? (
            <object
              data={report.pdf}
              type="application/pdf"
              className="mt-6 h-[85vh] w-full rounded-sm border border-navy/12 bg-white"
            >
              <p className="p-8 text-sm text-navy/60">
                This browser can&apos;t show the PDF inline.{" "}
                <a href={report.pdf} className="text-signal-deep underline">
                  Download it
                </a>
                .
              </p>
            </object>
          ) : report.model ? (
            <div className="mt-6 rounded-sm border border-navy/12 bg-white">
              <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="font-display text-xl font-semibold tracking-tight text-ink">{model.title}</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy/65">{model.body}</p>
                </div>
                <a
                  href={report.model.file}
                  download
                  className="inline-flex shrink-0 items-center rounded-full bg-signal-deep px-6 py-3 text-sm font-medium text-white transition hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {model.download}
                </a>
              </div>

              {/* the model's inputs and the two prices it blends, so the call reads without Excel */}
              <div className="grid border-t border-navy/10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="p-6 sm:p-8">
                  <h3 className={subHeading}>
                    {model.assumptionsHeading}
                  </h3>
                  <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                    {report.model.assumptions.map((a) => (
                      <div key={a.label} className="flex flex-col justify-between">
                        <dt className="text-sm leading-snug text-navy/60">{a.label}</dt>
                        <dd className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink">{a.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="border-t border-navy/10 bg-offwhite/70 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <h3 className={subHeading}>
                    {model.methodsHeading}
                  </h3>
                  <dl className="mt-5 divide-y divide-navy/10 border-y border-navy/10 text-sm tabular-nums">
                    {report.model.methods.map((m) => (
                      <div key={m.label} className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="text-navy/70">
                          {m.label}
                          <span className="ml-2 text-navy/45">{Math.round(m.weight * 100)}%</span>
                        </dt>
                        <dd className="text-ink">{formatPrice(report.currency, m.price)}</dd>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="font-medium text-ink">{model.blendLabel}</dt>
                      <dd className="font-display text-2xl font-semibold tracking-tight text-ink">
                        {formatPrice(
                          report.currency,
                          report.model.methods.reduce((sum, m) => sum + m.price * m.weight, 0),
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex min-h-[14rem] sm:min-h-[22rem] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-navy/20 bg-white/40 px-6 text-center">
              <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-navy/45">
                PDF · {report.exchange}:{report.ticker}
              </span>
              <p className="font-display text-xl font-semibold tracking-tight text-ink">
                Full Report Coming Soon
              </p>
              <p className="max-w-md text-sm text-navy/55">{reportPending}</p>
            </div>
          )}
        </section>

        <ReportRecord report={report} />

        <JoinFooter className="mt-24" />
        <Disclosures />
      </div>
    </main>
  );
}
