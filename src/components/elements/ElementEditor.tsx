/**
 * Компонент редактора элемента мира
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  FormHelperText,
  Autocomplete,
  SelectChangeEvent
} from '@mui/material';
import { 
  WorldElement, 
  NewWorldElement, 
  ElementType, 
  CanonTier,
  CharacterProperties,
  TechnologyProperties,
  LocationProperties,
  EventProperties,
  ConceptProperties,
  SocialProperties,
  RuleProperties
} from '../../types/Element';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addElement, updateElement } from '../../store/slices/worldSlice';
import { v4 as uuidv4 } from 'uuid';

interface ElementEditorProps {
  element?: WorldElement;
  onSave?: (element: WorldElement) => void;
  onCancel?: () => void;
}

// Тип свойств формы для каждого типа элемента
type ElementFormProperties = 
  Partial<CharacterProperties> | 
  Partial<TechnologyProperties> |
  Partial<LocationProperties> |
  Partial<EventProperties> |
  Partial<ConceptProperties> |
  Partial<SocialProperties> |
  Partial<RuleProperties>;

const ElementEditor: React.FC<ElementEditorProps> = ({ element, onSave, onCancel }) => {
  const dispatch = useAppDispatch();
  const currentWorldId = useAppSelector((state) => state.world.currentWorldId);
  const allElements = useAppSelector((state) => 
    currentWorldId ? Object.values(state.world.worlds[currentWorldId].elements) : []
  );
  
  // Определяем, редактируем ли мы существующий элемент или создаем новый
  const isEditMode = !!element;
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'character' as ElementType,
    canonTier: 'secondary' as CanonTier,
    tags: [] as string[],
    notes: '',
    properties: {} as ElementFormProperties
  });
  
  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });
  
  // Состояние для тега
  const [newTag, setNewTag] = useState('');
  
  // Инициализация формы при редактировании
  useEffect(() => {
    if (element) {
      setFormData({
        name: element.name,
        description: element.description,
        type: element.type,
        canonTier: element.canonTier,
        tags: [...element.tags],
        notes: element.notes,
        properties: { ...element.properties }
      });
    }
  }, [element]);
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку для измененного поля
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Обработчик изменения типа элемента
  const handleTypeChange = (e: SelectChangeEvent<ElementType>) => {
    const newType = e.target.value as ElementType;
    
    // Сбрасываем свойства при изменении типа
    setFormData(prev => ({
      ...prev,
      type: newType,
      properties: getDefaultPropertiesForType(newType)
    }));
  };
  
  // Обработчик изменения уровня канона
  const handleCanonTierChange = (e: SelectChangeEvent<CanonTier>) => {
    setFormData(prev => ({
      ...prev,
      canonTier: e.target.value as CanonTier
    }));
  };
  
  // Обработчик добавления тега
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  // Обработчик удаления тега
  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  // Обработчик изменения свойств элемента
  const handlePropertyChange = (propertyName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [propertyName]: value
      }
    }));
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      description: ''
    };
    
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название не может быть пустым';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание не может быть пустым';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Обработчик сохранения элемента
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    if (!currentWorldId) {
      console.error('Не выбран текущий мир');
      return;
    }
    
    const now = new Date();
    
    if (isEditMode && element) {
      // Обновляем существующий элемент
      const updatedElement: Partial<WorldElement> = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        canonTier: formData.canonTier,
        tags: formData.tags,
        notes: formData.notes,
        properties: formData.properties,
        modifiedAt: now
      };
      
      dispatch(updateElement({ id: element.id, updates: updatedElement }));
      
      if (onSave) {
        onSave({
          ...element,
          ...updatedElement,
          modifiedAt: now
        });
      }
    } else {
      // Создаем новый элемент
      const newElement: NewWorldElement = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        canonTier: formData.canonTier,
        tags: formData.tags,
        notes: formData.notes,
        properties: formData.properties
      };
      
      dispatch(addElement(newElement));
      
      // TODO: Получить ID нового элемента из store
      if (onSave) {
        onSave({
          id: uuidv4(), // Временное решение, в реальности ID генерируется в reducer
          ...newElement,
          relationships: [],
          conflicts: [],
          appearances: [],
          createdAt: now,
          modifiedAt: now,
          version: 1
        });
      }
    }
  };
  
  return (
    <Box component={Paper} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Редактирование элемента' : 'Создание нового элемента'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={6}>
          <TextField
            name="name"
            label="Название"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="element-type-label">Тип элемента</InputLabel>
            <Select
              labelId="element-type-label"
              value={formData.type}
              label="Тип элемента"
              onChange={handleTypeChange}
              disabled={isEditMode} // Нельзя менять тип при редактировании
            >
              <MenuItem value="character">Персонаж</MenuItem>
              <MenuItem value="technology">Технология</MenuItem>
              <MenuItem value="location">Локация</MenuItem>
              <MenuItem value="event">Событие</MenuItem>
              <MenuItem value="concept">Концепция</MenuItem>
              <MenuItem value="social">Социальная структура</MenuItem>
              <MenuItem value="rule">Правило мира</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="canon-tier-label">Уровень канона</InputLabel>
            <Select
              labelId="canon-tier-label"
              value={formData.canonTier}
              label="Уровень канона"
              onChange={handleCanonTierChange}
            >
              <MenuItem value="primary">Первичный канон</MenuItem>
              <MenuItem value="secondary">Вторичный канон</MenuItem>
              <MenuItem value="speculative">Предположение</MenuItem>
              <MenuItem value="non-canon">Неканон</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            name="description"
            label="Описание"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            required
            sx={{ mb: 2 }}
          />
        </Grid>
        
        {/* Теги и заметки */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Теги
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                label="Новый тег"
                size="small"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Добавить
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                />
              ))}
            </Box>
          </Box>
          
          <TextField
            name="notes"
            label="Заметки"
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>
        
        {/* Специфичные свойства в зависимости от типа элемента */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Специфичные свойства
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {renderPropertiesForm()}
        </Grid>
        
        {/* Кнопки действий */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            sx={{ mr: 1 }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
          >
            {isEditMode ? 'Сохранить' : 'Создать'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Функция рендеринга формы свойств в зависимости от типа элемента
  function renderPropertiesForm() {
    switch (formData.type) {
      case 'character':
        return renderCharacterForm();
      case 'technology':
        return renderTechnologyForm();
      case 'location':
        return renderLocationForm();
      case 'event':
        return renderEventForm();
      case 'concept':
        return renderConceptForm();
      case 'social':
        return renderSocialForm();
      case 'rule':
        return renderRuleForm();
      default:
        return null;
    }
  }
  
  // Форма для персонажа
  function renderCharacterForm() {
    const properties = formData.properties as Partial<CharacterProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Возраст"
            type="number"
            fullWidth
            value={properties.age || ''}
            onChange={(e) => handlePropertyChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Пол"
            fullWidth
            value={properties.gender || ''}
            onChange={(e) => handlePropertyChange('gender', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Происхождение"
            fullWidth
            value={properties.origin || ''}
            onChange={(e) => handlePropertyChange('origin', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <TextField
            label="Род занятий"
            fullWidth
            value={properties.occupation || ''}
            onChange={(e) => handlePropertyChange('occupation', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Внешность"
            fullWidth
            multiline
            rows={2}
            value={properties.appearance || ''}
            onChange={(e) => handlePropertyChange('appearance', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Личность"
            fullWidth
            multiline
            rows={2}
            value={properties.personality || ''}
            onChange={(e) => handlePropertyChange('personality', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.abilities || []}
            onChange={(_, newValue) => handlePropertyChange('abilities', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Способности" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.goals || []}
            onChange={(_, newValue) => handlePropertyChange('goals', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Цели" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Форма для технологии
  function renderTechnologyForm() {
    const properties = formData.properties as Partial<TechnologyProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Изобретатель"
            fullWidth
            value={properties.inventor || ''}
            onChange={(e) => handlePropertyChange('inventor', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Дата создания"
            fullWidth
            value={properties.creationDate || ''}
            onChange={(e) => handlePropertyChange('creationDate', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Технологический уровень"
            fullWidth
            value={properties.techLevel || ''}
            onChange={(e) => handlePropertyChange('techLevel', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.materials || []}
            onChange={(_, newValue) => handlePropertyChange('materials', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Материалы" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.applications || []}
            onChange={(_, newValue) => handlePropertyChange('applications', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Применения" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.limitations || []}
            onChange={(_, newValue) => handlePropertyChange('limitations', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Ограничения" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Форма для локации
  function renderLocationForm() {
    const properties = formData.properties as Partial<LocationProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Координаты/Расположение"
            fullWidth
            value={properties.coordinates || ''}
            onChange={(e) => handlePropertyChange('coordinates', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Климат"
            fullWidth
            value={properties.climate || ''}
            onChange={(e) => handlePropertyChange('climate', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Население"
            type="number"
            fullWidth
            value={properties.population || ''}
            onChange={(e) => handlePropertyChange('population', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Тип управления"
            fullWidth
            value={properties.governmentType || ''}
            onChange={(e) => handlePropertyChange('governmentType', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="История"
            fullWidth
            multiline
            rows={2}
            value={properties.history || ''}
            onChange={(e) => handlePropertyChange('history', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.keyFeatures || []}
            onChange={(_, newValue) => handlePropertyChange('keyFeatures', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Ключевые особенности" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Форма для события
  function renderEventForm() {
    const properties = formData.properties as Partial<EventProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Дата"
            fullWidth
            value={properties.date || ''}
            onChange={(e) => handlePropertyChange('date', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Продолжительность"
            fullWidth
            value={properties.duration || ''}
            onChange={(e) => handlePropertyChange('duration', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Значимость"
            fullWidth
            multiline
            rows={2}
            value={properties.significance || ''}
            onChange={(e) => handlePropertyChange('significance', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={allElements
              .filter(el => el.type === 'character')
              .map(el => el.name)}
            value={properties.participants || []}
            onChange={(_, newValue) => handlePropertyChange('participants', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Участники" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.causes || []}
            onChange={(_, newValue) => handlePropertyChange('causes', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Причины" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.consequences || []}
            onChange={(_, newValue) => handlePropertyChange('consequences', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Последствия" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Форма для концепции
  function renderConceptForm() {
    const properties = formData.properties as Partial<ConceptProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Домен/Область"
            fullWidth
            value={properties.domain || ''}
            onChange={(e) => handlePropertyChange('domain', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Развитие"
            fullWidth
            multiline
            rows={2}
            value={properties.development || ''}
            onChange={(e) => handlePropertyChange('development', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={allElements
              .filter(el => el.type === 'character')
              .map(el => el.name)}
            value={properties.originators || []}
            onChange={(_, newValue) => handlePropertyChange('originators', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Создатели/Основатели" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.applications || []}
            onChange={(_, newValue) => handlePropertyChange('applications', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Применения" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.implications || []}
            onChange={(_, newValue) => handlePropertyChange('implications', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Последствия/Выводы" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Форма для социальной структуры
  function renderSocialForm() {
    const properties = formData.properties as Partial<SocialProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Эволюция"
            fullWidth
            multiline
            rows={2}
            value={properties.evolution || ''}
            onChange={(e) => handlePropertyChange('evolution', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Значимость"
            fullWidth
            multiline
            rows={2}
            value={properties.significance || ''}
            onChange={(e) => handlePropertyChange('significance', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.hierarchy || []}
            onChange={(_, newValue) => handlePropertyChange('hierarchy', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Иерархия" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.roles || []}
            onChange={(_, newValue) => handlePropertyChange('roles', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Роли" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.interactions || []}
            onChange={(_, newValue) => handlePropertyChange('interactions', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Взаимодействия" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Форма для правила мира
  function renderRuleForm() {
    const properties = formData.properties as Partial<RuleProperties>;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Область действия"
            fullWidth
            value={properties.scope || ''}
            onChange={(e) => handlePropertyChange('scope', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Соблюдение/Обеспечение"
            fullWidth
            multiline
            rows={2}
            value={properties.enforcement || ''}
            onChange={(e) => handlePropertyChange('enforcement', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.exceptions || []}
            onChange={(_, newValue) => handlePropertyChange('exceptions', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Исключения" placeholder="Добавить" />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={properties.implications || []}
            onChange={(_, newValue) => handlePropertyChange('implications', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Последствия" placeholder="Добавить" />
            )}
          />
        </Grid>
      </Grid>
    );
  }
  
  // Получение стандартных свойств для типа элемента
  function getDefaultPropertiesForType(type: ElementType): ElementFormProperties {
    switch (type) {
      case 'character':
        return {
          age: undefined,
          gender: '',
          occupation: '',
          origin: '',
          abilities: [],
          goals: [],
          personality: '',
          appearance: ''
        };
      case 'technology':
        return {
          inventor: '',
          creationDate: '',
          techLevel: '',
          materials: [],
          limitations: [],
          applications: []
        };
      case 'location':
        return {
          coordinates: '',
          climate: '',
          population: undefined,
          governmentType: '',
          keyFeatures: [],
          history: ''
        };
      case 'event':
        return {
          date: '',
          duration: '',
          participants: [],
          causes: [],
          consequences: [],
          significance: ''
        };
      case 'concept':
        return {
          domain: '',
          originators: [],
          development: '',
          applications: [],
          implications: []
        };
      case 'social':
        return {
          hierarchy: [],
          roles: [],
          interactions: [],
          evolution: '',
          significance: ''
        };
      case 'rule':
        return {
          scope: '',
          exceptions: [],
          implications: [],
          enforcement: ''
        };
      default:
        return {};
    }
  }
};

export default ElementEditor;
