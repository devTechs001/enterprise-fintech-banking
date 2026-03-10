const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('@/database/connection');
const { ACCOUNT_TYPES, ACCOUNT_STATUS, CURRENCIES } = require('@/constants');
const { generateAccountNumber } = require('@/utils/generators');

class Account extends Model {
  // Check if account can perform transactions
  canTransact() {
    return this.status === 'active' && !this.isFrozen;
  }

  // Check if account has sufficient balance
  hasSufficientBalance(amount) {
    const availableBalance = this.balance - this.holdBalance;
    return availableBalance >= amount;
  }

  // Get available balance
  getAvailableBalance() {
    return this.balance - this.holdBalance;
  }
}

Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    accountNumber: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    accountName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    accountType: {
      type: DataTypes.ENUM(Object.values(ACCOUNT_TYPES)),
      allowNull: false,
      defaultValue: ACCOUNT_TYPES.CHECKING,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      validate: {
        isIn: [Object.values(CURRENCIES)],
      },
    },
    balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        const value = this.getDataValue('balance');
        return value ? parseFloat(value) : 0;
      },
    },
    availableBalance: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.balance - this.holdBalance;
      },
    },
    holdBalance: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      get() {
        const value = this.getDataValue('holdBalance');
        return value ? parseFloat(value) : 0;
      },
    },
    overdraftLimit: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.0000,
    },
    minimumBalance: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
    },
    dailyWithdrawalLimit: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 5000.00,
    },
    dailyTransferLimit: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 10000.00,
    },
    monthlyTransactionLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    status: {
      type: DataTypes.ENUM(Object.values(ACCOUNT_STATUS)),
      defaultValue: ACCOUNT_STATUS.ACTIVE,
    },
    isFrozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    frozenAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    frozenReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    branchCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    iban: {
      type: DataTypes.STRING(34),
      allowNull: true,
    },
    swiftCode: {
      type: DataTypes.STRING(11),
      allowNull: true,
    },
    routingNumber: {
      type: DataTypes.STRING(9),
      allowNull: true,
    },
    lastTransactionAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastInterestCalculatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    openedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['accountNumber'] },
      { fields: ['userId'] },
      { fields: ['accountType'] },
      { fields: ['status'] },
      { fields: ['currency'] },
      { fields: ['iban'] },
    ],
    hooks: {
      beforeCreate: async (account) => {
        if (!account.accountNumber) {
          account.accountNumber = await generateAccountNumber(account.accountType);
        }
      },
    },
  }
);

// Associations
Account.associate = (models) => {
  Account.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Account.hasMany(models.Transaction, {
    foreignKey: 'accountId',
    as: 'transactions',
  });

  Account.hasMany(models.Transaction, {
    foreignKey: 'destinationAccountId',
    as: 'incomingTransactions',
  });

  Account.hasMany(models.Card, {
    foreignKey: 'accountId',
    as: 'cards',
  });
};

module.exports = Account;