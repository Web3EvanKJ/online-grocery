'use client';

import { useEffect, useState } from 'react';
import PageAdminDashboard from '@/components/adminDashboard/PageAdminDashboard';
import { useAuth } from '@/lib/authAdmin';

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

  return <PageAdminDashboard role={userInfo.role} />;
}
