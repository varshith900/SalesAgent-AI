import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ContactDialogProps {
  customerId: string;
  customerName: string;
  trigger?: React.ReactNode;
}

export function ContactDialog({ customerId, customerName, trigger }: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { customerId, subject, body: message },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Email sent to ${customerName}`);
      
      // Log activity
      if (user) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          customer_id: customerId,
          action_type: "email_sent",
          description: `Direct email sent to ${customerName}: ${subject}`,
        });
      }

      setOpen(false);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send email:", err);
      toast.error(err.message || "Failed to send email. Ensure GMAIL_USER and GMAIL_PASS are set in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSend}>
          <DialogHeader>
            <DialogTitle>Contact {customerName}</DialogTitle>
            <DialogDescription>
              Send a direct email without exposing the recipient's address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Follow-up on our recent discussion"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi ${customerName.split(' ')[0]}, just wanted to check in..."
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
