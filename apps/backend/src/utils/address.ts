// utils/address.ts
export const getCoordinates = async ({
  province,
  city,
  district,
}: {
  province: string;
  city: string;
  district: string;
}) => {
  try {
    const fullAddress = `${district}, ${city}, ${province}, Indonesia`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'backend-server', // required by Nominatim
      },
    });

    if (!response.ok) {
      console.error(
        '❌ Nominatim request failed:',
        response.status,
        response.statusText
      );
      return { latitude: 0, longitude: 0 };
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('⚠️ No coordinates found for address:', fullAddress);
      return { latitude: 0, longitude: 0 };
    }

    const { lat, lon } = data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch (error) {
    console.error('❌ Failed to fetch coordinates:', error);
    return { latitude: 0, longitude: 0 };
  }
};

export const getCityFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  if (!latitude || !longitude) return '';

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'backend-server', // Nominatim requires this header
      },
    });

    if (!response.ok) {
      console.error('❌ Reverse geocoding failed:', response.statusText);
      return '';
    }

    const data = await response.json();

    // Nominatim returns a variety of possible keys for city
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.suburb ||
      '';

    return city;
  } catch (error) {
    console.error('❌ Error fetching city from coordinates:', error);
    return '';
  }
};
