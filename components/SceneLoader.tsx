'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';

// The 3D scene is browser-only, so it is loaded without SSR.
const Scene = dynamic(() => import('./Scene'), { ssr: false, loading: () => null });

/** If WebGL is unavailable or the scene throws, fall back to the CSS glow behind it. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Intentionally silent: the CSS background stays visible.
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SceneLoader() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#030406]">
      <div className="bg-fallback absolute inset-0" />
      <SceneBoundary>
        <Scene />
      </SceneBoundary>
    </div>
  );
}
