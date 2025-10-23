'use client';
import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { ErrorModal } from '@/components/ErrorModal';

interface ProductImageUploadProps {
  existingUrls?: string[];
  onChange: (newFiles: File[], remainingUrls: string[]) => void;
  disabled?: boolean;
}

export function ProductImageUpload({
  existingUrls = [],
  onChange,
  disabled,
}: ProductImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingUrls);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 1 * 1024 * 1024; // 1MB

    const invalid = newFiles.filter(
      (f) => !allowedTypes.includes(f.type) || f.size > maxSize
    );
    if (invalid.length) {
      setError(
        `${invalid.map((f) => f.name).join(', ')} is invalid. Only JPG/PNG/GIF < 1MB allowed.`
      );
      e.target.value = '';
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    onChange([...files, ...newFiles], previewUrls);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const isFromDB = index < existingUrls.length;
    if (isFromDB) {
      const updatedUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(updatedUrls);
      onChange(files, updatedUrls);
    } else {
      const fileIndex = index - existingUrls.length;
      const updatedFiles = files.filter((_, i) => i !== fileIndex);
      const updatedPreviews = previewUrls.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      setPreviewUrls(updatedPreviews);
      onChange(updatedFiles, updatedPreviews.slice(0, existingUrls.length));
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-sky-700">
        Product Images
      </label>
      <div className="flex flex-wrap gap-3">
        {previewUrls.map((src, i) => (
          <div key={i} className="relative">
            <img
              src={src}
              alt={`preview-${i}`}
              className="h-20 w-20 rounded border object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {!disabled && (
          <div>
            <input
              type="file"
              id="image-upload"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleFiles}
            />
            <label
              htmlFor="image-upload"
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100"
            >
              <ImagePlus className="h-5 w-5 text-sky-600" />
            </label>
          </div>
        )}
      </div>

      <ErrorModal
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </div>
  );
}
