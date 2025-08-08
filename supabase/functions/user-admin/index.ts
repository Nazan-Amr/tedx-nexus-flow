import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.split(" ")[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const callerId = authData.user.id;

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", callerId)
      .maybeSingle();

    const body = await req.json().catch(() => ({}));
    const action = body.action as string | undefined;
    const targetUserId = (body.user_id as string | undefined) || callerId;

    if (action === "delete_user") {
      const isSelf = targetUserId === callerId;
      const isManager = callerProfile?.role === "management_board";

      if (!isSelf && !isManager) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // Delete auth user and profile
      await supabase.auth.admin.deleteUser(targetUserId);
      await supabase.from("profiles").delete().eq("user_id", targetUserId);

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});