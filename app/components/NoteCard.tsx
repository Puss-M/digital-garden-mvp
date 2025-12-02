import React from 'react';
import { Note } from '../types';
import { Heart, MessageSquare, Hash } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col h-full transform hover:-translate-y-1">
      {/* Header: Title */}
      {note.title && (
        <h3 className="font-bold text-gray-900 text-2xl leading-tight mb-4">{note.title}</h3>
      )}

      {/* Body: Context - XL Size & Pure Black */}
      <div className="flex-1 mb-8 text-gray-900 text-xl leading-relaxed whitespace-pre-wrap font-sans">
        {note.content}
      </div>

      {/* Footer: Meta & Actions */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
           {/* User Info */}
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-base font-bold text-gray-700">
                 {note.author[0]}
              </div>
              <div className="flex flex-col">
                 <span className="font-bold text-gray-900 text-base">{note.author}</span>
                 <span className="text-base text-gray-500">{note.timestamp}</span>
              </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-6 text-gray-400">
              <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                  <Heart className="w-7 h-7 group-hover:fill-pink-500" />
                  <span className="text-base font-medium">12</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <MessageSquare className="w-7 h-7" />
                  <span className="text-base font-medium">3</span>
              </button>
           </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-3">
           {note.tags && note.tags.length > 0 ? (
               note.tags.map((tag, i) => (
                   <span key={i} className="flex items-center text-base text-blue-600 bg-blue-50 px-5 py-2.5 rounded-full font-medium">
                       <Hash className="w-4 h-4 mr-1.5" />{tag}
                   </span>
               ))
           ) : (
               <span className="text-base text-gray-400 italic">#idea</span>
           )}
        </div>
      </div>
    </div>
  );
};