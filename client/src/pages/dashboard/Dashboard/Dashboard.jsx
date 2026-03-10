import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Bell,
  Settings,
  CreditCard,
  Wallet,
  PiggyBank,
  BarChart3,
  Send,
  QrCode,
  Receipt,
  ArrowRightLeft,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountCard } from '@/components/banking/AccountCard';
import { TransactionList } from '@/components/banking/TransactionList';
import { SpendingChart } from '@/components/banking/SpendingChart';
import { VirtualCard } from '@/components/cards/VirtualCard';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { Badge } from '@/components/common/Badge';

import { useAccounts } from '@/hooks/banking/useAccounts';
import { useTransactions } from '@/hooks/banking/useTransactions';
import { useCards } from '@/hooks/banking/useCards';
import { selectUser } from '@/store/slices/authSlice';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const QuickActionButton = ({ icon: Icon, label, onClick, variant = 'default' }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      'flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200',
      variant === 'primary'
        ? 'bg-primary-600 text-white hover:bg-primary-700'
        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
    )}
  >
    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', variant === 'primary' ? 'bg-white/20' : 'bg-primary-50 dark:bg-primary-900/30')}>
      <Icon className={cn('w-6 h-6', variant === 'primary' ? 'text-white' : 'text-primary-600 dark:text-primary-400')} />
    </div>
    <span className={cn('text-sm font-medium', variant === 'primary' ? 'text-white' : 'text-gray-700 dark:text-gray-200')}>{label}</span>
  </motion.button>
);

const StatCard = ({ title, value, change, changeType, icon: Icon }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn('text-sm font-medium', changeType === 'increase' ? 'text-green-500' : 'text-red-500')}>
                {change}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </CardContent>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500" />
  </Card>
);

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { accounts, totalBalance, isLoading: accountsLoading } = useAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const { cards, primaryCard, isLoading: cardsLoading } = useCards();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {greeting()}, {user?.firstName}! 👋
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Here's what's happening with your finances today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon"><Bell className="w-5 h-5" /></Button>
            <Button variant="outline" size="icon"><Settings className="w-5 h-5" /></Button>
            <Button leftIcon={Plus}>New Transaction</Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Balance" value={formatCurrency(totalBalance || 0)} change={12.5} changeType="increase" icon={Wallet} />
          <StatCard title="Monthly Income" value={formatCurrency(8450)} change={8.2} changeType="increase" icon={ArrowDownLeft} />
          <StatCard title="Monthly Expenses" value={formatCurrency(3200)} change={5.4} changeType="decrease" icon={ArrowUpRight} />
          <StatCard title="Savings" value={formatCurrency(15000)} change={15.8} changeType="increase" icon={PiggyBank} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <QuickActionButton icon={Send} label="Send Money" variant="primary" />
                <QuickActionButton icon={ArrowDownLeft} label="Request" />
                <QuickActionButton icon={ArrowRightLeft} label="Transfer" />
                <QuickActionButton icon={Receipt} label="Pay Bills" />
                <QuickActionButton icon={QrCode} label="QR Pay" />
                <QuickActionButton icon={CreditCard} label="Cards" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Accounts */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Accounts</h2>
                <Link to="/accounts"><Button variant="ghost" size="sm" rightIcon={Eye}>View All</Button></Link>
              </div>
              {accountsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-52 rounded-2xl" />
                  <Skeleton className="h-52 rounded-2xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts?.slice(0, 2).map((account) => (
                    <AccountCard key={account.id} account={account} onTransfer={() => {}} onDeposit={() => {}} onViewDetails={() => {}} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Link to="/transactions"><Button variant="ghost" size="sm" rightIcon={Eye}>View All</Button></Link>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                  ) : (
                    <TransactionList transactions={transactions} variant="compact" />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Spending Analytics */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Spending Analytics</CardTitle>
                  <div className="flex gap-2">
                    {['week', 'month', 'year'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={cn(
                          'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                          selectedPeriod === period ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent><SpendingChart period={selectedPeriod} /></CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Primary Card */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Card</h2>
                <Link to="/cards"><Button variant="ghost" size="sm">Manage</Button></Link>
              </div>
              {cardsLoading ? (
                <Skeleton className="h-48 rounded-2xl" />
              ) : primaryCard ? (
                <VirtualCard card={primaryCard} variant="gradient" showControls={false} />
              ) : (
                <Card className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No cards yet</p>
                    <Button variant="link" className="mt-2">Apply for a card</Button>
                  </div>
                </Card>
              )}
            </motion.div>

            {/* Insights */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Insights</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50"><TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Spending Down 15%</p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Great job! You spent less this month.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50"><PiggyBank className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">Savings Goal Progress</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">You're 75% towards your vacation fund!</p>
                        <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export { Dashboard };
export default Dashboard;
