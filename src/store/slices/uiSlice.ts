/**
 * Redux-слайс для управления состоянием UI
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Типы модальных окон
export type ModalType = 
  | 'createWorld' 
  | 'createElement' 
  | 'editElement' 
  | 'deleteElement'
  | 'createRelationship'
  | 'createChapter'
  | 'editChapter'
  | 'createSnapshot'
  | 'restoreSnapshot'
  | 'createBriefTemplate'
  | 'editBriefTemplate'
  | 'generateBrief'
  | 'exportWorld'
  | 'importWorld'
  | 'settings';

// Типы уведомлений
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

// Тип уведомления
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  autoHide?: boolean;
  duration?: number;
}

// Тип представления
export type ViewType = 
  | 'dashboard' 
  | 'elements' 
  | 'element-details' 
  | 'relationships'
  | 'conflicts'
  | 'chapters'
  | 'snapshots'
  | 'rules'
  | 'briefs'
  | 'settings';

// Начальное состояние UI
interface UIState {
  currentView: ViewType;
  selectedElementId: string | null;
  selectedChapterId: string | null;
  selectedSnapshotId: string | null;
  modals: {
    [key in ModalType]?: {
      isOpen: boolean;
      data?: any;
    };
  };
  notifications: Notification[];
  filters: {
    elementType: string[];
    canonTier: string[];
    tags: string[];
    searchQuery: string;
    chapter: string | null;
  };
  sidebar: {
    isOpen: boolean;
    width: number;
  };
  theme: 'light' | 'dark' | 'system';
  zoom: number;
}

const initialState: UIState = {
  currentView: 'dashboard',
  selectedElementId: null,
  selectedChapterId: null,
  selectedSnapshotId: null,
  modals: {},
  notifications: [],
  filters: {
    elementType: [],
    canonTier: [],
    tags: [],
    searchQuery: '',
    chapter: null
  },
  sidebar: {
    isOpen: true,
    width: 260
  },
  theme: 'system',
  zoom: 1
};

// Создание слайса
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Изменение текущего представления
    setCurrentView: (state, action: PayloadAction<ViewType>) => {
      state.currentView = action.payload;
    },
    
    // Выбор элемента
    selectElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
      if (action.payload) {
        state.currentView = 'element-details';
      }
    },
    
    // Выбор главы
    selectChapter: (state, action: PayloadAction<string | null>) => {
      state.selectedChapterId = action.payload;
    },
    
    // Выбор снимка
    selectSnapshot: (state, action: PayloadAction<string | null>) => {
      state.selectedSnapshotId = action.payload;
    },
    
    // Открытие модального окна
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: any }>) => {
      const { type, data } = action.payload;
      state.modals[type] = {
        isOpen: true,
        data
      };
    },
    
    // Закрытие модального окна
    closeModal: (state, action: PayloadAction<ModalType>) => {
      const type = action.payload;
      if (state.modals[type]) {
        state.modals[type] = {
          isOpen: false,
          data: state.modals[type]?.data
        };
      }
    },
    
    // Добавление уведомления
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        ...action.payload
      });
    },
    
    // Удаление уведомления
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    // Обновление фильтров
    updateFilters: (state, action: PayloadAction<Partial<UIState['filters']>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    
    // Сброс фильтров
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Переключение боковой панели
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    
    // Изменение ширины боковой панели
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebar.width = action.payload;
    },
    
    // Изменение темы
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    
    // Изменение масштаба
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    
    // Сброс состояния UI
    resetUI: (state) => {
      Object.assign(state, initialState);
    }
  }
});

// Экспорт действий
export const {
  setCurrentView,
  selectElement,
  selectChapter,
  selectSnapshot,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  updateFilters,
  resetFilters,
  toggleSidebar,
  setSidebarWidth,
  setTheme,
  setZoom,
  resetUI
} = uiSlice.actions;

// Экспорт редьюсера
export default uiSlice.reducer;
