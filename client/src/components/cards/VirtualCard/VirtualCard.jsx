import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Copy, 
  Eye, 
  EyeOff, 
  Lock, 
  Snowflake,
  CreditCard as CardIcon
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { formatCardNumber, formatExpiryDate } from '@/utils/formatters';
import { useToast } from '@/hooks/ui/useToast';

const cardVariants = {
  default: {
    front: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black',
    back: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
  },
  gold: {
    front: 'bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-700',
    back: 'bg-gradient-to-br from-yellow-700 via-amber-600 to-yellow-800',
  },
  platinum: {
    front: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
    back: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
  },
  gradient: {
    front: 'bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600',
    back: 'bg-gradient-to-br from-purple-700 via-pink-700 to-blue-700',
  },
  ocean: {
    front: 'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700',
    back: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800',
  },
};

const VirtualCard = ({
  card,
  variant = 'default',
  size = 'default',
  showControls = true,
  interactive = true,
  className,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef(null);
  const { toast } = useToast();

  const {
    cardNumber,
    cardHolder,
    expiryDate,
    cvv,
    cardType = 'visa',
    isFrozen = false,
    isLocked = false,
  } = card;

  const styles = cardVariants[variant] || cardVariants.default;

  const sizeClasses = {
    small: 'w-64 h-40',
    default: 'w-80 h-48',
    large: 'w-96 h-56',
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\s/g, ''));
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        variant: 'error',
      });
    }
  };

  const handleFlip = () => {
    if (interactive) {
      setIsFlipped(!isFlipped);
    }
  };

  const CardLogo = () => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return (
          <span className="text-xl font-bold italic text-white tracking-wider">
            VISA
          </span>
        );
      case 'mastercard':
        return (
          <div className="flex">
            <div className="w-8 h-8 rounded-full bg-red-500 -mr-3" />
            <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80" />
          </div>
        );
      case 'amex':
        return (
          <span className="text-sm font-bold text-white">
            AMERICAN EXPRESS
          </span>
        );
      default:
        return <CardIcon className="w-8 h-8 text-white" />;
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'perspective-1000 cursor-pointer select-none',
        sizeClasses[size],
        className
      )}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full transform-style-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of Card */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden rounded-2xl p-6',
            'shadow-elevated overflow-hidden',
            styles.front,
            (isFrozen || isLocked) && 'opacity-60'
          )}
        >
          {/* Frosted/Locked Overlay */}
          {(isFrozen || isLocked) && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-20 flex items-center justify-center">
              {isFrozen ? (
                <div className="text-center">
                  <Snowflake className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                  <span className="text-white font-medium">Card Frozen</span>
                </div>
              ) : (
                <div className="text-center">
                  <Lock className="w-12 h-12 text-red-300 mx-auto mb-2" />
                  <span className="text-white font-medium">Card Locked</span>
                </div>
              )}
            </div>
          )}

          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl transform -translate-x-16 translate-y-16" />
          </div>

          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Wifi className="w-6 h-6 text-white/80 rotate-90" />
                <span className="text-white/60 text-xs font-medium">
                  Contactless
                </span>
              </div>
              <CardLogo />
            </div>

            {/* Chip */}
            <div className="mt-4">
              <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-md relative overflow-hidden">
                <div className="absolute inset-1 grid grid-cols-3 gap-0.5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-yellow-600/30 rounded-sm"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card Number */}
            <div className="mt-auto mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl text-white tracking-widest">
                  {showDetails
                    ? formatCardNumber(cardNumber)
                    : '•••• •••• •••• ' + cardNumber.slice(-4)}
                </span>
                {showControls && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(cardNumber, 'Card number');
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div>
                <span className="text-white/50 text-xs block mb-1">
                  Card Holder
                </span>
                <span className="text-white font-medium tracking-wide uppercase">
                  {cardHolder}
                </span>
              </div>
              <div className="text-right">
                <span className="text-white/50 text-xs block mb-1">
                  Expires
                </span>
                <span className="text-white font-mono">
                  {showDetails ? expiryDate : '••/••'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden rounded-2xl',
            'shadow-elevated overflow-hidden',
            'transform rotateY-180',
            styles.back
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Magnetic Strip */}
          <div className="w-full h-12 bg-black/80 mt-8" />

          {/* Signature Strip & CVV */}
          <div className="px-6 mt-6">
            <div className="flex gap-4 items-stretch">
              <div className="flex-1 h-10 bg-white/90 rounded flex items-center px-3">
                <span className="text-gray-400 italic text-sm">
                  Authorized Signature
                </span>
              </div>
              <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
                <span className="font-mono text-gray-800 font-bold">
                  {showDetails ? cvv : '•••'}
                </span>
              </div>
            </div>

            {/* Info Text */}
            <div className="mt-6 space-y-2">
              <p className="text-white/50 text-xs">
                This card is property of SecureBank. If found, please return
                to any SecureBank branch.
              </p>
              <p className="text-white/50 text-xs">
                24/7 Support: 1-800-SECURE
              </p>
            </div>
          </div>

          {/* Security Hologram */}
          <div className="absolute bottom-6 right-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 opacity-50 animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
              'text-sm font-medium'
            )}
          >
            {showDetails ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

VirtualCard.propTypes = {
  card: PropTypes.shape({
    cardNumber: PropTypes.string.isRequired,
    cardHolder: PropTypes.string.isRequired,
    expiryDate: PropTypes.string.isRequired,
    cvv: PropTypes.string.isRequired,
    cardType: PropTypes.oneOf(['visa', 'mastercard', 'amex', 'discover']),
    isFrozen: PropTypes.bool,
    isLocked: PropTypes.bool,
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'gold', 'platinum', 'gradient', 'ocean']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  showControls: PropTypes.bool,
  interactive: PropTypes.bool,
  className: PropTypes.string,
};

export default VirtualCard;