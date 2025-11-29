import React, { useEffect, useState, useRef } from 'react';
import { UMAP } from 'umap-js';
import { supabase } from '@/utils/supabase';
import { Note } from '../types';

export const ClusterView: React.FC = () => {
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 600
      });
    }
  }, []);

  useEffect(() => {
    async function calculateGraph() {
      // 1. 拉取数据
      const { data } = await supabase.from('ideas').select('*').limit(100);
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // 2. 清洗数据 (处理 embedding 格式)
      const validData = data
        .filter(item => item.embedding)
        .map(item => ({
          ...item,
          embedding: typeof item.embedding === 'string' ? JSON.parse(item.embedding) : item.embedding
        }));

      if (validData.length < 3) {
        // 数据太少不计算，直接随机撒点显示（为了不留白）
        setPoints(validData.map(d => ({
            id: d.id, x: Math.random() * dimensions.width, y: Math.random() * dimensions.height, content: d.content, author: d.author
        })));
        setLoading(false);
        return;
      }

      // 3. UMAP 计算 (运行在主线程，数据量小没问题)
      // 关键参数：nNeighbors 设小一点，防止数据少时报错
      const umap = new UMAP({ 
        nNeighbors: Math.min(5, validData.length - 1), 
        minDist: 0.1, 
        spread: 1.0 
      });
      
      const embeddings = validData.map(d => d.embedding);
      const layout = umap.fit(embeddings);

      // 4. 坐标映射
      const xValues = layout.map((p: number[]) => p[0]);
      const yValues = layout.map((p: number[]) => p[1]);
      const minX = Math.min(...xValues), maxX = Math.max(...xValues);
      const minY = Math.min(...yValues), maxY = Math.max(...yValues);

      const newPoints = validData.map((item, i) => ({
        id: item.id,
        content: item.content,
        author: item.author || '匿名',
        x: ((layout[i][0] - minX) / (maxX - minX)) * (dimensions.width * 0.8) + (dimensions.width * 0.1),
        y: ((layout[i][1] - minY) / (maxY - minY)) * (dimensions.height * 0.8) + (dimensions.height * 0.1),
      }));

      setPoints(newPoints);
      setLoading(false);
    }

    calculateGraph();
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-[600px] bg-slate-900/50 rounded-2xl border border-slate-800 relative overflow-hidden group">
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-emerald-500 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-xs">正在构建语义星图...</span>
          </div>
        </div>
      )}

      {/* 简单的连线层 (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        {points.map((p1, i) => points.map((p2, j) => {
            if (i >= j) return null; // 不重复画
            const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            if (dist > 200) return null; // 距离太远不连线
            return (
                <line key={`${p1.id}-${p2.id}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#10b981" strokeWidth={Math.max(0.5, (200-dist)/200 * 2)} />
            )
        }))}
      </svg>

      {/* 节点层 */}
      {points.map(point => (
        <div
          key={point.id}
          className="absolute w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer hover:scale-125 hover:bg-white transition-all z-10"
          style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)' }}
        >
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-800/90 text-slate-200 text-xs rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none z-50 min-w-[120px]">
            <p className="font-bold text-emerald-400 mb-1">{point.author}</p>
            <p className="opacity-90">{point.content.length > 20 ? point.content.substring(0, 20) + '...' : point.content}</p>
          </div>
        </div>
      ))}
      
      {!loading && points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
           暂无数据，快去发一条想法吧！
        </div>
      )}
    </div>
  );
};