'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../utils/supabase';
import Link from 'next/link';

interface Idea {
  id: number;
  content: string;
  created_at: string;
  embedding: number[] | string;
}

interface Node {
  id: number;
  content: string;
  x: number;
  y: number;
}

export default function GraphPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    // Initial update
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./umap.worker.ts', import.meta.url));
    workerRef.current.onmessage = (e) => {
      const { nodes: processedNodes, error } = e.data;
      if (error) {
        console.error(error);
      } else {
        setNodes(processedNodes);
      }
      setIsLoading(false);
    };

    fetchAndProcessIdeas();

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const fetchAndProcessIdeas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ideas:', error);
        setIsLoading(false);
        return;
      }

      const ideasWithEmbeddings = (data || []).reduce((acc: any[], idea: Idea) => {
        let embedding = idea.embedding;
        if (typeof embedding === 'string') {
          try {
            embedding = JSON.parse(embedding);
          } catch (e) {
            console.error('Failed to parse embedding for idea', idea.id, e);
            return acc;
          }
        }

        if (Array.isArray(embedding) && embedding.length > 0) {
          acc.push({ ...idea, embedding });
        }
        return acc;
      }, []);

      if (ideasWithEmbeddings.length < 3) {
        console.warn('Not enough data for UMAP (min 3 required).');
        setNodes([]);
        setIsLoading(false);
        return;
      }

      workerRef.current?.postMessage({
        embeddings: ideasWithEmbeddings.map((idea: Idea) => idea.embedding),
        ideas: ideasWithEmbeddings
      });

    } catch (error) {
      console.error('Error processing ideas:', error);
      setIsLoading(false);
    }
  };

  // Pre-calculate positions and connections
  const { positionedNodes, connections } = useMemo(() => {
    if (!nodes.length) return { positionedNodes: [], connections: [] };

    const pNodes = nodes.map(node => ({
      ...node,
      cx: node.x * dimensions.width * 0.9 + dimensions.width * 0.05,
      cy: node.y * dimensions.height * 0.9 + dimensions.height * 0.05,
    }));

    const conns = [];
    for (let i = 0; i < pNodes.length; i++) {
      for (let j = i + 1; j < pNodes.length; j++) {
        const a = pNodes[i];
        const b = pNodes[j];
        const dx = a.cx - b.cx;
        const dy = a.cy - b.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          conns.push({
            id: `${a.id}-${b.id}`,
            x1: a.cx,
            y1: a.cy,
            x2: b.cx,
            y2: b.cy,
            opacity: 1 - dist / 150,
            width: Math.max(0.5, 2 * (1 - dist / 150))
          });
        }
      }
    }
    return { positionedNodes: pNodes, connections: conns };
  }, [nodes, dimensions]);

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 text-white flex flex-col p-6 shadow-lg z-10">
        <h1 className="text-2xl font-bold tracking-tight mb-10">Digital Garden</h1>
        
        <nav className="flex-1 space-y-4">
          <Link href="/">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-gray-400">
              My Ideas
            </button>
          </Link>
          <Link href="/graph">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 font-medium">
              Knowledge Graph
            </button>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500"></div>
            <span className="font-medium">User</span>
          </div>
        </div>
      </aside>

      {/* Graph Canvas */}
      <main className="flex-1 relative overflow-hidden bg-gray-900" ref={containerRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-400 text-xl animate-pulse">Calculating graph layout...</div>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-xl">
              Not enough data to generate graph (need at least 3 ideas).
            </div>
          </div>
        ) : (
          <svg className="w-full h-full">
            {/* Connections */}
            {connections.map(conn => (
              <line
                key={conn.id}
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="rgba(156, 163, 175, 0.5)"
                strokeWidth={conn.width}
                strokeOpacity={conn.opacity}
              />
            ))}

            {/* Nodes */}
            {positionedNodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={hoveredNode === node.id ? 12 : 6}
                  fill={hoveredNode === node.id ? '#22d3ee' : '#06b6d4'}
                  fillOpacity={0.8}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    filter: hoveredNode === node.id 
                      ? 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))' 
                      : 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.3))'
                  }}
                />
              </g>
            ))}

            {/* Tooltip */}
            {hoveredNode !== null && (() => {
              const node = positionedNodes.find(n => n.id === hoveredNode);
              if (!node) return null;
              const textWidth = Math.min(300, node.content.length * 8 + 20);
              const textHeight = 40;
              
              // Ensure tooltip stays within bounds (basic logic)
              let tx = node.cx + 15;
              let ty = node.cy - 20;
              if (tx + textWidth > dimensions.width) tx = node.cx - textWidth - 15;
              if (ty < 0) ty = node.cy + 20;

              return (
                <g className="pointer-events-none">
                  <rect
                    x={tx}
                    y={ty}
                    width={textWidth}
                    height={textHeight}
                    rx={6}
                    fill="rgba(17, 24, 39, 0.95)"
                    stroke="#22d3ee"
                    strokeWidth={1}
                  />
                  <text
                    x={tx + 10}
                    y={ty + textHeight / 2}
                    fill="#e5e7eb"
                    fontSize={14}
                    dominantBaseline="middle"
                  >
                    {node.content.length > 35 ? node.content.substring(0, 35) + '...' : node.content}
                  </text>
                </g>
              );
            })()}
          </svg>
        )}
      </main>
    </div>
  );
}
