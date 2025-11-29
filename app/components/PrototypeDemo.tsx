import React, { useState, useEffect, useRef } from 'react';
import { Note, SemanticMatch } from '../types';
import { NoteCard } from '../components/NoteCard';
import { Button } from '../components/Button';
import { checkSemanticSimilarity } from '../services/geminiService';

// 中文 Mock 数据
const MOCK_DB_NOTES: Note[] = [
  {
    id: 'n1', author: '陈博士 (CV组)', 
    content: 'Transformer 中的注意力机制可以通过使用稀疏矩阵进行优化，从而将计算复杂度从 O(n^2) 降低到 O(n log n)。',
    timestamp: '10 分钟前', tags: ['变压器', '优化', 'CV'], isLocalUser: false
  },
  {
    id: 'n2', author: '亚历克斯 (NLP组)', 
    content: '探索 Llama 3 模型的量化技术。4 位量化似乎能在保持 95% 性能的同时，将内存占用减半。',
    timestamp: '2 小时前', tags: ['羊驼', '量化', 'DevOps'], isLocalUser: false
  },
  {
    id: 'n3', author: '查理 (机器人)', 
    content: '机械臂逆运动学求解器在奇点附近总是失败，正在尝试新的阻尼最小二乘法。',
    timestamp: '昨天', tags: ['机器人', '数学', '控制'], isLocalUser: false
  },
  {
    id: 'n4', author: '戴安娜 (生物信息)', 
    content: '利用对比学习对基因序列进行聚类。结果看起来很有希望，但训练过程不太稳定。',
    timestamp: '昨天', tags: ['聚类', '对比学习', '生物'], isLocalUser: false
  }
];

export const PrototypeDemo: React.FC = () => {
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchAlert, setMatchAlert] = useState<SemanticMatch | null>(null);
  
  const notesEndRef = useRef<HTMLDivElement>(null);

  const handlePost = async () => {
    if (!inputText.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      author: '我',
      content: inputText,
      timestamp: '刚刚',
      tags: ['新想法'],
      isLocalUser: true
    };

    // 1. 乐观更新 UI
    setLocalNotes(prev => [newNote, ...prev]);
    setInputText('');
    setMatchAlert(null); 

    // 2. 模拟后台分析
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 800)); // 模拟网络延迟

    // 3. 模拟语义匹配
    const matchResult = await checkSemanticSimilarity(newNote.content, MOCK_DB_NOTES);
    
    setIsAnalyzing(false);
    if (matchResult.found) {
      setMatchAlert(matchResult);
    }
  };

  const getMatchedNote = (id?: string) => MOCK_DB_NOTES.find(n => n.id === id);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4 max-w-7xl mx-auto">
      
      {/* 左侧：实验室动态 */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 order-2 lg:order-1 opacity-75">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          实时研究动态
        </h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {MOCK_DB_NOTES.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>

      {/* 右侧：我的工作区 */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 order-1 lg:order-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
        
        <h2 className="text-xl font-bold text-white mb-2">人工智能语义分析</h2>
        
        {/* 输入框 */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl z-10">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此处输入您的研究笔记...... (尝试使用关键词: 变形金刚、羊驼、基因)"
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

        {/* 核心功能：碰撞提醒弹窗 */}
        {matchAlert && matchAlert.found && (
          <div className="animate-[slideIn_0.5s_ease-out] mx-auto w-full">
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
                  <p className="text-indigo-200/80 text-sm mt-1">{matchAlert.reason === "Detected shared research context based on keywords." ? "系统识别到关键词重合，建议建立跨学科连接。" : matchAlert.reason}</p>
                  
                  {matchAlert.targetNoteId && (
                    <div className="mt-3 bg-slate-900/50 p-3 rounded border border-indigo-500/30">
                       <p className="text-xs text-indigo-400 mb-1 font-mono">匹配到的笔记:</p>
                       <p className="text-sm text-slate-300 italic">"{getMatchedNote(matchAlert.targetNoteId)?.content}"</p>
                       <p className="text-xs text-slate-500 mt-2 text-right">— {getMatchedNote(matchAlert.targetNoteId)?.author}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" className="text-xs py-1 h-8">忽略</Button>
                    <Button variant="primary" className="text-xs py-1 h-8 bg-indigo-600 hover:bg-indigo-500 border-none">联系 {getMatchedNote(matchAlert.targetNoteId)?.author.split(' ')[0]}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 我的笔记流 */}
        <div className="flex-1 overflow-y-auto space-y-4 pt-4 scroll-smooth">
          {localNotes.length === 0 && !matchAlert && (
            <div className="text-center text-slate-600 mt-10">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              <p>等待输入......</p>
              <p className="text-sm mt-2">尝试输入: <span className="text-emerald-500">"变压器中的注意力机制"</span></p>
            </div>
          )}
          {localNotes.map((note, idx) => (
            <NoteCard key={note.id} note={note} isNew={idx === 0} />
          ))}
          <div ref={notesEndRef} />
        </div>
      </div>
    </div>
  );
};