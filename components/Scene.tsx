'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { scrollState } from '@/lib/scrollState';

/**
 * Deliberately light scene:
 *  - one calm dark-metal vault door, two orbit rings, a soft glow sprite, a few dust particles
 *  - plain MeshStandardMaterial (no clearcoat), no post-processing, no drei
 *  - the camera orbits OUTSIDE the rings, so nothing ever cuts through the view
 *  - quality adapts automatically if the device can't hold a smooth frame rate
 */

const EMERALD = '#10f2a5';
const BLUE = '#3b8bff';

const metalDark = { color: '#0c1015', metalness: 0.95, roughness: 0.34 } as const;
const metalMid = { color: '#181d25', metalness: 0.95, roughness: 0.27 } as const;
const metalBolt = { color: '#3a424d', metalness: 0.9, roughness: 0.35 } as const;

/* ───────────────────────── Helpers ───────────────────────── */

/** Tiny procedural studio environment (a few emissive panels) → reflections, no HDR download. */
function buildEnvScene(): THREE.Scene {
  const s = new THREE.Scene();
  s.background = new THREE.Color('#06080b');

  const panel = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    color: string,
    k: number,
  ) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k) });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    s.add(mesh);
  };

  panel(16, 0.3, 7, 0, 8, 0, '#ffffff', 5); // top softbox
  panel(0.3, 7, 12, -9, 1, 0, EMERALD, 3); // left strip
  panel(0.3, 7, 12, 9, 0, -2, BLUE, 3); // right strip
  panel(14, 6, 0.3, 0, 1, -10, '#ffffff', 1.6); // back
  panel(10, 4, 0.3, 0, 0, 10, '#dce8ff', 1.1); // front fill
  return s;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ───────────────────────── Environment ───────────────────────── */

function Environment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const envScene = buildEnvScene();
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(envScene, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.85;
    pmrem.dispose();

    envScene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });

    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene]);

  return null;
}

/* ───────────────────────── Vault ───────────────────────── */

function Bolts() {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      o.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.02);
      o.rotation.set(Math.PI / 2, 0, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 12]}>
      <cylinderGeometry args={[0.06, 0.06, 0.07, 16]} />
      <meshStandardMaterial {...metalBolt} />
    </instancedMesh>
  );
}

/** One face of the door: glowing ring, bolts and a slowly turning dial. */
function Face({ flip }: { flip?: boolean }) {
  const dial = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (dial.current) dial.current.rotation.z += Math.min(delta, 0.05) * (flip ? 0.2 : -0.2);
  });

  return (
    <group rotation={[0, flip ? Math.PI : 0, 0]} position={[0, 0, flip ? -0.26 : 0.26]}>
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[1.22, 0.04, 16, 128]} />
        <meshBasicMaterial color={EMERALD} toneMapped={false} />
      </mesh>

      <Bolts />

      <group ref={dial} position={[0, 0, 0.04]}>
        <mesh>
          <torusGeometry args={[0.62, 0.05, 16, 64]} />
          <meshStandardMaterial {...metalMid} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 3]}>
            <boxGeometry args={[0.06, 1.24, 0.05]} />
            <meshStandardMaterial {...metalMid} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.14, 32]} />
          <meshStandardMaterial {...metalMid} />
        </mesh>
        <mesh position={[0, 0, 0.105]}>
          <circleGeometry args={[0.07, 32]} />
          <meshBasicMaterial color={EMERALD} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── World + scroll-driven camera ───────────────────────── */

function World({ particles }: { particles: boolean }) {
  const root = useRef<THREE.Group>(null);
  const vault = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const dots = useRef<THREE.Points>(null);

  const smooth = useRef({ p: 0, deck: 0, mx: 0, my: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const reduce = useRef(false);

  const glow = useMemo(makeGlowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);

  const positions = useMemo(() => {
    const n = 110;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 5.5 + Math.random() * 9;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    return arr;
  }, []);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05); // ignore long hitches so motion never jumps
    const t = state.clock.elapsedTime;
    const s = smooth.current;
    const damp = THREE.MathUtils.damp;

    s.p = damp(s.p, scrollState.progress, 3.4, dt);
    s.deck = damp(s.deck, scrollState.deck, 3.2, dt);
    s.mx = damp(s.mx, mouse.current.x, 2.5, dt);
    s.my = damp(s.my, mouse.current.y, 2.5, dt);

    const p = THREE.MathUtils.clamp(s.p, 0, 1);
    const speed = reduce.current ? 0.2 : 1;

    const aspect = state.size.width / state.size.height;
    const portrait = aspect < 0.9;
    const wide = aspect > 1.25;

    // Camera orbits the vault at a safe distance (always outside the outer ring)
    const radius = (10.8 + p * 2.4) * (portrait ? 1.4 : 1);
    const az = p * 1.3 + s.mx * 0.08;
    const el = 0.8 + Math.sin(p * Math.PI) * 0.9 + s.my * 0.25;
    const cam = state.camera;
    cam.position.set(Math.sin(az) * radius, el, Math.cos(az) * radius);
    cam.lookAt(0, 0, 0);

    // In the hero the vault sits beside the headline (or above it on phones), then centres
    const hero = 1 - THREE.MathUtils.smoothstep(p, 0, 0.2);
    if (root.current) {
      root.current.position.x = wide ? 2.5 * hero : 0;
      root.current.position.y = portrait ? 1.9 * hero : 0;
    }

    if (vault.current) {
      vault.current.rotation.y = t * 0.14 * speed + s.deck * 0.4;
      vault.current.rotation.x = Math.sin(t * 0.4 * speed) * 0.05;
      vault.current.position.y = Math.sin(t * 0.7 * speed) * 0.08;
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.07 * speed;
    if (ringB.current) ringB.current.rotation.z -= dt * 0.05 * speed;
    if (dots.current) dots.current.rotation.y += dt * 0.012 * speed;

    // Keep the glow behind the vault, from the camera's point of view
    if (halo.current) halo.current.position.copy(cam.position).normalize().multiplyScalar(-3.2);
  });

  return (
    <group ref={root}>
      <sprite ref={halo} scale={[12, 12, 1]} renderOrder={-1}>
        <spriteMaterial
          map={glow}
          color={EMERALD}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <group ref={vault} rotation={[0.05, -0.5, 0]}>
        {/* door body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.52, 96]} />
          <meshStandardMaterial {...metalDark} />
        </mesh>
        {/* heavy rim */}
        <mesh>
          <torusGeometry args={[1.85, 0.22, 32, 128]} />
          <meshStandardMaterial {...metalMid} />
        </mesh>
        {/* emerald edge line */}
        <mesh>
          <torusGeometry args={[2.07, 0.035, 16, 160]} />
          <meshBasicMaterial color={EMERALD} toneMapped={false} />
        </mesh>

        <Face />
        <Face flip />
      </group>

      <mesh ref={ringA} rotation={[1.25, 0.25, 0]}>
        <torusGeometry args={[3.5, 0.035, 16, 160]} />
        <meshBasicMaterial color={EMERALD} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[0.55, 1.0, 0.3]}>
        <torusGeometry args={[4.2, 0.03, 16, 180]} />
        <meshBasicMaterial color={BLUE} toneMapped={false} />
      </mesh>

      {particles && (
        <points ref={dots}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={positions.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            map={glow}
            color="#7dffd2"
            size={0.18}
            sizeAttenuation
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

/* ───────────────────────── Adaptive quality ───────────────────────── */

/** Measures real frame times after warm-up and asks for a cheaper render if the device struggles. */
function PerfGuard({ onLow }: { onLow: (level: 1 | 2) => void }) {
  const st = useRef({ frames: 0, sum: 0, n: 0, done: false });

  useFrame((_, delta) => {
    const a = st.current;
    if (a.done) return;
    a.frames++;
    if (a.frames < 40) return; // skip shader-compile hitches
    if (delta > 0.25) return;
    a.n++;
    a.sum += delta;
    if (a.n >= 90) {
      a.done = true;
      const avg = a.sum / a.n;
      if (avg > 0.034) onLow(2); // under ~30 fps
      else if (avg > 0.0215) onLow(1); // under ~46 fps
    }
  });

  return null;
}

/* ───────────────────────── Canvas ───────────────────────── */

function initialDpr(): number {
  if (typeof window === 'undefined') return 1;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
}

export default function Scene() {
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState<0 | 1 | 2>(0);
  const [dpr, setDpr] = useState<number>(initialDpr);

  const onLow = (level: 1 | 2) => {
    setQuality(level);
    setDpr(level === 1 ? 1 : 0.75);
  };

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 34, near: 0.5, far: 60, position: [0, 0.8, 10.8] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={() => {
        requestAnimationFrame(() => setReady(true));
      }}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 1.2s ease' }}
    >
      <color attach="background" args={['#030406']} />

      <Environment />
      <ambientLight intensity={0.25} />
      <directionalLight position={[2, 7, 5]} intensity={1.4} />
      <directionalLight position={[-6, 3, 4]} intensity={1.6} color="#7dffd2" />
      <directionalLight position={[6, -2, 3]} intensity={1.2} color="#6fa8ff" />

      <World particles={quality < 2} />
      <PerfGuard onLow={onLow} />
    </Canvas>
  );
}
