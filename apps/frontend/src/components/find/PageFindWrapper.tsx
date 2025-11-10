'use client';

import { Suspense } from 'react';
import { PageFind } from './PageFind';

export function PageFindWrapper() {
  return (
    <Suspense
      fallback={
        <p className="mt-10 text-center text-gray-500">
          Loading search results...
        </p>
      }
    >
      <PageFind />
    </Suspense>
  );
}
