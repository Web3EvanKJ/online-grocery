import axios from 'axios';

// utils/rajaongkir.ts
export class RajaOngkirService {
  private static apiKey = process.env.RAJAONGKIR_API_KEY;
  private static baseUrl = 'https://api.rajaongkir.com/starter';

  static async getShippingCost(origin: string, destination: string, weight: number, courier: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/cost`,
        new URLSearchParams({
          origin,
          destination, 
          weight: weight.toString(),
          courier
        }),
        {
          headers: {
            'key': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const result = response.data.rajaongkir;
      
      if (result.status.code !== 200) {
        throw new Error(result.status.description);
      }

      return result.results[0];
    } catch (error: any) {
      console.error('RajaOngkir API error:', error.response?.data || error.message);
      throw new Error('Failed to calculate shipping cost');
    }
  }

  static async getCities(provinceId?: string) {
    try {
      const params = provinceId ? `?province=${provinceId}` : '';
      const response = await axios.get(`${this.baseUrl}/city${params}`, {
        headers: { 'key': this.apiKey }
      });
      
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      return [];
    }
  }

  static async getProvinces() {
    try {
      const response = await axios.get(`${this.baseUrl}/province`, {
        headers: { 'key': this.apiKey }
      });
      
      return response.data.rajaongkir.results;
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
      return [];
    }
  }

  // Helper untuk cari city ID by name
  static async findCityId(cityName: string, provinceName?: string): Promise<string | null> {
    const cities = await this.getCities();
    
    const city = cities.find((c: any) => {
      const matchCity = c.city_name.toLowerCase().includes(cityName.toLowerCase());
      const matchProvince = !provinceName || c.province.toLowerCase().includes(provinceName.toLowerCase());
      return matchCity && matchProvince;
    });
    
    return city ? city.city_id : null;
  }
}