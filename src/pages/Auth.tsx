import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bot, Mail, Lock, ArrowRight, ShieldCheck, Zap, Target, FileText, TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
  </svg>
);

const highlights = [
  { icon: Zap, title: "Instant AI analysis", text: "Deal health, urgency and win probability in one click." },
  { icon: Target, title: "Next-best actions", text: "Know exactly what to do next on every account." },
  { icon: FileText, title: "Proposals & emails", text: "Polished, personalized and ready to send in seconds." },
];

const ease = [0.22, 1, 0.36, 1] as const;

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
      if (result.redirected) return;
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background">
      {/* ── Animated backdrop ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute -top-40 left-1/4 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[130px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-8rem] right-[-4rem] h-[30rem] w-[30rem] rounded-full bg-info/15 blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[-6rem] top-1/2 h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-[110px]"
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10 xl:gap-20">
        {/* ── Brand / showcase panel ──────────────────── */}
        <motion.section
          className="hidden lg:block"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="mb-8 flex items-center gap-3.5">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 gradient-primary shadow-glow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Bot className="h-7 w-7 text-primary-foreground" strokeWidth={2.1} />
            </motion.div>
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">
              SalesAgent <span className="text-gradient">AI</span>
            </span>
          </div>

          <h1 className="mb-5 font-display text-[2.9rem] font-bold leading-[1.08] tracking-tight text-foreground xl:text-[3.4rem]">
            Close more deals with your{" "}
            <span className="text-gradient">AI sales agent</span>
          </h1>
          <p className="mb-10 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
            Account summaries, deal analysis, follow-up emails and proposals — generated and sent for you, automatically.
          </p>

          <ul className="space-y-4">
            {highlights.map((h, i) => (
              <motion.li
                key={h.title}
                className="glass flex items-start gap-4 rounded-2xl border border-border/60 p-4 transition-colors hover:border-primary/35"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.55, ease }}
                whileHover={{ x: 4 }}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <h.icon className="h-[1.15rem] w-[1.15rem]" />
                </span>
                <span>
                  <span className="block text-[0.95rem] font-semibold text-foreground">{h.title}</span>
                  <span className="block text-sm text-muted-foreground">{h.text}</span>
                </span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            className="mt-10 flex items-center gap-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            Built for modern sales teams that move fast
          </motion.div>
        </motion.section>

        {/* ── Auth card ───────────────────────────────── */}
        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.1 }}
        >
          {/* Mobile brand */}
          <div className="mb-8 text-center lg:hidden">
            <motion.div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-primary/40 gradient-primary shadow-glow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Bot className="h-8 w-8 text-primary-foreground" strokeWidth={2.1} />
            </motion.div>
            <h1 className="mb-1.5 font-display text-3xl font-bold tracking-tight text-gradient">SalesAgent AI</h1>
            <p className="text-sm text-muted-foreground">AI-powered sales workflow assistant</p>
          </div>

          <div className="relative mx-auto w-full max-w-[27.5rem]">
            {/* Animated gradient border */}
            <div
              className="absolute -inset-px rounded-[1.65rem] opacity-60 [background:conic-gradient(from_var(--angle,0deg),transparent_0%,hsl(var(--primary)/0.55)_12%,transparent_28%,transparent_60%,hsl(var(--info)/0.4)_74%,transparent_90%)]"
              aria-hidden="true"
            />
            <div className="glass relative rounded-[1.6rem] border border-border/60 p-7 shadow-elevated backdrop-blur-xl sm:p-9">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease }}
                >
                  <div className="mb-7">
                    <h2 className="mb-1.5 font-display text-[1.7rem] font-semibold tracking-tight text-foreground">
                      {isLogin ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {isLogin
                        ? "Sign in to continue to your sales workspace."
                        : "Start closing deals smarter in under a minute."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogle}
                    disabled={googleLoading || loading}
                    className="h-12 w-full rounded-xl border-border/80 bg-secondary/40 font-medium text-foreground transition-all duration-300 hover:-translate-y-px hover:border-primary/45 hover:bg-secondary/70 hover:shadow-glow"
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
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">or with email</span>
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
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
                          className="h-12 rounded-xl border-border bg-secondary/50 pl-11 text-foreground transition-all duration-300 placeholder:text-muted-foreground/60 focus-visible:border-primary/70 focus-visible:shadow-glow focus-visible:ring-primary/20"
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
                          className="h-12 rounded-xl border-border bg-secondary/50 pl-11 text-foreground transition-all duration-300 placeholder:text-muted-foreground/60 focus-visible:border-primary/70 focus-visible:shadow-glow focus-visible:ring-primary/20"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      variant="glow"
                      size="lg"
                      disabled={loading || googleLoading}
                      className="group mt-2 h-12 w-full rounded-xl text-[0.95rem] font-semibold transition-transform duration-300 hover:-translate-y-px"
                    >
                      {loading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <>
                          {isLogin ? "Sign In" : "Create Account"}
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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
                      <span className="font-semibold text-primary transition-colors hover:text-primary-glow">
                        {isLogin ? "Sign up free" : "Sign in"}
                      </span>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
                <ShieldCheck className="h-4 w-4 text-primary/80" />
                Encrypted, secure access to your workspace
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default Auth;
