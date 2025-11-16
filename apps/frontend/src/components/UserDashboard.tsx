'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import AddressManager from './AddressManager';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'addresses' | 'change-password'>('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 10) {
      setPasswordMessage('Password must be 6-10 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/auth/change-password`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Optionally switch back to profile after success
      setTimeout(() => {
        setActiveSection('profile');
      }, 2000);

    } catch (error: unknown) {
      setPasswordMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );

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
              <p className="text-gray-600">User ID: {params.id}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveSection('profile')}
                className={`rounded-lg px-4 py-2 font-medium ${
                  activeSection === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
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
              >
                Addresses
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeSection === 'profile' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Account Info
              </h3>
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
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full rounded px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50">
                  Edit Profile
                </button>
                <button 
                  onClick={() => setActiveSection('change-password')}
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
        )}

        {activeSection === 'addresses' && <AddressManager />}

        {activeSection === 'change-password' && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-6">
              <button
                onClick={() => setActiveSection('profile')}
                className="flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profile
              </button>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Change Password</h3>
              <p className="mt-1 text-sm text-gray-600">Update your password to keep your account secure.</p>
            </div>

            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  required
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  required
                  minLength={6}
                  maxLength={10}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Password must be 6-10 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {passwordMessage && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    passwordMessage.includes('successfully')
                      ? 'border border-green-200 bg-green-50 text-green-700'
                      : 'border border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {passwordMessage}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {passwordLoading ? 'Changing Password...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('profile')}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}