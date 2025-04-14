/**
 * Сервис для работы с локальным хранилищем данных
 */
import { World, WorldMetadata } from '../types/World';
import { RootState } from '../store';

// Интерфейс сервиса хранилища
export interface StorageService {
  // Сохранение мира в файл
  saveWorldToFile: (world: World) => Promise<void>;
  
  // Загрузка мира из файла
  loadWorldFromFile: () => Promise<World>;
  
  // Получение списка сохраненных миров
  getSavedWorlds: () => Promise<WorldMetadata[]>;
  
  // Сохранение состояния приложения
  saveAppState: (state: RootState) => Promise<void>;
  
  // Загрузка состояния приложения
  loadAppState: () => Promise<RootState | null>;
  
  // Автоматическое сохранение
  setupAutoSave: (interval: number, callback: () => Promise<void>) => void;
  
  // Отключение автоматического сохранения
  disableAutoSave: () => void;
  
  // Создание резервной копии
  createBackup: (world: World) => Promise<string>;
  
  // Восстановление из резервной копии
  restoreFromBackup: (backupId: string) => Promise<World>;
  
  // Получение списка резервных копий
  getBackups: () => Promise<Array<{id: string, date: Date, worldName: string}>>;
}

/**
 * Реализация сервиса хранилища с использованием File System API
 */
class LocalStorageService implements StorageService {
  private autoSaveInterval: NodeJS.Timeout | null = null;
  
  /**
   * Сохраняет мир в JSON-файл
   */
  async saveWorldToFile(world: World): Promise<void> {
    try {
      // Конвертируем объект мира в JSON-строку
      const worldData = JSON.stringify(world, null, 2);
      
      // Создаем объект Blob для файла
      const blob = new Blob([worldData], { type: 'application/json' });
      
      // Создаем URL для скачивания
      const url = URL.createObjectURL(blob);
      
      // Создаем ссылку и инициируем скачивание
      const link = document.createElement('a');
      link.href = url;
      link.download = `${world.name.replace(/\s+/g, '_')}_${formatDateForFileName(new Date())}.json`;
      link.click();
      
      // Освобождаем URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при сохранении мира в файл:', error);
      throw new Error(`Не удалось сохранить мир в файл: ${error}`);
    }
  }
  
  /**
   * Загружает мир из выбранного файла
   */
  async loadWorldFromFile(): Promise<World> {
    return new Promise((resolve, reject) => {
      try {
        // Создаем скрытый input для выбора файла
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        // Обработчик выбора файла
        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          
          if (!file) {
            reject(new Error('Файл не выбран'));
            return;
          }
          
          // Читаем содержимое файла
          const reader = new FileReader();
          
          reader.onload = (loadEvent) => {
            try {
              const content = loadEvent.target?.result as string;
              const world = JSON.parse(content) as World;
              
              // Проверяем, что загружаемый объект имеет структуру мира
              if (!isValidWorldObject(world)) {
                reject(new Error('Выбранный файл не содержит корректных данных мира'));
                return;
              }
              
              resolve(world);
            } catch (error) {
              reject(new Error(`Ошибка при чтении файла: ${error}`));
            }
          };
          
          reader.onerror = () => {
            reject(new Error('Ошибка при чтении файла'));
          };
          
          reader.readAsText(file);
        };
        
        // Имитируем клик для открытия диалога выбора файла
        input.click();
      } catch (error) {
        reject(new Error(`Не удалось загрузить мир из файла: ${error}`));
      }
    });
  }
  
  /**
   * Получает список сохраненных миров из локального хранилища
   */
  async getSavedWorlds(): Promise<WorldMetadata[]> {
    try {
      // Получаем список миров из localStorage
      const savedWorldsJson = localStorage.getItem('bible-manager-worlds');
      
      if (!savedWorldsJson) {
        return [];
      }
      
      const savedWorlds = JSON.parse(savedWorldsJson) as Record<string, World>;
      
      // Преобразуем в массив метаданных
      return Object.values(savedWorlds).map(world => ({
        id: world.id,
        name: world.name,
        description: world.description,
        elementsCount: Object.keys(world.elements).length,
        chaptersCount: world.chapters.length,
        createdAt: new Date(world.createdAt),
        modifiedAt: new Date(world.modifiedAt),
        lastOpenedAt: new Date(world.lastOpenedAt)
      }));
    } catch (error) {
      console.error('Ошибка при получении списка сохраненных миров:', error);
      return [];
    }
  }
  
  /**
   * Сохраняет состояние приложения в локальное хранилище
   */
  async saveAppState(state: RootState): Promise<void> {
    try {
      // Преобразуем состояние в JSON и сохраняем в localStorage
      localStorage.setItem('bible-manager-state', JSON.stringify(state));
    } catch (error) {
      console.error('Ошибка при сохранении состояния приложения:', error);
      throw new Error(`Не удалось сохранить состояние приложения: ${error}`);
    }
  }
  
  /**
   * Загружает состояние приложения из локального хранилища
   */
  async loadAppState(): Promise<RootState | null> {
    try {
      const stateJson = localStorage.getItem('bible-manager-state');
      
      if (!stateJson) {
        return null;
      }
      
      return JSON.parse(stateJson) as RootState;
    } catch (error) {
      console.error('Ошибка при загрузке состояния приложения:', error);
      return null;
    }
  }
  
  /**
   * Настраивает автоматическое сохранение с заданным интервалом
   */
  setupAutoSave(interval: number, callback: () => Promise<void>): void {
    // Сначала удаляем предыдущий интервал, если он был
    this.disableAutoSave();
    
    // Устанавливаем новый интервал (в минутах)
    this.autoSaveInterval = setInterval(async () => {
      try {
        await callback();
        console.log(`Автосохранение выполнено (интервал: ${interval} мин)`);
      } catch (error) {
        console.error('Ошибка при автосохранении:', error);
      }
    }, interval * 60 * 1000);
  }
  
  /**
   * Отключает автоматическое сохранение
   */
  disableAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
  
  /**
   * Создает резервную копию мира
   */
  async createBackup(world: World): Promise<string> {
    try {
      // Генерируем ID для резервной копии
      const backupId = `${world.id}_${Date.now()}`;
      
      // Создаем метаданные резервной копии
      const backupMetadata = {
        id: backupId,
        date: new Date(),
        worldName: world.name,
        worldId: world.id
      };
      
      // Получаем существующие метаданные резервных копий
      const backupsMetadataJson = localStorage.getItem('bible-manager-backups-metadata');
      const backupsMetadata = backupsMetadataJson 
        ? JSON.parse(backupsMetadataJson) 
        : [];
      
      // Добавляем новую резервную копию
      backupsMetadata.push(backupMetadata);
      
      // Сохраняем обновленные метаданные
      localStorage.setItem('bible-manager-backups-metadata', JSON.stringify(backupsMetadata));
      
      // Сохраняем резервную копию
      localStorage.setItem(`bible-manager-backup-${backupId}`, JSON.stringify(world));
      
      return backupId;
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      throw new Error(`Не удалось создать резервную копию: ${error}`);
    }
  }
  
  /**
   * Восстанавливает мир из резервной копии
   */
  async restoreFromBackup(backupId: string): Promise<World> {
    try {
      // Получаем резервную копию из localStorage
      const backupJson = localStorage.getItem(`bible-manager-backup-${backupId}`);
      
      if (!backupJson) {
        throw new Error(`Резервная копия с ID ${backupId} не найдена`);
      }
      
      const world = JSON.parse(backupJson) as World;
      
      // Проверяем, что загружаемый объект имеет структуру мира
      if (!isValidWorldObject(world)) {
        throw new Error('Резервная копия содержит некорректные данные мира');
      }
      
      return world;
    } catch (error) {
      console.error('Ошибка при восстановлении из резервной копии:', error);
      throw new Error(`Не удалось восстановить из резервной копии: ${error}`);
    }
  }
  
  /**
   * Получает список резервных копий
   */
  async getBackups(): Promise<Array<{id: string, date: Date, worldName: string}>> {
    try {
      // Получаем метаданные резервных копий
      const backupsMetadataJson = localStorage.getItem('bible-manager-backups-metadata');
      
      if (!backupsMetadataJson) {
        return [];
      }
      
      const backupsMetadata = JSON.parse(backupsMetadataJson) as Array<{
        id: string, 
        date: string, 
        worldName: string
      }>;
      
      // Преобразуем даты из строк в объекты Date
      return backupsMetadata.map(backup => ({
        id: backup.id,
        date: new Date(backup.date),
        worldName: backup.worldName
      }));
    } catch (error) {
      console.error('Ошибка при получении списка резервных копий:', error);
      return [];
    }
  }
}

/**
 * Вспомогательная функция для форматирования даты в строке имени файла
 */
function formatDateForFileName(date: Date): string {
  return date.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
}

/**
 * Проверяет, что объект имеет структуру мира
 */
function isValidWorldObject(obj: any): obj is World {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.elements === 'object'
  );
}

// Экспорт экземпляра сервиса
export const storageService = new LocalStorageService();
