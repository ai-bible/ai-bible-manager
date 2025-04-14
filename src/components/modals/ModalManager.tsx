/**
 * Компонент для управления модальными окнами
 */
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { closeModal, ModalType } from '../../store/slices/uiSlice';

// Импортируем реализованные модальные окна
import RestoreSnapshotModal from './RestoreSnapshotModal';
import ResolveConflictModal from './ResolveConflictModal';
import EditElementModal from './EditElementModal';
import CreateSnapshotModal from './CreateSnapshotModal';
import CreateChapterModal from './CreateChapterModal';
import CreateElementModal from './CreateElementModal';

const ModalManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const modals = useAppSelector((state) => state.ui.modals);
  
  // Обработчик закрытия модального окна
  const handleClose = (type: ModalType) => {
    dispatch(closeModal(type));
  };
  
  return (
    <>
      {/* Модальное окно создания мира */}
      <Dialog
        open={Boolean(modals.createWorld?.isOpen)}
        onClose={() => handleClose('createWorld')}
        maxWidth="md"
        fullWidth
      >
        {modals.createWorld?.isOpen && (
          <CreateWorldModal 
            onClose={() => handleClose('createWorld')} 
            data={modals.createWorld.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно создания элемента */}
      <Dialog
        open={Boolean(modals.createElement?.isOpen)}
        onClose={() => handleClose('createElement')}
        maxWidth="md"
        fullWidth
      >
        {modals.createElement?.isOpen && (
          <CreateElementModal 
            onClose={() => handleClose('createElement')} 
            data={modals.createElement.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно редактирования элемента */}
      <Dialog
        open={Boolean(modals.editElement?.isOpen)}
        onClose={() => handleClose('editElement')}
        maxWidth="md"
        fullWidth
      >
        {modals.editElement?.isOpen && (
          <EditElementModal 
            onClose={() => handleClose('editElement')} 
            data={modals.editElement.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно удаления элемента */}
      <Dialog
        open={Boolean(modals.deleteElement?.isOpen)}
        onClose={() => handleClose('deleteElement')}
        maxWidth="sm"
        fullWidth
      >
        {modals.deleteElement?.isOpen && (
          <DeleteElementModal 
            onClose={() => handleClose('deleteElement')} 
            data={modals.deleteElement.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно создания связи */}
      <Dialog
        open={Boolean(modals.createRelationship?.isOpen)}
        onClose={() => handleClose('createRelationship')}
        maxWidth="sm"
        fullWidth
      >
        {modals.createRelationship?.isOpen && (
          <CreateRelationshipModal 
            onClose={() => handleClose('createRelationship')} 
            data={modals.createRelationship.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно создания главы */}
      <Dialog
        open={Boolean(modals.createChapter?.isOpen)}
        onClose={() => handleClose('createChapter')}
        maxWidth="sm"
        fullWidth
      >
        {modals.createChapter?.isOpen && (
          <CreateChapterModal 
            onClose={() => handleClose('createChapter')} 
            data={modals.createChapter.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно редактирования главы */}
      <Dialog
        open={Boolean(modals.editChapter?.isOpen)}
        onClose={() => handleClose('editChapter')}
        maxWidth="sm"
        fullWidth
      >
        {modals.editChapter?.isOpen && (
          <EditChapterModal 
            onClose={() => handleClose('editChapter')} 
            data={modals.editChapter.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно создания снимка */}
      <Dialog
        open={Boolean(modals.createSnapshot?.isOpen)}
        onClose={() => handleClose('createSnapshot')}
        maxWidth="sm"
        fullWidth
      >
        {modals.createSnapshot?.isOpen && (
          <CreateSnapshotModal 
            onClose={() => handleClose('createSnapshot')} 
            data={modals.createSnapshot.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно восстановления из снимка */}
      <Dialog
        open={Boolean(modals.restoreSnapshot?.isOpen)}
        onClose={() => handleClose('restoreSnapshot')}
        maxWidth="sm"
        fullWidth
      >
        {modals.restoreSnapshot?.isOpen && (
          <RestoreSnapshotModal 
            onClose={() => handleClose('restoreSnapshot')} 
            data={modals.restoreSnapshot.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно создания шаблона брифа */}
      <Dialog
        open={Boolean(modals.createBriefTemplate?.isOpen)}
        onClose={() => handleClose('createBriefTemplate')}
        maxWidth="md"
        fullWidth
      >
        {modals.createBriefTemplate?.isOpen && (
          <CreateBriefTemplateModal 
            onClose={() => handleClose('createBriefTemplate')} 
            data={modals.createBriefTemplate.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно редактирования шаблона брифа */}
      <Dialog
        open={Boolean(modals.editBriefTemplate?.isOpen)}
        onClose={() => handleClose('editBriefTemplate')}
        maxWidth="md"
        fullWidth
      >
        {modals.editBriefTemplate?.isOpen && (
          <EditBriefTemplateModal 
            onClose={() => handleClose('editBriefTemplate')} 
            data={modals.editBriefTemplate.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно генерации брифа */}
      <Dialog
        open={Boolean(modals.generateBrief?.isOpen)}
        onClose={() => handleClose('generateBrief')}
        maxWidth="md"
        fullWidth
      >
        {modals.generateBrief?.isOpen && (
          <GenerateBriefModal 
            onClose={() => handleClose('generateBrief')} 
            data={modals.generateBrief.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно экспорта мира */}
      <Dialog
        open={Boolean(modals.exportWorld?.isOpen)}
        onClose={() => handleClose('exportWorld')}
        maxWidth="sm"
        fullWidth
      >
        {modals.exportWorld?.isOpen && (
          <ExportWorldModal 
            onClose={() => handleClose('exportWorld')} 
            data={modals.exportWorld.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно импорта мира */}
      <Dialog
        open={Boolean(modals.importWorld?.isOpen)}
        onClose={() => handleClose('importWorld')}
        maxWidth="sm"
        fullWidth
      >
        {modals.importWorld?.isOpen && (
          <ImportWorldModal 
            onClose={() => handleClose('importWorld')} 
            data={modals.importWorld.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно настроек */}
      <Dialog
        open={Boolean(modals.settings?.isOpen)}
        onClose={() => handleClose('settings')}
        maxWidth="md"
        fullWidth
      >
        {modals.settings?.isOpen && (
          <SettingsModal 
            onClose={() => handleClose('settings')} 
            data={modals.settings.data}
          />
        )}
      </Dialog>
      
      {/* Модальное окно разрешения конфликта */}
      <Dialog
        open={Boolean(modals.resolveConflict?.isOpen)}
        onClose={() => handleClose('resolveConflict')}
        maxWidth="md"
        fullWidth
      >
        {modals.resolveConflict?.isOpen && (
          <ResolveConflictModal 
            onClose={() => handleClose('resolveConflict')} 
            data={modals.resolveConflict.data}
          />
        )}
      </Dialog>
    </>
  );
};

// Заглушка для модальных окон, которые еще не реализованы
const PlaceholderModal: React.FC<{ title: string, onClose: () => void }> = ({ title, onClose }) => (
  <>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <p>Этот компонент еще не реализован</p>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Закрыть</Button>
    </DialogActions>
  </>
);

// Заглушки для нереализованных модальных окон
const CreateWorldModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Создание мира" onClose={props.onClose} />
);

const DeleteElementModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Удаление элемента" onClose={props.onClose} />
);

const CreateRelationshipModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Создание связи" onClose={props.onClose} />
);

const EditChapterModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Редактирование главы" onClose={props.onClose} />
);

const CreateBriefTemplateModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Создание шаблона брифа" onClose={props.onClose} />
);

const EditBriefTemplateModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Редактирование шаблона брифа" onClose={props.onClose} />
);

const GenerateBriefModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Генерация брифа" onClose={props.onClose} />
);

const ExportWorldModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Экспорт мира" onClose={props.onClose} />
);

const ImportWorldModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Импорт мира" onClose={props.onClose} />
);

const SettingsModal: React.FC<any> = (props) => (
  <PlaceholderModal title="Настройки" onClose={props.onClose} />
);

export default ModalManager;