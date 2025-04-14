/**
 * Типы для представления миров в Bible-Manager
 */
import { WorldElement } from './Element';

// Глава или раздел
export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  newElements: string[]; // ID элементов, введенных в этой главе
  modifiedElements: string[]; // ID элементов, измененных в этой главе
  createdAt: Date;
  modifiedAt: Date;
}

// Снимок состояния мира
export interface WorldSnapshot {
  id: string;
  date: Date;
  description: string;
  worldState: string; // Сериализованное состояние мира
  chapterId?: string; // ID главы, к которой привязан снимок
  tags: string[];
}

// Правило мира
export interface WorldRule {
  id: string;
  description: string;
  condition: string; // Условие, проверяемое программно
  severity: 'warning' | 'error';
  active: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

// Шаблон брифа
export interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  sections: Array<{
    title: string;
    elementTypes: string[]; // Типы элементов для включения
    maxElements: number;
    required: boolean;
  }>;
  createdAt: Date;
  modifiedAt: Date;
}

// Полное представление мира
export interface World {
  id: string;
  name: string;
  description: string;
  elements: Record<string, WorldElement>;
  chapters: Chapter[];
  snapshots: WorldSnapshot[];
  rules: WorldRule[];
  briefTemplates: BriefTemplate[];
  createdAt: Date;
  modifiedAt: Date;
  lastOpenedAt: Date;
  settings: {
    defaultCanonTier: string;
    autoSaveInterval: number;
    theme: 'light' | 'dark' | 'system';
    maxSnapshots: number;
    conflictDetectionLevel: 'strict' | 'moderate' | 'lenient';
    customElementTypes: Record<string, {
      name: string;
      icon: string;
      defaultProperties: string[];
    }>;
  };
}

// Интерфейс для создания нового мира
export interface NewWorld {
  name: string;
  description: string;
}

// Интерфейс метаданных мира для списков
export interface WorldMetadata {
  id: string;
  name: string;
  description: string;
  elementsCount: number;
  chaptersCount: number;
  createdAt: Date;
  modifiedAt: Date;
  lastOpenedAt: Date;
}