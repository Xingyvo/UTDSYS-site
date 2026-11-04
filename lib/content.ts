export type TeamMember = {
  name: string;
  role: string;
  photo: string | null;
  /** One or two sentences, shown with the analyst's name on their reports. */
  bio?: string;
  linkedin?: string;
};

export type Rating = "Buy" | "Hold" | "Sell";
export type ResearchReport = {
  /** URL segment for the report's own page: /fundamental-research/<slug>. */
  slug: string;
  company: string;
  ticker: string;
  exchange: string;
  sector: string;
  /** ISO date of publication, e.g. "2026-10-02". */
  date: string;
  rating: Rating;
  currency: string;
  priceAtPublication: number;
  priceTarget: number;
  /** One-line thesis, written like a report headline. */
  headline: string;
  summary: string;
  analysts: string[];
  /** Key figures shown on the featured card, label → preformatted value. */
  metrics: { label: string; value: string }[];
  /** Holding period the target is set over, e.g. "2-year". Defaults to 12-month. */
  horizon?: string;
  /** Yahoo Finance symbol; when set, the live tracker charts the call. */
  quoteSymbol?: string;
  /** Path under /public, e.g. "/research/acme-initiation.pdf". */
  pdf: string | null;
  /** The financial model behind the call: the spreadsheet under /public, and
   *  the inputs and per-method prices a visitor sees without opening it. */
  model?: {
    file: string;
    assumptions: { label: string; value: string }[];
    methods: { label: string; price: number; weight: number }[];
  };
  /** Placeholder entries are tagged so they can never pass as real coverage. */
  sample?: boolean;
  /**
   * Close a call by hand, e.g. on a downgrade. Leave it out and the site
   * applies the rule in lib/research.ts: a call closes the first day it
   * closes at its target, or at the end of its horizon.
   */
  closed?: { date: string; price: number; reason: string };
  /**
   * Every change made after publication, oldest first, e.g.
   * { date: "2026-11-03", note: "Price target raised from US$78 to US$85 after Q3 results." }
   */
  revisions?: { date: string; note: string }[];
};

const content = {
  brand: {
    name: "UTDSYS",
    full: "University of Toronto Decision Systems",
  },
  // The hero: the group crest on a navy panel, and the wordmark beside it,
  // whose two i-dots in "Decision" are lit blue. `desks` are the two
  // research desks, each linking to its page.
  hero: {
    eyebrow: "University of Toronto",
    desks: [
      {
        name: "Quantitative research",
        body: "Portfolio research, tested on past data and in paper trading.",
        href: "/quantitative-research",
      },
      {
        name: "Fundamental research",
        body: "Bottom-up research on public companies.",
        href: "/fundamental-research",
      },
    ],
    primary: { label: "Get involved", href: "/get-involved" },
  },
  nav: {
    links: [
      { label: "Quantitative Research", href: "/quantitative-research" },
      {
        label: "Fundamental Research",
        href: "/fundamental-research",
        // shown as a dropdown on hover, and indented in the mobile menu
        children: [
          { label: "What We Do", href: "/fundamental-research" },
          { label: "Published Research", href: "/fundamental-research/reports" },
        ],
      },
      { label: "Team", href: "/team" },
      // Rendered as the nav's call to action rather than a plain link.
      { label: "Get Involved", href: "/get-involved", cta: true },
    ],
  },
  // /get-involved: how to join (a real sequence), the two desks to pick
  // from, and the join panel (the Discord and email while the form is off;
  // see CONTACT_FORM_ENABLED in lib/flags.ts).
  getInvolved: {
    eyebrow: "University of Toronto Decision Systems",
    heading: "Get involved",
    steps: {
      heading: "How to join",
      items: [
        {
          name: "Join the Discord",
          body: "Recruiting is announced there first, so you'll know as soon as it opens.",
        },
        {
          name: "Introduce yourself",
          body: "Tell us a bit about yourself, and share your research or an interesting paper you've read.",
        },
      ],
      // A fallback, not a third step, so it sits under the list unnumbered.
      missed: { text: "We're always looking for eager people. Send us an email at", email: "info@utdsys.com" },
    },
    // Two doors, one action each: students join the Discord (announcements,
    // introductions, shared research),
    // sponsors and partners write to the team.
    doors: {
      students: {
        label: "For students",
        heading: "Join the group",
        body: "Any faculty, any year. Recruiting announcements go out on our Discord.",
        action: "Join the Discord",
      },
      partners: {
        label: "Sponsors, partners and questions",
        heading: "Work with us",
        body: "Sponsorship, a speaker, a dataset, or a problem worth studying. Write to the team and we'll reply.",
      },
    },
    desksPrompt: "Not sure where you'd fit? Read about the",
    form: {
      name: { label: "Name" },
      email: { label: "Email" },
      message: { label: "Message" },
      topic: { label: "Topic" },
      submit: "Send message",
      sending: "Sending…",
      successHeading: "Message sent",
      success: "It's in the team's inbox, and we'll reply to the address you gave.",
      another: "Send another message",
      error: "Something went wrong. Please try again or email us directly.",
      // Shown in place of the form while the contact form is disabled
      // (see CONTACT_FORM_ENABLED in lib/flags.ts).
      disabled: {
        discord: {
          label: "Join our Discord",
          href: "https://discord.gg/h2kX42dfdz",
        },
      },
    },
  },
  // /team: one roster, everyone at the same size, in org order (the two
  // desk leads, then officers). Drop headshots in public/team/ and set
  // `photo` to "/team/<file>"; without one, a member shows a placeholder silhouette.
  // A "\n" in `role` starts a new line on the card.
  team: {
    eyebrow: "University of Toronto Decision Systems",
    heading: "Meet the team",
    intro: "The people behind UTDSYS.",
    members: [
      { name: "Sunny Zhang", role: "Founder\nLead Quantitative Researcher", photo: null },
      { name: "Bosco Yu", role: "Lead Fundamentals Researcher", photo: null },
    ] as TeamMember[],
  },
  // /fundamental-research: an equity research hub. The index shows each
  // report's summary card, newest first; the card opens its own page at
  // /fundamental-research/<slug> with the live chart and the PDF. To
  // publish, add an entry to `reports` and put the PDF in public/research/.
  // Entries marked `sample` bring back the sample notice.
  fundamentalResearch: {
    heading: "Fundamental Research",
    reportsHeading: "Published Research",
    // /fundamental-research: the division's landing page. Kept to a
    // summary: the full method lives in the Research Handbook.
    about: {
      hero: {
        eyebrow: "Fundamental Research",
        title: "What We Do",
        body: "We pair bottom-up company research with a top-down view of the economy to find durable businesses the market has mispriced. We work alongside UTDSYS Quantitative Research: their screens surface ideas, and our work informs their models.",
        primary: { label: "View Published Research", href: "/fundamental-research/reports" },
        secondary: { label: "Get Involved", href: "/get-involved" },
        // public/fundamental-hero.jpg; swap the file to change the photo
        image: "/fundamental-hero.jpg",
      },
      approach: {
        heading: "Investment Philosophy",
        intro:
          "We look for quality businesses the market has mispriced, and hold every idea to the same standard of valuation discipline.",
        items: [
          {
            title: "Focus",
            body: "Compounders with durable moats and strong free cash flow, and growth businesses we can underwrite ahead of profitability.",
          },
          {
            title: "Mispricing",
            body: "Businesses whose price has moved away from their fundamentals, through short-term sentiment or growth the market has yet to recognise.",
          },
          {
            title: "Variant View",
            body: "Where we disagree with the market, we state exactly where and why. Where we don't, we still hold every call to the same valuation discipline.",
          },
        ],
      },
      coverage: {
        heading: "Coverage",
        items: [
          {
            title: "Equities",
            detail: "NYSE · NASDAQ · TSX",
            body: "Companies and ADRs, researched bottom-up on their own merits. Our portfolio is long-only equities.",
          },
          {
            title: "Commodities",
            detail: "Energy · Metals",
            body: "The commodity drivers that matter most for the companies we cover, such as oil and silver, with occasional direct trades.",
          },
          {
            title: "Macro",
            detail: "Canada · United States",
            body: "We don't trade macro, but it is the lens that ties our equity and commodity work together and shapes when we make a call.",
          },
        ],
      },
      process: {
        heading: "Research Process",
        intro: "Every idea goes through the same six steps, from the first screen to the call we track in public.",
        // each step: a short line for the step list, and the fuller detail
        // shown when the step is selected
        steps: [
          {
            title: "Screen",
            body: "Where ideas come from.",
            detail: "Ideas come from our quality-and-valuation screen, earnings results, news flow, macro themes, and screens from the Quantitative Research division. We start bottom-up: a company earns its place on its own merits.",
          },
          {
            title: "Research",
            body: "From the economy down to the company.",
            detail: "A strong business is worth researching in any macro environment, but the macro view shapes when we make the call and how we frame it. So every name is worked through three layers.",
            layers: [
              { title: "Macro", body: "Which forces matter for the company (rates, FX, commodity prices, the cycle) and which way they are moving." },
              { title: "Industry", body: "How the industry is structured, who competes, and how those macro forces hit the sector." },
              { title: "Company", body: "Qualitative and quantitative analysis, catalysts, and risks: why this business wins or loses." },
            ],
          },
          {
            title: "Value",
            body: "What the business is worth.",
            detail: "A discounted cash flow model and comparable company analysis, plus precedent transactions where M&A is relevant. Bull, base, and bear cases are summarized in a football field, with the inputs that drive them disclosed.",
          },
          {
            title: "Write",
            body: "The thesis, on the record.",
            detail: "A written report in the DSYS template. Every figure is sourced, facts are kept separate from opinion, and every estimate is labelled as an estimate.",
          },
          {
            title: "Review",
            body: "Tested before it's published.",
            detail: "The analyst pitches the idea to the team, and at least one other analyst reviews the report. The idea is approved, sent back for more work, or dropped.",
          },
          {
            title: "Monitor",
            body: "Tracked in public.",
            detail: "Published calls are dated with their entry price, price target, benchmark, and horizon, tracked on this site, and reviewed after any significant catalyst to the business.",
          },
        ],
      },
      latest: {
        heading: "Latest Research",
        all: "All Published Research",
      },
      join: {
        text: "Want to Research With Us?",
        label: "Get Involved",
        href: "/get-involved",
      },
    },
    sampleNotice:
      "Sample reports shown for layout. Companies and figures are fictitious; first published coverage is in progress.",
    backLabel: "Published Research",
    reportHeading: "Full Report",
    reportPending: "The full write-up is being finalised and will be published here.",
    // the record kept under every report
    record: {
      analystHeading: "Analyst",
      revisionsHeading: "Revision History",
      published: "Published",
      noRevisions: "No changes since publication.",
    },
    // the full method, for readers who want more than the summary
    methodology: {
      label: "Read our full methodology (PDF)",
      file: "/research/dsys-fundamental-research-methodology.pdf",
    },
    // shown when a call is published as its financial model rather than a write-up
    model: {
      title: "Full Financial Model",
      body: "The complete DCF in Excel: income statement, balance sheet and cash flow projections, cost of capital, and the valuation.",
      assumptionsHeading: "Key Assumptions",
      methodsHeading: "How the Target Is Set",
      blendLabel: "Blended DCF value",
      download: "Download the Model (.xlsx)",
    },
    coverageHeading: "Coverage",
    // the sortable table of every call and how it has done since publication
    allHeading: "Track Record",
    reportsIntro:
      "Every call we publish, dated, with its entry price and target, and tracked against its benchmark.",
    trackNote:
      "A call closes on the first day the stock closes at or beyond its target, or at the end of its horizon, and its return is locked at that close. Open calls are measured to the latest price. Price returns exclude dividends; benchmarks are the S&P 500 for US listings and the S&P/TSX Composite for Canadian listings.",
    // relative to the call's benchmark, so a rating means the same thing
    // whatever the call's horizon
    ratings: [
      { rating: "Buy", definition: "We expect the stock to outperform its benchmark over the call's horizon." },
      { rating: "Hold", definition: "We expect the stock to perform roughly in line with its benchmark." },
      { rating: "Sell", definition: "We expect the stock to underperform its benchmark over the call's horizon." },
    ] as { rating: Rating; definition: string }[],
    // from the Fundamental Research summary (October 2026), word for word
    disclaimer:
      "DSYS periodically publishes research produced by our Fundamentals Team on this page. Nothing here constitutes investment advice, and any edits made after publication are disclosed publicly. We may buy or sell securities without notice and may or may not hold positions in the securities discussed here. This page exists to show the kind of research our Investment Team does and how we think about investing; it is not a recommendation. Because markets and businesses change, these reports can become outdated over time.",
    reports: [
      {
        slug: "futu",
        company: "Futu Holdings",
        ticker: "FUTU",
        exchange: "NASDAQ",
        sector: "Financials",
        date: "2026-07-17",
        rating: "Buy",
        currency: "US$",
        priceAtPublication: 95.1,
        priceTarget: 167.7,
        horizon: "2-year",
        quoteSymbol: "FUTU",
        headline: "A mispriced business, not a broken one",
        summary:
          "The stock is down 47% this year on a one-time, fully provisioned CSRC fine, while revenue grows 25% a year and client assets hit a record. Growth outside mainland China is already most of the business, and the market is pricing a setback as a permanent impairment.",
        analysts: ["Bosco Yu"],
        metrics: [
          { label: "Valuation", value: "15x FY27E EPS" },
          { label: "FY27E EPS", value: "US$11.18" },
          { label: "Expected IRR", value: "33%" },
          { label: "Holding period", value: "2 years" },
        ],
        pdf: null,
      },
      {
        slug: "rubrik",
        company: "Rubrik",
        ticker: "RBRK",
        exchange: "NYSE",
        sector: "Software / Cybersecurity",
        date: "2026-05-12",
        rating: "Buy",
        currency: "US$",
        priceAtPublication: 60.47,
        priceTarget: 78,
        horizon: "1-year",
        quoteSymbol: "RBRK",
        headline: "More AI, more data, more to protect",
        summary:
          "AI is making cyberattacks faster and cheaper to launch, so for most companies a breach is a question of when, not if. Rubrik sells the recovery layer that restores a business when its defences fail, a need that grows with every attack, and the stock trades about 23% below our DCF value.",
        analysts: ["Bosco Yu"],
        metrics: [
          { label: "Valuation", value: "Blended DCF" },
          { label: "EV / FY27E sales", value: "9.9x vs 7.6x mkt" },
          { label: "Expected IRR", value: "29%" },
          { label: "Holding period", value: "1 year" },
        ],
        pdf: null,
        // read off the model's Cover, WACC and DCF tabs
        model: {
          file: "/research/rubrik-dcf.xlsx",
          assumptions: [
            { label: "Cost of capital (WACC)", value: "9.7%" },
            { label: "Long-term growth after FY2040", value: "2.5%" },
            { label: "Exit multiple", value: "11x EBITDA" },
            { label: "Revenue growth, FY2026–FY2040", value: "13.9% a year" },
            { label: "Value from beyond FY2040", value: "49%" },
            { label: "Diluted shares", value: "228.4M" },
          ],
          methods: [
            { label: "DCF, long-term growth", price: 79.6297, weight: 0.5 },
            { label: "DCF, exit multiple", price: 76.8188, weight: 0.5 },
          ],
        },
      },
    ] as ResearchReport[],
  },
  // /quantitative-research: the desk's portfolio research, tested on past
  // data and then in paper trading. Kept deliberately short: the studies
  // (robust portfolios is the first; more may follow), each with its own
  // paper-trading setup, then the method and the reading list. References are numbered in the
  // order listed; a study's `reading` points at those numbers.
  quantResearch: {
    heading: "Quantitative research",
    // The page's opening story, for a visitor who has never heard of the desk,
    // beside a live figure: five years of daily sector-ETF returns, turned onto their principal components and whitened.
    story: {
      lede: "We build mathematical models that turn market data into portfolio decisions.",
      body: "Each study starts from a question raised in the academic literature. We test our answer on decades of historical data, after trading costs and against simple benchmarks, and then move it into paper trading, where it runs forward on markets it has never seen.",
      // read to screen readers only; the figure itself carries no text
      figure:
        "Five years of daily returns of Energy, Financials and Technology sector ETFs as a point cloud, rotated onto its principal components and whitened from an ellipsoid into a sphere.",
    },
    studies: {
      heading: "Studies",
      label: "Study",
      readLabel: "Read the study",
      backLabel: "Quantitative research",
      sections: {
        overview: "Overview",
        findings: "What the backtests found",
        results: "Backtest results by market",
        paper: "Paper trading",
        references: "References",
      },
      resultsColumns: ["Strategy", "Volatility", "Largest drawdown", "Sharpe ratio"],
      // labels the report's headline numbers as historical, not paper trading
      backtestLabel: "Backtest",
      // Each study is a report: what was asked, what was found, and how it
      // was tested. The method itself stays internal.
      items: [
        {
          slug: "robust-portfolios",
          name: "Robust portfolios",
          status: "Paper trading on Alpaca",
          question:
            "Robust portfolios are designed to account for errors in their forecasts. Can they lower risk without giving up risk-adjusted return?",
          finding:
            "In backtests, 10 to 13% less volatility than equal weighting in every market tested, with similar risk-adjusted returns.",
          overview: [
            "A portfolio optimiser relies on forecasts of how assets will behave, and those forecasts are always partly wrong. Standard optimisers treat them as exact, which tends to produce concentrated portfolios that perform poorly once the forecasts miss.",
            "A robust portfolio is built to remain sound when its forecasts are wrong. This study asks whether that design delivers a measurable benefit over two simple alternatives: holding every asset in equal weight, and holding the mix with the lowest forecast volatility.",
          ],
          figures: [
            { value: "53", unit: "years of data", label: "" },
            { value: "3", unit: "markets", label: "" },
            { value: "10–13%", unit: "", label: "less volatility than equal weighting" },
            { value: "0.1%", unit: "", label: "trading cost on every dollar traded" },
          ],
          findings: [
            "The robust portfolio was less volatile than equal weighting in all three markets, by 10 to 13%. The difference is statistically significant in each market (p < 0.001).",
            "Its largest loss was smaller in every market, by 6 to 7 percentage points.",
            "Its Sharpe ratio was slightly higher than equal weighting in all three markets. These differences are not statistically significant.",
            "The lowest-volatility portfolio reduced volatility further, by 17 to 26%, but held fewer assets: in sector ETFs its weight was spread across the equivalent of 3.4 funds, against 6.3 for the robust portfolio.",
          ],
          // From the research repo (results/phase2/risk_vol.json and the base
          // tables), net of 10 bp trading costs. `ratio` is volatility
          // relative to equal weighting, with its 95% interval.
          markets: [
            {
              name: "10 U.S. industries",
              period: "Jul 1973 – Aug 2026",
              rows: [
                { name: "Robust", vol: "13.6%", maxdd: "41.2%", sharpe: "0.57", ratio: 0.904, ci: [0.88, 0.93] },
                { name: "Lowest volatility", vol: "12.4%", maxdd: "34.4%", sharpe: "0.59", ratio: 0.827, ci: [0.79, 0.866] },
                { name: "Equal weighting", vol: "15.0%", maxdd: "48.1%", sharpe: "0.55", ratio: 1, ci: null },
              ],
            },
            {
              name: "48 U.S. industries",
              period: "Jul 1973 – Aug 2026",
              rows: [
                { name: "Robust", vol: "14.9%", maxdd: "46.5%", sharpe: "0.52", ratio: 0.882, ci: [0.852, 0.913] },
                { name: "Lowest volatility", vol: "12.6%", maxdd: "38.3%", sharpe: "0.56", ratio: 0.743, ci: [0.705, 0.783] },
                { name: "Equal weighting", vol: "16.9%", maxdd: "52.7%", sharpe: "0.51", ratio: 1, ci: null },
              ],
            },
            {
              name: "9 U.S. sector ETFs",
              period: "Jan 2004 – Aug 2026",
              rows: [
                { name: "Robust", vol: "12.4%", maxdd: "42.1%", sharpe: "0.73", ratio: 0.871, ci: [0.829, 0.921] },
                { name: "Lowest volatility", vol: "11.5%", maxdd: "37.2%", sharpe: "0.71", ratio: 0.808, ci: [0.752, 0.883] },
                { name: "Equal weighting", vol: "14.3%", maxdd: "49.2%", sharpe: "0.66", ratio: 1, ci: null },
              ],
            },
          ] as { name: string; period: string; rows: { name: string; vol: string; maxdd: string; sharpe: string; ratio: number; ci: number[] | null }[] }[],
          charts: {
            ratio: {
              title: "Backtested volatility relative to equal weighting",
              caption: "Lines show 95% confidence intervals. Below 100% means less volatile than equal weighting.",
            },
            growth: {
              title: "Backtested growth of $10,000 in nine U.S. sector ETFs",
              caption:
                "Equal weighting finished slightly ahead. The robust portfolio fell less in 2008 (42% against 49%) and in 2020 (18% against 24%), and more in 2022 (20% against 16%).",
              drawdownLabel: "Decline from previous high",
            },
          },
          paper: {
            intro: "Following historical testing, the study is now forward testing in an Alpaca paper trading account. The first monthly rebalance was placed on 2 November 2026.",
            broker: "Alpaca",
            start: "2 November 2026",
            terms: [
              { label: "Broker", value: "Alpaca paper trading" },
              { label: "Assets", value: "Nine U.S. sector ETFs" },
              { label: "Capital", value: "$100,000 simulated per strategy" },
              { label: "Rebalancing", value: "Monthly" },
            ],
            status: "Live since 2 November 2026",
          },
          reading: [9, 4, 7],
        },
      ],
    },
    disclaimer:
      "Student research for educational purposes. Paper-trading results use simulated capital and do not constitute investment advice.",
    reading: {
      heading: "Reading list",
      groups: [
        {
          name: "Building portfolios",
          items: [
            "Markowitz, H. (1952). Portfolio selection. Journal of Finance 7(1), 77–91.",
            "Ledoit, O. and Wolf, M. (2004). Honey, I shrunk the sample covariance matrix. Journal of Portfolio Management 30(4), 110–119.",
            "Jorion, P. (1986). Bayes-Stein estimation for portfolio analysis. Journal of Financial and Quantitative Analysis 21(3), 279–292.",
            "DeMiguel, V., Garlappi, L. and Uppal, R. (2009). Optimal versus naive diversification: How inefficient is the 1/N portfolio strategy? Review of Financial Studies 22(5), 1915–1953.",
            "DeMiguel, V., Garlappi, L., Nogales, F. J. and Uppal, R. (2009). A generalized approach to portfolio optimization: Improving performance by constraining portfolio norms. Management Science 55(5), 798–812.",
          ],
        },
        {
          name: "Robust optimisation",
          items: [
            "Garlappi, L., Uppal, R. and Wang, T. (2007). Portfolio selection with parameter and model uncertainty: A multi-prior approach. Review of Financial Studies 20(1), 41–81.",
            "Scherer, B. (2007). Can robust portfolio optimisation help to build better portfolios? Journal of Asset Management 7(6).",
            "Kim, W. C., Kim, J. H., Ahn, S. H. and Fabozzi, F. J. (2013). What do robust equity portfolio models really do? Annals of Operations Research 205, 141–168.",
            "Gotoh, J., Kim, M. J. and Lim, A. E. B. (2020). Calibration of distributionally robust empirical optimization models. arXiv:1711.06565.",
            "Cornuéjols, G., Elçi, Ö. and Patil, V. (2024). Addressing estimation errors on expected asset returns through robust portfolio optimization. Optimization Online.",
          ],
        },
        {
          name: "Testing results",
          items: [
            "Ledoit, O. and Wolf, M. (2008). Robust performance hypothesis testing with the Sharpe ratio. Journal of Empirical Finance 15(5), 850–859.",
            "Bailey, D. H. and López de Prado, M. (2014). The deflated Sharpe ratio: correcting for selection bias, backtest overfitting, and non-normality. Journal of Portfolio Management 40(5), 94–107.",
          ],
        },
      ],
    },
    join: { text: "Interested in contributing to our research?", label: "Get involved", href: "/get-involved" },
  },
  contact: {
    email: "info@utdsys.com",
    // The full set of channels lives in contactPage.channels.
    socials: [
      { label: "Discord", href: "https://discord.gg/h2kX42dfdz" },
      { label: "GitHub", href: "https://github.com/UTDSYS" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/utdsys" },
    ],
  },
  // Direct channels, shown in the white band at the foot of /get-involved
  // (the old /contact page now redirects there).
  contactPage: {
    eyebrow: "University of Toronto Decision Systems",
    heading: "Contact",
    intro:
      "Questions, ideas, or partnership enquiries. Reach the team through any of these.",
    joinPrompt: { text: "Want to join the group?", label: "Get involved", href: "/get-involved" },
    // The message form (lib/flags CONTACT_FORM_ENABLED); it emails info@.
    form: { heading: "Send a message" },
    channels: [
      {
        label: "Email",
        value: "info@utdsys.com",
        href: "mailto:info@utdsys.com",
      },
      {
        label: "Discord",
        value: "Join the server",
        href: "https://discord.gg/h2kX42dfdz",
      },
      {
        label: "GitHub",
        value: "github.com/UTDSYS",
        href: "https://github.com/UTDSYS",
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/company/utdsys",
        href: "https://www.linkedin.com/company/utdsys",
      },
    ],
  },
} as const;

export default content;
