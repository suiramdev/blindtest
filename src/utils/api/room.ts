import { supabase } from '@/lib/supabase';
import { Room, RoomSchema } from './types';
import { getCurrentSession } from './auth';
import { createPlayer, getPlayers } from './player';

export async function createRoom(): Promise<Room> {
  const session = await getCurrentSession();

  const { data, error } = await supabase
    .from('rooms')
    .insert({ host_id: session.user.id })
    .select()
    .single();

  if (error) throw new Error('Failed to create room');

  return RoomSchema.parse(data);
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_id', roomId)
    .single();

  if (error) return null;

  return RoomSchema.parse(data);
}

export async function joinRoom(roomId: string, username: string) {
  // Verify room exists first
  await getRoom(roomId);
  return createPlayer(roomId, username);
}

export async function leaveRoom(roomId: string): Promise<void> {
  const session = await getCurrentSession();

  const room = await getRoom(roomId);
  if (!room) throw new Error('Room not found');

  const isHost = room.host_id === session.user.id;

  // Remove player
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', session.user.id);

  if (error) throw new Error('Failed to leave room');

  if (isHost) {
    await handleHostLeaving(roomId, session.user.id);
  }
}

async function handleHostLeaving(
  roomId: string,
  userId: string,
): Promise<void> {
  const players = await getPlayers(roomId);
  const remainingPlayers = players.filter((p) => p.user_id !== userId);

  if (remainingPlayers.length > 0) {
    // Promote first remaining player to host
    await promoteNewHost(roomId, remainingPlayers[0].player_id);
  } else {
    // No other players, delete the room
    await deleteRoom(roomId);
  }
}

export async function promoteNewHost(
  roomId: string,
  newHostPlayerId: string,
): Promise<void> {
  const { error } = await supabase.rpc('promote_host', {
    _room_id: roomId,
    _player_id: newHostPlayerId,
  });

  if (error) throw new Error('Failed to promote new host');
}

async function deleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('room_id', roomId);

  if (error) throw new Error('Failed to delete room');
}

export async function kickPlayer(
  roomId: string,
  playerId: string,
): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId);

  if (error) throw new Error('Failed to kick player');
}
