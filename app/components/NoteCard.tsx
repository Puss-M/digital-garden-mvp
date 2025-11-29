import React from 'react';
import { Note } from '../types';

export const NoteCard: React.FC<{ note: Note; isNew?: boolean }> = ({ note, isNew }) => (
  <div className={`p-4 rounded-xl border transition-all duration-500 ${
    isNew 
      ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-in fade-in slide-in-from-bottom-4' 
      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
  }`}>
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          note.isLocalUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {note.author[0]}
        </div>
        <span className={`text-sm font-medium ${note.isLocalUser ? 'text-emerald-400' : 'text-blue-400'}`}>
          <span>{note.author}</span>
        </span>
      </div>
      <span className="text-xs text-slate-500"><span>{note.timestamp}</span></span>
    </div>
    <p className="text-slate-300 text-sm leading-relaxed mb-3"><span>{note.content}</span></p>
    <div className="flex gap-2">
      {note.tags.map(tag => (
        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
          #{tag}
        </span>
      ))}
    </div>
  </div>
);
