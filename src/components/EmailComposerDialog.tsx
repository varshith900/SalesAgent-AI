import { useEffect, useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseEmailDraft } from "@/lib/email-draft";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: { name: string; company: string; email: string | null };
  draft: string;
  onSend: (subject: string, body: string) => Promise<boolean>;
}

export function EmailComposerDialog({ open, onOpenChange, customer, draft, onSend }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const parsed = parseEmailDraft(draft);
    setSubject(parsed.subject);
    setBody(parsed.body);
  }, [open, draft]);

  const close = (next: boolean) => {
    if (!sending) onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || !subject.trim() || !body.trim() || !customer.email) return;
    setSending(true);
    try {
      if (await onSend(subject.trim(), body.trim())) onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg p-4 sm:p-6" onEscapeKeyDown={(event) => { if (sending) event.preventDefault(); }} onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader className="text-left pr-7">
          <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Review email</DialogTitle>
          <DialogDescription className="break-words">{customer.name} · {customer.company}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="min-w-0 space-y-4">
          <div className="space-y-1">
            <Label>To</Label>
            <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{customer.email}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-review-subject">Subject</Label>
            <Input id="email-review-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={300} required disabled={sending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-review-body">Message</Label>
            <Textarea id="email-review-body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-48 sm:min-h-64 leading-relaxed" maxLength={20000} required disabled={sending} />
            <p className="text-xs text-muted-foreground text-right">{body.length.toLocaleString()} / 20,000</p>
          </div>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button type="button" variant="outline" disabled={sending} onClick={() => close(false)}>Discard edits</Button>
            <Button type="submit" disabled={sending || !subject.trim() || !body.trim() || !customer.email} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : "Send email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}