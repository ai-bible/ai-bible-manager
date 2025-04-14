/**
 * Сервис для экспорта данных в различные форматы
 */
import { World, WorldElement, Chapter } from '../types/index';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import html2canvas from 'html2canvas';

// Интерфейс сервиса экспорта
export interface ExportService {
  // Экспорт в JSON
  exportToJson: (world: World, fileName?: string) => void;
  
  // Экспорт в Markdown
  exportToMarkdown: (world: World, fileName?: string) => void;
  
  // Экспорт в PDF
  exportToPdf: (world: World, fileName?: string) => Promise<void>;
  
  // Экспорт в Excel
  exportToExcel: (world: World, fileName?: string) => void;
  
  // Экспорт в HTML
  exportToHtml: (world: World, fileName?: string) => void;
  
  // Экспорт в TXT для ИИ
  exportToTxt: (world: World, fileName?: string) => void;
  
  // Экспорт конкретного элемента
  exportElement: (element: WorldElement, format: 'json' | 'markdown' | 'pdf' | 'txt', fileName?: string) => Promise<void>;
  
  // Генерация ситуационного брифа
  generateBrief: (world: World, elements: WorldElement[], templateName?: string) => string;
  
  // Экспорт ситуационного брифа
  exportBrief: (briefContent: string, format: 'markdown' | 'pdf' | 'txt', fileName?: string) => Promise<void>;
}

/**
 * Реализация сервиса экспорта
 */
class LocalExportService implements ExportService {
  /**
   * Экспортирует мир в JSON-файл
   */
  exportToJson(world: World, fileName?: string): void {
    try {
      const jsonString = JSON.stringify(world, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const name = fileName || `${world.name.replace(/\s+/g, '_')}.json`;
      
      saveAs(blob, name);
    } catch (error) {
      console.error('Ошибка при экспорте в JSON:', error);
      throw new Error(`Не удалось экспортировать в JSON: ${error}`);
    }
  }
  
  /**
   * Экспортирует мир в Markdown-файл
   */
  exportToMarkdown(world: World, fileName?: string): void {
    try {
      const markdown = this.generateMarkdown(world);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const name = fileName || `${world.name.replace(/\s+/g, '_')}.md`;
      
      saveAs(blob, name);
    } catch (error) {
      console.error('Ошибка при экспорте в Markdown:', error);
      throw new Error(`Не удалось экспортировать в Markdown: ${error}`);
    }
  }
  
  /**
   * Экспортирует мир в PDF-файл
   */
  async exportToPdf(world: World, fileName?: string): Promise<void> {
    try {
      // Создаем временный контейнер для рендеринга HTML-контента
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      document.body.appendChild(container);
      
      // Генерируем HTML из Markdown
      const markdown = this.generateMarkdown(world);
      container.innerHTML = marked(markdown);
      
      // Создаем PDF-документ
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Рендерим HTML в canvas и добавляем в PDF
      const canvas = await html2canvas(container, {
        scale: 1,
        useCORS: true,
        scrollX: 0,
        scrollY: 0
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 ширина в мм
      const pageHeight = 297; // A4 высота в мм
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Добавляем дополнительные страницы, если необходимо
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Удаляем временный контейнер
      document.body.removeChild(container);
      
      // Сохраняем PDF
      const name = fileName || `${world.name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(name);
    } catch (error) {
      console.error('Ошибка при экспорте в PDF:', error);
      throw new Error(`Не удалось экспортировать в PDF: ${error}`);
    }
  }
  
  /**
   * Экспортирует мир в Excel-файл
   */
  exportToExcel(world: World, fileName?: string): void {
    try {
      // Создаем рабочую книгу
      const wb = XLSX.utils.book_new();
      
      // Создаем общую информацию
      const generalInfoSheet = XLSX.utils.json_to_sheet([{
        Name: world.name,
        Description: world.description,
        'Created At': new Date(world.createdAt).toLocaleString(),
        'Last Modified': new Date(world.modifiedAt).toLocaleString(),
        'Elements Count': Object.keys(world.elements).length,
        'Chapters Count': world.chapters.length
      }]);
      XLSX.utils.book_append_sheet(wb, generalInfoSheet, 'General Info');
      
      // Создаем листы для каждого типа элементов
      const elementTypes = Array.from(
        new Set(Object.values(world.elements).map(el => el.type))
      );
      
      elementTypes.forEach(type => {
        const elements = Object.values(world.elements)
          .filter(el => el.type === type)
          .map(el => ({
            Name: el.name,
            Description: el.description,
            'Canon Tier': el.canonTier,
            Tags: el.tags.join(', '),
            'Relationships Count': el.relationships.length,
            'Appearances Count': el.appearances.length,
            'Created At': new Date(el.createdAt).toLocaleString(),
            'Last Modified': new Date(el.modifiedAt).toLocaleString()
          }));
        
        if (elements.length > 0) {
          const sheet = XLSX.utils.json_to_sheet(elements);
          XLSX.utils.book_append_sheet(wb, sheet, this.capitalizeFirstLetter(type));
        }
      });
      
      // Создаем лист с главами
      if (world.chapters.length > 0) {
        const chaptersSheet = XLSX.utils.json_to_sheet(
          world.chapters.map(ch => ({
            Title: ch.title,
            Description: ch.description || '',
            Order: ch.order,
            'New Elements': ch.newElements.length,
            'Modified Elements': ch.modifiedElements.length,
            'Created At': new Date(ch.createdAt).toLocaleString(),
            'Last Modified': new Date(ch.modifiedAt).toLocaleString()
          }))
        );
        XLSX.utils.book_append_sheet(wb, chaptersSheet, 'Chapters');
      }
      
      // Создаем лист с правилами
      if (world.rules.length > 0) {
        const rulesSheet = XLSX.utils.json_to_sheet(
          world.rules.map(rule => ({
            Description: rule.description,
            Condition: rule.condition,
            Severity: rule.severity,
            Active: rule.active ? 'Yes' : 'No',
            'Created At': new Date(rule.createdAt).toLocaleString(),
            'Last Modified': new Date(rule.modifiedAt).toLocaleString()
          }))
        );
        XLSX.utils.book_append_sheet(wb, rulesSheet, 'Rules');
      }
      
      // Сохраняем Excel-файл
      const name = fileName || `${world.name.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, name);
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error);
      throw new Error(`Не удалось экспортировать в Excel: ${error}`);
    }
  }
  
  /**
   * Экспортирует мир в HTML-файл
   */
  exportToHtml(world: World, fileName?: string): void {
    try {
      // Генерируем Markdown и конвертируем в HTML
      const markdown = this.generateMarkdown(world);
      const htmlContent = marked(markdown);
      
      // Создаем полный HTML-документ
      const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${world.name} - Библия мира</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3, h4 {
              color: #444;
              margin-top: 1.5em;
            }
            h1 { border-bottom: 2px solid #444; padding-bottom: 10px; }
            h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .element-card {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
              background-color: #fff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .tag {
              display: inline-block;
              background-color: #eee;
              padding: 2px 8px;
              border-radius: 12px;
              margin-right: 5px;
              font-size: 0.9em;
            }
            .canon-tier {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              margin-right: 5px;
              font-size: 0.9em;
              color: white;
            }
            .primary { background-color: #4CAF50; }
            .secondary { background-color: #2196F3; }
            .speculative { background-color: #FF9800; }
            .non-canon { background-color: #F44336; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <footer>
            <p><em>Сгенерировано с помощью Bible-Manager ${new Date().toLocaleString()}</em></p>
          </footer>
        </body>
        </html>
      `;
      
      // Сохраняем HTML-файл
      const blob = new Blob([html], { type: 'text/html' });
      const name = fileName || `${world.name.replace(/\s+/g, '_')}.html`;
      
      saveAs(blob, name);
    } catch (error) {
      console.error('Ошибка при экспорте в HTML:', error);
      throw new Error(`Не удалось экспортировать в HTML: ${error}`);
    }
  }
  
  /**
   * Экспортирует мир в TXT-файл для ИИ
   */
  exportToTxt(world: World, fileName?: string): void {
    try {
      // Генерируем упрощенный текст для ИИ
      const txt = this.generateTxtForAI(world);
      
      // Сохраняем TXT-файл
      const blob = new Blob([txt], { type: 'text/plain' });
      const name = fileName || `${world.name.replace(/\s+/g, '_')}_for_ai.txt`;
      
      saveAs(blob, name);
    } catch (error) {
      console.error('Ошибка при экспорте в TXT:', error);
      throw new Error(`Не удалось экспортировать в TXT: ${error}`);
    }
  }
  
  /**
   * Экспортирует отдельный элемент в выбранный формат
   */
  async exportElement(
    element: WorldElement, 
    format: 'json' | 'markdown' | 'pdf' | 'txt', 
    fileName?: string
  ): Promise<void> {
    try {
      const name = fileName || `${element.name.replace(/\s+/g, '_')}`;
      
      switch (format) {
        case 'json':
          const jsonString = JSON.stringify(element, null, 2);
          const jsonBlob = new Blob([jsonString], { type: 'application/json' });
          saveAs(jsonBlob, `${name}.json`);
          break;
          
        case 'markdown':
          const markdown = this.generateElementMarkdown(element);
          const mdBlob = new Blob([markdown], { type: 'text/markdown' });
          saveAs(mdBlob, `${name}.md`);
          break;
          
        case 'pdf':
          // Создаем временный контейнер для рендеринга HTML-контента
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.width = '800px';
          document.body.appendChild(container);
          
          // Генерируем HTML из Markdown
          const elementMarkdown = this.generateElementMarkdown(element);
          container.innerHTML = marked(elementMarkdown);
          
          // Создаем PDF-документ
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // Рендерим HTML в canvas и добавляем в PDF
          const canvas = await html2canvas(container, {
            scale: 1,
            useCORS: true,
            scrollX: 0,
            scrollY: 0
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 ширина в мм
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          
          // Удаляем временный контейнер
          document.body.removeChild(container);
          
          // Сохраняем PDF
          pdf.save(`${name}.pdf`);
          break;
          
        case 'txt':
          const txt = this.generateElementTxt(element);
          const txtBlob = new Blob([txt], { type: 'text/plain' });
          saveAs(txtBlob, `${name}.txt`);
          break;
          
        default:
          throw new Error(`Неподдерживаемый формат: ${format}`);
      }
    } catch (error) {
      console.error(`Ошибка при экспорте элемента в ${format}:`, error);
      throw new Error(`Не удалось экспортировать элемент в ${format}: ${error}`);
    }
  }
  
  /**
   * Генерирует ситуационный бриф на основе выбранных элементов
   */
  generateBrief(world: World, elements: WorldElement[], templateName?: string): string {
    // Заголовок брифа
    let brief = `# Ситуационный бриф: ${templateName || 'Пользовательский бриф'}\n\n`;
    brief += `_Мир: ${world.name}_\n\n`;
    brief += `_Дата создания: ${new Date().toLocaleString()}_\n\n`;
    
    // Если элементы не выбраны
    if (elements.length === 0) {
      brief += `_Элементы не выбраны_\n\n`;
      return brief;
    }
    
    // Группируем элементы по типу
    const elementsByType: Record<string, WorldElement[]> = {};
    
    elements.forEach(element => {
      if (!elementsByType[element.type]) {
        elementsByType[element.type] = [];
      }
      elementsByType[element.type].push(element);
    });
    
    // Добавляем разделы для каждого типа элементов
    Object.entries(elementsByType).forEach(([type, typeElements]) => {
      brief += `## ${this.getTypeDisplayName(type)}\n\n`;
      
      typeElements.forEach(element => {
        brief += `### ${element.name}\n\n`;
        brief += `${element.description}\n\n`;
        
        // Добавляем основные свойства
        if (Object.keys(element.properties).length > 0) {
          brief += `**Ключевые характеристики:**\n\n`;
          
          Object.entries(element.properties).forEach(([key, value]) => {
            if (value) {
              if (Array.isArray(value)) {
                brief += `- **${this.formatPropertyName(key)}:** ${value.join(', ')}\n`;
              } else {
                brief += `- **${this.formatPropertyName(key)}:** ${value}\n`;
              }
            }
          });
          
          brief += `\n`;
        }
        
        // Добавляем связи, если они есть
        if (element.relationships.length > 0) {
          brief += `**Связи:**\n\n`;
          
          element.relationships.forEach(rel => {
            const targetElement = world.elements[rel.targetId];
            if (targetElement) {
              brief += `- **${rel.type}:** ${targetElement.name}\n`;
              if (rel.description) {
                brief += `  ${rel.description}\n`;
              }
            }
          });
          
          brief += `\n`;
        }
      });
    });
    
    return brief;
  }
  
  /**
   * Экспортирует ситуационный бриф в выбранный формат
   */
  async exportBrief(
    briefContent: string, 
    format: 'markdown' | 'pdf' | 'txt', 
    fileName?: string
  ): Promise<void> {
    try {
      const name = fileName || `brief_${new Date().toISOString().replace(/[:.]/g, '-')}`;
      
      switch (format) {
        case 'markdown':
          const mdBlob = new Blob([briefContent], { type: 'text/markdown' });
          saveAs(mdBlob, `${name}.md`);
          break;
          
        case 'pdf':
          // Создаем временный контейнер для рендеринга HTML-контента
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.width = '800px';
          document.body.appendChild(container);
          
          // Генерируем HTML из Markdown
          container.innerHTML = marked(briefContent);
          
          // Создаем PDF-документ
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // Рендерим HTML в canvas и добавляем в PDF
          const canvas = await html2canvas(container, {
            scale: 1,
            useCORS: true,
            scrollX: 0,
            scrollY: 0
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 ширина в мм
          const pageHeight = 297; // A4 высота в мм
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          // Добавляем дополнительные страницы, если необходимо
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          // Удаляем временный контейнер
          document.body.removeChild(container);
          
          // Сохраняем PDF
          pdf.save(`${name}.pdf`);
          break;
          
        case 'txt':
          // Для TXT просто удаляем Markdown-разметку
          const txtContent = briefContent
            .replace(/^#+\s+/gm, '') // Заголовки
            .replace(/\*\*(.*?)\*\*/g, '$1') // Жирный текст
            .replace(/_(.*?)_/g, '$1') // Курсив
            .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Ссылки
          
          const txtBlob = new Blob([txtContent], { type: 'text/plain' });
          saveAs(txtBlob, `${name}.txt`);
          break;
          
        default:
          throw new Error(`Неподдерживаемый формат: ${format}`);
      }
    } catch (error) {
      console.error(`Ошибка при экспорте брифа в ${format}:`, error);
      throw new Error(`Не удалось экспортировать бриф в ${format}: ${error}`);
    }
  }
  
  /**
   * Генерирует Markdown-представление мира
   */
  private generateMarkdown(world: World): string {
    let markdown = `# Библия мира "${world.name}"\n\n`;
    
    // Описание мира
    markdown += `## Описание\n\n${world.description}\n\n`;
    
    // Статистика
    markdown += `## Общая информация\n\n`;
    markdown += `- **Название:** ${world.name}\n`;
    markdown += `- **Количество элементов:** ${Object.keys(world.elements).length}\n`;
    markdown += `- **Количество глав:** ${world.chapters.length}\n`;
    markdown += `- **Дата создания:** ${new Date(world.createdAt).toLocaleString()}\n`;
    markdown += `- **Последнее изменение:** ${new Date(world.modifiedAt).toLocaleString()}\n\n`;
    
    // Группируем элементы по типу
    const elementsByType: Record<string, WorldElement[]> = {};
    
    Object.values(world.elements).forEach(element => {
      if (!elementsByType[element.type]) {
        elementsByType[element.type] = [];
      }
      elementsByType[element.type].push(element);
    });
    
    // Добавляем разделы для каждого типа элементов
    Object.entries(elementsByType).forEach(([type, elements]) => {
      markdown += `## ${this.getTypeDisplayName(type)}\n\n`;
      
      // Создаем таблицу для элементов этого типа
      markdown += `| Название | Описание | Канон | Теги |\n`;
      markdown += `|----------|----------|-------|------|\n`;
      
      elements.forEach(element => {
        markdown += `| [${element.name}](#${this.slugify(element.name)}) | ${this.truncateText(element.description)} | ${this.getCanonTierDisplayName(element.canonTier)} | ${element.tags.join(', ')} |\n`;
      });
      
      markdown += `\n`;
    });
    
    // Подробное описание элементов
    markdown += `## Подробное описание элементов\n\n`;
    
    Object.values(world.elements).forEach(element => {
      markdown += this.generateElementMarkdown(element, true);
    });
    
    // Главы
    if (world.chapters.length > 0) {
      markdown += `## Главы\n\n`;
      markdown += `| Название | Описание | Порядок | Новые элементы | Измененные элементы |\n`;
      markdown += `|----------|----------|---------|----------------|--------------------|\n`;
      
      world.chapters.sort((a, b) => a.order - b.order).forEach(chapter => {
        markdown += `| ${chapter.title} | ${this.truncateText(chapter.description || '')} | ${chapter.order} | ${chapter.newElements.length} | ${chapter.modifiedElements.length} |\n`;
      });
      
      markdown += `\n`;
    }
    
    // Правила мира
    if (world.rules.length > 0) {
      markdown += `## Правила мира\n\n`;
      markdown += `| Описание | Условие | Серьезность | Активно |\n`;
      markdown += `|----------|---------|------------|--------|\n`;
      
      world.rules.forEach(rule => {
        markdown += `| ${rule.description} | ${this.truncateText(rule.condition)} | ${rule.severity === 'error' ? 'Ошибка' : 'Предупреждение'} | ${rule.active ? 'Да' : 'Нет'} |\n`;
      });
      
      markdown += `\n`;
    }
    
    return markdown;
  }
  
  /**
   * Генерирует Markdown-представление элемента
   */
  private generateElementMarkdown(element: WorldElement, includeAnchor: boolean = false): string {
    let markdown = '';
    
    // Якорь для ссылок
    if (includeAnchor) {
      markdown += `<a id="${this.slugify(element.name)}"></a>\n\n`;
    }
    
    // Заголовок элемента
    markdown += `### ${element.name}\n\n`;
    
    // Мета-информация
    markdown += `**Тип:** ${this.getTypeDisplayName(element.type)}  \n`;
    markdown += `**Канон:** ${this.getCanonTierDisplayName(element.canonTier)}  \n`;
    
    if (element.tags.length > 0) {
      markdown += `**Теги:** ${element.tags.join(', ')}  \n`;
    }
    
    markdown += `\n`;
    
    // Основное описание
    markdown += `${element.description}\n\n`;
    
    // Специфичные свойства
    if (Object.keys(element.properties).length > 0) {
      markdown += `#### Характеристики\n\n`;
      
      Object.entries(element.properties).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            markdown += `- **${this.formatPropertyName(key)}:** ${value.join(', ')}\n`;
          } else {
            markdown += `- **${this.formatPropertyName(key)}:** ${value}\n`;
          }
        }
      });
      
      markdown += `\n`;
    }
    
    // Отношения
    if (element.relationships.length > 0) {
      markdown += `#### Связи\n\n`;
      
      element.relationships.forEach(rel => {
        markdown += `- **${rel.type}:** ${rel.targetId}\n`;
        if (rel.description) {
          markdown += `  ${rel.description}\n`;
        }
      });
      
      markdown += `\n`;
    }
    
    // Главы, в которых упоминается
    if (element.appearances.length > 0) {
      markdown += `#### Упоминания в главах\n\n`;
      markdown += `- ${element.appearances.join('\n- ')}\n\n`;
    }
    
    // Заметки
    if (element.notes) {
      markdown += `#### Заметки\n\n${element.notes}\n\n`;
    }
    
    // Конфликты
    if (element.conflicts.length > 0) {
      markdown += `#### Конфликты\n\n`;
      
      element.conflicts.forEach(conflict => {
        markdown += `- **С элементом:** ${conflict.withElementId}\n`;
        markdown += `  **Описание:** ${conflict.description}\n`;
        markdown += `  **Статус:** ${this.getConflictStatusDisplayName(conflict.status)}\n`;
        
        if (conflict.resolution) {
          markdown += `  **Решение:** ${conflict.resolution}\n`;
        }
        
        markdown += `\n`;
      });
    }
    
    markdown += `---\n\n`;
    
    return markdown;
  }
  
  /**
   * Генерирует текстовое представление элемента для ИИ
   */
  private generateElementTxt(element: WorldElement): string {
    let txt = `Элемент: ${element.name}\n`;
    txt += `Тип: ${this.getTypeDisplayName(element.type)}\n`;
    txt += `Канон: ${this.getCanonTierDisplayName(element.canonTier)}\n`;
    
    if (element.tags.length > 0) {
      txt += `Теги: ${element.tags.join(', ')}\n`;
    }
    
    txt += `\nОписание:\n${element.description}\n\n`;
    
    // Специфичные свойства
    if (Object.keys(element.properties).length > 0) {
      txt += `Характеристики:\n`;
      
      Object.entries(element.properties).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            txt += `- ${this.formatPropertyName(key)}: ${value.join(', ')}\n`;
          } else {
            txt += `- ${this.formatPropertyName(key)}: ${value}\n`;
          }
        }
      });
      
      txt += `\n`;
    }
    
    // Отношения
    if (element.relationships.length > 0) {
      txt += `Связи:\n`;
      
      element.relationships.forEach(rel => {
        txt += `- ${rel.type}: ${rel.targetId}\n`;
        if (rel.description) {
          txt += `  ${rel.description}\n`;
        }
      });
      
      txt += `\n`;
    }
    
    // Заметки
    if (element.notes) {
      txt += `Заметки:\n${element.notes}\n\n`;
    }
    
    return txt;
  }
  
  /**
   * Генерирует упрощенный текст для ИИ
   */
  private generateTxtForAI(world: World): string {
    let txt = `БИБЛИЯ МИРА: ${world.name}\n\n`;
    txt += `ОПИСАНИЕ МИРА:\n${world.description}\n\n`;
    
    // Группируем элементы по типу
    const elementsByType: Record<string, WorldElement[]> = {};
    
    Object.values(world.elements).forEach(element => {
      if (!elementsByType[element.type]) {
        elementsByType[element.type] = [];
      }
      elementsByType[element.type].push(element);
    });
    
    // Добавляем разделы для каждого типа элементов
    Object.entries(elementsByType).forEach(([type, elements]) => {
      txt += `==== ${this.getTypeDisplayName(type).toUpperCase()} ====\n\n`;
      
      elements.forEach(element => {
        txt += `### ${element.name} ###\n`;
        txt += `Описание: ${element.description}\n`;
        txt += `Канон: ${this.getCanonTierDisplayName(element.canonTier)}\n`;
        
        if (element.tags.length > 0) {
          txt += `Теги: ${element.tags.join(', ')}\n`;
        }
        
        // Специфичные свойства
        if (Object.keys(element.properties).length > 0) {
          txt += `Характеристики:\n`;
          
          Object.entries(element.properties).forEach(([key, value]) => {
            if (value) {
              if (Array.isArray(value)) {
                txt += `- ${this.formatPropertyName(key)}: ${value.join(', ')}\n`;
              } else {
                txt += `- ${this.formatPropertyName(key)}: ${value}\n`;
              }
            }
          });
        }
        
        // Отношения
        if (element.relationships.length > 0) {
          txt += `Связи:\n`;
          
          element.relationships.forEach(rel => {
            txt += `- ${rel.type}: ${rel.targetId}\n`;
            if (rel.description) {
              txt += `  ${rel.description}\n`;
            }
          });
        }
        
        txt += `\n`;
      });
    });
    
    // Добавляем правила мира
    if (world.rules.length > 0) {
      txt += `==== ПРАВИЛА МИРА ====\n\n`;
      
      world.rules.forEach(rule => {
        txt += `- ${rule.description}\n`;
      });
      
      txt += `\n`;
    }
    
    return txt;
  }
  
  /**
   * Вспомогательные функции
   */
  
  // Получение отображаемого имени типа элемента
  private getTypeDisplayName(type: string): string {
    const displayNames: Record<string, string> = {
      'character': 'Персонаж',
      'technology': 'Технология',
      'location': 'Локация',
      'event': 'Событие',
      'concept': 'Концепция',
      'social': 'Социальная структура',
      'rule': 'Правило мира'
    };
    
    return displayNames[type] || this.capitalizeFirstLetter(type);
  }
  
  // Получение отображаемого имени уровня канона
  private getCanonTierDisplayName(tier: string): string {
    const displayNames: Record<string, string> = {
      'primary': 'Первичный канон',
      'secondary': 'Вторичный канон',
      'speculative': 'Предположение',
      'non-canon': 'Неканон'
    };
    
    return displayNames[tier] || this.capitalizeFirstLetter(tier);
  }
  
  // Получение отображаемого имени статуса конфликта
  private getConflictStatusDisplayName(status: string): string {
    const displayNames: Record<string, string> = {
      'unresolved': 'Не разрешен',
      'resolved': 'Разрешен',
      'ignored': 'Игнорируется'
    };
    
    return displayNames[status] || this.capitalizeFirstLetter(status);
  }
  
  // Форматирование имени свойства
  private formatPropertyName(name: string): string {
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase в слова
      .replace(/^./, str => str.toUpperCase()); // Первая буква заглавная
  }
  
  // Создание slug из строки
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Удаление специальных символов
      .replace(/\s+/g, '-') // Замена пробелов на дефисы
      .replace(/--+/g, '-'); // Удаление повторяющихся дефисов
  }
  
  // Усечение текста до заданной длины
  private truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + '...';
  }
  
  // Первая буква заглавная
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// Экспорт экземпляра сервиса
export const exportService = new LocalExportService();
