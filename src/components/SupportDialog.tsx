import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export function SupportDialog({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    const { data, error } = await supabase.functions.invoke("contact-support", {
      body: { subject: subject.trim(), message: message.trim() },
    });
    setSending(false);
    if (error || data?.error) {
      toast.error(data?.error || "Your message could not be sent. Please try again.");
      return;
    }
    toast.success("Message sent to the SalesAgent AI team");
    setSubject("");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size={mobile ? "default" : "sm"} className={mobile ? "w-full justify-start" : "nav-control"}>
          <Mail className="h-4 w-4" /> Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="glass overflow-hidden rounded-2xl border-border/70 p-0 shadow-elevated sm:max-w-md">
        <div className="border-b border-border/60 p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><Mail className="h-5 w-5" /></div>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Contact our team</DialogTitle>
            <DialogDescription>Send a private message and we’ll reply to your account email.</DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="How can we help?" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={6} placeholder="Tell us what you need..." className="resize-none" required />
          </div>
          <DialogFooter>
            <Button type="submit" variant="glow" className="w-full" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending..." : "Send message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}