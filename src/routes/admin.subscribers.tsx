import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscribers")({
  component: SubscribersPage,
});

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  source_link_id: string | null;
}

function SubscribersPage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("email_subscribers")
      .select("id, email, created_at, source_link_id")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubs((data as Subscriber[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const remove = async (id: string) => {
    setSubs((prev) => prev.filter((s) => s.id !== id));
    const { error } = await supabase.from("email_subscribers").delete().eq("id", id);
    if (error) toast.error(error.message);
  };

  const exportCsv = () => {
    const rows = [["email", "created_at"], ...subs.map((s) => [s.email, s.created_at])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscribers</h1>
          <p className="text-sm text-muted-foreground">Emails captured from your email-collector blocks.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={subs.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="overflow-hidden shadow-card">
        {loading ? (
          <div className="grid h-32 place-items-center text-muted-foreground">Loading…</div>
        ) : subs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Mail className="h-8 w-8 opacity-40" />
            <p className="text-sm">No subscribers yet.</p>
            <p className="text-xs">Add an "Email collector" block on your Links page to start collecting.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <div className="font-medium">{s.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
