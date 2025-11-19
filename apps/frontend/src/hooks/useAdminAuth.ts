// hooks/useAdminAuth.ts
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAdminAuth = () => {
  const router = useRouter();

  useEffect(() => {
    // Ambil role dari localStorage, harus sama persis dengan yang tersimpan di database
    const role = localStorage.getItem('role'); // misal 'store_admin' atau 'super_admin'

    if (!role || !['store_admin', 'super_admin'].includes(role)) {
      router.push('/'); // redirect kalau bukan admin
    }
  }, [router]);
};
