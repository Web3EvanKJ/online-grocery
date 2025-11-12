'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ 
    email: '', 
    name: '', 
    token: '', 
    password: '',
    newPassword: '' 
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let url = '';
      let body = {};

      if (mode === 'register') {
        url = 'http://localhost:8000/api/auth/register';
        body = { email: formData.email, name: formData.name };
      } else if (mode === 'verify') {
        url = 'http://localhost:8000/api/auth/verify-email';
        body = { token: formData.token, password: formData.password };
      } else if (mode === 'forgot-password') {
        url = 'http://localhost:8000/api/auth/forgot-password';
        body = { email: formData.email };
      } else if (mode === 'reset-password') {
        url = 'http://localhost:8000/api/auth/reset-password';
        body = { token: formData.token, password: formData.newPassword };
      } else {
        url = 'http://localhost:8000/api/auth/login';
        body = { email: formData.email, password: formData.password };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      if (mode === 'register') {
        setMessage('Verification email sent! Check your inbox.');
        setMode('verify');
        setFormData(prev => ({ ...prev, name: '' }));
      } else if (mode === 'forgot-password') {
        setMessage('Reset token sent to your email!');
        setMode('reset-password');
        setFormData(prev => ({ ...prev, email: '' }));
      } else if (mode === 'reset-password') {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => setMode('login'), 2000);
        setFormData({ email: '', name: '', token: '', password: '', newPassword: '' });
      } else if (mode === 'verify' || mode === 'login') {
        localStorage.setItem('token', data.token);
        setMessage('Success! Redirecting...');
        router.push(`/dashboarduser/${data.user.uuid}`);
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({ email: '', name: '', token: '', password: '', newPassword: '' });
    setMessage('');
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign in';
      case 'register': return 'Create account';
      case 'verify': return 'Verify email';
      case 'forgot-password': return 'Reset password';
      case 'reset-password': return 'Set new password';
      default: return 'Sign in';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch (mode) {
      case 'login': return 'Sign in';
      case 'register': return 'Register';
      case 'verify': return 'Verify Email';
      case 'forgot-password': return 'Send Reset Link';
      case 'reset-password': return 'Reset Password';
      default: return 'Submit';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {getTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'verify' && 'Check your email for verification token'}
            {mode === 'reset-password' && 'Enter the token from your email and new password'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email field - show for login, register, forgot-password */}
            {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Name field - only for register */}
            {mode === 'register' && (
              <div>
                <input
                  name="name"
                  type="text"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Token field - for verify and reset-password */}
            {(mode === 'verify' || mode === 'reset-password') && (
              <div>
                <input
                  name="token"
                  type="text"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={mode === 'verify' ? 'Verification token' : 'Reset token'}
                  value={formData.token}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Password fields */}
            {mode === 'login' && (
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {mode === 'verify' && (
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create password (6-10 chars)"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {mode === 'reset-password' && (
              <div>
                <input
                  name="newPassword"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New password (6-10 chars)"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {message && (
            <div className={`rounded-md p-3 text-sm text-center ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </button>
          </div>

          <div className="text-center space-y-2">
            {/* Login mode links */}
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    resetForm();
                  }}
                  className="text-blue-600 hover:text-blue-500 text-sm block w-full"
                >
                  Don't have an account? Sign up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-password');
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-gray-500 text-sm block w-full"
                >
                  Forgot your password?
                </button>
              </>
            )}

            {/* Register/Verify mode links */}
            {(mode === 'register' || mode === 'verify') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Already have an account? Sign in
              </button>
            )}

            {/* Forgot password mode links */}
            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Back to login
              </button>
            )}

            {/* Reset password mode links */}
            {mode === 'reset-password' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot-password');
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Resend reset token
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}