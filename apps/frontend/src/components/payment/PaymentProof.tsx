// components/payment/PaymentProof.tsx
'use client';
import { useState } from 'react';

interface PaymentProofProps {
  onFileSelect: (file: File) => void;
}

export const PaymentProof = ({ onFileSelect }: PaymentProofProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Upload Payment Proof</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="payment-proof"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="space-y-2">
            <img 
              src={previewUrl} 
              alt="Payment proof preview" 
              className="max-w-xs mx-auto rounded"
            />
            <label
              htmlFor="payment-proof"
              className="text-blue-600 cursor-pointer hover:text-blue-700"
            >
              Change Image
            </label>
          </div>
        ) : (
          <label htmlFor="payment-proof" className="cursor-pointer">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-600">Click to upload payment proof</p>
            <p className="text-sm text-gray-500">JPG, PNG (Max 1MB)</p>
          </label>
        )}
      </div>
    </div>
  );
};