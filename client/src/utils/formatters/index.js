/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

/**
 * Format account number for display
 * @param {string} accountNumber - Account number to format
 * @returns {string} Formatted account number
 */
export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  const lastFour = accountNumber.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
};

/**
 * Format card number for display
 * @param {string} cardNumber - Card number to format
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.match(/.{1,4}/g)?.join(' ') || cardNumber;
};

/**
 * Format expiry date
 * @param {string} expiryDate - Expiry date in MM/YY or MMYYYY format
 * @returns {string} Formatted expiry date
 */
export const formatExpiryDate = (expiryDate) => {
  if (!expiryDate) return '';
  const cleaned = expiryDate.replace(/\D/g, '');
  if (cleaned.length === 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return expiryDate;
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
};

/**
 * Format date and time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with abbreviations (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatCompactNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
};
