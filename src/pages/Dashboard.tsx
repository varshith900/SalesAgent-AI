import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Clock, BarChart3, ArrowRight, Sparkles, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

const AnimatedCounter = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const stepTime = Math.max(Math.floor((duration * 1000) / end), 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count}</>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeOpportunities: 0,
    followUpsDue: 0,
    closedDeals: 0,
  });
  const [focusCustomers, setFocusCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id);

      if (customers) {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        setStats({
          totalCustomers: customers.length,
          activeOpportunities: customers.filter(c => !['Closed', 'Lead'].includes(c.deal_stage)).length,
          followUpsDue: customers.filter(c => c.last_interaction_date && new Date(c.last_interaction_date) < threeDaysAgo && c.deal_stage !== 'Closed').length,
          closedDeals: customers.filter(c => c.deal_stage === 'Closed').length,
        });
        setFocusCustomers(
          customers
            .filter((customer) => customer.deal_stage !== "Closed")
            .sort((a, b) => {
              const aDate = a.next_follow_up_date ? new Date(a.next_follow_up_date).getTime() : Number.MAX_SAFE_INTEGER;
              const bDate = b.next_follow_up_date ? new Date(b.next_follow_up_date).getTime() : Number.MAX_SAFE_INTEGER;
              return aDate - bDate || (b.priority_score ?? 0) - (a.priority_score ?? 0);
            })
            .slice(0, 3),
        );
      }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, tone: "bg-primary/15 text-primary" },
    { label: "Active Opportunities", value: stats.activeOpportunities, icon: TrendingUp, tone: "bg-success/15 text-success" },
    { label: "Follow-ups Due", value: stats.followUpsDue, icon: Clock, tone: "bg-warning/15 text-warning" },
    { label: "Closed Deals", value: stats.closedDeals, icon: BarChart3, tone: "bg-info/15 text-info" },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide uppercase">Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's your sales performance overview.</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <Card className="group relative h-full overflow-hidden rounded-xl border-border/70 p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-elevated sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${stat.tone}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                    <AnimatedCounter value={stat.value} />
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.section
          className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Today’s focus</h2>
                <p className="text-sm text-muted-foreground">Your most important open follow-ups</p>
              </div>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div className="divide-y divide-border/60">
              {focusCustomers.length ? focusCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/55 sm:px-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display font-semibold text-primary">
                    {customer.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{customer.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">{customer.company} · {customer.deal_stage}</span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {customer.next_follow_up_date
                      ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(customer.next_follow_up_date))
                      : "Needs follow-up"}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              )) : (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">No open follow-ups yet.</div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
            <div>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">Keep your pipeline moving</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Review accounts or add a new opportunity for the AI agent to analyze.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <Button variant="glow" onClick={() => navigate("/customers")} className="group w-full">
                View Customers <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/customers/new")} className="group w-full">
                Add Customer <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
