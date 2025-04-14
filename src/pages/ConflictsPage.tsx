/**
 * Страница для отображения и разрешения конфликтов между элементами
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { WorldElement, Conflict } from '../types/Element';
import { openModal } from '../store/slices/uiSlice';

// Иконки
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';

// Интерфейс для отображаемого конфликта
interface DisplayConflict {
  id: string;
  sourceElement: WorldElement;
  targetElement: WorldElement | null;
  conflict: Conflict;
}

const ConflictsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для вкладок
  const [currentTab, setCurrentTab] = useState('unresolved');
  
  // Список конфликтов
  const [conflicts, setConflicts] = useState<{
    unresolved: DisplayConflict[];
    resolved: DisplayConflict[];
    ignored: DisplayConflict[];
  }>({
    unresolved: [],
    resolved: [],
    ignored: []
  });
  
  // Загружаем конфликты при изменении мира или вкладки
  useEffect(() => {
    if (!currentWorld) return;
    
    const allConflicts: DisplayConflict[] = [];
    
    // Собираем все конфликты из элементов
    Object.values(currentWorld.elements).forEach(element => {
      element.conflicts.forEach(conflict => {
        const targetElement = currentWorld.elements[conflict.withElementId];
        allConflicts.push({
          id: `${element.id}-${conflict.id}`,
          sourceElement: element,
          targetElement: targetElement || null,
          conflict
        });
      });
    });
    
    // Группируем конфликты по статусу
    setConflicts({
      unresolved: allConflicts.filter(c => c.conflict.status === 'unresolved'),
      resolved: allConflicts.filter(c => c.conflict.status === 'resolved'),
      ignored: allConflicts.filter(c => c.conflict.status === 'ignored')
    });
  }, [currentWorld]);
  
  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };
  
  // Обработчик открытия модального окна разрешения конфликта
  const handleResolveConflict = (elementId: string, conflictId: string) => {
    dispatch(openModal({
      type: 'resolveConflict',
      data: {
        elementId,
        conflictId
      }
    }));
  };
  
  // Получение иконки для типа элемента
  const getElementTypeIcon = (type: string) => {
    switch (type) {
      case 'character':
        return <PersonIcon />;
      case 'technology':
        return <DevicesIcon />;
      case 'location':
        return <LocationOnIcon />;
      case 'event':
        return <EventIcon />;
      case 'concept':
        return <ForumIcon />;
      case 'social':
        return <AccountTreeIcon />;
      case 'rule':
        return <RuleIcon />;
      default:
        return null;
    }
  };
  
  // Получение иконки для статуса конфликта
  const getConflictStatusIcon = (status: string) => {
    switch (status) {
      case 'unresolved':
        return <ErrorIcon color="error" />;
      case 'ignored':
        return <WarningIcon color="warning" />;
      case 'resolved':
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };
  
  // Получение цвета для статуса конфликта
  const getConflictStatusColor = (status: string) => {
    switch (status) {
      case 'unresolved':
        return 'error';
      case 'ignored':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Получение текста для статуса конфликта
  const getConflictStatusText = (status: string) => {
    switch (status) {
      case 'unresolved':
        return 'Не разрешен';
      case 'ignored':
        return 'Игнорируется';
      case 'resolved':
        return 'Разрешен';
      default:
        return status;
    }
  };
  
  // Если мир не загружен, показываем сообщение
  if (!currentWorld) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Мир не загружен. Пожалуйста, создайте или выберите мир для начала работы.
        </Alert>
      </Box>
    );
  }
  
  // Получение конфликтов для текущей вкладки
  const currentConflicts = conflicts[currentTab as keyof typeof conflicts];
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Конфликты элементов
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Анализ и разрешение потенциальных противоречий между элементами мира.
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
            value="unresolved"
            label={
              <Badge 
                badgeContent={conflicts.unresolved.length} 
                color="error"
                max={99}
                showZero
              >
                Не разрешенные
              </Badge>
            }
          />
          <Tab
            value="ignored"
            label={
              <Badge 
                badgeContent={conflicts.ignored.length} 
                color="warning"
                max={99}
                showZero
              >
                Игнорируемые
              </Badge>
            }
          />
          <Tab
            value="resolved"
            label={
              <Badge 
                badgeContent={conflicts.resolved.length} 
                color="success"
                max={99}
                showZero
              >
                Разрешенные
              </Badge>
            }
          />
        </Tabs>
      </Paper>
      
      {/* Список конфликтов */}
      <Paper sx={{ p: 2 }}>
        {currentConflicts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {currentTab === 'unresolved'
                ? 'Отлично! У вас нет неразрешенных конфликтов.'
                : currentTab === 'ignored'
                ? 'В данный момент нет игнорируемых конфликтов.'
                : 'Нет разрешенных конфликтов.'}
            </Typography>
          </Box>
        ) : (
          <List>
            {currentConflicts.map(({ id, sourceElement, targetElement, conflict }) => (
              <ListItem 
                key={id} 
                divider
                alignItems="flex-start"
                sx={{ 
                  p: 2,
                  borderLeft: `4px solid ${
                    conflict.status === 'unresolved' 
                      ? theme.palette.error.main 
                      : conflict.status === 'ignored' 
                      ? theme.palette.warning.main
                      : theme.palette.success.main
                  }`
                }}
              >
                <ListItemIcon>
                  {getConflictStatusIcon(conflict.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="span">
                        Конфликт между элементами
                      </Typography>
                      <Chip
                        label={getConflictStatusText(conflict.status)}
                        size="small"
                        color={getConflictStatusColor(conflict.status) as any}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body1" color="error.main" sx={{ mb: 2 }}>
                        {conflict.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Paper sx={{ p: 1, flex: 1, display: 'flex', alignItems: 'center' }}>
                          {getElementTypeIcon(sourceElement.type)}
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body2">
                              {sourceElement.name}
                            </Typography>
                          </Box>
                        </Paper>
                        <Paper sx={{ p: 1, flex: 1, display: 'flex', alignItems: 'center' }}>
                          {targetElement ? getElementTypeIcon(targetElement.type) : null}
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body2">
                              {targetElement ? targetElement.name : 'Удаленный элемент'}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                      
                      {conflict.status === 'resolved' && conflict.resolution && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Решение:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            {conflict.resolution}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Разрешено: {conflict.resolvedAt ? new Date(conflict.resolvedAt).toLocaleString() : 'Дата не указана'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="Просмотреть элемент">
                      <IconButton 
                        edge="end" 
                        onClick={() => navigate(`/elements/${sourceElement.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {conflict.status === 'unresolved' && (
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        onClick={() => handleResolveConflict(sourceElement.id, conflict.id)}
                      >
                        Разрешить
                      </Button>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ConflictsPage;
