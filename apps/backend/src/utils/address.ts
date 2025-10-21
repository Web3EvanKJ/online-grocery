export async function getCoordinates({
  province,
  city,
  district,
  address,
}: {
  province: string;
  city: string;
  district: string;
  address: string;
}) {
  const fullAddress = `${address}, ${district}, ${city}, ${province}`;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      fullAddress
    )}`
  );
  const data = await res.json();

  if (!data || !data.length) throw new Error('Address not found');
  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}
