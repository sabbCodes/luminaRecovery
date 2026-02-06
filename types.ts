
export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number; // 1-10
  content: string;
  triggers: string[];
}

export interface RecoveryInsight {
  type: 'pattern' | 'encouragement' | 'warning';
  title: string;
  description: string;
  actionItem?: string;
}

export interface UserProfile {
  name: string;
  targetBehavior: string;
  startDate: string;
  streaks: number;
}

export interface EvaluationMetric {
  name: string;
  score: number;
  reason: string;
}

export interface OpikTrace {
  id: string;
  timestamp: string;
  agent: string;
  input: string;
  output: string;
  evaluations: EvaluationMetric[];
  latency?: number;
}
