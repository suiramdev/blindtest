import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Answer {
  roundId: string
  songId: string
  answer: string
  playerId: string // Using playerId instead of userId
  roomCode: string // Added to verify the player belongs to the room
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the answer data from the request
    const { roundId, songId, answer, playerId, roomCode }: Answer = await req.json()

    // Verify the player exists and belongs to the room
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('id', playerId)
      .eq('room_code', roomCode)
      .single()

    if (playerError || !player) {
      throw new Error('Invalid player or room')
    }

    // Get the round details
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('start_time, answers')
      .eq('id', roundId)
      .eq('room_code', roomCode) // Added room_code check
      .single()

    if (roundError || !round) {
      throw new Error('Round not found')
    }

    // Calculate score based on time difference
    const MAX_SCORE = 1000
    const MAX_TIME = 30 // Maximum time in seconds to answer

    const startTime = new Date(round.start_time).getTime()
    const answerTime = new Date().getTime()
    const timeDiff = (answerTime - startTime) / 1000

    let score = 0
    if (timeDiff <= MAX_TIME) {
      score = Math.round(MAX_SCORE * (1 - timeDiff / MAX_TIME))
    }

    // Check if the answer is correct (case insensitive)
    const isCorrect = songId.toLowerCase() === answer.toLowerCase()
    if (!isCorrect) {
      score = 0
    }

    // Update the round's answers
    const newAnswers = {
      ...round.answers,
      [playerId]: {
        answer,
        score,
        answeredAt: new Date().toISOString(),
      },
    }

    // Update the round and player's score
    const { error: updateError } = await supabase.rpc('submit_answer', {
      p_round_id: roundId,
      p_player_id: playerId,
      p_room_code: roomCode,
      p_answers: newAnswers,
      p_score: score,
    })

    if (updateError) {
      throw updateError
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
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
