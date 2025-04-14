/**
 * Модальное окно для создания новой главы
 */
import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addChapter } from '../../store/slices/worldSlice';
import { addNotification } from '../../store/slices/uiSlice';

interface CreateChapterModalProps {
  onClose: () => void;
  data: any;
}

const CreateChapterModal: React.FC<CreateChapterModalProps> = ({ onClose, data }) => {
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  
  // Валидация формы
  const isFormValid = title.trim().length > 0;
  
  // Получение максимального порядкового номера
  const maxOrder = currentWorld
    ? Math.max(0, ...currentWorld.chapters.map(chapter => chapter.order))
    : 0;
  
  // Обработчик изменения порядка
  const handleOrderChange = (event: SelectChangeEvent<number | ''>) => {
    setOrder(event.target.value as number | '');
  };
  
  // Обработчик создания главы
  const handleCreateChapter = () => {
    if (!currentWorldId || !isFormValid) return;
    
    try {
      dispatch(addChapter({
        title: title.trim(),
        description: description.trim() || undefined,
        order: order !== '' ? order : maxOrder + 1
      }));
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: `Глава "${title}" успешно создана`,
        autoHide: true
      }));
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при создании главы:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при создании главы: ${error}`,
        autoHide: true
      }));
    }
  };
  
  // Если мир не загружен, показываем сообщение об ошибке
  if (!currentWorld) {
    return (
      <>
        <DialogTitle>Создание главы</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            Мир не загружен
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
      <DialogTitle>Создание новой главы</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Главы помогают организовать элементы мира в хронологической или логической последовательности.
        </Typography>
        
        <TextField
          label="Название главы"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          error={title.trim().length === 0}
          helperText={title.trim().length === 0 ? 'Обязательное поле' : ''}
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Описание"
          multiline
          rows={3}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Краткое описание содержания главы..."
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="order-label">Порядковый номер</InputLabel>
          <Select
            labelId="order-label"
            value={order}
            onChange={handleOrderChange}
            label="Порядковый номер"
          >
            <MenuItem value="">
              <em>В конец ({maxOrder + 1})</em>
            </MenuItem>
            {Array.from({ length: maxOrder + 2 }, (_, i) => i + 1).map(num => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 2 }}>
          <Alert severity="info">
            Текущее количество глав: {currentWorld.chapters.length}
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleCreateChapter}
          color="primary"
          variant="contained"
          disabled={!isFormValid}
        >
          Создать главу
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateChapterModal;
