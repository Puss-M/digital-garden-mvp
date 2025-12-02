'use client'

import React, { useState, useEffect, useRef } from 'react';
import { TeamSparkNavbar } from './components/TeamSparkNavbar';
import { TeamSparkSidebar } from './components/TeamSparkSidebar';
import { TeamSparkFeed } from './components/TeamSparkFeed';
import { TeamSparkRightPanel } from './components/TeamSparkRightPanel';
import { supabase } from '@/utils/supabase';
import { Note, SemanticMatch } from './types';

export default function Home() {
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchAlert, setMatchAlert] = useState<SemanticMatch | null>(null);
  const [userName] = useState('当前用户');
  const userNameRef = useRef(userName);

  useEffect(() => { userNameRef.current = userName; }, [userName]);

  // Fetch initial data
  useEffect(() => {
    fetchIdeas();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ideas' 
      }, (payload) => {
        if (payload.new.author !== userNameRef.current) {
          fetchIdeas();
        }
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchIdeas = async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data && !error) {
      setIdeas(data.map(i => ({
        id: i.id.toString(),
        author: i.author || '匿名',
        title: i.title || '',
        content: i.content,
        timestamp: new Date(i.created_at).toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        tags: i.tags || [],
        isLocalUser: i.author === userNameRef.current,
        isPublic: i.is_public
      })));
    }
  };

  const handlePost = async (title: string, content: string, isPublic: boolean) => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    setMatchAlert(null);

    try {
      // Generate embedding
      const res = await fetch('/api/embed', { 
        method: 'POST', 
        body: JSON.stringify({ text: content }) 
      });
      const { embedding } = await res.json();
      
      // Insert into database
      await supabase.from('ideas').insert({ 
        content, 
        title: title || null,
        author: userName, 
        embedding,
        is_public: isPublic,
        tags: []
      });
      
      // Find similar ideas
      const { data: matches } = await supabase.rpc('match_ideas', { 
        query_embedding: embedding, 
        match_threshold: 0.25, 
        match_count: 1, 
        current_author: userName 
      });

      if (matches?.length) {
        setMatchAlert({ 
          found: true, 
          targetNoteId: matches[0].id.toString(), 
          reason: `发现与 ${matches[0].author} 的想法相似` 
        });
      }
      
      // Refresh ideas
      fetchIdeas();
    } catch (e) { 
      console.error('提交失败:', e);
    } finally { 
      setIsAnalyzing(false);
    }
  };

  const getMatchedIdea = (id?: string) => ideas.find(n => n.id === id);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <TeamSparkNavbar />

      {/* Spark Alert Modal */}
      {matchAlert && matchAlert.found && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h3 className="text-xl font-bold text-gray-900">灵感碰撞！</h3>
            </div>
            
            <p className="text-gray-600 mb-6">{matchAlert.reason}</p>

            {matchAlert.targetNoteId && getMatchedIdea(matchAlert.targetNoteId) && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                    {getMatchedIdea(matchAlert.targetNoteId)?.author[0]}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {getMatchedIdea(matchAlert.targetNoteId)?.author}
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic">
                  "{getMatchedIdea(matchAlert.targetNoteId)?.content}"
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setMatchAlert(null)}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看详情
              </button>
              <button 
                onClick={() => setMatchAlert(null)}
                className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex pt-16">
        <TeamSparkSidebar />
        <TeamSparkFeed ideas={ideas} />
        <TeamSparkRightPanel 
          onPost={handlePost} 
          isAnalyzing={isAnalyzing}
        />
      </div>
    </main>
  );
}