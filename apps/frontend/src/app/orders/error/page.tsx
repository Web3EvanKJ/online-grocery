'use client';

import { Suspense } from 'react';
import OrderErrorContent from './content';

export default function OrderErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderErrorContent />
    </Suspense>
  );
}
