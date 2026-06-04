/**
 * components/counsel/index.ts
 * Barrel export — import all counsel sub-components from this single path.
 *
 * Usage in LEFCounselPanel:
 *   import { Message, ChatBody, ChatInput } from '@/components/counsel';
 */

export type { Message, QuizQuestion, QuizData } from './types';
export { ChatBody } from './ChatBody';
export { ChatInput } from './ChatInput';
export { AssistantMessage } from './AssistantMessage';
export { GuestOnboarding } from './GuestOnboarding';
export { QuizBlock } from './QuizBlock';
export { extractQuiz } from './quiz-utils';
