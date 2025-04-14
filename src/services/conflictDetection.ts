/**
 * Сервис для обнаружения и анализа конфликтов между элементами мира
 */
import { World, WorldElement, Conflict } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

// Интерфейс потенциального конфликта
interface PotentialConflict {
  sourceId: string;
  targetId: string;
  description: string;
  severity: 'warning' | 'error';
}

// Интерфейс сервиса обнаружения конфликтов
export interface ConflictDetectionService {
  // Анализ всего мира на конфликты
  analyzeWorld: (world: World) => PotentialConflict[];
  
  // Проверка конкретного элемента на конфликты с существующими
  checkElementForConflicts: (element: WorldElement, world: World) => PotentialConflict[];
  
  // Проверка двух элементов на конфликты между собой
  checkElementPair: (element1: WorldElement, element2: WorldElement) => PotentialConflict | null;
  
  // Применение правила проверки конфликтов
  applyRule: (rule: string, element: WorldElement, world: World) => PotentialConflict[];
}

/**
 * Реализация сервиса обнаружения конфликтов
 */
class LocalConflictDetectionService implements ConflictDetectionService {
  /**
   * Анализирует весь мир на наличие конфликтов
   */
  analyzeWorld(world: World): PotentialConflict[] {
    const conflicts: PotentialConflict[] = [];
    const elements = Object.values(world.elements);
    
    // Проверяем каждую пару элементов
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const conflict = this.checkElementPair(elements[i], elements[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }
    
    // Проверяем каждый элемент на соответствие правилам мира
    for (const element of elements) {
      for (const rule of world.rules) {
        if (rule.active) {
          try {
            const ruleConflicts = this.applyRule(rule.condition, element, world);
            for (const conflict of ruleConflicts) {
              conflict.severity = rule.severity;
              conflicts.push(conflict);
            }
          } catch (error) {
            console.error(`Ошибка при применении правила "${rule.description}":`, error);
          }
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Проверяет конкретный элемент на конфликты с существующими элементами
   */
  checkElementForConflicts(element: WorldElement, world: World): PotentialConflict[] {
    const conflicts: PotentialConflict[] = [];
    
    // Проверяем элемент с каждым существующим элементом
    for (const existingElement of Object.values(world.elements)) {
      // Пропускаем сравнение с самим собой
      if (existingElement.id === element.id) {
        continue;
      }
      
      const conflict = this.checkElementPair(element, existingElement);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
    
    // Проверяем элемент на соответствие правилам мира
    for (const rule of world.rules) {
      if (rule.active) {
        try {
          const ruleConflicts = this.applyRule(rule.condition, element, world);
          for (const conflict of ruleConflicts) {
            conflict.severity = rule.severity;
            conflicts.push(conflict);
          }
        } catch (error) {
          console.error(`Ошибка при применении правила "${rule.description}":`, error);
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Проверяет пару элементов на конфликты между собой
   */
  checkElementPair(element1: WorldElement, element2: WorldElement): PotentialConflict | null {
    // Проверка конфликтов по типам элементов
    const typeCheckers: Record<string, (e1: WorldElement, e2: WorldElement) => PotentialConflict | null> = {
      // Проверка конфликтов между персонажами
      'character-character': this.checkCharacterCharacterConflicts.bind(this),
      
      // Проверка конфликтов между персонажем и локацией
      'character-location': this.checkCharacterLocationConflicts.bind(this),
      'location-character': (e1, e2) => this.checkCharacterLocationConflicts(e2, e1),
      
      // Проверка конфликтов между персонажем и событием
      'character-event': this.checkCharacterEventConflicts.bind(this),
      'event-character': (e1, e2) => this.checkCharacterEventConflicts(e2, e1),
      
      // Проверка конфликтов между событиями
      'event-event': this.checkEventEventConflicts.bind(this),
      
      // Проверка конфликтов между технологиями
      'technology-technology': this.checkTechnologyTechnologyConflicts.bind(this)
    };
    
    // Формируем ключ для проверки
    const checkKey = `${element1.type}-${element2.type}`;
    
    // Если есть специализированная проверка для этой пары типов
    if (typeCheckers[checkKey]) {
      return typeCheckers[checkKey](element1, element2);
    }
    
    // Общая проверка на противоречивое описание
    return this.checkGenericConflicts(element1, element2);
  }
  
  /**
   * Применяет правило проверки к элементу
   */
  applyRule(rule: string, element: WorldElement, world: World): PotentialConflict[] {
    // Подготавливаем окружение для выполнения правила
    const context = {
      element,
      world,
      conflicts: [] as PotentialConflict[],
      addConflict: (targetId: string, description: string) => {
        context.conflicts.push({
          sourceId: element.id,
          targetId,
          description,
          severity: 'warning' // По умолчанию предупреждение, будет переопределено при вызове
        });
      }
    };
    
    try {
      // Создаем и выполняем функцию из строки правила
      const ruleFunc = new Function('context', `
        const { element, world, addConflict } = context;
        ${rule}
        return context.conflicts;
      `);
      
      return ruleFunc(context);
    } catch (error) {
      console.error('Ошибка при выполнении правила:', error);
      return [];
    }
  }
  
  /**
   * Проверяет общие конфликты между элементами
   */
  private checkGenericConflicts(element1: WorldElement, element2: WorldElement): PotentialConflict | null {
    // Проверка на противоречивое описание (например, по ключевым словам)
    const nameMatch = this.checkNameSimilarity(element1.name, element2.name);
    if (nameMatch > 0.8) {
      return {
        sourceId: element1.id,
        targetId: element2.id,
        description: `Элементы имеют очень похожие названия (${(nameMatch * 100).toFixed(0)}% совпадение)`,
        severity: 'warning'
      };
    }
    
    return null;
  }
  
  /**
   * Проверяет конфликты между персонажами
   */
  private checkCharacterCharacterConflicts(character1: WorldElement, character2: WorldElement): PotentialConflict | null {
    // Проверка на конфликты родственных связей
    const rel1 = character1.relationships.find(r => 
      r.targetId === character2.id && r.type.toLowerCase().includes('родитель')
    );
    
    const rel2 = character2.relationships.find(r => 
      r.targetId === character1.id && r.type.toLowerCase().includes('родитель')
    );
    
    if (rel1 && rel2) {
      return {
        sourceId: character1.id,
        targetId: character2.id,
        description: 'Циклическая родственная связь: оба персонажа указаны как родители друг друга',
        severity: 'error'
      };
    }
    
    // Проверка противоречивых отношений
    const oppositeRelations = [
      ['друг', 'враг'],
      ['союзник', 'противник'],
      ['любовь', 'ненависть']
    ];
    
    for (const [rel1Type, rel2Type] of oppositeRelations) {
      const hasRel1 = character1.relationships.some(r => 
        r.targetId === character2.id && r.type.toLowerCase().includes(rel1Type)
      );
      
      const hasRel2 = character1.relationships.some(r => 
        r.targetId === character2.id && r.type.toLowerCase().includes(rel2Type)
      );
      
      if (hasRel1 && hasRel2) {
        return {
          sourceId: character1.id,
          targetId: character2.id,
          description: `Противоречивые отношения: персонаж одновременно указан как "${rel1Type}" и "${rel2Type}"`,
          severity: 'warning'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Проверяет конфликты между персонажем и локацией
   */
  private checkCharacterLocationConflicts(character: WorldElement, location: WorldElement): PotentialConflict | null {
    // Проверка, не находился ли персонаж в несовместимых локациях одновременно
    const locationsAtSameTime: Record<string, string[]> = {};
    
    // Группируем локации по времени (например, главам)
    character.appearances.forEach(chapterId => {
      if (!locationsAtSameTime[chapterId]) {
        locationsAtSameTime[chapterId] = [];
      }
      
      character.relationships.forEach(rel => {
        if (rel.type.toLowerCase().includes('находится') || rel.type.toLowerCase().includes('посещает')) {
          locationsAtSameTime[chapterId].push(rel.targetId);
        }
      });
    });
    
    // Проверка конфликтующих локаций
    for (const [chapterId, locationIds] of Object.entries(locationsAtSameTime)) {
      if (locationIds.length > 1 && locationIds.includes(location.id)) {
        // Упрощенная проверка - в реальном приложении нужно учитывать дополнительные факторы
        return {
          sourceId: character.id,
          targetId: location.id,
          description: `Персонаж находится в нескольких локациях одновременно в главе/сцене ${chapterId}`,
          severity: 'warning'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Проверяет конфликты между персонажем и событием
   */
  private checkCharacterEventConflicts(character: WorldElement, event: WorldElement): PotentialConflict | null {
    // Проверка, не участвует ли персонаж в событиях, которые происходят одновременно в разных местах
    // Это упрощенная версия - в реальном приложении нужно учитывать даты и временные рамки
    
    if (event.properties && (event.properties as any).participants) {
      const participants = (event.properties as any).participants as string[];
      
      if (participants.includes(character.id)) {
        // Проверка, не участвует ли персонаж уже в другом событии, происходящем одновременно
        const sameTimeEvents = Object.values(character.relationships)
          .filter(rel => 
            rel.type.toLowerCase().includes('участвует') && 
            rel.targetId !== event.id
          );
        
        if (sameTimeEvents.length > 0) {
          return {
            sourceId: character.id,
            targetId: event.id,
            description: 'Персонаж участвует в нескольких событиях, которые могут происходить одновременно',
            severity: 'warning'
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Проверяет конфликты между событиями
   */
  private checkEventEventConflicts(event1: WorldElement, event2: WorldElement): PotentialConflict | null {
    // Проверка на временные конфликты между событиями
    if (event1.properties && event2.properties) {
      const date1 = (event1.properties as any).date;
      const date2 = (event2.properties as any).date;
      
      if (date1 && date2 && date1 === date2) {
        // Проверяем, не происходят ли события одновременно, но в разных местах с одними и теми же участниками
        const participants1 = (event1.properties as any).participants || [];
        const participants2 = (event2.properties as any).participants || [];
        
        // Находим общих участников
        const commonParticipants = participants1.filter((p: string) => participants2.includes(p));
        
        if (commonParticipants.length > 0) {
          return {
            sourceId: event1.id,
            targetId: event2.id,
            description: `События происходят одновременно (${date1}) с общими участниками: ${commonParticipants.join(', ')}`,
            severity: 'warning'
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Проверяет конфликты между технологиями
   */
  private checkTechnologyTechnologyConflicts(tech1: WorldElement, tech2: WorldElement): PotentialConflict | null {
    // Проверка на технологическую несовместимость или противоречия
    if (tech1.properties && tech2.properties) {
      const techLevel1 = (tech1.properties as any).techLevel;
      const techLevel2 = (tech2.properties as any).techLevel;
      
      // Проверка на анахронизмы или технологические уровни
      if (techLevel1 && techLevel2 && 
          tech1.relationships.some(r => r.targetId === tech2.id && r.type.toLowerCase().includes('зависит'))) {
        // Если технология зависит от другой, но её технологический уровень выше
        if (this.parseTechLevel(techLevel1) < this.parseTechLevel(techLevel2)) {
          return {
            sourceId: tech1.id,
            targetId: tech2.id,
            description: `Технология "${tech1.name}" (уровень ${techLevel1}) зависит от "${tech2.name}" (уровень ${techLevel2}), что создает анахронизм`,
            severity: 'warning'
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Вспомогательные функции
   */
  
  // Вычисление сходства между двумя строками (0-1)
  private checkNameSimilarity(str1: string, str2: string): number {
    // Приводим к нижнему регистру
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Используем расстояние Левенштейна
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    if (maxLength === 0) return 1.0;
    
    // Возвращаем сходство (1 - нормализованное расстояние)
    return 1.0 - distance / maxLength;
  }
  
  // Расстояние Левенштейна между строками
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    
    // Создаем матрицу
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    // Инициализация
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }
    
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }
    
    // Заполняем матрицу
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // удаление
          dp[i][j - 1] + 1,      // вставка
          dp[i - 1][j - 1] + cost // замена
        );
      }
    }
    
    return dp[m][n];
  }
  
  // Парсит технологический уровень в числовое значение
  private parseTechLevel(techLevel: string): number {
    // Пытаемся извлечь числовое значение из строки
    const match = techLevel.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    
    // Словарь для текстовых обозначений
    const techLevelMap: Record<string, number> = {
      'примитивный': 1,
      'древний': 2,
      'средневековый': 3,
      'индустриальный': 4,
      'современный': 5,
      'продвинутый': 6,
      'футуристический': 7,
      'фантастический': 8
    };
    
    // Ищем ключевые слова
    for (const [key, value] of Object.entries(techLevelMap)) {
      if (techLevel.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return 0; // По умолчанию
  }
}

// Экспорт экземпляра сервиса
export const conflictDetectionService = new LocalConflictDetectionService();
