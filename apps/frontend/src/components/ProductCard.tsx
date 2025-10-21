'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

type Product = {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  discount?: number;
  stock?: boolean;
  distance?: number;
};

export function ProductCard({
  name,
  price,
  originalPrice,
  image,
  category,
  discount,
  distance,
}: Product) {
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <Card className="flex w-full flex-col justify-between rounded-lg bg-white transition hover:shadow-md">
      <CardContent className="flex flex-col p-4">
        {/* === Product Image === */}
        <div className="relative mx-auto mb-3 h-24 w-24">
          <Image src={image} alt={name} fill className="object-contain" />
          {discount && (
            <div className="absolute top-1 right-1 rounded bg-blue-500 px-1 py-0.5 text-xs font-semibold text-white">
              -{discount}%
            </div>
          )}
        </div>

        {/* === Product Info === */}
        <div className="flex flex-1 flex-col justify-between text-center">
          {/* Name + Category */}
          <div className="mb-3 min-h-[4rem]">
            <h3 className="line-clamp-2 text-sm leading-tight font-medium text-gray-800">
              {name}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{category}</p>
          </div>

          {/* Distance */}
          {distance !== undefined && (
            <div className="mb-2 flex items-center justify-center text-xs text-gray-500">
              <MapPin size={14} className="mr-1 text-blue-500" />
              <span>{distance.toFixed(1)} KM</span>
            </div>
          )}

          {/* === Price Section === */}
          <div className="flex min-h-[3.5rem] flex-col items-center justify-end">
            <p
              className={`text-lg ${
                hasDiscount
                  ? 'text-sm text-gray-400 line-through'
                  : 'font-semibold text-blue-600'
              }`}
            >
              Rp{' '}
              {originalPrice?.toLocaleString('id-ID') ||
                price.toLocaleString('id-ID')}
            </p>

            {hasDiscount && (
              <p className="mt-1 text-lg font-semibold text-blue-600">
                Rp {price.toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
