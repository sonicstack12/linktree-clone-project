import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SOCIAL_PLATFORMS, getSocial } from "@/lib/socials";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SocialRow {
  id: string;
  platform: string;
  url: string;
  position: number;
}

export function SocialLinksEditor({ profileId }: { profileId: string }) {
  const [socials, setSocials] = useState<SocialRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [picker, setPicker] = useState("");

  useEffect(() => {
    supabase.from("social_links").select("*").eq("profile_id", profileId).order("position")
      .then(({ data }) => setSocials((data as SocialRow[]) ?? []));
  }, [profileId]);

  const addSocial = async (platform: string) => {
    setAdding(false);
    setPicker("");
    const { data, error } = await supabase
      .from("social_links")
      .insert({ profile_id: profileId, platform, url: getSocial(platform).placeholder, position: socials.length })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    if (data) setSocials((prev) => [...prev, data as SocialRow]);
  };

  const updateSocial = async (id: string, url: string) => {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, url } : s)));
    await supabase.from("social_links").update({ url }).eq("id", id);
  };

  const removeSocial = async (id: string) => {
    setSocials((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("social_links").delete().eq("id", id);
  };

  const usedPlatforms = new Set(socials.map((s) => s.platform));
  const available = SOCIAL_PLATFORMS.filter((p) => !usedPlatforms.has(p.id));

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Social icons</h2>
        {!adding && available.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-4 flex flex-wrap gap-2">
          {available.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => addSocial(p.id)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <Icon className="h-3.5 w-3.5" /> {p.name}
              </button>
            );
          })}
          <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      )}

      {socials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No social icons yet. Add Instagram, X, TikTok and more.</p>
      ) : (
        <div className="space-y-2">
          {socials.map((s) => {
            const meta = getSocial(s.platform);
            const Icon = meta.icon;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <Input value={s.url} onChange={(e) => updateSocial(s.id, e.target.value)} placeholder={meta.placeholder} className="text-sm" />
                <Button variant="ghost" size="icon" onClick={() => removeSocial(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
