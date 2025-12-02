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

  // 1. 初始化：从数据库拉取
  useEffect(() => {
    fetchRealNotes();

    const channel = supabase
      .channel('realtime ideas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
        const newIdea = payload.new;
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
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) { console.error('获取失败:', error); return; }

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

  // 🔥 真实的种子数据注入 (模拟其他同学已经发过的内容)
  const seedDatabase = async () => {
    const confirm = window.confirm("要注入真实向量数据吗？这会花费几秒钟调用 AI 生成向量。");
    if (!confirm) return;

    setIsAnalyzing(true);
    
    // 这里准备了不同领域的数据，用来测试“真实的语义匹配”
    // 注意：这里没有所谓的关键词，完全靠句子意思
    const seeds = [
        { author: "干饭人", content: "学校南门的隆江猪脚饭太好吃了，肥而不腻，建议大家去尝尝。" }, // 测试生活类匹配
        { author: "陈博士", content: "Transformer 的计算复杂度随着序列长度呈二次方增长，这限制了长文本的处理能力。" }, // 测试学术类匹配
        { author: "金融系", content: "最近股市波动很大，我在尝试用时间序列模型预测下周的趋势。" }, // 测试金融类
        { author: "生物狗", content: "基因测序产生的数据量太大了，传统的聚类算法跑不动。" },
        { author: "李华", content: "今晚有人去打篮球吗？我在体育馆占了场子。" } 
    ];

    for (const seed of seeds) {
        try {
            // 1. 调用 AI 生成真实的 Embedding
            const res = await fetch('/api/embed', {
                method: 'POST',
                body: JSON.stringify({ text: seed.content })
            });
            const { embedding } = await res.json();

            // 2. 存入数据库
            await supabase.from('ideas').insert({
                content: seed.content,
                author: seed.author,
                embedding: embedding
            });
        } catch (e) {
            console.error("注入失败", e);
        }
    }

    setIsAnalyzing(false);
    fetchRealNotes(); 
    alert("✅ 真实数据注入完成！现在数据库里有了包含【猪脚饭、Transformer、篮球】的向量数据。");
  };

  const handlePost = async () => {
    if (!inputText.trim()) return;
    if (!userName.trim()) { alert("请先填写您的名字"); return; }

    const content = inputText;
    const currentAuthor = userName;
    
    // 乐观更新
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
        // 1. 生成向量 (Real AI)
        const embedRes = await fetch('/api/embed', {
            method: 'POST',
            body: JSON.stringify({ text: content })
        });
        
        if (!embedRes.ok) throw new Error("向量生成失败");
        const { embedding } = await embedRes.json();

        // 2. 存入数据库
        const { error } = await supabase.from('ideas').insert({
            content: content,
            author: currentAuthor, 
            embedding: embedding
        });

        if (error) throw error;

        // 3. 真实碰撞检测 (No Cheating!)
        // 阈值说明：0.25 是一个经验值。
        // "饿了" 和 "猪脚饭" 的相似度大约在 0.3 左右。
        // "Transformer" 和 "注意力机制" 大约在 0.5 左右。
        const { data: matches } = await supabase.rpc('match_ideas', {
            query_embedding: embedding,
            match_threshold: 0.25, 
            match_count: 1,
            current_author: currentAuthor 
        });

        // 4. 只有 AI 真的算出来了，才弹窗
        if (matches && matches.length > 0) {
            setMatchAlert({
                found: true,
                targetNoteId: matches[0].id.toString(),
                reason: `语义相似度: ${(matches[0].similarity * 100).toFixed(0)}% - AI 发现潜在关联`
            });
        } 
        // 注意：这里没有 else 分支了！如果没有匹配到，就是真的没有，绝不瞎编。

    } catch (err) {
        console.error("发送流程出错:", err);
    } finally {
        setIsAnalyzing(false);
        fetchRealNotes(); 
    }
  };


const getMatchedNote = (id?: string) => localNotes.find(n => n.id === id);
// 删除笔记处理函数
const handleDelete = async (id: string) => {
  if (!window.confirm('确定要删除这条笔记吗？')) return;
  // 1. 乐观更新：立即从UI移除
  const noteToDelete = localNotes.find(n => n.id === id);
  setLocalNotes(prev => prev.filter(n => n.id !== id));
  try {
    // 2. 调用 Supabase 删除
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);
    if (error) throw error;
    console.log('✅ 笔记已删除:', id);
  } catch (err) {
    console.error('删除失败:', err);
    alert('删除失败，请重试');
    
    // 3. 删除失败时回滚状态
    if (noteToDelete) {
      setLocalNotes(prev => [noteToDelete, ...prev]);
    }
  }
};
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4 max-w-7xl mx-auto">
      
      <div className="w-full lg:w-1/3 flex flex-col gap-4 order-2 lg:order-1 opacity-75">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            实时研究动态
          </div>
          <button onClick={seedDatabase} className="text-[10px] bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 text-slate-500 hover:text-emerald-400 transition-colors">
            ⚡️ 注入真实数据
          </button>
        </h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {localNotes.map(note => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-4 order-1 lg:order-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
        
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">人工智能语义分析</h2>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>💬 列表视图</button>
                <button onClick={() => setViewMode('graph')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'graph' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>🌌 聚类星图</button>
            </div>
        </div>
        
        {viewMode === 'list' ? (
            <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl z-10 shrink-0">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
                    <span className="text-xs text-slate-400">当前身份:</span>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-slate-900 border border-slate-600 text-emerald-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-emerald-500 w-32 transition-colors" />
                  </div>
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={`以 ${userName} 的身份记录想法...`} className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none min-h-[60px]" onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost(); }} />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                    <span className="text-xs text-slate-500 hidden sm:block">Cmd/Ctrl + Enter 发送</span>
                    <Button onClick={handlePost} isLoading={isAnalyzing} disabled={!inputText.trim()}>便签入库</Button>
                  </div>
                </div>

                {matchAlert && matchAlert.found && (
                  <div className="animate-[slideIn_0.5s_ease-out] mx-auto w-full mt-4 shrink-0">
                    <div className="bg-indigo-900/80 border border-indigo-500/50 p-4 rounded-lg shadow-2xl shadow-indigo-500/20 backdrop-blur-sm relative overflow-hidden">
                      <div className="flex items-start gap-4 p-3">
                        <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-300">✨</div>
                        <div className="flex-1">
                          <h4 className="text-indigo-100 font-bold text-sm">检测到真·语义共鸣！</h4>
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
                  {localNotes.map((note, idx) => (<NoteCard key={note.id} note={note} isNew={idx === 0} onDelete={handleDelete} />))}
                  <div ref={notesEndRef} />
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950/30"><ClusterView /></div>
            </div>
        )}
      </div>
    </div>
  );
};