const { Op, Transaction: SequelizeTransaction } = require('sequelize');
const { sequelize } = require('@/database/connection');
const { Transaction, Account, User, Beneficiary } = require('@/database/models');
const { 
  TRANSACTION_TYPES, 
  TRANSACTION_STATUS,
  ERROR_CODES 
} = require('@/constants');
const { 
  InsufficientFundsException,
  TransactionException,
  ValidationException,
  NotFoundException 
} = require('@/exceptions');
const { generateTransactionId, generateReference } = require('@/utils/generators');
const { calculateFee } = require('@/utils/calculators');
const { EventEmitter } = require('@/events');
const { FraudService } = require('./fraud.service');
const { NotificationService } = require('./notification.service');
const { AuditService } = require('./audit.service');
const { redis } = require('@/config/redis.config');

class TransactionService {
  /**
   * Create a new transaction
   */
  async createTransaction(data, options = {}) {
    const dbTransaction = await sequelize.transaction({
      isolationLevel: SequelizeTransaction.ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const {
        userId,
        accountId,
        destinationAccountId,
        type,
        amount,
        currency,
        description,
        beneficiaryId,
        metadata = {},
        channel = 'web',
        ipAddress,
        deviceInfo,
      } = data;

      // Get source account with lock
      const sourceAccount = await Account.findByPk(accountId, {
        lock: true,
        transaction: dbTransaction,
      });

      if (!sourceAccount) {
        throw new NotFoundException('Source account not found');
      }

      if (!sourceAccount.canTransact()) {
        throw new TransactionException(
          'Account is not eligible for transactions',
          ERROR_CODES.ACCOUNT_FROZEN
        );
      }

      // Calculate fee
      const fee = await calculateFee(type, amount, sourceAccount.accountType);
      const totalAmount = amount + fee;

      // Check sufficient balance for debit transactions
      const debitTypes = ['transfer', 'withdrawal', 'payment', 'purchase'];
      if (debitTypes.includes(type)) {
        if (!sourceAccount.hasSufficientBalance(totalAmount)) {
          throw new InsufficientFundsException(
            'Insufficient funds',
            {
              available: sourceAccount.getAvailableBalance(),
              required: totalAmount,
            }
          );
        }

        // Check daily limits
        const dailyTotal = await this.getDailyTransactionTotal(accountId, type);
        if (dailyTotal + totalAmount > sourceAccount.dailyTransferLimit) {
          throw new TransactionException(
            'Daily transaction limit exceeded',
            ERROR_CODES.LIMIT_EXCEEDED
          );
        }
      }

      // Fraud check
      const fraudCheck = await FraudService.analyzeTransaction({
        userId,
        accountId,
        amount,
        type,
        ipAddress,
        deviceInfo,
      });

      if (fraudCheck.blocked) {
        throw new TransactionException(
          'Transaction blocked by security system',
          ERROR_CODES.FRAUD_DETECTED
        );
      }

      // Get beneficiary info if applicable
      let beneficiaryInfo = {};
      if (beneficiaryId) {
        const beneficiary = await Beneficiary.findByPk(beneficiaryId);
        if (beneficiary) {
          beneficiaryInfo = {
            beneficiaryId: beneficiary.id,
            beneficiaryName: beneficiary.name,
            beneficiaryAccount: beneficiary.accountNumber,
            beneficiaryBank: beneficiary.bankName,
            beneficiaryBankCode: beneficiary.bankCode,
          };
        }
      }

      // Create transaction record
      const transaction = await Transaction.create(
        {
          transactionId: generateTransactionId(),
          userId,
          accountId,
          destinationAccountId,
          type,
          amount,
          currency: currency || sourceAccount.currency,
          fee,
          direction: debitTypes.includes(type) ? 'debit' : 'credit',
          status: TRANSACTION_STATUS.PENDING,
          description,
          reference: generateReference(),
          balanceBefore: sourceAccount.balance,
          channel,
          ipAddress,
          deviceInfo,
          riskScore: fraudCheck.score,
          riskFlags: fraudCheck.flags,
          isFlagged: fraudCheck.flagged,
          ...beneficiaryInfo,
          metadata: {
            ...metadata,
            fraudCheckId: fraudCheck.id,
          },
        },
        { transaction: dbTransaction }
      );

      // Update source account balance
      if (debitTypes.includes(type)) {
        await sourceAccount.decrement('balance', {
          by: totalAmount,
          transaction: dbTransaction,
        });
      } else {
        await sourceAccount.increment('balance', {
          by: amount,
          transaction: dbTransaction,
        });
      }

      // Update destination account if internal transfer
      if (destinationAccountId) {
        const destAccount = await Account.findByPk(destinationAccountId, {
          lock: true,
          transaction: dbTransaction,
        });

        if (destAccount) {
          await destAccount.increment('balance', {
            by: amount,
            transaction: dbTransaction,
          });
        }
      }

      // Get updated balance
      await sourceAccount.reload({ transaction: dbTransaction });

      // Update transaction with new balance
      await transaction.update(
        {
          balanceAfter: sourceAccount.balance,
          status: TRANSACTION_STATUS.COMPLETED,
          processedAt: new Date(),
        },
        { transaction: dbTransaction }
      );

      // Update last transaction time
      await sourceAccount.update(
        { lastTransactionAt: new Date() },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();

      // Post-transaction processing (async)
      this.postTransactionProcessing(transaction, sourceAccount);

      return transaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Post-transaction processing
   */
  async postTransactionProcessing(transaction, account) {
    try {
      // Send notification
      await NotificationService.sendTransactionNotification(
        transaction.userId,
        transaction
      );

      // Audit log
      await AuditService.log({
        action: 'TRANSACTION_COMPLETED',
        userId: transaction.userId,
        resourceType: 'transaction',
        resourceId: transaction.id,
        details: {
          transactionId: transaction.transactionId,
          type: transaction.type,
          amount: transaction.amount,
          accountId: transaction.accountId,
        },
      });

      // Emit event
      EventEmitter.emit('transaction.completed', transaction);

      // Invalidate cache
      await this.invalidateCache(transaction.userId, transaction.accountId);
    } catch (error) {
      console.error('Post-transaction processing error:', error);
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id, userId = null) {
    const where = { id };
    if (userId) {
      where.userId = userId;
    }

    const transaction = await Transaction.findOne({
      where,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'accountNumber', 'accountName', 'accountType'],
        },
        {
          model: Account,
          as: 'destinationAccount',
          attributes: ['id', 'accountNumber', 'accountName'],
        },
        {
          model: Beneficiary,
          as: 'beneficiary',
          attributes: ['id', 'name', 'accountNumber', 'bankName'],
        },
      ],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get transactions with pagination and filters
   */
  async getTransactions(userId, filters = {}, pagination = {}) {
    const {
      accountId,
      type,
      status,
      direction,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
    } = filters;

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;

    const where = { userId };

    if (accountId) where.accountId = accountId;
    if (type) where.type = Array.isArray(type) ? { [Op.in]: type } : type;
    if (status) where.status = status;
    if (direction) where.direction = direction;
    if (category) where.category = category;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount[Op.gte] = minAmount;
      if (maxAmount) where.amount[Op.lte] = maxAmount;
    }

    if (search) {
      where[Op.or] = [
        { description: { [Op.iLike]: `%${search}%` } },
        { reference: { [Op.iLike]: `%${search}%` } },
        { transactionId: { [Op.iLike]: `%${search}%` } },
        { merchantName: { [Op.iLike]: `%${search}%` } },
        { beneficiaryName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'accountNumber', 'accountName', 'accountType'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      transactions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
    };
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId, accountId = null, period = 'month') {
    const cacheKey = `stats:${userId}:${accountId || 'all'}:${period}`;
    
    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(period);
    const where = {
      userId,
      status: TRANSACTION_STATUS.COMPLETED,
      createdAt: { [Op.gte]: startDate },
    };

    if (accountId) {
      where.accountId = accountId;
    }

    // Get totals by direction
    const [income, expenses] = await Promise.all([
      Transaction.sum('amount', {
        where: { ...where, direction: 'credit' },
      }),
      Transaction.sum('amount', {
        where: { ...where, direction: 'debit' },
      }),
    ]);

    // Get category breakdown
    const categoryStats = await Transaction.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { ...where, direction: 'debit' },
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true,
    });

    // Get transaction count by type
    const typeStats = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where,
      group: ['type'],
      raw: true,
    });

    const stats = {
      period,
      startDate,
      income: income || 0,
      expenses: expenses || 0,
      netChange: (income || 0) - (expenses || 0),
      categoryBreakdown: categoryStats,
      typeBreakdown: typeStats,
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(stats));

    return stats;
  }

  /**
   * Get daily transaction total
   */
  async getDailyTransactionTotal(accountId, type) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const total = await Transaction.sum('amount', {
      where: {
        accountId,
        type,
        status: TRANSACTION_STATUS.COMPLETED,
        createdAt: { [Op.gte]: startOfDay },
      },
    });

    return total || 0;
  }

  /**
   * Reverse a transaction
   */
  async reverseTransaction(transactionId, userId, reason) {
    const dbTransaction = await sequelize.transaction();

    try {
      const originalTransaction = await Transaction.findOne({
        where: { id: transactionId, userId },
        lock: true,
        transaction: dbTransaction,
      });

      if (!originalTransaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (!originalTransaction.canBeReversed()) {
        throw new TransactionException(
          'Transaction cannot be reversed',
          ERROR_CODES.REVERSAL_NOT_ALLOWED
        );
      }

      // Create reversal transaction
      const reversalTransaction = await Transaction.create(
        {
          transactionId: generateTransactionId(),
          userId,
          accountId: originalTransaction.accountId,
          destinationAccountId: originalTransaction.destinationAccountId,
          type: 'reversal',
          amount: originalTransaction.amount,
          currency: originalTransaction.currency,
          direction: originalTransaction.direction === 'debit' ? 'credit' : 'debit',
          status: TRANSACTION_STATUS.COMPLETED,
          description: `Reversal of ${originalTransaction.transactionId}`,
          reference: generateReference(),
          reversalReason: reason,
          metadata: {
            originalTransactionId: originalTransaction.id,
          },
        },
        { transaction: dbTransaction }
      );

      // Update account balances
      const account = await Account.findByPk(originalTransaction.accountId, {
        lock: true,
        transaction: dbTransaction,
      });

      if (originalTransaction.direction === 'debit') {
        await account.increment('balance', {
          by: originalTransaction.amount,
          transaction: dbTransaction,
        });
      } else {
        await account.decrement('balance', {
          by: originalTransaction.amount,
          transaction: dbTransaction,
        });
      }

      // If there was a destination account, reverse that too
      if (originalTransaction.destinationAccountId) {
        const destAccount = await Account.findByPk(
          originalTransaction.destinationAccountId,
          { lock: true, transaction: dbTransaction }
        );

        if (destAccount) {
          await destAccount.decrement('balance', {
            by: originalTransaction.amount,
            transaction: dbTransaction,
          });
        }
      }

      // Mark original transaction as reversed
      await originalTransaction.update(
        {
          isReversed: true,
          reversedAt: new Date(),
          reversalTransactionId: reversalTransaction.id,
          reversalReason: reason,
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();

      // Audit log
      await AuditService.log({
        action: 'TRANSACTION_REVERSED',
        userId,
        resourceType: 'transaction',
        resourceId: originalTransaction.id,
        details: {
          originalTransactionId: originalTransaction.transactionId,
          reversalTransactionId: reversalTransaction.transactionId,
          reason,
        },
      });

      return reversalTransaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Get start date based on period
   */
  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  /**
   * Invalidate cache
   */
  async invalidateCache(userId, accountId) {
    const patterns = [
      `stats:${userId}:*`,
      `transactions:${userId}:*`,
      `account:${accountId}:*`,
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  }
}

module.exports = new TransactionService();