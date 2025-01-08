-- Function to generate a random room code (excluding similar looking characters)
create or replace function generate_room_code()
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
  if exists (select 1 from rooms where room_id = result) then
    return generate_room_code();
  end if;

  NEW.room_id := result;
  return NEW;
end;
$$;

-- Trigger to automatically generate room code when room_id is null
create trigger set_room_code
  before insert on rooms
  for each row
  when (new.room_id is null)
  execute function generate_room_code();