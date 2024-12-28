import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface Answer {
  roundId: string;
  playerId: string;
  answer: string;
}

// Function to normalize text for comparison
function normalizeText(text: string): string {
  return (
    text
      .toLowerCase()
      // Normalize unicode characters
      .normalize('NFKD')
      // Remove accents/diacritics
      .replace(/[\u0300-\u036f]/g, '')
      // Remove special characters and extra spaces
      .replace(/[^a-z0-9\s]/g, '')
      // Remove any remaining parentheses content as it's usually extra info
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .trim()
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the answer data from the request
    const { roundId, answer, playerId }: Answer = await req.json();

    // Verify the player exists and belongs to the room
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('player_id')
      .eq('player_id', playerId)
      .single();

    if (playerError || !player) {
      throw new Error('Invalid player');
    }

    // Get the round details
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('round_id', roundId)
      .single();

    if (roundError || !round) {
      throw new Error('Round not found');
    }

    // Calculate score based on time difference
    const MAX_SCORE = 1000;
    const MAX_TIME = 30; // Maximum time in seconds to answer

    const startTime = new Date(round.created_at).getTime();
    const answerTime = new Date().getTime();
    const timeDiff = (answerTime - startTime) / 1000;

    let score = 0;
    if (timeDiff <= MAX_TIME) {
      score = Math.round(MAX_SCORE * (1 - timeDiff / MAX_TIME));
    }

    // Check if the answer matches track name or artist name with fuzzy matching
    const normalizedAnswer = normalizeText(answer);
    const normalizedTrackName = normalizeText(round.track.name);
    const normalizedArtistNames = round.track.artists.map((artist) =>
      normalizeText(artist.name),
    );

    // Set thresholds for matching
    const SIMILARITY_THRESHOLD = 0.85; // 85% similarity required for a match

    // Check track name similarity
    const trackSimilarity = calculateSimilarity(
      normalizedAnswer,
      normalizedTrackName,
    );
    const isTrackMatch = trackSimilarity >= SIMILARITY_THRESHOLD;

    // Check artist name similarity
    const isArtistMatch = normalizedArtistNames.some(
      (artistName) =>
        calculateSimilarity(normalizedAnswer, artistName) >=
        SIMILARITY_THRESHOLD,
    );

    const isCorrect = isTrackMatch || isArtistMatch;

    if (!isCorrect) {
      score = 0;
    }

    // Update the round's answers
    const newAnswers = {
      ...round.answers,
      [playerId]: {
        answer,
        score,
        answeredAt: new Date().toISOString(),
      },
    };

    // Only update scores if answer was correct and score > 0
    if (score > 0) {
      const { error: updateError } = await supabase.rpc('submit_answer', {
        p_round_id: roundId,
        p_player_id: playerId,
        p_answers: newAnswers,
        p_score: score,
      });

      if (updateError) {
        throw updateError;
      }
    } else {
      // Just update the answers without updating player score
      const { error: updateError } = await supabase
        .from('rounds')
        .update({ answers: newAnswers })
        .eq('round_id', roundId);

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({
        score,
        isCorrect,
        timeTaken: timeDiff,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
