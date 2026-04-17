import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TEMPLATES, THEMES } from "@/lib/themes";
import { Sparkles, MousePointerClick, Palette, BarChart3, Zap, Globe2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Send signed-in users straight to their dashboard.
  useEffect(() => {
    if (user) navigate({ to: "/admin" });
  }, [user, navigate]);

  return (
    <MarketingLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-primary-glow/10" />
        <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-32">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Free forever • No credit card needed
            </span>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Everything you are.<br />
              <span className="bg-gradient-leaf bg-clip-text text-transparent">In one link.</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Linkly is the link-in-bio that helps creators, brands and businesses curate every link, video and product
              into one beautiful page — and turn followers into customers.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" variant="hero">
                <Link to="/signup">Claim your linkly →</Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/templates">Browse templates</Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["bg-gradient-sunset", "bg-gradient-ocean", "bg-gradient-rose", "bg-gradient-leaf"].map((g) => (
                  <div key={g} className={`h-8 w-8 rounded-full border-2 border-background ${g}`} />
                ))}
              </div>
              <span><strong className="text-foreground">2.4M+</strong> creators trust linkly</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 -z-10 animate-float rounded-[3rem] bg-gradient-leaf opacity-30 blur-2xl" />
            <PhonePreview />
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">Built for what's next.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Everything you need to grow your audience — nothing you don't.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: MousePointerClick, title: "Drag-to-reorder links", desc: "Rearrange your links in real time. Toggle them on or off with one click.", grad: "bg-gradient-leaf" },
            { icon: Palette, title: "Beautiful themes", desc: "Pick from gorgeous presets or build your own. Match your brand perfectly.", grad: "bg-gradient-sunset" },
            { icon: BarChart3, title: "Real-time analytics", desc: "See clicks, views and trends. Know what your audience loves.", grad: "bg-gradient-ocean" },
            { icon: Zap, title: "Lightning fast", desc: "Your page loads instantly — anywhere in the world.", grad: "bg-gradient-rose" },
            { icon: Globe2, title: "Your own URL", desc: "Get linkly.app/yourname. Yours, forever.", grad: "bg-gradient-leaf" },
            { icon: Sparkles, title: "Built-in templates", desc: "Start from a template made by designers. Tweak everything.", grad: "bg-gradient-sunset" },
          ].map((f) => (
            <Card key={f.title} className="group p-6 shadow-card transition-pop hover:-translate-y-1 hover:shadow-pop">
              <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${f.grad} shadow-pop transition-pop group-hover:scale-110`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TEMPLATES TEASER */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold sm:text-5xl">Start with a template.</h2>
            <p className="mt-3 text-muted-foreground">Six designer-made starting points. Make them yours.</p>
          </div>
          <Button asChild variant="outline"><Link to="/templates">See all templates →</Link></Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.slice(0, 6).map((t) => {
            const theme = THEMES[t.theme];
            return (
              <Card key={t.id} className="overflow-hidden p-0 shadow-card transition-pop hover:-translate-y-1 hover:shadow-pop">
                <div className="aspect-[4/5] p-6" style={{ background: theme.background }}>
                  <div className="mx-auto flex h-full max-w-[200px] flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-white/90 shadow-pop" />
                    <div className="text-sm font-semibold" style={{ color: theme.text }}>@{t.id}</div>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-9 w-full rounded-xl shadow-sm" style={{ background: theme.button, color: theme.buttonText }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-leaf p-10 text-primary-foreground shadow-pop sm:p-16">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold sm:text-5xl">Ready when you are.</h2>
            <p className="mt-3 max-w-lg text-lg text-primary-foreground/90">Join millions creating their corner of the internet. Free, forever.</p>
            <Button asChild size="xl" variant="hero" className="mt-7">
              <Link to="/signup">Get started — it's free</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function PhonePreview() {
  const theme = THEMES.leaf;
  return (
    <div className="relative aspect-[9/19] w-full rounded-[2.5rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-pop">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground" />
      <div className="h-full w-full overflow-hidden rounded-[2rem] p-5" style={{ background: theme.background }}>
        <div className="flex flex-col items-center gap-3 pt-6">
          <div className="h-20 w-20 rounded-full bg-gradient-sunset shadow-pop" />
          <div className="text-base font-bold" style={{ color: theme.text }}>@yourname</div>
          <div className="text-xs opacity-70" style={{ color: theme.text }}>Creator • Builder • Coffee lover ☕</div>
          <div className="mt-4 flex w-full flex-col gap-2.5">
            {["Latest YouTube video", "Shop my picks", "Listen on Spotify", "Book a 1:1 call"].map((label) => (
              <div key={label} className="rounded-full py-2.5 text-center text-sm font-semibold shadow-soft" style={{ background: theme.button, color: theme.buttonText }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
