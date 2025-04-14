/**
 * Компонент основного макета приложения
 */
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleSidebar, setSidebarWidth } from '../../store/slices/uiSlice';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const sidebarOpen = useAppSelector((state) => state.ui.sidebar.isOpen);
  const sidebarWidth = useAppSelector((state) => state.ui.sidebar.width);
  const currentWorldId = useAppSelector((state) => state.world.currentWorldId);
  const currentWorld = useAppSelector((state) => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Мобильное представление
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Обрабатываем изменение размера экрана
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  }, [isMobile]);
  
  // Обработчик переключения мобильного меню
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Обработчик переключения бокового меню
  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };
  
  // Если мир не выбран, отображаем только детей без боковой панели
  if (!currentWorldId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Bible-Manager
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            backgroundColor: theme.palette.background.default,
            overflow: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Шапка */}
      <Header 
        isMobile={isMobile}
        onMenuClick={isMobile ? handleMobileDrawerToggle : handleSidebarToggle}
        worldName={currentWorld?.name || 'Bible-Manager'}
      />
      
      {/* Мобильная боковая панель */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{
            keepMounted: true, // Лучшая мобильная производительность
          }}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <IconButton onClick={handleMobileDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Sidebar onItemClick={() => setMobileOpen(false)} />
        </Drawer>
      )}
      
      {/* Десктопная боковая панель */}
      {!isMobile && (
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Sidebar onItemClick={() => {}} />
        </Drawer>
      )}
      
      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: !isMobile && sidebarOpen ? `${sidebarWidth}px` : 0,
          width: !isMobile && sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: theme.palette.background.default,
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
