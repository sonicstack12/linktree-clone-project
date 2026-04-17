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
    const [l, s] = await Promise.all([
      supabase.from("links").select("*").eq("profile_id", profile.id).eq("enabled", true).order("position"),
      supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
    ]);
    return { profile, links: l.data ?? [], socials: s.data ?? [] };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.profile;
    if (!p) return { meta: [{ title: "Not found — Linkly" }] };
    const title = `@${p.username} — Linkly`;
    const desc = p.bio ?? `Find @${p.username} on Linkly.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "profile" },
    ];
    if (p.avatar_url) {
      meta.push({ property: "og:image", content: p.avatar_url });
      meta.push({ name: "twitter:image", content: p.avatar_url });
    }
    return { meta };
  },
});

function PublicProfilePage() {
  const { profile, links, socials } = Route.useLoaderData();
  const [tracked, setTracked] = useState(false);

  // Record a page view once on mount.
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
