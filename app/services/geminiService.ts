import { Note, SemanticMatch } from '../types';

// 模拟 AI 语义匹配，无需真实后端
export const checkSemanticSimilarity = async (text: string, dbNotes: Note[]): Promise<SemanticMatch> => {
  const lowerText = text.toLowerCase();
  // 简单的关键词匹配模拟
  const match = dbNotes.find(note => {
    const noteContent = note.content.toLowerCase();
    const keywords = ['transformer', 'attention', 'robot', 'llama', 'quantization', 'gene'];
    return keywords.some(k => lowerText.includes(k) && noteContent.includes(k));
  });

  if (match) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      found: true,
      targetNoteId: match.id,
      reason: "Detected shared research context based on keywords."
    };
  }
  
  await new Promise(resolve => setTimeout(resolve, 400));
  return { found: false };
};
