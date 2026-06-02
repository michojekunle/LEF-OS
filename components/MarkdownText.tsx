'use client';

import React from 'react';

type Props = {
  text: string;
};

export function MarkdownText({ text }: Props) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let currentParagraphLines: string[] = [];

  function parseInline(inlineText: string): React.ReactNode[] {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = inlineText.split(regex);

    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-gold text-text-primary">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-gold"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  }

  function flushParagraph() {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join(' ');
      blocks.push(
        <p
          key={`p-${blocks.length}`}
          className="mb-3 text-xs leading-relaxed text-text-secondary last:mb-0"
        >
          {parseInline(pText)}
        </p>,
      );
      currentParagraphLines = [];
    }
  }

  function flushList() {
    if (currentList) {
      const listKey = `list-${blocks.length}`;
      if (currentList.type === 'ul') {
        blocks.push(
          <ul key={listKey} className="mb-3 list-disc space-y-1 pl-5 text-xs text-text-secondary">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ul>,
        );
      } else {
        blocks.push(
          <ol
            key={listKey}
            className="mb-3 list-decimal space-y-1 pl-5 text-xs text-text-secondary"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ol>,
        );
      }
      currentList = null;
    }
  }

  function flushTable() {
    if (currentTable) {
      blocks.push(
        <div
          key={`table-wrapper-${blocks.length}`}
          className="bg-surface-2/20 my-3 w-full overflow-x-auto rounded-lg border border-border"
        >
          <table className="w-full border-collapse text-left text-[11px] text-text-secondary">
            <thead>
              <tr className="bg-surface-2/50 border-b border-border">
                {currentTable.headers.map((h, idx) => (
                  <th
                    key={idx}
                    className="border-r border-border px-3 py-2 font-semibold text-text-primary last:border-r-0"
                  >
                    {parseInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-surface-2/20 border-b border-border transition-colors last:border-b-0"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="border-r border-border px-3 py-2 leading-normal last:border-r-0"
                    >
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      currentTable = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Headings
    if (trimmed.startsWith('#')) {
      flushParagraph();
      flushList();
      flushTable();

      const level = line.match(/^#+/)?.[0].length || 1;
      const headingText = trimmed.replace(/^#+\s*/, '');
      const headingClass =
        level === 1
          ? 'text-sm font-semibold text-text-primary mt-4 mb-2 first:mt-0 font-display'
          : level === 2
            ? 'text-xs font-semibold text-text-primary mt-3 mb-2 first:mt-0 font-display border-b border-border pb-1'
            : 'text-[11px] font-semibold text-gold mt-2 mb-1.5 first:mt-0 font-display';

      const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <HeadingTag key={`h-${i}`} className={headingClass}>
          {parseInline(headingText)}
        </HeadingTag>,
      );
      continue;
    }

    // 2. Tables
    if (trimmed.startsWith('|')) {
      flushParagraph();
      flushList();

      const cells = trimmed
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);

      const isSeparator = cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));

      if (isSeparator) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // 3. Lists
    const listMatch = trimmed.match(/^([*\-]\s|\d+\.\s)(.*)/);
    if (listMatch) {
      flushParagraph();
      flushTable();

      const isOl = /^\d+\./.test(listMatch[1]);
      const listType = isOl ? 'ol' : 'ul';
      const itemText = listMatch[2];

      if (currentList && currentList.type !== listType) {
        flushList();
      }

      if (!currentList) {
        currentList = { type: listType, items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    } else {
      flushList();
    }

    // 4. Blank lines
    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    // 5. Paragraph content
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushTable();

  return <div className="space-y-1.5">{blocks}</div>;
}
