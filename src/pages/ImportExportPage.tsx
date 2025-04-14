/**
 * Страница для импорта и экспорта данных
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
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/uiSlice';
import { exportService } from '../services/export';
import { storageService } from '../services/storage';

// Иконки
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import JsonIcon from '@mui/icons-material/Code';
import MarkdownIcon from '@mui/icons-material/Article';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import HtmlIcon from '@mui/icons-material/Html';
import TextIcon from '@mui/icons-material/TextSnippet';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import BackupIcon from '@mui/icons-material/Backup';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';

const ImportExportPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояния для экспорта
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [exportScope, setExportScope] = useState<string>('world');
  const [exportingWorld, setExportingWorld] = useState<boolean>(false);
  
  // Состояния для импорта
  const [importingWorld, setImportingWorld] = useState<boolean>(false);
  
  // Обработчик экспорта мира
  const handleExportWorld = async () => {
    if (!currentWorld) return;
    
    setExportingWorld(true);
    
    try {
      switch (exportFormat) {
        case 'json':
          exportService.exportToJson(currentWorld);
          break;
        case 'markdown':
          exportService.exportToMarkdown(currentWorld);
          break;
        case 'pdf':
          await exportService.exportToPdf(currentWorld);
          break;
        case 'html':
          exportService.exportToHtml(currentWorld);
          break;
        case 'txt':
          exportService.exportToTxt(currentWorld);
          break;
        case 'excel':
          exportService.exportToExcel(currentWorld);
          break;
        default:
          throw new Error(`Неподдерживаемый формат: ${exportFormat}`);
      }
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: `Мир успешно экспортирован в формате ${getFormatDisplayName(exportFormat)}`,
        autoHide: true
      }));
    } catch (error) {
      console.error('Ошибка при экспорте мира:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при экспорте мира: ${error}`,
        autoHide: true
      }));
    } finally {
      setExportingWorld(false);
    }
  };
  
  // Обработчик импорта мира
  const handleImportWorld = async () => {
    setImportingWorld(true);
    
    try {
      await storageService.loadWorldFromFile();
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: 'Мир успешно импортирован',
        autoHide: true
      }));
    } catch (error) {
      console.error('Ошибка при импорте мира:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при импорте мира: ${error}`,
        autoHide: true
      }));
    } finally {
      setImportingWorld(false);
    }
  };
  
  // Обработчик создания резервной копии
  const handleCreateBackup = async () => {
    if (!currentWorld) return;
    
    try {
      const backupId = await storageService.createBackup(currentWorld);
      
      // Показываем уведомление
      dispatch(addNotification({
        type: 'success',
        message: 'Резервная копия успешно создана',
        autoHide: true
      }));
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при создании резервной копии: ${error}`,
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
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Импорт и экспорт
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Сохраняйте ваш мир в различных форматах и восстанавливайте из файлов.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Блок экспорта */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Экспорт
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Формат экспорта:
              </Typography>
              <RadioGroup
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                row
              >
                <FormControlLabel 
                  value="json" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <JsonIcon sx={{ mr: 0.5 }} />
                      JSON
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="markdown" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MarkdownIcon sx={{ mr: 0.5 }} />
                      Markdown
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="pdf" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PdfIcon sx={{ mr: 0.5 }} />
                      PDF
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="html" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HtmlIcon sx={{ mr: 0.5 }} />
                      HTML
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="txt" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextIcon sx={{ mr: 0.5 }} />
                      TXT
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="excel" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextIcon sx={{ mr: 0.5 }} />
                      Excel
                    </Box>
                  } 
                />
              </RadioGroup>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {getFormatDescription(exportFormat)}
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={exportingWorld ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleExportWorld}
              disabled={exportingWorld}
              fullWidth
            >
              {exportingWorld ? 'Экспорт...' : 'Экспортировать мир'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Блок импорта и резервных копий */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Импорт и резервные копии
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Импорт из файла:
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Импорт создаст новый мир. Текущий мир останется доступным.
                </Typography>
              </Alert>
              <Button
                variant="contained"
                color="primary"
                startIcon={importingWorld ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
                onClick={handleImportWorld}
                disabled={importingWorld}
                fullWidth
                sx={{ mb: 3 }}
              >
                {importingWorld ? 'Импорт...' : 'Импортировать из файла'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Резервные копии:
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Резервные копии хранятся локально и доступны даже после закрытия браузера.
                </Typography>
              </Alert>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<BackupIcon />}
                onClick={handleCreateBackup}
                fullWidth
                sx={{ mb: 2 }}
              >
                Создать резервную копию
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Вспомогательные функции
const getFormatDisplayName = (format: string): string => {
  switch (format) {
    case 'json':
      return 'JSON';
    case 'markdown':
      return 'Markdown';
    case 'pdf':
      return 'PDF';
    case 'html':
      return 'HTML';
    case 'txt':
      return 'TXT';
    case 'excel':
      return 'Excel';
    default:
      return format.toUpperCase();
  }
};

const getFormatDescription = (format: string): string => {
  switch (format) {
    case 'json':
      return 'JSON - полная копия всех данных, подходит для резервного копирования и переноса между устройствами.';
    case 'markdown':
      return 'Markdown - человекочитаемый текстовый формат для документации или публикации.';
    case 'pdf':
      return 'PDF - документ для печати или архивирования.';
    case 'html':
      return 'HTML - веб-страница для просмотра в браузере или публикации.';
    case 'txt':
      return 'TXT - простой текстовый формат, оптимизированный для работы с ИИ-ассистентами.';
    case 'excel':
      return 'Excel - таблица с данными о элементах и связях для анализа.';
    default:
      return 'Выберите формат для экспорта.';
  }
};

export default ImportExportPage;
