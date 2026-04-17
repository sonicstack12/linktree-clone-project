import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PhoneFrame, PublicProfileBody } from "@/components/ProfilePreview";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<{ profile: any; links: any[]; socials: any[] } | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("links").select("*").eq("profile_id", user.id).eq("enabled", true).order("position"),
      supabase.from("social_links").select("*").eq("profile_id", user.id).order("position"),
    ]).then(([p, l, s]) => {
      setData({ profile: p.data, links: l.data ?? [], socials: s.data ?? [] });
    });
  }, [user]);

  if (!data?.profile) return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Public link: <a className="font-mono text-foreground underline" href={`/u/${data.profile.username}`} target="_blank" rel="noopener noreferrer">{typeof window !== "undefined" && window.location.origin}/u/{data.profile.username}</a>
      </div>
      <PhoneFrame>
        <PublicProfileBody profile={data.profile} links={data.links} socials={data.socials} />
      </PhoneFrame>
      <div className="text-center">
        <Button variant="outline" onClick={() => navigate({ to: "/admin" })}>← Back to editor</Button>
      </div>
    </div>
  );
}
