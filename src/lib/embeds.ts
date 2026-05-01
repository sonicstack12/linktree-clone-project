/** Detect embeddable URLs and return iframe src. */
export interface EmbedInfo {
  provider: "youtube" | "spotify" | "vimeo" | "soundcloud" | null;
  src: string;
  aspect: string; // e.g. "16/9"
}

export function detectEmbed(rawUrl: string): EmbedInfo | null {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return null; }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v");
    if (id) return { provider: "youtube", src: `https://www.youtube.com/embed/${id}`, aspect: "16/9" };
  }
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    if (id) return { provider: "youtube", src: `https://www.youtube.com/embed/${id}`, aspect: "16/9" };
  }
  if (host === "open.spotify.com") {
    return { provider: "spotify", src: `https://open.spotify.com/embed${u.pathname}`, aspect: "1/1" };
  }
  if (host === "vimeo.com") {
    const id = u.pathname.slice(1).split("/")[0];
    if (/^\d+$/.test(id)) return { provider: "vimeo", src: `https://player.vimeo.com/video/${id}`, aspect: "16/9" };
  }
  if (host === "soundcloud.com") {
    return {
      provider: "soundcloud",
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(rawUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
      aspect: "5/1",
    };
  }
  return null;
}
