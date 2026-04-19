import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicProfileBody } from "@/components/ProfilePreview";

export const Route = createFileRoute("/u/$username")({
  component: PublicProfilePage,
  loader: async ({ params }) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", params.username)
      .maybeSingle();
    if (!profile) return { profile: null, links: [], socials: [] };
    const nowIso = new Date().toISOString();
    const [l, s] = await Promise.all([
      supabase
        .from("links")
        .select("*")
        .eq("profile_id", profile.id)
        .eq("enabled", true)
        .or(`start_at.is.null,start_at.lte.${nowIso}`)
        .or(`end_at.is.null,end_at.gte.${nowIso}`)
        .order("position"),
      supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
    ]);
    return { profile, links: l.data ?? [], socials: s.data ?? [] };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.profile;
    if (!p) return { meta: [{ title: "Not found — Linkly" }] };
    const handle = p.username;
    const name = p.display_name ?? `@${handle}`;
    const title = `${name} (@${handle}) — Linkly`;
    const desc = p.bio ?? `Find @${handle} on Linkly — all their links in one place.`;
    // Use uploaded avatar when available; otherwise fall back to dynamic OG endpoint.
    const ogImage = p.avatar_url ?? `/og/u/${params?.username ?? handle}.svg`;

    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "profile" },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: ogImage },
    ];

    // JSON-LD Person schema for rich Google results
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      alternateName: `@${handle}`,
      description: desc,
      ...(p.avatar_url ? { image: p.avatar_url } : {}),
      url: typeof window !== "undefined" ? window.location.href : `/u/${handle}`,
    };

    return {
      meta,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
});

function PublicProfilePage() {
  const { profile, links, socials } = Route.useLoaderData();
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!profile || tracked) return;
    setTracked(true);
    supabase.from("page_views").insert({
      profile_id: profile.id,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  }, [profile, tracked]);

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <h1 className="text-3xl font-bold">@{Route.useParams().username} doesn't exist</h1>
          <p className="mt-2 text-muted-foreground">This linkly hasn't been claimed yet.</p>
          <Link to="/signup" className="mt-6 inline-flex rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
            Claim it
          </Link>
        </div>
      </div>
    );
  }

  const handleLinkClick = (linkId: string) => {
    supabase.from("click_events").insert({
      link_id: linkId,
      profile_id: profile.id,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  };

  return (
    <div className="min-h-screen">
      <PublicProfileBody profile={profile} links={links} socials={socials} onLinkClick={handleLinkClick} />
    </div>
  );
}
