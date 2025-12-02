import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export const TeamSparkNavbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center">
           <span className="text-xl">⚡</span>
        </div>
        <span className="text-lg font-bold text-gray-900">Team Spark</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="搜索创意、标签或团队成员..." 
             className="w-full h-9 bg-gray-50 rounded-lg pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
           />
        </div>
      </div>

      {/* Right: User Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors relative">
           <Bell className="w-5 h-5" />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
           <User className="w-full h-full p-1.5 text-gray-500" />
        </div>
      </div>
    </nav>
  );
};
