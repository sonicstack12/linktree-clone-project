/**
 * Convert a https:// link into a native-app deep link when possible.
 * Falls back to the original URL.
 *
 * Strategy: detect platform via URL host, build app-scheme URL, and let the
 * browser try it. We return both so callers can `window.location = appUrl`
 * with a setTimeout fallback to webUrl.
 */

export interface DeepLink {
  webUrl: string;
  appUrl: string | null;
  platform: string | null;
}

export function buildDeepLink(rawUrl: string): DeepLink {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return { webUrl: rawUrl, appUrl: null, platform: null }; }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname.replace(/^\//, "");

  // YouTube
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    const id = host === "youtu.be" ? path.split("/")[0] : u.searchParams.get("v");
    if (id) return { webUrl: rawUrl, appUrl: `vnd.youtube://${id}`, platform: "youtube" };
    return { webUrl: rawUrl, appUrl: `vnd.youtube://`, platform: "youtube" };
  }

  // Spotify (https://open.spotify.com/track/ID -> spotify:track:ID)
  if (host === "open.spotify.com") {
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 2) return { webUrl: rawUrl, appUrl: `spotify:${parts[0]}:${parts[1]}`, platform: "spotify" };
  }

  // Instagram
  if (host === "instagram.com") {
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "p" && parts[1]) return { webUrl: rawUrl, appUrl: `instagram://media?id=${parts[1]}`, platform: "instagram" };
    if (parts[0] === "reel" && parts[1]) return { webUrl: rawUrl, appUrl: `instagram://reels?id=${parts[1]}`, platform: "instagram" };
    if (parts[0]) return { webUrl: rawUrl, appUrl: `instagram://user?username=${parts[0]}`, platform: "instagram" };
  }

  // TikTok
  if (host === "tiktok.com" || host === "vm.tiktok.com") {
    const parts = path.split("/").filter(Boolean);
    if (parts[0]?.startsWith("@") && parts[2]) {
      return { webUrl: rawUrl, appUrl: `snssdk1233://aweme/detail/${parts[2]}`, platform: "tiktok" };
    }
    if (parts[0]?.startsWith("@")) return { webUrl: rawUrl, appUrl: `snssdk1233://user/profile/${parts[0].slice(1)}`, platform: "tiktok" };
  }

  // Twitter / X
  if (host === "twitter.com" || host === "x.com") {
    const parts = path.split("/").filter(Boolean);
    if (parts[0] && parts[1] === "status" && parts[2]) {
      return { webUrl: rawUrl, appUrl: `twitter://status?id=${parts[2]}`, platform: "x" };
    }
    if (parts[0]) return { webUrl: rawUrl, appUrl: `twitter://user?screen_name=${parts[0]}`, platform: "x" };
  }

  // Apple Music
  if (host === "music.apple.com") {
    return { webUrl: rawUrl, appUrl: rawUrl.replace(/^https?:/, "music:"), platform: "applemusic" };
  }

  return { webUrl: rawUrl, appUrl: null, platform: null };
}

/** Click handler that opens native app first, falls back to web after 600ms. */
export function openWithDeepLink(rawUrl: string) {
  const dl = buildDeepLink(rawUrl);
  if (!dl.appUrl) {
    window.open(dl.webUrl, "_blank", "noopener,noreferrer");
    return;
  }
  // Only attempt deep link on touch devices; desktop should just open the web URL.
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    window.open(dl.webUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const start = Date.now();
  const fallback = setTimeout(() => {
    if (Date.now() - start < 1500 && document.visibilityState === "visible") {
      window.open(dl.webUrl, "_blank", "noopener,noreferrer");
    }
  }, 700);
  // Try the app URL
  window.location.href = dl.appUrl;
  // Cleanup if user leaves the page (app opened)
  window.addEventListener("pagehide", () => clearTimeout(fallback), { once: true });
}

/** Detect referrer source for transparent analytics. */
export function detectSource(referrer: string, ua: string): string {
  const r = (referrer || "").toLowerCase();
  if (!r) return "Direct";
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("tiktok")) return "TikTok";
  if (r.includes("youtube") || r.includes("youtu.be")) return "YouTube";
  if (r.includes("twitter") || r.includes("x.com") || r.includes("t.co")) return "X / Twitter";
  if (r.includes("facebook") || r.includes("fb.com") || r.includes("fb.me")) return "Facebook";
  if (r.includes("linkedin")) return "LinkedIn";
  if (r.includes("reddit")) return "Reddit";
  if (r.includes("snapchat")) return "Snapchat";
  if (r.includes("pinterest")) return "Pinterest";
  if (r.includes("discord")) return "Discord";
  if (r.includes("whatsapp")) return "WhatsApp";
  if (r.includes("telegram") || r.includes("t.me")) return "Telegram";
  if (r.includes("google.")) return "Google";
  if (r.includes("bing.")) return "Bing";
  if (/inapp|fbav|instagram|tiktok/i.test(ua)) return "In-App Browser";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || "Other";
  } catch {
    return "Other";
  }
}
