const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('@/database/connection');
const { ACCOUNT_STATUS, USER_ROLES } = require('@/constants');

class User extends Model {
  // Instance methods
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.mfaSecret;
    return values;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin() {
    return this.role === USER_ROLES.ADMIN;
  }

  hasPermission(permission) {
    return this.permissions && this.permissions.includes(permission);
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
      validate: {
        isEmail: true,
        notEmpty: true,
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 128],
      },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
      set(value) {
        this.setDataValue('firstName', value.trim());
      },
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
      set(value) {
        this.setDataValue('lastName', value.trim());
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^\+?[1-9]\d{1,14}$/,
      },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0],
      },
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    role: {
      type: DataTypes.ENUM(Object.values(USER_ROLES)),
      defaultValue: USER_ROLES.USER,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(Object.values(ACCOUNT_STATUS)),
      defaultValue: ACCOUNT_STATUS.PENDING,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phoneVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    mfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mfaMethod: {
      type: DataTypes.ENUM('authenticator', 'sms', 'email'),
      allowNull: true,
    },
    mfaSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kycStatus: {
      type: DataTypes.ENUM('pending', 'submitted', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    kycVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),