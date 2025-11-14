'use client';

import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';

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

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return null;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('token');
        router.push('/');
        return null;
      }

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
  }, [router, requiredRoles]);

  return { checkAuth };
}
