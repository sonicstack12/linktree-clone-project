import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  THEMES, BUTTON_STYLES, TEMPLATES, FONT_FAMILIES, BUTTON_EFFECTS, BACKGROUND_PATTERNS, ANIMATION_STYLES,
  type ThemeId, type ButtonStyleId, type FontFamilyId, type ButtonEffectId,
  type BackgroundPatternId, type AnimationStyleId,
} from "@/lib/themes";
import { ProfilePreview } from "@/components/ProfilePreview";
import { ColorPicker } from "@/components/ColorPicker";
import { Input } from "@/components/ui/input";
import { Check, LayoutGrid, List, Sparkles, ShieldCheck, BadgeCheck, Moon, Globe, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/appearance")({
  component: AppearancePage,
});

interface ProfileRow {
  id: string;
  theme: string;
  button_style: string;
  username: string;
  use_custom_colors: boolean;
  background_color: string | null;
  text_color: string | null;
  button_color: string | null;
  button_text_color: string | null;
  font_family: string;
  button_effect: string;
  background_pattern: string;
  animation_style: string;
  layout: string;
  auto_dark: boolean;
  glass_effect: boolean;
  privacy_mode: boolean;
  verified: boolean;
  verified_source: string | null;
  custom_domain: string | null;
}

const DEFAULT_CUSTOM = {
  background_color: "#f0fdf4",
  text_color: "#14532d",
  button_color: "#16a34a",
  button_text_color: "#ffffff",
};

function AppearancePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data as ProfileRow); });
  }, [user]);

  const updateProfile = async (patch: Partial<ProfileRow>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (error) toast.error(error.message);
  };

  const applyTemplate = async (t: typeof TEMPLATES[number]) => {
    await updateProfile({
      theme: t.theme,
      button_style: t.buttonStyle,
      use_custom_colors: false,
      font_family: t.fontFamily ?? "inter",
      button_effect: t.buttonEffect ?? "shadow",
      background_pattern: t.backgroundPattern ?? "none",
      animation_style: t.animationStyle ?? "fade",
    });
    toast.success(`${t.name} applied!`);
  };

  const enableCustom = async (on: boolean) => {
    if (on && !profile?.background_color) {
      await updateProfile({ use_custom_colors: true, ...DEFAULT_CUSTOM });
    } else {
      await updateProfile({ use_custom_colors: on });
    }
  };

  if (!profile) return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Templates */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Quick templates</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {TEMPLATES.map((t) => {
              const theme = THEMES[t.theme];
              const fontFamily = FONT_FAMILIES.find((f) => f.id === t.fontFamily)?.cssFamily;
              return (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="group overflow-hidden rounded-xl border-2 border-transparent text-left transition-pop hover:border-primary hover:shadow-pop"
                >
                  <div className="aspect-[3/4] p-3" style={{ background: theme.background, fontFamily }}>
                    <div className="mx-auto flex h-full max-w-[110px] flex-col items-center gap-1.5">
                      <div className="h-8 w-8 rounded-full bg-white/90" />
                      <div className="text-[9px] font-bold" style={{ color: theme.text }}>@{t.sampleHandle ?? t.id}</div>
                      {(t.sampleLinks ?? ["Link", "Link", "Link"]).slice(0, 3).map((label, i) => (
                        <div
                          key={i}
                          className={`flex h-4 w-full items-center justify-center text-[7px] font-semibold ${t.buttonStyle === "pill" ? "rounded-full" : t.buttonStyle === "square" ? "rounded-none" : "rounded-md"}`}
                          style={{ background: theme.button, color: theme.buttonText }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 text-center">
                    <div className="text-xs font-semibold">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Layout */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-1 text-lg font-bold">Layout</h2>
          <p className="mb-4 text-xs text-muted-foreground">Switch between a classic stacked list and a modern Bento grid.</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "classic", name: "Classic list", icon: List },
              { id: "bento", name: "Bento grid", icon: LayoutGrid },
            ] as const).map((opt) => {
              const isActive = (profile.layout ?? "classic") === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => updateProfile({ layout: opt.id })}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-pop ${isActive ? "border-primary bg-primary/10 shadow-pop" : "border-border hover:border-primary/50"}`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-sm font-semibold">{opt.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Visual effects */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> Visual effects
          </h2>
          <div className="space-y-4">
            <ToggleRow
              icon={<div className="grid h-9 w-9 place-items-center rounded-full bg-white/40 backdrop-blur-md ring-1 ring-white/60" />}
              title="Glassmorphism"
              desc="Frosted glass blur on link blocks — looks premium on photo backgrounds."
              checked={profile.glass_effect}
              onChange={(v) => updateProfile({ glass_effect: v })}
            />
            <ToggleRow
              icon={<Moon className="h-5 w-5 text-primary" />}
              title="Auto-adapt to dark mode"
              desc="Switch to a dark palette when visitors prefer dark theme on their device."
              checked={profile.auto_dark}
              onChange={(v) => updateProfile({ auto_dark: v })}
            />
          </div>
        </Card>

        {/* Trust & Privacy */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" /> Trust &amp; Privacy
          </h2>
          <div className="space-y-4">
            <ToggleRow
              icon={<ShieldCheck className="h-5 w-5 text-primary" />}
              title="Privacy First mode"
              desc="Disable all analytics tracking. Show a 'Privacy First' badge on your page."
              checked={profile.privacy_mode}
              onChange={(v) => updateProfile({ privacy_mode: v })}
            />
            <div className="rounded-xl border-2 border-dashed border-border p-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className={`h-5 w-5 ${profile.verified ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Verified creator badge</div>
                  <p className="text-xs text-muted-foreground">Paste a public profile URL (GitHub, LinkedIn, X) that shows your linkly handle in the bio. Free verification.</p>
                </div>
                <Switch
                  checked={profile.verified}
                  onCheckedChange={async (v) => {
                    if (v && !profile.verified_source) {
                      toast.error("Add a verification source URL first");
                      return;
                    }
                    await updateProfile({ verified: v });
                  }}
                />
              </div>
              <Input
                className="mt-3"
                placeholder="https://github.com/yourname"
                value={profile.verified_source ?? ""}
                onChange={(e) => updateProfile({ verified_source: e.target.value || null })}
              />
            </div>
          </div>
        </Card>

        {/* Custom domain */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
            <Globe className="h-5 w-5 text-primary" /> Custom domain
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Use <span className="font-mono">links.yourbrand.com</span> instead of /u/{profile.username}.
            Free on Linkly — no $15/mo upcharge.
          </p>
          <Input
            placeholder="links.yourbrand.com"
            value={profile.custom_domain ?? ""}
            onChange={(e) => updateProfile({ custom_domain: e.target.value.trim().toLowerCase() || null })}
          />
          {profile.custom_domain && (
            <div className="mt-4 space-y-2 rounded-xl border-2 border-dashed border-border p-4 text-xs">
              <div className="font-semibold">DNS setup</div>
              <p className="text-muted-foreground">Add this CNAME at your domain registrar, then we auto-issue SSL.</p>
              <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2 font-mono text-[11px]">
                <span className="opacity-60">Type</span><span>CNAME</span><span></span>
                <span className="opacity-60">Name</span>
                <span>{profile.custom_domain.split(".")[0]}</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(profile.custom_domain!.split(".")[0]); toast.success("Copied"); }}
                  className="rounded p-1 hover:bg-muted"
                ><Copy className="h-3 w-3" /></button>
                <span className="opacity-60">Target</span>
                <span>cname.linkly.app</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText("cname.linkly.app"); toast.success("Copied"); }}
                  className="rounded p-1 hover:bg-muted"
                ><Copy className="h-3 w-3" /></button>
              </div>
              <p className="pt-2 text-muted-foreground">
                Status: <span className="font-semibold text-amber-600">Pending verification</span> — propagation can take up to 24h.
              </p>
            </div>
          )}
        </Card>


        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Theme</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const theme = THEMES[id];
              const isActive = profile.theme === id && !profile.use_custom_colors;
              return (
                <button
                  key={id}
                  onClick={() => updateProfile({ theme: id, use_custom_colors: false })}
                  className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-pop ${isActive ? "border-primary shadow-pop scale-105" : "border-transparent hover:scale-105"}`}
                  style={{ background: theme.background }}
                >
                  {isActive && (
                    <div className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-md bg-black/30 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white backdrop-blur">
                    {theme.name}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Custom colors */}
        <Card className="p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Custom colors</h2>
              <p className="text-xs text-muted-foreground">Override the preset with your own palette.</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-toggle" className="text-sm">On</Label>
              <Switch id="custom-toggle" checked={profile.use_custom_colors} onCheckedChange={enableCustom} />
            </div>
          </div>
          <div className={`grid gap-4 sm:grid-cols-2 ${!profile.use_custom_colors ? "pointer-events-none opacity-40" : ""}`}>
            <ColorPicker label="Background" value={profile.background_color ?? DEFAULT_CUSTOM.background_color} onChange={(v) => updateProfile({ background_color: v })} />
            <ColorPicker label="Text" value={profile.text_color ?? DEFAULT_CUSTOM.text_color} onChange={(v) => updateProfile({ text_color: v })} />
            <ColorPicker label="Button" value={profile.button_color ?? DEFAULT_CUSTOM.button_color} onChange={(v) => updateProfile({ button_color: v })} />
            <ColorPicker label="Button text" value={profile.button_text_color ?? DEFAULT_CUSTOM.button_text_color} onChange={(v) => updateProfile({ button_text_color: v })} />
          </div>
        </Card>

        {/* Font family */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Font</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FONT_FAMILIES.map((f) => {
              const isActive = profile.font_family === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => updateProfile({ font_family: f.id as FontFamilyId })}
                  className={`rounded-xl border-2 p-4 text-left transition-pop ${isActive ? "border-primary shadow-pop" : "border-border hover:border-primary/50"}`}
                  style={{ fontFamily: f.cssFamily }}
                >
                  <div className="text-xs font-medium text-muted-foreground">{f.name}</div>
                  <div className="mt-1 text-xl font-bold">Aa</div>
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
                  onClick={() => updateProfile({ button_style: style.id as ButtonStyleId })}
                  className={style.className}
                >
                  {style.name}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Button effect */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Button effect</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {BUTTON_EFFECTS.map((eff) => {
              const isActive = profile.button_effect === eff.id;
              return (
                <button
                  key={eff.id}
                  onClick={() => updateProfile({ button_effect: eff.id as ButtonEffectId })}
                  className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-pop ${isActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  {eff.name}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Background pattern */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Background pattern</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {BACKGROUND_PATTERNS.map((p) => {
              const isActive = profile.background_pattern === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => updateProfile({ background_pattern: p.id as BackgroundPatternId })}
                  className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-pop ${isActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Animation style */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Link animation</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ANIMATION_STYLES.map((a) => {
              const isActive = profile.animation_style === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => updateProfile({ animation_style: a.id as AnimationStyleId })}
                  className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-pop ${isActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  {a.name}
                </button>
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

function ToggleRow({ icon, title, desc, checked, onChange }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-border p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
