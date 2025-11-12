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

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  is_verified: boolean;
}