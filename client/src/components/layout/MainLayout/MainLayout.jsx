import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/helpers';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { Footer } from './Footer/Footer';
import { SidebarProvider } from '@/context/SidebarContext';

const MainLayout = ({ children, className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const collapseSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          onCollapse={collapseSidebar}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            'transition-all duration-300',
            sidebarOpen && !sidebarCollapsed ? 'ml-72' : 'ml-20'
          )}
        >
          {/* Header */}
          <Header
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />

          {/* Page Content */}
          <main
            className={cn(
              'min-h-[calc(100vh-4rem)] p-6',
              className
            )}
          >
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export { MainLayout };
export default MainLayout;
