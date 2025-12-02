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
    // Optimistic UI update
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
        // 1. Generate Embedding
        const res = await fetch('/api/embed', { method: 'POST', body: JSON.stringify({ text: content }) });
        const { embedding } = await res.json();
        
        // 2. Insert into DB
        await supabase.from('ideas').insert({ 
            content, 
            title: title || null,
            author: currentAuthor, 
            embedding,
            is_public: isPublic,
            tags: [] // Default empty tags for now
        });
        
        // 3. RAG Matching
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
        // Rollback logic could go here
    } finally { 
        setIsAnalyzing(false); 
        fetchRealNotes(); // Refresh to get real ID
    }
  };

  const getMatchedNote = (id?: string) => localNotes.find(n => n.id === id);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1B] font-sans">
      {/* Spark Alert Modal */}
      {matchAlert && matchAlert.found && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-purple-100 transform transition-all scale-100">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 text-purple-600">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <Sparkles className="w-6 h-6 fill-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold">Spark Alert!</h3>
                    </div>
                    <button onClick={() => setMatchAlert(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {matchAlert.reason}
                </p>

                {matchAlert.targetNoteId && getMatchedNote(matchAlert.targetNoteId) && (
                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 mb-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">
                                {getMatchedNote(matchAlert.targetNoteId)?.author[0]}
                            </div>
                            <div className="text-sm font-bold text-purple-900">
                                u/{getMatchedNote(matchAlert.targetNoteId)?.author}
                            </div>
                        </div>
                        <div className="text-base text-gray-800 italic leading-relaxed">
                            "{getMatchedNote(matchAlert.targetNoteId)?.content}"
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={() => setMatchAlert(null)} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors shadow-lg hover:shadow-purple-200">
                        Connect & Discuss
                    </button>
                    <button onClick={() => setMatchAlert(null)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-full transition-colors">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Layout: Asymmetric 3-Column */}
      <div className="flex h-screen overflow-hidden">
        
        {/* Left Sidebar (w-1/5, min-260px) */}
        <div className="w-1/5 min-w-[260px] bg-gray-50/50 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="h-[80px] flex items-center px-8">
                <h1 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">Swift Ideas</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                {/* Navigation */}
                <div className="space-y-4">
                    <button className="w-full flex items-center gap-4 px-4 py-3 text-lg font-medium text-gray-900 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Popular Ideas
                    </button>
                    <button className="w-full flex items-center gap-4 px-4 py-3 text-lg font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <Users className="w-5 h-5" />
                        My Groups
                    </button>
                </div>

                {/* Groups List */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">My Groups</span>
                        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                        {['Product Design', 'Engineering', 'Marketing', 'Random'].map((group, i) => (
                            <button key={i} className="w-full flex items-center gap-3 px-4 py-3 text-base text-gray-600 hover:bg-white hover:shadow-sm rounded-xl transition-all group">
                                <span className="w-3 h-3 rounded-full bg-gray-300 group-hover:bg-purple-400 transition-colors"></span>
                                {group}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                        + Create Group
                    </button>
                </div>
            </div>
        </div>

        {/* Main Feed (Flexible, Grid) */}
        <div className="flex-1 bg-[#FAFAFA] overflow-y-auto relative scrollbar-hide">
            <div className="w-full h-full p-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fresh Ideas</h2>
                        <p className="text-lg text-gray-500">See what your team is thinking about today.</p>
                    </div>
                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <button className="p-2 bg-gray-100 rounded text-gray-900"><Grid className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded"><List className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
                    {localNotes.map((note) => (
                        <div key={note.id} className="h-full">
                            <NoteCard note={note} />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Panel (w-1/4, min-320px) */}
        <div className="w-1/4 min-w-[320px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0 relative z-10">
            {/* Top: Search */}
            <div className="h-[80px] border-b border-gray-100 flex items-center px-6">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search ideas..." 
                        className="w-full h-12 bg-gray-50 border border-transparent focus:bg-white focus:border-purple-200 focus:shadow-md rounded-2xl pl-12 pr-4 text-base outline-none transition-all"
                    />
                </div>
            </div>

            {/* Middle: Widgets */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-6 border border-purple-100 shadow-sm">
                    <h3 className="font-bold text-purple-900 text-lg mb-2">Weekly Challenge</h3>
                    <p className="text-base text-purple-800 mb-4 leading-relaxed">How might we improve the onboarding experience for new users?</p>
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 shadow-sm">
                                {String.fromCharCode(64+i)}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full bg-purple-200 border-2 border-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 shadow-sm">
                            +5
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Input Area (Fixed) */}
            <div className="border-t border-gray-200 bg-white">
                <InputArea onPost={handlePost} isAnalyzing={isAnalyzing} />
            </div>
        </div>

      </div>
    </div>
  );
};