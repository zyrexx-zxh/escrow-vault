/**
 * SwipeEngine: a small physics carousel with a 3D cover-flow layout.
 *
 * One number (`pos`, measured in cards) is the single source of truth.
 *  - while dragging, `pos` follows the finger/mouse 1:1 (with a rubber band past the ends)
 *  - on release it springs to the target card, carrying the flick velocity
 * Every card's transform is a pure function of `pos`, so nothing can get out of sync, a swipe can be
 * interrupted at any moment, and there is no animation library in the loop. It does not loop: the
 * first and last cards are hard stops, so you can never "wrap back" to the start by accident.
 *
 * Only transform / opacity / two CSS variables are written, and only while something is moving.
 */

export interface SwipeEngineOptions {
  stage: HTMLElement;
  cards: HTMLElement[];
  /** Rounded index changed (fires live while moving). */
  onIndex?: (index: number) => void;
  /** Came to rest on a card. */
  onSettle?: (index: number) => void;
  onDrag?: (dragging: boolean) => void;
}

interface Sample {
  t: number;
  x: number;
}

const STIFFNESS = 150;
const DAMPING_RATIO = 0.8; // slightly under 1: settles with a tiny, soft overshoot
const DAMPING = 2 * DAMPING_RATIO * Math.sqrt(STIFFNESS);
const VISIBLE = 3; // cards rendered on each side of the active one
const RUBBER = 0.55; // how far (in cards) the edges can be pulled

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class SwipeEngine {
  private readonly o: SwipeEngineOptions;
  private readonly n: number;

  private pos = 0;
  private vel = 0; // cards per second
  private target: number | null = null;
  private index = 0;
  private spread = 1;

  private dragging = false;
  private pointerId: number | null = null;
  private downX = 0;
  private downY = 0;
  private dragX0 = 0;
  private dragPos0 = 0;
  private curX = 0;
  private samples: Sample[] = [];
  private suppressUntil = 0;
  private wheelAt = 0;

  private raf = 0;
  private last = 0;
  private destroyed = false;
  private x1 = 200; // px between the active card and its first neighbour
  private x2 = 90; // px between cards further out
  private shown: boolean[];
  private ro: ResizeObserver | null = null;

  constructor(options: SwipeEngineOptions) {
    this.o = options;
    this.n = options.cards.length;
    this.shown = options.cards.map(() => true);

    const s = options.stage;
    s.addEventListener('pointerdown', this.onDown);
    s.addEventListener('pointermove', this.onMove);
    s.addEventListener('pointerup', this.onUp);
    s.addEventListener('pointercancel', this.onUp);
    s.addEventListener('click', this.onClickCapture, true);
    s.addEventListener('dragstart', this.onDragStart);
    s.addEventListener('wheel', this.onWheel, { passive: false });
    s.addEventListener('keydown', this.onKey);

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.refresh());
      this.ro.observe(s);
    }

    this.measure();
    this.render();
    this.markActive();
  }

  /* ───────── public API ───────── */

  goTo(i: number): void {
    if (this.dragging || this.destroyed) return;
    this.target = clamp(Math.round(i), 0, this.n - 1);
    this.kick();
  }

  next(): void {
    this.step(1);
  }

  prev(): void {
    this.step(-1);
  }

  /** 0 = every card stacked in the middle, 1 = fully fanned out. Used for the intro. */
  setSpread(v: number): void {
    this.spread = clamp(v, 0, 1);
    this.render();
  }

  getIndex(): number {
    return this.index;
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    const s = this.o.stage;
    s.removeEventListener('pointerdown', this.onDown);
    s.removeEventListener('pointermove', this.onMove);
    s.removeEventListener('pointerup', this.onUp);
    s.removeEventListener('pointercancel', this.onUp);
    s.removeEventListener('click', this.onClickCapture, true);
    s.removeEventListener('dragstart', this.onDragStart);
    s.removeEventListener('wheel', this.onWheel);
    s.removeEventListener('keydown', this.onKey);
    this.ro?.disconnect();
  }

  /* ───────── layout ───────── */

  private measure(): void {
    let w = 0;
    for (const c of this.o.cards) {
      if (c.offsetWidth > 0) {
        w = c.offsetWidth;
        break;
      }
    }
    if (!w) w = 300;
    this.x1 = w * 0.6;
    this.x2 = w * 0.26;
  }

  private refresh(): void {
    this.measure();
    this.render();
  }

  private render(): void {
    const { cards } = this.o;
    const sp = this.spread;
    const lean = -clamp(this.vel * 3, -9, 9);

    for (let i = 0; i < this.n; i++) {
      const el = cards[i];
      const d = i - this.pos;
      const ad = Math.abs(d);

      if (ad > VISIBLE + 0.2) {
        if (this.shown[i]) {
          el.style.display = 'none';
          this.shown[i] = false;
        }
        continue;
      }
      if (!this.shown[i]) {
        el.style.display = '';
        this.shown[i] = true;
      }

      const sign = d < 0 ? -1 : 1;
      const near = Math.min(ad, 1);
      const far = Math.max(0, Math.min(ad, VISIBLE) - 1);

      const x = sign * (near * this.x1 + far * this.x2) * sp;
      const y = near * 10 + far * 14;
      const z = -(near * 130 + far * 70) * sp;
      const ry = -sign * (near * 40 + far * 8) * sp;
      const rz = lean * (1 - near * 0.45);
      const scale = 1 - near * 0.12 - far * 0.04;
      const dim = Math.min(0.88, near * 0.5 + far * 0.18);
      const fade = ad > VISIBLE - 0.4 ? clamp((VISIBLE + 0.2 - ad) / 0.6, 0, 1) : 1;

      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${ry.toFixed(
        2,
      )}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      el.style.opacity = fade.toFixed(3);
      el.style.zIndex = String(Math.round(100 - ad * 10));
      el.style.setProperty('--dim', dim.toFixed(3));
    }
  }

  private markActive(): void {
    const idx = clamp(Math.round(this.pos), 0, this.n - 1);
    this.index = idx;
    this.o.cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
  }

  private updateIndex(): void {
    const idx = clamp(Math.round(this.pos), 0, this.n - 1);
    if (idx === this.index) return;
    this.index = idx;
    this.o.cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    this.o.onIndex?.(idx);
  }

  /* ───────── physics loop ───────── */

  private kick(): void {
    if (this.raf || this.destroyed) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private loop = (now: number): void => {
    this.raf = 0;
    if (this.destroyed) return;
    const dt = clamp((now - this.last) / 1000, 1 / 240, 1 / 20);
    this.last = now;

    let settled = false;

    if (this.dragging) {
      const prev = this.pos;
      this.pos = this.rubber(this.dragPos0 - (this.curX - this.dragX0) / this.x1);
      const inst = (this.pos - prev) / dt;
      this.vel += (inst - this.vel) * 0.35;
    } else if (this.target !== null) {
      const sub = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const a = -STIFFNESS * (this.pos - this.target) - DAMPING * this.vel;
        this.vel += a * h;
        this.pos += this.vel * h;
      }
      if (Math.abs(this.pos - this.target) < 0.0006 && Math.abs(this.vel) < 0.015) {
        this.pos = this.target;
        this.vel = 0;
        this.target = null;
        settled = true;
      }
    }

    this.render();
    this.updateIndex();

    if (settled) this.o.onSettle?.(this.index);
    if (this.dragging || this.target !== null) this.kick();
  };

  /** Soft resistance when pulled past the first / last card. */
  private rubber(raw: number): number {
    const max = this.n - 1;
    if (raw < 0) return -RUBBER * (1 - Math.exp(raw / RUBBER));
    if (raw > max) return max + RUBBER * (1 - Math.exp(-(raw - max) / RUBBER));
    return raw;
  }

  private step(dir: number): void {
    if (this.dragging) return;
    const base = this.target ?? Math.round(this.pos);
    this.goTo(base + dir);
  }

  /* ───────── input ───────── */

  private pushSample(t: number, x: number): void {
    this.samples.push({ t, x });
    while (this.samples.length > 2 && t - this.samples[0].t > 120) this.samples.shift();
  }

  private onDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.curX = e.clientX;
    this.samples = [{ t: e.timeStamp, x: e.clientX }];
  };

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.curX = e.clientX;
    this.pushSample(e.timeStamp, e.clientX);

    if (!this.dragging) {
      const dx = e.clientX - this.downX;
      const dy = e.clientY - this.downY;
      if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // vertical intent: leave it to the page scroll
        this.pointerId = null;
        return;
      }
      this.beginDrag(e);
    }
  };

  private beginDrag(e: PointerEvent): void {
    this.dragging = true;
    this.target = null;
    this.dragX0 = e.clientX;
    this.dragPos0 = this.pos;
    try {
      this.o.stage.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable: fine */
    }
    this.o.stage.classList.add('is-dragging');
    this.o.onDrag?.(true);
    this.kick();
  }

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    if (!this.dragging) return;
    this.endDrag(e.type === 'pointercancel');
  };

  private endDrag(cancelled: boolean): void {
    this.dragging = false;
    this.o.stage.classList.remove('is-dragging');
    this.o.onDrag?.(false);
    this.suppressUntil = performance.now() + 380; // swallow the click that follows a drag

    const startIdx = Math.round(this.dragPos0);

    // release velocity in cards/second, from the last ~100ms of movement
    let v = 0;
    const s = this.samples;
    if (!cancelled && s.length >= 2) {
      const a = s[0];
      const b = s[s.length - 1];
      if (performance.now() - b.t < 90 && b.t > a.t) {
        v = (-((b.x - a.x) / (b.t - a.t)) * 1000) / this.x1;
      }
    }

    let t = Math.round(this.pos + clamp(v * 0.2, -2.2, 2.2));
    const moved = this.curX - this.dragX0;
    if (!cancelled && t === startIdx && Math.abs(moved) > 36) {
      t = startIdx + (moved < 0 ? 1 : -1); // clear intent: step to the neighbour
    }
    t = clamp(t, startIdx - 4, startIdx + 4);

    this.target = clamp(t, 0, this.n - 1);
    this.vel = v;
    this.kick();
  }

  private onClickCapture = (e: MouseEvent): void => {
    if (performance.now() < this.suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  private onDragStart = (e: Event): void => {
    e.preventDefault();
  };

  private onWheel = (e: WheelEvent): void => {
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2 || e.shiftKey;
    if (!horizontal) return; // vertical wheel keeps scrolling the page
    const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(dx) < 20) return;
    e.preventDefault();
    const now = performance.now();
    if (now - this.wheelAt < 420) return;
    this.wheelAt = now;
    this.step(dx > 0 ? 1 : -1);
  };

  private onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.goTo(this.n - 1);
    }
  };
}
