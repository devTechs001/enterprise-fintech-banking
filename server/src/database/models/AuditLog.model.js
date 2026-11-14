import { DataTypes, Model } from 'sequelize';

import sequelize from '#database/connection.js';

/**
 * Append-only audit trail.
 *
 * The README promised tamper-evident logging; nothing in the repository could
 * record an event. Rows are insert-only: no update or delete hooks are defined
 * and `paranoid` is off, because a soft-delete flag is still a mutation an
 * attacker with write access could flip. Retention is handled by partitioning or
 * an archival job, not by the application.
 */
class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    action: { type: DataTypes.STRING(120), allowNull: false },
    resource: { type: DataTypes.STRING(80), allowNull: true },
    resourceId: { type: DataTypes.STRING(80), allowNull: true },
    actor: { type: DataTypes.JSONB, allowNull: true },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    userAgent: { type: DataTypes.STRING(512), allowNull: true },
    outcome: {
      type: DataTypes.ENUM('success', 'failure', 'denied'),
      defaultValue: 'success',
      allowNull: false,
    },
    details: { type: DataTypes.JSONB, allowNull: true },
    at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    // Only createdAt is meaningful; updatedAt would imply rows are editable.
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['action'] },
      { fields: ['at'] },
      { fields: ['outcome'] },
      { fields: ['resource', 'resourceId'] },
    ],
  }
);

AuditLog.associate = (models) => {
  if (models.User) AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export { AuditLog };
export default AuditLog;
