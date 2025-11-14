'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { ProductCardProps } from '@/lib/types/global/global';

export function ProductCard({
  slug,
  name,
  price,
  originalPrice,
  image,
  category,
  discount,
  discountInputType,
  isb1g1,
  stock,
}: ProductCardProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const isSoldOut = stock === 0;

  return (
    <Link href={`/details/${slug}`} className="block">
      <Card
        className={`flex w-full flex-col justify-between rounded-lg bg-white transition hover:shadow-md ${
          isSoldOut ? 'pointer-events-none opacity-80' : ''
        }`}
      >
        <CardContent className="flex flex-col p-4">
          {/* Product Image */}
          <div className="relative mx-auto mb-3 h-24 w-24">
            <Image
              src={image}
              alt={name}
              fill
              className={`object-contain transition ${
                isSoldOut ? 'grayscale' : ''
              }`}
            />

            {/* Discount Badge */}
            {discount && discountInputType === 'percentage' && (
              <div className="absolute top-1 right-1 rounded bg-sky-500 px-1 py-0.5 text-xs font-semibold text-white opacity-70">
                -{discount}%
              </div>
            )}
            {discount && discountInputType === 'nominal' && (
              <div className="absolute top-1 right-1 rounded bg-sky-500 px-1 py-0.5 text-xs font-semibold text-white opacity-70">
                -Rp {discount}
              </div>
            )}

            {/* b1g1 Badge */}
            {isb1g1 && (
              <div className="absolute right-1 bottom-1 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
                <Gift size={12} className="text-white" />
                B1G1
              </div>
            )}

            {/* Sold Out Overlay */}
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50">
                <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-red-600 shadow">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-1 flex-col justify-between text-center">
            {/* Name + Category */}
            <div className="mb-3 min-h-[2rem]">
              <h3 className="line-clamp-1 text-sm leading-tight font-medium text-gray-800">
                {name}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                {category}
              </p>
            </div>

            {/* Price Section */}
            <div className="flex min-h-[3.5rem] flex-col items-center justify-end">
              <p
                className={`text-lg ${
                  hasDiscount
                    ? 'text-sm text-gray-400 line-through'
                    : 'font-semibold text-sky-600'
                }`}
              >
                Rp{' '}
                {originalPrice?.toLocaleString('id-ID') ||
                  price.toLocaleString('id-ID')}
              </p>

              {hasDiscount && (
                <p className="mt-1 text-lg font-semibold text-sky-600">
                  Rp {price.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
