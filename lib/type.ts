/**
 * Shared type styles for the Fundamental Research pages, so What We Do,
 * Published Research, and every report use the same two heading levels.
 * Small uppercase type is for data labels only (cards, tables, the
 * tracker), never for headings.
 */

/** A section's title: "Investment Philosophy", "Track Record", "Full Report". */
export const sectionHeading =
  "font-display text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[2rem]";

/** A title inside a section: "Key Assumptions", "Analyst", "Disclosures". */
export const subHeading = "font-display text-lg font-semibold tracking-tight text-ink";

/** A page title: "Published Research", or a company on its report page. */
export const pageTitle =
  "font-display text-balance text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.015em] text-ink";

/** The small line above a page title. */
export const eyebrow = "font-mono text-[0.75rem] uppercase tracking-[0.1em] text-navy/50";
