'use client';
import { useState } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UploadResponse {
  message: string;
  status: string;
}

export default function ManualTransferPayment() {
  const { orderId, status, setStatus } = usePaymentStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!orderId) return <p>Invalid order</p>;

  const handleFilePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => setFile(input.files?.[0] || null);
    input.click();
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    setLoading(true);
    try {
      const res: UploadResponse = await apiClient.uploadManualPayment(orderId, file);
      setStatus('pending');
      alert(res.message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
      <h2 className="text-xl font-semibold mb-4">Manual Transfer Payment</h2>
      <p>Status: <span className="font-medium">{status || 'Not uploaded'}</span></p>
      
      <div className="mt-4 space-x-2">
        <button
          onClick={handleFilePick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {file ? 'Change File' : 'Select File'}
        </button>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Upload Proof'}
        </button>
      </div>
    </div>
  );
}