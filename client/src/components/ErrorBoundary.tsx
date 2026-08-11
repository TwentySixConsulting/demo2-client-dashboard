// App-level error boundary so an unexpected exception shows a calm, on-brand
// message (and a way to recover) instead of a blank white screen to the client.
import { Component, type ErrorInfo, type ReactNode } from "react";
import { C } from "@/lib/theme";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console for support; a real deployment would log to a service.
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: C.canvas, color: C.ink, fontFamily: "var(--font-sans)" }}
      >
        <div
          className="max-w-md w-full rounded-3xl p-8 text-center"
          style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(28,24,20,0.04)" }}
        >
          <h1 className="font-display text-[20px] font-semibold" style={{ color: C.ink }}>
            Something went wrong
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: C.inkMuted }}>
            Sorry, that page hit an unexpected error. Reloading usually fixes it. If it
            keeps happening, email your TwentySix consultant and we'll sort it.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-full px-4 h-10 text-[12.5px] font-semibold"
              style={{ background: C.ink, color: C.canvas }}
            >
              Reload
            </button>
            <a
              href="mailto:hello@twentysixconsulting.co.uk"
              className="inline-flex items-center rounded-full px-4 h-10 text-[12.5px] font-medium"
              style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}` }}
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    );
  }
}
