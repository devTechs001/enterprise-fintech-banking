import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext({ isOpen: true, isCollapsed: false, toggle: () => {}, collapse: () => {} });

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const collapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, toggle, collapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;
