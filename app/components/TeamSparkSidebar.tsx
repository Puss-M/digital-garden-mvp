import React from 'react';
import { Flame, Clock, Plus, Hash, TrendingUp } from 'lucide-react';

export const TeamSparkSidebar: React.FC = () => {
  return (
    <aside className="w-56 bg-white h-[calc(100vh-64px)] sticky top-16 flex flex-col overflow-y-auto">
      <div className="p-4 space-y-6">
        
        {/* Browse Section */}
        <div>
           <h3 className="text-xs font-bold text-gray-400 mb-3 px-2">浏览</h3>
           <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg transition-colors">
                 <Clock className="w-4 h-4" />
                 最新想法
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                 <Flame className="w-4 h-4" />
                 热门
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                 <TrendingUp className="w-4 h-4" />
                 排序方式
              </button>
           </div>
        </div>

        {/* My Groups Section */}
        <div>
           <h3 className="text-xs font-bold text-gray-400 mb-3 px-2">我的小组</h3>
           <div className="space-y-1">
              {['产品设计组', '市场营销部署', '技术探索'].map((group, i) => (
                  <button key={i} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group">
                     <Hash className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                     {group}
                  </button>
              ))}
           </div>
        </div>

        {/* Create Group Button */}
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all">
           <Plus className="w-4 h-4" />
           创建小组
        </button>

      </div>
    </aside>
  );
};
