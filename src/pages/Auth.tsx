import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bot, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return; // Browser is navigating to Google
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute left-1/2 top-[-8rem] h-[36rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-[160px]" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-info/10 blur-[140px]" />
        <div className="absolute bottom-[-12rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_78%)]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand */}
        <header className="mb-9 text-center">
          <motion.div
            className="relative mx-auto mb-6 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-[1.35rem] border border-primary/40 gradient-primary shadow-glow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="h-8 w-8 text-primary-foreground" strokeWidth={2.1} />
          </motion.div>
          <h1 className="mb-2.5 font-display text-4xl font-bold tracking-tight text-gradient sm:text-[2.75rem]">
            SalesAgent AI
          </h1>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered sales workflow assistant
            <Sparkles className="h-4 w-4 text-primary" />
          </p>
        </header>

        {/* Card */}
        <section className="glass relative overflow-hidden rounded-3xl border border-border/70 p-7 shadow-elevated sm:p-9">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" aria-hidden="true" />

          <div className="mb-7">
            <h2 className="mb-1.5 font-display text-[1.65rem] font-semibold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isLogin
                ? "Sign in to continue to your sales workspace."
                : "Start closing deals smarter in under a minute."}
            </p>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="h-12 w-full rounded-xl border-border/80 bg-secondary/40 font-medium text-foreground transition-all hover:border-primary/40 hover:bg-secondary/70 hover:shadow-glow"
          >
            {googleLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </Button>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border/80" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">or</span>
            <span className="h-px flex-1 bg-border/80" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-[0.8rem] font-medium text-secondary-foreground">
                Email address
              </label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-12 rounded-xl border-border bg-secondary/50 pl-11 text-foreground transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary/70 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="auth-password" className="text-[0.8rem] font-medium text-secondary-foreground">
                Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="h-12 rounded-xl border-border bg-secondary/50 pl-11 text-foreground transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary/70 focus-visible:ring-primary/20"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="glow"
              className="mt-2 h-12 w-full rounded-xl text-[0.95rem] font-semibold"
              size="lg"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-7 border-t border-border/60 pt-6 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="h-auto whitespace-normal p-0 text-sm font-normal text-muted-foreground"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-primary">{isLogin ? "Sign up free" : "Sign in"}</span>
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
            <ShieldCheck className="h-4 w-4 text-primary/80" />
            Encrypted, secure access to your workspace
          </div>
        </section>
      </motion.div>
    </main>
  );
};

export default Auth;
