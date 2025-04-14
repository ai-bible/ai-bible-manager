/**
 * Страница для визуализации и управления связями между элементами
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAppSelector } from '../store/hooks';

// Иконки
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';

// Компоненты
import RelationshipGraph from '../components/visualizations/RelationshipGraph';

const RelationshipsPage: React.FC = () => {
  // Состояние графа
  const [centerElementId, setCenterElementId] = useState<string | null>(null);
  const [graphDepth, setGraphDepth] = useState<number>(2);
  const [filterTypesVisible, setFilterTypesVisible] = useState<boolean>(false);
  const [filteredElementTypes, setFilteredElementTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Получение списка типов элементов из мира
  const elementTypes = currentWorld
    ? Array.from(new Set(Object.values(currentWorld.elements).map(el => el.type)))
    : [];
  
  // Обработчик изменения центрального элемента
  const handleCenterElementChange = (event: SelectChangeEvent<string>) => {
    setCenterElementId(event.target.value);
  };
  
  // Обработчик изменения глубины графа
  const handleDepthChange = (event: Event, newValue: number | number[]) => {
    setGraphDepth(newValue as number);
  };
  
  // Обработчик изменения фильтра типов элементов
  const handleElementTypesChange = (event: SelectChangeEvent<string[]>) => {
    setFilteredElementTypes(event.target.value as string[]);
  };
  
  // Обработчик изменения поискового запроса
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setCenterElementId(null);
    setGraphDepth(2);
    setFilteredElementTypes([]);
    setSearchQuery('');
  };
  
  // Обработчик переключения видимости фильтров типов
  const handleToggleFilterTypes = () => {
    setFilterTypesVisible(!filterTypesVisible);
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
  
  // Если нет элементов, показываем сообщение
  if (Object.keys(currentWorld.elements).length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          У вас пока нет элементов. Создайте элементы и связи между ними, чтобы увидеть граф.
        </Alert>
      </Box>
    );
  }
  
  // Фильтрация элементов для выпадающего списка
  const filteredElements = Object.values(currentWorld.elements)
    .filter(element => 
      !searchQuery || 
      element.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(element => 
      filteredElementTypes.length === 0 || 
      filteredElementTypes.includes(element.type)
    );
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Граф связей
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Визуализация связей между элементами мира.
      </Typography>
      
      {/* Панель управления графом */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Настройки графа
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={handleResetFilters}
          >
            Сбросить
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Поиск элемента"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="center-element-label">Центральный элемент</InputLabel>
            <Select
              labelId="center-element-label"
              value={centerElementId || ''}
              onChange={handleCenterElementChange}
              label="Центральный элемент"
            >
              <MenuItem value="">
                <em>Показать все</em>
              </MenuItem>
              {filteredElements.map((element) => (
                <MenuItem key={element.id} value={element.id}>
                  {element.name} ({getElementTypeName(element.type)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
            <Typography id="depth-slider" gutterBottom>
              Глубина графа: {graphDepth}
            </Typography>
            <Slider
              value={graphDepth}
              onChange={handleDepthChange}
              aria-labelledby="depth-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={5}
            />
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={handleToggleFilterTypes}
            sx={{ mb: 2 }}
          >
            {filterTypesVisible ? 'Скрыть фильтры типов' : 'Показать фильтры типов'}
          </Button>
          
          {filterTypesVisible && (
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="element-types-label">Типы элементов</InputLabel>
                <Select
                  labelId="element-types-label"
                  multiple
                  value={filteredElementTypes}
                  onChange={handleElementTypesChange}
                  label="Типы элементов"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getElementTypeName(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {elementTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getElementTypeName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Граф связей */}
      <Paper sx={{ p: 2, mb: 3, height: 600 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            {centerElementId 
              ? `Связи элемента: ${currentWorld.elements[centerElementId]?.name || 'Неизвестный элемент'}`
              : 'Все связи мира'}
          </Typography>
        </Box>
        
        <RelationshipGraph
          centerElementId={centerElementId || undefined}
          depth={graphDepth}
          height={550}
          showLabels={true}
        />
      </Paper>
      
      <Alert severity="info">
        <Typography variant="body2">
          Совет: Кликните на элемент графа, чтобы перейти к его детальной информации.
          Вы можете перетаскивать элементы для лучшей визуализации. Используйте колесо мыши для масштабирования.
        </Typography>
      </Alert>
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

export default RelationshipsPage;
