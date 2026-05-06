import { useEffect, useState } from "react";
import { Github, MessageCircle, Users, Star, GitFork } from "lucide-react";

interface Props {
  type: "github_stats" | "discord_stats";
  /** For github_stats: the username. For discord_stats: the invite code (e.g. "abc123"). */
  url: string;
  title: string;
  theme: { button: string; buttonText: string; text: string; accent: string };
  glass: boolean;
  glassClass: string;
  buttonClass: string;
}

export function StatBlock({ type, url, title, theme, glass, glassClass, buttonClass }: Props) {
  const [data, setData] = useState<Record<string, number | string> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (type === "github_stats") {
          const handle = extractGithubHandle(url);
          if (!handle) throw new Error("bad");
          const r = await fetch(`https://api.github.com/users/${handle}`);
          if (!r.ok) throw new Error("bad");
          const j = await r.json();
          if (!cancelled) setData({ followers: j.followers, repos: j.public_repos, handle });
        } else {
          const code = extractDiscordCode(url);
          if (!code) throw new Error("bad");
          const r = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
          if (!r.ok) throw new Error("bad");
          const j = await r.json();
          if (!cancelled) setData({
            name: j.guild?.name ?? "Discord",
            online: j.approximate_presence_count ?? 0,
            members: j.approximate_member_count ?? 0,
          });
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [type, url]);

  const Icon = type === "github_stats" ? Github : MessageCircle;
  const href = type === "github_stats"
    ? (data?.handle ? `https://github.com/${data.handle}` : url)
    : url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center gap-3 px-4 py-3 transition-transform duration-200 hover:scale-[1.02] ${buttonClass} ${glass ? glassClass : ""}`}
      style={{
        background: glass ? undefined : theme.button,
        color: glass ? theme.text : theme.buttonText,
      }}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold">{title}</div>
        {error ? (
          <div className="text-[10px] opacity-70">Live stats unavailable</div>
        ) : data ? (
          <div className="flex gap-3 text-[10px] font-medium opacity-90">
            {type === "github_stats" ? (
              <>
                <span className="inline-flex items-center gap-0.5"><Users className="h-3 w-3" /> {data.followers}</span>
                <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3" /> {data.repos} repos</span>
                <span className="inline-flex items-center gap-0.5"><GitFork className="h-3 w-3" /> @{data.handle}</span>
              </>
            ) : (
              <>
                <span>● {Number(data.online).toLocaleString()} online</span>
                <span>· {Number(data.members).toLocaleString()} members</span>
              </>
            )}
          </div>
        ) : (
          <div className="text-[10px] opacity-60">Loading live stats…</div>
        )}
      </div>
    </a>
  );
}

function extractGithubHandle(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim().replace(/^@/, "");
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://github.com/${trimmed}`);
    if (u.hostname.includes("github.com")) {
      const h = u.pathname.split("/").filter(Boolean)[0];
      return h || null;
    }
  } catch {}
  return /^[a-z0-9-]+$/i.test(trimmed) ? trimmed : null;
}
function extractDiscordCode(input: string): string | null {
  if (!input) return null;
  const m = input.match(/(?:discord\.gg\/|discord\.com\/invite\/)?([a-zA-Z0-9-]+)\/?$/);
  return m?.[1] ?? null;
}
