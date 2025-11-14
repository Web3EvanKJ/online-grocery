'use client';
import { useEffect, useState } from 'react';
import PageInventories from '@/components/inventories/PageInventories';
import { useAuth } from '@/lib/authAdmin';

export default function Page() {
  const { checkAuth } = useAuth(['super_admin', 'store_admin']);
  const [userInfo, setUserInfo] = useState<{
    role: string;
    userId: string;
  } | null>(null);

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

  return (
    <PageInventories role={userInfo.role} user_id={Number(userInfo.userId)} />
  );
}
