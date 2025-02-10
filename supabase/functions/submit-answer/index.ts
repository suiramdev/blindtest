import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Artist {
  name: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Function to normalize text for comparison
function normalizeText(text: string): string {
  return (
    text
      .toLowerCase()
      // Normalize unicode characters
      .normalize("NFKD")
      // Remove accents/diacritics
      .replace(/[\u0300-\u036f]/g, "")
      // Remove special characters and extra spaces
      .replace(/[^a-z0-9\s]/g, "")
      // Remove any remaining parentheses content as it's usually extra info
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .trim()
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
  );
}

// Function to calculate string similarity (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  const distance = matrix[str1.length][str2.length];
  return 1 - distance / maxLength;
}

// Maximum score a player can get for a correct answer
const MAX_SCORE = 1000;
// Maximum time in seconds allowed to answer before scoring 0 points
const MAX_TIME = 30;
// Minimum similarity score (0-1) required between user's answer and correct song title
// Lower values are more lenient, higher values require more exact matches
// 0.85 means answers must be 85% similar to be considered correct
const SIMILARITY_THRESHOLD = 0.85;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
    },
  },
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roundId, answer, playerId } = await req.json();

  try {
    const { data: roundData, error: roundError } = await supabase
      .from("rounds")
      .select("*")
      .eq("round_id", roundId)
      .single();

    if (roundError) throw roundError;
    if (!roundData) throw new Error("Round not found");

    // Verify player belongs to the game
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("player_id, score")
      .eq("player_id", playerId)
      .eq("game_id", roundData.game_id)
      .single();

    if (playerError) throw playerError;
    if (!playerData) throw new Error("Player is not part of this game");

    // Calculate time taken
    const startTime = new Date(roundData.created_at).getTime();
    const answerTime = new Date().getTime();
    const timeDiff = (answerTime - startTime) / 1000;

    // Calculate score
    let score = 0;
    if (timeDiff <= MAX_TIME) {
      score = Math.round(MAX_SCORE * (1 - timeDiff / MAX_TIME));
    }

    // Check if the answer matches track name or artist name with fuzzy matching
    const normalizedAnswer = normalizeText(answer);
    const normalizedTrackName = normalizeText(roundData.track.name);
    const normalizedArtistNames = roundData.track.artists.map(
      (artist: Artist) => normalizeText(artist.name),
    );

    // Check track name similarity
    const trackSimilarity = calculateSimilarity(
      normalizedAnswer,
      normalizedTrackName,
    );
    const isTrackMatch = trackSimilarity >= SIMILARITY_THRESHOLD;

    // Check artist name similarity
    const isArtistMatch = normalizedArtistNames.some(
      (artistName: string) =>
        calculateSimilarity(normalizedAnswer, artistName) >=
        SIMILARITY_THRESHOLD,
    );

    const isCorrect = isTrackMatch || isArtistMatch;

    if (!isCorrect) {
      return new Response(JSON.stringify({ success: false, score: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Insert answer
    const { error: answerError } = await supabase.from("answers").insert({
      round_id: roundId,
      player_id: playerId,
      answer,
      score,
    });

    if (answerError) throw answerError;

    // Update player score
    const { error: updateError } = await supabase
      .from("players")
      .update({ score: playerData.score + score })
      .eq("player_id", playerId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error(error);
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
