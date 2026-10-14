import { middlemen, parseCount, parseFee } from '@/data/middlemen';
import { v } from '@/lib/css';
import { ArrowRight } from './icons';
import HeroScene from './HeroScene';
import Lines from './Lines';

const totalVouches = middlemen.reduce((sum, m) => sum + parseCount(m.telegram_vouches) + parseCount(m.ogu_vouches), 0);
const fees = middlemen.map((m) => parseFee(m.fee));
const feeRange = `${Math.min(...fees)}–${Math.max(...fees)}%`;

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="chip" data-reveal="up">
            <i aria-hidden="true" />
            {middlemen.length} community-vetted middlemen
          </p>

          <h1 className="hero__title">
            <Lines lines={['Secure', 'Digital', 'Escrow']} accent={2} />
          </h1>

          <p className="hero__sub" data-reveal="up" style={v({ '--d': 260 })}>
            Browse verified middlemen.
          </p>
          <p className="hero__text" data-reveal="up" style={v({ '--d': 340 })}>
            Every listing links straight to the middleman&rsquo;s real Telegram. Compare fees and vouch history, then let a
            neutral third party hold the funds until the deal is done.
          </p>

          <div className="hero__cta" data-reveal="up" style={v({ '--d': 430 })}>
            <a href="#directory" className="btn btn--primary btn--lg">
              Browse middlemen <ArrowRight width={20} height={20} />
            </a>
            <a href="#how" className="btn btn--ghost btn--lg">
              How it works
            </a>
          </div>

          <dl className="stats" data-reveal="up" style={v({ '--d': 520 })}>
            <div>
              <dt>Listed middlemen</dt>
              <dd data-count={middlemen.length}>{middlemen.length}</dd>
            </div>
            <div>
              <dt>Combined vouches</dt>
              <dd data-count={totalVouches} data-suffix="+">
                {totalVouches.toLocaleString('en-US')}+
              </dd>
            </div>
            <div>
              <dt>Fee range</dt>
              <dd>{feeRange}</dd>
            </div>
          </dl>
        </div>

        <HeroScene />
      </div>
      <a className="hero__scroll" href="#directory" aria-label="Scroll to the directory">
        <span />
      </a>
    </section>
  );
}
