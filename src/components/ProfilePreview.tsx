import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BUTTON_STYLES, FONT_FAMILIES, resolveTheme, patternCss, patternSize,
  animationClass, buttonEffectStyle,
  type ButtonStyleId, type FontFamilyId, type ButtonEffectId,
  type BackgroundPatternId, type AnimationStyleId, THEMES,
} from "@/lib/themes";
import { getSocial } from "@/lib/socials";

import { openWithDeepLink } from "@/lib/deepLinks";
import { detectEmbed } from "@/lib/embeds";
import { useReveal } from "@/hooks/useReveal";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { StatBlock } from "@/components/StatBlock";

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
  font_family?: string | null;
  button_effect?: string | null;
  background_pattern?: string | null;
  animation_style?: string | null;
  layout?: string | null;
  auto_dark?: boolean | null;
  glass_effect?: boolean | null;
  privacy_mode?: boolean | null;
  verified?: boolean | null;
  verified_source?: string | null;
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
  bento_size?: string | null;
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

/** Detect if visitor's system prefers dark mode */
function useSystemDark(enabled: boolean): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [enabled]);
  return dark;
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
  const baseTheme = resolveTheme(profile);
  const preset = THEMES[(profile.theme as keyof typeof THEMES)] ?? THEMES.leaf;
  const buttonStyle = BUTTON_STYLES.find((b) => b.id === (profile.button_style as ButtonStyleId)) ?? BUTTON_STYLES[0];
  const fontFamily = FONT_FAMILIES.find((f) => f.id === (profile.font_family as FontFamilyId)) ?? FONT_FAMILIES[0];
  const effect = (profile.button_effect as ButtonEffectId) ?? "shadow";
  const pattern = (profile.background_pattern as BackgroundPatternId) ?? "none";
  const anim = (profile.animation_style as AnimationStyleId) ?? "fade";
  const layout = (profile.layout ?? "classic") as "classic" | "bento";
  const glass = !!profile.glass_effect;
  const systemDark = useSystemDark(!!profile.auto_dark);

  // Auto-dark: if visitor prefers dark and creator opted in, swap to a dark theme
  const theme = systemDark
    ? { ...baseTheme, background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", text: "#f1f5f9", button: "#f1f5f9", buttonText: "#0f172a", accent: baseTheme.accent }
    : baseTheme;

  const visibleLinks = links.filter(isLinkLive);

  const patternStyle: React.CSSProperties = pattern !== "none" ? {
    backgroundImage: patternCss(pattern, theme.text),
    backgroundSize: patternSize(pattern),
  } : {};

  // Detect if base theme is dark for glass variant
  const isDarkText = (() => {
    const t = theme.text.toLowerCase();
    return t.includes("#f") || t.includes("#e") || t.includes("white") || /oklch\(\s*0?\.[89]/.test(t);
  })();
  const glassClass = isDarkText ? "glass-block-dark" : "glass-block";

  return (
    <div
      className="relative min-h-full px-5 pt-12 pb-8"
      style={{
        background: preset.backgroundImage && !systemDark
          ? `${preset.overlay ? preset.overlay + ", " : ""}url(${preset.backgroundImage}), ${theme.background}`
          : theme.background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: theme.text,
        fontFamily: fontFamily.cssFamily,
      }}
    >
      {pattern !== "none" && (
        <div className="pointer-events-none absolute inset-0 opacity-60" style={patternStyle} />
      )}
      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username} className="h-24 w-24 rounded-full object-cover shadow-pop" />
        ) : (
          <div
            className="grid h-24 w-24 place-items-center rounded-full text-3xl font-bold shadow-pop backdrop-blur"
            style={{ background: `${theme.button}33`, color: theme.text }}
          >
            {(profile.display_name ?? profile.username)[0]?.toUpperCase()}
          </div>
        )}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-lg font-bold">
          <span>@{profile.username}</span>
          {profile.verified && (
            <span title={`Verified${profile.verified_source ? ` via ${profile.verified_source}` : ""}`}>
              <BadgeCheck className="h-5 w-5 fill-current" style={{ color: theme.accent }} />
            </span>
          )}
        </div>
        {profile.display_name && profile.display_name !== profile.username && (
          <div className="text-sm font-medium opacity-90">{profile.display_name}</div>
        )}
        {profile.bio && <p className="mt-2 max-w-xs text-sm opacity-80">{profile.bio}</p>}

        {profile.privacy_mode && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold opacity-90"
            style={{ background: `${theme.button}22`, color: theme.text }}>
            <ShieldCheck className="h-3 w-3" /> Privacy First — no tracking
          </div>
        )}

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
                  onClick={(e) => { e.preventDefault(); openWithDeepLink(s.url); }}
                  className="grid h-9 w-9 place-items-center rounded-full transition-transform duration-200 hover:scale-110"
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
        {layout === "bento" ? (
          <div className="bento-grid mt-6 w-full">
            {visibleLinks.length === 0 && <div className="text-xs opacity-60">No blocks yet</div>}
            {visibleLinks.map((link, idx) => (
              <BentoBlock
                key={link.id}
                link={link}
                idx={idx}
                profile={profile}
                theme={theme}
                buttonStyle={buttonStyle}
                effect={effect}
                anim={anim}
                glass={glass}
                glassClass={glassClass}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex w-full flex-col gap-3">
            {visibleLinks.length === 0 && <div className="text-xs opacity-60">No links yet</div>}
            {visibleLinks.map((link, idx) => (
              <ClassicBlock
                key={link.id}
                link={link}
                idx={idx}
                profile={profile}
                theme={theme}
                buttonStyle={buttonStyle}
                effect={effect}
                anim={anim}
                glass={glass}
                glassClass={glassClass}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center gap-1.5 text-[10px] opacity-50">
          <span>linkly.app</span>
          <span>•</span>
          <span className="font-semibold">0% fees, ever</span>
        </div>
      </div>
    </div>
  );
}

interface BlockProps {
  link: LinkData;
  idx: number;
  profile: ProfileData;
  theme: { background: string; text: string; button: string; buttonText: string; accent: string };
  buttonStyle: typeof BUTTON_STYLES[number];
  effect: ButtonEffectId;
  anim: AnimationStyleId;
  glass: boolean;
  glassClass: string;
  onLinkClick?: (linkId: string, url: string) => void;
}

function ClassicBlock(props: BlockProps) {
  const { link, idx, profile, theme, buttonStyle, effect, anim, glass, glassClass, onLinkClick } = props;
  const revealRef = useReveal<HTMLDivElement>();
  const animStyle: React.CSSProperties = anim !== "none" ? { animationDelay: `${idx * 60}ms` } : {};

  if (link.type === "header") {
    return (
      <div
        ref={revealRef}
        className={`reveal-on-scroll pt-2 pb-1 text-xs font-bold uppercase tracking-wider opacity-70 ${animationClass(anim)}`}
        style={animStyle}
      >
        {link.title}
      </div>
    );
  }
  if (link.type === "github_stats" || link.type === "discord_stats") {
    return (
      <div ref={revealRef} className={`reveal-on-scroll ${animationClass(anim)}`} style={animStyle}>
        <StatBlock
          type={link.type}
          url={link.url}
          title={link.title}
          theme={theme}
          glass={glass}
          glassClass={glassClass}
          buttonClass={buttonStyle.className}
        />
      </div>
    );
  }

  // Auto-detect embed for any link URL
  const embed = detectEmbed(link.url);
  if (embed) {
    return (
      <div
        ref={revealRef}
        className={`reveal-on-scroll overflow-hidden ${buttonStyle.className} ${glass ? glassClass : ""} ${animationClass(anim)}`}
        style={{ background: glass ? undefined : "rgba(0,0,0,0.05)", ...animStyle }}
      >
        {link.title && <div className="px-3 pt-2 text-xs font-semibold opacity-90">{link.title}</div>}
        <div className="w-full" style={{ aspectRatio: embed.aspect }}>
          <iframe
            src={embed.src}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={link.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={revealRef} className="reveal-on-scroll" style={animStyle}>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          onLinkClick?.(link.id, link.url);
          openWithDeepLink(link.url);
        }}
        className={`block w-full px-5 py-3 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${buttonStyle.className} ${glass ? glassClass : ""} ${animationClass(anim)}`}
        style={{
          background: glass ? undefined : (buttonStyle.id === "outline" ? "transparent" : theme.button),
          color: buttonStyle.id === "outline" ? theme.text : (glass ? theme.text : theme.buttonText),
          borderColor: buttonStyle.id === "outline" ? theme.button : undefined,
          ...buttonEffectStyle(effect, theme.accent),
          ...animStyle,
        }}
      >
        {link.title}
      </a>
    </div>
  );
}

function BentoBlock(props: BlockProps) {
  const { link, idx, profile, theme, buttonStyle, effect, anim, glass, glassClass, onLinkClick } = props;
  const revealRef = useReveal<HTMLDivElement>();
  const size = (link.bento_size ?? "1x1") as "1x1" | "2x1" | "2x2";
  const sizeClass = size === "2x2" ? "bento-2x2" : size === "2x1" ? "bento-2x1" : "bento-1x1";
  const animStyle: React.CSSProperties = anim !== "none" ? { animationDelay: `${idx * 60}ms` } : {};

  if (link.type === "header") {
    return (
      <div
        ref={revealRef}
        className={`reveal-on-scroll bento-2x1 flex items-end pt-2 pb-1 text-xs font-bold uppercase tracking-wider opacity-70 ${animationClass(anim)}`}
        style={animStyle}
      >
        {link.title}
      </div>
    );
  }
  const embed = detectEmbed(link.url);
  if (embed) {
    return (
      <div
        ref={revealRef}
        className={`reveal-on-scroll ${sizeClass} overflow-hidden ${buttonStyle.className} ${glass ? glassClass : ""} ${animationClass(anim)}`}
        style={{ background: glass ? undefined : "rgba(0,0,0,0.05)", ...animStyle }}
      >
        <iframe
          src={embed.src}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={link.title}
        />
      </div>
    );
  }

  return (
    <a
      ref={revealRef as unknown as React.Ref<HTMLAnchorElement>}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        onLinkClick?.(link.id, link.url);
        openWithDeepLink(link.url);
      }}
      className={`reveal-on-scroll ${sizeClass} flex items-center justify-center p-3 text-center text-sm font-semibold transition-transform duration-200 hover:scale-[1.03] hover:-translate-y-0.5 ${buttonStyle.className} ${glass ? glassClass : ""} ${animationClass(anim)}`}
      style={{
        background: glass ? undefined : (buttonStyle.id === "outline" ? "transparent" : theme.button),
        color: buttonStyle.id === "outline" ? theme.text : (glass ? theme.text : theme.buttonText),
        borderColor: buttonStyle.id === "outline" ? theme.button : undefined,
        ...buttonEffectStyle(effect, theme.accent),
        ...animStyle,
      }}
    >
      {link.title}
    </a>
  );
}

