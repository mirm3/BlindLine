import { supabase } from '@/lib/supabase';
import { TripStatus, MatchStatus } from '@/lib/database.types';

export interface TripRequest {
  id: string;
  vip_user_id: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  status: TripStatus;
  created_at: string | null;
  // Joined fields
  traveler_email?: string;
  traveler_phone?: string | null;
  traveler_mobility_aids?: string[] | null;
  traveler_preferences?: Record<string, unknown> | null;
}

export interface Match {
  id: string;
  trip_request_id: string;
  volunteer_id: string;
  vip_user_id: string;
  matched_at: string | null;
  status: MatchStatus;
}

export interface TripWithMatch extends TripRequest {
  match?: Match & {
    volunteer_email?: string;
    volunteer_phone?: string;
  };
  has_review?: boolean;
  review?: {
    rating: number;
    comment: string | null;
  };
}

export interface AvailableTripRequest extends TripRequest {
  traveler_email: string;
  traveler_phone: string | null;
}

// ==================== TRAVELER FUNCTIONS ====================

/**
 * Create a new trip request (for travelers)
 */
export async function createTripRequest(data: {
  vipUserId: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
}): Promise<TripRequest> {
  const { data: trip, error } = await supabase
    .from('trip_request')
    .insert({
      vip_user_id: data.vipUserId,
      departure_station: data.departureStation,
      arrival_station: data.arrivalStation,
      departure_time: data.departureTime,
      status: 'PENDING' as TripStatus,
    })
    .select()
    .single();

  if (error) throw error;

  return trip;
}

/**
 * Get all trip requests for a specific traveler
 */
export async function getTravelerTrips(userId: string): Promise<TripWithMatch[]> {
  const { data: trips, error } = await supabase
    .from('trip_request')
    .select('*')
    .eq('vip_user_id', userId)
    .order('departure_time', { ascending: false });

  if (error) throw error;
  if (!trips || trips.length === 0) return [];

  // Fetch matches for these trips
  const tripIds = trips.map(t => t.id);
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .in('trip_request_id', tripIds);

  // Get volunteer info for matches
  const volunteerIds = matches?.map(m => m.volunteer_id) || [];
  const { data: volunteers } = await supabase
    .from('users')
    .select('id, email, phone')
    .in('id', volunteerIds);

  // Get reviews by traveler
  const { data: reviews } = await supabase
    .from('reviews')
    .select('trip_request_id, rating, comment')
    .eq('reviewer_user_id', userId)
    .in('trip_request_id', tripIds);

  // Combine data
  return trips.map(trip => {
    // Only show the match if it is ACTIVE or COMPLETED.
    // Ignore CANCELED matches so the traveler sees "Waiting for volunteer" again.
    const match = matches?.find(m => m.trip_request_id === trip.id && m.status !== 'CANCELED');
    const volunteer = match ? volunteers?.find(v => v.id === match.volunteer_id) : null;
    const review = reviews?.find(r => r.trip_request_id === trip.id);

    return {
      ...trip,
      has_review: !!review,
      review: review ? { rating: review.rating, comment: review.comment } : undefined,
      match: match ? {
        ...match,
        volunteer_email: volunteer?.email || undefined,
        volunteer_phone: volunteer?.phone || undefined,
      } : undefined,
    };
  });
}

/**
 * Cancel a trip request
 */
export async function cancelTripRequest(tripId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_request')
    .update({ status: 'CANCELED' as TripStatus })
    .eq('id', tripId);

  if (error) throw error;

  // Also cancel any active matches
  await supabase
    .from('matches')
    .update({ status: 'CANCELED' as MatchStatus })
    .eq('trip_request_id', tripId)
    .eq('status', 'ACTIVE');
}

// ==================== VOLUNTEER FUNCTIONS ====================

/**
 * Get all available (pending) trip requests for volunteers to browse
 */
export async function getAvailableTripRequests(): Promise<AvailableTripRequest[]> {
  const { data: trips, error } = await supabase
    .from('trip_request')
    .select('*')
    .eq('status', 'PENDING')
    .gte('departure_time', new Date().toISOString())
    .order('departure_time', { ascending: true });

  if (error) throw error;

  // Get traveler info
  const travelerIds = trips.map(t => t.vip_user_id);
  const { data: travelers } = await supabase
    .from('users')
    .select('id, email, phone')
    .in('id', travelerIds);

  return trips.map(trip => {
    const traveler = travelers?.find(t => t.id === trip.vip_user_id);
    return {
      ...trip,
      traveler_email: traveler?.email || 'Unknown',
      traveler_phone: traveler?.phone || null,
    };
  });
}

/**
 * Volunteer offers to help with a trip (creates a match)
 */
export async function offerHelpForTrip(tripId: string, volunteerId: string): Promise<Match> {
  // Verify volunteer is available
  const { data: availability, error: availabilityError } = await supabase
    .from('volunteer_profile')
    .select('is_available')
    .eq('user_id', volunteerId)
    .single();

  if (availabilityError) throw availabilityError;
  if (!availability?.is_available) {
    throw new Error('You are not available to take a trip');
  }

  // First check if trip is still pending
  const { data: trip, error: tripError } = await supabase
    .from('trip_request')
    .select('status, vip_user_id')
    .eq('id', tripId)
    .single();

  if (tripError) throw tripError;
  if (trip.status !== 'PENDING') {
    throw new Error('This trip is no longer available');
  }

  // Check if volunteer already has an active match for this trip
  const { data: existingMatch } = await supabase
    .from('matches')
    .select('id')
    .eq('trip_request_id', tripId)
    .eq('volunteer_id', volunteerId)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (existingMatch) {
    throw new Error('You have already offered help for this trip');
  }

  // Create the match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      trip_request_id: tripId,
      volunteer_id: volunteerId,
      vip_user_id: trip.vip_user_id,
      matched_at: new Date().toISOString(),
      status: 'ACTIVE' as MatchStatus,
    })
    .select()
    .single();

  if (matchError) throw matchError;

  // Update trip status to MATCHED only if still pending
  const { data: updatedTrips, error: updateTripError } = await supabase
    .from('trip_request')
    .update({ status: 'MATCHED' as TripStatus })
    .eq('id', tripId)
    .eq('status', 'PENDING')
    .select('id');

  if (updateTripError) {
    await supabase.from('matches').delete().eq('id', match.id);
    throw updateTripError;
  }

  if (!updatedTrips || updatedTrips.length === 0) {
    await supabase.from('matches').delete().eq('id', match.id);
    throw new Error('This trip was matched by another volunteer');
  }

  // Mark volunteer unavailable after taking a trip
  const { error: availabilityUpdateError } = await supabase
    .from('volunteer_profile')
    .update({ is_available: false })
    .eq('user_id', volunteerId);

  if (availabilityUpdateError) throw availabilityUpdateError;

  return match;
}

/**
 * Get all trips where the volunteer has offered help (active matches)
 */
export async function getVolunteerMatches(volunteerId: string): Promise<TripWithMatch[]> {
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('volunteer_id', volunteerId)
    .order('matched_at', { ascending: false });

  if (matchError) throw matchError;
  if (!matches || matches.length === 0) return [];

  // Get trip details
  const tripIds = matches.map(m => m.trip_request_id);
  const { data: trips } = await supabase
    .from('trip_request')
    .select('*')
    .in('id', tripIds);

  if (!trips) return [];

  // Get traveler info
  const travelerIds = trips.map(t => t.vip_user_id);
  const { data: travelers } = await supabase
    .from('users')
    .select('id, email, phone')
    .in('id', travelerIds);
  const { data: travelerProfiles } = await supabase
    .from('vip_profile')
    .select('user_id, mobility_aids, preferences')
    .in('user_id', travelerIds);

  // Get reviews by volunteer
  const { data: reviews } = await supabase
    .from('reviews')
    .select('trip_request_id, rating, comment')
    .eq('reviewer_user_id', volunteerId)
    .in('trip_request_id', tripIds);

  return matches
    .map(match => {
      const trip = trips.find(t => t.id === match.trip_request_id);
      if (!trip) return null;

      const traveler = travelers?.find(u => u.id === trip.vip_user_id) ?? null;
      const travelerProfile = travelerProfiles?.find(p => p.user_id === trip.vip_user_id) ?? null;
      const review = reviews?.find(r => r.trip_request_id === trip.id);

      // Parse mobility_aids
      let mobilityAids: string[] | null = null;
      if (travelerProfile?.mobility_aids) {
        const raw = travelerProfile.mobility_aids;
        if (Array.isArray(raw)) mobilityAids = raw;
        else if (typeof raw === 'string') {
          try { mobilityAids = JSON.parse(raw); } catch { mobilityAids = null; }
        }
      }

      // Parse preferences
      let preferences: Record<string, unknown> | null = null;
      if (travelerProfile?.preferences) {
        const raw = travelerProfile.preferences;
        if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
          preferences = raw as Record<string, unknown>;
        } else if (typeof raw === 'string') {
          try { preferences = JSON.parse(raw); } catch { preferences = null; }
        }
      }

      return {
        ...trip,
        traveler_email: traveler?.email || undefined,
        traveler_phone: traveler?.phone || undefined,
        traveler_mobility_aids: mobilityAids,
        traveler_preferences: preferences,
        has_review: !!review,
        review: review ? { rating: review.rating, comment: review.comment } : undefined,
        match: { ...match },
      };
    })
    .filter((t) => t !== null) as TripWithMatch[];
}

/**
 * Volunteer cancels their offer to help
 */
export async function cancelVolunteerOffer(matchId: string): Promise<void> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('trip_request_id')
    .eq('id', matchId)
    .single();

  if (matchError) throw matchError;

  const { error: updateError } = await supabase
    .from('matches')
    .update({ status: 'CANCELED' as MatchStatus })
    .eq('id', matchId);

  if (updateError) throw updateError;

  const { data: otherMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('trip_request_id', match.trip_request_id)
    .eq('status', 'ACTIVE');

  if (!otherMatches || otherMatches.length === 0) {
    await supabase
      .from('trip_request')
      .update({ status: 'PENDING' as TripStatus })
      .eq('id', match.trip_request_id);
  }
}

/**
 * Mark a trip as completed using the Supabase RPC .
 */
export async function completeTrip(tripId: string): Promise<void> {
  // Use RPC if available, otherwise fallback to manual update
  const { error } = await supabase.rpc('complete_trip', {
    p_trip_id: tripId,
  });

  if (error) {
    console.warn('RPC complete_trip failed, trying manual update:', error.message);
    // Manual fallback
    const { error: tripError } = await supabase
      .from('trip_request')
      .update({ status: 'COMPLETED' as TripStatus })
      .eq('id', tripId);

    if (tripError) throw tripError;

    await supabase
      .from('matches')
      .update({ status: 'COMPLETED' as MatchStatus })
      .eq('trip_request_id', tripId)
      .eq('status', 'ACTIVE');
  }
}

// ==================== MATCH ACCEPT / DECLINE ====================

export async function acceptMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('volunteer_accept_match', {
    p_match_id: matchId,
  });
  if (error) throw error;
}

export async function declineMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('volunteer_decline_match', {
    p_match_id: matchId,
  });
  if (error) throw error;
}

// ==================== VOLUNTEER AVAILABILITY ====================

/**
 * Update volunteer availability status
 */
export async function setVolunteerAvailability(
  volunteerId: string,
  isAvailable: boolean
): Promise<void> {
  const { error } = await supabase
    .from('volunteer_profile')
    .update({ is_available: isAvailable })
    .eq('user_id', volunteerId);

  if (error) throw error;
}

/**
 * Get volunteer availability status
 */
export async function getVolunteerAvailability(volunteerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('volunteer_profile')
    .select('is_available')
    .eq('user_id', volunteerId)
    .single();

  if (error) throw error;
  return data?.is_available ?? false;
}

// ==================== REAL-TIME SUBSCRIPTIONS ====================

/**
 * Subscribe to new trip requests (for volunteers)
 */
export function subscribeToTripRequests(
  callback: (trip: TripRequest) => void
): () => void {
  const subscription = supabase
    .channel('trip_request_insert')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_request',
      },
      (payload) => {
        callback(payload.new as TripRequest);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Subscribe to trip updates for a specific user
 */
export function subscribeToUserTrips(userId: string, callback: () => void) {
  return supabase
    .channel(`user_trips:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trip_request',
        filter: `vip_user_id=eq.${userId}`,
      },
      () => callback()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `vip_user_id=eq.${userId}`,
      },
      () => callback()
    )
    .subscribe();
}

/**
 * Subscribe to volunteer match updates
 */
export function subscribeToVolunteerMatches(volunteerId: string, callback: () => void) {
  return supabase
    .channel(`volunteer_matches:${volunteerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `volunteer_id=eq.${volunteerId}`,
      },
      () => callback()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trip_request',
      },
      () => callback()
    )
    .subscribe();
}

/**
 * Submit a review for a trip
 */
export async function submitReview(
  tripId: string,
  rating: number,
  comment?: string | null
): Promise<void> {
  const { error } = await supabase.rpc('submit_review', {
    p_trip_request_id: tripId,
    p_rating: rating,
    p_comment: comment ?? null,
  });

  if (error) throw error;
}
