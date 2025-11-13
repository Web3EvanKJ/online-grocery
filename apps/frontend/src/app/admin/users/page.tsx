'use client';
import PageUsers from '@/components/users/PageUsers';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authAdmin';

export default function Page() {
  const { checkAuth } = useAuth(['super_admin']);
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
  return <PageUsers />;
}
