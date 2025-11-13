'use client';

import { useState, useRef } from 'react';

interface ManualPaymentUploadProps {
  onSubmit: (proofImage: File) => Promise<boolean>;
  isLoading: boolean;
}

export default function ManualPaymentUpload({ onSubmit, isLoading }: ManualPaymentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid file type (JPG, PNG, PDF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a payment proof file');
      return;
    }

    // Simulate upload progress (in real app, this would be from Cloudinary)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const success = await onSubmit(selectedFile);
      
      if (success) {
        setUploadProgress(100);
        // Reset form after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Payment Proof</h3>
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="payment-proof"
          />
          
          {!selectedFile ? (
            <label htmlFor="payment-proof" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center gap-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Click to upload payment proof</p>
                  <p className="text-sm text-gray-500">JPG, PNG, or PDF (Max 5MB)</p>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              {previewUrl ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Payment proof preview"
                    className="max-h-48 rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-gray-700">{selectedFile.name}</span>
                </div>
              )}
              
              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {uploadProgress < 100 ? 'Uploading...' : 'Upload Complete!'}
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={removeFile}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Change File
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || uploadProgress > 0}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Transfer to one of the bank accounts listed above</li>
          <li>• Upload clear proof of transfer (screenshot or photo)</li>
          <li>• Make sure the transfer amount matches your order total</li>
          <li>• Payment verification may take 1-2 business hours</li>
        </ul>
      </div>
    </div>
  );
}