export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  address: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  latitude: number;
  longitude: number;
}

export interface StoreBase {
  id: number;
  name: string;
  address: string;
  province: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface StoreWithDistance extends StoreBase {
  distance: number;
}
