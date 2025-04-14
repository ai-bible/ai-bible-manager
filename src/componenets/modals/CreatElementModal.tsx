/**
 * Модальное окно для создания нового элемента
 */
import React from 'react';
import { 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button 
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { addElement } from '../../store/slices/worldSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { ElementType, CanonTier, NewWorldElement } from '../../types/Element';
import ElementEditor from '../elements/ElementEditor';

interface CreateElementModalProps {
  onClose: () => void;
  data: any;
}

const CreateElementModal: React.FC<CreateElementModalProps> = ({ onClose, data }) => {
  const dispatch = useAppDispatch();
  
  // Обработчик создания элемента
  const handleSave = (element: NewWorldElement) => {
    try {
      dispatch(addElement(element));
      
      // Показываем уведомление об успешном создании
      dispatch(addNotification({
        type: 'success',
        message: `Элемент "${element.name}" успешно создан`,
        autoHide: true
      }));
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при создании элемента:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при создании элемента: ${error}`,
        autoHide: true
      }));
    }
  };
  
  return (
    <>
      <DialogTitle>Создание нового элемента</DialogTitle>
      <DialogContent>
        <ElementEditor
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </>
  );
};

export default CreateElementModal;
