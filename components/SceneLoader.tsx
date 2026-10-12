'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';

// The 3D scene is browser-only, so it is loaded without SSR.
const Scene = dynamic(() => import('./Scene'), { ssr: false, loading: () => null });

/** If WebGL is unavailable or the scene throws, the CSS glow behind it stays visible. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Intentionally silent.
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SceneLoader() {
  const [mount, setMount] = useState(false);

  // Let the page paint (hero text, buttons) first, then load the heavy 3D bundle when idle.
  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) setMount(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(go, { timeout: 1500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const id = setTimeout(go, 500);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#030406]">
      <div className="bg-fallback absolute inset-0" />
      {mount && (
        <SceneBoundary>
          <Scene />
        </SceneBoundary>
      )}
    </div>
  );
}
