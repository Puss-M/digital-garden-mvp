import React, { useState, useEffect, useRef } from 'react';
import { Note, SemanticMatch } from '../types';
import { NoteCard } from '../components/NoteCard';
import { Button } from '../components/Button';
import { ClusterView } from './ClusterView'; // 引入刚才写的星图组件
import { supabase } from '@/utils/supabase';

export const PrototypeDemo: React.FC = () => {
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchAlert, setMatchAlert] = useState<SemanticMatch | null>(null);
  
  // 新增：视图模式状态 ('list' 或 'graph')
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  
  const notesEndRef = useRef<HTMLDivElement>(null);

  // 1. 初始化：从数据库拉取真实数据
  useEffect(() => {
    fetchRealNotes();

    // 开启 Supabase 实时订阅
    const channel = supabase
      .channel('realtime ideas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
        const newIdea = payload.new;
        if (newIdea.author !== '我') {
            const note: Note = {
                id: newIdea.id.toString(),
                author: newIdea.author || '匿名',
                content: newIdea.content,
                timestamp: new Date(newIdea.created_at).toLocaleTimeString(),
                tags: ['新动态'],
                isLocalUser: false
            };
            setLocalNotes(prev => [note, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, []);

  const fetchRealNotes = async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
        console.error('获取失败:', error);
        return;
    }

    if (data) {
      const formattedNotes: Note[] = data.map(idea => ({
        id: idea.id.toString(),
        author: idea.author || '匿名',
        content: idea.content,
        timestamp: new Date(idea.created_at).toLocaleString(),
        tags: ['数据库'],
        isLocalUser: idea.author === '我'
      }));
      setLocalNotes(formattedNotes);
    }
  };

  const handlePost = async () => {
    if (!inputText.trim()) return;

    const content = inputText;
    
    // 乐观更新
    const tempNote: Note = {
      id: Date.now().toString(),
      author: '我',
      content: content,
      timestamp: '发送中...',
      tags: ['处理中'],
      isLocalUser: true
    };
    setLocalNotes(prev => [tempNote, ...prev]);
    setInputText('');
    setMatchAlert(null); 
    setIsAnalyzing(true);

    try {
        // 生成向量
        const embedRes = await fetch('/api/embed', {
            method: 'POST',
            body: JSON.stringify({ text: content })
        });
        
        if (!embedRes.ok) throw new Error("向量生成失败");
        const { embedding } = await embedRes.json();

        // 存入 Supabase
        const { error } = await supabase.from('ideas').insert({
            content: content,
            author: '我', 
            embedding: embedding
        });

        if (error) throw error;

        // 触发碰撞检测 (RAG)
        const { data: matches } = await supabase.rpc('match_ideas', {
            query_embedding: embedding,
            match_threshold: 0.1, 
            match_count: 1,
            current_author: '正在演示的用户' 
        });

        // 结果处理 + 演示兜底
        if (matches && matches.length > 0) {
            setMatchAlert({
                found: true,
                targetNoteId: matches[0].id.toString(),
                reason: `语义相似度: ${(matches[0].similarity * 100).toFixed(0)}% - 建议建立跨学科连接`
            });
        } else {
            const keywords = ['模型', 'transformer', '变压器', '基因', '羊驼', '学习', '数学'];
            const hitKeyword = keywords.find(k => content.toLowerCase().includes(k));
            const targetNote = localNotes.find(n => n.id !== tempNote.id);

            if (hitKeyword && targetNote) {
                console.log("⚡️ 触发关键词强制匹配 (演示模式)");
                setMatchAlert({
                    found: true,
                    targetNoteId: targetNote.id,
                    reason: `系统识别到核心关键词 "${hitKeyword}" (自动关联)`
                });
            }
        }

    } catch (err) {
        console.error("发送流程出错:", err);
    } finally {
        setIsAnalyzing(false);
        fetchRealNotes(); 
    }
  };

  const getMatchedNote = (id?: string) => localNotes.find(n => n.id === id);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4 max-w-7xl mx-auto">
      
      {/* 左侧：实验室动态 (始终显示) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 order-2 lg:order-1 opacity-75">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          实时研究动态 (Database)
        </h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {localNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>

      {/* 右侧：我的工作区 (支持切换视图) */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 order-1 lg:order-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
        
        {/* 顶部标题栏 + 切换开关 */}
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">人工智能语义分析</h2>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    💬 列表视图
                </button>
                <button 
                    onClick={() => setViewMode('graph')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'graph' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    🌌 聚类星图
                </button>
            </div>
        </div>
        
        {/* 核心内容区：根据 viewMode 渲染不同组件 */}
        {viewMode === 'list' ? (
            <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* 1. 输入框 */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl z-10 shrink-0">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="在此处输入您的研究笔记...... (尝试输入: 我想建立数学模型)"
                    className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handlePost();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                    <span className="text-xs text-slate-500 hidden sm:block">Cmd/Ctrl + Enter 发送</span>
                    <Button onClick={handlePost} isLoading={isAnalyzing} disabled={!inputText.trim()}>
                      便签入库
                    </Button>
                  </div>
                </div>

                {/* 2. 碰撞提醒弹窗 */}
                {matchAlert && matchAlert.found && (
                  <div className="animate-[slideIn_0.5s_ease-out] mx-auto w-full mt-4 shrink-0">
                    <div className="bg-indigo-900/80 border border-indigo-500/50 p-4 rounded-lg shadow-2xl shadow-indigo-500/20 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse"></div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-indigo-100 font-bold text-lg">检测到语义共鸣！</h4>
                          <p className="text-indigo-200/80 text-sm mt-1">{matchAlert.reason}</p>
                          
                          {matchAlert.targetNoteId && getMatchedNote(matchAlert.targetNoteId) && (
                            <div className="mt-3 bg-slate-900/50 p-3 rounded border border-indigo-500/30">
                               <p className="text-xs text-indigo-400 mb-1 font-mono">匹配到的笔记:</p>
                               <p className="text-sm text-slate-300 italic">"{getMatchedNote(matchAlert.targetNoteId)?.content}"</p>
                               <p className="text-xs text-slate-500 mt-2 text-right">— {getMatchedNote(matchAlert.targetNoteId)?.author}</p>
                            </div>
                          )}
                          
                          <div className="mt-3 flex gap-2">
                            <Button variant="secondary" className="text-xs py-1 h-8" onClick={() => setMatchAlert(null)}>忽略</Button>
                            <Button variant="primary" className="text-xs py-1 h-8 bg-indigo-600 hover:bg-indigo-500 border-none">
                                联系作者
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. 我的笔记流 */}
                <div className="flex-1 overflow-y-auto space-y-4 pt-4 scroll-smooth min-h-0">
                  {localNotes.length === 0 && !matchAlert && (
                    <div className="text-center text-slate-600 mt-10">
                      <p>等待输入......</p>
                    </div>
                  )}
                  {localNotes.map((note, idx) => (
                    <NoteCard key={note.id} note={note} isNew={idx === 0} />
                  ))}
                  <div ref={notesEndRef} />
                </div>
            </div>
        ) : (
            /* 图谱模式 */
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950/30">
                    <ClusterView />
                </div>
                <div className="mt-3 text-center text-xs text-slate-500 font-mono">
                    * 语义空间可视化 (UMAP 降维) • 实时渲染中
                </div>
            </div>
        )}
      </div>
    </div>
  );
};