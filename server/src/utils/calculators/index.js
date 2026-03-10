/**
 * Calculate transaction fee based on type and amount
 * @param {string} type - Transaction type
 * @param {number} amount - Transaction amount
 * @param {string} accountType - Account type
 * @returns {Promise<number>} Fee amount
 */
export const calculateFee = async (type, amount, accountType) => {
  const feeStructures = {
    transfer: {
      checking: { percentage: 0.001, flat: 0, max: 50 },
      savings: { percentage: 0.002, flat: 0, max: 75 },
    },
    withdrawal: {
      checking: { percentage: 0, flat: 0, max: 0 },
      savings: { percentage: 0, flat: 5, max: 5 },
    },
    payment: {
      checking: { percentage: 0, flat: 0, max: 0 },
      credit: { percentage: 0.02, flat: 0, max: 100 },
    },
    purchase: {
      checking: { percentage: 0, flat: 0, max: 0 },
      credit: { percentage: 0.015, flat: 0, max: 50 },
    },
  };

  const structure = feeStructures[type]?.[accountType] || { percentage: 0, flat: 0, max: 0 };
  
  const percentageFee = amount * structure.percentage;
  const totalFee = Math.min(percentageFee + structure.flat, structure.max);
  
  return parseFloat(totalFee.toFixed(2));
};

/**
 * Calculate interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Annual interest rate
 * @param {number} time - Time in years
 * @param {string} type - Interest type (simple/compound)
 * @param {number} compoundsPerYear - Number of times compounded per year
 * @returns {number} Interest amount
 */
export const calculateInterest = (principal, rate, time, type = 'simple', compoundsPerYear = 12) => {
  if (type === 'compound') {
    const amount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * time);
    return amount - principal;
  }
  
  return principal * rate * time;
};

/**
 * Calculate EMI (Equated Monthly Installment)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate
 * @param {number} months - Loan tenure in months
 * @returns {number} Monthly EMI
 */
export const calculateEMI = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;
  
  if (monthlyRate === 0) {
    return principal / months;
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  
  return parseFloat(emi.toFixed(2));
};

export default {
  calculateFee,
  calculateInterest,
  calculateEMI,
};
