import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

type Row = { id: string; action_type: string; description: string | null; created_at: string };

export function CustomerActivity({ customerId }: { customerId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    supabase
      .from("activity_log")
      .select("id, action_type, description, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setRows(data || []));
  }, [customerId]);

  if (!rows) return <div className="h-24 shimmer rounded-xl" />;
  if (!rows.length) return <p className="text-muted-foreground text-sm py-8 text-center">No activity for this customer yet.</p>;

  return (
    <div className="relative space-y-3 border-l border-border pl-5">
      {rows.map((r) => (
        <Card key={r.id} className="glass rounded-xl p-4 relative">
          <span className="absolute -left-[27px] top-5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground capitalize">{r.action_type.replace(/_/g, " ")}</p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(r.created_at).toLocaleString()}
            </span>
          </div>
          {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
        </Card>
      ))}
    </div>
  );
}
