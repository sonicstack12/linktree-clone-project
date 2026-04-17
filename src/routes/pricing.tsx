import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Linkly" },
      { name: "description", content: "Free forever. Upgrade when you're ready for more." },
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
          <h1 className="text-5xl font-bold sm:text-6xl">Simple pricing.</h1>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Pay only when you need more.</p>
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
      </section>
    </MarketingLayout>
  );
}
