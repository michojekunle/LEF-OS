'use client';

import { useState, useEffect } from 'react';
import { MarkdownText } from '@/components/MarkdownText';
import { QuizBlock } from './QuizBlock';
import { extractQuiz } from './quiz-utils';
import type { QuizData } from './types';

type Props = {
  content: string;
  isLatest: boolean;
  onWordAdded?: () => void;
  onFinished?: () => void;
};

/**
 * Delegates to QuizMessage when the AI replied with a quiz JSON block,
 * or to TypewriterText for normal prose responses.
 * No conditional hooks — the branching is structural only.
 */
export function AssistantMessage({ content, isLatest, onWordAdded, onFinished }: Props) {
  const { quiz, prose } = extractQuiz(content);

  if (quiz) {
    return <QuizMessage quiz={quiz} prose={prose} onFinished={onFinished} />;
  }

  return (
    <TypewriterText
      content={content}
      isLatest={isLatest}
      onWordAdded={onWordAdded}
      onFinished={onFinished}
    />
  );
}

function QuizMessage({
  quiz,
  prose,
  onFinished,
}: {
  quiz: QuizData;
  prose: string;
  onFinished?: () => void;
}) {
  useEffect(() => {
    onFinished?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {prose && <MarkdownText text={prose} />}
      <QuizBlock quiz={quiz} />
    </div>
  );
}

function TypewriterText({ content, isLatest, onWordAdded, onFinished }: Props) {
  const [displayed, setDisplayed] = useState(isLatest ? '' : content);

  useEffect(() => {
    if (!isLatest) {
      setDisplayed(content);
      return;
    }

    const words = content.split(' ');
    let idx = 0;
    setDisplayed('');

    const timer = setInterval(() => {
      if (idx >= words.length) {
        clearInterval(timer);
        onFinished?.();
        return;
      }
      setDisplayed(words.slice(0, idx + 1).join(' '));
      idx++;
      onWordAdded?.();
    }, 20);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, isLatest]);

  return <MarkdownText text={displayed} />;
}
