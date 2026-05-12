import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  getLastKnownLocation,
  LocationRow,
  subscribeToMatchLocation,
} from '@/services/locationService';

const INITIAL_DELTA = 0.005;

export default function TravelerLocationScreen() {
  const { t } = useTranslation();
  const { matchId, vipUserId } = useLocalSearchParams<{
    matchId: string;
    vipUserId: string;
  }>();

  const [location, setLocation] = useState<LocationRow | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const mapRef = useRef<MapView>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/reset the "last updated X seconds ago" counter
  function resetElapsed() {
    setElapsed(0);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    elapsedRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  }

  function handleNewLocation(row: LocationRow) {
    setLocation(row);
    setLastUpdated(new Date());
    resetElapsed();

    const region: Region = {
      latitude: row.latitude,
      longitude: row.longitude,
      latitudeDelta: INITIAL_DELTA,
      longitudeDelta: INITIAL_DELTA,
    };
    mapRef.current?.animateToRegion(region, 500);
  }

  useEffect(() => {
    if (!matchId || !vipUserId) {
      setLoading(false);
      return;
    }

    // Fetch last known position first so the map isn't empty on open
    getLastKnownLocation(matchId, vipUserId)
      .then(row => {
        if (row) handleNewLocation(row);
      })
      .catch(() => {/* silently ignore until backend RLS is ready */})
      .finally(() => setLoading(false));

    // Subscribe for real-time updates
    const unsubscribe = subscribeToMatchLocation(matchId, vipUserId, handleNewLocation);

    return () => {
      unsubscribe();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [matchId, vipUserId]);

  const region: Region | undefined = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: INITIAL_DELTA,
        longitudeDelta: INITIAL_DELTA,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : !location ? (
        <View style={styles.centerContent}>
          <Text style={styles.waitingText}>{t('location_sharing.waiting')}</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={t('location_sharing.screen_title')}
              pinColor="#3b82f6"
            />
          </MapView>

          <View style={styles.infoCard}>
            <Text style={styles.coordText}>
              {location.latitude.toFixed(5)}°{' '}
              {location.latitude >= 0 ? 'N' : 'S'},{' '}
              {location.longitude.toFixed(5)}°{' '}
              {location.longitude >= 0 ? 'E' : 'W'}
            </Text>
            <Text style={styles.updatedText}>
              {t('location_sharing.last_updated')}:{' '}
              {t('location_sharing.seconds_ago', { count: elapsed })}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  waitingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  infoCard: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  coordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  updatedText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
