import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = { id, duration: 5000, ...toast };
    setToasts((prev) => [...prev, newToast]);
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((toastConfig) => addToast(toastConfig), [addToast]);
  toast.success = (title, description) => addToast({ title, description, variant: 'success' });
  toast.error = (title, description) => addToast({ title, description, variant: 'error' });
  toast.warning = (title, description) => addToast({ title, description, variant: 'warning' });
  toast.info = (title, description) => addToast({ title, description, variant: 'info' });

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast, toasts }}>
      {children}
      {/* Toast container would render toasts here */}
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return { toast: () => {}, success: () => {}, error: () => {}, warning: () => {}, info: () => {} };
  }
  return context;
};

export default ToastContext;
