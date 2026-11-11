import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navbar */}
      <Navbar handleDrawerToggle={handleDrawerToggle} />

      {/* Side Navigation Drawer */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <Toolbar sx={{ height: 70 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
