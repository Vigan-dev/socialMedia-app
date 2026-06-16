import React from 'react';

type HighlightedTextProps = {
  hashtagClassName?: string;
  text: string;
};

const hashtagPattern = /#[a-zA-Z0-9_][a-zA-Z0-9_-]*/g;

export function HighlightedText({
  hashtagClassName = 'font-semibold text-indigo-300',
  text,
}: HighlightedTextProps) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(hashtagPattern)) {
    const hashtag = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <span key={`${hashtag}-${index}`} className={hashtagClassName}>
        {hashtag}
      </span>,
    );

    lastIndex = index + hashtag.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
