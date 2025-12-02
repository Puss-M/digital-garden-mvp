export interface Note {
  id: string;
  author: string;
  title?: string; // Added title
  content: string;
  timestamp: string;
  tags: string[];
  isLocalUser: boolean;
  isPublic?: boolean; // Added public/private status
}

export interface SemanticMatch {
  found: boolean;
  targetNoteId?: string;
  reason?: string;
}

export enum AppTab {
  REPORT = 'report',
  PROTOTYPE = 'prototype'
}
