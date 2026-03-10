// Validation Schemas
import * as yup from 'yup';

export const authSchemas = {
  login: yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  }),
  register: yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
  }),
};

export const accountSchemas = {
  createAccount: yup.object({
    accountName: yup.string().required('Account name is required'),
    accountType: yup.string().oneOf(['checking', 'savings', 'investment', 'credit']).required('Account type is required'),
    currency: yup.string().length(3).default('USD'),
  }),
};

export const transactionSchemas = {
  transfer: yup.object({
    accountId: yup.string().uuid().required('Source account is required'),
    destinationAccountId: yup.string().uuid().required('Destination account is required'),
    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    description: yup.string().max(500),
  }),
};

export default authSchemas;
