// src/hooks/useNearestStore.ts
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import axios from 'axios';

interface NearestStore {
  store_id: number;
  store_name: string;
  distance_km: number;
}

interface UseNearestStoreReturn {
  store: NearestStore | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useNearestStore(): UseNearestStoreReturn {
  const [store, setStore] = useState<NearestStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearestStore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try getting user's current location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Call backend API
      const { data } = await api.get<NearestStore>(`/store-location/nearest`, {
        params: { latitude, longitude },
      });

      setStore(data);
    } catch (err) {
      // Case 1: Geolocation permission denied → fallback store
      if (
        err instanceof GeolocationPositionError &&
        err.code === err.PERMISSION_DENIED
      ) {
        setStore({
          store_id: 1,
          store_name: 'Super Store',
          distance_km: 0,
        });
        setError(null); // not a real error, just fallback
      }

      // Case 2: Other geolocation errors
      else if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('Failed to get your location.');
        }
      }

      // Case 3: API/Network errors
      else if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.msg || 'Failed to fetch nearest store from API.'
        );
      }

      // Case 4: Unknown errors
      else {
        setError('Unexpected error occurred while getting nearest store.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNearestStore();
  }, [fetchNearestStore]);

  return { store, loading, error, refetch: fetchNearestStore };
}
