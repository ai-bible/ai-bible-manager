/**
 * Компонент боковой панели навигации
 */
import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Badge,
  Typography,
  Tooltip
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import TimelineIcon from '@mui/icons-material/Timeline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { useAppSelector } from '../../store/hooks';

interface SidebarProps {
  onItemClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Получаем данные о конфликтах из хранилища
  const unresolvedConflicts = useAppSelector((state) => {
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
  
  // Обработчик навигации
  const handleNavigate = (path: string) => {
    navigate(path);
    onItemClick();
  };
  
  // Проверка активного маршрута
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };
  
  return (
    <Box sx={{ overflow: 'auto' }}>
      {/* Общие разделы */}
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/')} 
            onClick={() => handleNavigate('/')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Дашборд" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider />
      
      {/* Разделы элементов */}
      <Box sx={{ p: 2, pt: 1, pb: 0 }}>
        <Typography variant="body2" color="text.secondary">
          ЭЛЕМЕНТЫ МИРА
        </Typography>
      </Box>
      
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/elements')} 
            onClick={() => handleNavigate('/elements')}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Все элементы" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/relationships')} 
            onClick={() => handleNavigate('/relationships')}
          >
            <ListItemIcon>
              <NetworkCheckIcon />
            </ListItemIcon>
            <ListItemText primary="Связи" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/conflicts')} 
            onClick={() => handleNavigate('/conflicts')}
          >
            <ListItemIcon>
              <Badge badgeContent={unresolvedConflicts} color="error">
                <TimelineIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Конфликты" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider />
      
      {/* Разделы организации */}
      <Box sx={{ p: 2, pt: 1, pb: 0 }}>
        <Typography variant="body2" color="text.secondary">
          ОРГАНИЗАЦИЯ
        </Typography>
      </Box>
      
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/chapters')} 
            onClick={() => handleNavigate('/chapters')}
          >
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="Главы" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/snapshots')} 
            onClick={() => handleNavigate('/snapshots')}
          >
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Снимки" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/briefs')} 
            onClick={() => handleNavigate('/briefs')}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Брифы" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider />
      
      {/* Системные разделы */}
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/settings')} 
            onClick={() => handleNavigate('/settings')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Настройки" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/import-export')} 
            onClick={() => handleNavigate('/import-export')}
          >
            <ListItemIcon>
              <ImportExportIcon />
            </ListItemIcon>
            <ListItemText primary="Импорт/Экспорт" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
