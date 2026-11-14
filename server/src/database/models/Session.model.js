import { DataTypes, Model } from 'sequelize';

import sequelize from '#database/connection.js';

/**
 * Server-side session registry.
 *
 * The auth flows described session revocation, "sign out of other devices" and
 * refresh-token rotation reuse detection, but no Session model existed — so
 * `revokeOtherSessions` was commented out in the controller and a stolen refresh
 * token could be replayed indefinitely.
 *
 * Only a digest of the refresh token is stored (`tokenHash`). A database read
 * therefore does not yield usable credentials, and reuse detection works by
 * comparing hashes plus checking `replacedByTokenHash`.
 */
class Session extends Model {
  get isActive() {
    return !this.revokedAt && this.expiresAt && this.expiresAt.getTime() > Date.now();
  }

  get isCurrent() {
    return this.userAgent === undefined ? true : true;
  }

  revoke(reason = 'manual') {
    this.revokedAt = new Date();
    this.revokeReason = reason;
    return this.save();
  }
}

Session.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    /** SHA-256 of the opaque refresh token. Never the token itself. */
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    /** Set on rotation, so a replayed old token can be detected and the family killed. */
    replacedByTokenHash: { type: DataTypes.STRING(64), allowNull: true },
    /** True once any token in this chain has been replayed. */
    compromised: { type: DataTypes.BOOLEAN, defaultValue: false },
    familyId: { type: DataTypes.UUID, allowNull: true },
    deviceName: { type: DataTypes.STRING(160), allowNull: true },
    userAgent: { type: DataTypes.STRING(512), allowNull: true },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    country: { type: DataTypes.STRING(2), allowNull: true },
    lastUsedAt: { type: DataTypes.DATE, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
    revokeReason: {
      type: DataTypes.ENUM('logout', 'password-changed', 'rotation', 'reuse-detected', 'admin', 'expired', 'manual'),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { unique: true, fields: ['tokenHash'] },
      { fields: ['familyId'] },
      { fields: ['expiresAt'] },
    ],
  }
);

Session.associate = (models) => {
  if (models.User) Session.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export { Session };
export default Session;
