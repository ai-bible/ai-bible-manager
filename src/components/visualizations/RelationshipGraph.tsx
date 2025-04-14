/**
 * Компонент визуализации графа связей между элементами
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import 'aframe';
import { ForceGraph2D } from 'react-force-graph';
import { useAppSelector } from '../../store/hooks';
import { WorldElement } from '../../types/Element';

interface ForceGraphMethods {
  zoomToFit: (duration: number, padding?: number) => void;
}
interface RelationshipGraphProps {
  centerElementId?: string;
  depth?: number;
  height?: number;
  width?: string;
  showLabels?: boolean;
}

// Интерфейс узла графа
interface GraphNode {
  id: string;
  name: string;
  type: string;
  canonTier: string;
  val: number; // Размер узла
}

// Интерфейс связи графа
interface GraphLink {
  source: string;
  target: string;
  type: string;
  description?: string;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  centerElementId,
  depth = 1,
  height = 400,
  width = '100%',
  showLabels = true
}) => {
  const navigate = useNavigate();
  const graphRef = useRef<ForceGraphMethods>();
  const currentWorldId = useAppSelector((state) => state.world.currentWorldId);
  const allElements = useAppSelector((state) => 
    currentWorldId ? state.world.worlds[currentWorldId].elements : {}
  );
  
  // Состояние графа
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  
  // Построение графа
  useEffect(() => {
    if (!currentWorldId) return;
    
    setLoading(true);
    
    // Вспомогательная функция для добавления элемента в граф
    const addElementToGraph = (
      element: WorldElement, 
      currentDepth: number,
      processedElements: Set<string>,
      nodes: GraphNode[],
      links: GraphLink[]
    ) => {
      // Пропускаем, если элемент уже обработан
      if (processedElements.has(element.id)) return;
      
      // Добавляем элемент как узел
      nodes.push({
        id: element.id,
        name: element.name,
        type: element.type,
        canonTier: element.canonTier,
        val: currentDepth === 0 ? 20 : 10 / currentDepth // Размер узла уменьшается с глубиной
      });
      
      processedElements.add(element.id);
      
      // Если достигли максимальной глубины, останавливаемся
      if (currentDepth >= depth) return;
      
      // Добавляем связи к другим элементам
      element.relationships.forEach(relationship => {
        const targetElement = allElements[relationship.targetId];
        if (!targetElement) return;
        
        // Добавляем связь
        links.push({
          source: element.id,
          target: targetElement.id,
          type: relationship.type,
          description: relationship.description
        });
        
        // Рекурсивно добавляем целевой элемент
        addElementToGraph(targetElement, currentDepth + 1, processedElements, nodes, links);
      });
      
      // Также добавляем элементы, которые ссылаются на текущий
      if (centerElementId === element.id) {
        Object.values(allElements).forEach(otherElement => {
          if (otherElement.id === element.id) return;
          
          otherElement.relationships.forEach(relationship => {
            if (relationship.targetId === element.id) {
              // Добавляем связь (в обратном направлении)
              links.push({
                source: otherElement.id,
                target: element.id,
                type: relationship.type,
                description: relationship.description
              });
              
              // Рекурсивно добавляем источник
              addElementToGraph(otherElement, currentDepth + 1, processedElements, nodes, links);
            }
          });
        });
      }
    };
    
    // Собираем данные для графа
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const processedElements = new Set<string>();
    
    if (centerElementId) {
      // Если указан центральный элемент, строим граф вокруг него
      const centerElement = allElements[centerElementId];
      if (centerElement) {
        addElementToGraph(centerElement, 0, processedElements, nodes, links);
      }
    } else {
      // Иначе добавляем все элементы и их связи
      Object.values(allElements).forEach(element => {
        if (!processedElements.has(element.id)) {
          addElementToGraph(element, 0, processedElements, nodes, links);
        }
      });
    }
    
    // Обновляем данные графа
    setGraphData({ nodes, links });
    setLoading(false);
  }, [currentWorldId, allElements, centerElementId, depth]);
  
  // Обработчик клика по узлу
  const handleNodeClick = (node: GraphNode) => {
    navigate(`/elements/${node.id}`);
  };
  
  // Цвета для разных типов элементов
  const getNodeColor = (node: GraphNode) => {
    const typeColors: Record<string, string> = {
      'character': '#e91e63', // Розовый
      'technology': '#00bcd4', // Голубой
      'location': '#4caf50', // Зеленый
      'event': '#ff9800', // Оранжевый
      'concept': '#9c27b0', // Фиолетовый
      'social': '#3f51b5', // Индиго
      'rule': '#607d8b' // Серый
    };
    
    return typeColors[node.type] || '#f44336'; // Красный по умолчанию
  };
  
  // Цвета для уровней канона
  const getLinkColor = (link: GraphLink) => {
    const typeColors: Record<string, string> = {
      'Родитель': '#e91e63',
      'Ребенок': '#e91e63',
      'Супруг(а)': '#e91e63',
      'Друг': '#4caf50',
      'Союзник': '#4caf50',
      'Враг': '#f44336',
      'Находится в': '#00bcd4',
      'Содержит': '#00bcd4',
      'Создатель': '#ff9800',
      'Создано с помощью': '#ff9800',
      'Участвует в': '#9c27b0',
      'Происходит в': '#9c27b0',
      'Связан с': '#607d8b'
    };
    
    return typeColors[link.type] || '#aaaaaa'; // Серый по умолчанию
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (graphData.nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body2" color="text.secondary">
          Нет данных для отображения
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width, height, position: 'relative' }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeColor={getNodeColor}
        linkColor={getLinkColor}
        nodeRelSize={6}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={0.7}
        linkCurvature={0.25}
        linkWidth={1.5}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const { x, y, name, val } = node as GraphNode & { x?: number, y?: number };
          if (x === undefined || y === undefined) return;
          
          // Рисуем узел (круг)
          ctx.beginPath();
          ctx.arc(x, y, val, 0, 2 * Math.PI);
          ctx.fillStyle = getNodeColor(node as GraphNode);
          ctx.fill();
          
          // Рисуем имя, если нужно
          if (showLabels && globalScale >= 0.8) {
            const label = name || '';
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, x, y);
          }
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 40);
          }
        }}
      />
    </Box>
  );
};

export default RelationshipGraph;
