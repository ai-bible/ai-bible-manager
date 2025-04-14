/**
 * Страница со списком всех элементов мира
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  Divider,
  ListItemText,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { WorldElement, ElementType, CanonTier } from '../types/Element';
import { openModal } from '../store/slices/uiSlice';
import { deleteElement } from '../store/slices/worldSlice';

// Иконки
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RuleIcon from '@mui/icons-material/Rule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';

// Интерфейс для фильтров
interface ElementFilters {
  types: ElementType[];
  canonTiers: CanonTier[];
  tags: string[];
  searchQuery: string;
  chapterId: string | null;
}

// Типы сортировки
type SortField = 'name' | 'type' | 'canonTier' | 'createdAt' | 'modifiedAt';
type SortDirection = 'asc' | 'desc';

const ElementsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние фильтров
  const [filters, setFilters] = useState<ElementFilters>({
    types: [],
    canonTiers: [],
    tags: [],
    searchQuery: '',
    chapterId: null
  });
  
  // Состояние сортировки
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Состояние элементов после фильтрации
  const [filteredElements, setFilteredElements] = useState<WorldElement[]>([]);
  
  // Состояние диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [elementToDelete, setElementToDelete] = useState<WorldElement | null>(null);
  
  // Фильтрация и сортировка элементов при изменении фильтров или мира
  useEffect(() => {
    if (!currentWorld) return;
    
    // Применяем фильтры
    let elements = Object.values(currentWorld.elements);
    
    // Фильтр по типам
    if (filters.types.length > 0) {
      elements = elements.filter(element => filters.types.includes(element.type));
    }
    
    // Фильтр по уровням канона
    if (filters.canonTiers.length > 0) {
      elements = elements.filter(element => filters.canonTiers.includes(element.canonTier));
    }
    
    // Фильтр по тегам
    if (filters.tags.length > 0) {
      elements = elements.filter(element => 
        filters.tags.some(tag => element.tags.includes(tag))
      );
    }
    
    // Фильтр по поисковому запросу
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      elements = elements.filter(element => 
        element.name.toLowerCase().includes(query) ||
        element.description.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по главе
    if (filters.chapterId) {
      elements = elements.filter(element => 
        element.appearances.includes(filters.chapterId!)
      );
    }
    
    // Применяем сортировку
    elements.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'canonTier':
          valueA = a.canonTier;
          valueB = b.canonTier;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'modifiedAt':
          valueA = new Date(a.modifiedAt).getTime();
          valueB = new Date(b.modifiedAt).getTime();
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      // Определяем порядок сортировки
      const result = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      return sortDirection === 'asc' ? result : -result;
    });
    
    setFilteredElements(elements);
  }, [currentWorld, filters, sortField, sortDirection]);
  
  // Все доступные теги в мире
  const allTags = currentWorld
    ? Array.from(
        new Set(
          Object.values(currentWorld.elements)
            .flatMap(element => element.tags)
        )
      )
    : [];
  
  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };
  
  // Обработчик изменения фильтра по типам
  const handleTypeFilterChange = (e: SelectChangeEvent<ElementType[]>) => {
    setFilters(prev => ({ 
      ...prev, 
      types: e.target.value as ElementType[] 
    }));
  };
  
  // Обработчик изменения фильтра по уровням канона
  const handleCanonTierFilterChange = (e: SelectChangeEvent<CanonTier[]>) => {
    setFilters(prev => ({ 
      ...prev, 
      canonTiers: e.target.value as CanonTier[] 
    }));
  };
  
  // Обработчик изменения фильтра по тегам
  const handleTagFilterChange = (e: SelectChangeEvent<string[]>) => {
    setFilters(prev => ({ 
      ...prev, 
      tags: e.target.value as string[] 
    }));
  };
  
  // Обработчик изменения главы
  const handleChapterChange = (e: SelectChangeEvent<string>) => {
    setFilters(prev => ({ 
      ...prev, 
      chapterId: e.target.value || null 
    }));
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({
      types: [],
      canonTiers: [],
      tags: [],
      searchQuery: '',
      chapterId: null
    });
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      // Если поле то же, меняем направление
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Если поле новое, устанавливаем его и сбрасываем направление на 'asc'
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Открытие модального окна для создания элемента
  const handleCreateElement = () => {
    dispatch(openModal({
      type: 'createElement',
      data: {}
    }));
  };
  
  // Обработчик редактирования элемента
  const handleEditElement = (element: WorldElement) => {
    dispatch(openModal({
      type: 'editElement',
      data: { element }
    }));
  };
  
  // Обработчик удаления элемента
  const handleDeleteElement = () => {
    if (elementToDelete) {
      dispatch(deleteElement(elementToDelete.id));
      setDeleteDialogOpen(false);
      setElementToDelete(null);
    }
  };
  
  // Открытие диалога удаления
  const openDeleteDialog = (element: WorldElement) => {
    setElementToDelete(element);
    setDeleteDialogOpen(true);
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
        return null;
    }
  };
  
  // Получение названия типа элемента
  const getElementTypeName = (type: ElementType): string => {
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
  
  // Получение названия уровня канона
  const getCanonTierName = (tier: CanonTier): string => {
    const tierNames: Record<string, string> = {
      'primary': 'Первичный канон',
      'secondary': 'Вторичный канон',
      'speculative': 'Предположение',
      'non-canon': 'Неканон'
    };
    
    return tierNames[tier] || tier;
  };
  
  // Получение названия поля сортировки
  const getSortFieldName = (field: SortField): string => {
    const fieldNames: Record<string, string> = {
      'name': 'Название',
      'type': 'Тип',
      'canonTier': 'Уровень канона',
      'createdAt': 'Дата создания',
      'modifiedAt': 'Дата изменения'
    };
    
    return fieldNames[field] || field;
  };
  
  if (!currentWorld) {
    return null; // Если мир не загружен, ничего не показываем
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Элементы мира
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateElement}
        >
          Создать элемент
        </Button>
      </Box>
      
      {/* Панель фильтров и сортировки */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Поиск"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Введите название или описание"
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="type-filter-label">Тип элемента</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    multiple
                    value={filters.types}
                    onChange={handleTypeFilterChange}
                    input={<OutlinedInput label="Тип элемента" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as ElementType[]).map((value) => (
                          <Chip key={value} label={getElementTypeName(value)} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {(['character', 'technology', 'location', 'event', 'concept', 'social', 'rule'] as ElementType[]).map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={filters.types.indexOf(type) > -1} />
                        <ListItemText primary={getElementTypeName(type)} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="canon-filter-label">Уровень канона</InputLabel>
                  <Select
                    labelId="canon-filter-label"
                    multiple
                    value={filters.canonTiers}
                    onChange={handleCanonTierFilterChange}
                    input={<OutlinedInput label="Уровень канона" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as CanonTier[]).map((value) => (
                          <Chip 
                            key={value}
                            label={getCanonTierName(value)} 
                            size="small"
                            color={getCanonTierColor(value)}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {(['primary', 'secondary', 'speculative', 'non-canon'] as CanonTier[]).map((tier) => (
                      <MenuItem key={tier} value={tier}>
                        <Checkbox checked={filters.canonTiers.indexOf(tier) > -1} />
                        <ListItemText primary={getCanonTierName(tier)} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="tags-filter-label">Теги</InputLabel>
                  <Select
                    labelId="tags-filter-label"
                    multiple
                    value={filters.tags}
                    onChange={handleTagFilterChange}
                    input={<OutlinedInput label="Теги" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {allTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        <Checkbox checked={filters.tags.indexOf(tag) > -1} />
                        <ListItemText primary={tag} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="chapter-filter-label">Глава</InputLabel>
              <Select
                labelId="chapter-filter-label"
                value={filters.chapterId || ''}
                onChange={handleChapterChange}
                label="Глава"
              >
                <MenuItem value="">
                  <em>Все главы</em>
                </MenuItem>
                {currentWorld.chapters.map((chapter) => (
                  <MenuItem key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Сортировка</InputLabel>
              <Select
                labelId="sort-label"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                  setSortField(field);
                  setSortDirection(direction);
                }}
                label="Сортировка"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                {(['name', 'type', 'canonTier', 'createdAt', 'modifiedAt'] as SortField[]).map((field) => (
                  <React.Fragment key={field}>
                    <MenuItem value={`${field}-asc`}>
                      {getSortFieldName(field)} (по возрастанию)
                    </MenuItem>
                    <MenuItem value={`${field}-desc`}>
                      {getSortFieldName(field)} (по убыванию)
                    </MenuItem>
                  </React.Fragment>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined"
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Информация о результатах */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Найдено элементов: {filteredElements.length} из {Object.keys(currentWorld.elements).length}
        </Typography>
        
        <Typography variant="body2">
          Сортировка: {getSortFieldName(sortField)} {sortDirection === 'asc' ? '↑' : '↓'}
        </Typography>
      </Box>
      
      {/* Список элементов */}
      <Grid container spacing={2}>
        {filteredElements.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Нет элементов, соответствующих выбранным фильтрам
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                sx={{ mt: 2 }}
              >
                Сбросить фильтры
              </Button>
            </Paper>
          </Grid>
        ) : (
          filteredElements.map((element) => (
            <Grid item xs={12} sm={6} md={4} key={element.id}>
              <Card>
                <CardContent sx={{ position: 'relative' }}>
                  {element.conflicts.some(c => c.status === 'unresolved') && (
                    <Tooltip title="Есть неразрешенные конфликты">
                      <Badge 
                        badgeContent={element.conflicts.filter(c => c.status === 'unresolved').length} 
                        color="error"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <WarningIcon color="error" />
                      </Badge>
                    </Tooltip>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getElementTypeIcon(element.type)}
                    <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                      {element.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Chip 
                      label={getElementTypeName(element.type)} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={getCanonTierName(element.canonTier)} 
                      size="small"
                      color={getCanonTierColor(element.canonTier)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {element.description.length > 120
                      ? `${element.description.substring(0, 120)}...`
                      : element.description}
                  </Typography>
                  
                  {element.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {element.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                      {element.tags.length > 3 && (
                        <Chip label={`+${element.tags.length - 3}`} size="small" />
                      )}
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Последнее изменение: {new Date(element.modifiedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/elements/${element.id}`)}
                  >
                    Просмотр
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditElement(element)}
                  >
                    Изменить
                  </Button>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => openDeleteDialog(element)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление элемента</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить элемент "{elementToDelete?.name}"? Это действие нельзя отменить.
          </DialogContentText>
          {elementToDelete && (
            <>
              <DialogContentText color="error" sx={{ mt: 2 }}>
                Внимание! Удаление этого элемента может привести к следующим последствиям:
              </DialogContentText>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography variant="body2">
                    Будут удалены все связи с этим элементом
                  </Typography>
                </li>
                {elementToDelete.relationships.length > 0 && (
                  <li>
                    <Typography variant="body2">
                      Будут разорваны {elementToDelete.relationships.length} связей с другими элементами
                    </Typography>
                  </li>
                )}
                {Object.values(currentWorld.elements).filter(
                  el => el.relationships.some(rel => rel.targetId === elementToDelete.id)
                ).length > 0 && (
                  <li>
                    <Typography variant="body2">
                      Этот элемент используется в {
                        Object.values(currentWorld.elements).filter(
                          el => el.relationships.some(rel => rel.targetId === elementToDelete.id)
                        ).length
                      } других элементах
                    </Typography>
                  </li>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteElement} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ElementsPage;
