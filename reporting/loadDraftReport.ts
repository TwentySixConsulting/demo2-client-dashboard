import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

type ClientMeta = {
  client_name: string;
  sector: string;
  location: string;
  report_date: string;
  benchmark_version: string;
  org_category_key: string;
};

function readText(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readText(filePath));
}

function readCsv<T extends Record<string, any>>(filePath: string): T[] {
  const csvText = readText(filePath);
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}

function safeRead<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Draft report model = one object that powers the whole dashboard.
 * For the draft phase, it reads from /reporting/draft + /reporting/content.
 */
export function loadDraftReportModel() {
  const root = process.cwd();
  const draftDir = path.resolve(root, "reporting", "draft");
  const contentDir = path.resolve(root, "reporting", "content");

  const meta = safeRead<ClientMeta>(
    () => readJson<ClientMeta>(path.join(draftDir, "client.json")),
    {
      client_name: "Draft Client",
      sector: "",
      location: "",
      report_date: "",
      benchmark_version: "",
      org_category_key: "",
    }
  );

  const notesMarkdown = safeRead(
    () => readText(path.join(draftDir, "notes.md")),
    ""
  );

  // Optional draft CSVs (you can add these next)
  const payRows = safeRead(
    () => readCsv<{ role: string; function: string; current_salary: string }>(path.join(draftDir, "pay.csv")),
    []
  );

  const benchmarkRows = safeRead(
    () => readCsv<{ role: string; LQ: string; median: string; UQ: string }>(path.join(draftDir, "benchmarks.csv")),
    []
  );

  const bonusRows = safeRead(
    () => readCsv<{ job_level: string; LQ: string; median: string; UQ: string }>(path.join(draftDir, "org_category_bonus.csv")),
    []
  );

  const benefitsRows = safeRead(
    () => readCsv<{ benefit: string; category_key: string; percent: string }>(path.join(draftDir, "org_category_benefits.csv")),
    []
  );

  // Static narrative blocks (markdown)
  const content = {
    how_to_use: safeRead(() => readText(path.join(contentDir, "how_to_use.md")), ""),
    pay_ranges_explainer: safeRead(() => readText(path.join(contentDir, "pay_ranges_explainer.md")), ""),
    market_context: safeRead(() => readText(path.join(contentDir, "market_context.md")), ""),
    benefits_trends: safeRead(() => readText(path.join(contentDir, "benefits_trends.md")), ""),
    data_sources: safeRead(() => readText(path.join(contentDir, "data_sources.md")), ""),
    next_steps_template: safeRead(() => readText(path.join(contentDir, "next_steps_template.md")), ""),
  };

  // Convert salary + benchmarks to numbers and build a simple role summary (draft)
  const payByRole = new Map(
    payRows.map(r => [r.role, Number(String(r.current_salary).replace(/[^0-9.]/g, ""))])
  );

  const roleSummary = benchmarkRows.map(b => {
    const role = b.role;
    const lq = Number(String(b.LQ).replace(/[^0-9.]/g, ""));
    const med = Number(String(b.median).replace(/[^0-9.]/g, ""));
    const uq = Number(String(b.UQ).replace(/[^0-9.]/g, ""));
    const current = payByRole.get(role);

    let position: "Below LQ" | "LQ to Median" | "Median to UQ" | "Above UQ" | "No current pay" = "No current pay";
    if (typeof current === "number") {
      if (current < lq) position = "Below LQ";
      else if (current < med) position = "LQ to Median";
      else if (current < uq) position = "Median to UQ";
      else position = "Above UQ";
    }

    return {
      role,
      current: current ?? null,
      LQ: lq,
      median: med,
      UQ: uq,
      position,
      variance_from_median: typeof current === "number" ? current - med : null,
      variance_pct: typeof current === "number" && med ? (current - med) / med : null,
    };
  });

  const strengthsRisks = {
    belowLQ: roleSummary.filter(r => r.position === "Below LQ"),
    aboveUQ: roleSummary.filter(r => r.position === "Above UQ"),
  };

  return {
    meta,
    content,
    notesMarkdown,
    datasets: {
      payRows,
      benchmarkRows,
      bonusRows,
      benefitsRows,
    },
    computed: {
      roleSummary,
      strengthsRisks,
    },
  };
}
