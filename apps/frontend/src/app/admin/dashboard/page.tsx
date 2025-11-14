'use client';

import { useEffect, useState } from 'react';
import PageAdminDashboard from '@/components/adminDashboard/PageAdminDashboard';
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
  }, []);

  if (!userInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking authorization...
      </div>
    );
  }

  console.log(userInfo);

  return <PageAdminDashboard role={userInfo.role} />;
}
