/**
 * In-memory seed data for the mock API.
 *
 * This module backs `client/mock/mockApiPlugin.js`, which lets the React client
 * run end-to-end (login -> dashboard -> transfers -> security centre) without a
 * PostgreSQL database or the Node API. It is a DEVELOPMENT PREVIEW aid only and
 * must never be enabled in a production build.
 *
 * Security note: none of the values below are secrets. The demo password is
 * checked against a SHA-256 digest purely so the login form exercises a real
 * verification path; it grants access to fabricated data only.
 */

const DEMO_PASSWORD = 'SecureBank!2026';

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();
const daysAgo = (d) => new Date(now - d * 24 * 3600 * 1000).toISOString();

const user = {
  id: 'usr_8f14e45f-ea1a-4b6f-9b64-6f0d2a1c9d70',
  email: 'demo@securebank.test',
  firstName: 'Amina',
  lastName: 'Wanjiru',
  phoneNumber: '+254712345678',
  role: 'user',
  status: 'active',
  emailVerified: true,
  phoneVerified: true,
  mfaEnabled: true,
  mfaMethod: 'authenticator',
  kycStatus: 'verified',
  riskLevel: 'low',
  createdAt: daysAgo(420),
  lastLoginAt: hoursAgo(26),
};

const accounts = [
  {
    id: 'acc_1a2b3c4d-0001-4a1b-9c2d-000000000001',
    accountNumber: '10023456789',
    accountName: 'Everyday Checking',
    accountType: 'checking',
    currency: 'USD',
    balance: 18420.55,
    holdBalance: 250.0,
    availableBalance: 18170.55,
    isPrimary: true,
    isFrozen: false,
    status: 'active',
    dailyTransferLimit: 10000,
    iban: 'GB33BUKB20201555555555',
    openedAt: daysAgo(420),
  },
  {
    id: 'acc_1a2b3c4d-0002-4a1b-9c2d-000000000002',
    accountNumber: '20098765432',
    accountName: 'High Yield Savings',
    accountType: 'savings',
    currency: 'USD',
    balance: 64210.18,
    holdBalance: 0,
    availableBalance: 64210.18,
    interestRate: 0.0425,
    isPrimary: false,
    isFrozen: false,
    status: 'active',
    dailyTransferLimit: 5000,
    openedAt: daysAgo(390),
  },
  {
    id: 'acc_1a2b3c4d-0003-4a1b-9c2d-000000000003',
    accountNumber: '30011223344',
    accountName: 'Investment Portfolio',
    accountType: 'investment',
    currency: 'USD',
    balance: 121875.4,
    holdBalance: 0,
    availableBalance: 121875.4,
    isPrimary: false,
    isFrozen: false,
    status: 'active',
    dailyTransferLimit: 25000,
    openedAt: daysAgo(300),
  },
  {
    id: 'acc_1a2b3c4d-0004-4a1b-9c2d-000000000004',
    accountNumber: '40055667788',
    accountName: 'Platinum Credit',
    accountType: 'credit',
    currency: 'USD',
    balance: -1240.9,
    holdBalance: 0,
    availableBalance: 13759.1,
    creditLimit: 15000,
    isPrimary: false,
    isFrozen: false,
    status: 'active',
    openedAt: daysAgo(210),
  },
];

const merchants = [
  ['Groceries', 'Nakumatt Fresh Market', 'shopping-cart'],
  ['Transport', 'Uber Trip', 'car'],
  ['Dining', 'Java House', 'utensils'],
  ['Utilities', 'Kenya Power', 'zap'],
  ['Salary', 'Acme Corp Payroll', 'briefcase'],
  ['Shopping', 'Amazon Marketplace', 'package'],
  ['Health', 'Aga Khan Pharmacy', 'heart-pulse'],
  ['Subscription', 'Netflix', 'tv'],
  ['Transfer', 'Transfer to Savings', 'arrow-right-left'],
  ['Rent', 'Landlord - Westlands', 'home'],
];

const categories = [...new Set(merchants.map((m) => m[0]))];

/**
 * Deterministic pseudo-random generator so the preview shows the same data on
 * every reload. Deliberately NOT used for anything security sensitive.
 */
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildTransactions() {
  const rand = seeded(20260114);
  const rows = [];
  for (let i = 0; i < 84; i += 1) {
    const [category, merchant] = merchants[Math.floor(rand() * merchants.length)];
    const isCredit = category === 'Salary' || (category === 'Transfer' && rand() > 0.5);
    const amount = isCredit
      ? Math.round((1500 + rand() * 4200) * 100) / 100
      : Math.round((8 + rand() * 640) * 100) / 100;
    const account = accounts[Math.floor(rand() * 3)];
    rows.push({
      id: `txn_${String(i + 1).padStart(4, '0')}`,
      transactionId: `TXN${(1700000000 + i * 9173).toString(36).toUpperCase()}`,
      accountId: account.id,
      accountName: account.accountName,
      type: isCredit ? 'deposit' : 'purchase',
      category,
      merchantName: merchant,
      description: `${merchant} · ${category.toLowerCase()}`,
      amount,
      currency: 'USD',
      direction: isCredit ? 'credit' : 'debit',
      status: i === 3 ? 'pending' : 'completed',
      reference: `REF${(900000 + i).toString(36).toUpperCase()}`,
      createdAt: hoursAgo(i * 7 + rand() * 5),
    });
  }
  return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

const transactions = buildTransactions();

const cards = [
  {
    id: 'crd_0001',
    accountId: accounts[0].id,
    cardType: 'visa',
    label: 'Platinum Debit',
    maskedNumber: '4539 •••• •••• 7421',
    last4: '7421',
    holderName: 'AMINA WANJIRU',
    expiryMonth: 8,
    expiryYear: 29,
    isVirtual: false,
    isPrimary: true,
    status: 'active',
    limits: { online: true, international: true, contactless: true, atm: true },
    spendThisMonth: 2148.6,
    monthlyLimit: 6000,
  },
  {
    id: 'crd_0002',
    accountId: accounts[3].id,
    cardType: 'mastercard',
    label: 'Platinum Credit',
    maskedNumber: '5412 •••• •••• 3308',
    last4: '3308',
    holderName: 'AMINA WANJIRU',
    expiryMonth: 2,
    expiryYear: 28,
    isVirtual: false,
    isPrimary: false,
    status: 'active',
    limits: { online: true, international: false, contactless: true, atm: false },
    spendThisMonth: 1240.9,
    monthlyLimit: 15000,
  },
  {
    id: 'crd_0003',
    accountId: accounts[0].id,
    cardType: 'visa',
    label: 'Virtual · Online only',
    maskedNumber: '4024 •••• •••• 1189',
    last4: '1189',
    holderName: 'AMINA WANJIRU',
    expiryMonth: 11,
    expiryYear: 27,
    isVirtual: true,
    isPrimary: false,
    status: 'active',
    limits: { online: true, international: false, contactless: false, atm: false },
    spendThisMonth: 316.44,
    monthlyLimit: 1500,
  },
];

const beneficiaries = [
  { id: 'ben_0001', name: 'Brian Otieno', accountNumber: '10044556677', bankName: 'Equity Bank', bankCode: 'EQBL', currency: 'USD' },
  { id: 'ben_0002', name: 'Grace Muthoni', accountNumber: '20033445566', bankName: 'KCB Bank', bankCode: 'KCBL', currency: 'USD' },
  { id: 'ben_0003', name: 'Landlord - Westlands', accountNumber: '10099887766', bankName: 'Stanbic', bankCode: 'SBIC', currency: 'USD' },
  { id: 'ben_0004', name: 'Kenya Power', accountNumber: '30022113344', bankName: 'Co-op Bank', bankCode: 'CPBL', currency: 'USD' },
];

const sessions = [
  { id: 'ses_0001', device: 'Chrome · macOS', ip: '41.90.24.11', location: 'Nairobi, KE', current: true, lastActiveAt: hoursAgo(0.05), createdAt: hoursAgo(3) },
  { id: 'ses_0002', device: 'Safari · iPhone 15', ip: '41.90.24.11', location: 'Nairobi, KE', current: false, lastActiveAt: hoursAgo(9), createdAt: daysAgo(2) },
  { id: 'ses_0003', device: 'Firefox · Windows 11', ip: '196.201.14.7', location: 'Mombasa, KE', current: false, lastActiveAt: daysAgo(6), createdAt: daysAgo(11) },
];

const devices = [
  { id: 'dev_0001', name: 'Amina’s MacBook Pro', platform: 'macOS', browser: 'Chrome', trusted: true, lastUsedAt: hoursAgo(0.05), enrolledAt: daysAgo(180) },
  { id: 'dev_0002', name: 'iPhone 15', platform: 'iOS', browser: 'Safari', trusted: true, lastUsedAt: hoursAgo(9), enrolledAt: daysAgo(120) },
  { id: 'dev_0003', name: 'Office Desktop', platform: 'Windows 11', browser: 'Firefox', trusted: false, lastUsedAt: daysAgo(6), enrolledAt: daysAgo(11) },
];

const auditLog = [
  { id: 'aud_0001', action: 'USER_LOGIN', outcome: 'success', ip: '41.90.24.11', location: 'Nairobi, KE', at: hoursAgo(3) },
  { id: 'aud_0002', action: 'MFA_VERIFIED', outcome: 'success', ip: '41.90.24.11', location: 'Nairobi, KE', at: hoursAgo(3) },
  { id: 'aud_0003', action: 'USER_LOGIN', outcome: 'failure', ip: '196.201.14.7', location: 'Mombasa, KE', at: hoursAgo(30) },
  { id: 'aud_0004', action: 'PASSWORD_CHANGED', outcome: 'success', ip: '41.90.24.11', location: 'Nairobi, KE', at: daysAgo(4) },
  { id: 'aud_0005', action: 'BENEFICIARY_ADDED', outcome: 'success', ip: '41.90.24.11', location: 'Nairobi, KE', at: daysAgo(9) },
  { id: 'aud_0006', action: 'CARD_FROZEN', outcome: 'success', ip: '41.90.24.11', location: 'Nairobi, KE', at: daysAgo(17) },
];

const notifications = [
  { id: 'ntf_0001', title: 'New sign-in from Mombasa', description: 'A login attempt from an unrecognised device was blocked by step-up authentication.', type: 'security', severity: 'warning', read: false, at: hoursAgo(30) },
  { id: 'ntf_0002', title: 'Payment received', description: 'You received $4,200.00 from Acme Corp Payroll.', type: 'transaction', severity: 'success', read: false, at: hoursAgo(5) },
  { id: 'ntf_0003', title: 'Card limit reached 80%', description: 'Platinum Credit is at 83% of its monthly limit.', type: 'card', severity: 'info', read: true, at: daysAgo(1) },
  { id: 'ntf_0004', title: 'Statement ready', description: 'Your October statement for Everyday Checking is available.', type: 'document', severity: 'info', read: true, at: daysAgo(3) },
];

const budgets = [
  { category: 'Groceries', budget: 600, spent: 486.2 },
  { category: 'Dining', budget: 300, spent: 331.75 },
  { category: 'Transport', budget: 250, spent: 142.4 },
  { category: 'Utilities', budget: 400, spent: 288.9 },
  { category: 'Shopping', budget: 500, spent: 612.33 },
];

const savingsGoals = [
  { id: 'goal_0001', name: 'Emergency Fund', target: 25000, saved: 16420.55, deadline: daysAgo(-220) },
  { id: 'goal_0002', name: 'Home Deposit', target: 60000, saved: 21875.4, deadline: daysAgo(-700) },
];

const monthlySpend = [
  { month: 'Jun', income: 5200, expenses: 3120 },
  { month: 'Jul', income: 5200, expenses: 3480 },
  { month: 'Aug', income: 5400, expenses: 2980 },
  { month: 'Sep', income: 5400, expenses: 3610 },
  { month: 'Oct', income: 5600, expenses: 3245 },
  { month: 'Nov', income: 5600, expenses: 2148 },
];

const creditScore = {
  score: 782,
  band: 'Excellent',
  change: 14,
  history: [
    { month: 'Jun', score: 731 },
    { month: 'Jul', score: 740 },
    { month: 'Aug', score: 752 },
    { month: 'Sep', score: 761 },
    { month: 'Oct', score: 768 },
    { month: 'Nov', score: 782 },
  ],
  factors: [
    { label: 'Payment history', weight: 35, status: 'good' },
    { label: 'Credit utilisation', weight: 30, status: 'good' },
    { label: 'Length of history', weight: 15, status: 'fair' },
    { label: 'New credit', weight: 10, status: 'good' },
    { label: 'Credit mix', weight: 10, status: 'fair' },
  ],
};

export {
  DEMO_PASSWORD,
  user,
  accounts,
  transactions,
  cards,
  beneficiaries,
  sessions,
  devices,
  auditLog,
  notifications,
  budgets,
  savingsGoals,
  monthlySpend,
  creditScore,
  categories,
};
