'use client';

import { FormFieldProps } from '@/lib/types/global/global';
import React from 'react';

export const FormField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  type = 'text',
  error,
  touched,
  disabled,
}: FormFieldProps) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : Array.isArray(error)
        ? error.join(', ')
        : undefined;

  const isTouched = typeof touched === 'boolean' ? touched : !!touched;

  const showError = isTouched && !!errorMessage;

  return (
    <div className="mb-1 flex flex-col">
      <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
          className={`w-full rounded-lg border p-2 text-sm text-gray-800 transition-all focus:ring-1 focus:outline-none ${showError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:border-sky-400 focus:ring-sky-400'} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border p-2 text-sm text-gray-800 transition-all focus:ring-1 focus:outline-none ${showError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:border-sky-400 focus:ring-sky-400'} `}
        />
      )}
      {disabled && (
        <div className="text-xs font-medium text-gray-500">(locked)</div>
      )}
      <div className="mt-1 min-h-[10px]">
        {showError && <p className="text-xs text-red-500">{errorMessage}</p>}
      </div>
    </div>
  );
};
