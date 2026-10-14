import { parseFee, type Middleman } from '@/data/middlemen';
import { ArrowUpRight, Check } from './icons';
import Portrait from './Portrait';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One card in the deck. The outer <article> is moved by the swipe engine (3D cover-flow position);
 * .mm__inner carries the hover tilt and the "chosen" lift, so the two never fight over `transform`.
 */
export default function MiddlemanCard({ m, index, total }: { m: Middleman; index: number; total: number }) {
  const fee = parseFee(m.fee);
  const tier = fee <= 2 ? 'low' : fee <= 3 ? 'mid' : 'std';
  const notListed = !/\d/.test(m.telegram_vouches);

  return (
    <article
      className="mm"
      data-card
      data-index={index}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${m.name}`}
    >
      <div className="mm__inner">
        <span className="mm__border" aria-hidden="true" />

        <div className="mm__photo">
          <Portrait name={m.name} />
          <span className="mm__no">{pad(index + 1)}</span>
          <span className={`mm__fee mm__fee--${tier}`}>{m.fee} fee</span>
        </div>

        <div className="mm__body">
          <div className="mm__id">
            <h3 className="mm__name">{m.name}</h3>
            <p className="mm__user">@{m.username}</p>
          </div>

          <dl className="mm__stats">
            <div>
              <dt>Telegram vouches</dt>
              <dd className={notListed ? 'is-muted' : undefined}>{m.telegram_vouches}</dd>
            </div>
            <div>
              <dt>OGU vouches</dt>
              <dd>{m.ogu_vouches}</dd>
            </div>
          </dl>

          <a
            className="mm__cta"
            data-contact
            href={`https://t.me/${m.username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mm__cta-label" data-label={`Contact @${m.username}`}>
              Contact @{m.username}
            </span>
            <i aria-hidden="true">
              <ArrowUpRight width={18} height={18} />
            </i>
          </a>
        </div>

        <span className="mm__glare" aria-hidden="true" />
      </div>

      <span className="mm__ring" aria-hidden="true" />
      <span className="mm__stamp" aria-hidden="true">
        <Check width={16} height={16} strokeWidth={2.4} />
        Locked in
      </span>
    </article>
  );
}
