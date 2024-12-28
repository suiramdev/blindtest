-- Add current_round_id to rooms table
alter table rooms 
add column current_round_id uuid references rounds(round_id);

-- Update start_game_round function to set current_round_id
create or replace function start_game_round(
  p_room_id text,
  p_track jsonb
) returns json
language plpgsql
security definer
as $$
declare
  v_round record;
begin
  -- Start transaction
  begin
    -- Update room status to playing
    update rooms
    set status = 'playing'
    where room_id = p_room_id;

    -- Create new round
    insert into rounds (
      room_id,
      track
    ) values (
      p_room_id,
      p_track
    )
    returning * into v_round;

    -- Update room with current round
    update rooms
    set current_round_id = v_round.round_id
    where room_id = p_room_id;

    -- Return the created round
    return row_to_json(v_round);
  end;
end;
$$; 