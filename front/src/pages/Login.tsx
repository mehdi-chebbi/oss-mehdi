import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../context/auth";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

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

  // CAPTCHA state is shown only after the backend flags the account.
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const { login, logoutReason } = useAuth();
  const navigate = useNavigate();

  // Show reuse detection / expiry message if redirected from session loss
  useEffect(() => {
    if (logoutReason === "reuse_detected") {
      setError("Votre session a été révoquée pour des raisons de sécurité. Veuillez vous reconnecter.");
    } else if (logoutReason === "expired") {
      setError("Votre session a expiré. Veuillez vous reconnecter.");
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
      setError("Veuillez effectuer la vérification de sécurité.");
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
        // The backend flagged the account, so CAPTCHA is now required.
        setShowCaptcha(true);
        setError("Trop de tentatives ont échoué. Veuillez effectuer la vérification de sécurité.");
      } else {
        setError(msg || "Échec de la connexion");
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
    <main className="admin-login min-h-[100dvh]">
      <section className="admin-login-visual">
        <div className="admin-login-visual-content">
          <span className="admin-login-mark"><ShieldCheck className="h-6 w-6" strokeWidth={1.8} /></span>
          <div>
            <p className="admin-login-organization">Observatoire du Sahara et du Sahel</p>
            <h1>Administration des contenus</h1>
            <p>Gérez le site de l’OSS, ses ressources institutionnelles, ses actualités, ses projets et ses informations publiques depuis un espace sécurisé.</p>
          </div>
          <span className="admin-login-secure"><LockKeyhole className="h-4 w-4" /> Accès réservé au personnel autorisé de l’OSS</span>
        </div>
      </section>

      <section className="admin-login-panel">
        <div className="admin-login-form-wrap">
          <div className="admin-login-heading">
            <p>Espace d’administration OSS</p>
            <h2>Bienvenue</h2>
            <span>Connectez-vous avec votre compte d’administration.</span>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className={`admin-login-alert ${
              logoutReason === "reuse_detected"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {error}
            </div>
          )}

          <div className="admin-login-field">
            <label>Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@oss.org.tn"
            />
          </div>

          <div className="admin-login-field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {/* CAPTCHA rendered on demand after the backend flags the account. */}
          {showCaptcha && (
            <div className="flex justify-center">
              <div ref={captchaContainerRef} />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (showCaptcha && !captchaToken)}
            className="admin-login-submit"
          >
            <span>{loading ? "Connexion..." : "Se connecter"}</span>
            {!loading && <ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}
