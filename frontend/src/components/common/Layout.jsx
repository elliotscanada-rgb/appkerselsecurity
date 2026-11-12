import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, menuItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1923 100%)' }}
    >
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          menuItems={menuItems}
        />

        {/* Main content — capped at 1600px so it doesn't stretch on ultra-wide screens */}
        <main className="flex-1 min-h-[calc(100vh-72px)] overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
