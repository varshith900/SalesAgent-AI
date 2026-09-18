import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Best-effort per-user send limit
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > RATE_LIMIT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    if (rateLimited(user.id)) return json({ error: "Too many emails sent. Please wait a moment." }, 429);

    const payload = await req.json().catch(() => null);
    const customerId = typeof payload?.customerId === "string" ? payload.customerId : "";
    const subject = typeof payload?.subject === "string" ? payload.subject.trim() : "";
    const body = typeof payload?.body === "string" ? payload.body.trim() : "";

    if (!/^[0-9a-f-]{36}$/i.test(customerId) || !subject || !body) {
      return json({ error: "Invalid request" }, 400);
    }
    if (subject.length > 300 || body.length > 20000) {
      return json({ error: "Email content is too long" }, 400);
    }

    // Recipient comes from the caller's own customer record, never from the request body
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("id", customerId)
      .maybeSingle();

    if (customerError) {
      console.error("customer lookup error:", customerError);
      return json({ error: "Unable to load customer" }, 500);
    }
    if (!customer) return json({ error: "Customer not found" }, 404);

    const to = customer.email ?? "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) return json({ error: "This customer has no valid email address" }, 400);

    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_PASS = Deno.env.get("GMAIL_PASS");
    if (!GMAIL_USER || !GMAIL_PASS) return json({ error: "Email sending is not configured" }, 500);

    const nodemailer = await import("npm:nodemailer@6.9.8");

    const transporter = nodemailer.default.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });

    const info = await transporter.sendMail({
      from: `SalesAgent AI <${GMAIL_USER}>`,
      to,
      subject,
      text: body,
    });

    return json({ success: true, messageId: info.messageId, to });
  } catch (e) {
    console.error("send-email error:", e);
    return json({ error: "Email could not be sent" }, 500);
  }
});
