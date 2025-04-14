/**
 * Модальное окно для редактирования элемента
 */
import React from 'react';
import { 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button 
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { updateElement } from '../../store/slices/worldSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { WorldElement } from '../../types/Element';
import ElementEditor from '../elements/ElementEditor';

interface EditElementModalProps {
  onClose: () => void;
  data: {
    element: WorldElement;
  };
}

const EditElementModal: React.FC<EditElementModalProps> = ({ onClose, data }) => {
  const dispatch = useAppDispatch();
  const { element } = data;
  
  // Обработчик сохранения изменений
  const handleSave = (updatedElement: WorldElement) => {
    try {
      // Отправляем только измененные поля
      const updates: Partial<WorldElement> = {
        name: updatedElement.name,
        description: updatedElement.description,
        canonTier: updatedElement.canonTier,
        tags: updatedElement.tags,
        notes: updatedElement.notes,
        properties: updatedElement.properties
      };
      
      dispatch(updateElement({ id: element.id, updates }));
      
      // Показываем уведомление об успешном обновлении
      dispatch(addNotification({
        type: 'success',
        message: `Элемент "${updatedElement.name}" успешно обновлен`,
        autoHide: true
      }));
      
      // Закрываем модальное окно
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении элемента:', error);
      
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: `Ошибка при обновлении элемента: ${error}`,
        autoHide: true
      }));
    }
  };
  
  return (
    <>
      <DialogTitle>Редактирование элемента</DialogTitle>
      <DialogContent>
        <ElementEditor
          element={element}
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </>
  );
};

export default EditElementModal;
