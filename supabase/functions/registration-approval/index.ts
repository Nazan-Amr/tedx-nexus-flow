import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const user_id = url.searchParams.get("user_id");

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    if (req.method === "GET" && action && user_id) {
      // Handle Approve/Decline clicks from email
      const { data: profile } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", user_id)
        .maybeSingle();

      if (action === "approve") {
        await admin.from("profiles").update({ is_active: true }).eq("user_id", user_id);

        // Notify the user
        if (profile?.email) {
          await resend.emails.send({
            from: "TEDx System <onboarding@resend.dev>",
            to: [profile.email],
            subject: "Your TEDx account is approved",
            html: `<p>Hello ${profile.full_name ?? ""},</p><p>Your account has been approved. You can now access the platform.</p>`
          });
        }

        return new Response("User approved successfully.", { status: 200, headers: corsHeaders });
      }

      if (action === "decline") {
        // Delete user account and profile
        await admin.auth.admin.deleteUser(user_id);
        await admin.from("profiles").delete().eq("user_id", user_id);

        if (profile?.email) {
          await resend.emails.send({
            from: "TEDx System <onboarding@resend.dev>",
            to: [profile.email],
            subject: "Your TEDx registration was declined",
            html: `<p>Hello ${profile.full_name ?? ""},</p><p>We are sorry to inform you that your registration has been declined.</p>`
          });
        }

        return new Response("User declined and removed.", { status: 200, headers: corsHeaders });
      }

      return new Response("Invalid request.", { status: 400, headers: corsHeaders });
    }

    if (req.method === "POST") {
      // Send approval email to management after user verifies and logs in
      const { user_id, full_name, email, role, department, phone_number } = await req.json();

      const approveLink = `${SUPABASE_URL}/functions/v1/registration-approval?action=approve&user_id=${encodeURIComponent(user_id)}`;
      const declineLink = `${SUPABASE_URL}/functions/v1/registration-approval?action=decline&user_id=${encodeURIComponent(user_id)}`;

      const html = `
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> ${full_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone_number ?? "-"}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Department:</strong> ${department ?? "-"}</p>
        <p>
          <a href="${approveLink}" style="padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin-right:8px">Approve</a>
          <a href="${declineLink}" style="padding:10px 16px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;">Decline</a>
        </p>
      `;

      const mgmtEmail = "tedxstemnewcairo@gmail.com";

      const res = await resend.emails.send({
        from: "TEDx System <onboarding@resend.dev>",
        to: [mgmtEmail],
        subject: "New TEDx registration pending approval",
        html,
      });

      return new Response(JSON.stringify({ ok: true, res }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});