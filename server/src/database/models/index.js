import User from './User.model.js';
import Account from './Account.model.js';
import Transaction from './Transaction.model.js';
import Card from './Card.model.js';
import Beneficiary from './Beneficiary.model.js';
import Session from './Session.model.js';
import AuditLog from './AuditLog.model.js';

/**
 * Model registry.
 *
 * The committed version exported only `User`, with every other model commented
 * out as "import other models here as they are created" — while
 * `transaction.service.js` destructured `{ Transaction, Account, User,
 * Beneficiary }` from this barrel. All four were `undefined` at runtime, so any
 * transfer failed before touching the database.
 *
 * `Loan` is on the README roadmap but has no schema in this repository. It is
 * intentionally absent rather than stubbed, and every `associate` guards its
 * sibling references so a missing model degrades to "no relationship" instead of
 * throwing at import time — which is what previously made the server unbootable.
 */
const models = { User, Account, Transaction, Card, Beneficiary, Session, AuditLog };

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') model.associate(models);
});

export { User, Account, Transaction, Card, Beneficiary, Session, AuditLog };
export default models;
