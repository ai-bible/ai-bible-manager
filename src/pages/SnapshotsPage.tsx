/**
 * Страница для управления снимками мира
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { openModal } from '../store/slices/uiSlice';
import { restoreFromSnapshot } from '../store/slices/worldSlice';
import { addNotification } from '../store/slices/uiSlice';

// Иконки
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';

const SnapshotsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для диалога восстановления
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [snapshotToRestore, setSnapshotToRestore] = useState<string | null>(null);
  
  // Обработчик создания снимка
  const handleCreateSnapshot = () => {
    dispatch(openModal({
      type: 'createSnapshot',
      data: {}
    }));
  };
  
  // Обработчик открытия диалога восстановления
  const handleOpenRestoreDialog = (snapshotId: string) => {
    setSnapshotToRestore(snapshotId);
    setRestoreDialogOpen(true);
  };
  
  // Обработчик восстановления из снимка
  const handleRestoreSnapshot = () => {
    if (!snapshotToRestore) return;
    
    try {
      dispatch(restoreFromSnapshot(snapshotToRestore));
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: 'Мир успешно восстановлен из снимка',
        autoHide: true
      }));
      
      setRestoreDialogOpen(false);
      setSnapshotToRestore(null);
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
  
  // Сортируем снимки по дате (от новых к старым)
  const sortedSnapshots = [...currentWorld.snapshots].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Снимки мира
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<CameraAltIcon />}
          onClick={handleCreateSnapshot}
        >
          Создать снимок
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Снимки позволяют сохранить текущее состояние мира и вернуться к нему в любой момент.
        Текущее количество снимков: {currentWorld.snapshots.length} / {currentWorld.settings.maxSnapshots}
      </Typography>
      
      {/* Список снимков */}
      {sortedSnapshots.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            У вас пока нет снимков. Создайте первый снимок, чтобы сохранить текущее состояние мира.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CameraAltIcon />}
            onClick={handleCreateSnapshot}
          >
            Создать снимок
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {sortedSnapshots.map((snapshot) => (
            <Grid item xs={12} md={6} key={snapshot.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HistoryIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {formatDate(new Date(snapshot.date))}
                    </Typography>
                    {snapshot.chapterId && (
                      <BookmarkIcon color="secondary" />
                    )}
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {snapshot.description}
                  </Typography>
                  
                  {snapshot.tags && snapshot.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {snapshot.tags.map(tag => (
                        <Typography key={tag} variant="caption" sx={{ 
                          bgcolor: 'action.selected', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1 
                        }}>
                          {tag}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<RestoreIcon />}
                    onClick={() => handleOpenRestoreDialog(snapshot.id)}
                  >
                    Восстановить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Диалог подтверждения восстановления */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Восстановление из снимка</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {snapshotToRestore && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Вы уверены, что хотите восстановить мир из снимка от {
                    formatDate(new Date(
                      currentWorld.snapshots.find(s => s.id === snapshotToRestore)?.date || new Date()
                    ))
                  }?
                </Typography>
                
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Все несохраненные изменения будут потеряны. Текущее состояние мира будет автоматически сохранено в новый снимок.
                </Alert>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleRestoreSnapshot} color="primary" autoFocus>
            Восстановить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Вспомогательные функции
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default SnapshotsPage;
