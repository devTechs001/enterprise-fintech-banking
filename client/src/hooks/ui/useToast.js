import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const TOAST_POSITIONS = {
  topRight: 'top-right',
  topLeft: 'top-left',
  bottomRight: 'bottom-right',
  bottomLeft: 'bottom-left',
  topCenter: 'top-center',
  bottomCenter: 'bottom-center',
};

export const ToastProvider = ({ children, position = TOAST_POSITIONS.topRight }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    const newToast = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant || TOAST_TYPES.info,
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((options) => {
    return addToast(options);
  }, [addToast]);

  toast.success = useCallback((title, description) => {
    return addToast({ title, description, variant: TOAST_TYPES.success });
  }, [addToast]);

  toast.error = useCallback((title, description) => {
    return addToast({ title, description, variant: TOAST_TYPES.error });
  }, [addToast]);

  toast.warning = useCallback((title, description) => {
    return addToast({ title, description, variant: TOAST_TYPES.warning });
  }, [addToast]);

  toast.info = useCallback((title, description) => {
    return addToast({ title, description, variant: TOAST_TYPES.info });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast, position }}>
      {children}
      {/* Toast Container would be rendered here */}
      <div className={`fixed z-50 p-4 ${getPositionClasses(position)}`}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`mb-2 p-4 rounded-lg shadow-lg ${getVariantClasses(t.variant)}`}
          >
            {t.title && <h4 className="font-semibold">{t.title}</h4>}
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(Object.values(TOAST_POSITIONS)),
};

const getPositionClasses = (position) => {
  const positions = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };
  return positions[position] || positions['top-right'];
};

const getVariantClasses = (variant) => {
  const variants = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };
  return variants[variant] || variants.info;
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export { TOAST_TYPES, TOAST_POSITIONS };
export default ToastContext;
