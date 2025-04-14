/**
 * Компонент формы для создания связи между элементами
 */
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Grid,
  Typography,
  FormHelperText
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { WorldElement } from '../../types/Element';

interface RelationshipFormProps {
  excludedElementIds?: string[];
  onSubmit: (targetId: string, type: string, description: string) => void;
  onCancel: () => void;
}

// Предопределенные типы связей
const RELATIONSHIP_TYPES = [
  // Персонажи
  'Родитель', 'Ребенок', 'Супруг(а)', 'Друг', 'Союзник', 'Враг', 'Наставник', 'Ученик',
  // Локации
  'Находится в', 'Содержит', 'Граничит с', 'Рядом с',
  // Технологии
  'Создатель', 'Создано с помощью', 'Улучшает', 'Улучшено с помощью', 'Зависит от', 'Является компонентом',
  // События
  'Участвует в', 'Происходит в', 'Предшествует', 'Следует за', 'Вызывает', 'Вызвано',
  // Общие
  'Связан с', 'Влияет на', 'Противоречит', 'Дополняет'
];

const RelationshipForm: React.FC<RelationshipFormProps> = ({
  excludedElementIds = [],
  onSubmit,
  onCancel
}) => {
  const currentWorldId = useAppSelector((state) => state.world.currentWorldId);
  const allElements = useAppSelector((state) => 
    currentWorldId 
      ? Object.values(state.world.worlds[currentWorldId].elements)
        .filter(el => !excludedElementIds.includes(el.id))
      : []
  );
  
  // Состояние формы
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [relationType, setRelationType] = useState<string>('');
  const [relationDescription, setRelationDescription] = useState('');
  const [customType, setCustomType] = useState('');
  
  // Состояние ошибок
  const [errors, setErrors] = useState({
    element: '',
    type: ''
  });
  
  // Обработчик отправки формы
  const handleSubmit = () => {
    // Валидация
    const newErrors = {
      element: '',
      type: ''
    };
    
    if (!selectedElement) {
      newErrors.element = 'Выберите элемент';
    }
    
    if (!relationType && !customType) {
      newErrors.type = 'Выберите или введите тип связи';
    }
    
    if (newErrors.element || newErrors.type) {
      setErrors(newErrors);
      return;
    }
    
    // Если все ок, вызываем onSubmit
    onSubmit(
      selectedElement!.id,
      customType || relationType,
      relationDescription
    );
    
    // Сбрасываем форму
    resetForm();
  };
  
  // Сброс формы
  const resetForm = () => {
    setSelectedElement(null);
    setRelationType('');
    setRelationDescription('');
    setCustomType('');
    setErrors({
      element: '',
      type: ''
    });
  };
  
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            options={allElements}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <li {...props}>
                <Typography variant="body1">
                  {option.name} 
                  <Typography 
                    component="span" 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({getElementTypeName(option.type)})
                  </Typography>
                </Typography>
              </li>
            )}
            value={selectedElement}
            onChange={(_, newValue) => {
              setSelectedElement(newValue);
              if (newValue) {
                setErrors(prev => ({ ...prev, element: '' }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Элемент"
                error={!!errors.element}
                helperText={errors.element}
                required
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={RELATIONSHIP_TYPES}
            freeSolo
            value={relationType}
            onInputChange={(_, newValue) => {
              if (RELATIONSHIP_TYPES.includes(newValue)) {
                setRelationType(newValue);
                setCustomType('');
              } else {
                setRelationType('');
                setCustomType(newValue);
              }
              
              if (newValue) {
                setErrors(prev => ({ ...prev, type: '' }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Тип связи"
                error={!!errors.type}
                helperText={errors.type}
                required
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Описание связи"
            fullWidth
            multiline
            rows={2}
            value={relationDescription}
            onChange={(e) => setRelationDescription(e.target.value)}
            placeholder="Опишите связь между элементами (необязательно)"
          />
        </Grid>
        
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
            onClick={handleSubmit}
          >
            Создать связь
          </Button>
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

export default RelationshipForm;
