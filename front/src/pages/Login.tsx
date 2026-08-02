import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../context/auth";

// Cloudflare Turnstile site key. Defaults to Cloudflare's "always passes" TEST key.
// In production, set VITE_TURNSTILE_SITE_KEY to your real site key.
const TURNSTILE_SITE_KEY =
  (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY ||
  "1x00000000000000000000AA";

// Minimal typing for the Turnstile script API we use.
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // CAPTCHA state — only shown after the backend flags the account (captcha_required)
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const { login, logoutReason } = useAuth();
  const navigate = useNavigate();

  // Show reuse detection / expiry message if redirected from session loss
  useEffect(() => {
    if (logoutReason === "reuse_detected") {
      setError("Your session was revoked for security reasons. Please sign in again.");
    } else if (logoutReason === "expired") {
      setError("Your session has expired. Please sign in again.");
    }
  }, [logoutReason]);

  // Load + render the Turnstile widget when the backend demands a CAPTCHA
  useEffect(() => {
    if (!showCaptcha) return;

    function renderWidget() {
      if (!captchaContainerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(captchaContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(null),
        "error-callback": () => setCaptchaToken(null),
      });
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [showCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (showCaptcha && !captchaToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(email, password, captchaToken || undefined);
      // Refresh token is set as httpOnly cookie automatically by the server
      login(data.accessToken);
      navigate("/admin");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg === "captcha_required") {
        // Backend flagged the account — demand a CAPTCHA from now on
        setShowCaptcha(true);
        setError("Too many failed attempts. Please complete the security check.");
      } else {
        setError(msg || "Login failed");
      }
      // Force the user to re-solve the widget on the next attempt
      setCaptchaToken(null);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">OSS Admin</h1>
          <p className="text-ink/60 mt-2">Sign in to manage your platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          {error && (
            <div className={`border px-4 py-3 rounded-lg text-sm ${
              logoutReason === "reuse_detected"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
              placeholder="••••••••"
            />
          </div>

          {/* CAPTCHA — rendered on demand after the backend flags the account */}
          {showCaptcha && (
            <div className="flex justify-center">
              <div ref={captchaContainerRef} />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (showCaptcha && !captchaToken)}
            className="w-full py-2.5 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
