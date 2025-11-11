// src/utils/helpers.ts
import crypto from 'crypto';

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateRandomCode = (length: number): string => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};