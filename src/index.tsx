/**
 * Точка входа в приложение Bible-Manager
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import './styles/global.css';

// Получаем корневой элемент
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден корневой элемент для рендеринга приложения');
}

// Создаем корневой компонент
const root = createRoot(rootElement);

// Рендерим приложение
root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </ReduxProvider>
  </React.StrictMode>
);
