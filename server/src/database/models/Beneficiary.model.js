import { DataTypes, Model } from 'sequelize';

import sequelize from '#database/connection.js';

/**
 * Saved payee.
 *
 * `transaction.service.js` imports `Beneficiary` from the model barrel. The model
 * did not exist, so the import resolved to `undefined` and the first transfer
 * threw.
 *
 * New payees carry a cooling-off period: an attacker who has taken over a session
 * should not be able to add their own account and drain it in the same minute.
 * `status` moves to `active` only after out-of-band confirmation.
 */
class Beneficiary extends Model {
  get isPayable() {
    return this.status === 'active';
  }
}

Beneficiary.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(160), allowNull: false, validate: { notEmpty: true } },
    accountNumber: { type: DataTypes.STRING(34), allowNull: false },
    bankCode: { type: DataTypes.STRING(20), allowNull: true },
    bankName: { type: DataTypes.STRING(120), allowNull: true },
    currency: { type: DataTypes.STRING(3), defaultValue: 'USD', allowNull: false },
    nickname: { type: DataTypes.STRING(80), allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'blocked', 'deleted'),
      defaultValue: 'pending',
      allowNull: false,
    },
    /** When the payee may first receive money. */
    activatedAt: { type: DataTypes.DATE, allowNull: true },
    lastPaidAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
  },
  {
    sequelize,
    modelName: 'Beneficiary',
    tableName: 'beneficiaries',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['userId'] },
      { unique: true, fields: ['userId', 'accountNumber', 'bankCode'] },
      { fields: ['status'] },
    ],
  }
);

Beneficiary.associate = (models) => {
  if (models.User) Beneficiary.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export { Beneficiary };
export default Beneficiary;
