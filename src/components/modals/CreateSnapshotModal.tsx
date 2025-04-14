/**
 * Модальное окно для создания снимка текущего состояния мира
 */
import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Autocomplete,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createSnapshot } from '../../store/slices/worldSlice';
import { addNotification } from '../../store/slices/uiSlice';

interface CreateSnapshotModalProps {
  onClose: () => void;
  data: any;
}

const CreateSnapshotModal: React.FC<CreateSnapshotModalProps> = ({ onClose, data }) => {
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для формы
  const [description, setDescription] = useState('');
  const [chapterId, setChapterId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Валидация формы
  const isFormValid = description.trim().length > 0;
  
  // Рекомендуемые теги
  const suggestedTags = [
    'автосохранение',
    'важный этап',
    'перед изменением',
    'версия',
    'стабильная версия',
    'эксперимент'
  ];
  
  // Обработчик добавления тега
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };
  
  // Обработчик удаления тега
  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };
  
  // Обработчик изменения главы
  const handleChapterChange = (event: SelectChangeEvent<string>) => {
    setChapterId(event.target.value);
  };
  
  // Обработчик создания снимка
  const handleCreateSnapshot = () => {
    if (!currentWorldId || !isFormValid) return;
    
    try {
      dispatch(createSnapshot({
        description: description.trim(),
        chapterId: chapterId || undefined,
        tags: tags.length > 0 ? tags : undefined
      }));
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: 'Снимок мира успешно создан',
        autoHide: true
      }));
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при создании снимка:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при создании снимка: ${error}`,
        autoHide: true
      }));
    }
  };
  
  // Если мир не загружен, показываем сообщение об ошибке
  if (!currentWorld) {
    return (
      <>
        <DialogTitle>Создание снимка</DialogTitle>
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
      <DialogTitle>Создание снимка мира</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Снимок сохраняет текущее состояние мира, к которому можно будет вернуться в будущем.
        </Typography>
        
        <TextField
          label="Описание снимка"
          multiline
          rows={3}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите текущее состояние мира или причину создания снимка..."
          required
          error={description.trim().length === 0}
          helperText={description.trim().length === 0 ? 'Обязательное поле' : ''}
          sx={{ mb: 3 }}
        />
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="chapter-label">Связанная глава</InputLabel>
          <Select
            labelId="chapter-label"
            value={chapterId}
            onChange={handleChapterChange}
            label="Связанная глава"
          >
            <MenuItem value="">
              <em>Не выбрано</em>
            </MenuItem>
            {currentWorld.chapters.map(chapter => (
              <MenuItem key={chapter.id} value={chapter.id}>
                {chapter.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Теги
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Autocomplete
              freeSolo
              options={suggestedTags.filter(tag => !tags.includes(tag))}
              inputValue={newTag}
              onInputChange={(event, value) => setNewTag(value)}
              sx={{ flexGrow: 1, mr: 1 }}
              renderInput={(params) => (
                <TextField {...params} label="Добавить тег" size="small" />
              )}
            />
            <Button 
              variant="outlined" 
              onClick={() => handleAddTag(newTag)}
              disabled={!newTag.trim() || tags.includes(newTag.trim())}
            >
              Добавить
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
          </Box>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            Текущее количество снимков: {currentWorld.snapshots.length} / {currentWorld.settings.maxSnapshots}
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleCreateSnapshot}
          color="primary"
          variant="contained"
          disabled={!isFormValid}
        >
          Создать снимок
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateSnapshotModal;
