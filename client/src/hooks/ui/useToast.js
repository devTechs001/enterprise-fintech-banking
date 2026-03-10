import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }
  return context;
};

export default useToast;
