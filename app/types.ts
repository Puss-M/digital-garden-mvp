export interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  tags: string[];
  isLocalUser: boolean;
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
