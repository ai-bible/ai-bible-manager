/**
 * Страница для управления главами мира
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
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
  useTheme
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { openModal } from '../store/slices/uiSlice';
import { deleteChapter } from '../store/slices/worldSlice';

// Иконки
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';

const ChaptersPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  
  // Обработчик создания главы
  const handleCreateChapter = () => {
    dispatch(openModal({
      type: 'createChapter',
      data: {}
    }));
  };
  
  // Обработчик редактирования главы
  const handleEditChapter = (chapterId: string) => {
    const chapter = currentWorld?.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    dispatch(openModal({
      type: 'editChapter',
      data: { chapter }
    }));
  };
  
  // Обработчик открытия диалога удаления
  const handleOpenDeleteDialog = (chapterId: string) => {
    setChapterToDelete(chapterId);
    setDeleteDialogOpen(true);
  };
  
  // Обработчик удаления главы
  const handleDeleteChapter = () => {
    if (!chapterToDelete) return;
    
    dispatch(deleteChapter(chapterToDelete));
    setDeleteDialogOpen(false);
    setChapterToDelete(null);
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
  
  // Сортируем главы по порядковому номеру
  const sortedChapters = [...currentWorld.chapters].sort((a, b) => a.order - b.order);
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Главы мира
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateChapter}
        >
          Создать главу
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Главы помогают организовать элементы мира в хронологической или логической последовательности.
      </Typography>
      
      {/* Список глав */}
      {sortedChapters.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            У вас пока нет глав. Создайте первую главу, чтобы начать организацию вашего мира.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateChapter}
          >
            Создать главу
          </Button>
        </Paper>
      ) : (
        <List>
          {sortedChapters.map((chapter, index) => (
            <Card key={chapter.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MenuBookIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {chapter.title}
                  </Typography>
                  <Chip 
                    label={`#${chapter.order}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
                
                {chapter.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {chapter.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Новых элементов: ${chapter.newElements.length}`}
                    size="small"
                    color={chapter.newElements.length > 0 ? "success" : "default"}
                    variant="outlined"
                  />
                  <Chip
                    label={`Измененных: ${chapter.modifiedElements.length}`}
                    size="small"
                    color={chapter.modifiedElements.length > 0 ? "info" : "default"}
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                >
                  Просмотр
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditChapter(chapter.id)}
                >
                  Редактировать
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => handleOpenDeleteDialog(chapter.id)}
                >
                  Удалить
                </Button>
              </CardActions>
            </Card>
          ))}
        </List>
      )}
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление главы</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {chapterToDelete && (
              <>
                Вы уверены, что хотите удалить главу "{
                  currentWorld.chapters.find(c => c.id === chapterToDelete)?.title
                }"? Это действие нельзя отменить.
                
                <Box component="ul" sx={{ mt: 2 }}>
                  <li>
                    <Typography variant="body2">
                      Элементы, связанные с этой главой, НЕ будут удалены.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Связи между главой и элементами будут удалены.
                    </Typography>
                  </li>
                </Box>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteChapter} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChaptersPage;
