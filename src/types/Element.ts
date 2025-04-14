/**
 * Типы элементов для Bible-Manager
 */

// Типы элементов мира
export type ElementType = 'character' | 'technology' | 'location' | 'event' | 'concept' | 'social' | 'rule';

// Уровни каноничности
export type CanonTier = 'primary' | 'secondary' | 'speculative' | 'non-canon';

// Статус конфликта
export type ConflictStatus = 'unresolved' | 'resolved' | 'ignored';

// Связь между элементами
export interface Relationship {
  targetId: string;
  type: string;
  description: string;
}

// Конфликт между элементами
export interface Conflict {
  id: string;
  withElementId: string;
  description: string;
  status: ConflictStatus;
  resolution?: string;
  detectedAt: Date;
  resolvedAt?: Date;
}

// Свойства персонажа
export interface CharacterProperties {
  age?: number;
  gender?: string;
  occupation?: string;
  origin?: string;
  abilities?: string[];
  goals?: string[];
  personality?: string;
  appearance?: string;
}

// Свойства технологии
export interface TechnologyProperties {
  inventor?: string;
  creationDate?: string;
  techLevel?: string;
  materials?: string[];
  limitations?: string[];
  applications?: string[];
}

// Свойства локации
export interface LocationProperties {
  coordinates?: string;
  climate?: string;
  population?: number;
  governmentType?: string;
  keyFeatures?: string[];
  history?: string;
}

// Свойства события
export interface EventProperties {
  date?: string;
  duration?: string;
  participants?: string[];
  causes?: string[];
  consequences?: string[];
  significance?: string;
}

// Свойства концепции
export interface ConceptProperties {
  domain?: string;
  originators?: string[];
  development?: string;
  applications?: string[];
  implications?: string[];
}

// Свойства социальной структуры
export interface SocialProperties {
  hierarchy?: string[];
  roles?: string[];
  interactions?: string[];
  evolution?: string;
  significance?: string;
}

// Свойства правила мира
export interface RuleProperties {
  scope?: string;
  exceptions?: string[];
  implications?: string[];
  enforcement?: string;
}

// Объединение всех возможных свойств
export type ElementProperties = 
  CharacterProperties | 
  TechnologyProperties | 
  LocationProperties | 
  EventProperties | 
  ConceptProperties |
  SocialProperties |
  RuleProperties;

// Основной интерфейс элемента мира
export interface WorldElement {
  id: string;
  type: ElementType;
  name: string;
  description: string;
  properties: Record<string, any>; // Специфичные для типа свойства
  canonTier: CanonTier;
  appearances: string[]; // Главы/сцены, где элемент упоминается
  relationships: Relationship[];
  createdAt: Date;
  modifiedAt: Date;
  version: number;
  tags: string[];
  notes: string;
  conflicts: Conflict[];
  imageUrl?: string;
}

// Интерфейс для создания нового элемента
export interface NewWorldElement {
  type: ElementType;
  name: string;
  description: string;
  properties?: Record<string, any>;
  canonTier: CanonTier;
  appearances?: string[];
  tags?: string[];
  notes?: string;
  imageUrl?: string;
}