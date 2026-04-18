import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUTTON_STYLES, resolveTheme, type ButtonStyleId } from "@/lib/themes";
import { getSocial } from "@/lib/socials";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  button_style: string;
  use_custom_colors?: boolean | null;
  background_color?: string | null;
  text_color?: string | null;
  button_color?: string | null;
  button_text_color?: string | null;
}
interface LinkData {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  position: number;
  type?: string;
  start_at?: string | null;
  end_at?: string | null;
}
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

function isLinkLive(l: LinkData): boolean {
  const now = Date.now();
  if (l.start_at && new Date(l.start_at).getTime() > now) return false;
  if (l.end_at && new Date(l.end_at).getTime() < now) return false;
  return true;
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
  const theme = resolveTheme(profile);
  const buttonStyle = BUTTON_STYLES.find((b) => b.id === (profile.button_style as ButtonStyleId)) ?? BUTTON_STYLES[0];
  const visibleLinks = links.filter(isLinkLive);

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

        {/* Blocks */}
        <div className="mt-6 flex w-full flex-col gap-3">
          {visibleLinks.length === 0 && <div className="text-xs opacity-60">No links yet</div>}
          {visibleLinks.map((link) => {
            if (link.type === "header") {
              return (
                <div key={link.id} className="pt-2 pb-1 text-xs font-bold uppercase tracking-wider opacity-70">
                  {link.title}
                </div>
              );
            }
            if (link.type === "email") {
              return (
                <EmailCollector
                  key={link.id}
                  link={link}
                  profileId={profile.id}
                  buttonClass={buttonStyle.className}
                  buttonStyleId={buttonStyle.id}
                  theme={theme}
                />
              );
            }
            return (
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
            );
          })}
        </div>

        <div className="mt-10 text-[10px] opacity-50">linkly.app</div>
      </div>
    </div>
  );
}

function EmailCollector({
  link,
  profileId,
  buttonClass,
  buttonStyleId,
  theme,
}: {
  link: LinkData;
  profileId: string;
  buttonClass: string;
  buttonStyleId: string;
  theme: { button: string; buttonText: string; text: string };
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("email_subscribers").insert({
      profile_id: profileId,
      email: email.toLowerCase(),
      source_link_id: link.id,
    });
    setSubmitting(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className={`w-full px-5 py-3 text-sm font-semibold ${buttonClass}`} style={{ background: theme.button, color: theme.buttonText }}>
        Thanks for subscribing! 🎉
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2">
      {link.title && <div className="text-xs font-semibold opacity-80">{link.title}</div>}
      <div className="flex w-full gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`flex-1 px-3 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-current ${buttonClass}`}
          style={{
            background: "rgba(255,255,255,0.7)",
            color: "oklch(0.20 0.02 240)",
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-3 text-sm font-semibold transition-pop hover:scale-[1.02] ${buttonClass}`}
          style={{
            background: buttonStyleId === "outline" ? "transparent" : theme.button,
            color: buttonStyleId === "outline" ? theme.text : theme.buttonText,
            borderColor: buttonStyleId === "outline" ? theme.button : undefined,
          }}
        >
          {submitting ? "..." : "Join"}
        </button>
      </div>
    </form>
  );
}
