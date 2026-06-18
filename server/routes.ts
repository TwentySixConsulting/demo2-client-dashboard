import type { Express } from "express";
import type { Server } from "http";
import { loadDraftReportModel } from "./reporting/loadDraftReport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // -----------------------------
  // Draft report endpoint
  // -----------------------------
  app.get("/api/report/draft", (_req, res) => {
    const model = loadDraftReportModel();
    res.json(model);
  });

  // -----------------------------
  // (Future routes go here)
  // -----------------------------
  // e.g.
  // app.post("/api/auth/login", ...)
  // app.get("/api/report/:clientId", ...)

  return httpServer;
}
