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
  score integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint unique_player_per_room unique (room_id, user_id)
);

-- Create rounds table
create table if not exists rounds (
  round_id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(room_id) on delete cascade,
  track jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists answers (
  answer_id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(round_id) on delete cascade,
  player_id uuid not null references players(player_id) on delete cascade,
  answer text not null,
  score integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set replica identity to full for players table to enable tracking of deleted rows in realtime subscriptions
alter table players replica identity full;

-- Create new realtime publication that enables insert, update and delete change events for all tables
drop publication if exists supabase_realtime;
create publication supabase_realtime for all tables with (publish = 'insert,update,delete');

-- RLS policies
alter table rooms enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table answers enable row level security;

-- Rooms policies  
create policy "Rooms are viewable by everyone"
  on rooms for select using (true);

create policy "Users can create a room"
  on rooms for insert with check (auth.uid() = host_id);

create policy "Only host can update their room"
  on rooms for update using (auth.uid() = host_id);

-- Players policies
create policy "Players are viewable by everyone"
  on players for select using (true);

create policy "Players can create their own records"
  on players for insert 
  with check (
    auth.uid() = user_id 
    and score = 0
  );

-- Rounds policies
create policy "Rounds are viewable by everyone"
  on rounds for select using (true);

-- Answers policies
create policy "Users can see their own answers"
  on answers for select
  using (
    auth.uid() = (
      select user_id 
      from players 
      where player_id = answers.player_id
    )
  );
