/**
 * Компонент для отображения детальной информации об элементе мира
 */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Grid,
  Button,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Badge
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { WorldElement, ElementType, CanonTier } from '../../types/Element';
import { deleteElement, addRelationship, deleteRelationship } from '../../store/slices/worldSlice';
import { openModal } from '../../store/slices/uiSlice';

// Иконки
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ErrorIcon from '@mui/icons-material/Error';

// Компоненты
import RelationshipForm from './RelationshipForm';
import RelationshipGraph from '../visualizations/RelationshipGraph';

interface ElementDetailsProps {
  element: WorldElement;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ElementDetails: React.FC<ElementDetailsProps> = ({
  element,
  onEdit,
  onDelete
}) => {
  const dispatch = useAppDispatch();
  const currentWorldId = useAppSelector((state) => state.world.currentWorldId);
  const allElements = useAppSelector((state) => 
    currentWorldId ? state.world.worlds[currentWorldId].elements : {}
  );
  
  // Состояние вкладок
  const [currentTab, setCurrentTab] = useState(0);
  
  // Состояние для формы связи
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  
  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // Получение связанных элементов
  const getRelatedElements = () => {
    return element.relationships.map(rel => ({
      relationship: rel,
      element: allElements[rel.targetId]
    })).filter(item => item.element !== undefined);
  };
  
  // Получение элементов, связанных с текущим
  const getReferencingElements = () => {
    return Object.values(allElements)
      .filter(el => el.id !== element.id)
      .filter(el => el.relationships.some(rel => rel.targetId === element.id))
      .map(el => ({
        element: el,
        relationships: el.relationships.filter(rel => rel.targetId === element.id)
      }));
  };
  
  // Получение неразрешенных конфликтов
  const getUnresolvedConflicts = () => {
    return element.conflicts.filter(conflict => conflict.status === 'unresolved');
  };
  
  // Обработчик удаления элемента
  const handleDeleteElement = () => {
    if (window.confirm(`Вы уверены, что хотите удалить элемент "${element.name}"?`)) {
      dispatch(deleteElement(element.id));
      if (onDelete) {
        onDelete();
      }
    }
  };
  
  // Обработчик добавления связи
  const handleAddRelationship = (targetId: string, type: string, description: string) => {
    dispatch(addRelationship({
      sourceId: element.id,
      targetId,
      type,
      description
    }));
    setShowRelationshipForm(false);
  };
  
  // Обработчик удаления связи
  const handleDeleteRelationship = (targetId: string, type: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту связь?')) {
      dispatch(deleteRelationship({
        sourceId: element.id,
        targetId,
        type
      }));
    }
  };
  
  // Открытие модального окна для разрешения конфликта
  const handleResolveConflict = (conflictId: string) => {
    dispatch(openModal({
      type: 'resolveConflict',
      data: {
        elementId: element.id,
        conflictId
      }
    }));
  };
  
  // Получение иконки для типа элемента
  const getElementTypeIcon = (type: ElementType) => {
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
        return <AutoFixHighIcon />;
    }
  };
  
  // Получение цвета для уровня канона
  const getCanonTierColor = (tier: CanonTier) => {
    switch (tier) {
      case 'primary':
        return 'success';
      case 'secondary':
        return 'primary';
      case 'speculative':
        return 'warning';
      case 'non-canon':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Получение названия для уровня канона
  const getCanonTierName = (tier: CanonTier) => {
    switch (tier) {
      case 'primary':
        return 'Первичный канон';
      case 'secondary':
        return 'Вторичный канон';
      case 'speculative':
        return 'Предположение';
      case 'non-canon':
        return 'Неканон';
      default:
        return tier;
    }
  };
  
  // Получение названия для типа элемента
  const getElementTypeName = (type: ElementType) => {
    switch (type) {
      case 'character':
        return 'Персонаж';
      case 'technology':
        return 'Технология';
      case 'location':
        return 'Локация';
      case 'event':
        return 'Событие';
      case 'concept':
        return 'Концепция';
      case 'social':
        return 'Социальная структура';
      case 'rule':
        return 'Правило мира';
      default:
        return type;
    }
  };
  
  // Форматирование имени свойства
  const formatPropertyName = (name: string) => {
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase в слова
      .replace(/^./, str => str.toUpperCase()); // Первая буква заглавная
  };
  
  // Проверка, является ли свойство списком
  const isArrayProperty = (value: any) => {
    return Array.isArray(value);
  };
  
  return (
    <Box component={Paper} sx={{ p: 3 }}>
      {/* Шапка элемента */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            {getElementTypeIcon(element.type)}
          </Box>
          <Typography variant="h4" component="h1">
            {element.name}
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Редактировать">
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton color="error" onClick={handleDeleteElement}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Детали элемента */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {element.description}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Тип:
              </Typography>
              <Chip
                icon={getElementTypeIcon(element.type)}
                label={getElementTypeName(element.type)}
                variant="outlined"
              />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Уровень канона:
              </Typography>
              <Chip
                label={getCanonTierName(element.canonTier)}
                color={getCanonTierColor(element.canonTier)}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Версия: {element.version}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Создан: {new Date(element.createdAt).toLocaleString()}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Изменён: {new Date(element.modifiedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Теги */}
      {element.tags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Теги:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {element.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Предупреждение о конфликтах */}
      {getUnresolvedConflicts().length > 0 && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Обнаружены нерешенные конфликты ({getUnresolvedConflicts().length})
            </Typography>
          </Box>
          <Typography variant="body2">
            Этот элемент имеет конфликты с другими элементами, которые требуют вашего внимания.
          </Typography>
        </Box>
      )}
      
      {/* Вкладки с дополнительной информацией */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Свойства" />
          <Tab 
            label={
              <Badge 
                badgeContent={element.relationships.length} 
                color="primary"
                max={99}
                showZero
              >
                Связи
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={getReferencingElements().length} 
                color="primary"
                max={99}
                showZero
              >
                Упоминания
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={element.conflicts.length} 
                color={getUnresolvedConflicts().length > 0 ? "error" : "primary"}
                max={99}
                showZero
              >
                Конфликты
              </Badge>
            } 
          />
          <Tab label="Заметки" />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          {/* Вкладка свойств */}
          {currentTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Свойства
              </Typography>
              
              {Object.keys(element.properties).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  У этого элемента нет дополнительных свойств.
                </Typography>
              ) : (
                <List>
                  {Object.entries(element.properties).map(([key, value]) => {
                    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
                      return null;
                    }
                    
                    return (
                      <ListItem key={key} divider>
                        <ListItemText
                          primary={formatPropertyName(key)}
                          secondary={
                            isArrayProperty(value) 
                              ? (value as string[]).join(', ') 
                              : String(value)
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          )}
          
          {/* Вкладка связей */}
          {currentTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Связи с другими элементами
                </Typography>
                
                <Button 
                  variant="outlined" 
                  startIcon={<LinkIcon />}
                  onClick={() => setShowRelationshipForm(true)}
                >
                  Добавить связь
                </Button>
              </Box>
              
              {showRelationshipForm && (
                <Box sx={{ mb: 3 }}>
                  <Card>
                    <CardHeader title="Новая связь" />
                    <CardContent>
                      <RelationshipForm 
                        excludedElementIds={[element.id, ...element.relationships.map(r => r.targetId)]}
                        onSubmit={handleAddRelationship}
                        onCancel={() => setShowRelationshipForm(false)}
                      />
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              {element.relationships.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  У этого элемента нет связей с другими элементами.
                </Typography>
              ) : (
                <>
                  <RelationshipGraph
                    centerElementId={element.id}
                    depth={1}
                    height={300}
                  />
                  
                  <List>
                    {getRelatedElements().map(({ relationship, element: relatedElement }) => (
                      <ListItem key={`${relationship.targetId}-${relationship.type}`} divider>
                        <ListItemIcon>
                          {getElementTypeIcon(relatedElement.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1">
                                {relatedElement.name}
                              </Typography>
                              <Chip
                                label={relationship.type}
                                size="small"
                                sx={{ ml: 1 }}
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={relationship.description || 'Нет описания'}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Удалить связь">
                            <IconButton 
                              edge="end" 
                              onClick={() => handleDeleteRelationship(relationship.targetId, relationship.type)}
                            >
                              <LinkOffIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
          
          {/* Вкладка упоминаний */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Упоминания в других элементах
              </Typography>
              
              {getReferencingElements().length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Этот элемент не упоминается в других элементах.
                </Typography>
              ) : (
                <List>
                  {getReferencingElements().map(({ element: referencingElement, relationships }) => (
                    <ListItem key={referencingElement.id} divider>
                      <ListItemIcon>
                        {getElementTypeIcon(referencingElement.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={referencingElement.name}
                        secondary={
                          <>
                            {relationships.map((rel, index) => (
                              <Chip
                                key={index}
                                label={rel.type}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                variant="outlined"
                              />
                            ))}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {/* Вкладка конфликтов */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Конфликты
              </Typography>
              
              {element.conflicts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  У этого элемента нет конфликтов с другими элементами.
                </Typography>
              ) : (
                <List>
                  {element.conflicts.map(conflict => {
                    const targetElement = allElements[conflict.withElementId];
                    return (
                      <ListItem key={conflict.id} divider>
                        <ListItemIcon>
                          {conflict.status === 'unresolved' ? (
                            <ErrorIcon color="error" />
                          ) : conflict.status === 'ignored' ? (
                            <WarningIcon color="warning" />
                          ) : (
                            <CheckIcon color="success" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1">
                                Конфликт с {targetElement ? targetElement.name : 'Удаленный элемент'}
                              </Typography>
                              <Chip
                                label={conflict.status === 'unresolved' ? 'Не разрешен' : 
                                       conflict.status === 'ignored' ? 'Игнорируется' : 'Разрешен'}
                                size="small"
                                sx={{ ml: 1 }}
                                color={conflict.status === 'unresolved' ? 'error' : 
                                       conflict.status === 'ignored' ? 'warning' : 'success'}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2">
                                {conflict.description}
                              </Typography>
                              {conflict.resolution && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  <strong>Решение:</strong> {conflict.resolution}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        {conflict.status === 'unresolved' && (
                          <ListItemSecondaryAction>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleResolveConflict(conflict.id)}
                            >
                              Разрешить
                            </Button>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          )}
          
          {/* Вкладка заметок */}
          {currentTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Заметки
              </Typography>
              
              {!element.notes ? (
                <Typography variant="body2" color="text.secondary">
                  У этого элемента нет заметок.
                </Typography>
              ) : (
                <Typography variant="body1">
                  {element.notes}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Вспомогательный компонент для значка Resolved
const CheckIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
  </svg>
);

export default ElementDetails;
