import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, X, LayoutDashboard, Palette, BadgeCheck, BarChart3, Eye, PartyPopper } from "lucide-react";

const STORAGE_KEY = "linkly_onboarded_v1";

interface Step {
  icon: typeof Sparkles;
  title: string;
  body: string;
  cta?: { label: string; to: string };
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to Linkly 👋",
    body: "Let's take 30 seconds to set up your page. We'll show you the four things that matter — you can skip any time.",
  },
  {
    icon: LayoutDashboard,
    title: "1. Add your links",
    body: "The Links tab is your homebase. Add link buttons, section headers, embeds (YouTube, Spotify), and live GitHub/Discord stats.",
    cta: { label: "Open Links", to: "/admin" },
  },
  {
    icon: Palette,
    title: "2. Make it yours",
    body: "Pick a theme, switch between Classic list and Bento grid, turn on glassmorphism, and even add a custom domain — all free.",
    cta: { label: "Customize Appearance", to: "/admin/appearance" },
  },
  {
    icon: BadgeCheck,
    title: "3. Get verified (free)",
    body: "Submit a link from your real GitHub, LinkedIn, X, Instagram, or YouTube — we'll review within 48h and add a ✓ to your page.",
    cta: { label: "Apply for verification", to: "/admin/verification" },
  },
  {
    icon: BarChart3,
    title: "4. Watch what works",
    body: "Privacy-first analytics show views, top links, and traffic sources — without tracking your visitors.",
    cta: { label: "See Analytics", to: "/admin/analytics" },
  },
  {
    icon: PartyPopper,
    title: "You're all set!",
    body: "Hit Preview at the top right anytime to see your live page. Welcome to the creator-first internet.",
    cta: { label: "Preview my page", to: "/admin/preview" },
  },
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      // small delay so the dashboard renders behind the overlay
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const next = () => {
    if (isLast) { finish(); return; }
    setStep((i) => i + 1);
  };

  const goCta = () => {
    if (s.cta) navigate({ to: s.cta.to });
    next();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
      <Card className="relative w-full max-w-md overflow-hidden p-0 shadow-pop animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={finish}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1 px-6 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold">{s.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={finish}>
              Skip tour
            </Button>
            <div className="flex items-center gap-2">
              {step > 0 && !isLast && (
                <Button variant="outline" size="sm" onClick={() => setStep((i) => i - 1)}>
                  Back
                </Button>
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
    </div>
  );
}

// Helper to manually re-trigger (e.g. from a "Replay tour" button later)
export function resetOnboarding() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

// Suppress unused-import warning for icons we may want later
void [Eye];
