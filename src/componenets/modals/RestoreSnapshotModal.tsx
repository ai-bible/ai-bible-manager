/**
 * Модальное окно для восстановления из снимка
 */
import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { restoreFromSnapshot } from '../../store/slices/worldSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { WorldSnapshot } from '../../types/World';

interface RestoreSnapshotModalProps {
  onClose: () => void;
  data: {
    snapshotId: string;
  };
}

const RestoreSnapshotModal: React.FC<RestoreSnapshotModalProps> = ({ onClose, data }) => {
  const dispatch = useAppDispatch();
  const { snapshotId } = data;
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Получаем снимок
  const snapshot = currentWorld?.snapshots.find(s => s.id === snapshotId);
  
  // Проверяем, валидны ли данные
  const isValid = currentWorld && snapshot;
  
  // Обработчик восстановления из снимка
  const handleRestore = () => {
    if (!isValid) return;
    
    try {
      dispatch(restoreFromSnapshot(snapshotId));
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: 'Мир успешно восстановлен из снимка',
        autoHide: true
      }));
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при восстановлении из снимка:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при восстановлении из снимка: ${error}`,
        autoHide: true
      }));
    }
  };
  
  // Если данные невалидны, показываем сообщение об ошибке
  if (!isValid) {
    return (
      <>
        <DialogTitle>Восстановление из снимка</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Указанный снимок не найден
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
      <DialogTitle>Восстановление из снимка</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Дата создания:
          </Typography>
          <Typography variant="body1">
            {formatDate(new Date(snapshot.date))}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Описание:
          </Typography>
          <Typography variant="body1">
            {snapshot.description}
          </Typography>
        </Box>
        
        {snapshot.chapterId && currentWorld.chapters.find(c => c.id === snapshot.chapterId) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Связанная глава:
            </Typography>
            <Typography variant="body1">
              {currentWorld.chapters.find(c => c.id === snapshot.chapterId)?.title}
            </Typography>
          </Box>
        )}
        
        {snapshot.tags && snapshot.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Теги:
            </Typography>
            <Typography variant="body1">
              {snapshot.tags.join(', ')}
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Alert severity="warning">
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Внимание!
          </Typography>
          <Typography variant="body2">
            Восстановление из снимка приведет к потере всех несохраненных изменений. 
            Текущее состояние мира будет автоматически сохранено в новый снимок перед восстановлением.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button 
          onClick={handleRestore}
          color="primary"
          variant="contained"
        >
          Восстановить
        </Button>
      </DialogActions>
    </>
  );
};

// Вспомогательная функция для форматирования даты
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default RestoreSnapshotModal;
