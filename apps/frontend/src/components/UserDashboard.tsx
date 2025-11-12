'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '../lib/types';

export default function DashboarduserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-6">Dashboard for user ID:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Account Info</h3>
              <p className="text-blue-700">Email: {user?.email}</p>
              <p className="text-blue-700">Role: {user?.role}</p>
              <p className="text-blue-700">Status: {user?.is_verified ? 'Verified' : 'Pending'}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Quick Actions</h3>
              <button className="block mt-2 text-green-700 hover:text-green-900">
                Edit Profile
              </button>
              <button className="block mt-2 text-green-700 hover:text-green-900">
                Edit Adresses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}