/**
 * Модальное окно для разрешения конфликта между элементами
 */
import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  Paper
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateConflictStatus } from '../../store/slices/worldSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { WorldElement, Conflict } from '../../types/Element';

interface ResolveConflictModalProps {
  onClose: () => void;
  data: {
    elementId: string;
    conflictId: string;
  };
}

const ResolveConflictModal: React.FC<ResolveConflictModalProps> = ({ onClose, data }) => {
  const dispatch = useAppDispatch();
  const { elementId, conflictId } = data;
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для формы
  const [resolution, setResolution] = useState('');
  const [action, setAction] = useState<'resolved' | 'ignored'>('resolved');
  
  // Получаем элемент и конфликт
  const element = currentWorld?.elements[elementId];
  const conflict = element?.conflicts.find(c => c.id === conflictId);
  const targetElement = conflict ? currentWorld?.elements[conflict.withElementId] : null;
  
  // Проверяем, валидны ли данные
  const isValid = element && conflict && conflict.status === 'unresolved';
  
  // Валидация формы
  const isFormValid = action === 'ignored' || (action === 'resolved' && resolution.trim().length > 0);
  
  // Обработчик разрешения конфликта
  const handleResolveConflict = () => {
    if (!isValid) return;
    
    try {
      dispatch(updateConflictStatus({
        elementId,
        conflictId,
        status: action,
        resolution: action === 'resolved' ? resolution.trim() : undefined
      }));
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: action === 'resolved'
          ? 'Конфликт успешно разрешен'
          : 'Конфликт помечен как игнорируемый',
        autoHide: true
      }));
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при разрешении конфликта:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при разрешении конфликта: ${error}`,
        autoHide: true
      }));
    }
  };
  
  // Если данные невалидны, показываем сообщение об ошибке
  if (!isValid) {
    return (
      <>
        <DialogTitle>Разрешение конфликта</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            Указанный конфликт не найден или уже разрешен
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </>
    );
  }
  
  return (
    <>
      <DialogTitle>Разрешение конфликта</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Описание конфликта
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {conflict.description}
          </Alert>
          
          <Typography variant="subtitle1" gutterBottom>
            Между элементами:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle2">
                {element.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getElementTypeName(element.type)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle2">
                {targetElement ? targetElement.name : 'Удаленный элемент'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {targetElement ? getElementTypeName(targetElement.type) : 'Недоступно'}
              </Typography>
            </Paper>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Действие</FormLabel>
            <RadioGroup
              value={action}
              onChange={(e) => setAction(e.target.value as 'resolved' | 'ignored')}
            >
              <FormControlLabel 
                value="resolved" 
                control={<Radio />} 
                label="Разрешить конфликт" 
              />
              <FormControlLabel 
                value="ignored" 
                control={<Radio />} 
                label="Игнорировать конфликт" 
              />
            </RadioGroup>
          </FormControl>
        </Box>
        
        {action === 'resolved' && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Решение конфликта"
              multiline
              rows={4}
              fullWidth
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Опишите, как вы разрешили этот конфликт..."
              required
              error={resolution.trim().length === 0}
              helperText={resolution.trim().length === 0 ? 'Обязательное поле' : ''}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleResolveConflict}
          color="primary"
          variant="contained"
          disabled={!isFormValid}
        >
          {action === 'resolved' ? 'Разрешить' : 'Игнорировать'}
        </Button>
      </DialogActions>
    </>
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

export default ResolveConflictModal;
