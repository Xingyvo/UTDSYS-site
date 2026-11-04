import content, { type ResearchReport } from "@/lib/content";
import { formatDate } from "@/lib/research";
import { subHeading } from "@/lib/type";

const { record } = content.fundamentalResearch;
const members = content.team.members;

const heading = subHeading;

/**
 * The record kept under every report: who wrote it, and every change since
 * it was published. The revision log is what
 * makes "edits are disclosed publicly" true.
 */
export default function ReportRecord({ report }: { report: ResearchReport }) {
  const analysts = report.analysts.map((name) => {
    const m = members.find((x) => x.name === name);
    return { name, role: m?.role.replace(/\n/g, " · "), bio: m?.bio, linkedin: m?.linkedin };
  });
  const revisions = report.revisions ?? [];

  return (
    <section aria-label="Report record" className="mt-16 grid gap-10 border-t border-navy/12 pt-10 md:grid-cols-2 lg:gap-12">
      {/* who wrote it */}
      <div>
        <h2 className={heading}>{record.analystHeading}</h2>
        <ul className="mt-4 space-y-5">
          {analysts.map((a) => (
            <li key={a.name}>
              <p className="font-medium text-ink">{a.name}</p>
              {a.role && <p className="mt-0.5 text-sm text-navy/60">{a.role}</p>}
              {a.bio && <p className="mt-2 text-sm leading-relaxed text-navy/70">{a.bio}</p>}
              {a.linkedin && (
                <a
                  href={a.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-signal-deep underline decoration-signal-deep/30 underline-offset-4 transition hover:decoration-signal-deep"
                >
                  LinkedIn ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* every change since publication, newest first */}
      <div>
        <h2 className={heading}>{record.revisionsHeading}</h2>
        <ol className="mt-4 border-l border-navy/15">
          {[...revisions].reverse().map((r) => (
            <li key={`${r.date}-${r.note}`} className="relative pb-5 pl-5">
              <span aria-hidden="true" className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-signal-deep" />
              <p className="text-sm font-medium text-ink">{formatDate(r.date)}</p>
              <p className="mt-1 text-sm leading-relaxed text-navy/70">{r.note}</p>
            </li>
          ))}
          <li className="relative pl-5">
            <span aria-hidden="true" className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-navy/35" />
            <p className="text-sm font-medium text-ink">
              {record.published} {formatDate(report.date)}
            </p>
            {revisions.length === 0 && <p className="mt-1 text-sm text-navy/60">{record.noRevisions}</p>}
          </li>
        </ol>
      </div>
    </section>
  );
}
