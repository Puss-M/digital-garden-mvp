import React from 'react';
import { Search, Bell, MessageSquare, Plus, Menu, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 z-50 flex items-center px-4 justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 20 20">
              <path d="M16.5,10c0.8,0,1.5,0.7,1.5,1.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5C15,10.7,15.7,10,16.5,10z M13.5,14.5 c0-2.5-2-4.5-4.5-4.5c-2.5,0-4.5,2-4.5,4.5c0,0.8,0.7,1.5,1.5,1.5c0.8,0,1.5-0.7,1.5-1.5c0-1.7,1.3-3,3-3c1.7,0,3,1.3,3,3 c0,0.8,0.7,1.5,1.5,1.5C12.8,16,13.5,15.3,13.5,14.5z M3.5,10c0.8,0,1.5,0.7,1.5,1.5c0,0.8-0.7,1.5-1.5,1.5S2,12.3,2,11.5 C2,10.7,2.7,10,3.5,10z" />
            </svg>
          </div>
          <span className="hidden lg:block text-xl font-bold tracking-tight text-gray-900">reddit</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-2xl px-4 hidden sm:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
            placeholder="Search Reddit"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden relative">
             <User className="w-6 h-6 text-gray-400 absolute bottom-0" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-gray-700">User</p>
            <p className="text-xs text-gray-500">1 karma</p>
          </div>
        </button>
      </div>
    </nav>
  );
};
