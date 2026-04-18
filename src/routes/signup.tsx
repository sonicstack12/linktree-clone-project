import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GoogleButton } from "@/components/GoogleButton";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — Linkly" }] }),
});

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/admin" }); }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error("Username must be 3-30 characters: letters, numbers, underscores.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        data: { username: username.toLowerCase(), display_name: username },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to Linkly! 🎉");
    navigate({ to: "/admin" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="m-auto w-full max-w-sm space-y-7 py-12">
          <div>
            <h1 className="text-3xl font-bold">Join linkly</h1>
            <p className="mt-2 text-sm text-muted-foreground">It's free. Forever.</p>
          </div>
          <div className="space-y-3">
            <GoogleButton label="Sign up with Google" />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Choose your link</Label>
              <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border-2 border-input bg-background focus-within:border-primary">
                <span className="select-none border-r border-input bg-muted px-3 py-2 text-sm text-muted-foreground">linkly.app/</span>
                <input
                  id="username"
                  required
                  autoComplete="off"
                  className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create my linkly"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have one? <Link to="/login" className="font-semibold text-foreground hover:underline">Log in</Link>
          </p>
        </div>
      </div>
      {/* Right: visual */}
      <div className="hidden bg-gradient-leaf lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold leading-tight">Your corner of the internet, ready in 30 seconds.</h2>
          <p className="mt-4 text-primary-foreground/90">Pick a template, add your links, share with the world.</p>
        </div>
      </div>
    </div>
  );
}
