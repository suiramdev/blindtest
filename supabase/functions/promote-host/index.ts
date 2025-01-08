import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("URL") ?? "",
  Deno.env.get("ANON_KEY") ?? "",
  {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
      },
    },
  },
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roomId, playerId } = await req.json();

  try {
    // Get current host ID to verify permissions
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("host_id")
      .eq("room_id", roomId)
      .single();

    if (roomError || !roomData) {
      return new Response(JSON.stringify({ error: "Room not found" }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Get auth user ID from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Check if caller is current host
    if (user.id !== roomData.host_id) {
      return new Response(
        JSON.stringify({
          error: "Only the current host can promote another player",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get user_id from player
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("user_id")
      .eq("player_id", playerId)
      .single();

    if (playerError || !playerData) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Update room host
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ host_id: playerData.user_id })
      .eq("room_id", roomId);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update host" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
