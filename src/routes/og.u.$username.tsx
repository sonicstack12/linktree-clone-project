import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dynamic SVG OG image for profiles without an avatar.
 * URL: /og/u/:username.svg  → 1200x630 social preview.
 *
 * Returns SVG (works in Cloudflare Workers — no canvas/sharp dependency).
 * Twitter and most modern crawlers render SVG OG images.
 */
export const Route = createFileRoute("/og/u/$username")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const username = params.username.replace(".svg", "");

        // Pull profile to derive colors + display name. Fail gracefully.
        let displayName = `@${username}`;
        let bio = "Find me on Linkly";
        let bg1 = "#16a34a";
        let bg2 = "#84cc16";
        let textColor = "#ffffff";

        try {
          const { data } = await supabase
            .from("profiles")
            .select("display_name, bio, theme")
            .ilike("username", username)
            .maybeSingle();
          if (data) {
            displayName = data.display_name ? `${data.display_name} (@${username})` : `@${username}`;
            bio = data.bio ?? bio;
            // Map theme → palette
            const palette: Record<string, [string, string, string]> = {
              leaf:    ["#86efac", "#16a34a", "#0a3d1f"],
              sunset:  ["#fda085", "#f6d365", "#3a1f0a"],
              ocean:   ["#0ea5e9", "#6366f1", "#ffffff"],
              rose:    ["#fda4af", "#e11d48", "#ffffff"],
              night:   ["#1e1b4b", "#0a0a23", "#ffffff"],
              cream:   ["#fef3c7", "#fde68a", "#1f2937"],
              lemon:   ["#fde047", "#facc15", "#1f2937"],
              midnight:["#2d0a4e", "#0a0a23", "#ffffff"],
              candy:   ["#ffafbd", "#c2e9fb", "#2b1c4a"],
              forest:  ["#1f5f3f", "#0b3d2e", "#f4f1de"],
              peach:   ["#ffe5d9", "#ffd6ba", "#5a2a1f"],
              noir:    ["#0a0a0a", "#0a0a0a", "#ffffff"],
              aurora:  ["#00c9ff", "#ff61d2", "#0c1023"],
              sand:    ["#f6d365", "#fda085", "#3a1f0a"],
            };
            const p = palette[data.theme ?? "leaf"] ?? palette.leaf;
            bg1 = p[0]; bg2 = p[1]; textColor = p[2];
          }
        } catch {
          // ignore — use defaults
        }

        const initial = (displayName.replace("@", "")[0] ?? "L").toUpperCase();

        const escapeXml = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

        const safeName = escapeXml(displayName).slice(0, 50);
        const safeBio = escapeXml(bio).slice(0, 90);

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0%" stop-color="${textColor}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${textColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="600" cy="240" r="110" fill="${textColor}" fill-opacity="0.18"/>
  <circle cx="600" cy="240" r="100" fill="${textColor}" fill-opacity="0.95"/>
  <text x="600" y="278" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
        font-size="110" font-weight="800" fill="${bg2}">${escapeXml(initial)}</text>
  <text x="600" y="430" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
        font-size="64" font-weight="800" fill="${textColor}">${safeName}</text>
  <text x="600" y="490" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
        font-size="28" font-weight="500" fill="${textColor}" fill-opacity="0.85">${safeBio}</text>
  <text x="600" y="580" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
        font-size="22" font-weight="700" fill="${textColor}" fill-opacity="0.7" letter-spacing="3">LINKLY</text>
</svg>`;

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
