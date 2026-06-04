/**
 * Shared types for the LEF Counsel chat feature.
 * Kept in one place so every sub-component imports from here,
 * not from each other.
 */

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type QuizData = {
  type: 'quiz';
  questions: QuizQuestion[];
};
