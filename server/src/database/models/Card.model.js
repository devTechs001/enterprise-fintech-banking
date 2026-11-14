import { DataTypes, Model } from 'sequelize';

import sequelize from '#database/connection.js';
import { CARD_TYPES, CARD_STATUS } from '#constants/index.js';
import { encryptField, decryptField, isEncryptionEnabled } from '#utils/crypto.js';

/**
 * Payment card.
 *
 * `Account.associate` and `Transaction.associate` both referenced `models.Card`,
 * which did not exist — so `hasMany(undefined, ...)` threw
 * "called with something that's not a subclass of Sequelize.Model" the moment the
 * model barrel was imported. That single missing model made the entire server
 * unbootable, which is why nothing downstream of it had ever been exercised.
 *
 * PAN handling: the full card number is encrypted at rest (AES-256-GCM) and only
 * ever decrypted inside `getPan()`, which is not part of `toJSON()`. What is
 * stored in plaintext is the first six and last four digits, which is what a UI
 * needs to display a card and what a support agent needs to identify one. Storing
 * the PAN in plaintext would put the repository squarely in PCI DSS scope for
 * data at rest with no compensating control.
 *
 * The CVV is never stored. Not encrypted, not hashed — never. It is not permitted
 * to be retained after authorisation under PCI DSS 3.2.
 */
class Card extends Model {
  get isUsable() {
    return this.status === CARD_STATUS.ACTIVE && !this.isFrozen && !this.isExpired;
  }

  get isExpired() {
    if (!this.expiryMonth || !this.expiryYear) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    if (this.expiryYear < currentYear) return true;
    return this.expiryYear === currentYear && this.expiryMonth < now.getMonth() + 1;
  }

  /** Decrypt the PAN. Deliberately not exposed through toJSON. */
  getPan() {
    return this.panEncrypted ? decryptField(this.panEncrypted) : null;
  }

  setPan(pan) {
    const digits = String(pan).replace(/\D/g, '');
    this.panEncrypted = encryptField(digits);
    this.panFirst6 = digits.slice(0, 6);
    this.panLast4 = digits.slice(-4);
  }

  /** Display-safe label: never the full PAN. */
  get maskedNumber() {
    return `${this.cardType?.toUpperCase() ?? 'CARD'} •••• ${this.panLast4 ?? '••••'}`;
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.panEncrypted;
    delete values.pinHash;
    return values;
  }

  /**
   * Spend against a limit.
   *
   * The limit is a hard ceiling enforced here and re-checked inside the
   * transaction's serializable isolation — a client-side check is a convenience,
   * never an authorisation decision.
   */
  hasAvailableLimit(amount) {
    const limit = Number(this.spendingLimit ?? 0);
    if (!limit) return true;
    return Number(this.currentSpend ?? 0) + Number(amount) <= limit;
  }
}

Card.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    accountId: { type: DataTypes.UUID, allowNull: false },
    cardType: {
      type: DataTypes.ENUM(...Object.values(CARD_TYPES)),
      defaultValue: CARD_TYPES.VISA,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CARD_STATUS)),
      defaultValue: CARD_STATUS.ACTIVE,
      allowNull: false,
    },
    /** Encrypted PAN. Never plaintext, never in a serialised payload. */
    panEncrypted: { type: DataTypes.TEXT, allowNull: true },
    panFirst6: { type: DataTypes.STRING(6), allowNull: true },
    panLast4: { type: DataTypes.STRING(4), allowNull: true },
    cardHolderName: { type: DataTypes.STRING(160), allowNull: false },
    expiryMonth: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 12 } },
    expiryYear: { type: DataTypes.INTEGER, allowNull: true },
    isVirtual: { type: DataTypes.BOOLEAN, defaultValue: false },
    isFrozen: { type: DataTypes.BOOLEAN, defaultValue: false },
    frozenAt: { type: DataTypes.DATE, allowNull: true },
    freezeReason: { type: DataTypes.STRING(255), allowNull: true },
    /** Monthly ceiling, in whole currency units. */
    spendingLimit: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    currentSpend: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    /** Contactless toggle; a stolen card is far less useful with it off. */
    contactlessEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    onlinePaymentsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    internationalEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastUsedAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
  },
  {
    sequelize,
    modelName: 'Card',
    tableName: 'cards',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['accountId'] },
      { fields: ['status'] },
      // First6+last4 identifies a card for support without exposing the PAN.
      { fields: ['panFirst6', 'panLast4'] },
    ],
  }
);

Card.associate = (models) => {
  if (models.User) Card.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  if (models.Account) Card.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
};

export { Card, isEncryptionEnabled };
export default Card;
