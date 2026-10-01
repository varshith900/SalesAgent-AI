import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const hits = new Map<string, number[]>();

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return json({ error: "Unauthorized" }, 401);

    const now = Date.now();
    const recent = (hits.get(data.user.id) ?? []).filter((time) => now - time < 60_000);
    if (recent.length >= 5) return json({ error: "Please wait before sending another message" }, 429);

    const payload = await req.json().catch(() => null);
    const subject = typeof payload?.subject === "string" ? payload.subject.trim() : "";
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    if (!subject || !message || subject.length > 160 || message.length > 4000) return json({ error: "Invalid message" }, 400);

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_PASS");
    if (!gmailUser || !gmailPass) return json({ error: "Email sending is not configured" }, 500);
    const nodemailer = await import("npm:nodemailer@6.9.8");
    const transporter = nodemailer.default.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass } });
    await transporter.sendMail({
      from: `SalesAgent AI <${gmailUser}>`,
      to: "jangilivashith08@gmail.com",
      replyTo: data.user.email,
      subject: `[SalesAgent AI Contact] ${subject}`,
      text: `From: ${data.user.email ?? "Signed-in user"}\n\n${message}`,
    });
    recent.push(now);
    hits.set(data.user.id, recent);
    return json({ success: true });
  } catch (error) {
    console.error("contact-support error:", error);
    return json({ error: "Message could not be sent" }, 500);
  }
});