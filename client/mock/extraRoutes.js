/**
 * Mock routes for the pages that previously had none.
 *
 * Exported as a factory rather than a bare array so it can share the live
 * `state` and audit logger of the main plugin — scheduled payments and loan
 * applications mutate state, and every mutation is audited exactly as the
 * real endpoints would be.
 *
 * Money handling follows the same rule as the rest of the mock: compare and
 * add in integer cents, never in floating point. `cents()` / `units()` do the
 * conversion in one place so a rounding difference cannot creep in per-route.
 */

import {
  billers,
  scheduledPayments,
  portfolio,
  loans,
  loanProducts,
  analytics,
  helpTopics,
  faqs,
} from './extraData.js';

const cents = (amount) => Math.round(Number(amount) * 100);
const units = (minor) => Number(minor) / 100;

/**
 * Spendable balance, in integer minor units.
 *
 * For a debit account that is `balance - hold`. For a credit account the balance
 * is negative (it is what you owe), so spendable is `creditLimit - owed - hold`;
 * applying the debit formula there would report a negative allowance on an account
 * with thousands available.
 *
 * All money arithmetic here stays in integers. Multiplying floats and rounding at
 * the end is how a ledger drifts by a cent per transaction.
 */
const availableOf = (account) => {
  const hold = cents(account.holdBalance || 0);
  if (account.accountType === 'credit') {
    return cents(account.creditLimit || 0) + cents(account.balance || 0) - hold;
  }
  return cents(account.balance || 0) - hold;
};

/** Recompute the derived field after any movement, so it can never go stale. */
const syncAvailable = (account) => {
  account.availableBalance = units(availableOf(account));
};

const UNAUTHORIZED = [401, { success: false, message: 'Access token required.' }];

const nextId = (prefix, existing) => {
  const max = existing.reduce((acc, item) => {
    const n = parseInt(String(item.id).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}_${String(max + 1).padStart(4, '0')}`;
};

/**
 * Amortisation schedule (equal instalments).
 * Integer-cent arithmetic per period, with the residual pushed into the final
 * instalment so the schedule always sums exactly to principal + interest.
 */
const buildSchedule = (principal, annualRatePercent, termMonths, startDate = new Date()) => {
  const monthlyRate = Number(annualRatePercent) / 100 / 12;
  const principalMinor = cents(principal);

  let emiMinor;
  if (monthlyRate === 0) {
    emiMinor = Math.round(principalMinor / termMonths);
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    emiMinor = Math.round((principalMinor * monthlyRate * factor) / (factor - 1));
  }

  const rows = [];
  let balance = principalMinor;
  let totalInterest = 0;

  for (let period = 1; period <= termMonths; period += 1) {
    const interest = Math.round(balance * monthlyRate);
    // Final instalment absorbs the rounding residual.
    const principalPart = period === termMonths ? balance : Math.min(emiMinor - interest, balance);
    const payment = interest + principalPart;
    balance -= principalPart;
    totalInterest += interest;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + period);

    rows.push({
      period,
      dueDate: dueDate.toISOString().slice(0, 10),
      payment: units(payment),
      principal: units(principalPart),
      interest: units(interest),
      balance: units(Math.max(0, balance)),
    });
  }

  return { emi: units(emiMinor), totalInterest: units(totalInterest), totalPayable: units(principalMinor + totalInterest), schedule: rows };
};

export const createExtraRoutes = ({ state, logAudit }) => {
  if (!state.scheduledPayments) state.scheduledPayments = scheduledPayments.map((s) => ({ ...s }));
  if (!state.loans) state.loans = loans.map((l) => ({ ...l }));
  if (!state.loanApplications) state.loanApplications = [];

  return [
    /* ------------------------------ billers ------------------------------ */
    ['GET', /^\/billers$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const category = ctx.query.get('category');
      const items = category && category !== 'all' ? billers.filter((b) => b.category === category) : billers;
      return [200, { success: true, data: { billers: items, categories: [...new Set(billers.map((b) => b.category))] } }];
    }],

    /* ------------------------- scheduled payments ------------------------ */
    ['GET', /^\/scheduled-payments$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      return [200, {
        success: true,
        data: {
          scheduledPayments: state.scheduledPayments,
          totalUpcoming: units(state.scheduledPayments
            .filter((s) => s.status === 'active')
            .reduce((sum, s) => sum + cents(s.amount), 0)),
        },
      }];
    }],

    ['POST', /^\/scheduled-payments$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const { billerId, reference, amount, frequency, accountId, startDate } = ctx.body || {};
      const biller = billers.find((b) => b.id === billerId);
      if (!biller) return [422, { success: false, message: 'Unknown biller.' }];
      if (!reference || String(reference).length < biller.minLength) {
        return [422, { success: false, message: `${biller.accountLabel} must be at least ${biller.minLength} characters.` }];
      }
      const valueMinor = cents(amount);
      if (!Number.isFinite(valueMinor) || valueMinor <= 0) return [422, { success: false, message: 'Enter an amount greater than zero.' }];
      if (valueMinor < cents(biller.minAmount)) return [422, { success: false, message: `${biller.name} requires a minimum of ${biller.minAmount} ${biller.currency}.` }];

      const account = state.accounts.find((a) => a.id === accountId);
      if (!account) return [422, { success: false, message: 'Choose a valid source account.' }];

      const entry = {
        id: nextId('sch', state.scheduledPayments),
        billerId, billerName: biller.name, reference: String(reference),
        amount: units(valueMinor), currency: biller.currency,
        frequency: frequency || 'monthly',
        nextRunAt: startDate || new Date(Date.now() + 86400000).toISOString(),
        status: 'active', accountId,
      };
      state.scheduledPayments.push(entry);
      logAudit('SCHEDULED_PAYMENT_CREATED', 'success', { id: entry.id, biller: entry.billerName });
      return [201, { success: true, data: { scheduledPayment: entry } }];
    }],

    ['PATCH', /^\/scheduled-payments\/([^/]+)$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const entry = state.scheduledPayments.find((s) => s.id === ctx.params[0]);
      if (!entry) return [404, { success: false, message: 'Scheduled payment not found.' }];
      const { status } = ctx.body || {};
      if (status && !['active', 'paused', 'cancelled'].includes(status)) {
        return [422, { success: false, message: 'Status must be active, paused or cancelled.' }];
      }
      if (status) entry.status = status;
      logAudit('SCHEDULED_PAYMENT_UPDATED', 'success', { id: entry.id, status: entry.status });
      return [200, { success: true, data: { scheduledPayment: entry } }];
    }],

    ['DELETE', /^\/scheduled-payments\/([^/]+)$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const index = state.scheduledPayments.findIndex((s) => s.id === ctx.params[0]);
      if (index === -1) return [404, { success: false, message: 'Scheduled payment not found.' }];
      const [removed] = state.scheduledPayments.splice(index, 1);
      logAudit('SCHEDULED_PAYMENT_CANCELLED', 'success', { id: removed.id });
      return [200, { success: true, data: { deleted: removed.id } }];
    }],

    /* ------------------------------ payments ----------------------------- */
    ['GET', /^\/payments$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const limit = Number(ctx.query.get('limit') || 25);
      // Payments are a view over the ledger, not a second source of truth.
      const payments = state.transactions
        .filter((t) => ['payment', 'bill', 'purchase'].includes(t.type))
        .slice(0, limit);
      return [200, {
        success: true,
        data: {
          payments,
          summary: {
            count: payments.length,
            total: units(payments.reduce((sum, p) => sum + cents(Math.abs(p.amount)), 0)),
          },
        },
      }];
    }],

    ['POST', /^\/payments$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const { billerId, reference, amount, accountId } = ctx.body || {};
      const biller = billers.find((b) => b.id === billerId);
      if (!biller) return [422, { success: false, message: 'Unknown biller.' }];
      const account = state.accounts.find((a) => a.id === accountId);
      if (!account) return [422, { success: false, message: 'Choose a valid source account.' }];

      const valueMinor = cents(amount);
      if (!Number.isFinite(valueMinor) || valueMinor <= 0) return [422, { success: false, message: 'Enter an amount greater than zero.' }];

      // The server re-enforces sufficiency. The client-side check is a
      // convenience and is never the authorisation decision.
      const available = availableOf(account);
      if (valueMinor > available) {
        return [422, { success: false, message: 'Insufficient available balance.', code: 'INSUFFICIENT_FUNDS' }];
      }

      // Debit the BALANCE by the payment and nothing else. This previously wrote
      // `available - amount` back into `balance`, which discarded the hold as well
      // as the payment: paying 250 on an account holding 250 moved 500. A hold is a
      // separate commitment and must survive an unrelated debit untouched.
      account.balance = units(cents(account.balance) - valueMinor);
      syncAvailable(account);
      const payment = {
        id: `txn_p${Date.now().toString(36)}`,
        transactionId: `PAY${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        accountId, type: 'payment', status: 'completed',
        amount: -units(valueMinor), currency: biller.currency,
        description: `${biller.name} — ${reference || biller.accountLabel}`,
        merchant: biller.name, category: biller.category,
        createdAt: new Date().toISOString(),
      };
      state.transactions.unshift(payment);
      logAudit('BILL_PAYMENT', 'success', { biller: biller.name, amount: payment.amount });
      return [201, { success: true, data: { payment, balance: account.balance } }];
    }],

    /* ---------------------------- investments ---------------------------- */
    ['GET', /^\/investments\/portfolio$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      return [200, { success: true, data: { portfolio } }];
    }],

    ['GET', /^\/investments\/holdings\/([^/]+)$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const holding = portfolio.holdings.find((h) => h.id === ctx.params[0] || h.symbol === ctx.params[0]);
      if (!holding) return [404, { success: false, message: 'Holding not found.' }];
      return [200, { success: true, data: { holding } }];
    }],

    /* -------------------------------- loans ------------------------------ */
    ['GET', /^\/loans$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      return [200, {
        success: true,
        data: {
          loans: state.loans,
          products: loanProducts,
          summary: {
            active: state.loans.filter((l) => l.status === 'active').length,
            outstanding: units(state.loans.reduce((sum, l) => sum + cents(l.outstanding), 0)),
            nextDue: state.loans.filter((l) => l.nextDueAt).sort((a, b) => new Date(a.nextDueAt) - new Date(b.nextDueAt))[0] || null,
          },
        },
      }];
    }],

    ['GET', /^\/loans\/([^/]+)$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const loan = state.loans.find((l) => l.id === ctx.params[0]);
      if (!loan) return [404, { success: false, message: 'Loan not found.' }];
      return [200, { success: true, data: { loan } }];
    }],

    ['GET', /^\/loans\/([^/]+)\/schedule$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const loan = state.loans.find((l) => l.id === ctx.params[0]);
      if (!loan) return [404, { success: false, message: 'Loan not found.' }];
      return [200, { success: true, data: { loanId: loan.id, ...buildSchedule(loan.principal, loan.annualRate, loan.termMonths, new Date(loan.startDate)) } }];
    }],

    /** Indicative quote only — never a credit decision or an offer. */
    ['POST', /^\/loans\/quote$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const { amount, annualRate, termMonths } = ctx.body || {};
      const term = Number(termMonths);
      if (!Number.isFinite(cents(amount)) || cents(amount) <= 0) return [422, { success: false, message: 'Enter a loan amount greater than zero.' }];
      if (!Number.isFinite(term) || term < 1 || term > 360) return [422, { success: false, message: 'Term must be between 1 and 360 months.' }];
      const quote = buildSchedule(amount, Number(annualRate) || 0, term);
      return [200, {
        success: true,
        data: { ...quote, indicative: true, note: 'Indicative only. Not a credit offer or a decision.' },
      }];
    }],

    ['POST', /^\/loans\/applications$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      const { productId, amount, termMonths, purpose } = ctx.body || {};
      const product = loanProducts.find((p) => p.id === productId);
      if (!product) return [422, { success: false, message: 'Choose a loan product.' }];
      if (Number(amount) < product.minAmount || Number(amount) > product.maxAmount) {
        return [422, { success: false, message: `${product.name} accepts ${product.minAmount.toLocaleString()} to ${product.maxAmount.toLocaleString()}.` }];
      }
      if (!product.terms.includes(Number(termMonths))) {
        return [422, { success: false, message: `Available terms: ${product.terms.join(', ')} months.` }];
      }

      const application = {
        id: nextId('app', state.loanApplications),
        productId, productName: product.name, amount: Number(amount), termMonths: Number(termMonths),
        purpose: purpose || null, status: 'submitted', submittedAt: new Date().toISOString(),
        // A soft check leaves no footprint on the credit file; the hard enquiry
        // only happens later and only with explicit consent.
        creditCheck: 'soft', decisionBy: new Date(Date.now() + product.decisionHours * 3600000).toISOString(),
      };
      state.loanApplications.push(application);
      logAudit('LOAN_APPLICATION_SUBMITTED', 'success', { id: application.id, product: product.name });
      return [201, { success: true, data: { application } }];
    }],

    ['GET', /^\/loans\/applications$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      return [200, { success: true, data: { applications: state.loanApplications } }];
    }],

    /* ------------------------------ analytics ---------------------------- */
    ['GET', /^\/analytics\/overview$/, async (ctx) => {
      if (!ctx.auth) return UNAUTHORIZED;
      return [200, { success: true, data: { analytics, creditScore: state.creditScore || null } }];
    }],

    /* -------------------------------- help ------------------------------- */
    // Public on purpose: help content must be reachable when you are locked out.
    ['GET', /^\/help\/topics$/, async () => [200, { success: true, data: { topics: helpTopics, faqs } }]],

    /**
     * Public on purpose, like the rest of /help: a customer who cannot sign in is
     * precisely the one who needs to reach support. Validates length rather than
     * trusting the client, and returns a ticket id the UI can quote back — a form
     * that only says "message sent" gives the customer nothing to reference.
     */
    ['POST', /^\/help\/contact$/, async (ctx) => {
      const { name, email, topic, message } = ctx.body || {};
      if (!name || String(name).trim().length < 2) return [422, { success: false, message: 'Tell us your name.' }];
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ''))) return [422, { success: false, message: 'Enter a valid email address.' }];
      if (!message || String(message).trim().length < 10) return [422, { success: false, message: 'Give us at least a sentence to work with.' }];
      const ticket = `HLP-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
      logAudit('SUPPORT_MESSAGE_RECEIVED', 'success', { ticket, topic: topic || 'general' });
      return [201, { success: true, data: { ticket, receivedAt: new Date().toISOString(), topic: topic || 'general' } }];
    }],

    ['POST', /^\/help\/search$/, async (ctx) => {
      const term = String((ctx.body || {}).query || '').trim().toLowerCase();
      if (!term) return [200, { success: true, data: { results: [] } }];
      const results = [];
      for (const topic of helpTopics) {
        for (const article of topic.articles) {
          const haystack = `${article.title} ${article.body}`.toLowerCase();
          if (haystack.includes(term)) {
            results.push({ topicId: topic.id, topicTitle: topic.title, title: article.title, body: article.body });
          }
        }
      }
      return [200, { success: true, data: { results, total: results.length } }];
    }],
  ];
};

export { buildSchedule };
export default createExtraRoutes;
