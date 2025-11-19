'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import AddressManager from './AddressManager';

type PasswordStep = 'email' | 'reset';

interface PasswordData {
  email: string;
  token: string;
  newPassword: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'addresses'>('profile');
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('email');
  const [passwordData, setPasswordData] = useState<PasswordData>({
    email: '',
    token: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
        setPasswordData(prev => ({ ...prev, email: userData.email }));
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage('');

    try {
      let url = '';
      let body = {};

      if (passwordStep === 'email') {
        url = `${process.env.NEXT_PUBLIC_API_URL}api/auth/forgot-password`;
        body = { email: passwordData.email };
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL}api/auth/reset-password`;
        body = { token: passwordData.token, password: passwordData.newPassword };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (passwordStep === 'email') {
        setMessage('Reset token sent to your email!');
        setPasswordStep('reset');
      } else {
        setMessage('Password changed successfully!');
        setTimeout(() => {
          setChangePasswordMode(false);
          setPasswordStep('email');
          resetPasswordForm();
        }, 2000);
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetPasswordForm = () => {
    setPasswordData({
      email: user?.email || '',
      token: '',
      newPassword: ''
    });
    setMessage('');
    setPasswordStep('email');
    setChangePasswordMode(false);
  };

  const getPasswordTitle = () => {
    return passwordStep === 'email' ? 'Reset Password' : 'Set New Password';
  };

  const getPasswordButtonText = () => {
    if (passwordLoading) return 'Processing...';
    return passwordStep === 'email' ? 'Send Reset Token' : 'Change Password';
  };

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
                  onClick={() => setChangePasswordMode(true)}
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

            {/* Change Password Modal */}
            {changePasswordMode && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="password-modal-title"
              >
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 id="password-modal-title" className="text-lg font-semibold mb-4">
                    {getPasswordTitle()}
                  </h3>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {passwordStep === 'email' && (
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none bg-gray-100"
                          value={passwordData.email}
                          onChange={handlePasswordInputChange}
                          disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          We&apos;ll send a reset token to your email
                        </p>
                      </div>
                    )}

                    {passwordStep === 'reset' && (
                      <>
                        <div>
                          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                            Reset Token
                          </label>
                          <input
                            id="token"
                            name="token"
                            type="text"
                            required
                            className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter reset token from email"
                            value={passwordData.token}
                            onChange={handlePasswordInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            placeholder="New password (6-10 chars)"
                            value={passwordData.newPassword}
                            onChange={handlePasswordInputChange}
                            minLength={6}
                            maxLength={10}
                          />
                        </div>
                      </>
                    )}

                    {message && (
                      <div 
                        className={`rounded-md p-3 text-center text-sm ${
                          message.includes('successfully') || message.includes('sent')
                            ? 'border border-green-200 bg-green-50 text-green-700'
                            : 'border border-red-200 bg-red-50 text-red-700'
                        }`}
                        role="alert"
                      >
                        {message}
                      </div>
                    )}

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {getPasswordButtonText()}
                      </button>
                      <button
                        type="button"
                        onClick={resetPasswordForm}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>

                    {passwordStep === 'reset' && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setPasswordStep('email')}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Resend reset token
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <AddressManager />
        )}
      </div>
    </div>
  );
}