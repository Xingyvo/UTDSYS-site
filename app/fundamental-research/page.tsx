import Link from "next/link";
import Button from "@/components/ui/Button";
import JoinFooter from "@/components/research/JoinFooter";
import { sectionHeading } from "@/lib/type";
import RatingBadge from "@/components/research/RatingBadge";
import ProcessExplorer from "@/components/research/ProcessExplorer";
import content from "@/lib/content";
import { byNewest, formatDate, formatPct, formatPrice, upside } from "@/lib/research";

export const metadata = {
  title: "What We Do — Fundamental Research — UofT Decision Systems",
  description:
    "UofT Decision Systems Fundamental Research: bottom-up company research with a top-down view of the economy, focused on durable businesses the market has mispriced.",
};

const { about, reports, methodology } = content.fundamentalResearch;
const { hero, approach, coverage, process, latest } = about;

// Small uppercase type is kept for the hero's eyebrow only; everything else
// on the page reads as ordinary text.
const eyebrow = "font-mono text-[0.75rem] uppercase tracking-[0.1em]";
// each section hangs its title off one left rail, as on the quant page
const row = "grid grid-cols-1 gap-8 border-t border-navy/12 pt-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-0";

/** A section's title, set large enough to lead the section. */
function SectionTitle({ id, children, onDark = false }: { id: string; children: string; onDark?: boolean }) {
  return (
    <h2
      id={id}
      className={`${onDark ? sectionHeading.replace("text-ink", "text-white") : sectionHeading} scroll-mt-32 lg:pr-10`}
    >
      {children}
    </h2>
  );
}

/** A plain text link with an arrow that nudges on hover. */
function ArrowLink({ href, children, className = "" }: { href: string; children: string; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium transition ${className}`}>
      {children}
      <span aria-hidden="true" className="transition group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

export default function FundamentalAboutPage() {
  const newest = [...reports].filter((r) => !r.sample).sort(byNewest).slice(0, 2);

  return (
    <main className="relative min-h-screen overflow-x-clip">
      {/* hero: the page's name over a photo, darkened on the left so the text reads */}
      <section aria-labelledby="hero" className="relative isolate overflow-hidden bg-crest text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.image})` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(6_14_36/0.96)_0%,rgb(6_14_36/0.82)_38%,rgb(6_14_36/0.35)_75%,rgb(6_14_36/0.2)_100%)]"
        />
        {/* phones put the text over the whole photo, so darken it all */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgb(6_14_36/0.55)] md:hidden" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(0deg,rgb(6_14_36/0.85),transparent)]"
        />

        {/* a full-screen hero: fills the window, content centred, with a cue to scroll */}
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-6 pb-28 pt-32 sm:pt-36">
          <div className="max-w-3xl">
            <p className={`${eyebrow} text-[rgb(122_162_255)]`}>{hero.eyebrow}</p>
            <h1
              id="hero"
              className="font-display mt-5 text-balance text-[clamp(3.25rem,8.5vw,7rem)] font-semibold leading-[0.92] tracking-[-0.02em]"
            >
              {hero.title}
            </h1>
            <div aria-hidden="true" className="mt-8 flex gap-1.5">
              <span className="h-1.5 w-24 bg-white sm:w-36" />
              <span className="h-1.5 w-10 bg-signal sm:w-16" />
            </div>
            <p className="mt-8 max-w-[38rem] text-lg leading-relaxed text-white/75 sm:text-xl">{hero.body}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button href={hero.primary.href} variant="signal">
                {hero.primary.label}
              </Button>
              <ArrowLink href={hero.secondary.href} className="text-white/80 hover:text-white">
                {hero.secondary.label}
              </ArrowLink>
            </div>
          </div>

          {/* scroll cue: a moving line, jumps to the first section */}
          <a
            href="#approach"
            aria-label="Scroll to Investment Philosophy"
            className="absolute bottom-8 left-6 block h-10 w-px overflow-hidden bg-white/20"
          >
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-white" />
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-6 py-24 sm:space-y-28 sm:py-28">
        {/* philosophy: the stance, then the three principles */}
        <section aria-labelledby="approach" className={row}>
          <SectionTitle id="approach">{approach.heading}</SectionTitle>
          <div>
            <p className="max-w-3xl text-lg leading-relaxed text-navy/75 sm:text-xl">{approach.intro}</p>
            {/* a stacked list: title left, reasoning right */}
            <ul className="mt-12 border-t border-navy/12">
              {approach.items.map((a) => (
                <li
                  key={a.title}
                  className="group grid grid-cols-1 gap-3 border-b border-navy/12 py-8 transition-colors hover:bg-white/70 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6 sm:px-2"
                >
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-signal-deep sm:text-[1.75rem]">
                    {a.title}
                  </h3>
                  <p className="max-w-2xl text-base leading-relaxed text-navy/70 sm:pt-1.5">{a.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* coverage: open columns split by rules, like a fact sheet */}
        <section aria-labelledby="coverage" className={row}>
          <SectionTitle id="coverage">{coverage.heading}</SectionTitle>
          <ul className="grid grid-cols-1 divide-y divide-navy/12 md:grid-cols-3 md:divide-x md:divide-y-0">
            {coverage.items.map((c) => (
              <li key={c.title} className="py-6 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
                <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">{c.title}</h3>
                <p className="mt-2 text-[0.9375rem] font-medium text-signal-deep">{c.detail}</p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-navy/70">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* process, on a full-width navy band: pick a step to read it in full */}
      <section id="process" aria-labelledby="process-heading" className="blue-band scroll-mt-20 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-end lg:gap-0">
            <SectionTitle id="process-heading" onDark>
              {process.heading}
            </SectionTitle>
            <p className="max-w-2xl text-lg leading-relaxed text-white/70">{process.intro}</p>
          </div>
          <div className="mt-12">
            <ProcessExplorer steps={process.steps} label={process.heading} />
          </div>
          {/* the full method, Q-value framework included, for readers who want it */}
          <a
            href={methodology.file}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-white/80 transition hover:text-white"
          >
            {methodology.label}
            <span aria-hidden="true" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-6 py-24 sm:space-y-28 sm:py-28">
        {/* the newest calls, straight from the record */}
        {newest.length > 0 && (
          <section aria-labelledby="latest" className={row}>
            <div className="flex flex-col gap-5">
              <SectionTitle id="latest">{latest.heading}</SectionTitle>
              <ArrowLink href="/fundamental-research/reports" className="hidden text-signal-deep lg:inline-flex">
                {latest.all}
              </ArrowLink>
            </div>
            <div>
              <ul className="grid gap-4 md:grid-cols-2">
                {newest.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/fundamental-research/${r.slug}`}
                      className="group flex h-full flex-col rounded-sm border border-navy/12 bg-white p-7 transition hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_14px_40px_-20px_rgb(14_24_48/0.35)]"
                    >
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-mono font-semibold tracking-[0.04em] text-ink">
                          {r.exchange}: {r.ticker}
                        </span>
                        <span className="text-navy/55">{formatDate(r.date)}</span>
                      </div>
                      <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight text-ink transition group-hover:text-signal-deep">
                        {r.company}
                      </h3>
                      <p className="font-display mb-7 mt-2 text-lg leading-snug text-signal-deep">{r.headline}</p>
                      <div className="mt-auto flex items-end justify-between gap-4 border-t border-navy/10 pt-5">
                        <div className="flex items-center gap-3">
                          <RatingBadge rating={r.rating} />
                          <span className="text-sm text-navy/55">{r.horizon ?? "12-month"} target</span>
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          <div className="text-lg text-ink">{formatPrice(r.currency, r.priceTarget)}</div>
                          <div className="text-xs text-navy/55">{formatPct(upside(r))} at publication</div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <ArrowLink href="/fundamental-research/reports" className="mt-6 text-signal-deep lg:hidden">
                {latest.all}
              </ArrowLink>
            </div>
          </section>
        )}

        <footer>
          <JoinFooter />
        </footer>
      </div>
    </main>
  );
}
