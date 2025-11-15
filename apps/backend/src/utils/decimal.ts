// src/utils/decimal.ts
export class DecimalHelper {
  static convertToNumber(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle Prisma Decimal type
    if (typeof value === 'object' && value !== null) {
      // Prisma Decimal has different structures in different versions
      if (typeof value.toNumber === 'function') {
        return value.toNumber();
      }
      if (typeof value.toString === 'function') {
        return parseFloat(value.toString());
      }
      if (value.hasOwnProperty('s') && value.hasOwnProperty('e') && value.hasOwnProperty('c')) {
        // This is a decimal.js structure
        return parseFloat(value.toString());
      }
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => this.convertToNumber(item));
    }

    // Handle objects
    if (typeof value === 'object') {
      const result: any = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          result[key] = this.convertToNumber(value[key]);
        }
      }
      return result;
    }

    // Return primitive values as-is
    return value;
  }

  // Alternative simpler approach
  static simpleConvert(value: any): any {
    if (value === null || value === undefined) return value;
    
    if (Array.isArray(value)) {
      return value.map(item => this.simpleConvert(item));
    }
    
    if (typeof value === 'object') {
      const result: any = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          // Convert Decimal to number
          if (value[key] && typeof value[key] === 'object' && 'toNumber' in value[key]) {
            result[key] = value[key].toNumber();
          } else {
            result[key] = this.simpleConvert(value[key]);
          }
        }
      }
      return result;
    }
    
    return value;
  }
}