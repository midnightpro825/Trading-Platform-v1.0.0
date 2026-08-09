import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

const AdminLayout = ({ children, activePage, setActivePage, onLogout, user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSetActivePage = (page) => {
    console.log('📄 AdminLayout: Setting page to:', page);
    if (typeof setActivePage === 'function') {
      setActivePage(page);
    } else {
      console.error('❌ setActivePage is not a function in AdminLayout');
    }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#0a0b0e' }}>
      <AdminSidebar
        activePage={activePage}
        setActivePage={handleSetActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="admin-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AdminHeader
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onLogout={onLogout}
          user={user}
        />
        <main className="admin-main" style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;