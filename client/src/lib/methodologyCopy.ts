// Copy for the Methodology page, kept out of the component the way the marketing
// site keeps its copy in src/lib/copy.ts.
//
// SOURCES AND WHAT CHANGED. The spine is the live zigbert.co.uk methodology page.
// Three things had to change for a reader who is already inside the product
// rather than deciding whether to buy it:
//
//   1. The marketing page's section 5 ("A few details, one rate") describes the
//      sales flow. Replaced with how benefits are benchmarked, which is the
//      question a client actually has and which the marketing page never answers.
//   2. The closing waitlist CTA is wrong for someone who already has the product.
//   3. The four "Data Sources" cards from the old Pay page are folded in as the
//      evidence list under whichever section already discusses that data. A source
//      card is a footnote for a section, not a section of its own, and treating it
//      as one is what produced two pages saying overlapping, different things.
//
// Every figure is interpolated from theme.ts, never typed here. The tokens are
// {payEmployers} {payBasis} {benefitEmployers} {benefitCoverage} {period}
// {lastUpdated} {benefitsUpdated}.
//
// Two editorial corrections carried into the copy:
//   - The marketing page names three classification dimensions (function,
//     industry, job level) and omits location. The old dashboard card names three
//     (industry, location, role scope) and omits job level. Both were incomplete.
//     The merged set is four, which is also what lib/roster.ts actually carries.
//   - Claim discipline from the brand guide: "every dashboard is
//     specialist-reviewed", never "every benchmark".

export interface MethodSection {
  id: string;
  heading: string;
  paras: string[];
  /** Rendered as a small "Where this comes from" list under the prose. */
  sources?: { title: string; items: string[] };
  /** Rendered as a three or four up set of small tiles. */
  tiles?: { title: string; body: string }[];
  /** Rendered as a two-column list of short points. */
  points?: { head: string; items: string[] }[];
}

export const METHODOLOGY_EYEBROW = "Methodology";
export const METHODOLOGY_TITLE = "How these numbers are built";
export const METHODOLOGY_LEDE =
  "Good pay decisions need data you can trust. Here is where the market rates in this dashboard come from, how they are produced, and why every one is reviewed by a person before it reaches you.";

export const METHODOLOGY_SECTIONS: MethodSection[] = [
  {
    id: "postings",
    heading: "Where the pay numbers come from",
    paras: [
      "Zigbert is built on real job adverts, collected every day from dozens of UK job boards, both the big generalist platforms and specialist boards.",
      "Each posting we capture records the job title, employer, location, full description, advertised salary where it is disclosed, employment type and date. That adds up to a current database of over 1.5 million UK salary records, growing every day. Where the same role is advertised in several locations we keep each one, so genuine regional pay differences are captured rather than averaged away.",
      "Because it is built from live adverts rather than an annual survey, the picture moves with the market in real time. Zigbert reflects what employers are actually offering now, across far more roles and organisations, so you can see pay shifting before it costs you a hire.",
      "It is worth being direct about how that compares with a salary survey, because it is the first question most people ask. Surveys are collected once or twice a year and are often out of date before they reach you. They are self-reported, frequently by whoever in an overstretched reward team has least on that week. And they tell you only what the participating organisations pay, which skews large and established: run two surveys side by side for the same role and you will get two different answers.",
      "Advert data is current, far higher in volume, and it is what your candidates and your own employees can already see. Its real weakness is classification rather than honesty, and classification is the part we do for you, checked by a person.",
      "Long before any of this was automated our team built the dataset by hand, so it reaches back over the past decade rather than only today's market. That history is what lets us show how pay has moved over time instead of only a snapshot.",
    ],
    sources: {
      title: "Where this comes from",
      items: [
        "The Zigbert salary database, built from live UK job adverts",
        "Annual sector-specific salary surveys",
        "Client engagement data, anonymised",
        "Published industry benchmarks",
      ],
    },
  },
  {
    id: "cleaning",
    heading: "Cleaned, checked and monitored",
    paras: [
      "Raw adverts are messy, so every record is standardised before it is used. Salaries are parsed from the many formats employers use, whether that is a range, an hourly rate, an annual figure or vague wording. Locations are standardised, duplicate adverts are removed, and thin or low-quality postings are filtered out.",
      "From there the dataset is continuously checked and monitored for quality, so anything that does not look right is caught and corrected before it can affect the data behind your dashboard.",
    ],
  },
  {
    id: "classification",
    heading: "Compared like with like",
    paras: [
      "A salary figure only means something next to genuinely comparable roles. So every posting is classified on four dimensions: its function, meaning what the role actually does; its industry, meaning the sector it sits in; its job level, meaning how senior it is; and its location. The classification is built specifically for the UK labour market, with a clear definition for every category.",
      "Those four together define the comparator group. A finance role in investment banking is measured against a different market than a finance role in a charity, even for a similar job. The classification runs on our own model, which our data scientist continues to train and build on, and it produces a confidence score for every record. Anything uncertain is routed to a specialist to check before it is used.",
    ],
    tiles: [
      { title: "Function", body: "What the role actually does, rather than what the job title calls it." },
      { title: "Industry", body: "Primary matching to technology roles, with secondary matching to related digital and data sectors." },
      { title: "Job level", body: "Seniority, reporting lines and scope of responsibility." },
      { title: "Location", body: "Regional rates, with London and the South East treated separately." },
    ],
    sources: {
      title: "Where the sector view comes from",
      items: [
        "Technology sector salary surveys",
        "Technology industry compensation benchmarks",
        "Regional technology sector networks",
        "Digital and data reward forums",
      ],
    },
  },
  {
    id: "official",
    heading: "Grounded in official data",
    paras: [
      "Our own data is supplemented with authoritative external sources, including ONS ASHE earnings figures, sector employment data, regional wage indices and broader economic indicators such as inflation and interest rates.",
      "That keeps every benchmark anchored to the wider economy rather than to whatever happens to be advertised this week, and it is what lets the dashboard set pay in the context of what the market is actually doing.",
    ],
    sources: {
      title: "Where this comes from",
      items: [
        "Office for National Statistics",
        "Bank of England reports",
        "CIPD reward surveys",
        "Living Wage Foundation",
      ],
    },
  },
  {
    id: "benefits",
    heading: "How benefits are benchmarked",
    paras: [
      "Pay and benefits are built from two different kinds of evidence, so the numbers behind them are counted differently.",
      "Pay comes from live job adverts. Nationally that is a database of more than 1.5 million UK salary records. Your own benchmarks are drawn from the slice of it that genuinely matches you, which is {payEmployers} technology employers advertising comparable roles in {payBasis}. A narrow comparator group is the point. A wider one would be a bigger number and a worse benchmark.",
      "Benefits cannot be read off an advert, because employers rarely publish the detail. So benefits come from survey and audit evidence instead: {benefitEmployers} employers, covering {benefitCoverage}% of the benefits we benchmark for you. Where a benefit is thin in the survey data we say so on the benefit itself rather than filling the gap.",
      "Two methods, two counts. Neither is a subset of the other, and the bigger number is not the better one.",
    ],
    sources: {
      title: "Where this comes from",
      items: [
        "Zigbert benefits surveys",
        "Client benefits audits, anonymised",
        "Employee benefits research",
        "Industry publications",
      ],
    },
  },
  {
    id: "review",
    heading: "Reviewed by a specialist",
    paras: [
      "This is what sets Zigbert apart. Self-service pay tools can produce results that simply do not look right: outliers, mismatched roles, or data drawn from the wrong comparator group. Without expert knowledge it is hard to know what to trust.",
      "Every Zigbert dashboard is reviewed by one of our reward specialists, who confirms it makes sense before publication. Behind the scenes, accuracy is measured continuously and by category, records are reviewed daily and weekly, and the classification is refreshed and version-controlled on a regular cycle.",
      "This dashboard was reviewed and published on {lastUpdated}. Your TwentySix consultant can talk you through any figure in it.",
    ],
  },
  {
    id: "refresh",
    heading: "How often this updates",
    paras: [
      "Market rates move with inflation, talent scarcity and sector trends, so a benchmarking tool that refreshes once a year cannot keep pace. The underlying data updates continuously, and the database is refreshed every month with newly validated records across roles and industries.",
      "Your dashboard is rebuilt from that data, reviewed by a specialist and republished once a quarter, which is what your subscription covers. You are reading {period}, published on {lastUpdated}.",
      "Benefits run a cycle behind pay, because they come from survey and audit evidence rather than adverts. The benefits figures here are from {benefitsUpdated}.",
      "If the market moves sharply mid-quarter and you need a rebuild sooner, your TwentySix consultant can arrange one.",
    ],
  },
  {
    id: "reading",
    heading: "How to read what you are given",
    paras: [
      "Roles are matched on function, job level, industry, location and scope of responsibility, not on job title. Two roles with the same title in different organisations are frequently not the same job, and matching on the title alone is how a benchmark goes wrong.",
      "All source data is anonymised and aggregated, so no participating organisation is identifiable from anything in here.",
      "A market range is a range, not a target. The lower quartile, median and upper quartile describe where the market sits. Where you choose to sit within it is a decision about your own reward strategy, and it is one worth making deliberately.",
    ],
  },
  {
    id: "enough",
    heading: "When a dashboard is enough",
    paras: [
      "A dashboard answers most reward questions well, and there are some it is not the right tool for. Knowing which is which saves you money either way.",
    ],
    points: [
      {
        head: "This dashboard covers you for",
        items: [
          "A market check on established roles",
          "Planning a standard annual pay review",
          "Validating a proposed salary for a new hire",
          "Understanding where you sit in the market overall",
          "Seeing how the market is moving underneath you",
        ],
      },
      {
        head: "Ask about bespoke benchmarking when",
        items: [
          "You have complex or hybrid roles that do not match a standard shape",
          "You need a full pay structure review rather than role-by-role rates",
          "Recruitment is failing in a way the market rate does not explain",
          "You want costed recommendations and support implementing them",
          "You need a pay structure built, not just benchmarked",
          "You are going through an organisational restructure",
        ],
      },
    ],
  },
];

export const METHODOLOGY_CLOSING = {
  heading: "Anything here worth a conversation",
  body: "Your TwentySix consultant can walk through the method behind any figure, or take a role away for a fully evidenced bespoke benchmark. The wider market context behind these numbers sits under Trends and Hotspots.",
};
