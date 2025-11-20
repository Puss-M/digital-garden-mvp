'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';

interface Idea {
  id: number;
  content: string;
  created_at: string;
  author?: string;
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [authorName, setAuthorName] = useState('匿名同学');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ideas on component mount
  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ideas:', error);
      } else {
        setIdeas(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;

    // 1. Optimistic Update
    const tempId = Date.now();
    const tempIdea: Idea = {
      id: tempId,
      content: content,
      created_at: new Date().toISOString(),
      author: authorName,
    };

    setIdeas((prev) => [...prev, tempIdea]);
    setInputValue('');

    try {
      // 2. Background Processing
      // Generate embedding
      const embeddingResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!embeddingResponse.ok) {
        throw new Error('Failed to generate embedding');
      }

      const { embedding } = await embeddingResponse.json();

      // Save to Supabase with embedding and author
      const { error } = await supabase
        .from('ideas')
        .insert({ 
          content: content,
          embedding: embedding,
          author: authorName
        });

      if (error) throw error;

      // Success: Refresh list silently to get real ID
      fetchIdeas(false);
    } catch (error) {
      console.error('Error in background process:', error);
      // 3. Error Rollback
      setIdeas((prev) => prev.filter((idea) => idea.id !== tempId));
      alert('发送失败，请重试');
      setInputValue(content); // Restore input
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight mb-10">Digital Garden</h1>
        
        <nav className="flex-1 space-y-4">
          <Link href="/">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 font-medium">
              My Ideas
            </button>
          </Link>
          <Link href="/graph">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-gray-400">
              Knowledge Graph
            </button>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500"></div>
            <span className="font-medium">{authorName || 'User'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Chat/Content Area */}
        <div className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-3xl mx-auto space-y-6">
            {isLoading ? (
              <div className="text-center text-gray-500 mt-20">Loading...</div>
            ) : ideas.length === 0 ? (
              <div className="text-center text-gray-400 mt-20 text-lg">
                这里将显示你的知识图谱
              </div>
            ) : (
              ideas.map((idea) => (
                <div 
                  key={idea.id} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">
                      {idea.author || '匿名同学'}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(idea.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{idea.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10 pb-8 px-8">
          <div className="max-w-3xl mx-auto relative flex gap-3">
            {/* Author Input */}
            <div className="w-32 flex-shrink-0">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="你的名字"
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm text-center font-medium text-gray-600 placeholder-gray-400"
              />
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your idea..."
                className="w-full pl-6 pr-32 py-4 bg-white border border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg placeholder-gray-400"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-gray-900 text-white rounded-full font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}