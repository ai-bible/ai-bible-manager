/**
 * Страница детального просмотра элемента
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { WorldElement } from '../types/Element';
import { openModal } from '../store/slices/uiSlice';
import ElementDetails from '../components/elements/ElementDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ElementDetailsPage: React.FC = () => {
  const { elementId } = useParams<{ elementId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Получаем данные из хранилища
  const currentWorldId = useAppSelector(state => state.world.currentWorldId);
  const currentWorld = useAppSelector(state => 
    currentWorldId ? state.world.worlds[currentWorldId] : null
  );
  
  // Состояние загрузки
  const [loading, setLoading] = useState(true);
  const [element, setElement] = useState<WorldElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Загружаем данные элемента
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (!currentWorld || !elementId) {
      setError('Мир не загружен или не указан ID элемента');
      setLoading(false);
      return;
    }
    
    const foundElement = currentWorld.elements[elementId];
    
    if (!foundElement) {
      setError(`Элемент с ID ${elementId} не найден`);
      setLoading(false);
      return;
    }
    
    setElement(foundElement);
    setLoading(false);
  }, [currentWorld, elementId]);
  
  // Обработчик редактирования элемента
  const handleEditElement = () => {
    if (!element) return;
    
    dispatch(openModal({
      type: 'editElement',
      data: { element }
    }));
  };
  
  // Обработчик удаления элемента
  const handleDeleteElement = () => {
    navigate('/elements');
  };
  
  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        p: 3 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Если произошла ошибка, показываем сообщение об ошибке
  if (error || !element) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/elements')}
            >
              Вернуться к списку
            </Button>
          }
        >
          {error || 'Элемент не найден'}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/elements')}
        >
          К списку элементов
        </Button>
      </Box>
      
      <ElementDetails 
        element={element}
        onEdit={handleEditElement}
        onDelete={handleDeleteElement}
      />
    </Box>
  );
};

export default ElementDetailsPage;
