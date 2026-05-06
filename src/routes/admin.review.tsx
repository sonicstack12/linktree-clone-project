import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck, ShieldCheck, ExternalLink, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/review")({
  component: ReviewPage,
});

interface Row {
  id: string;
  profile_id: string;
  platform: string;
  proof_url: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profile?: { username: string; display_name: string | null; avatar_url: string | null } | null;
}

function ReviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const load = async () => {
    let q = supabase.from("verification_requests").select("*").order("created_at", { ascending: false });
    if (filter === "pending") q = q.eq("status", "pending");
    const { data } = await q;
    const rs = (data ?? []) as Row[];
    const ids = Array.from(new Set(rs.map((r) => r.profile_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      rs.forEach((r) => { r.profile = map.get(r.profile_id) as Row["profile"] ?? null; });
    }
    setRows(rs);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, filter]);

  if (isAdmin === null) return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center shadow-card">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-bold">Admin only</h1>
        <p className="mt-1 text-sm text-muted-foreground">You don't have access to the verification review queue.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/admin" })}>Back</Button>
      </Card>
    );
  }

  const decide = async (row: Row, status: "approved" | "rejected") => {
    const note = notes[row.id]?.trim() || null;
    const { error } = await supabase.from("verification_requests")
      .update({ status, review_note: note, reviewed_by: user!.id })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Approved & verified" : "Rejected");
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Verification review</h1>
        <div className="flex gap-1 rounded-full border-2 border-border p-1">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === f ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              {f === "pending" ? "Pending" : "All"}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground shadow-card">No requests in this view.</Card>
      )}

      {rows.map((r) => (
        <Card key={r.id} className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            {r.profile?.avatar_url ? (
              <img src={r.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-bold">
                {(r.profile?.username ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold">@{r.profile?.username ?? r.profile_id.slice(0, 8)}</div>
              <div className="text-xs text-muted-foreground">{r.platform} · {new Date(r.created_at).toLocaleString()}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              r.status === "pending" ? "bg-amber-500/15 text-amber-600"
              : r.status === "approved" ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive"
            }`}>{r.status}</span>
          </div>

          <a href={r.proof_url} target="_blank" rel="noopener noreferrer"
             className="mt-3 inline-flex items-center gap-1 text-sm text-primary underline">
            <ExternalLink className="h-3.5 w-3.5" /> {r.proof_url}
          </a>
          {r.notes && <p className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">{r.notes}</p>}

          {r.status === "pending" && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Optional review note (shown to user)"
                rows={2}
                value={notes[r.id] ?? ""}
                onChange={(e) => setNotes((m) => ({ ...m, [r.id]: e.target.value }))}
                maxLength={500}
              />
              <div className="flex gap-2">
                <Button variant="hero" size="sm" onClick={() => decide(r, "approved")}>
                  <BadgeCheck className="h-4 w-4" /> Approve & verify
                </Button>
                <Button variant="outline" size="sm" onClick={() => decide(r, "rejected")}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
