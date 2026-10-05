import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
const STAGES = ["Lead", "Contacted", "Demo", "Negotiation", "Closed"];

export function CustomerEditDialog({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSaved: (c: Customer) => void;
}) {
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) setForm(customer);
  }, [customer]);

  const set = (k: keyof Customer, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!customer) return;
    if (!form.name?.trim() || !form.company?.trim()) {
      toast.error("Name and company are required");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email || null,
        phone: form.phone || null,
        job_title: form.job_title || null,
        deal_size: Number(form.deal_size) || 0,
        deal_stage: form.deal_stage || "Lead",
        next_follow_up_date: form.next_follow_up_date || null,
        notes: form.notes || null,
      })
      .eq("id", customer.id)
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error("Could not save changes");
      return;
    }
    toast.success("Customer updated");
    onSaved(data);
  };

  const field = (label: string, k: keyof Customer, type = "text") => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={(form[k] as string | number | null) ?? ""} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <Dialog open={!!customer} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Name", "name")}
          {field("Company", "company")}
          {field("Email", "email", "email")}
          {field("Phone", "phone")}
          {field("Job title", "job_title")}
          {field("Deal size", "deal_size", "number")}
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <select
              value={form.deal_stage ?? "Lead"}
              onChange={(e) => set("deal_stage", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {field("Next follow-up", "next_follow_up_date", "date")}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
