/**
 * Utility functions for safely formatting prices and handling price-related operations
 */

/**
 * Safely formats a price value to a fixed number of decimal places
 * @param price - The price value (can be string, number, or undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export const formatPrice = (price: string | number | undefined | null, decimals: number = 2): string => {
  const numericPrice = Number(price || 0);
  
  // Handle edge cases
  if (isNaN(numericPrice) || !isFinite(numericPrice)) {
    return '0.00';
  }
  
  return numericPrice.toFixed(decimals);
};

/**
 * Safely formats a price with currency symbol
 * @param price - The price value
 * @param currency - Currency code (default: 'USD')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string with currency symbol
 */
export const formatCurrency = (
  price: string | number | undefined | null, 
  currency: string = 'USD', 
  decimals: number = 2
): string => {
  const formattedPrice = formatPrice(price, decimals);
  
  switch (currency.toUpperCase()) {
    case 'USD':
      return `$${formattedPrice}`;
    case 'EUR':
      return `€${formattedPrice}`;
    case 'GBP':
      return `£${formattedPrice}`;
    case 'CAD':
      return `C$${formattedPrice}`;
    default:
      return `${formattedPrice} ${currency}`;
  }
};

/**
 * Safely parses a price value to a number
 * @param price - The price value
 * @returns Numeric price value or 0 if invalid
 */
export const parsePrice = (price: string | number | undefined | null): number => {
  const numericPrice = Number(price || 0);
  
  if (isNaN(numericPrice) || !isFinite(numericPrice)) {
    return 0;
  }
  
  return numericPrice;
};

/**
 * Calculates percentage discount between original and sale prices
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage (0-100)
 */
export const calculateDiscount = (
  originalPrice: string | number | undefined | null,
  salePrice: string | number | undefined | null
): number => {
  const original = parsePrice(originalPrice);
  const sale = parsePrice(salePrice);
  
  if (original <= 0 || sale <= 0 || sale >= original) {
    return 0;
  }
  
  return Math.round(((original - sale) / original) * 100);
};

/**
 * Validates if a price is valid
 * @param price - The price value to validate
 * @returns True if valid, false otherwise
 */
export const isValidPrice = (price: string | number | undefined | null): boolean => {
  const numericPrice = Number(price);
  return !isNaN(numericPrice) && isFinite(numericPrice) && numericPrice >= 0;
};

/**
 * Safely adds two price values
 * @param price1 - First price
 * @param price2 - Second price
 * @returns Sum of the prices
 */
export const addPrices = (
  price1: string | number | undefined | null,
  price2: string | number | undefined | null
): number => {
  return parsePrice(price1) + parsePrice(price2);
};

/**
 * Safely multiplies a price by a factor
 * @param price - The price value
 * @param factor - Multiplication factor
 * @returns Multiplied price
 */
export const multiplyPrice = (
  price: string | number | undefined | null,
  factor: number
): number => {
  return parsePrice(price) * (factor || 1);
};

export default {
  formatPrice,
  formatCurrency,
  parsePrice,
  calculateDiscount,
  isValidPrice,
  addPrices,
  multiplyPrice
};
