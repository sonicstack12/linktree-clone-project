import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { THEMES, BUTTON_STYLES, TEMPLATES, type ThemeId, type ButtonStyleId } from "@/lib/themes";
import { ProfilePreview } from "@/components/ProfilePreview";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/appearance")({
  component: AppearancePage,
});

interface ProfileRow {
  id: string;
  theme: string;
  button_style: string;
  username: string;
}

function AppearancePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("id, theme, button_style, username").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data as ProfileRow); });
  }, [user]);

  const updateProfile = async (patch: Partial<ProfileRow>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (error) toast.error(error.message);
  };

  const applyTemplate = async (theme: ThemeId, buttonStyle: ButtonStyleId) => {
    await updateProfile({ theme, button_style: buttonStyle });
    toast.success("Template applied!");
  };

  if (!profile) return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Templates */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Quick templates</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((t) => {
              const theme = THEMES[t.theme];
              return (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.theme, t.buttonStyle)}
                  className="group overflow-hidden rounded-xl border-2 border-transparent text-left transition-pop hover:border-primary hover:shadow-pop"
                >
                  <div className="aspect-[3/4] p-3" style={{ background: theme.background }}>
                    <div className="mx-auto flex h-full max-w-[110px] flex-col items-center gap-1.5">
                      <div className="h-8 w-8 rounded-full bg-white/90" />
                      <div className="text-[9px] font-bold" style={{ color: theme.text }}>@{t.id}</div>
                      {[0, 1, 2].map((i) => (
                        <div key={i} className={`h-4 w-full ${t.buttonStyle === "pill" ? "rounded-full" : "rounded-md"}`} style={{ background: theme.button }} />
                      ))}
                    </div>
                  </div>
                  <div className="p-2 text-center text-xs font-semibold">{t.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Themes */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Theme</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const theme = THEMES[id];
              const isActive = profile.theme === id;
              return (
                <button
                  key={id}
                  onClick={() => updateProfile({ theme: id })}
                  className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-pop ${isActive ? "border-primary shadow-pop scale-105" : "border-transparent hover:scale-105"}`}
                  style={{ background: theme.background }}
                >
                  {isActive && (
                    <div className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-md bg-black/20 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white backdrop-blur">
                    {theme.name}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Button style */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Button style</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BUTTON_STYLES.map((style) => {
              const isActive = profile.button_style === style.id;
              return (
                <Button
                  key={style.id}
                  variant={isActive ? "hero" : "outline"}
                  size="lg"
                  onClick={() => updateProfile({ button_style: style.id })}
                  className={style.className}
                >
                  {style.name}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProfilePreview profileId={profile.id} />
      </div>
    </div>
  );
}
