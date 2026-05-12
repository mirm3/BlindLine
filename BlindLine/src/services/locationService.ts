import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

export interface LocationRow {
  id: string;
  user_id: string;
  match_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string | null;
}

/**
 * Request foreground location permission.
 * Returns true if granted.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Get the device's current GPS position.
 */
export async function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

/**
 * Insert a location record for the VIP into the locations table.
 */
export async function upsertVipLocation(
  userId: string,
  matchId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  const { error } = await supabase.from('locations').insert({
    user_id: userId,
    match_id: matchId,
    latitude,
    longitude,
    recorded_at: new Date().toISOString(),
  });

  if (error) throw error;
}

/**
 * Fetch the most recent location record for a VIP within a match.
 */
export async function getLastKnownLocation(
  matchId: string,
  vipUserId: string
): Promise<LocationRow | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('match_id', matchId)
    .eq('user_id', vipUserId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as LocationRow | null;
}

/**
 * Subscribe to real-time location updates for a VIP within a match.
 * Returns an unsubscribe function.
 */
export function subscribeToMatchLocation(
  matchId: string,
  vipUserId: string,
  callback: (location: LocationRow) => void
): () => void {
  const channel = supabase
    .channel(`location:${matchId}:${vipUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'locations',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const row = payload.new as LocationRow;
        if (row.user_id === vipUserId) {
          callback(row);
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
