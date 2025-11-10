export const getCoordinates = async ({
  province,
  city,
  district,
  subdistrict,
}: {
  province: string;
  city: string;
  district: string;
  subdistrict: string;
}) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenCage API key.');
    }

    const fullAddress = `${subdistrict}, ${district}, ${city}, ${province}`;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      fullAddress
    )}&key=${apiKey}&limit=1&language=en`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('OpenCage request failed:');
    }

    const data = await response.json();

    if (
      !data ||
      !data.results ||
      data.results.length === 0 ||
      !data.results[0].geometry
    ) {
      throw new Error('No coordinates found for address');
    }

    const { lat, lng } = data.results[0].geometry;
    return {
      latitude: lat,
      longitude: lng,
      confidence: data.results[0].confidence,
    };
  } catch (error) {
    throw new Error('Failed to fetch coordinates:');
  }
};
