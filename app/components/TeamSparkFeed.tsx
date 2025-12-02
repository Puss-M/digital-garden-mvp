import React from 'react';
import { MoreHorizontal, MessageCircle } from 'lucide-react';
import { Note } from '../types';

interface TeamSparkFeedProps {
  ideas: Note[];
}

export const TeamSparkFeed: React.FC<TeamSparkFeedProps> = ({ ideas }) => {
  return (
    <div className="flex-1 py-6 px-6">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">灵感流</h2>

        {ideas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">暂无灵感，快来发布第一条吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map(idea => (
               <div key={idea.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-medium text-sm border border-blue-200">
                           {idea.author[0]}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm">{idea.author}</span>
                              {idea.isLocalUser && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">我</span>
                              )}
                           </div>
                           <span className="text-xs text-gray-400">{idea.timestamp}</span>
                        </div>
                     </div>
                     <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                     {idea.title && (
                       <h3 className="font-bold text-gray-900 text-base mb-1.5">{idea.title}</h3>
                     )}
                     <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {idea.content}
                     </p>
                  </div>

                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                       {idea.tags.map(tag => (
                          <span key={tag} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                             #{tag}
                          </span>
                       ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-1 text-gray-400">
                     <MessageCircle className="w-4 h-4" />
                     <span className="text-sm">评论</span>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
