import { createContext, useContext, useId, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const TabsContext = createContext(null);
const useTabs = () => useContext(TabsContext);

/**
 * Accessible tabs. Uses the roving-tabindex pattern: arrow keys move between
 * triggers, Home/End jump to the ends, and the panel is wired up with
 * aria-labelledby / aria-controls.
 */
const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const generatedId = useId();
  const [internal, setInternal] = useState(defaultValue ?? '');
  const active = value ?? internal;
  const setActive = (next) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const ctx = useMemo(() => ({ active, setActive, idBase: generatedId }), [active, setActive, generatedId]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn('w-full', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children, ...props }) => {
  const { active, setActive, idBase } = useTabs();
  const values = [];
  const onKeyDown = (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = values.indexOf(active);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % values.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + values.length) % values.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = values.length - 1;
    const target = values[next];
    setActive(target);
    document.getElementById(`${idBase}-trigger-${target}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800',
        className
      )}
      ref={(node) => {
        if (node) {
          values.length = 0;
          node.querySelectorAll('[role="tab"]').forEach((t) => values.push(t.dataset.value));
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, className, children, ...props }) => {
  const { active, setActive, idBase } = useTabs();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-trigger-${value}`}
      data-value={value}
      aria-selected={selected}
      aria-controls={`${idBase}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActive(value)}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected
          ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-white'
          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const { active, idBase } = useTabs();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-trigger-${value}`}
      tabIndex={0}
      className={cn('mt-4 focus:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.propTypes = { defaultValue: PropTypes.string, value: PropTypes.string, onValueChange: PropTypes.func, className: PropTypes.string, children: PropTypes.node };
TabsList.propTypes = { className: PropTypes.string, children: PropTypes.node };
TabsTrigger.propTypes = { value: PropTypes.string.isRequired, className: PropTypes.string, children: PropTypes.node };
TabsContent.propTypes = { value: PropTypes.string.isRequired, className: PropTypes.string, children: PropTypes.node };

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
