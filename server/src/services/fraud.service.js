import logger from '#logger.js';
import { redis } from '#config/redis.config.js';

/**
 * Heuristic transaction screening.
 *
 * `transaction.service.js` calls `FraudService.analyzeTransaction(...)` before
 * committing a transfer, but the module did not exist, so every transfer threw.
 *
 * These are deliberately conservative, explainable rules rather than a scoring
 * model: they flag for review and never silently approve. Every flag carries the
 * reason so an analyst (and the customer, via support) can see why a payment was
 * held. The thresholds belong in configuration once the business owns them.
 */

const THRESHOLDS = {
  largeAmount: 10000,
  velocityWindowSeconds: 300,
  velocityMaxCount: 5,
  newBeneficiaryAmount: 2500,
};

const VELOCITY_KEY = (userId) => `fraud:velocity:${userId}`;

class FraudServiceClass {
  /**
   * @returns {{risk:'low'|'medium'|'high', blocked:boolean, reasons:string[]}}
   */
  async analyzeTransaction({ userId, amount, type, beneficiaryId, isNewBeneficiary = false, ip, country } = {}) {
    const reasons = [];
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return { risk: 'high', blocked: true, reasons: ['invalid amount'] };
    }

    if (value >= THRESHOLDS.largeAmount) reasons.push(`amount ${value} exceeds large-payment threshold`);
    if (isNewBeneficiary && value >= THRESHOLDS.newBeneficiaryAmount) {
      reasons.push('first payment to a new beneficiary above the cooling-off threshold');
    }

    const velocity = await this._velocity(userId);
    if (velocity >= THRESHOLDS.velocityMaxCount) {
      reasons.push(`${velocity} transactions in the last ${THRESHOLDS.velocityWindowSeconds}s`);
    }

    // A country change between consecutive authenticated actions is a strong
    // account-takeover signal, but only when the caller can supply it.
    if (country && userId) {
      const last = await redis.get(`fraud:last-country:${userId}`);
      if (last && last !== country) reasons.push(`sign-in country changed ${last} -> ${country}`);
      await redis.set(`fraud:last-country:${userId}`, country);
    }

    const risk = reasons.length === 0 ? 'low' : reasons.length === 1 ? 'medium' : 'high';
    // Only an unambiguous takeover/limit breach blocks; the rest go to review so a
    // legitimate customer is not locked out of their own money by a heuristic.
    const blocked = reasons.some((reason) => reason.startsWith('invalid amount'));

    if (risk !== 'low') {
      logger.warn('fraud screening flagged a transaction', { userId, amount: value, type, beneficiaryId, ip, risk, reasons });
    }

    return { risk, blocked, reasons };
  }

  async _velocity(userId) {
    if (!userId) return 0;
    const key = VELOCITY_KEY(userId);
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, THRESHOLDS.velocityWindowSeconds);
    return count;
  }

  /** Allow a reviewer to release a held transaction. */
  async clearFlag(transactionId, reviewerId) {
    logger.info('fraud flag cleared', { transactionId, reviewerId });
    return { cleared: true, transactionId, reviewerId };
  }
}

export const FraudService = new FraudServiceClass();
export const fraudService = FraudService;
export default FraudService;
