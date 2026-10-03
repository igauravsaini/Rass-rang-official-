/**
 * Indian Rupee Number Formatter
 * E.g., formatINR(1699) -> "₹1,699"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format raw number in Indian numbering format
 * E.g., formatIndianNumber(1500) -> "1,500"
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
