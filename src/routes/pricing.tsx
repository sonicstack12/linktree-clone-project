import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Free forever, Pro $5/mo | Linkly" },
      { name: "description", content: "Linkly is free forever. Upgrade to Pro for $5/month for advanced analytics, custom domain, link scheduling and no branding." },
      { property: "og:title", content: "Linkly Pricing — Free forever, Pro $5/mo" },
      { property: "og:description", content: "Start free. Upgrade only when you need more — advanced analytics, custom domain, scheduling and more." },
      { property: "og:type", content: "website" },
    ],
  }),
});

const PLANS = [
  {
    name: "Free",
    price: "$0",
    desc: "Everything you need to get started.",
    features: ["Unlimited links", "Beautiful themes", "Basic analytics", "Custom username"],
    cta: "Get started",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$5",
    desc: "For creators who want more.",
    features: ["Everything in Free", "Advanced analytics", "Custom domain", "Schedule links", "Remove branding", "Priority support"],
    cta: "Go Pro",
    variant: "hero" as const,
    highlight: true,
  },
];

function PricingPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> 0% transaction fees — ever
          </div>
          <h1 className="text-5xl font-bold sm:text-6xl">Simple pricing.</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Pay only when you need more. We never take a cut of your sales.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`p-8 shadow-card ${plan.highlight ? "border-2 border-primary shadow-pop" : ""}`}>
              {plan.highlight && (
                <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={plan.variant} size="lg" className="mt-8 w-full">
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-20">
          <h2 className="text-center text-3xl font-bold">Linkly vs Linktree</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Pro-creator, not pro-corporate.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border-2 border-border shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Linkly</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Linktree</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Transaction fees on sales", "0%", "Up to 12%"],
                  ["Custom domain", "Free", "$15/mo (Pro)"],
                  ["Bento grid layout", "yes", "no"],
                  ["Native app deep-linking", "yes", "no"],
                  ["Privacy-first mode (no tracking)", "yes", "no"],
                  ["Traffic source breakdown", "Free", "Paid"],
                  ["Verified badge", "Free (social proof)", "Paid"],
                ].map(([feat, ours, theirs]) => (
                  <tr key={feat} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{feat}</td>
                    <td className="px-4 py-3 text-center">
                      {ours === "yes" ? <Check className="mx-auto h-4 w-4 text-primary" /> : <span className="font-semibold text-primary">{ours}</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {theirs === "no" ? <X className="mx-auto h-4 w-4 opacity-50" /> : theirs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
