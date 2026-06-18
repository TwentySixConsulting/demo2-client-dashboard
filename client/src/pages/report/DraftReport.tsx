import { useEffect, useState } from "react";

type DraftReportModel = {
  client: {
    name: string;
    sector?: string;
    location?: string;
    reportDate?: string;
  };
  sections: Array<{
    id: string;
    title: string;
    contentType: "markdown" | "data" | "mixed";
    static: boolean;
    source: string; // e.g. "reporting/content/market_context.md" or "supabase:benchmarking"
    notes?: string;
  }>;
};

export default function DraftReport() {
  const [data, setData] = useState<DraftReportModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/report/draft");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DraftReportModel;
        setData(json);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load draft report");
      }
    })();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Draft report</h1>
        <p style={{ marginTop: 12 }}>Error loading /api/report/draft:</p>
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{error}</pre>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Draft report</h1>
        <p style={{ marginTop: 12 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Draft report</h1>

      <div style={{ marginTop: 16 }}>
        <div><b>Client:</b> {data.client.name}</div>
        {data.client.sector && <div><b>Sector:</b> {data.client.sector}</div>}
        {data.client.location && <div><b>Location:</b> {data.client.location}</div>}
        {data.client.reportDate && <div><b>Report date:</b> {data.client.reportDate}</div>}
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Sections</h2>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        This page is your “regulated report skeleton”. It shows exactly what’s static vs dynamic
        and where the content/data comes from.
      </p>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {data.sections.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {s.static ? "STATIC" : "DYNAMIC"} • {s.contentType.toUpperCase()}
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
              <div><b>ID:</b> {s.id}</div>
              <div><b>Source:</b> {s.source}</div>
              {s.notes && <div style={{ marginTop: 6 }}><b>Notes:</b> {s.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
