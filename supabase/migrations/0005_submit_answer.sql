-- Create function to submit answer and update scores
create or replace function submit_answer(
  p_round_id uuid,
  p_player_id uuid, 
  p_answers jsonb,
  p_score integer
) returns void
language plpgsql
security definer
as $$
begin
  -- Start transaction
  begin
    -- Update round answers
    update rounds
    set answers = p_answers
    where round_id = p_round_id;

    -- Update player score
    update players 
    set player_score = player_score + p_score
    where player_id = p_player_id;
  end;
end;
$$;
