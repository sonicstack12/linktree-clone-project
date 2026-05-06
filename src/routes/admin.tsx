import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Palette, BarChart3, Eye, LogOut, Mail, BadgeCheck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Links", icon: LayoutDashboard, exact: true },
  { to: "/admin/appearance", label: "Appearance", icon: Palette, exact: false },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail, exact: false },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { to: "/admin/verification", label: "Verification", icon: BadgeCheck, exact: false },
];

function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }

  const nav = isAdmin ? [...NAV, { to: "/admin/review", label: "Review queue", icon: ShieldCheck, exact: false }] : NAV;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={`/u/preview`} onClick={(e) => { e.preventDefault(); navigate({ to: "/admin/preview" }); }}>
                <Eye className="h-4 w-4" /> Preview
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Nav tabs */}
        <nav className="flex gap-1 overflow-x-auto pt-6">
          {nav.map((item) => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-pop ${
                  isActive
                    ? "bg-foreground text-background shadow-pop"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
