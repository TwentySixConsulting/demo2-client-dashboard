import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { clientNameToEmail } from "@/config/clientConfig";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { ZigbertLogo } from "@/components/ZigbertLogo";

// Zigbert brand palette — clay accent on cream, navy ink.
const C = {
  canvas: "#F4F1EA",
  surface: "#FFFFFF",
  surfaceSoft: "#FBF8F2",
  ink: "#121C2B",
  inkMuted: "#4B5563",
  inkSubtle: "#8A93A2",
  border: "#E7E0D4",
  borderSubtle: "#EFE9DD",
  brass: "#C9785A",       // clay accent
  brassSoft: "#E8D8CE",   // clay tint
} as const;

export function LoginPage() {
  const { signIn, tempSignIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      const result = tempSignIn(username, password);
      if (result.error) {
        setError("Those credentials didn't work. Please try again.");
        setLoading(false);
      }
      return;
    }

    const email = clientNameToEmail(username);
    const result = await signIn(email, password);
    if (result.error) {
      setError("Those credentials didn't work. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-stretch"
      style={{
        background: C.canvas,
        fontFamily: "var(--font-sans)",
        color: C.ink,
      }}
    >
      {/* ── Left panel — editorial cream with subtle brass accent ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 xl:w-[55%] relative overflow-hidden p-12 xl:p-16"
        style={{
          background: C.surfaceSoft,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Soft brass radials */}
        <div
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(138,107,62,0.10) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-28 -left-28 w-[22rem] h-[22rem] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(138,107,62,0.06) 0%, transparent 65%)",
          }}
        />
        {/* Pinstripe pattern */}
        <div
          className="absolute inset-0 opacity-[0.55] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(28,24,20,0.025) 1px, transparent 1px)",
            backgroundSize: "100% 56px",
          }}
        />

        <div className="relative">
          <ZigbertLogo height={38} variant="dark" tagline />
        </div>

        <div className="relative max-w-md">
          <h2
            className="text-4xl xl:text-[3.4rem] font-semibold tracking-tight leading-[1.04] mb-5"
            style={{ color: C.ink, letterSpacing: "-0.018em" }}
          >
            The market, decoded — role by role, benefit by benefit.
          </h2>
          <p
            className="text-[15px] xl:text-[16px] leading-relaxed"
            style={{ color: C.inkMuted }}
          >
            A premium reward intelligence platform built by TwentySix Consulting
            — ready when you are.
          </p>
        </div>

        <div className="relative flex items-center gap-2">
          <ShieldCheck
            className="w-3.5 h-3.5"
            style={{ color: C.brass, opacity: 0.85 }}
          />
          <span
            className="text-[11px] tracking-wide"
            style={{ color: C.inkMuted }}
          >
            Secure client access · TwentySix Consulting
          </span>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10 relative"
        style={{ background: C.surface }}
      >
        {/* Mobile-only brand strip */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center">
          <ZigbertLogo height={22} variant="dark" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-9">
            <h1
              className="text-[28px] font-semibold tracking-tight leading-tight mb-2"
              style={{ color: C.ink }}
            >
              Welcome back
            </h1>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: C.inkMuted }}
            >
              Sign in with the username and password we sent you.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 px-3.5 py-2.5 rounded-lg flex items-center gap-2 text-[13px]"
              style={{
                background: "rgba(168,117,117,0.08)",
                border: "1px solid rgba(168,117,117,0.25)",
                color: "#8a4d4d",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="login-username"
                className="text-[11px] font-semibold uppercase mb-2 block"
                style={{ color: C.inkMuted, letterSpacing: "0.16em" }}
              >
                Username
              </Label>
              <Input
                id="login-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="h-11 text-[14px]"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.ink,
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label
                  htmlFor="login-password"
                  className="text-[11px] font-semibold uppercase block"
                  style={{ color: C.inkMuted, letterSpacing: "0.16em" }}
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowReset((v) => !v)}
                  className="text-[11px] font-medium hover:underline"
                  style={{ color: C.brass }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="h-11 text-[14px] pr-11"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.ink,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center rounded-r-md transition-colors"
                  style={{ color: C.inkSubtle }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {showReset && (
                <p
                  className="text-[11.5px] leading-relaxed mt-2 rounded-lg px-3 py-2"
                  style={{ background: C.brassSoft, color: C.inkMuted }}
                >
                  Your TwentySix consultant manages access. Email{" "}
                  <a
                    href="mailto:hello@twentysixconsulting.co.uk?subject=Password%20reset%20request"
                    className="font-medium hover:underline"
                    style={{ color: C.ink }}
                  >
                    hello@twentysixconsulting.co.uk
                  </a>{" "}
                  and we'll reset it for you.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-[14px] font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{
                background: C.ink,
                color: C.canvas,
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div
            className="h-px w-full my-7"
            style={{ background: C.borderSubtle }}
          />

          <p
            className="text-center text-[11px] tracking-wide leading-relaxed"
            style={{ color: C.inkMuted }}
          >
            Trouble signing in? Email{" "}
            <a
              href="mailto:hello@twentysixconsulting.co.uk"
              className="font-medium hover:underline"
              style={{ color: C.ink }}
            >
              hello@twentysixconsulting.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
