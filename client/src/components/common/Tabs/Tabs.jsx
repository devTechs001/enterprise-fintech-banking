import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';

const Tabs = ({ children, defaultValue, value, onValueChange, className }) => {
  return (
    <div className={cn('w-full', className)}>
      <TabsContext.Provider value={{ defaultValue, value, onValueChange }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  className: PropTypes.string,
};

import { createContext, useContext } from 'react';

const TabsContext = createContext({});

const TabsList = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const TabsTrigger = ({ children, value, className, ...props }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      onClick={() => onValueChange?.(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
        isActive
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
      role="tab"
      aria-selected={isActive}
      {...props}
    >
      {children}
    </button>
  );
};

TabsTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const TabsContent = ({ children, value, className, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);

  if (selectedValue !== value) return null;

  return (
    <div
      className={cn('mt-4', className)}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  );
};

TabsContent.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
