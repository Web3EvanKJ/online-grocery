import axios from 'axios';

export class RajaOngkirService {
  private static apiKey = process.env.RAJAONGKIR_API_KEY;
  private static baseUrl = 'https://api.rajaongkir.com/starter';

  static async getShippingCost(origin: string, destination: string, weight: number, courier: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/cost`,
        {
          origin,
          destination,
          weight,
          courier
        },
        {
          headers: {
            'key': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.rajaongkir.results[0];
    } catch (error: any) {
      console.error('RajaOngkir API error:', error.response?.data || error.message);
      throw new Error('Failed to calculate shipping cost');
    }
  }

  static async getCities() {
    try {
      const response = await axios.get(`${this.baseUrl}/city`, {
        headers: { 'key': this.apiKey }
      });
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      return [];
    }
  }

  // Helper to find city ID by name
  static async findCityId(cityName: string): Promise<string | null> {
    const cities = await this.getCities();
    const city = cities.find((c: any) => 
      c.city_name.toLowerCase().includes(cityName.toLowerCase())
    );
    return city ? city.city_id : null;
  }
}