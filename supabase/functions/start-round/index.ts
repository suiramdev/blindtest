import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTrackPreviewUrl, getTracks } from "./spotify.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roomId, playlistId } = await req.json();

  try {
    // Get playlist tracks from Spotify
    const tracks = await getTracks(playlistId);

    if (tracks.length === 0) {
      return new Response(JSON.stringify({ error: "No tracks found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Select random track and get its preview URL
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    const previewUrl = await getTrackPreviewUrl(randomTrack.id);

    if (!previewUrl || !randomTrack) {
      return new Response(JSON.stringify({ error: "No preview URL found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create a new round with the selected track and preview URL
    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .insert({
        room_id: roomId,
        track: {
          ...randomTrack,
          preview_url: previewUrl,
        },
      })
      .select()
      .single();

    if (roundError) throw roundError;

    // Update room status from 'waiting' to 'playing' to start the game
    // Only updates if current status is 'waiting' to avoid race conditions
    const { error: roomError } = await supabase
      .from("rooms")
      .update({ status: "playing", playlist_id: playlistId })
      .eq("room_id", roomId)
      .eq("status", "waiting");

    if (roomError) throw roomError;

    return new Response(JSON.stringify({ round }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      console.error("Unknown error", error);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
