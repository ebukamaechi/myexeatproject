// import { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children, role, handleLogout, collapsed, toggleSidebar }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        role={role}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        handleLogout={handleLogout}
      />
      <div
        className={`transition-all duration-300 flex flex-col ${
          collapsed ? 'w-[calc(100%-64px)]' : 'w-[calc(100%-240px)]'
        }`}
      >
        <main className="flex-1 p-4 overflow-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
};


export default Layout;
