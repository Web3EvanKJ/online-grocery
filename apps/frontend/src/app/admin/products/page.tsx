'use client';
import { ProductPage } from '@/components/products/PageProducts';
import { useAuth } from '@/lib/authAdmin';
import { useEffect, useState } from 'react';

export default function Page() {
  const { checkAuth } = useAuth(['super_admin', 'store_admin']);
  const [userInfo, setUserInfo] = useState<{
    role: string;
    userId: string;
  } | null>({ role: 'user', userId: '0' });

  useEffect(() => {
    const authData = checkAuth();
    if (authData) setUserInfo(authData);
  }, [checkAuth]);

  if (!userInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking authorization...
      </div>
    );
  }

  userInfo.role = 'super_admin';

  return <ProductPage userRole={userInfo.role} />;
}
