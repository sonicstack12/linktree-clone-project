import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { MousePointerClick, Eye, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

interface LinkStat { id: string; title: string; clicks: number }
interface DayStat { day: string; views: number; clicks: number }

function AnalyticsPage() {
  const { user } = useAuth();
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [linkStats, setLinkStats] = useState<LinkStat[]>([]);
  const [byDay, setByDay] = useState<DayStat[]>([]);

  useEffect(() => {
    if (!user) return;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    Promise.all([
      supabase.from("page_views").select("created_at").eq("profile_id", user.id).gte("created_at", since),
      supabase.from("click_events").select("created_at, link_id").eq("profile_id", user.id).gte("created_at", since),
      supabase.from("links").select("id, title").eq("profile_id", user.id),
    ]).then(([views, clicks, links]) => {
      const v = views.data ?? [];
      const c = clicks.data ?? [];
      const ls = (links.data ?? []) as { id: string; title: string }[];

      setTotalViews(v.length);
      setTotalClicks(c.length);

      // Per-link clicks
      const counts = new Map<string, number>();
      for (const row of c) counts.set(row.link_id, (counts.get(row.link_id) ?? 0) + 1);
      setLinkStats(
        ls.map((l) => ({ id: l.id, title: l.title, clicks: counts.get(l.id) ?? 0 }))
          .sort((a, b) => b.clicks - a.clicks),
      );

      // By day, last 14 days
      const days: DayStat[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        days.push({ day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), views: 0, clicks: 0 });
        // count
        const dayViews = v.filter((row) => row.created_at.slice(0, 10) === key).length;
        const dayClicks = c.filter((row) => row.created_at.slice(0, 10) === key).length;
        days[days.length - 1].views = dayViews;
        days[days.length - 1].clicks = dayClicks;
      }
      setByDay(days);
    });
  }, [user]);

  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Eye} label="Page views (30d)" value={totalViews} grad="bg-gradient-leaf" />
        <StatCard icon={MousePointerClick} label="Link clicks (30d)" value={totalClicks} grad="bg-gradient-sunset" />
        <StatCard icon={TrendingUp} label="Click-through rate" value={`${ctr}%`} grad="bg-gradient-ocean" />
      </div>

      <Card className="p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Last 14 days</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 130)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.45 0.02 150)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.45 0.02 150)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.90 0.02 130)", background: "white" }}
                cursor={{ fill: "oklch(0.96 0.012 120)" }}
              />
              <Bar dataKey="views" fill="oklch(0.78 0.20 140)" radius={[6, 6, 0, 0]} name="Views" />
              <Bar dataKey="clicks" fill="oklch(0.62 0.18 145)" radius={[6, 6, 0, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Top links</h2>
        {linkStats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No links yet.</p>
        ) : (
          <div className="space-y-3">
            {linkStats.map((s, i) => {
              const max = Math.max(1, ...linkStats.map((l) => l.clicks));
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium"><span className="mr-2 text-muted-foreground">#{i + 1}</span>{s.title}</span>
                    <span className="font-mono font-semibold">{s.clicks}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-leaf transition-all" style={{ width: `${(s.clicks / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, grad }: { icon: typeof Eye; label: string; value: number | string; grad: string }) {
  return (
    <Card className="flex items-center gap-4 p-5 shadow-card">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${grad} shadow-pop`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
