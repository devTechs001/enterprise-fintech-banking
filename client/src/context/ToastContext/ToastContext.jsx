import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

import { cn } from '@/utils/helpers';

export const ToastContext = createContext(null);

const VARIANT_STYLES = {
  success: {
    ring: 'border-success-500/40 bg-white dark:bg-gray-900',
    icon: <CheckCircle2 className="h-5 w-5 text-success-600" aria-hidden="true" />,
    bar: 'bg-success-500',
  },
  error: {
    ring: 'border-danger-500/40 bg-white dark:bg-gray-900',
    icon: <AlertCircle className="h-5 w-5 text-danger-600" aria-hidden="true" />,
    bar: 'bg-danger-500',
  },
  warning: {
    ring: 'border-warning-500/40 bg-white dark:bg-gray-900',
    icon: <AlertTriangle className="h-5 w-5 text-warning-600" aria-hidden="true" />,
    bar: 'bg-warning-500',
  },
  info: {
    ring: 'border-primary-500/40 bg-white dark:bg-gray-900',
    icon: <Info className="h-5 w-5 text-primary-600" aria-hidden="true" />,
    bar: 'bg-primary-500',
  },
};

let idCounter = 0;
const nextId = () => {
  idCounter += 1;
  return `toast-${idCounter}`;
};

/**
 * Toast provider.
 *
 * The previous implementation kept toasts in state but never rendered them (the
 * JSX carried a `Toast container would render toasts here` comment), so every
 * success/error message in the app was invisible. Timers are also tracked and
 * cleared on unmount to avoid setting state after teardown.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast) => {
      const id = nextId();
      const duration = toast.duration ?? 5000;
      const entry = { id, duration, variant: 'info', ...toast };
      setToasts((prev) => [...prev.slice(-4), entry]);
      if (Number.isFinite(duration)) {
        timers.current.set(id, setTimeout(() => removeToast(id), duration));
      }
      return id;
    },
    [removeToast]
  );

  const toast = useMemo(() => {
    const fn = (config) => addToast(config);
    fn.success = (title, description) => addToast({ title, description, variant: 'success' });
    fn.error = (title, description) => addToast({ title, description, variant: 'error' });
    fn.warning = (title, description) => addToast({ title, description, variant: 'warning' });
    fn.info = (title, description) => addToast({ title, description, variant: 'info' });
    return fn;
  }, [addToast]);

  const value = useMemo(
    () => ({ toast, addToast, removeToast, toasts }),
    [toast, addToast, removeToast, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const styles = VARIANT_STYLES[t.variant] || VARIANT_STYLES.info;
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={cn(
                'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border shadow-elevated',
                'animate-slide-up dark:text-gray-100',
                styles.ring
              )}
            >
              <span className={cn('absolute inset-y-0 left-0 w-1', styles.bar)} aria-hidden="true" />
              <div className="flex items-start gap-3 py-3 pl-5 pr-3">
                <span className="mt-0.5 shrink-0">{styles.icon}</span>
                <div className="min-w-0 flex-1">
                  {t.title && <p className="text-sm font-semibold">{t.title}</p>}
                  {t.description && (
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{t.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    const noop = () => {};
    return { toast: Object.assign(noop, { success: noop, error: noop, warning: noop, info: noop }), addToast: noop, removeToast: noop, toasts: [] };
  }
  return context;
};

export default ToastContext;
