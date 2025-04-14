/**
 * Страница приветствия и начала работы с приложением
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createWorld, loadWorld, deleteWorld } from '../store/slices/worldSlice';
import { storageService } from '../services/storage';
import { WorldMetadata } from '../types/World';

const WelcomePage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Состояния для формы создания мира
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [worldName, setWorldName] = useState('');
  const [worldDescription, setWorldDescription] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: ''
  });
  
  // Состояние для списка миров
  const [savedWorlds, setSavedWorlds] = useState<WorldMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [worldToDelete, setWorldToDelete] = useState<string | null>(null);
  
  // Загрузка списка миров
  useEffect(() => {
    const loadSavedWorlds = async () => {
      try {
        const worlds = await storageService.getSavedWorlds();
        setSavedWorlds(worlds);
      } catch (error) {
        console.error('Ошибка при загрузке списка миров:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedWorlds();
  }, []);
  
  // Обработчик создания нового мира
  const handleCreateWorld = () => {
    // Валидация
    const errors = {
      name: ''
    };
    
    if (!worldName.trim()) {
      errors.name = 'Введите название мира';
    }
    
    if (errors.name) {
      setFormErrors(errors);
      return;
    }
    
    // Создаем мир
    dispatch(createWorld({
      name: worldName.trim(),
      description: worldDescription.trim()
    }));
    
    // Переходим на дашборд
    navigate('/');
  };
  
  // Обработчик загрузки мира
  const handleLoadWorld = (worldId: string) => {
    dispatch(loadWorld(worldId));
    navigate('/');
  };
  
  // Обработчик удаления мира
  const handleDeleteWorld = () => {
    if (worldToDelete) {
      dispatch(deleteWorld(worldToDelete));
      setSavedWorlds(prev => prev.filter(world => world.id !== worldToDelete));
      setDeleteDialogOpen(false);
      setWorldToDelete(null);
    }
  };
  
  // Обработчик открытия диалога удаления
  const openDeleteDialog = (worldId: string) => {
    setWorldToDelete(worldId);
    setDeleteDialogOpen(true);
  };
  
  // Обработчик импорта мира из файла
  const handleImportWorld = async () => {
    try {
      const world = await storageService.loadWorldFromFile();
      dispatch(loadWorld(world.id));
      navigate('/');
    } catch (error) {
      console.error('Ошибка при загрузке мира:', error);
      // TODO: Показать уведомление об ошибке
    }
  };
  
  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Bible-Manager
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Инструмент для управления библией мира
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Левая колонка - создание и импорт */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Начать работу
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {showCreateForm ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Создание нового мира
                </Typography>
                
                <TextField
                  label="Название мира"
                  fullWidth
                  margin="normal"
                  value={worldName}
                  onChange={(e) => {
                    setWorldName(e.target.value);
                    if (e.target.value.trim()) {
                      setFormErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
                
                <TextField
                  label="Описание"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={worldDescription}
                  onChange={(e) => setWorldDescription(e.target.value)}
                />
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setShowCreateForm(false)}
                    sx={{ mr: 1 }}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleCreateWorld}
                  >
                    Создать мир
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        Создать новый мир
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Начните с чистого листа и создайте новую библию мира.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateForm(true)}
                      >
                        Создать
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        Импортировать из файла
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Загрузите ранее экспортированную библию мира.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleImportWorld}
                      >
                        Импортировать
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
        
        {/* Правая колонка - список миров */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Ваши миры
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {isLoading ? (
              <Typography variant="body2" color="text.secondary" align="center">
                Загрузка списка миров...
              </Typography>
            ) : savedWorlds.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                У вас пока нет сохраненных миров. Создайте новый или импортируйте существующий.
              </Typography>
            ) : (
              <List>
                {savedWorlds.map((world) => (
                  <ListItem 
                    key={world.id} 
                    button 
                    onClick={() => handleLoadWorld(world.id)}
                    sx={{
                      mb: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1
                    }}
                  >
                    <ListItemText
                      primary={world.name}
                      secondary={
                        <>
                          {world.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {world.description.length > 100 
                                ? `${world.description.substring(0, 100)}...` 
                                : world.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Элементов: {world.elementsCount} | 
                            Глав: {world.chaptersCount} | 
                            Последнее открытие: {new Date(world.lastOpenedAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(world.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление мира</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить этот мир? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteWorld} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WelcomePage;
