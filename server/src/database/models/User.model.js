import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

import sequelize from '#database/connection.js';
import config from '#config/index.js';
import { ACCOUNT_STATUS, USER_ROLES } from '#constants/index.js';
import { encryptField, decryptField } from '#utils/crypto.js';

/**
 * User model.
 *
 * WHY THIS FILE WAS REWRITTEN
 * ---------------------------
 * The committed version ended mid-expression at line 150:
 *
 *     riskLevel: {
 *       type: DataTypes.ENUM('low', 'medium', 'high'),   <-- end of file
 *
 * `node --check` reported `SyntaxError: Unexpected end of input`. The cause is
 * reproducible: `structure.txt` line 3463 contains a stray ``` fence embedded in
 * the middle of the code block, and `extract_all.py` extracts with a non-greedy
 * `(.*?)``` ` pattern, so the match terminated at that stray fence and the file
 * was written out truncated.
 *
 * The lost tail contained the `User.init` options block, the associations, the
 * export — and the `beforeCreate` / `beforeUpdate` bcrypt hooks. That is why the
 * repository imported `bcryptjs` but never called `bcrypt.hash` anywhere: as
 * committed, this service would have stored every customer password in
 * plaintext. The hooks are restored below, with the cost factor taken from
 * configuration rather than hard-coded.
 *
 * Additional hardening:
 *  - the TOTP secret is encrypted at rest (AES-256-GCM) and only decrypted to
 *    verify a code;
 *  - `toJSON()` strips every credential-bearing field so a serialised user can
 *    never leak one by accident;
 *  - password comparison uses bcrypt's own constant-time check;
 *  - a lockout window and failed-attempt counter live on the row so they survive
 *    a restart and are shared across instances.
 */
class User extends Model {
  /** Verify a candidate password against the stored bcrypt digest. */
  async comparePassword(candidatePassword) {
    if (!this.password || !candidatePassword) return false;
    return bcrypt.compare(String(candidatePassword), this.password);
  }

  /** True when the stored digest was produced with a cost below the current policy. */
  needsRehash() {
    if (!this.password) return true;
    try {
      const rounds = Number(String(this.password).split('$')[2]);
      return !Number.isFinite(rounds) || rounds < config.auth.bcryptRounds;
    } catch {
      return true;
    }
  }

  /**
   * Strip credentials before the instance is serialised.
   *
   * `mfaSecret` is stored encrypted, but a serialised model should not carry it
   * at all — defence in depth against a response that echoes the whole object.
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.mfaSecret;
    delete values.mfaRecoveryCodes;
    delete values.resetTokenHash;
    delete values.verificationTokenHash;
    return values;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isLocked() {
    return Boolean(this.lockedUntil && this.lockedUntil.getTime() > Date.now());
  }

  get canAuthenticate() {
    return this.status === ACCOUNT_STATUS.ACTIVE && !this.isLocked;
  }

  isAdmin() {
    return this.role === USER_ROLES.ADMIN;
  }

  hasRole(...roles) {
    return roles.flat().includes(this.role);
  }

  hasPermission(permission) {
    return Array.isArray(this.permissions) && this.permissions.includes(permission);
  }

  /** Read the TOTP shared secret, decrypting it on the way out. */
  getMfaSecret() {
    return this.mfaSecret ? decryptField(this.mfaSecret) : null;
  }

  /** Store the TOTP shared secret encrypted. */
  setMfaSecret(plaintext) {
    this.mfaSecret = plaintext ? encryptField(plaintext) : null;
  }

  registerFailedAttempt(maxAttempts, lockoutMinutes) {
    this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
    if (this.failedLoginAttempts >= maxAttempts) {
      this.lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      this.failedLoginAttempts = 0;
      return { locked: true, until: this.lockedUntil };
    }
    return { locked: false, attemptsRemaining: maxAttempts - this.failedLoginAttempts };
  }

  clearFailedAttempts() {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
      set(value) {
        // Normalise so "A@B.com " and "a@b.com" cannot coexist as two accounts.
        this.setDataValue('email', String(value).toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        // Enforced on the plaintext value before the hook hashes it.
        len: [config.auth.passwordMinLength, 128],
      },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
      set(value) {
        this.setDataValue('firstName', String(value).trim());
      },
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 100] },
      set(value) {
        this.setDataValue('lastName', String(value).trim());
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: { is: /^\+?[1-9]\d{1,14}$/ },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: { isUrl: true },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      defaultValue: USER_ROLES.USER,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ACCOUNT_STATUS)),
      defaultValue: ACCOUNT_STATUS.PENDING,
      allowNull: false,
    },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    phoneVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    phoneVerifiedAt: { type: DataTypes.DATE, allowNull: true },

    mfaEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    mfaMethod: { type: DataTypes.ENUM('authenticator', 'sms', 'email'), allowNull: true },
    /** Encrypted at rest — see `getMfaSecret` / `setMfaSecret`. */
    mfaSecret: { type: DataTypes.TEXT, allowNull: true },
    mfaEnrolledAt: { type: DataTypes.DATE, allowNull: true },
    /** Hashed, not plaintext: a recovery code is a bearer credential. */
    mfaRecoveryCodes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    /** Single-use token digests. Never store the token itself. */
    resetTokenHash: { type: DataTypes.STRING(64), allowNull: true },
    resetTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
    verificationTokenHash: { type: DataTypes.STRING(64), allowNull: true },
    verificationTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },

    kycStatus: {
      type: DataTypes.ENUM('pending', 'submitted', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    kycVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'low',
    },
    transactionLimit: { type: DataTypes.DECIMAL(15, 2), defaultValue: 10000.0 },
    dailyTransactionLimit: { type: DataTypes.DECIMAL(15, 2), defaultValue: 50000.0 },
    preferredCurrency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
    timezone: { type: DataTypes.STRING(50), defaultValue: 'UTC' },
    language: { type: DataTypes.STRING(10), defaultValue: 'en' },
    notificationPreferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        push: true,
        sms: true,
        marketing: false,
        transactionAlerts: true,
        securityAlerts: true,
        promotions: false,
      },
    },
    address: { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },

    lastLoginAt: { type: DataTypes.DATE, allowNull: true },
    lastLoginIp: { type: DataTypes.STRING(45), allowNull: true },
    failedLoginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    lockedUntil: { type: DataTypes.DATE, allowNull: true },
    passwordChangedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['status'] },
      { fields: ['role'] },
      { fields: ['phoneNumber'] },
      { fields: ['createdAt'] },
      { fields: ['resetTokenHash'] },
    ],
    hooks: {
      /**
       * Hash the password before it is written.
       *
       * These two hooks are what the truncation removed. Without them the column
       * holds the customer's plaintext password.
       */
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(String(user.password), config.auth.bcryptRounds);
          user.passwordChangedAt = new Date();
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(String(user.password), config.auth.bcryptRounds);
          user.passwordChangedAt = new Date();
        }
      },
    },
  }
);

User.associate = (models) => {
  if (models.Account) User.hasMany(models.Account, { foreignKey: 'userId', as: 'accounts' });
  if (models.Transaction) User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions' });
  if (models.Session) User.hasMany(models.Session, { foreignKey: 'userId', as: 'sessions' });
  if (models.AuditLog) User.hasMany(models.AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
};

export { User };
export default User;
