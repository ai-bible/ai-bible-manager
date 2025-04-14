/**
 * Страница дашборда (главного экрана) приложения
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { WorldElement } from '../types/Element';
import { addElement, createSnapshot } from '../store/slices/worldSlice';
import { openModal } from '../store/slices/uiSlice';

// Иконки
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NoteIcon from '@mui/icons-material/Note';

// Компоненты
import RelationshipGraph from '../components/visualizations/RelationshipGraph';

// Количество элементов для отображения в списках
const MAX_ELEMENTS_IN_LIST = 5;

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние статистики
  const [stats, setStats] = useState({
    totalElements: 0,
    elementsByType: {} as Record<string, number>,
    recentlyCreated: [] as WorldElement[],
    recentlyModified: [] as WorldElement[],
    unresolvedConflicts: 0,
    chapters: 0
  });
  
  // Обновление статистики при загрузке страницы и изменении мира
  useEffect(() => {
    if (!currentWorld) return;
    
    // Общее количество элементов
    const totalElements = Object.keys(currentWorld.elements).length;
    
    // Количество элементов по типам
    const elementsByType: Record<string, number> = {};
    Object.values(currentWorld.elements).forEach(element => {
      if (!elementsByType[element.type]) {
        elementsByType[element.type] = 0;
      }
      elementsByType[element.type]++;
    });
    
    // Недавно созданные элементы (сортируем по дате создания)
    const recentlyCreated = Object.values(currentWorld.elements)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_ELEMENTS_IN_LIST);
    
    // Недавно измененные элементы (сортируем по дате изменения)
    const recentlyModified = Object.values(currentWorld.elements)
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
      .slice(0, MAX_ELEMENTS_IN_LIST);
    
    // Количество неразрешенных конфликтов
    let unresolvedConflicts = 0;
    Object.values(currentWorld.elements).forEach(element => {
      unresolvedConflicts += element.conflicts.filter(c => c.status === 'unresolved').length;
    });
    
    // Количество глав
    const chapters = currentWorld.chapters.length;
    
    // Обновляем статистику
    setStats({
      totalElements,
      elementsByType,
      recentlyCreated,
      recentlyModified,
      unresolvedConflicts,
      chapters
    });
  }, [currentWorld]);
  
  // Открытие модального окна для создания элемента
  const handleCreateElement = () => {
    dispatch(openModal({
      type: 'createElement',
      data: {}
    }));
  };
  
  // Открытие модального окна для создания главы
  const handleCreateChapter = () => {
    dispatch(openModal({
      type: 'createChapter',
      data: {}
    }));
  };
  
  // Создание снимка мира
  const handleCreateSnapshot = () => {
    dispatch(openModal({
      type: 'createSnapshot',
      data: {}
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
        return <NoteIcon />;
    }
  };
  
  // Переход к странице элемента
  const navigateToElement = (elementId: string) => {
    navigate(`/elements/${elementId}`);
  };
  
  if (!currentWorld) {
    return null; // Если мир не загружен, ничего не показываем
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Дашборд: {currentWorld.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {currentWorld.description}
        </Typography>
      </Box>
      
      {/* Верхняя строка с общей статистикой и визуализацией */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Общая статистика
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h3">{stats.totalElements}</Typography>
                  <Typography variant="body2" color="text.secondary">Элементов</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h3">{stats.chapters}</Typography>
                  <Typography variant="body2" color="text.secondary">Глав</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography 
                    variant="h3" 
                    color={stats.unresolvedConflicts > 0 ? 'error.main' : 'text.primary'}
                  >
                    {stats.unresolvedConflicts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Конфликтов</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h3">{currentWorld.snapshots.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Снимков</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Элементы по типам
            </Typography>
            
            <Grid container spacing={1}>
              {Object.entries(stats.elementsByType).map(([type, count]) => (
                <Grid item xs={6} key={type}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                  }}>
                    <Box sx={{ mr: 1 }}>
                      {getElementTypeIcon(type)}
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        {getElementTypeName(type)}
                      </Typography>
                      <Typography variant="h6">
                        {count}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined" 
                startIcon={<CameraAltIcon />}
                onClick={handleCreateSnapshot}
              >
                Создать снимок
              </Button>
              
              <Button 
                variant="outlined" 
                color={stats.unresolvedConflicts > 0 ? 'error' : 'primary'}
                startIcon={<TimelineIcon />}
                onClick={() => navigate('/conflicts')}
              >
                {stats.unresolvedConflicts > 0 ? 'Решить конфликты' : 'Конфликты'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Граф связей
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/relationships')}
              >
                Подробнее
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 350 }}>
              {stats.totalElements > 0 ? (
                <RelationshipGraph height={350} width="100%" />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%',
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Создайте элементы и связи между ними, чтобы увидеть граф
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Вторая строка с элементами и главами */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Недавно добавленные элементы
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateElement}
                  sx={{ mr: 1 }}
                >
                  Добавить
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/elements')}
                >
                  Все элементы
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {stats.recentlyCreated.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: 200,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  У вас пока нет элементов. Создайте первый элемент, чтобы начать работу.
                </Typography>
              </Box>
            ) : (
              <List>
                {stats.recentlyCreated.map((element) => (
                  <ListItem 
                    key={element.id}
                    button 
                    divider
                    onClick={() => navigateToElement(element.id)}
                  >
                    <ListItemIcon>
                      {getElementTypeIcon(element.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={element.name}
                      secondary={`${getElementTypeName(element.type)} · Создан ${new Date(element.createdAt).toLocaleDateString()}`}
                    />
                    {element.conflicts.some(c => c.status === 'unresolved') && (
                      <Tooltip title="Есть неразрешенные конфликты">
                        <Badge badgeContent={element.conflicts.filter(c => c.status === 'unresolved').length} color="error">
                          <WarningIcon color="error" />
                        </Badge>
                      </Tooltip>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Главы
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateChapter}
                  sx={{ mr: 1 }}
                >
                  Добавить
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/chapters')}
                >
                  Все главы
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {currentWorld.chapters.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: 200,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  У вас пока нет глав. Создайте первую главу, чтобы организовать ваш мир.
                </Typography>
              </Box>
            ) : (
              <List>
                {currentWorld.chapters
                  .sort((a, b) => a.order - b.order)
                  .slice(0, MAX_ELEMENTS_IN_LIST)
                  .map((chapter) => (
                    <ListItem 
                      key={chapter.id}
                      button 
                      divider
                      onClick={() => navigate(`/chapters/${chapter.id}`)}
                    >
                      <ListItemIcon>
                        <MenuBookIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={chapter.title}
                        secondary={`Новых элементов: ${chapter.newElements.length}, Изменённых: ${chapter.modifiedElements.length}`}
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Вспомогательная функция для получения названия типа элемента
const getElementTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'character': 'Персонаж',
    'technology': 'Технология',
    'location': 'Локация',
    'event': 'Событие',
    'concept': 'Концепция',
    'social': 'Социальная структура',
    'rule': 'Правило мира'
  };
  
  return typeNames[type] || type;
};

export default Dashboard;
