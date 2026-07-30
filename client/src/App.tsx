import { Switch, Route } from "wouter";
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
import { Account } from "@/pages/Account";
import { YourOrganisation } from "@/pages/YourOrganisation";

// INTERNAL draft report builder (admin only)
import DraftReport from "@/pages/report/DraftReport";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PageEditorProvider>
            <TooltipProvider>
              <Toaster />
              <ScrollToTop />
              <GatedRouter />
            </TooltipProvider>
          </PageEditorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
