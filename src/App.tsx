/**
 * Корневой компонент приложения Bible-Manager
 */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setTheme } from './store/slices/uiSlice';
import { storageService } from './services/storage';

// Компоненты макета
import Layout from './components/layout/Layout';
import NotificationsManager from './components/common/NotificationsManager';

// Страницы
import Dashboard from './pages/Dashboard';
import ElementsPage from './pages/ElementsPage';
import ElementDetailsPage from './pages/ElementDetailsPage';
import RelationshipsPage from './pages/RelationshipsPage';
import ConflictsPage from './pages/ConflictsPage';
import ChaptersPage from './pages/ChaptersPage';
import SnapshotsPage from './pages/SnapshotsPage';
import BriefsPage from './pages/BriefsPage';
import SettingsPage from './pages/SettingsPage';
import ImportExportPage from './pages/ImportExportPage';
import WelcomePage from './pages/WelcomePage';

// Модальные окна
import ModalManager from './components/modals/ModalManager';

// Основные стили
import './styles/global.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.ui.theme);
  const currentWorldId = useAppSelector((state) => state.world.currentWorldId);
  
  // Определяем светлую или темную тему
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Выбираем тему в зависимости от настроек
  const activeTheme = currentTheme === 'system'
    ? prefersDarkMode ? 'dark' : 'light'
    : currentTheme;
  
  // Создаем тему Material UI
  const theme = createTheme({
    palette: {
      mode: activeTheme as 'light' | 'dark',
      primary: {
        main: '#4E7BB1',
      },
      secondary: {
        main: '#F0B96D',
      },
      background: {
        default: activeTheme === 'dark' ? '#121212' : '#f5f5f5',
        paper: activeTheme === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h1: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.1rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: activeTheme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.12)' 
              : '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
    },
  });
  
  // Слушаем изменения темной темы системы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (currentTheme === 'system') {
        // Обновлять не нужно, компонент перерисуется
        // так как мы используем переменную prefersDarkMode
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Очищаем слушатель при размонтировании
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [currentTheme]);
  
  // Устанавливаем автосохранение
  useEffect(() => {
    if (currentWorldId) {
      storageService.setupAutoSave(5, async () => {
        // Здесь будет логика автосохранения
        console.log('Автосохранение...');
      });
    }
    
    return () => {
      storageService.disableAutoSave();
    };
  }, [currentWorldId]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            {/* Если мир не выбран, перенаправляем на страницу приветствия */}
            {!currentWorldId ? (
              <>
                <Route path="/" element={<WelcomePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/elements" element={<ElementsPage />} />
                <Route path="/elements/:elementId" element={<ElementDetailsPage />} />
                <Route path="/relationships" element={<RelationshipsPage />} />
                <Route path="/conflicts" element={<ConflictsPage />} />
                <Route path="/chapters" element={<ChaptersPage />} />
                <Route path="/snapshots" element={<SnapshotsPage />} />
                <Route path="/briefs" element={<BriefsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/import-export" element={<ImportExportPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </Layout>
        
        {/* Менеджер уведомлений */}
        <NotificationsManager />
        
        {/* Менеджер модальных окон */}
        <ModalManager />
      </Router>
    </ThemeProvider>
  );
};

export default App;
