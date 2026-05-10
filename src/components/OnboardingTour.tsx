import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles, ArrowRight, X, LayoutDashboard, Palette, BadgeCheck, BarChart3, PartyPopper, Package,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_FALLBACK = "linkly_onboarded_v2";

interface Step {
  icon: typeof Sparkles;
  title: string;
  body: string;
  /** route to navigate to before showing the step */
  route?: string;
  /** data-tour attribute on the element to highlight */
  anchor?: string;
  cta?: { label: string; to?: string };
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to Linkly 👋",
    body: "Let's take 45 seconds to set up your page. We'll point at the exact buttons to click — skip any time.",
  },
  {
    icon: LayoutDashboard,
    title: "1. Add your first link",
    body: "This is your homebase. Click 'Add block' to add link buttons, headers, embeds, or live GitHub/Discord stats.",
    route: "/admin",
    anchor: "add-block",
    cta: { label: "Got it", to: "/admin" },
  },
  {
    icon: Palette,
    title: "2. Make it yours",
    body: "Switch theme, layout (Classic ↔ Bento), glassmorphism, and add a free custom domain — all from here.",
    route: "/admin/appearance",
    anchor: "appearance-nav",
    cta: { label: "Open Appearance", to: "/admin/appearance" },
  },
  {
    icon: Package,
    title: "3. Build a Product page",
    body: "New! Create a product/landing page with images & description, publish it, and Linkly auto-links it from your bio.",
    route: "/admin/products",
    anchor: "products-nav",
    cta: { label: "Open Products", to: "/admin/products" },
  },
  {
    icon: BadgeCheck,
    title: "4. Get verified (free)",
    body: "Submit a real GitHub/LinkedIn/X/Instagram/YouTube link — we review within 48h and add a ✓ to your page.",
    route: "/admin/verification",
    anchor: "verification-nav",
    cta: { label: "Apply", to: "/admin/verification" },
  },
  {
    icon: BarChart3,
    title: "5. Watch what works",
    body: "Privacy-first analytics show views, top links, and traffic sources — without tracking your visitors.",
    route: "/admin/analytics",
    anchor: "analytics-nav",
    cta: { label: "See Analytics", to: "/admin/analytics" },
  },
  {
    icon: PartyPopper,
    title: "You're all set!",
    body: "Hit Preview at the top right anytime to see your live page. Welcome to the creator-first internet.",
    anchor: "preview-btn",
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

export function OnboardingTour() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Decide whether to open: server-first, with localStorage as offline fallback.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const doneOnServer = !!data?.onboarded_at;
      const doneLocal = typeof window !== "undefined" && !!localStorage.getItem(LOCAL_FALLBACK);
      if (!doneOnServer && !doneLocal) {
        setTimeout(() => setOpen(true), 400);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Navigate to the route the step needs
  useEffect(() => {
    if (!open) return;
    const s = STEPS[step];
    if (s.route && location.pathname !== s.route) {
      navigate({ to: s.route });
    }
  }, [open, step, location.pathname, navigate]);

  // Track the anchor element rect (re-measure on resize/scroll)
  useLayoutEffect(() => {
    if (!open) { setRect(null); return; }
    const s = STEPS[step];
    if (!s.anchor) { setRect(null); return; }

    let raf = 0;
    const measure = () => {
      const el = document.querySelector(`[data-tour="${s.anchor}"]`) as HTMLElement | null;
      if (!el) {
        // Try again next frame — destination route may not have mounted yet
        raf = requestAnimationFrame(measure);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step, location.pathname]);

  if (!open) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  const finish = async () => {
    if (typeof window !== "undefined") localStorage.setItem(LOCAL_FALLBACK, "1");
    setOpen(false);
    if (user) {
      await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", user.id);
    }
  };

  const next = () => { if (isLast) { finish(); return; } setStep((i) => i + 1); };
  const goCta = () => { if (s.cta?.to) navigate({ to: s.cta.to }); next(); };

  // Tooltip card position relative to the highlighted rect (or centred if none)
  const tooltipStyle: React.CSSProperties = rect
    ? (() => {
        const margin = 12;
        const cardW = 360;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
        const vh = typeof window !== "undefined" ? window.innerHeight : 768;
        const below = rect.top + rect.height + margin;
        const goBelow = below + 240 < vh;
        const top = goBelow ? below : Math.max(margin, rect.top - 240 - margin);
        let left = rect.left + rect.width / 2 - cardW / 2;
        left = Math.max(margin, Math.min(left, vw - cardW - margin));
        return { position: "fixed", top, left, width: cardW, zIndex: 102 };
      })()
    : { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "min(92vw, 420px)", zIndex: 102 };

  return (
    <>
      {/* Dimmed backdrop with a hole around the highlighted element */}
      <div
        className="fixed inset-0 z-[100] bg-foreground/55 backdrop-blur-[2px] transition-opacity"
        style={
          rect
            ? {
                clipPath: `polygon(
                  0% 0%, 0% 100%, ${rect.left - 8}px 100%,
                  ${rect.left - 8}px ${rect.top - 8}px,
                  ${rect.left + rect.width + 8}px ${rect.top - 8}px,
                  ${rect.left + rect.width + 8}px ${rect.top + rect.height + 8}px,
                  ${rect.left - 8}px ${rect.top + rect.height + 8}px,
                  ${rect.left - 8}px 100%,
                  100% 100%, 100% 0%
                )`,
              }
            : undefined
        }
      />

      {/* Glow ring around the highlighted element */}
      {rect && (
        <div
          className="pointer-events-none fixed z-[101] rounded-2xl ring-4 ring-primary ring-offset-2 ring-offset-background animate-pulse"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      )}

      {/* Tooltip card */}
      <Card style={tooltipStyle} className="overflow-hidden p-0 shadow-pop animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={finish}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-1 px-6 pt-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold">{s.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={finish}>Skip tour</Button>
            <div className="flex items-center gap-2">
              {step > 0 && !isLast && (
                <Button variant="outline" size="sm" onClick={() => setStep((i) => i - 1)}>Back</Button>
              )}
              {s.cta ? (
                <Button variant="hero" size="sm" onClick={goCta}>
                  {s.cta.label} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" size="sm" onClick={next}>
                  {isLast ? "Get started" : "Next"} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>
      </Card>
    </>
  );
}

export async function resetOnboarding(userId?: string) {
  if (typeof window !== "undefined") localStorage.removeItem(LOCAL_FALLBACK);
  if (userId) await supabase.from("profiles").update({ onboarded_at: null }).eq("id", userId);
}
