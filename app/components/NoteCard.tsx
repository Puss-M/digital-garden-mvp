import React from 'react';
import { Note } from '../types';
import { Heart, MessageSquare, Hash } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col h-full">
      {/* Header: Title & User & Time */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200 shadow-sm">
              {note.author[0]}
           </div>
           <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">{note.author}</span>
              <span className="text-xs text-gray-400">{note.timestamp}</span>
           </div>
        </div>
        
        {note.title && (
            <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2">{note.title}</h3>
        )}
      </div>

      {/* Body: Context */}
      <div className="flex-1 mb-6 text-gray-700 text-base leading-relaxed whitespace-pre-wrap font-sans">
        {note.content}
      </div>

      {/* Footer: Tags & Actions */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
           {note.tags && note.tags.length > 0 ? (
               note.tags.map((tag, i) => (
                   <span key={i} className="flex items-center text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                       <Hash className="w-3 h-3 mr-0.5" />{tag}
                   </span>
               ))
           ) : (
               <span className="text-xs text-gray-400 italic">#idea</span>
           )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-400">
           <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group p-1">
               <Heart className="w-5 h-5 group-hover:fill-pink-500" />
               <span className="text-sm font-medium">12</span>
           </button>
           <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors p-1">
               <MessageSquare className="w-5 h-5" />
               <span className="text-sm font-medium">3</span>
           </button>
        </div>
      </div>
    </div>
  );
};