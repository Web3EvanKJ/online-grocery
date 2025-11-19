'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import AddressManager from './AddressManager';
import ChangePassword from './ChangePassword';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'addresses'>('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div 
          className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600">User ID: {user?.id}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveSection('profile')}
                className={`rounded-lg px-4 py-2 font-medium ${
                  activeSection === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-pressed={activeSection === 'profile'}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection('addresses')}
                className={`rounded-lg px-4 py-2 font-medium ${
                  activeSection === 'addresses'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-pressed={activeSection === 'addresses'}
              >
                Addresses
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeSection === 'profile' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Account Info
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user?.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user?.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user?.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full rounded px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50">
                  Edit Profile
                </button>
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="w-full rounded px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setActiveSection('addresses')}
                  className="w-full rounded px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  Manage Addresses
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AddressManager />
        )}

        {/* Change Password Modal */}
        <ChangePassword
          userEmail={user?.email || ''}
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      </div>
    </div>
  );
}