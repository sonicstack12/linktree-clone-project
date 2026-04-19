export type ThemeId =
  | "leaf" | "sunset" | "ocean" | "rose" | "night" | "cream" | "lemon"
  | "midnight" | "candy" | "forest" | "peach" | "noir" | "aurora" | "sand";

export type ButtonStyleId = "rounded" | "pill" | "square" | "outline" | "shadow";
export type FontFamilyId = "inter" | "serif" | "mono" | "display" | "rounded" | "handwritten";
export type ButtonEffectId = "shadow" | "glow" | "lift" | "none" | "neumorph";
export type BackgroundPatternId = "none" | "dots" | "grid" | "waves" | "noise" | "stars" | "blobs";
export type AnimationStyleId = "fade" | "slide" | "pop" | "none";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  background: string;
  text: string;
  button: string;
  buttonText: string;
  accent: string;
  /** Optional background image url (over `background` color/gradient) */
  backgroundImage?: string;
  /** Optional CSS overlay color (e.g., 'rgba(0,0,0,0.35)') */
  overlay?: string;
}

export const THEMES: Record<ThemeId, ThemePreset> = {
  leaf: {
    id: "leaf", name: "Leaf",
    background: "linear-gradient(160deg, oklch(0.95 0.05 140) 0%, oklch(0.90 0.10 140) 100%)",
    text: "oklch(0.18 0.03 150)", button: "oklch(0.22 0.05 150)", buttonText: "oklch(0.95 0.02 145)",
    accent: "oklch(0.62 0.18 145)",
  },
  sunset: {
    id: "sunset", name: "Sunset",
    background: "linear-gradient(160deg, oklch(0.92 0.10 70) 0%, oklch(0.78 0.16 35) 100%)",
    text: "oklch(0.20 0.05 30)", button: "oklch(0.20 0.05 30)", buttonText: "oklch(0.97 0.02 80)",
    accent: "oklch(0.72 0.18 35)",
  },
  ocean: {
    id: "ocean", name: "Ocean",
    background: "linear-gradient(160deg, oklch(0.85 0.08 220) 0%, oklch(0.55 0.18 250) 100%)",
    text: "oklch(0.99 0.005 0)", button: "oklch(0.99 0.005 0)", buttonText: "oklch(0.30 0.10 250)",
    accent: "oklch(0.78 0.12 230)",
  },
  rose: {
    id: "rose", name: "Rose",
    background: "linear-gradient(160deg, oklch(0.92 0.06 15) 0%, oklch(0.78 0.14 350) 100%)",
    text: "oklch(0.20 0.05 350)", button: "oklch(0.20 0.05 350)", buttonText: "oklch(0.97 0.02 0)",
    accent: "oklch(0.65 0.20 350)",
  },
  night: {
    id: "night", name: "Night",
    background: "linear-gradient(160deg, oklch(0.20 0.03 260) 0%, oklch(0.08 0.02 260) 100%)",
    text: "oklch(0.97 0.005 0)", button: "oklch(0.97 0.005 0)", buttonText: "oklch(0.18 0.03 260)",
    accent: "oklch(0.78 0.20 140)",
  },
  cream: {
    id: "cream", name: "Cream",
    background: "oklch(0.98 0.02 90)",
    text: "oklch(0.18 0.03 150)", button: "oklch(0.22 0.05 150)", buttonText: "oklch(0.97 0.02 90)",
    accent: "oklch(0.62 0.18 145)",
  },
  lemon: {
    id: "lemon", name: "Lemon",
    background: "linear-gradient(160deg, oklch(0.96 0.12 105) 0%, oklch(0.88 0.18 95) 100%)",
    text: "oklch(0.18 0.05 100)", button: "oklch(0.18 0.05 100)", buttonText: "oklch(0.96 0.12 105)",
    accent: "oklch(0.62 0.18 145)",
  },
  midnight: {
    id: "midnight", name: "Midnight Neon",
    background: "linear-gradient(160deg, #0a0a23 0%, #1a0040 50%, #2d0a4e 100%)",
    text: "#f0f0ff", button: "#ff2bd6", buttonText: "#ffffff",
    accent: "#00ffd5",
  },
  candy: {
    id: "candy", name: "Cotton Candy",
    background: "linear-gradient(135deg, #ffafbd 0%, #ffc3a0 50%, #c2e9fb 100%)",
    text: "#2b1c4a", button: "#ffffff", buttonText: "#7b2cbf",
    accent: "#ff6ec4",
  },
  forest: {
    id: "forest", name: "Deep Forest",
    background: "linear-gradient(160deg, #0b3d2e 0%, #1f5f3f 100%)",
    text: "#f4f1de", button: "#e8c39e", buttonText: "#0b3d2e",
    accent: "#a8d5ba",
  },
  peach: {
    id: "peach", name: "Soft Peach",
    background: "linear-gradient(160deg, #ffe5d9 0%, #ffd6ba 100%)",
    text: "#5a2a1f", button: "#5a2a1f", buttonText: "#ffe5d9",
    accent: "#ff7b54",
  },
  noir: {
    id: "noir", name: "Noir",
    background: "#0a0a0a",
    text: "#ffffff", button: "#ffffff", buttonText: "#0a0a0a",
    accent: "#888888",
  },
  aurora: {
    id: "aurora", name: "Aurora",
    background: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 50%, #ff61d2 100%)",
    text: "#0c1023", button: "#0c1023", buttonText: "#ffffff",
    accent: "#ff61d2",
  },
  sand: {
    id: "sand", name: "Sand Dune",
    background: "linear-gradient(160deg, #f6d365 0%, #fda085 100%)",
    text: "#3a1f0a", button: "#3a1f0a", buttonText: "#f6d365",
    accent: "#fda085",
  },
};

export const BUTTON_STYLES: { id: ButtonStyleId; name: string; className: string }[] = [
  { id: "rounded", name: "Rounded", className: "rounded-xl" },
  { id: "pill", name: "Pill", className: "rounded-full" },
  { id: "square", name: "Square", className: "rounded-none" },
  { id: "outline", name: "Outline", className: "rounded-xl border-2 bg-transparent" },
  { id: "shadow", name: "Shadow", className: "rounded-xl shadow-lg" },
];

export const FONT_FAMILIES: { id: FontFamilyId; name: string; cssFamily: string }[] = [
  { id: "inter", name: "Inter (default)", cssFamily: "'Inter', system-ui, sans-serif" },
  { id: "serif", name: "Serif Editorial", cssFamily: "'Playfair Display', Georgia, serif" },
  { id: "mono", name: "Mono Tech", cssFamily: "'JetBrains Mono', 'Courier New', monospace" },
  { id: "display", name: "Bold Display", cssFamily: "'Bebas Neue', Impact, sans-serif" },
  { id: "rounded", name: "Soft Rounded", cssFamily: "'Quicksand', system-ui, sans-serif" },
  { id: "handwritten", name: "Handwritten", cssFamily: "'Caveat', 'Comic Sans MS', cursive" },
];

export const BUTTON_EFFECTS: { id: ButtonEffectId; name: string }[] = [
  { id: "shadow", name: "Soft Shadow" },
  { id: "glow", name: "Neon Glow" },
  { id: "lift", name: "Lift on Hover" },
  { id: "neumorph", name: "Neumorphic" },
  { id: "none", name: "None" },
];

export const BACKGROUND_PATTERNS: { id: BackgroundPatternId; name: string }[] = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "grid", name: "Grid" },
  { id: "waves", name: "Waves" },
  { id: "noise", name: "Noise" },
  { id: "stars", name: "Stars" },
  { id: "blobs", name: "Blobs" },
];

export const ANIMATION_STYLES: { id: AnimationStyleId; name: string }[] = [
  { id: "fade", name: "Fade in" },
  { id: "slide", name: "Slide up" },
  { id: "pop", name: "Pop in" },
  { id: "none", name: "None" },
];

/** CSS for a background pattern, layered on top of base background */
export function patternCss(p: BackgroundPatternId, color: string): string {
  switch (p) {
    case "dots":
      return `radial-gradient(${color}33 1.5px, transparent 1.5px)`;
    case "grid":
      return `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`;
    case "waves":
      return `repeating-radial-gradient(circle at 50% -20%, ${color}11 0, ${color}11 20px, transparent 20px, transparent 40px)`;
    case "noise":
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`;
    case "stars":
      return `radial-gradient(${color}66 1px, transparent 1px), radial-gradient(${color}33 1px, transparent 1px)`;
    case "blobs":
      return `radial-gradient(circle at 20% 20%, ${color}22 0, transparent 30%), radial-gradient(circle at 80% 70%, ${color}22 0, transparent 30%)`;
    default:
      return "none";
  }
}

export function patternSize(p: BackgroundPatternId): string {
  switch (p) {
    case "dots": return "20px 20px";
    case "grid": return "32px 32px";
    case "stars": return "48px 48px, 80px 80px";
    case "blobs": return "100% 100%";
    default: return "auto";
  }
}

export interface Template {
  id: string;
  name: string;
  description: string;
  theme: ThemeId;
  buttonStyle: ButtonStyleId;
  fontFamily?: FontFamilyId;
  buttonEffect?: ButtonEffectId;
  backgroundPattern?: BackgroundPatternId;
  animationStyle?: AnimationStyleId;
  /** Sample handle shown on the template card */
  sampleHandle?: string;
  /** Sample link labels for richer card preview */
  sampleLinks?: string[];
}

export const TEMPLATES: Template[] = [
  { id: "creator", name: "Creator", description: "For YouTubers & influencers", theme: "leaf", buttonStyle: "pill", fontFamily: "inter", buttonEffect: "shadow", backgroundPattern: "dots", animationStyle: "fade", sampleHandle: "alex", sampleLinks: ["Latest video", "Merch shop", "Patreon"] },
  { id: "minimal", name: "Minimal", description: "Clean & quiet", theme: "cream", buttonStyle: "rounded", fontFamily: "serif", buttonEffect: "none", backgroundPattern: "none", animationStyle: "fade", sampleHandle: "studio", sampleLinks: ["Portfolio", "Read essays", "Get in touch"] },
  { id: "bold", name: "Sunset Bold", description: "Vibrant & energetic", theme: "sunset", buttonStyle: "shadow", fontFamily: "display", buttonEffect: "lift", backgroundPattern: "blobs", animationStyle: "pop", sampleHandle: "maya", sampleLinks: ["New album", "Tour dates", "Spotify"] },
  { id: "ocean", name: "Wave", description: "Cool & calming", theme: "ocean", buttonStyle: "pill", fontFamily: "rounded", buttonEffect: "shadow", backgroundPattern: "waves", animationStyle: "slide", sampleHandle: "river", sampleLinks: ["Surf shop", "Photo gallery", "Newsletter"] },
  { id: "darkmode", name: "After Dark", description: "Sleek dark aesthetic", theme: "night", buttonStyle: "outline", fontFamily: "mono", buttonEffect: "glow", backgroundPattern: "stars", animationStyle: "fade", sampleHandle: "nova", sampleLinks: ["Twitch stream", "Discord", "Setup"] },
  { id: "berry", name: "Berry", description: "Playful feminine vibes", theme: "rose", buttonStyle: "rounded", fontFamily: "handwritten", buttonEffect: "shadow", backgroundPattern: "dots", animationStyle: "pop", sampleHandle: "lily", sampleLinks: ["Book a session", "Instagram", "Shop"] },
  { id: "neon", name: "Neon Tokyo", description: "Cyberpunk magenta + cyan", theme: "midnight", buttonStyle: "pill", fontFamily: "mono", buttonEffect: "glow", backgroundPattern: "grid", animationStyle: "slide", sampleHandle: "kai", sampleLinks: ["Latest mix", "SoundCloud", "Bandcamp"] },
  { id: "candy", name: "Cotton Candy", description: "Pastel dream", theme: "candy", buttonStyle: "pill", fontFamily: "rounded", buttonEffect: "lift", backgroundPattern: "blobs", animationStyle: "pop", sampleHandle: "mochi", sampleLinks: ["TikTok", "Cute shop", "DMs open"] },
  { id: "forest", name: "Deep Forest", description: "Earthy editorial", theme: "forest", buttonStyle: "rounded", fontFamily: "serif", buttonEffect: "shadow", backgroundPattern: "noise", animationStyle: "fade", sampleHandle: "sage", sampleLinks: ["Hike journal", "Pre-order book", "Substack"] },
  { id: "peach", name: "Peach Soft", description: "Warm & inviting", theme: "peach", buttonStyle: "pill", fontFamily: "rounded", buttonEffect: "shadow", backgroundPattern: "dots", animationStyle: "fade", sampleHandle: "rose", sampleLinks: ["Bakery menu", "Order online", "Visit us"] },
  { id: "noir", name: "Noir Editorial", description: "High-fashion black", theme: "noir", buttonStyle: "outline", fontFamily: "serif", buttonEffect: "none", backgroundPattern: "none", animationStyle: "fade", sampleHandle: "vogue", sampleLinks: ["Lookbook", "Stockists", "Press"] },
  { id: "aurora", name: "Aurora", description: "Vivid Y2K gradient", theme: "aurora", buttonStyle: "pill", fontFamily: "display", buttonEffect: "glow", backgroundPattern: "blobs", animationStyle: "pop", sampleHandle: "iris", sampleLinks: ["New drop", "Discord", "Twitch"] },
];

export interface ResolvedTheme {
  background: string;
  text: string;
  button: string;
  buttonText: string;
  accent: string;
}

export interface ProfileThemeFields {
  theme: string;
  use_custom_colors?: boolean | null;
  background_color?: string | null;
  text_color?: string | null;
  button_color?: string | null;
  button_text_color?: string | null;
}

export function resolveTheme(p: ProfileThemeFields): ResolvedTheme {
  const preset = THEMES[(p.theme as ThemeId)] ?? THEMES.leaf;
  if (!p.use_custom_colors) return preset;
  return {
    background: p.background_color || preset.background,
    text: p.text_color || preset.text,
    button: p.button_color || preset.button,
    buttonText: p.button_text_color || preset.buttonText,
    accent: preset.accent,
  };
}

/** Tailwind-like class for the chosen entrance animation */
export function animationClass(a: AnimationStyleId | undefined): string {
  switch (a) {
    case "slide": return "animate-[slide-in-up_0.5s_ease-out_both]";
    case "pop": return "animate-[pop-in_0.45s_cubic-bezier(0.34,1.56,0.64,1)_both]";
    case "fade": return "animate-[fade-in_0.5s_ease-out_both]";
    default: return "";
  }
}

/** Inline style snippet for the chosen button effect */
export function buttonEffectStyle(eff: ButtonEffectId | undefined, accent: string): React.CSSProperties {
  switch (eff) {
    case "glow":
      return { boxShadow: `0 0 0 1px ${accent}55, 0 0 24px ${accent}88` };
    case "lift":
      return { boxShadow: "0 6px 0 0 rgba(0,0,0,0.18)" };
    case "neumorph":
      return { boxShadow: "8px 8px 16px rgba(0,0,0,0.15), -4px -4px 12px rgba(255,255,255,0.5)" };
    case "shadow":
      return { boxShadow: "0 6px 18px rgba(0,0,0,0.18)" };
    default:
      return {};
  }
}
