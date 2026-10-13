import { Fragment } from 'react';
import { splitByRanges } from '../utils/highlight';
import type { TextRange } from '../utils/highlight';

interface HighlightedTextProps {
  text: string;
  ranges: TextRange[];
  focusRange?: TextRange | null;
}

function overlaps(a: TextRange, b: TextRange): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

export function HighlightedText({ text, ranges, focusRange = null }: HighlightedTextProps) {
  const segments = splitByRanges(text, ranges);
  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.match) {
          return <Fragment key={index}>{segment.text}</Fragment>;
        }
        const focused = focusRange !== null && overlaps([segment.start, segment.end], focusRange);
        return (
          <mark key={index} className={focused ? 'hl hl--focus' : 'hl'}>
            {segment.text}
          </mark>
        );
      })}
    </>
  );
}
