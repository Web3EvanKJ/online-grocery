export class DecimalHelper {
  static convertToNumber(value: any): any {
    if (this.isDecimal(value)) {
      return value.toNumber();
    }
    if (Array.isArray(value)) {
      return value.map(this.convertToNumber);
    }
    if (value && typeof value === 'object') {
      return this.convertObjectValues(value);
    }
    return value;
  }

  private static isDecimal(value: any): boolean {
    return value && typeof value === 'object' && 'toNumber' in value;
  }

  private static convertObjectValues(obj: any): any {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = this.convertToNumber(obj[key]);
      }
    }
    return result;
  }
}