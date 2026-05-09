import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck, Clock, XCircle, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/verification")({
  component: VerificationPage,
});

interface RequestRow {
  id: string;
  platform: string;
  proof_url: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const PLATFORMS = ["GitHub", "LinkedIn", "X / Twitter", "Instagram", "YouTube", "Other"] as const;

const PLATFORM_HOSTS: Record<typeof PLATFORMS[number], RegExp | null> = {
  "GitHub": /(^|\.)github\.com$/i,
  "LinkedIn": /(^|\.)linkedin\.com$/i,
  "X / Twitter": /(^|\.)(x|twitter)\.com$/i,
  "Instagram": /(^|\.)instagram\.com$/i,
  "YouTube": /(^|\.)(youtube\.com|youtu\.be)$/i,
  "Other": null,
};

const schema = z.object({
  platform: z.enum(PLATFORMS),
  proof_url: z.string().trim().url("Must be a valid URL").max(500),
  notes: z.string().trim().max(500).optional(),
});

function VerificationPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>("GitHub");
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const load = async () => {
    if (!user) return;
    const [r, p] = await Promise.all([
      supabase.from("verification_requests").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("verified").eq("id", user.id).single(),
    ]);
    setRequests((r.data ?? []) as RequestRow[]);
    setVerified(!!p.data?.verified);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const hasPending = requests.some((r) => r.status === "pending");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ platform, proof_url: proofUrl, notes: notes || undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("verification_requests").insert({
      profile_id: user.id,
      platform: parsed.data.platform,
      proof_url: parsed.data.proof_url,
      notes: parsed.data.notes ?? null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Request submitted! We'll review within 48h.");
    setProofUrl(""); setNotes("");
    load();
  };

  const cancel = async (id: string) => {
    const { error } = await supabase.from("verification_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  if (loading) return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className={`grid h-12 w-12 place-items-center rounded-full ${verified ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
            <BadgeCheck className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {verified ? "You're verified ✓" : "Get the verified badge"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Free verification — no $5/month fee. Just prove you're you by linking back from a public profile.
            </p>
          </div>
        </div>
      </Card>

      {!verified && (
        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-bold">How it works</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">1.</span> Add your linkly URL (or @{user?.user_metadata?.username ?? "handle"}) to the bio of your GitHub, LinkedIn, X, Instagram, or YouTube profile.</li>
            <li><span className="font-semibold text-foreground">2.</span> Submit the public URL of that profile below.</li>
            <li><span className="font-semibold text-foreground">3.</span> Our team reviews within 48 hours. You'll get a green ✓ on your page.</li>
          </ol>
        </Card>
      )}

      {!verified && !hasPending && (
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5 text-primary" /> Submit social proof</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Platform</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-pop ${platform === p ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="proof">Public profile URL</Label>
              <Input
                id="proof"
                className="mt-1.5"
                placeholder="https://github.com/yourname"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                maxLength={500}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">Make sure your linkly URL is visible in that profile's bio before submitting.</p>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                className="mt-1.5"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                placeholder="Anything you want the reviewer to know"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for review"}
            </Button>
          </form>
        </Card>
      )}

      {requests.length > 0 && (
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Your requests</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border-2 border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-sm font-semibold">{r.platform}</span>
                    </div>
                    <a href={r.proof_url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-primary underline">
                      {r.proof_url}
                    </a>
                    {r.review_note && (
                      <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">
                        <span className="font-semibold">Reviewer note:</span> {r.review_note}
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Submitted {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <Button variant="ghost" size="icon" onClick={() => cancel(r.id)} title="Cancel request">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RequestRow["status"] }) {
  const map = {
    pending: { icon: Clock, label: "Pending", cls: "bg-amber-500/15 text-amber-600" },
    approved: { icon: BadgeCheck, label: "Approved", cls: "bg-primary/15 text-primary" },
    rejected: { icon: XCircle, label: "Rejected", cls: "bg-destructive/15 text-destructive" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}
