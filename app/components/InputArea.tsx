import React, { useState } from 'react';
import { Send, Lock, Globe, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onPost: (title: string, content: string, isPublic: boolean) => Promise<void>;
  isAnalyzing: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onPost, isAnalyzing }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onPost(title, content, isPublic);
    setTitle('');
    setContent('');
  };

  return (
    <div className="bg-white p-8 flex flex-col h-full">
      <div className="flex flex-col gap-8 flex-1">
        {/* Title Input (Optional) */}
        <input
          type="text"
          placeholder="Idea Title..."
          className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 outline-none bg-transparent border-b border-gray-100 pb-4 focus:border-gray-300 transition-colors"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        {/* Main Content Textarea - Massive & Borderless */}
        <textarea
          placeholder="Write down your ideas..."
          className="w-full flex-1 min-h-[256px] text-2xl text-gray-900 placeholder-gray-300 outline-none resize-none bg-transparent leading-relaxed focus:ring-0"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Footer: Controls */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          {/* Privacy Toggle */}
          <button 
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl text-lg font-medium transition-colors ${
                isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
            }`}
          >
            {isPublic ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            {isPublic ? 'Public' : 'Private'}
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isAnalyzing}
            className="flex items-center gap-4 px-10 h-16 bg-black text-white rounded-xl text-2xl font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:scale-[1.02] active:scale-100"
          >
            {isAnalyzing ? (
                <>
                    <Sparkles className="w-7 h-7 animate-spin" />
                    <span>Matching...</span>
                </>
            ) : (
                <>
                    <span>Save Idea</span>
                    <Send className="w-7 h-7" />
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
