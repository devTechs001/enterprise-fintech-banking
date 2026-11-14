/**
 * Seed data for the pages that had no backing endpoints.
 *
 * `Payments`, `Investments`, `Loans` and `Analytics` were listed in the sidebar
 * as "coming soon" because the mock API had nothing to serve them. The components
 * already existed — `components/payments`, `components/investments`,
 * `components/loans` — with no data to render.
 *
 * All money values are integer cents in `*Minor` fields where arithmetic happens;
 * display values stay in whole units so the UI never floats.
 */

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

export const billers = [
  { id: 'bil_0001', name: 'Kenya Power', category: 'Utilities', accountLabel: 'Meter number', minLength: 11, maxLength: 11, currency: 'KES', minAmount: 100, maxAmount: 500000, logo: 'zap' },
  { id: 'bil_0002', name: 'Nairobi Water', category: 'Utilities', accountLabel: 'Account number', minLength: 8, maxLength: 12, currency: 'KES', minAmount: 200, maxAmount: 200000, logo: 'droplets' },
  { id: 'bil_0003', name: 'Safaricom Airtime', category: 'Telecoms', accountLabel: 'Phone number', minLength: 10, maxLength: 13, currency: 'KES', minAmount: 10, maxAmount: 10000, logo: 'smartphone' },
  { id: 'bil_0004', name: 'DStV', category: 'Subscription', accountLabel: 'Smartcard number', minLength: 9, maxLength: 11, currency: 'KES', minAmount: 500, maxAmount: 15000, logo: 'tv' },
  { id: 'bil_0005', name: 'Netflix', category: 'Subscription', accountLabel: 'Reference', minLength: 4, maxLength: 20, currency: 'USD', minAmount: 5, maxAmount: 300, logo: 'film' },
  { id: 'bil_0006', name: 'KRA iTax', category: 'Government', accountLabel: 'PIN', minLength: 11, maxLength: 11, currency: 'KES', minAmount: 100, maxAmount: 10000000, logo: 'landmark' },
  { id: 'bil_0007', name: 'Nation Media School Fees', category: 'Education', accountLabel: 'Student number', minLength: 6, maxLength: 14, currency: 'KES', minAmount: 1000, maxAmount: 500000, logo: 'graduation-cap' },
  { id: 'bil_0008', name: 'Jubilee Insurance', category: 'Insurance', accountLabel: 'Policy number', minLength: 8, maxLength: 16, currency: 'KES', minAmount: 500, maxAmount: 300000, logo: 'shield' },
];

export const scheduledPayments = [
  { id: 'sch_0001', billerId: 'bil_0001', billerName: 'Kenya Power', reference: '34012876543', amount: 4250.00, currency: 'KES', frequency: 'monthly', nextRunAt: daysAhead(4), status: 'active', accountId: 'acc_1a2b3c4d-0001-4a1b-9c2d-000000000001' },
  { id: 'sch_0002', billerId: 'bil_0004', billerName: 'DStV', reference: '0981234567', amount: 3150.00, currency: 'KES', frequency: 'monthly', nextRunAt: daysAhead(11), status: 'active', accountId: 'acc_1a2b3c4d-0001-4a1b-9c2d-000000000001' },
  { id: 'sch_0003', billerId: 'bil_0008', billerName: 'Jubilee Insurance', reference: 'POL-7741209', amount: 12800.00, currency: 'KES', frequency: 'quarterly', nextRunAt: daysAhead(38), status: 'active', accountId: 'acc_1a2b3c4d-0002-4a1b-9c2d-000000000002' },
  { id: 'sch_0004', billerId: 'bil_0002', billerName: 'Nairobi Water', reference: '88210045', amount: 1890.50, currency: 'KES', frequency: 'monthly', nextRunAt: daysAhead(2), status: 'paused', accountId: 'acc_1a2b3c4d-0001-4a1b-9c2d-000000000001' },
];

export const portfolio = {
  asOf: new Date().toISOString(),
  totalValue: 48210.44,
  totalCost: 41850.00,
  dayChange: 412.18,
  dayChangePercent: 0.86,
  totalGain: 6360.44,
  totalGainPercent: 15.2,
  currency: 'USD',
  allocation: [
    { label: 'Equities', value: 27450.10, percent: 56.9, color: '#0b5fff' },
    { label: 'ETFs', value: 12180.00, percent: 25.3, color: '#12b76a' },
    { label: 'Bonds', value: 5940.34, percent: 12.3, color: '#f79009' },
    { label: 'Cash', value: 2640.00, percent: 5.5, color: '#98a2b3' },
  ],
  holdings: [
    { id: 'hld_0001', symbol: 'SFK', name: 'Safaricom PLC', quantity: 4200, avgCost: 1.42, price: 1.71, value: 7182.00, gain: 1218.00, gainPercent: 20.4, sector: 'Telecoms' },
    { id: 'hld_0002', symbol: 'KCB', name: 'KCB Group', quantity: 1850, avgCost: 2.10, price: 2.38, value: 4403.00, gain: 518.00, gainPercent: 13.3, sector: 'Financials' },
    { id: 'hld_0003', symbol: 'EQTY', name: 'Equity Group', quantity: 2100, avgCost: 1.85, price: 2.06, value: 4326.00, gain: 441.00, gainPercent: 11.4, sector: 'Financials' },
    { id: 'hld_0004', symbol: 'EABL', name: 'East African Breweries', quantity: 640, avgCost: 12.40, price: 11.85, value: 7584.00, gain: -352.00, gainPercent: -4.4, sector: 'Consumer' },
    { id: 'hld_0005', symbol: 'VTI', name: 'Vanguard Total Market ETF', quantity: 61, avgCost: 196.20, price: 201.44, value: 12287.84, gain: 319.64, gainPercent: 2.7, sector: 'ETF' },
    { id: 'hld_0006', symbol: 'KEGB', name: 'Kenya Govt Bond 2031', quantity: 10, avgCost: 984.50, price: 995.20, value: 9952.00, gain: 107.00, gainPercent: 1.1, sector: 'Bond' },
  ],
  performance: [
    { period: 'Jan', value: 39200 }, { period: 'Feb', value: 40150 }, { period: 'Mar', value: 38900 },
    { period: 'Apr', value: 41600 }, { period: 'May', value: 43250 }, { period: 'Jun', value: 42100 },
    { period: 'Jul', value: 44380 }, { period: 'Aug', value: 45920 }, { period: 'Sep', value: 44710 },
    { period: 'Oct', value: 46850 }, { period: 'Nov', value: 48210 },
  ],
};

export const loans = [
  {
    id: 'lon_0001', type: 'Personal', product: 'Salary Advance', principal: 12000.00, currency: 'USD',
    annualRate: 11.5, termMonths: 24, emi: 567.42, status: 'active',
    outstanding: 7340.18, paidToDate: 4659.82, nextDueAt: daysAhead(9),
    startDate: daysAgo(305), maturityDate: daysAhead(425), collateral: null,
  },
  {
    id: 'lon_0002', type: 'Mortgage', product: 'Home Loan', principal: 185000.00, currency: 'USD',
    annualRate: 8.25, termMonths: 240, emi: 1579.31, status: 'active',
    outstanding: 162410.55, paidToDate: 22589.45, nextDueAt: daysAhead(17),
    startDate: daysAgo(730), maturityDate: daysAhead(6570), collateral: 'Nairobi — Title 209/1147',
  },
  {
    id: 'lon_0003', type: 'Auto', product: 'Vehicle Finance', principal: 24000.00, currency: 'USD',
    annualRate: 9.75, termMonths: 48, emi: 606.90, status: 'settled',
    outstanding: 0, paidToDate: 24000.00, nextDueAt: null,
    startDate: daysAgo(1600), maturityDate: daysAgo(160), collateral: 'KCY 421J',
  },
];

/** Products offered, for the comparison table and application form. */
export const loanProducts = [
  { id: 'prd_personal', type: 'Personal', name: 'Personal Loan', minAmount: 1000, maxAmount: 50000, rateFrom: 10.5, rateTo: 16.0, terms: [12, 24, 36, 48], processingFeePercent: 1.0, requiresCollateral: false, decisionHours: 24 },
  { id: 'prd_salary', type: 'Personal', name: 'Salary Advance', minAmount: 200, maxAmount: 8000, rateFrom: 8.0, rateTo: 12.0, terms: [3, 6, 12], processingFeePercent: 0.5, requiresCollateral: false, decisionHours: 2 },
  { id: 'prd_mortgage', type: 'Mortgage', name: 'Home Loan', minAmount: 25000, maxAmount: 750000, rateFrom: 7.75, rateTo: 11.0, terms: [120, 180, 240, 300], processingFeePercent: 1.5, requiresCollateral: true, decisionHours: 168 },
  { id: 'prd_auto', type: 'Auto', name: 'Vehicle Finance', minAmount: 5000, maxAmount: 120000, rateFrom: 9.0, rateTo: 13.5, terms: [24, 36, 48, 60], processingFeePercent: 1.25, requiresCollateral: true, decisionHours: 72 },
  { id: 'prd_business', type: 'Business', name: 'Business Working Capital', minAmount: 10000, maxAmount: 400000, rateFrom: 11.0, rateTo: 18.0, terms: [12, 24, 36], processingFeePercent: 2.0, requiresCollateral: false, decisionHours: 120 },
];

/** Monthly income/expense series for the analytics page. */
export const analytics = {
  netWorth: 251475.67,
  netWorthChange: 3.4,
  savingsRate: 24.8,
  cashflow: [
    { month: 'Jun', income: 5200, expenses: 3120 }, { month: 'Jul', income: 5200, expenses: 3480 },
    { month: 'Aug', income: 5450, expenses: 3210 }, { month: 'Sep', income: 5200, expenses: 3890 },
    { month: 'Oct', income: 5600, expenses: 3340 }, { month: 'Nov', income: 5600, expenses: 2970 },
  ],
  byCategory: [
    { category: 'Housing', amount: 1580.00, percent: 32, color: '#0b5fff' },
    { category: 'Groceries', amount: 640.50, percent: 13, color: '#12b76a' },
    { category: 'Transport', amount: 410.20, percent: 8, color: '#f79009' },
    { category: 'Utilities', amount: 520.75, percent: 11, color: '#9e77ed' },
    { category: 'Dining', amount: 385.40, percent: 8, color: '#f04438' },
    { category: 'Subscriptions', amount: 190.00, percent: 4, color: '#06aed4' },
    { category: 'Other', amount: 1180.30, percent: 24, color: '#98a2b3' },
  ],
  topMerchants: [
    { merchant: 'Naivas Supermarket', spend: 412.30, visits: 9 },
    { merchant: 'Uber', spend: 186.40, visits: 14 },
    { merchant: 'Java House', spend: 142.80, visits: 6 },
    { merchant: 'Kenya Power', spend: 128.55, visits: 1 },
    { merchant: 'Safaricom', spend: 96.00, visits: 4 },
  ],
  // Read by the dashboard Overview panel. Deliberately short of target so the
  // panel exercises its "behind schedule" state rather than only the happy one.
  savingsGoal: {
    name: 'Emergency fund', current: 4820.50, target: 12000,
    deadline: new Date(new Date().getFullYear() + 1, 5, 30).toISOString(),
  },
  budgetProgress: [
    { category: 'Groceries', budget: 800, spent: 640.50 },
    { category: 'Dining', budget: 300, spent: 385.40 },
    { category: 'Transport', budget: 500, spent: 410.20 },
    { category: 'Utilities', budget: 600, spent: 520.75 },
    { category: 'Subscriptions', budget: 150, spent: 190.00 },
  ],
};

/** Help-centre content. Static by design — it must still render if the API is down. */
export const helpTopics = [
  {
    id: 'sec', icon: 'shield', title: 'Security & privacy',
    summary: 'Protect your account, recognise phishing, and recover access safely.',
    articles: [
      { title: 'Set up two-factor authentication', body: 'Security → Authentication → Enable authenticator app. Scan the QR code with any TOTP app, then enter the 6-digit code to confirm. Write the recovery codes down and store them offline — they are shown once.' },
      { title: 'Recognise a phishing attempt', body: 'SecureBank never asks for your password, OTP or recovery codes by phone, SMS or email. Never sign in from a link in a message. Check the address bar before entering credentials.' },
      { title: 'If you suspect your account is compromised', body: 'Change your password immediately — this signs out every other device. Then freeze affected cards under Cards, and review Security → Activity for anything you do not recognise.' },
      { title: 'Review your active sessions', body: 'Security → Sessions lists every signed-in device with its IP and last activity. You can revoke any session individually, or all of them at once.' },
    ],
  },
  {
    id: 'pay', icon: 'credit-card', title: 'Payments & transfers',
    summary: 'Send money, pay bills, schedule payments and understand limits.',
    articles: [
      { title: 'Why is a new beneficiary unavailable for 24 hours?', body: 'New payees enter a cooling-off period before they can receive money. This limits the damage if someone takes over your session, because they cannot add their own account and drain it immediately. Confirmation is sent out of band.' },
      { title: 'Transfer limits', body: 'Your per-transaction and daily limits are shown on each account. Limits are re-checked by the server when the payment is executed — the figure shown in the app is an estimate, not an authorisation.' },
      { title: 'Scheduled payments', body: 'Payments → Scheduled lets you set up recurring bill payments. A paused schedule keeps its configuration but does not run until you resume it.' },
      { title: 'A payment I did not make', body: 'Report it immediately from the transaction detail screen. Do not wait — reversal windows are limited and the audit trail is time-sensitive.' },
    ],
  },
  {
    id: 'card', icon: 'wallet', title: 'Cards',
    summary: 'Freeze a card, change limits, and use virtual cards safely.',
    articles: [
      { title: 'Freeze and unfreeze', body: 'Cards → select a card → Freeze. Freezing takes effect immediately and blocks new authorisations; already-authorised transactions still settle.' },
      { title: 'Virtual cards for online shopping', body: 'A virtual card carries its own limit and can be discarded without replacing your physical card. Use one per merchant where you can.' },
      { title: 'Card controls', body: 'Contactless, online and international payments can each be switched off independently. Turning off international payments is the single most effective control if you do not travel.' },
    ],
  },
  {
    id: 'acc', icon: 'landmark', title: 'Accounts & statements',
    summary: 'Statements, balances, holds and account types.',
    articles: [
      { title: 'Balance vs available balance', body: 'A hold reserves money that has been authorised but not yet settled. Your available balance is what you can spend now. Both are shown on every account.' },
      { title: 'Download a statement', body: 'Accounts → select an account → Statements. Statements are generated for the period you choose and can be exported.' },
      { title: 'Closing an account', body: 'An account with a non-zero balance or an active scheduled payment cannot be closed. Clear both first, then request closure.' },
    ],
  },
];

export const faqs = [
  { q: 'Is this a real bank?', a: 'No. This is a demonstration build running entirely against an in-memory mock API. No real money moves, no data leaves your browser session, and the credentials shown on the sign-in page are fixed demo values.' },
  { q: 'Where is my data stored?', a: 'In the preview, in memory on the dev server — it resets on restart. In the real product, secrets are hashed with bcrypt, refresh tokens are stored only as SHA-256 digests, and card numbers and TOTP secrets are encrypted at rest with AES-256-GCM.' },
  { q: 'Why does the sign-in page show me a 6-digit code?', a: 'Because the preview has no authenticator app to generate one. A production API never returns a live code — this affordance exists only in mock mode and the UI says so.' },
  { q: 'How do I get locked out?', a: 'Five incorrect passwords locks the demo account for 15 minutes. That mirrors the real rate limiting, so you can see the lockout behaviour.' },
];

export default { billers, scheduledPayments, portfolio, loans, loanProducts, analytics, helpTopics, faqs };
