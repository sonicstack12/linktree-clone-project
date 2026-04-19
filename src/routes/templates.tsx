import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TEMPLATES, THEMES, FONT_FAMILIES } from "@/lib/themes";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: "Templates — 12 designer link-in-bio designs | Linkly" },
      { name: "description", content: "Pick from 12 designer-made link-in-bio templates with custom fonts, animations and patterns. Free, fully customizable." },
      { property: "og:title", content: "12 designer link-in-bio templates — Linkly" },
      { property: "og:description", content: "Bold, neon, minimal, soft — pick a starting point and make it yours in seconds." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function TemplatesPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-bold sm:text-6xl">Templates</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Twelve designer-made starting points. Each one ships with custom fonts, animations and patterns. Make it yours in seconds.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => {
            const theme = THEMES[t.theme];
            const fontFamily = FONT_FAMILIES.find((f) => f.id === t.fontFamily)?.cssFamily;
            return (
              <Card key={t.id} className="overflow-hidden p-0 shadow-card transition-pop hover:-translate-y-1 hover:shadow-pop">
                <div className="aspect-[4/5] p-6" style={{ background: theme.background, fontFamily }}>
                  <div className="mx-auto flex h-full max-w-[220px] flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-white/90 shadow-pop" />
                    <div className="text-sm font-bold" style={{ color: theme.text }}>@{t.sampleHandle ?? t.id}</div>
                    <div className="text-[10px] opacity-70" style={{ color: theme.text }}>{t.description}</div>
                    {(t.sampleLinks ?? ["Link 1", "Link 2", "Link 3"]).map((label, i) => (
                      <div
                        key={i}
                        className={`flex h-9 w-full items-center justify-center text-xs font-semibold shadow-sm ${t.buttonStyle === "pill" ? "rounded-full" : t.buttonStyle === "square" ? "rounded-none" : "rounded-xl"}`}
                        style={{ background: theme.button, color: theme.buttonText }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                  <Button asChild size="sm" variant="hero"><Link to="/signup">Use</Link></Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}
