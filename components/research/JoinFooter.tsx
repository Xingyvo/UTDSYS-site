import Button from "@/components/ui/Button";
import content from "@/lib/content";

const { join } = content.fundamentalResearch.about;

/** The same closing line and button at the foot of every Fundamental Research page. */
export default function JoinFooter({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-6 border-t border-navy/12 pt-10 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{join.text}</p>
      <Button href={join.href} variant="primary">
        {join.label}
      </Button>
    </div>
  );
}
