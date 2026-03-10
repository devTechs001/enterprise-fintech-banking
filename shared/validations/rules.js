// Validation Rules
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export const emailRules = {
  maxLength: 255,
  allowedDomains: [],
};

export const phoneRules = {
  minLength: 10,
  maxLength: 15,
  allowedCountries: ['US', 'CA', 'UK', 'IN'],
};

export const accountNumberRules = {
  length: 12,
  prefix: '',
};

export default passwordRules;
