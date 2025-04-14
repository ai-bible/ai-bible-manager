/**
 * Конфигурация Redux хранилища
 */
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';

// Импорт редьюсеров
import worldReducer from './slices/worldSlice';
import uiReducer from './slices/uiSlice';

// Конфигурация персистентности для каждого редьюсера
const worldPersistConfig = {
  key: 'world',
  storage,
  blacklist: ['loading', 'error']
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  blacklist: ['modals', 'notifications', 'currentView']
};

// Комбинирование редьюсеров с применением конфигурации персистентности
const rootReducer = combineReducers({
  world: persistReducer(worldPersistConfig, worldReducer),
  ui: persistReducer(uiPersistConfig, uiReducer)
});

// Создание хранилища
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Игнорирование деталей дат в состоянии
        ignoredPaths: ['world.elements.**.createdAt', 'world.elements.**.modifiedAt'],
      },
    }),
});

// Создание персистентного хранилища
export const persistor = persistStore(store);

// Типы для состояния и диспетчера
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
