import React, { useState, useEffect, useRef } from 'react';
import { Note, SemanticMatch } from '../types';
import { NoteCard } from '../components/NoteCard';
import { Button } from '../components/Button';
import { ClusterView } from './ClusterView';
import { supabase } from '@/utils/supabase';

export const PrototypeDemo: React.FC = () => {
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchAlert, setMatchAlert] = useState<SemanticMatch | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [userName, setUserName] = useState('研究员');
  const userNameRef = useRef(userName);

  useEffect(() => { userNameRef.current = userName; }, [userName]);
  const notesEndRef = useRef<HTMLDivElement>(null);

  // 1. 初始化：拉取数据
  useEffect(() => {
    fetchRealNotes();

    const channel = supabase
      .channel('realtime ideas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
        const newIdea = payload.new;
        // 如果是别人发的，立刻显示出来
        if (newIdea.author !== userNameRef.current) {
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
    // 增加错误日志，方便排查
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
        console.error('🔥 致命错误：无法拉取数据！', error);
        alert("无法连接数据库，请检查网络或联系管理员！错误信息：" + error.message);
        return;
    }

    if (data) {
      const formattedNotes: Note[] = data.map(idea => ({
        id: idea.id.toString(),
        author: idea.author || '匿名',
        content: idea.content,
        timestamp: new Date(idea.created_at).toLocaleString(),
        tags: ['数据库'],
        isLocalUser: idea.author === userNameRef.current || idea.author === '我'
      }));
      setLocalNotes(formattedNotes);
    }
  };

  // 🔴 核心修复：发送逻辑重写
  const handlePost = async () => {
    if (!inputText.trim()) return;
    if (!userName.trim()) { alert("请先填写您的名字"); return; }

    const content = inputText;
    const currentAuthor = userName;
    
    // 1. 乐观更新（UI 先显示）
    const tempNote: Note = {
      id: Date.now().toString(),
      author: currentAuthor,
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
        // 2. 🔥【关键修改】先存文字！先存文字！先存文字！
        // 哪怕 embedding 是 null，先把话传出去，保证别人能看到。
        const { data: insertedData, error: insertError } = await supabase
            .from('ideas')
            .insert({
                content: content,
                author: currentAuthor, 
                embedding: null // 先留空，后面再补
            })
            .select()
            .single();

        if (insertError) {
            throw new Error("数据库写入失败: " + insertError.message);
        }

        console.log("✅ 文字已保存，ID:", insertedData.id);

        // 3. 后台异步补全向量 (如果这步挂了，不影响文字显示)
        try {
            const embedRes = await fetch('/api/embed', {
                method: 'POST',
                body: JSON.stringify({ text: content })
            });
            
            if (embedRes.ok) {
                const { embedding } = await embedRes.json();
                
                // 补录向量
                await supabase.from('ideas').update({ embedding }).eq('id', insertedData.id);
                
                // 触发碰撞检测
                const { data: matches } = await supabase.rpc('match_ideas', {
                    query_embedding: embedding,
                    match_threshold: 0.1, 
                    match_count: 1,
                    current_author: currentAuthor
                });

                if (matches && matches.length > 0) {
                    setMatchAlert({
                        found: true,
                        targetNoteId: matches[0].id.toString(),
                        reason: `语义相似度: ${(matches[0].similarity * 100).toFixed(0)}%`
                    });
                }
            } else {
                console.warn("⚠️ AI服务繁忙，本条消息暂无向量数据");
            }
        } catch (aiError) {
            console.error("AI生成失败，但这不影响消息发送:", aiError);
        }

    } catch (err: any) {
        console.error("❌ 发送彻底失败:", err);
        alert("发送失败！请截图发给管理员: " + err.message);
        // 回滚：把刚才乐观更新的那条删掉 (简单处理：重新拉取列表)
        fetchRealNotes();
    } finally {
        setIsAnalyzing(false);
    }
  };

  const getMatchedNote = (id?: string) => localNotes.find(n => n.id === id);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4 max-w-7xl mx-auto">
      
      {/* 左侧：实验室动态 */}
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

      {/* 右侧：我的工作区 */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 order-1 lg:order-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
        
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
        
        {viewMode === 'list' ? (
            <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl z-10 shrink-0">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <span className="text-xs text-slate-400">当前身份:</span>
                    <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-emerald-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-emerald-500 w-32 transition-colors"
                    />
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`以 ${userName} 的身份记录想法...`}
                    className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none min-h-[60px]"
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

                {matchAlert && matchAlert.found && (
                  <div className="animate-[slideIn_0.5s_ease-out] mx-auto w-full mt-4 shrink-0">
                    <div className="bg-indigo-900/80 border border-indigo-500/50 p-4 rounded-lg shadow-2xl shadow-indigo-500/20 backdrop-blur-sm relative overflow-hidden">
                      <div className="flex items-start gap-4 p-3">
                        <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-300">✨</div>
                        <div className="flex-1">
                          <h4 className="text-indigo-100 font-bold text-sm">检测到语义共鸣！</h4>
                          <p className="text-indigo-200/80 text-xs mt-1">{matchAlert.reason}</p>
                          {matchAlert.targetNoteId && getMatchedNote(matchAlert.targetNoteId) && (
                            <div className="mt-2 bg-slate-900/50 p-2 rounded border border-indigo-500/30">
                               <p className="text-xs text-slate-300 italic">"{getMatchedNote(matchAlert.targetNoteId)?.content}"</p>
                               <p className="text-[10px] text-slate-500 mt-1 text-right">— {getMatchedNote(matchAlert.targetNoteId)?.author}</p>
                            </div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <Button variant="secondary" className="text-[10px] py-0.5 h-6" onClick={() => setMatchAlert(null)}>忽略</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-4 pt-4 scroll-smooth min-h-0">
                  {localNotes.length === 0 && (
                    <div className="text-center text-slate-600 mt-10">
                      <p>暂无数据，快来抢沙发！</p>
                    </div>
                  )}
                  {localNotes.map((note, idx) => (
                    <NoteCard key={note.id} note={note} isNew={idx === 0} />
                  ))}
                  <div ref={notesEndRef} />
                </div>
            </div>
        ) : (
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