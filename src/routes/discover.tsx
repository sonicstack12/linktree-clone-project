import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
  head: () => ({
    meta: [
      { title: "Discover creators on Linkly — browse the community" },
      { name: "description", content: "Browse creators, brands and businesses on Linkly. Find your next favorite link-in-bio page." },
      { property: "og:title", content: "Discover creators on Linkly" },
      { property: "og:description", content: "Browse the latest creators, brands and businesses on Linkly." },
      { property: "og:type", content: "website" },
    ],
  }),
});

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

function DiscoverPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url")
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => {
        setProfiles(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-bold sm:text-6xl">Discover</h1>
          <p className="mt-4 text-lg text-muted-foreground">Browse the latest creators on linkly.</p>
        </div>

        {loading ? (
          <div className="mt-14 text-center text-muted-foreground">Loading…</div>
        ) : profiles.length === 0 ? (
          <div className="mt-14 text-center text-muted-foreground">No profiles yet. <Link className="text-foreground underline" to="/signup">Be the first!</Link></div>
        ) : (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((p) => (
              <Link key={p.id} to="/$username" params={{ username: p.username }}>
                <Card className="flex items-center gap-3 p-4 shadow-card transition-pop hover:-translate-y-1 hover:shadow-pop">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.username} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-leaf text-lg font-bold text-primary-foreground">
                      {(p.display_name ?? p.username)[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.display_name ?? p.username}</div>
                    <div className="truncate text-xs text-muted-foreground">@{p.username}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MarketingLayout>
  );
}
