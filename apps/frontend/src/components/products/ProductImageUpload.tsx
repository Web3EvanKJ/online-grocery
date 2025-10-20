'use client';

import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from 'formik';

export function ProductImageUpload({
  previews,
  setPreviews,
  setErrorModal,
  setFieldValue,
  setTouched,
  values,
  errors,
  touched,
  formikRef,
  isSuperAdmin,
}: any) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const maxSize = 1 * 1024 * 1024;

    const validFiles: File[] = [];
    const err: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) {
        err.push(`${file.name} invalid format. Use JPG, PNG, GIF`);
        continue;
      }
      if (file.size > maxSize) {
        err.push(`${file.name} exceeds 1MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (err.length > 0) {
      setErrorModal({ open: true, message: err.join('\n') });
      e.target.value = '';
      return;
    }

    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev: string[]) => [...prev, ...newPreviews]);
    setFieldValue('images', [...values.images, ...validFiles]);
    setTouched({ images: true });
    setTimeout(() => formikRef.current?.validateField('images'), 0);
  };

  const handleRemove = (index: number) => {
    setPreviews((prev: string[]) => prev.filter((_, i) => i !== index));
    setFieldValue(
      'images',
      values.images.filter((_: any, i: number) => i !== index)
    );
    setTimeout(() => formikRef.current?.validateField('images'), 0);
  };

  return (
    <div>
      <Label className="text-sky-700">
        Product Images <span className="text-red-500">*</span>
      </Label>

      <div className="mt-1 flex flex-wrap items-center gap-3">
        <label
          htmlFor="fileUpload"
          className={`cursor-pointer rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 ${
            !isSuperAdmin && 'cursor-not-allowed opacity-60'
          }`}
        >
          Upload Images
        </label>

        <input
          id="fileUpload"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif"
          onChange={handleImageChange}
          disabled={!isSuperAdmin}
          className="hidden"
        />
      </div>

      {previews.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {previews.map((src: string, index: number) => (
            <div key={index} className="group relative">
              <Image
                src={src}
                alt={`Preview ${index}`}
                width={200}
                height={200}
                className="rounded-md border object-cover"
              />
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-400 italic">No image selected</p>
      )}

      {touched.images && errors.images && (
        <ErrorMessage
          name="images"
          component="p"
          className="text-sm text-red-500"
        />
      )}
    </div>
  );
}
