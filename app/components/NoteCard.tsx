import React from 'react';
import { Note } from '../types';

export const NoteCard: React.FC<{ 
  note: Note; 
  isNew?: boolean;
  onDelete?: (id: string) => void;
}> = ({ note, isNew, onDelete }) => (
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
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500"><span>{note.timestamp}</span></span>
        {note.isLocalUser && onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded"
            title="删除这条笔记"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
    <p className="text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap"><span>{note.content}</span></p>
    <div className="flex gap-2">
      {note.tags.map(tag => (
        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
          #{tag}
        </span>
      ))}
    </div>
  </div>
);
