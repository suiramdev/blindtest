-- Function to generate a random game id (excluding similar looking characters)
create or replace function generate_game_id()
returns trigger
language plpgsql
as $$
declare
  chars text[] := array[
    '2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f','g','h',
    'j','k','m','n','p','q','r','s',
    't','v','w','x','y','z'
  ];
  result text := '';
  i integer := 0;
  random_index integer;
begin
  -- Generate a 6-character code
  while i < 6 loop
    random_index := floor(random() * array_length(chars, 1) + 1);
    result := result || chars[random_index];
    i := i + 1;
  end loop;

  -- If code already exists, try again recursively
  if exists (select 1 from games where game_id = result) then
    return generate_game_id();
  end if;

  NEW.game_id := result;
  return NEW;
end;
$$;

-- Trigger to automatically generate game id when game_id is null
create trigger set_game_id
  before insert on games
  for each row
  when (new.game_id is null)
  execute function generate_game_id();
