import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bot, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[34rem] w-[52rem] max-w-full -translate-x-1/2 bg-primary/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[31rem]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <header className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-primary/40 gradient-primary shadow-glow-lg">
            <Bot className="h-9 w-9 text-primary-foreground" strokeWidth={2.1} />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-gradient sm:text-4xl">SalesAgent AI</h1>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered sales workflow assistant
            <Sparkles className="hidden h-4 w-4 text-primary sm:block" />
          </p>
        </header>

        <section className="glass rounded-2xl border border-border/80 p-6 shadow-elevated sm:p-9">
          <div className="mb-7">
            <h2 className="mb-1.5 font-display text-2xl font-semibold text-foreground">
              {isLogin ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Sign in to continue to your workspace." : "Create your account to start selling smarter."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-sm font-medium text-secondary-foreground">Email address</label>
              <div className="group relative">
              <Mail className="absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="auth-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12 rounded-lg border-border bg-secondary/60 pl-11 text-foreground transition-all placeholder:text-muted-foreground/70 focus-visible:border-primary/70 focus-visible:ring-primary/20"
                required
              />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="auth-password" className="text-sm font-medium text-secondary-foreground">Password</label>
              <div className="group relative">
              <Lock className="absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                id="auth-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="h-12 rounded-lg border-border bg-secondary/60 pl-11 text-foreground transition-all placeholder:text-muted-foreground/70 focus-visible:border-primary/70 focus-visible:ring-primary/20"
                required
                minLength={6}
              />
              </div>
            </div>
            <Button type="submit" variant="glow" className="mt-1 h-12 w-full rounded-lg font-semibold" size="lg" disabled={loading}>
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

          <div className="mt-7 border-t border-border/70 pt-6 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="h-auto whitespace-normal p-0 text-sm font-normal text-muted-foreground"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-primary">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure access to your sales workspace
          </div>
        </section>
      </motion.div>
    </main>
  );
};

export default Auth;
