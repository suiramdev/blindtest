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

    // Check if the answer matches track name or artist name (case insensitive)
    const normalizedAnswer = answer.toLowerCase();
    const isTrackMatch = round.track.name.toLowerCase() === normalizedAnswer;
    const isArtistMatch = round.track.artists.some(
      (artist: { name: string }) =>
        artist.name.toLowerCase() === normalizedAnswer,
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
