import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageEditorProvider } from "@/contexts/PageEditorContext";
import { AuthGate } from "@/components/AuthGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

import { Home } from "@/pages/Home";
import { Trends } from "@/pages/Trends";
import { Methodology } from "@/pages/Methodology";
import { Account } from "@/pages/Account";
import { YourOrganisation } from "@/pages/YourOrganisation";

// INTERNAL draft report builder (admin only)
import DraftReport from "@/pages/report/DraftReport";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Listed in tab order, so this reads as the nav it backs. The paths must
          match the Shell's tab keys: it navigates to `/${tab.key}`. */}
      <Route path="/" component={Home} />
      <Route path="/trends" component={Trends} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/organisation" component={YourOrganisation} />
      <Route path="/account" component={Account} />
      {/* /pay/* is served as a static SPA from client/public/pay/ */}
      {/* /benefits/* is served as a static report from client/public/benefits/ */}
      <Route component={NotFound} />
    </Switch>
  );
}

function GatedRouter() {
  return (
    <Switch>
      {/* Internal admin route bypasses the gate */}
      <Route path="/report/draft" component={DraftReport} />
      <Route>
        <AuthGate>
          <Router />
        </AuthGate>
      </Route>
    </Switch>
  );
}

// Route base for the SPA — "" in dev (served at /), "/demo2-client-dashboard"
// on GitHub Pages (import.meta.env.BASE_URL = "/demo2-client-dashboard/").
const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PageEditorProvider>
            <TooltipProvider>
              <Toaster />
              <WouterRouter base={ROUTER_BASE}>
                <ScrollToTop />
                <GatedRouter />
              </WouterRouter>
            </TooltipProvider>
          </PageEditorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
