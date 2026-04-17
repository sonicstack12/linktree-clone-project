import {
  Instagram, Twitter, Youtube, Twitch, Github, Linkedin, Facebook,
  Music2, Globe, Mail, Send, type LucideIcon,
} from "lucide-react";

export interface SocialPlatform {
  id: string;
  name: string;
  icon: LucideIcon;
  placeholder: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "instagram", name: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
  { id: "x", name: "X / Twitter", icon: Twitter, placeholder: "https://x.com/username" },
  { id: "tiktok", name: "TikTok", icon: Music2, placeholder: "https://tiktok.com/@username" },
  { id: "youtube", name: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
  { id: "twitch", name: "Twitch", icon: Twitch, placeholder: "https://twitch.tv/username" },
  { id: "github", name: "GitHub", icon: Github, placeholder: "https://github.com/username" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
  { id: "facebook", name: "Facebook", icon: Facebook, placeholder: "https://facebook.com/username" },
  { id: "spotify", name: "Spotify", icon: Music2, placeholder: "https://open.spotify.com/artist/..." },
  { id: "email", name: "Email", icon: Mail, placeholder: "mailto:hello@example.com" },
  { id: "telegram", name: "Telegram", icon: Send, placeholder: "https://t.me/username" },
  { id: "website", name: "Website", icon: Globe, placeholder: "https://yoursite.com" },
];

export const getSocial = (id: string) =>
  SOCIAL_PLATFORMS.find((p) => p.id === id) ?? SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
