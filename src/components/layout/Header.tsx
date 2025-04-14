/**
 * Компонент верхней панели приложения
 */
import React, { useState, useRef } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Tooltip, 
  Badge,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TimelineIcon from '@mui/icons-material/Timeline';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTheme, updateFilters } from '../../store/slices/uiSlice';
import { debounce } from 'lodash';

interface HeaderProps {
  isMobile: boolean;
  onMenuClick: () => void;
  worldName: string;
}

const Header: React.FC<HeaderProps> = ({ isMobile, onMenuClick, worldName }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.ui.theme);
  const searchQuery = useAppSelector((state) => state.ui.filters.searchQuery);
  const unresolved = useAppSelector((state) => {
    const currentWorldId = state.world.currentWorldId;
    if (!currentWorldId) return 0;
    
    const world = state.world.worlds[currentWorldId];
    let count = 0;
    
    // Подсчитываем неразрешенные конфликты
    Object.values(world.elements).forEach(element => {
      count += element.conflicts.filter(c => c.status === 'unresolved').length;
    });
    
    return count;
  });
  
  // Состояние для выпадающих меню
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Обработчики для выпадающих меню
  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  };
  
  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };
  
  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsMenuAnchor(event.currentTarget);
  };
  
  const handleNotificationsMenuClose = () => {
    setNotificationsMenuAnchor(null);
  };
  
  // Переключение темы
  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
    handleSettingsMenuClose();
  };
  
  // Переход к настройкам
  const goToSettings = () => {
    navigate('/settings');
    handleSettingsMenuClose();
  };
  
  // Переход к экспорту/импорту
  const goToImportExport = () => {
    navigate('/import-export');
    handleSettingsMenuClose();
  };
  
  // Переход к конфликтам
  const goToConflicts = () => {
    navigate('/conflicts');
    handleNotificationsMenuClose();
  };
  
  // Обработчик поиска с дебаунсом
  const handleSearchChange = debounce((value: string) => {
    dispatch(updateFilters({ searchQuery: value }));
  }, 300);
  
  return (
    <AppBar position="fixed" color="default">
      <Toolbar>
        {/* Кнопка меню */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Название мира */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 0, mr: 4 }}
        >
          {worldName}
        </Typography>
        
        {/* Поиск */}
        {!isMobile && (
          <TextField
            placeholder="Поиск элементов..."
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            defaultValue={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Действия в правой части */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Кнопка уведомлений */}
          <Tooltip title="Уведомления">
            <IconButton
              color="inherit"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge badgeContent={unresolved} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Кнопка настроек */}
          <Tooltip title="Настройки">
            <IconButton
              color="inherit"
              onClick={handleSettingsMenuOpen}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Меню настроек */}
        <Menu
          anchorEl={settingsMenuAnchor}
          open={Boolean(settingsMenuAnchor)}
          onClose={handleSettingsMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={toggleTheme}>
            {theme === 'light' ? <DarkModeIcon sx={{ mr: 2 }} /> : <LightModeIcon sx={{ mr: 2 }} />}
            {theme === 'light' ? 'Темная тема' : 'Светлая тема'}
          </MenuItem>
          <MenuItem onClick={goToSettings}>
            <SettingsIcon sx={{ mr: 2 }} />
            Настройки
          </MenuItem>
          <Divider />
          <MenuItem onClick={goToImportExport}>
            <CloudUploadIcon sx={{ mr: 2 }} />
            Экспорт/Импорт
          </MenuItem>
        </Menu>
        
        {/* Меню уведомлений */}
        <Menu
          anchorEl={notificationsMenuAnchor}
          open={Boolean(notificationsMenuAnchor)}
          onClose={handleNotificationsMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Уведомления</Typography>
          </Box>
          <Divider />
          
          {unresolved > 0 ? (
            <MenuItem onClick={goToConflicts}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 1 }}>
                <Badge badgeContent={unresolved} color="error" sx={{ mt: 1, mr: 2 }}>
                  <TimelineIcon />
                </Badge>
                <Box>
                  <Typography variant="body1">
                    Обнаружены конфликты в элементах
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Необходимо разрешить {unresolved} конфликт(ов)
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Нет новых уведомлений
              </Typography>
            </Box>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
