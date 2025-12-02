import React, { useState, useEffect, useRef } from 'react';
import { Note, SemanticMatch } from '../types';
import { NoteCard } from '../components/NoteCard';
import { InputArea } from '../components/InputArea';
import { Navbar } from '../components/Navbar';
import { supabase } from '@/utils/supabase';
import { Search, Plus, Users, Sparkles, X, Grid, List } from 'lucide-react';

export const PrototypeDemo: React.FC = () => {
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchAlert, setMatchAlert] = useState<SemanticMatch | null>(null);
  const [userName, setUserName] = useState('研究员');
  const userNameRef = useRef(userName);

  useEffect(() => { userNameRef.current = userName; }, [userName]);

  // Fetch initial data
  useEffect(() => {
    fetchRealNotes();
    const channel = supabase.channel('realtime').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
        if (payload.new.author !== userNameRef.current) fetchRealNotes();
    }).subscribe();
    return () => { supabase.removeChannel(channel); }
  }, []);

  const fetchRealNotes = async () => {
    const { data } = await supabase.from('ideas').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setLocalNotes(data.map(i => ({
        id: i.id.toString(),
        author: i.author || '匿名',
        title: i.title,
        content: i.content,
        timestamp: new Date(i.created_at).toLocaleString(),
        tags: i.tags || [],
        isLocalUser: i.author === userNameRef.current,
        isPublic: i.is_public
    })));
  };

  const handlePost = async (title: string, content: string, isPublic: boolean) => {
    const currentAuthor = userName;
    const tempId = Date.now().toString();
    setLocalNotes(p => [{ 
        id: tempId, 
        author: currentAuthor, 
        title, 
        content, 
        timestamp: 'Just now', 
        tags: [], 
        isLocalUser: true,
        isPublic 
    }, ...p]);
    
    setIsAnalyzing(true);
    setMatchAlert(null);

    try {
        const res = await fetch('/api/embed', { method: 'POST', body: JSON.stringify({ text: content }) });
        const { embedding } = await res.json();
        
        await supabase.from('ideas').insert({ 
            content, 
            title: title || null,
            author: currentAuthor, 
            embedding,
            is_public: isPublic,
            tags: []
        });
        
        const { data: matches } = await supabase.rpc('match_ideas', { 
            query_embedding: embedding, 
            match_threshold: 0.25, 
            match_count: 1, 
            current_author: currentAuthor 
        });

        if (matches?.length) {
            setMatchAlert({ 
                found: true, 
                targetNoteId: matches[0].id.toString(), 
                reason: `Found similar idea from ${matches[0].author}` 
            });
        }
    } catch (e) { 
        console.error(e);
    } finally { 
        setIsAnalyzing(false); 
        fetchRealNotes();
    }
  };

  const getMatchedNote = (id?: string) => localNotes.find(n => n.id === id);

  return (
    <div className="h-screen overflow-hidden bg-gray-100 text-[#1A1A1B] font-sans flex">
      {/* Spark Alert Modal */}
      {matchAlert && matchAlert.found && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-purple-100">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4 text-purple-600">
                        <div className="p-3 bg-purple-100 rounded-2xl">
                            <Sparkles className="w-8 h-8 fill-purple-600" />
                        </div>
                        <h3 className="text-3xl font-bold">Spark Alert!</h3>
                    </div>
                    <button onClick={() => setMatchAlert(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-7 h-7" />
                    </button>
                </div>
                
                <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                    {matchAlert.reason}
                </p>

                {matchAlert.targetNoteId && getMatchedNote(matchAlert.targetNoteId) && (
                    <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 mb-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-sm font-bold text-purple-700">
                                {getMatchedNote(matchAlert.targetNoteId)?.author[0]}
                            </div>
                            <div className="text-base font-bold text-purple-900">
                                u/{getMatchedNote(matchAlert.targetNoteId)?.author}
                            </div>
                        </div>
                        <div className="text-lg text-gray-800 italic leading-relaxed">
                            "{getMatchedNote(matchAlert.targetNoteId)?.content}"
                        </div>
                    </div>
                )}

                <div className="flex gap-5">
                    <button onClick={() => setMatchAlert(null)} className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg">
                        Connect & Discuss
                    </button>
                    <button onClick={() => setMatchAlert(null)} className="px-8 py-4 text-gray-500 font-bold text-lg hover:bg-gray-100 rounded-xl transition-colors">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Left Sidebar (w-1/4, min-300px) */}
      <div className="w-1/4 min-w-[300px] bg-slate-50 border-r border-gray-300 flex flex-col flex-shrink-0">
          <div className="py-10 px-8">
              <h1 className="font-serif text-4xl font-black text-gray-900 tracking-tight">Swift Ideas</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10">
              {/* Navigation */}
              <div className="space-y-6">
                  <button className="w-full flex items-center gap-5 px-6 py-4 text-2xl font-medium text-black bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all">
                      <Sparkles className="w-7 h-7 text-purple-600" />
                      Popular Ideas
                  </button>
                  <button className="w-full flex items-center gap-5 px-6 py-4 text-2xl font-medium text-gray-800 hover:text-black hover:bg-white hover:shadow-sm rounded-xl transition-all">
                      <Users className="w-7 h-7" />
                      My Groups
                  </button>
              </div>

              {/* Groups List */}
              <div>
                  <div className="flex items-center justify-between mb-6 px-2">
                      <span className="text-lg font-bold text-gray-500 uppercase tracking-wider">My Groups</span>
                      <button className="text-gray-500 hover:text-black p-2 hover:bg-gray-200 rounded-lg"><Plus className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-4">
                      {['Product Design', 'Engineering', 'Marketing', 'Random'].map((group, i) => (
                          <button key={i} className="w-full flex items-center gap-4 px-6 py-4 text-xl text-gray-800 hover:text-black hover:bg-white hover:shadow-sm rounded-xl transition-all group">
                              <span className="w-4 h-4 rounded-full bg-gray-300 group-hover:bg-purple-400 transition-colors"></span>
                              {group}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="pt-8">
                  <button className="w-full py-5 bg-black text-white font-bold text-xl rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all">
                      + Create Group
                  </button>
              </div>
          </div>
      </div>

      {/* Main Feed (Flexible, Grid) */}
      <div className="flex-1 bg-gray-100 overflow-y-auto scrollbar-hide">
          <div className="w-full min-h-full p-10">
              <div className="mb-12">
                  <h2 className="text-5xl font-bold text-gray-900 mb-4">Fresh Ideas</h2>
                  <p className="text-2xl text-gray-500">See what your team is thinking about today.</p>
              </div>

              {/* Grid Layout - 2 columns on XL */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-32 auto-rows-min">
                  {localNotes.map((note) => (
                      <div key={note.id} className="h-full">
                          <NoteCard note={note} />
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Right Panel (w-[30%], min-400px) */}
      <div className="w-[30%] min-w-[400px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Top: Search */}
          <div className="border-b border-gray-100 p-8">
              <div className="relative w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder="Search ideas..." 
                      className="w-full h-16 bg-gray-50 border border-transparent focus:bg-white focus:border-purple-200 focus:shadow-md rounded-2xl pl-16 pr-6 text-xl outline-none transition-all shadow-sm"
                  />
              </div>
          </div>

          {/* Bottom: Input Area (Flex-1) */}
          <div className="flex-1 flex flex-col overflow-hidden">
              <InputArea onPost={handlePost} isAnalyzing={isAnalyzing} />
          </div>
      </div>

    </div>
  );
};
