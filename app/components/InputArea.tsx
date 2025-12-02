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
    <div className="bg-white border-t border-gray-200 p-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4">
        {/* Title Input (Optional) */}
        <input
          type="text"
          placeholder="Idea Title (Optional)..."
          className="w-full text-base font-bold text-gray-900 placeholder-gray-400 outline-none bg-transparent px-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        {/* Main Content Textarea */}
        <textarea
          placeholder="Write down your ideas..."
          className="w-full min-h-[120px] text-lg text-gray-800 placeholder-gray-400 outline-none resize-none bg-transparent px-1 leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Footer: Controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Privacy Toggle */}
          <button 
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isPublic ? 'Public' : 'Private'}
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-base font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isAnalyzing ? (
                <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Matching...</span>
                </>
            ) : (
                <>
                    <span>Save Idea</span>
                    <Send className="w-5 h-5" />
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
