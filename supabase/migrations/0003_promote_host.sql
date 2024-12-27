create or replace function promote_host(
  _room_id text,
  _player_id uuid
) returns void
language plpgsql
security definer
as $$
declare
  _host_id uuid;
begin
  -- Get current host ID to verify permissions
  select host_id into _host_id
  from rooms
  where room_id = _room_id;

  -- Check if caller is current host
  if auth.uid() != _host_id then
    raise exception 'Only the current host can promote another player';
  end if;

  -- Get user_id from player
  select user_id into _host_id
  from players
  where player_id = _player_id;

  if not found then
    raise exception 'Player not found';
  end if;

  -- Update room host
  update rooms
  set host_id = _host_id
  where room_id = _room_id;
end;
$$;
