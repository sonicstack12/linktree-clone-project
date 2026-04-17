import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/templates" className="text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/admin">Dashboard</Link></Button>
              <Button size="sm" variant="hero" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm" variant="hero"><Link to="/signup">Sign up free</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  // ensure scroll-to-top on mount when component navigates here
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
      <footer className="mt-24 border-t border-border/50 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-sm text-muted-foreground sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} Linkly. Make every link count.</p>
        </div>
      </footer>
    </div>
  );
}
