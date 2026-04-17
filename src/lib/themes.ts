export type ThemeId = "leaf" | "sunset" | "ocean" | "rose" | "night" | "cream" | "lemon";
export type ButtonStyleId = "rounded" | "pill" | "square" | "outline" | "shadow";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  background: string; // CSS background value
  text: string;       // text color
  button: string;     // button background
  buttonText: string; // button text
  accent: string;
}

export const THEMES: Record<ThemeId, ThemePreset> = {
  leaf: {
    id: "leaf",
    name: "Leaf",
    background: "linear-gradient(160deg, oklch(0.95 0.05 140) 0%, oklch(0.90 0.10 140) 100%)",
    text: "oklch(0.18 0.03 150)",
    button: "oklch(0.22 0.05 150)",
    buttonText: "oklch(0.95 0.02 145)",
    accent: "oklch(0.62 0.18 145)",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    background: "linear-gradient(160deg, oklch(0.92 0.10 70) 0%, oklch(0.78 0.16 35) 100%)",
    text: "oklch(0.20 0.05 30)",
    button: "oklch(0.20 0.05 30)",
    buttonText: "oklch(0.97 0.02 80)",
    accent: "oklch(0.72 0.18 35)",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    background: "linear-gradient(160deg, oklch(0.85 0.08 220) 0%, oklch(0.55 0.18 250) 100%)",
    text: "oklch(0.99 0.005 0)",
    button: "oklch(0.99 0.005 0)",
    buttonText: "oklch(0.30 0.10 250)",
    accent: "oklch(0.78 0.12 230)",
  },
  rose: {
    id: "rose",
    name: "Rose",
    background: "linear-gradient(160deg, oklch(0.92 0.06 15) 0%, oklch(0.78 0.14 350) 100%)",
    text: "oklch(0.20 0.05 350)",
    button: "oklch(0.20 0.05 350)",
    buttonText: "oklch(0.97 0.02 0)",
    accent: "oklch(0.65 0.20 350)",
  },
  night: {
    id: "night",
    name: "Night",
    background: "linear-gradient(160deg, oklch(0.20 0.03 260) 0%, oklch(0.08 0.02 260) 100%)",
    text: "oklch(0.97 0.005 0)",
    button: "oklch(0.97 0.005 0)",
    buttonText: "oklch(0.18 0.03 260)",
    accent: "oklch(0.78 0.20 140)",
  },
  cream: {
    id: "cream",
    name: "Cream",
    background: "oklch(0.98 0.02 90)",
    text: "oklch(0.18 0.03 150)",
    button: "oklch(0.22 0.05 150)",
    buttonText: "oklch(0.97 0.02 90)",
    accent: "oklch(0.62 0.18 145)",
  },
  lemon: {
    id: "lemon",
    name: "Lemon",
    background: "linear-gradient(160deg, oklch(0.96 0.12 105) 0%, oklch(0.88 0.18 95) 100%)",
    text: "oklch(0.18 0.05 100)",
    button: "oklch(0.18 0.05 100)",
    buttonText: "oklch(0.96 0.12 105)",
    accent: "oklch(0.62 0.18 145)",
  },
};

export const BUTTON_STYLES: { id: ButtonStyleId; name: string; className: string }[] = [
  { id: "rounded", name: "Rounded", className: "rounded-xl" },
  { id: "pill", name: "Pill", className: "rounded-full" },
  { id: "square", name: "Square", className: "rounded-none" },
  { id: "outline", name: "Outline", className: "rounded-xl border-2 bg-transparent" },
  { id: "shadow", name: "Shadow", className: "rounded-xl shadow-lg" },
];

export interface Template {
  id: string;
  name: string;
  description: string;
  theme: ThemeId;
  buttonStyle: ButtonStyleId;
}

export const TEMPLATES: Template[] = [
  { id: "creator", name: "Creator", description: "Perfect for content creators & influencers", theme: "leaf", buttonStyle: "pill" },
  { id: "minimal", name: "Minimal", description: "Clean & simple aesthetic", theme: "cream", buttonStyle: "rounded" },
  { id: "bold", name: "Bold Sunset", description: "Vibrant & energetic", theme: "sunset", buttonStyle: "shadow" },
  { id: "ocean", name: "Wave", description: "Cool & calming gradients", theme: "ocean", buttonStyle: "pill" },
  { id: "darkmode", name: "After Dark", description: "Sleek dark aesthetic", theme: "night", buttonStyle: "outline" },
  { id: "berry", name: "Berry", description: "Playful & feminine vibes", theme: "rose", buttonStyle: "rounded" },
];
