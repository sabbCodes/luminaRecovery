import Dexie, { Table } from 'dexie';
import { UserProfile, Message } from './types';

export interface JournalEntry {
  id?: number;
  date: string; // ISO Date string for sorting
  mood: number;
  content: string;
  timestamp: string; // For display
}

export interface ChatMessage extends Message {
  sessionId?: string;
  // id is string in Message type, but Dexie can handle string keys or we can rely on auto-incrementing separate primary key. 
  // Let's stick to the Message type structure but allow Dexie to manage its own ID if needed, or mapping.
  // Actually, Message has 'id' as string. Dexie is fine with that.
}

export class LuminaDB extends Dexie {
  journalEntries!: Table<JournalEntry, number>;
  chatMessages!: Table<ChatMessage, number>; // auto-inc ID for ordering
  userProfile!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('LuminaDB');
    this.version(1).stores({
      journalEntries: '++id, date, mood',
      chatMessages: '++id, sessionId, role',
      userProfile: 'key'
    });
  }
}

export const db = new LuminaDB();
