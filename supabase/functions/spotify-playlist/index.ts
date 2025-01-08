import { getPlaylist } from "./spotify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { playlistId } = await req.json();

  try {
    const playlist = await getPlaylist(playlistId);

    if (!playlist) {
      return new Response(JSON.stringify({ error: "Playlist not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    return new Response(JSON.stringify(playlist), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
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
