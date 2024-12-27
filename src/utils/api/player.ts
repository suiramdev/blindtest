import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Player, PlayerSchema } from './types';
import { getCurrentSession } from './auth';

export async function createPlayer(
  roomId: string,
  username: string,
): Promise<Player> {
  const session = await getCurrentSession();

  const { data, error } = await supabase
    .from('players')
    .insert({
      room_id: roomId,
      user_id: session.user.id,
      username: username,
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create player');

  return PlayerSchema.parse(data);
}

export async function getPlayers(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId);

  if (error) throw new Error('Failed to get players');

  return z.array(PlayerSchema).parse(data);
}
