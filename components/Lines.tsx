import { Fragment } from 'react';
import { v } from '@/lib/css';

/**
 * A heading split into lines. Each line rises out of its own mask when the heading scrolls into view
 * (ScrollFX adds `.is-in` to the wrapper). Spaces are kept between lines so screen readers and copy/paste
 * still read it as one sentence.
 */
export default function Lines({
  lines,
  accent,
  className = '',
}: {
  lines: string[];
  /** index of a line to paint with the accent gradient */
  accent?: number;
  className?: string;
}) {
  return (
    <span className={`lines ${className}`.trim()} data-reveal="lines">
      {lines.map((text, i) => (
        <Fragment key={i}>
          <span className="line">
            <span className={`line__in${accent === i ? ' is-accent' : ''}`} style={v({ '--i': i })}>
              {text}
            </span>
          </span>{' '}
        </Fragment>
      ))}
    </span>
  );
}
