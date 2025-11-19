'use client';

import { useState } from 'react';

interface ChangePasswordProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

type PasswordStep = 'email' | 'reset';

interface PasswordData {
  email: string;
  token: string;
  newPassword: string;
}

export default function ChangePassword({ 
  userEmail, 
  isOpen, 
  onClose 
}: ChangePasswordProps) {
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('email');
  const [passwordData, setPasswordData] = useState<PasswordData>({
    email: userEmail,
    token: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
          handleClose();
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

  const handleClose = () => {
    setPasswordData({
      email: userEmail,
      token: '',
      newPassword: ''
    });
    setMessage('');
    setPasswordStep('email');
    onClose();
  };

  const getPasswordTitle = () => {
    return passwordStep === 'email' ? 'Reset Password' : 'Set New Password';
  };

  const getPasswordButtonText = () => {
    if (passwordLoading) return 'Processing...';
    return passwordStep === 'email' ? 'Send Reset Token' : 'Change Password';
  };

  if (!isOpen) return null;

  return (
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
              onClick={handleClose}
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
  );
}