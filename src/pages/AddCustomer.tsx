import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Bot, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { CURRENCIES, COUNTRY_CODES, LEAD_SOURCES, DEFAULT_CURRENCY } from "@/lib/intl";

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  company: z.string().trim().min(1, "Company is required").max(100),
  email: z.string().trim().email("Invalid email").max(255).or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  industry: z.string().trim().max(100).optional(),
  budget: z.number().min(0).optional(),
  deal_size: z.number().min(0).optional(),
  deal_stage: z.string(),
  notes: z.string().trim().max(2000).optional(),
  products_interested: z.string().trim().max(500).optional(),
  last_interaction_date: z.string().optional(),
  job_title: z.string().trim().max(100).optional(),
  website: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  lead_source: z.string().trim().max(100).optional(),
  next_follow_up_date: z.string().optional(),
  currency: z.string(),
  phone_country_code: z.string(),
});

const FormField = ({ label, id, required, error, children }: { label: string; id: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium">
      {label} {required && <span className="text-primary">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-destructive">{error}</p>
    )}
  </div>
);

const dealStages = ["Lead", "Contacted", "Demo", "Negotiation", "Closed"];

const AddCustomer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "",
    budget: "",
    deal_size: "",
    deal_stage: "Lead",
    notes: "",
    products_interested: "",
    last_interaction_date: "",
    job_title: "",
    website: "",
    city: "",
    country: "",
    lead_source: "",
    next_follow_up_date: "",
    currency: DEFAULT_CURRENCY,
    phone_country_code: "+91",
  });

  const currencySymbol =
    CURRENCIES.find((c) => c.code === form.currency)?.symbol || form.currency;

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent, runAgent = false) => {
    e.preventDefault();
    if (!user) return;

    const parsed = customerSchema.safeParse({
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
      deal_size: form.deal_size ? Number(form.deal_size) : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    const products = form.products_interested
      ? form.products_interested.split(",").map((p) => p.trim()).filter(Boolean)
      : null;

    const { data, error } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() ? `${form.phone_country_code} ${form.phone.trim()}` : null,
        industry: form.industry.trim() || null,
        budget: form.budget ? Number(form.budget) : 0,
        deal_size: form.deal_size ? Number(form.deal_size) : 0,
        deal_stage: form.deal_stage,
        notes: form.notes.trim() || null,
        products_interested: products,
        last_interaction_date: form.last_interaction_date || null,
        currency: form.currency,
        phone_country_code: form.phone_country_code,
        job_title: form.job_title.trim() || null,
        website: form.website.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        lead_source: form.lead_source || null,
        next_follow_up_date: form.next_follow_up_date || null,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast.error("Failed to add customer: " + error.message);
      return;
    }

    toast.success(`${form.name} added successfully!`);
    if (runAgent && data) {
      navigate(`/customers/${data.id}?autoRun=true`);
    } else if (data) {
      navigate(`/customers/${data.id}`);
    }
  };


  return (
    <AppLayout>
      <div className="max-w-3xl">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button variant="ghost" onClick={() => navigate("/customers")} className="mb-4 text-muted-foreground group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Customers
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide uppercase">New Customer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Add Customer
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Enter customer details to add them to your pipeline.
          </p>
        </motion.div>

        <form onSubmit={(e) => handleSubmit(e, false)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="glass rounded-xl p-5 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Customer Name" id="name" required error={errors.name}>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Sarah Chen"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Company Name" id="company" required error={errors.company}>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="e.g. TechVista Inc."
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Email Address" id="email" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="e.g. sarah@techvista.com"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Phone" id="phone">
                  <div className="flex gap-2">
                    <Select value={form.phone_country_code} onValueChange={(v) => update("phone_country_code", v)}>
                      <SelectTrigger className="bg-secondary/50 border-border focus-glow w-[110px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.code} value={c.dial}>
                            {c.dial} {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="98765 43210"
                      className="bg-secondary/50 border-border focus-glow"
                    />
                  </div>
                </FormField>

                <FormField label="Job Title" id="job_title">
                  <Input
                    id="job_title"
                    value={form.job_title}
                    onChange={(e) => update("job_title", e.target.value)}
                    placeholder="e.g. VP of Operations"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Website" id="website">
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="e.g. techvista.com"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="City" id="city">
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Country" id="country">
                  <Select value={form.country} onValueChange={(v) => update("country", v)}>
                    <SelectTrigger className="bg-secondary/50 border-border focus-glow">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Lead Source" id="lead_source">
                  <Select value={form.lead_source} onValueChange={(v) => update("lead_source", v)}>
                    <SelectTrigger className="bg-secondary/50 border-border focus-glow">
                      <SelectValue placeholder="How did you find them?" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Currency" id="currency">
                  <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                    <SelectTrigger className="bg-secondary/50 border-border focus-glow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>


                <FormField label="Industry" id="industry">
                  <Input
                    id="industry"
                    value={form.industry}
                    onChange={(e) => update("industry", e.target.value)}
                    placeholder="e.g. Technology"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Deal Stage" id="deal_stage">
                  <Select value={form.deal_stage} onValueChange={(v) => update("deal_stage", v)}>
                    <SelectTrigger className="bg-secondary/50 border-border focus-glow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealStages.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label={`Deal Size (${currencySymbol})`} id="deal_size">
                  <Input
                    id="deal_size"
                    type="number"
                    min="0"
                    value={form.deal_size}
                    onChange={(e) => update("deal_size", e.target.value)}
                    placeholder="e.g. 125000"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label={`Budget (${currencySymbol})`} id="budget">
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    placeholder="e.g. 150000"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Last Contact Date" id="last_interaction_date">
                  <Input
                    id="last_interaction_date"
                    type="date"
                    value={form.last_interaction_date}
                    onChange={(e) => update("last_interaction_date", e.target.value)}
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Next Follow-up Date" id="next_follow_up_date">
                  <Input
                    id="next_follow_up_date"
                    type="date"
                    value={form.next_follow_up_date}
                    onChange={(e) => update("next_follow_up_date", e.target.value)}
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>

                <FormField label="Products Interested (comma-separated)" id="products_interested">
                  <Input
                    id="products_interested"
                    value={form.products_interested}
                    onChange={(e) => update("products_interested", e.target.value)}
                    placeholder="e.g. Enterprise Suite, Analytics Pro"
                    className="bg-secondary/50 border-border focus-glow"
                  />
                </FormField>
              </div>

              <FormField label="Notes" id="notes">
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Any relevant notes about this customer..."
                  className="bg-secondary/50 border-border focus-glow min-h-[100px]"
                />
              </FormField>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" variant="glow" size="lg" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Save Customer
                </Button>
                <Button
                  type="button"
                  variant="agent"
                  size="lg"
                  disabled={saving}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                  Save & Run AI Agent
                </Button>
              </div>
            </Card>
          </motion.div>
        </form>
      </div>
    </AppLayout>
  );
};

export default AddCustomer;
