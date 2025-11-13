export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  is_verified: boolean;
  profile_image: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}


export interface Address {
  id: number;
  user_id: number;
  label: string;
  address_detail: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string; // Added subdistrict field
  latitude: number;
  longitude: number;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}
