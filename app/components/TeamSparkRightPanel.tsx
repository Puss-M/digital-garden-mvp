import React, { useState } from 'react';
import { Sparkles, Globe, Lock, Zap } from 'lucide-react';

interface TeamSparkRightPanelProps {
  onPost: (title: string, content: string, isPublic: boolean) => Promise<void>;
  isAnalyzing: boolean;
}

export const TeamSparkRightPanel: React.FC<TeamSparkRightPanelProps> = ({ onPost, isAnalyzing }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await onPost(title, content, isPublic);
    
    // Clear form after submission
    setTitle('');
    setContent('');
  };

  return (
    <aside className="w-80 bg-white h-[calc(100vh-64px)] sticky top-16 border-l border-gray-100 flex flex-col overflow-y-auto">
      <div className="p-5 space-y-4">
        
        {/* Record Inspiration Widget */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 overflow-hidden">
           <div className="px-4 py-3 flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="text-sm font-bold text-gray-900">记录你的灵感</span>
           </div>
           
           <div className="bg-white p-4">
              {/* Optional Title */}
              <input
                type="text"
                className="w-full text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent mb-2 pb-2 border-b border-gray-100"
                placeholder="标题（可选）..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isAnalyzing}
              />
              
              <textarea 
                className="w-full h-28 text-sm text-gray-700 placeholder-gray-400 resize-none outline-none bg-transparent mb-3"
                placeholder="写下你的想法...&#10;支持使用 @ 提及成员或 # 添加标签"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isAnalyzing}
              />
              
              <div className="flex items-center justify-between mb-3">
                 <span className="text-xs text-gray-500">权限选择</span>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setIsPublic(true)}
                      disabled={isAnalyzing}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                          isPublic ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      } disabled:opacity-50`}
                    >
                       <Globe className="w-3 h-3" />
                       公开
                    </button>
                    <button 
                      onClick={() => setIsPublic(false)}
                      disabled={isAnalyzing}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                          !isPublic ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'
                      } disabled:opacity-50`}
                    >
                       <Lock className="w-3 h-3" />
                       私有
                    </button>
                 </div>
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={!content.trim() || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                 {isAnalyzing ? (
                   <>
                     <Sparkles className="w-4 h-4 animate-spin" />
                     <span>正在碰撞...</span>
                   </>
                 ) : (
                   <>
                     <span>发布并碰撞灵感</span>
                     <Zap className="w-4 h-4" />
                   </>
                 )}
              </button>
           </div>
        </div>

        {/* Preview Widget */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
           <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium">碰撞结果预览区：</span>提交后，这里将显示与相关的历史灵感...
           </p>
        </div>

      </div>
    </aside>
  );
};
