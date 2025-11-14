'use client';

import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  userId: string;
  email: string;
  role: string;
  is_verified: boolean;
  exp?: number;
};

/**
 * Checks auth token in localStorage.
 * If valid → returns { role, userId }
 * If invalid or not allowed → redirects to /
 */
export function useAuth(requiredRoles?: string[]) {
  const router = useRouter();

  const checkAuth = (): { role: string; userId: string } | null => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return null;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);

      // Expiration check
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('token');
        router.push('/');
        return null;
      }

      // Role check
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        router.push('/');
        return null;
      }

      return { role: decoded.role, userId: decoded.userId };
    } catch {
      localStorage.removeItem('token');
      router.push('/');
      return null;
    }
  };

  return { checkAuth };
}
