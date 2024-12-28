-- Create rooms table 
create table if not exists rooms (
  room_id text primary key,
  host_id uuid not null references auth.users(id),
  playlist_id text,
  status text not null default 'waiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create players table
create table if not exists players (
  player_id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(room_id) on delete cascade,
  user_id uuid not null references auth.users(id),
  username text not null,
  player_score integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint unique_player_per_room unique (room_id, user_id)
);

-- Create rounds table
create table if not exists rounds (
  round_id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(room_id) on delete cascade,
  track jsonb not null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  answers jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Then set the publication to include all operations including DELETE
alter table players replica identity full;

-- Create or update the publication to include DELETE
drop publication if exists supabase_realtime;
create publication supabase_realtime for all tables with (publish = 'insert,update,delete');

-- RLS policies
alter table rooms enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;

-- Rooms policies  
create policy "Rooms are viewable by everyone"
  on rooms for select using (true);

create policy "Host can create rooms"
  on rooms for insert with check (auth.uid() = host_id);

create policy "Host can delete their room"
  on rooms for delete using (auth.uid() = host_id);

create policy "Only host can update their room"
  on rooms for update using (auth.uid() = host_id);

-- Players policies
create policy "Players are viewable by everyone"
  on players for select using (true);

create policy "Players can create their own records"
  on players for insert with check (auth.uid() = user_id);

create policy "Players can delete their own records"
  on players for delete using (auth.uid() = user_id);

create policy "Host can update players in their room"
  on players for update
  using (auth.uid() = (select host_id from rooms where room_id = players.room_id));

create policy "Host can delete players in their room"
  on players for delete
  using (auth.uid() = (select host_id from rooms where room_id = players.room_id));

-- Rounds policies
create policy "Rounds are viewable by everyone"
  on rounds for select using (true);

create policy "Only room host can update rounds"
  on rounds for update
  using (auth.uid() = (select host_id from rooms where room_id = rounds.room_id));

create policy "Only room host can create rounds"
  on rounds for insert
  with check (auth.uid() = (select host_id from rooms where room_id = rounds.room_id));