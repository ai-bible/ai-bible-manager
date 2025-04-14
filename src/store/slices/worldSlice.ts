/**
 * Redux-слайс для управления данными мира
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { World, Chapter, WorldSnapshot, WorldRule, BriefTemplate, NewWorld } from '../../types/World';
import { WorldElement, NewWorldElement, Conflict, CanonTier, Relationship } from '../../types/Element';

// Начальное состояние
interface WorldState {
  worlds: Record<string, World>;
  currentWorldId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorldState = {
  worlds: {},
  currentWorldId: null,
  loading: false,
  error: null
};

// Создание слайса
const worldSlice = createSlice({
  name: 'world',
  initialState,
  reducers: {
    // Создание нового мира
    createWorld: (state, action: PayloadAction<NewWorld>) => {
      const { name, description } = action.payload;
      const id = uuidv4();
      const now = new Date();
      
      const newWorld: World = {
        id,
        name,
        description,
        elements: {},
        chapters: [],
        snapshots: [],
        rules: [],
        briefTemplates: [],
        createdAt: now,
        modifiedAt: now,
        lastOpenedAt: now,
        settings: {
          defaultCanonTier: 'secondary',
          autoSaveInterval: 5,
          theme: 'system',
          maxSnapshots: 50,
          conflictDetectionLevel: 'moderate',
          customElementTypes: {}
        }
      };
      
      state.worlds[id] = newWorld;
      state.currentWorldId = id;
    },
    
    // Загрузка мира
    loadWorld: (state, action: PayloadAction<string>) => {
      const worldId = action.payload;
      if (state.worlds[worldId]) {
        state.currentWorldId = worldId;
        state.worlds[worldId].lastOpenedAt = new Date();
      } else {
        state.error = `Мир с ID ${worldId} не найден`;
      }
    },
    
    // Удаление мира
    deleteWorld: (state, action: PayloadAction<string>) => {
      const worldId = action.payload;
      if (state.worlds[worldId]) {
        delete state.worlds[worldId];
        if (state.currentWorldId === worldId) {
          state.currentWorldId = Object.keys(state.worlds)[0] || null;
        }
      }
    },
    
    // Обновление свойств мира
    updateWorldProperties: (state, action: PayloadAction<{ name?: string; description?: string }>) => {
      const { name, description } = action.payload;
      if (state.currentWorldId) {
        const world = state.worlds[state.currentWorldId];
        if (name !== undefined) world.name = name;
        if (description !== undefined) world.description = description;
        world.modifiedAt = new Date();
      }
    },
    
    // Добавление нового элемента
    addElement: (state, action: PayloadAction<NewWorldElement>) => {
      if (!state.currentWorldId) return;
      
      const world = state.worlds[state.currentWorldId];
      const now = new Date();
      const id = uuidv4();
      
      const newElement: WorldElement = {
        id,
        ...action.payload,
        properties: action.payload.properties || {},
        appearances: action.payload.appearances || [],
        tags: action.payload.tags || [],
        notes: action.payload.notes || '',
        relationships: [],
        createdAt: now,
        modifiedAt: now,
        version: 1,
        conflicts: []
      };
      
      world.elements[id] = newElement;
      world.modifiedAt = now;
    },
    
    // Обновление элемента
    updateElement: (state, action: PayloadAction<{ id: string; updates: Partial<WorldElement> }>) => {
      if (!state.currentWorldId) return;
      
      const { id, updates } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      if (!world.elements[id]) {
        state.error = `Элемент с ID ${id} не найден`;
        return;
      }
      
      const element = world.elements[id];
      
      // Обновляем только переданные поля
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version') {
          // @ts-ignore: Динамический доступ к полям
          element[key] = updates[key];
        }
      });
      
      element.modifiedAt = new Date();
      element.version += 1;
      world.modifiedAt = new Date();
    },
    
    // Удаление элемента
    deleteElement: (state, action: PayloadAction<string>) => {
      if (!state.currentWorldId) return;
      
      const elementId = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      if (!world.elements[elementId]) {
        state.error = `Элемент с ID ${elementId} не найден`;
        return;
      }
      
      // Удаляем элемент
      delete world.elements[elementId];
      
      // Удаляем связи с этим элементом из других элементов
      Object.values(world.elements).forEach(element => {
        element.relationships = element.relationships.filter(rel => rel.targetId !== elementId);
        element.conflicts = element.conflicts.filter(conflict => conflict.withElementId !== elementId);
      });
      
      world.modifiedAt = new Date();
    },
    
    // Добавление связи между элементами
    addRelationship: (state, action: PayloadAction<{ 
      sourceId: string; 
      targetId: string; 
      type: string; 
      description: string 
    }>) => {
      if (!state.currentWorldId) return;
      
      const { sourceId, targetId, type, description } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      if (!world.elements[sourceId] || !world.elements[targetId]) {
        state.error = 'Один из элементов для связи не найден';
        return;
      }
      
      const relationship: Relationship = {
        targetId,
        type,
        description
      };
      
      world.elements[sourceId].relationships.push(relationship);
      world.elements[sourceId].modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Удаление связи
    deleteRelationship: (state, action: PayloadAction<{ 
      sourceId: string; 
      targetId: string;
      type: string;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { sourceId, targetId, type } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      if (!world.elements[sourceId]) {
        state.error = `Элемент с ID ${sourceId} не найден`;
        return;
      }
      
      world.elements[sourceId].relationships = world.elements[sourceId].relationships.filter(
        rel => !(rel.targetId === targetId && rel.type === type)
      );
      
      world.elements[sourceId].modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Добавление конфликта
    addConflict: (state, action: PayloadAction<{ 
      sourceId: string; 
      targetId: string; 
      description: string;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { sourceId, targetId, description } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      if (!world.elements[sourceId] || !world.elements[targetId]) {
        state.error = 'Один из элементов для конфликта не найден';
        return;
      }
      
      const conflict: Conflict = {
        id: uuidv4(),
        withElementId: targetId,
        description,
        status: 'unresolved',
        detectedAt: new Date()
      };
      
      world.elements[sourceId].conflicts.push(conflict);
      world.elements[sourceId].modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Обновление статуса конфликта
    updateConflictStatus: (state, action: PayloadAction<{ 
      elementId: string; 
      conflictId: string; 
      status: 'resolved' | 'ignored' | 'unresolved';
      resolution?: string;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { elementId, conflictId, status, resolution } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      if (!world.elements[elementId]) {
        state.error = `Элемент с ID ${elementId} не найден`;
        return;
      }
      
      const conflict = world.elements[elementId].conflicts.find(c => c.id === conflictId);
      
      if (!conflict) {
        state.error = `Конфликт с ID ${conflictId} не найден`;
        return;
      }
      
      conflict.status = status;
      if (status === 'resolved') {
        conflict.resolution = resolution;
        conflict.resolvedAt = new Date();
      }
      
      world.elements[elementId].modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Создание снимка мира
    createSnapshot: (state, action: PayloadAction<{ 
      description: string; 
      chapterId?: string;
      tags?: string[];
    }>) => {
      if (!state.currentWorldId) return;
      
      const { description, chapterId, tags } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const snapshot: WorldSnapshot = {
        id: uuidv4(),
        date: new Date(),
        description,
        worldState: JSON.stringify({
          elements: world.elements,
          chapters: world.chapters
        }),
        chapterId,
        tags: tags || []
      };
      
      world.snapshots.push(snapshot);
      world.modifiedAt = new Date();
      
      // Ограничение количества снимков согласно настройкам
      if (world.snapshots.length > world.settings.maxSnapshots) {
        world.snapshots.sort((a, b) => a.date.getTime() - b.date.getTime());
        world.snapshots = world.snapshots.slice(-world.settings.maxSnapshots);
      }
    },
    
    // Восстановление из снимка
    restoreFromSnapshot: (state, action: PayloadAction<string>) => {
      if (!state.currentWorldId) return;
      
      const snapshotId = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const snapshot = world.snapshots.find(s => s.id === snapshotId);
      
      if (!snapshot) {
        state.error = `Снимок с ID ${snapshotId} не найден`;
        return;
      }
      
      try {
        const parsedState = JSON.parse(snapshot.worldState);
        world.elements = parsedState.elements;
        world.chapters = parsedState.chapters;
        world.modifiedAt = new Date();
        
        // Создаем снимок текущего состояния перед восстановлением
        const backupSnapshot: WorldSnapshot = {
          id: uuidv4(),
          date: new Date(),
          description: `Автоматический снимок перед восстановлением "${snapshot.description}"`,
          worldState: JSON.stringify({
            elements: world.elements,
            chapters: world.chapters
          }),
          tags: ['auto-backup', 'pre-restore']
        };
        
        world.snapshots.push(backupSnapshot);
      } catch (error) {
        state.error = 'Ошибка при восстановлении снимка';
      }
    },
    
    // Добавление главы
    addChapter: (state, action: PayloadAction<{ 
      title: string; 
      description?: string;
      order?: number;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { title, description, order } = action.payload;
      const world = state.worlds[state.currentWorldId];
      const now = new Date();
      
      const newChapter: Chapter = {
        id: uuidv4(),
        title,
        description: description || '',
        order: order !== undefined ? order : world.chapters.length + 1,
        newElements: [],
        modifiedElements: [],
        createdAt: now,
        modifiedAt: now
      };
      
      world.chapters.push(newChapter);
      world.modifiedAt = now;
      
      // Сортировка глав по порядку
      world.chapters.sort((a, b) => a.order - b.order);
    },
    
    // Обновление главы
    updateChapter: (state, action: PayloadAction<{ 
      id: string; 
      updates: Partial<Chapter>;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { id, updates } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const chapterIndex = world.chapters.findIndex(c => c.id === id);
      
      if (chapterIndex === -1) {
        state.error = `Глава с ID ${id} не найдена`;
        return;
      }
      
      const chapter = world.chapters[chapterIndex];
      
      // Обновляем только переданные поля
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt') {
          // @ts-ignore: Динамический доступ к полям
          chapter[key] = updates[key];
        }
      });
      
      chapter.modifiedAt = new Date();
      world.modifiedAt = new Date();
      
      // Пересортировка глав, если изменился порядок
      if (updates.order !== undefined) {
        world.chapters.sort((a, b) => a.order - b.order);
      }
    },
    
    // Удаление главы
    deleteChapter: (state, action: PayloadAction<string>) => {
      if (!state.currentWorldId) return;
      
      const chapterId = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const chapterIndex = world.chapters.findIndex(c => c.id === chapterId);
      
      if (chapterIndex === -1) {
        state.error = `Глава с ID ${chapterId} не найдена`;
        return;
      }
      
      // Удаляем главу
      world.chapters.splice(chapterIndex, 1);
      
      // Перенумеровываем оставшиеся главы
      world.chapters.forEach((chapter, index) => {
        chapter.order = index + 1;
      });
      
      world.modifiedAt = new Date();
    },
    
    // Добавление элемента в главу
    addElementToChapter: (state, action: PayloadAction<{ 
      chapterId: string; 
      elementId: string;
      isNew: boolean;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { chapterId, elementId, isNew } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const chapter = world.chapters.find(c => c.id === chapterId);
      
      if (!chapter) {
        state.error = `Глава с ID ${chapterId} не найдена`;
        return;
      }
      
      if (!world.elements[elementId]) {
        state.error = `Элемент с ID ${elementId} не найден`;
        return;
      }
      
      if (isNew) {
        if (!chapter.newElements.includes(elementId)) {
          chapter.newElements.push(elementId);
        }
      } else {
        if (!chapter.modifiedElements.includes(elementId)) {
          chapter.modifiedElements.push(elementId);
        }
      }
      
      // Добавляем главу в appearances элемента, если её там ещё нет
      if (!world.elements[elementId].appearances.includes(chapterId)) {
        world.elements[elementId].appearances.push(chapterId);
        world.elements[elementId].modifiedAt = new Date();
      }
      
      chapter.modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Удаление элемента из главы
    removeElementFromChapter: (state, action: PayloadAction<{ 
      chapterId: string; 
      elementId: string;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { chapterId, elementId } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const chapter = world.chapters.find(c => c.id === chapterId);
      
      if (!chapter) {
        state.error = `Глава с ID ${chapterId} не найдена`;
        return;
      }
      
      chapter.newElements = chapter.newElements.filter(id => id !== elementId);
      chapter.modifiedElements = chapter.modifiedElements.filter(id => id !== elementId);
      
      if (world.elements[elementId]) {
        world.elements[elementId].appearances = world.elements[elementId].appearances.filter(id => id !== chapterId);
        world.elements[elementId].modifiedAt = new Date();
      }
      
      chapter.modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Добавление правила мира
    addRule: (state, action: PayloadAction<{ 
      description: string; 
      condition: string;
      severity: 'warning' | 'error';
    }>) => {
      if (!state.currentWorldId) return;
      
      const { description, condition, severity } = action.payload;
      const world = state.worlds[state.currentWorldId];
      const now = new Date();
      
      const newRule: WorldRule = {
        id: uuidv4(),
        description,
        condition,
        severity,
        active: true,
        createdAt: now,
        modifiedAt: now
      };
      
      world.rules.push(newRule);
      world.modifiedAt = now;
    },
    
    // Обновление правила
    updateRule: (state, action: PayloadAction<{ 
      id: string; 
      updates: Partial<WorldRule>;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { id, updates } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const ruleIndex = world.rules.findIndex(r => r.id === id);
      
      if (ruleIndex === -1) {
        state.error = `Правило с ID ${id} не найдено`;
        return;
      }
      
      const rule = world.rules[ruleIndex];
      
      // Обновляем только переданные поля
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt') {
          // @ts-ignore: Динамический доступ к полям
          rule[key] = updates[key];
        }
      });
      
      rule.modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Удаление правила
    deleteRule: (state, action: PayloadAction<string>) => {
      if (!state.currentWorldId) return;
      
      const ruleId = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const ruleIndex = world.rules.findIndex(r => r.id === ruleId);
      
      if (ruleIndex === -1) {
        state.error = `Правило с ID ${ruleId} не найдено`;
        return;
      }
      
      world.rules.splice(ruleIndex, 1);
      world.modifiedAt = new Date();
    },
    
    // Обновление настроек мира
    updateWorldSettings: (state, action: PayloadAction<Partial<World['settings']>>) => {
      if (!state.currentWorldId) return;
      
      const world = state.worlds[state.currentWorldId];
      
      world.settings = {
        ...world.settings,
        ...action.payload
      };
      
      world.modifiedAt = new Date();
    },
    
    // Добавление шаблона брифа
    addBriefTemplate: (state, action: PayloadAction<{ 
      name: string; 
      description: string;
      sections: BriefTemplate['sections'];
    }>) => {
      if (!state.currentWorldId) return;
      
      const { name, description, sections } = action.payload;
      const world = state.worlds[state.currentWorldId];
      const now = new Date();
      
      const newTemplate: BriefTemplate = {
        id: uuidv4(),
        name,
        description,
        sections,
        createdAt: now,
        modifiedAt: now
      };
      
      world.briefTemplates.push(newTemplate);
      world.modifiedAt = now;
    },
    
    // Обновление шаблона брифа
    updateBriefTemplate: (state, action: PayloadAction<{ 
      id: string; 
      updates: Partial<BriefTemplate>;
    }>) => {
      if (!state.currentWorldId) return;
      
      const { id, updates } = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const templateIndex = world.briefTemplates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) {
        state.error = `Шаблон брифа с ID ${id} не найден`;
        return;
      }
      
      const template = world.briefTemplates[templateIndex];
      
      // Обновляем только переданные поля
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt') {
          // @ts-ignore: Динамический доступ к полям
          template[key] = updates[key];
        }
      });
      
      template.modifiedAt = new Date();
      world.modifiedAt = new Date();
    },
    
    // Удаление шаблона брифа
    deleteBriefTemplate: (state, action: PayloadAction<string>) => {
      if (!state.currentWorldId) return;
      
      const templateId = action.payload;
      const world = state.worlds[state.currentWorldId];
      
      const templateIndex = world.briefTemplates.findIndex(t => t.id === templateId);
      
      if (templateIndex === -1) {
        state.error = `Шаблон брифа с ID ${templateId} не найден`;
        return;
      }
      
      world.briefTemplates.splice(templateIndex, 1);
      world.modifiedAt = new Date();
    },
    
    // Сброс ошибки
    clearError: (state) => {
      state.error = null;
    }
  }
});

// Экспорт действий
export const {
  createWorld,
  loadWorld,
  deleteWorld,
  updateWorldProperties,
  addElement,
  updateElement,
  deleteElement,
  addRelationship,
  deleteRelationship,
  addConflict,
  updateConflictStatus,
  createSnapshot,
  restoreFromSnapshot,
  addChapter,
  updateChapter,
  deleteChapter,
  addElementToChapter,
  removeElementFromChapter,
  addRule,
  updateRule,
  deleteRule,
  updateWorldSettings,
  addBriefTemplate,
  updateBriefTemplate,
  deleteBriefTemplate,
  clearError
} = worldSlice.actions;

// Экспорт редьюсера
export default worldSlice.reducer;
