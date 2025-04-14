/**
 * Страница для работы с брифами и шаблонами брифов
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Alert,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addBriefTemplate, deleteBriefTemplate } from '../store/slices/worldSlice';
import { openModal, addNotification } from '../store/slices/uiSlice';
import { exportService } from '../services/export';

// Иконки
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';

const BriefsPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние для вкладок
  const [currentTab, setCurrentTab] = useState<'templates' | 'generator'>('templates');
  
  // Состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  // Состояние для диалога сгенерированного брифа
  const [briefDialogOpen, setBriefDialogOpen] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<string>('');
  
  // Состояние для формы генерации брифа
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  
  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: 'templates' | 'generator') => {
    setCurrentTab(newValue);
  };
  
  // Обработчик создания шаблона
  const handleCreateTemplate = () => {
    dispatch(openModal({
      type: 'createBriefTemplate',
      data: {}
    }));
  };
  
  // Обработчик редактирования шаблона
  const handleEditTemplate = (templateId: string) => {
    const template = currentWorld?.briefTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    dispatch(openModal({
      type: 'editBriefTemplate',
      data: { template }
    }));
  };
  
  // Обработчик открытия диалога удаления
  const handleOpenDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };
  
  // Обработчик удаления шаблона
  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    dispatch(deleteBriefTemplate(templateToDelete));
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };
  
  // Обработчик генерации брифа
  const handleGenerateBrief = () => {
    if (!currentWorld || !selectedTemplateId) return;
    
    // Получаем выбранный шаблон
    const template = currentWorld.briefTemplates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    
    // Получаем выбранные элементы
    const elements = selectedElements.map(id => currentWorld.elements[id]).filter(Boolean);
    
    // Генерируем бриф с помощью сервиса
    const brief = exportService.generateBrief(currentWorld, elements, template.name);
    
    // Сохраняем сгенерированный бриф и открываем диалог
    setGeneratedBrief(brief);
    setBriefDialogOpen(true);
  };
  
  // Обработчик экспорта брифа
  const handleExportBrief = async (format: 'markdown' | 'pdf' | 'txt') => {
    if (!generatedBrief) return;
    
    try {
      await exportService.exportBrief(generatedBrief, format);
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: `Бриф успешно экспортирован в формате ${format.toUpperCase()}`,
        autoHide: true
      }));
    } catch (error) {
      console.error(`Ошибка при экспорте брифа в ${format}:`, error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при экспорте брифа: ${error}`,
        autoHide: true
      }));
    }
  };
  
  // Обработчик копирования брифа в буфер обмена
  const handleCopyBrief = () => {
    if (!generatedBrief) return;
    
    navigator.clipboard.writeText(generatedBrief).then(
      () => {
        // Показываем уведомление
        dispatch(addNotification({
          type: 'success',
          message: 'Бриф скопирован в буфер обмена',
          autoHide: true
        }));
      },
      (error) => {
        console.error('Ошибка при копировании в буфер обмена:', error);
        
        // Показываем уведомление об ошибке
        dispatch(addNotification({
          type: 'error',
          message: 'Ошибка при копировании в буфер обмена',
          autoHide: true
        }));
      }
    );
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
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Управление брифами
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Создавайте шаблоны брифов и генерируйте брифы для работы с ИИ-ассистентами.
      </Typography>
      
      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab 
            value="templates" 
            label="Шаблоны брифов" 
            icon={<SettingsIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="generator" 
            label="Генератор брифов" 
            icon={<DescriptionIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {/* Содержимое для вкладки шаблонов */}
      {currentTab === 'templates' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
            >
              Создать шаблон
            </Button>
          </Box>
          
          {currentWorld.briefTemplates.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                У вас пока нет шаблонов брифов. Создайте первый шаблон для начала работы.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateTemplate}
              >
                Создать шаблон
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {currentWorld.briefTemplates.map((template) => (
                <Grid item xs={12} md={6} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AssignmentIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {template.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Разделы:
                      </Typography>
                      <List dense>
                        {template.sections.map((section, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={section.title}
                              secondary={`${section.elementTypes.join(', ')} (макс. ${section.maxElements})`}
                            />
                            {section.required && (
                              <Chip 
                                label="Обязательный" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditTemplate(template.id)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleOpenDeleteDialog(template.id)}
                      >
                        Удалить
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      
      {/* Содержимое для вкладки генератора */}
      {currentTab === 'generator' && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Генерация нового брифа
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="template-label">Шаблон брифа</InputLabel>
                  <Select
                    labelId="template-label"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    label="Шаблон брифа"
                  >
                    <MenuItem value="">
                      <em>Выберите шаблон</em>
                    </MenuItem>
                    {currentWorld.briefTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="elements-label">Элементы для включения</InputLabel>
                  <Select
                    labelId="elements-label"
                    multiple
                    value={selectedElements}
                    onChange={(e) => setSelectedElements(e.target.value as string[])}
                    label="Элементы для включения"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={currentWorld.elements[value]?.name || 'Удаленный элемент'} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(currentWorld.elements).map((element) => (
                      <MenuItem key={element.id} value={element.id}>
                        {element.name} ({getElementTypeName(element.type)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateBrief}
                disabled={!selectedTemplateId || selectedElements.length === 0}
              >
                Сгенерировать бриф
              </Button>
            </Box>
          </Paper>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Сгенерированный бриф можно использовать как контекст для ИИ-ассистентов. 
              Он содержит структурированную информацию о выбранных элементах мира, 
              что помогает ИИ лучше понять контекст и не нарушать внутреннюю логику мира.
            </Typography>
          </Alert>
        </Box>
      )}
      
      {/* Диалог подтверждения удаления шаблона */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление шаблона</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {templateToDelete && (
              <>
                Вы уверены, что хотите удалить шаблон "{
                  currentWorld.briefTemplates.find(t => t.id === templateToDelete)?.name
                }"? Это действие нельзя отменить.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteTemplate} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог с сгенерированным брифом */}
      <Dialog
        open={briefDialogOpen}
        onClose={() => setBriefDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Сгенерированный бриф
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            rows={20}
            value={generatedBrief}
            onChange={(e) => setGeneratedBrief(e.target.value)}
            variant="outlined"
            InputProps={{
              readOnly: false,
            }}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Экспорт:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportBrief('markdown')}
            >
              Markdown
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportBrief('pdf')}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportBrief('txt')}
            >
              TXT
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyBrief}
            >
              Копировать
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBriefDialogOpen(false)}>
            Закрыть
          </Button>
          <Button 
            onClick={() => setBriefDialogOpen(false)} 
            color="primary" 
            variant="contained"
          >
            Готово
          </Button>
        </DialogActions>
      </Dialog>
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

export default BriefsPage;
