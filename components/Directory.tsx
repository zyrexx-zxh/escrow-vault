import { middlemen } from '@/data/middlemen';
import { v } from '@/lib/css';
import Deck from './Deck';
import Lines from './Lines';

export default function Directory() {
  return (
    <section id="directory" className="directory">
      <div className="wrap">
        <header className="sec-head">
          <p className="eyebrow" data-reveal="up">
            01 &mdash; Directory
          </p>
          <h2 className="h2">
            <Lines lines={['Choose your', 'middleman.']} accent={1} />
          </h2>
          <p className="lead" data-reveal="up" style={v({ '--d': 160 })}>
            Swipe through every listed middleman. Compare fees and vouch history, then tap Contact to open their Telegram.
          </p>
        </header>
      </div>
      <Deck items={middlemen} />
    </section>
  );
}
