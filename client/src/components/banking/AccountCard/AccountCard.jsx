import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Eye,
  EyeOff,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Settings,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatAccountNumber } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/common/Dropdown';
import { useToast } from '@/hooks/ui/useToast';

const accountTypeStyles = {
  checking: {
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    icon: '💳',
    pattern: 'opacity-10',
  },
  savings: {
    gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
    icon: '🏦',
    pattern: 'opacity-10',
  },
  investment: {
    gradient: 'from-purple-600 via-purple-700 to-pink-800',
    icon: '📈',
    pattern: 'opacity-10',
  },
  credit: {
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    icon: '💎',
    pattern: 'opacity-10',
  },
};

const AccountCard = ({
  account,
  className,
  onTransfer,
  onDeposit,
  onViewDetails,
  variant = 'default',
  showActions = true,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const { toast } = useToast();

  const {
    id,
    accountNumber,
    accountName,
    accountType = 'checking',
    balance,
    currency = 'USD',
    lastTransaction,
    status,
  } = account;

  const styles = accountTypeStyles[accountType] || accountTypeStyles.checking;

  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast({
        title: 'Copied!',
        description: 'Account number copied to clipboard',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'error',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br shadow-card hover:shadow-card-hover',
        'transition-all duration-300 cursor-pointer',
        'group',
        styles.gradient,
        className
      )}
      onClick={onViewDetails}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          'absolute -right-8 -top-8 h-40 w-40 rounded-full',
          'bg-white/10 blur-2xl'
        )} />
        <div className={cn(
          'absolute -bottom-8 -left-8 h-32 w-32 rounded-full',
          'bg-black/10 blur-2xl'
        )} />
        {/* Card Pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={`pattern-${id}`}
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="white" />
            </pattern>
          </defs>
          <rect fill={`url(#pattern-${id})`} width="100%" height="100%" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full min-h-[200px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{styles.icon}</span>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {accountName}
              </h3>
              <p className="text-white/70 text-sm capitalize">
                {accountType} Account
              </p>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onViewDetails}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyAccountNumber}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Account Number
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download Statement
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Balance Section */}
        <div className="my-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/70 text-sm">Available Balance</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBalance(!showBalance);
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              {showBalance ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={showBalance ? 'shown' : 'hidden'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              {showBalance ? (
                formatCurrency(balance, currency)
              ) : (
                <span className="tracking-widest">••••••</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Account Number */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-white/50 text-xs mb-1">Account Number</p>
            <p className="text-white font-mono text-sm tracking-wider">
              {formatAccountNumber(accountNumber)}
            </p>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-white/10 hover:bg-white/20 border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeposit?.(account);
                }}
                leftIcon={ArrowDownLeft}
              >
                Deposit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-white/10 hover:bg-white/20 border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTransfer?.(account);
                }}
                leftIcon={ArrowUpRight}
              >
                Transfer
              </Button>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {status && (
          <div className={cn(
            'absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-medium',
            status === 'active' && 'bg-green-500/20 text-green-300',
            status === 'frozen' && 'bg-red-500/20 text-red-300',
            status === 'pending' && 'bg-yellow-500/20 text-yellow-300'
          )}>
            {status}
          </div>
        )}
      </div>
    </motion.div>
  );
};

AccountCard.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    accountName: PropTypes.string.isRequired,
    accountType: PropTypes.oneOf(['checking', 'savings', 'investment', 'credit']),
    balance: PropTypes.number.isRequired,
    currency: PropTypes.string,
    lastTransaction: PropTypes.object,
    status: PropTypes.oneOf(['active', 'frozen', 'pending']),
  }).isRequired,
  className: PropTypes.string,
  onTransfer: PropTypes.func,
  onDeposit: PropTypes.func,
  onViewDetails: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  showActions: PropTypes.bool,
};

export default AccountCard;
