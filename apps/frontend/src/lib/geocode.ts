export async function reverseGeocode(lat: number, lng: number) {
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  if (!apiKey) throw new Error('Missing OpenCage API key');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=en&pretty=1`;

  const res = await fetch(url);
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) throw new Error('No address found for this location');
  const components = result.components || {};

  return {
    province: components.state || components.region || '',
    city:
      components.city ||
      components.county ||
      components.town ||
      components.village ||
      components.municipality ||
      '',
    district:
      components.suburb ||
      components.neighbourhood ||
      components.district ||
      '',
    address_detail: components.village || '',
  };
}
