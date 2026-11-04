import content from "@/lib/content";
import RatingBadge from "@/components/research/RatingBadge";
import { subHeading } from "@/lib/type";

const { ratings, disclaimer } = content.fundamentalResearch;

/** Rating scale and legal note, shared by the index and every report page. */
export default function Disclosures() {
  return (
    <footer className="mt-24 grid gap-10 border-t border-navy/12 pt-10 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h2 className={subHeading}>
          Rating Definitions
        </h2>
        <dl className="mt-4 space-y-3">
          {ratings.map((r) => (
            <div key={r.rating} className="flex items-center gap-4">
              <dt className="w-16 shrink-0">
                <RatingBadge rating={r.rating} />
              </dt>
              <dd className="text-sm text-navy/65">{r.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h2 className={subHeading}>
          Disclosures
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-navy/55">{disclaimer}</p>
      </div>
    </footer>
  );
}
