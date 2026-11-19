import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/p/$username/$slug")({
  component: ProductPage,
  loader: async ({ params }) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, verified")
      .ilike("username", params.username)
      .maybeSingle();
    if (!profile) throw notFound();

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (!product) throw notFound();

    return { profile, product };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div>
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">This product doesn't exist or is unpublished.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary underline">Back home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <p className="text-sm text-muted-foreground">
        Something went wrong: {error instanceof Error ? error.message : "An unexpected error occurred."}
      </p>
    </div>
  ),
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const prof = loaderData?.profile;
    if (!p || !prof) return { meta: [{ title: "Not found — Linkly" }] };
    const title = `${p.title} — by @${prof.username}`;
    const desc = p.tagline ?? p.description?.slice(0, 160) ?? `${p.title} on Linkly.`;
    const img = p.cover_image ?? prof.avatar_url ?? undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (img) {
      meta.push({ property: "og:image", content: img });
      meta.push({ name: "twitter:image", content: img });
    }
    return { meta };
  },
});

function ProductPage() {
  const { profile, product } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Top bar with creator */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/u/$username" params={{ username: profile.username }} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to @{profile.username}'s page
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Cover */}
        {product.cover_image && (
          <div className="overflow-hidden rounded-3xl shadow-pop">
            <img src={product.cover_image} alt={product.title} className="aspect-video w-full object-cover" />
          </div>
        )}

        {/* Title block */}
        <div className="mt-8">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{product.title}</h1>
          {product.tagline && (
            <p className="mt-3 text-lg text-muted-foreground sm:text-xl">{product.tagline}</p>
          )}
          {product.price && (
            <p className="mt-4 text-2xl font-bold text-primary">{product.price}</p>
          )}
        </div>

        {/* CTA */}
        {product.cta_label && product.cta_url && (
          <Button variant="hero" size="lg" className="mt-6 w-full sm:w-auto" asChild>
            <a href={product.cta_url} target="_blank" rel="noreferrer">{product.cta_label}</a>
          </Button>
        )}

        {/* Description */}
        {product.description && (
          <div className="prose prose-slate mt-10 max-w-none whitespace-pre-wrap text-base leading-relaxed">
            {product.description}
          </div>
        )}

        {/* Gallery */}
        {Array.isArray(product.gallery) && product.gallery.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold">Gallery</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(product.gallery as string[]).map((url, i) => (
                <img key={i} src={url} alt="" className="w-full rounded-2xl object-cover shadow-card" loading="lazy" />
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        {product.cta_label && product.cta_url && (
          <div className="mt-12">
            <Button variant="hero" size="lg" className="w-full" asChild>
              <a href={product.cta_url} target="_blank" rel="noreferrer">{product.cta_label}</a>
            </Button>
          </div>
        )}

        {/* Creator card */}
        <aside className="mt-16 rounded-3xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                {profile.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-semibold">{profile.display_name ?? profile.username}</p>
                {profile.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
              </div>
              {profile.bio && <p className="truncate text-sm text-muted-foreground">{profile.bio}</p>}
            </div>
            <Button asChild variant="outline">
              <Link to="/u/$username" params={{ username: profile.username }}>View page</Link>
            </Button>
          </div>
        </aside>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Built with <Link to="/" className="font-semibold text-foreground hover:underline">Linkly</Link> · 0% transaction fees
        </p>
      </article>
    </div>
  );
}
