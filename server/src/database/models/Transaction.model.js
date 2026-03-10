const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('@/database/connection');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('@/constants');
const { generateTransactionId } = require('@/utils/generators');

class Transaction extends Model {
  // Check if transaction can be reversed
  canBeReversed() {
    const reversibleStatuses = ['completed', 'settled'];
    const reversibleTypes = ['transfer', 'payment', 'purchase'];
    const maxReversalDays = 30;

    const daysSinceTransaction = Math.floor(
      (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      reversibleStatuses.includes(this.status) &&
      reversibleTypes.includes(this.type) &&
      !this.isReversed &&
      daysSinceTransaction <= maxReversalDays
    );
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    destinationAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(Object.values(TRANSACTION_TYPES)),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    subCategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('amount');
        return value ? parseFloat(value) : 0;
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    convertedAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    convertedCurrency: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
    },
    fee: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
    },
    tax: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
    },
    totalAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.amount + this.fee + this.tax;
      },
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    direction: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.values(TRANSACTION_STATUS)),
      defaultValue: TRANSACTION_STATUS.PENDING,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    memo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    externalReference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    beneficiaryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'beneficiaries',
        key: 'id',
      },
    },
    beneficiaryName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    beneficiaryAccount: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    beneficiaryBank: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    beneficiaryBankCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    merchantId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    merchantName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    merchantCategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    merchantCategoryCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    cardId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'cards',
        key: 'id',
      },
    },
    cardLastFour: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    channel: {
      type: DataTypes.ENUM('web', 'mobile', 'atm', 'pos', 'branch', 'api'),
      allowNull: true,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurringId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    failureCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isReversed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reversedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reversalTransactionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reversalReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isDisputed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    disputeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    riskScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    riskFlags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    flaggedReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['transactionId'] },
      { fields: ['userId'] },
      { fields: ['accountId'] },
      { fields: ['destinationAccountId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
      { fields: ['reference'] },
      { fields: ['externalReference'] },
      { fields: ['merchantId'] },
      { fields: ['cardId'] },
      { fields: ['category'] },
      {
        fields: ['userId', 'createdAt'],
        name: 'idx_transactions_user_date',
      },
      {
        fields: ['accountId', 'createdAt'],
        name: 'idx_transactions_account_date',
      },
    ],
    hooks: {
      beforeCreate: async (transaction) => {
        if (!transaction.transactionId) {
          transaction.transactionId = generateTransactionId();
        }
      },
    },
  }
);

// Associations
Transaction.associate = (models) => {
  Transaction.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Transaction.belongsTo(models.Account, {
    foreignKey: 'accountId',
    as: 'account',
  });

  Transaction.belongsTo(models.Account, {
    foreignKey: 'destinationAccountId',
    as: 'destinationAccount',
  });

  Transaction.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
  });

  Transaction.belongsTo(models.Card, {
    foreignKey: 'cardId',
    as: 'card',
  });
};

module.exports = Transaction;