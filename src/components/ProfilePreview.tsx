import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { THEMES, BUTTON_STYLES, type ThemeId, type ButtonStyleId } from "@/lib/themes";
import { getSocial } from "@/lib/socials";

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  button_style: string;
}
interface LinkData { id: string; title: string; url: string; enabled: boolean; position: number }
interface SocialData { id: string; platform: string; url: string; position: number }

export function ProfilePreview({ profileId }: { profileId: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [socials, setSocials] = useState<SocialData[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, l, s] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).single(),
        supabase.from("links").select("*").eq("profile_id", profileId).order("position"),
        supabase.from("social_links").select("*").eq("profile_id", profileId).order("position"),
      ]);
      if (p.data) setProfile(p.data as ProfileData);
      setLinks((l.data as LinkData[]) ?? []);
      setSocials((s.data as SocialData[]) ?? []);
    };
    load();
    // Re-poll every 1.5s while preview is mounted (cheap, since it's the dashboard)
    const interval = setInterval(load, 1500);
    return () => clearInterval(interval);
  }, [profileId]);

  if (!profile) return null;

  return (
    <div>
      <div className="mb-3 text-center text-xs font-medium text-muted-foreground">Live preview</div>
      <PhoneFrame>
        <PublicProfileBody profile={profile} links={links.filter((l) => l.enabled)} socials={socials} />
      </PhoneFrame>
    </div>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto aspect-[9/19] w-full max-w-[300px] overflow-hidden rounded-[2.5rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-pop">
      <div className="relative h-full w-full overflow-y-auto rounded-[2rem]">
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground" />
        {children}
      </div>
    </div>
  );
}

export function PublicProfileBody({
  profile,
  links,
  socials,
  onLinkClick,
}: {
  profile: ProfileData;
  links: LinkData[];
  socials: SocialData[];
  onLinkClick?: (linkId: string, url: string) => void;
}) {
  const theme = THEMES[(profile.theme as ThemeId)] ?? THEMES.leaf;
  const buttonStyle = BUTTON_STYLES.find((b) => b.id === (profile.button_style as ButtonStyleId)) ?? BUTTON_STYLES[0];

  return (
    <div className="min-h-full px-5 pt-12 pb-8" style={{ background: theme.background, color: theme.text }}>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username} className="h-24 w-24 rounded-full object-cover shadow-pop" />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white/30 text-3xl font-bold shadow-pop backdrop-blur" style={{ color: theme.text }}>
            {(profile.display_name ?? profile.username)[0]?.toUpperCase()}
          </div>
        )}
        <div className="mt-4 text-lg font-bold">@{profile.username}</div>
        {profile.display_name && profile.display_name !== profile.username && (
          <div className="text-sm font-medium opacity-90">{profile.display_name}</div>
        )}
        {profile.bio && <p className="mt-2 max-w-xs text-sm opacity-80">{profile.bio}</p>}

        {/* Socials */}
        {socials.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {socials.map((s) => {
              const meta = getSocial(s.platform);
              const Icon = meta.icon;
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full transition-pop hover:scale-110"
                  style={{ background: theme.button, color: theme.buttonText }}
                  aria-label={meta.name}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}

        {/* Links */}
        <div className="mt-6 flex w-full flex-col gap-3">
          {links.length === 0 && <div className="text-xs opacity-60">No links yet</div>}
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClick?.(link.id, link.url)}
              className={`block w-full px-5 py-3 text-sm font-semibold transition-pop hover:scale-[1.02] hover:shadow-pop ${buttonStyle.className}`}
              style={{
                background: buttonStyle.id === "outline" ? "transparent" : theme.button,
                color: buttonStyle.id === "outline" ? theme.text : theme.buttonText,
                borderColor: buttonStyle.id === "outline" ? theme.button : undefined,
              }}
            >
              {link.title}
            </a>
          ))}
        </div>

        <div className="mt-10 text-[10px] opacity-50">linkly.app</div>
      </div>
    </div>
  );
}
