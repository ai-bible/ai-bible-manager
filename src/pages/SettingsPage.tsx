/**
 * Страница настроек приложения и текущего мира
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Switch,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateWorldProperties, updateWorldSettings } from '../store/slices/worldSlice';
import { setTheme, addNotification } from '../store/slices/uiSlice';
import { storageService } from '../services/storage';

// Иконки
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import StorageIcon from '@mui/icons-material/Storage';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import InfoIcon from '@mui/icons-material/Info';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  const currentTheme = useAppSelector(state => state.ui.theme);
  
  // Состояние для вкладок
  const [currentTab, setCurrentTab] = useState<'world' | 'app'>('world');
  
  // Состояние для формы редактирования мира
  const [worldName, setWorldName] = useState<string>(currentWorld?.name || '');
  const [worldDescription, setWorldDescription] = useState<string>(currentWorld?.description || '');
  
  // Состояние для настроек мира
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(
    currentWorld?.settings.autoSaveInterval || 5
  );
  const [maxSnapshots, setMaxSnapshots] = useState<number>(
    currentWorld?.settings.maxSnapshots || 50
  );
  const [conflictDetectionLevel, setConflictDetectionLevel] = useState<string>(
    currentWorld?.settings.conflictDetectionLevel || 'moderate'
  );
  const [defaultCanonTier, setDefaultCanonTier] = useState<string>(
    currentWorld?.settings.defaultCanonTier || 'secondary'
  );
  
  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: 'world' | 'app') => {
    setCurrentTab(newValue);
  };
  
  // Обработчик сохранения основных свойств мира
  const handleSaveWorldProperties = () => {
    if (!currentWorldId) return;
    
    dispatch(updateWorldProperties({
      name: worldName.trim(),
      description: worldDescription.trim()
    }));
    
    // Показываем уведомление
    dispatch(addNotification({
      type: 'success',
      message: 'Свойства мира обновлены',
      autoHide: true
    }));
  };
  
  // Обработчик сохранения настроек мира
  const handleSaveWorldSettings = () => {
    if (!currentWorldId) return;
    
    dispatch(updateWorldSettings({
      autoSaveInterval,
      maxSnapshots,
      conflictDetectionLevel: conflictDetectionLevel as any,
      defaultCanonTier
    }));
    
    // Обновляем автосохранение
    if (autoSaveInterval > 0) {
      storageService.setupAutoSave(autoSaveInterval, async () => {
        console.log('Автосохранение...');
        // Здесь может быть логика автосохранения
      });
    } else {
      storageService.disableAutoSave();
    }
    
    // Показываем уведомление
    dispatch(addNotification({
      type: 'success',
      message: 'Настройки мира обновлены',
      autoHide: true
    }));
  };
  
  // Обработчик изменения темы
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme));
    
    // Показываем уведомление
    dispatch(addNotification({
      type: 'success',
      message: `Тема изменена на ${getThemeDisplayName(newTheme)}`,
      autoHide: true
    }));
  };
  
  // Если мир не загружен и открыта вкладка настроек мира, показываем сообщение
  if (!currentWorld && currentTab === 'world') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Мир не загружен. Пожалуйста, создайте или выберите мир для начала работы.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Настройки
        </Typography>
      </Box>
      
      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab
            value="world"
            label="Настройки мира"
            icon={<PublicIcon />}
            iconPosition="start"
            disabled={!currentWorld}
          />
          <Tab
            value="app"
            label="Настройки приложения"
            icon={<SettingsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {/* Настройки мира */}
      {currentTab === 'world' && currentWorld && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Основные сведения
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TextField
              label="Название мира"
              fullWidth
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              value={worldDescription}
              onChange={(e) => setWorldDescription(e.target.value)}
              margin="normal"
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveWorldProperties}
                disabled={!worldName.trim()}
              >
                Сохранить
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Настройки мира
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography id="auto-save-slider" gutterBottom>
                Интервал автосохранения: {autoSaveInterval} мин
                {autoSaveInterval === 0 && ' (отключено)'}
              </Typography>
              <Slider
                value={autoSaveInterval}
                onChange={(e, value) => setAutoSaveInterval(value as number)}
                aria-labelledby="auto-save-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={30}
              />
              <Typography variant="caption" color="text.secondary">
                0 = отключено, рекомендуемое значение: 5 минут
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography id="max-snapshots-slider" gutterBottom>
                Максимальное количество снимков: {maxSnapshots}
              </Typography>
              <Slider
                value={maxSnapshots}
                onChange={(e, value) => setMaxSnapshots(value as number)}
                aria-labelledby="max-snapshots-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={10}
                max={100}
              />
              <Typography variant="caption" color="text.secondary">
                При превышении лимита старые снимки будут автоматически удаляться
              </Typography>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="conflict-detection-label">Уровень обнаружения конфликтов</InputLabel>
              <Select
                labelId="conflict-detection-label"
                value={conflictDetectionLevel}
                onChange={(e) => setConflictDetectionLevel(e.target.value)}
                label="Уровень обнаружения конфликтов"
              >
                <MenuItem value="strict">Строгий (больше проверок)</MenuItem>
                <MenuItem value="moderate">Умеренный</MenuItem>
                <MenuItem value="lenient">Мягкий (меньше проверок)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="default-canon-tier-label">Уровень канона по умолчанию</InputLabel>
              <Select
                labelId="default-canon-tier-label"
                value={defaultCanonTier}
                onChange={(e) => setDefaultCanonTier(e.target.value)}
                label="Уровень канона по умолчанию"
              >
                <MenuItem value="primary">Первичный канон</MenuItem>
                <MenuItem value="secondary">Вторичный канон</MenuItem>
                <MenuItem value="speculative">Предположение</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveWorldSettings}
              >
                Сохранить настройки
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Информация о мире
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="ID мира" 
                  secondary={currentWorld.id} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Дата создания" 
                  secondary={new Date(currentWorld.createdAt).toLocaleString()} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Последнее изменение" 
                  secondary={new Date(currentWorld.modifiedAt).toLocaleString()} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Количество элементов" 
                  secondary={Object.keys(currentWorld.elements).length} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Неразрешенные конфликты" 
                  secondary={
                    Object.values(currentWorld.elements).reduce((count, element) => {
                      return count + element.conflicts.filter(c => c.status === 'unresolved').length;
                    }, 0)
                  } 
                />
              </ListItem>
            </List>
          </Paper>
        </>
      )}
      
      {/* Настройки приложения */}
      {currentTab === 'app' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Внешний вид
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem>
              <ListItemIcon>
                {currentTheme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText 
                primary="Тема оформления" 
                secondary={getThemeDisplayName(currentTheme)} 
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleThemeChange('light')}
                  sx={{ mr: 1 }}
                  color={currentTheme === 'light' ? 'primary' : 'inherit'}
                >
                  Светлая
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleThemeChange('dark')}
                  sx={{ mr: 1 }}
                  color={currentTheme === 'dark' ? 'primary' : 'inherit'}
                >
                  Темная
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleThemeChange('system')}
                  color={currentTheme === 'system' ? 'primary' : 'inherit'}
                >
                  Системная
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              <Typography variant="body2">
                Bible-Manager хранит все данные локально в вашем браузере. Для переноса данных между устройствами
                используйте функции экспорта и импорта на странице "Импорт/Экспорт".
              </Typography>
            </Alert>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Вспомогательные функции
const getThemeDisplayName = (theme: string): string => {
  switch (theme) {
    case 'light':
      return 'Светлая';
    case 'dark':
      return 'Темная';
    case 'system':
      return 'Системная';
    default:
      return theme;
  }
};

export default SettingsPage;
