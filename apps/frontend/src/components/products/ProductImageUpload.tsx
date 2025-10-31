'use client';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { ErrorModal } from '@/components/ErrorModal';
import { ProductImageUploadProps } from '@/lib/types/products/products';

export function ProductImageUpload({
  existingUrls = [],
  onChange,
  disabled,
}: ProductImageUploadProps) {
  // backend URLs that exist on the server
  const [backendUrls, setBackendUrls] = useState<string[]>(existingUrls);

  // new File objects that user picked this session
  const [files, setFiles] = useState<File[]>([]);

  const [blobPreviews, setBlobPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createdBlobs = useRef<string[]>([]);

  // sync backendUrls when prop changes (editing different product or refreshed data)
  useEffect(() => {
    setBackendUrls(existingUrls || []);
  }, [existingUrls]);

  // cleanup on unmount - revoke created object URLs
  useEffect(() => {
    return () => {
      createdBlobs.current.forEach((b) => URL.revokeObjectURL(b));
      createdBlobs.current = [];
    };
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) {
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 1 * 1024 * 1024; // 1MB

    const invalid = incoming.filter(
      (f) => !allowedTypes.includes(f.type) || f.size > maxSize
    );
    if (invalid.length) {
      setError(
        `${invalid.map((f) => f.name).join(', ')} is invalid. Only JPG/PNG/GIF < 1MB allowed.`
      );
      e.target.value = '';
      return;
    }

    // filter duplicates by name+size against existing files
    const uniqueNewFiles = incoming.filter(
      (nf) => !files.some((f) => f.name === nf.name && f.size === nf.size)
    );

    if (uniqueNewFiles.length === 0) {
      e.target.value = '';
      return;
    }

    // create previews for the new files
    const newBlobs = uniqueNewFiles.map((f) => {
      const url = URL.createObjectURL(f);
      createdBlobs.current.push(url);
      return url;
    });

    const updatedFiles = [...files, ...uniqueNewFiles];
    const updatedBlobPreviews = [...blobPreviews, ...newBlobs];

    setFiles(updatedFiles);
    setBlobPreviews(updatedBlobPreviews);

    onChange(updatedFiles, backendUrls);

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    if (index < backendUrls.length) {
      // from db
      const updatedBackend = backendUrls.filter((_, i) => i !== index);
      setBackendUrls(updatedBackend);
      onChange(files, updatedBackend);
    } else {
      // still blob preview
      const blobIndex = index - backendUrls.length;
      const removedBlob = blobPreviews[blobIndex];
      if (removedBlob) {
        URL.revokeObjectURL(removedBlob);
        createdBlobs.current = createdBlobs.current.filter(
          (b) => b !== removedBlob
        );
      }

      const updatedBlobPreviews = blobPreviews.filter(
        (_, i) => i !== blobIndex
      );
      const updatedFiles = files.filter((_, i) => i !== blobIndex);

      setBlobPreviews(updatedBlobPreviews);
      setFiles(updatedFiles);

      onChange(updatedFiles, backendUrls);
    }
  };

  // combine backend + blob previews for rendering
  const renderedPreviews = [...backendUrls, ...blobPreviews];

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-sky-700">
        Product Images
      </label>

      <div className="flex flex-wrap gap-3">
        {renderedPreviews.map((src, i) => (
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
