import User from './User.model';

// Import other models here as they are created
// import Account from './Account.model';
// import Transaction from './Transaction.model';
// import Card from './Card.model';
// import Loan from './Loan.model';

const models = {
  User,
  // Account,
  // Transaction,
  // Card,
  // Loan,
};

// Define associations here
// User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
// Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User };
export default models;
