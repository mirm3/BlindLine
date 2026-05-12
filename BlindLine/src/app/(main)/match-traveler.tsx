import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { offerHelpForTrip } from '@/services/tripService';

type TripRequest = {
  id: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  status: string;
  vip_user_id: string;
};

export default function MatchTravelerScreen() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const { user } = useAuth();

  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripRequests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('trip_request')
          .select('*')
          .eq('status', 'PENDING');

        if (error) throw error;
        setTripRequests(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch trip requests';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripRequests();
  }, [user]);

  const handleMatch = async (tripRequest: TripRequest) => {
    if (!user) return;
    setProcessingId(tripRequest.id);
    setError(null);

    try {
      await offerHelpForTrip(tripRequest.id, user.id);

      Alert.alert('Match Successful!', 'You have been matched with the traveler.', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/volunteer-trips'),
        },
      ]);
    } catch (err: any) {
      const message = err.message || 'Failed to offer help. Please try again.';
      setError(`Error: ${message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Available Travelers</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={tintColor} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : tripRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="users" size={40} color="#ccc" />
          <Text style={styles.emptyText}>No travelers are looking for help right now.</Text>
          <Text style={styles.emptySubtext}>Check back soon!</Text>
        </View>
      ) : (
        tripRequests.map((request) => (
          <View key={request.id} style={styles.tripRequestContainer}>
            <Text>Departure: {new Date(request.departure_time).toLocaleString()}</Text>
            <Text>{request.departure_station} to {request.arrival_station}</Text>
            <TouchableOpacity
              onPress={() => handleMatch(request)}
              style={[styles.matchButton, { backgroundColor: tintColor }]}
              disabled={processingId === request.id}
            >
              {processingId === request.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.matchButtonText}>Offer Help</Text>
              )}
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tripRequestContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 12,
    marginBottom: 12,
  },
  matchButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  matchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.4,
  },
});
