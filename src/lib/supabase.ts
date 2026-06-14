import { createClient } from '@supabase/supabase-js';
import type { GameState, RoomData } from './types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function createRoom(roomId: string, state: GameState): Promise<void> {
  const data: RoomData = { state, createdAt: Date.now() };
  const { error } = await supabase
    .from('rooms')
    .insert({ id: roomId, state: data.state });
  if (error) throw error;
}

export async function getRoomState(roomId: string): Promise<GameState | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('state')
    .eq('id', roomId)
    .single();
  if (error) return null;
  return data.state as GameState;
}

export function subscribeToRoom(roomId: string, callback: (state: GameState) => void): () => void {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      (payload) => {
        const row = payload.new as { state: GameState } | null;
        if (row?.state) callback(row.state);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function setRoomState(roomId: string, state: GameState): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ state })
    .eq('id', roomId);
  if (error) throw error;
}

export async function updateRoomState(roomId: string, updates: Partial<GameState>): Promise<void> {
  const current = await getRoomState(roomId);
  if (!current) throw new Error('Room not found');
  await setRoomState(roomId, { ...current, ...updates });
}

export async function deleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
