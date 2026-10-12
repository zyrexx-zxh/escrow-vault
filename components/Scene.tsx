'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { scrollState } from '@/lib/scrollState';

/* ───────────────────────── Palette & materials ───────────────────────── */

// Colours multiplied above 1.0 become HDR, which is what makes the Bloom pass glow.
const EMERALD = new THREE.Color('#10f2a5').multiplyScalar(3.4);
const EMERALD_SOFT = new THREE.Color('#10f2a5').multiplyScalar(1.7);
const BLUE = new THREE.Color('#3b8bff').multiplyScalar(3.2);

const bodyMetal = {
  color: '#0b0e12',
  metalness: 1,
  roughness: 0.3,
  clearcoat: 1,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.2,
} as const;

const frameMetal = {
  color: '#14181e',
  metalness: 1,
  roughness: 0.2,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.5,
} as const;

const plateMetal = {
  color: '#1a1f27',
  metalness: 1,
  roughness: 0.22,
  clearcoat: 0.6,
  clearcoatRoughness: 0.25,
  envMapIntensity: 1.4,
} as const;

const boltMetal = {
  color: '#3a424d',
  metalness: 1,
  roughness: 0.25,
  envMapIntensity: 1.6,
} as const;

/* ───────────────────────── Vault ───────────────────────── */

/** One face of the vault door: bolts, a glowing ring and a slowly turning ship-wheel dial. */
function VaultFace({ side }: { side: 1 | -1 }) {
  const dial = useRef<THREE.Group>(null);

  const bolts = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return { key: i, x: Math.cos(a) * 1.62, y: Math.sin(a) * 1.62 };
      }),
    [],
  );

  const ticks = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return { key: i, x: Math.cos(a) * 1.05, y: Math.sin(a) * 1.05, a, major: i % 4 === 0 };
      }),
    [],
  );

  const spokeAngles = [0, Math.PI / 3, (2 * Math.PI) / 3];

  useFrame((_, dt) => {
    if (dial.current) dial.current.rotation.z -= dt * 0.28;
  });

  return (
    <group position={[0, 0, 0.3 * side]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
      {/* raised face plate */}
      <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.55, 0.05, 96]} />
        <meshPhysicalMaterial {...plateMetal} />
      </mesh>

      {/* glowing inner ring */}
      <mesh position={[0, 0, 0.045]}>
        <torusGeometry args={[1.32, 0.016, 16, 200]} />
        <meshBasicMaterial color={EMERALD} toneMapped={false} />
      </mesh>

      {/* bolts */}
      {bolts.map((b) => (
        <mesh key={b.key} position={[b.x, b.y, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.08, 20]} />
          <meshPhysicalMaterial {...boltMetal} />
        </mesh>
      ))}

      {/* rotating dial */}
      <group ref={dial} position={[0, 0, 0.08]}>
        {/* tick marks */}
        {ticks.map((t) => (
          <mesh key={t.key} position={[t.x, t.y, 0]} rotation={[0, 0, t.a - Math.PI / 2]}>
            <boxGeometry args={[t.major ? 0.022 : 0.012, t.major ? 0.12 : 0.07, 0.02]} />
            {t.major ? (
              <meshBasicMaterial color={EMERALD_SOFT} toneMapped={false} />
            ) : (
              <meshStandardMaterial color="#5a6470" metalness={0.9} roughness={0.35} />
            )}
          </mesh>
        ))}

        {/* wheel ring */}
        <mesh position={[0, 0, 0.03]}>
          <torusGeometry args={[0.7, 0.04, 24, 120]} />
          <meshPhysicalMaterial {...frameMetal} />
        </mesh>

        {/* spokes + knobs */}
        {spokeAngles.map((a) => (
          <group key={a}>
            <mesh position={[0, 0, 0.03]} rotation={[0, 0, a - Math.PI / 2]}>
              <boxGeometry args={[0.07, 1.4, 0.06]} />
              <meshPhysicalMaterial {...frameMetal} />
            </mesh>
            {[0, Math.PI].map((o) => (
              <mesh
                key={o}
                position={[Math.cos(a + o) * 0.8, Math.sin(a + o) * 0.8, 0.03]}
              >
                <sphereGeometry args={[0.075, 24, 24]} />
                <meshPhysicalMaterial {...boltMetal} />
              </mesh>
            ))}
          </group>
        ))}

        {/* hub */}
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.2, 48]} />
          <meshPhysicalMaterial {...frameMetal} />
        </mesh>
        <mesh position={[0, 0, 0.165]}>
          <circleGeometry args={[0.12, 48]} />
          <meshBasicMaterial color={EMERALD} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Vault() {
  const group = useRef<THREE.Group>(null);

  const lugs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return { key: i, a, x: Math.cos(a) * 2.38, y: Math.sin(a) * 2.38 };
      }),
    [],
  );

  // Slow, continuous rotation
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.1;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.45} floatingRange={[-0.08, 0.08]}>
      <group ref={group} rotation={[0.05, -0.55, 0]}>
        {/* door body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.88, 1.88, 0.6, 128]} />
          <meshPhysicalMaterial {...bodyMetal} />
        </mesh>

        {/* heavy outer frame */}
        <mesh>
          <torusGeometry args={[2.0, 0.26, 48, 160]} />
          <meshPhysicalMaterial {...frameMetal} />
        </mesh>

        {/* emerald rim light */}
        <mesh>
          <torusGeometry args={[2.27, 0.012, 12, 220]} />
          <meshBasicMaterial color={EMERALD} toneMapped={false} />
        </mesh>

        {/* locking lugs */}
        {lugs.map((l) => (
          <mesh key={l.key} position={[l.x, l.y, 0]} rotation={[0, 0, l.a]}>
            <boxGeometry args={[0.24, 0.36, 0.42]} />
            <meshPhysicalMaterial {...plateMetal} />
          </mesh>
        ))}

        {/* hinge pins */}
        {[0.95, -0.95].map((y) => (
          <mesh key={y} position={[-2.32, y, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.7, 24]} />
            <meshPhysicalMaterial {...boltMetal} />
          </mesh>
        ))}

        <VaultFace side={1} />
        <VaultFace side={-1} />
      </group>
    </Float>
  );
}

/* ───────────────────────── Floating rings ───────────────────────── */

function Rings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const c = useRef<THREE.Mesh>(null);
  const d = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (a.current) {
      a.current.rotation.x += dt * 0.18;
      a.current.rotation.y += dt * 0.06;
    }
    if (b.current) {
      b.current.rotation.y -= dt * 0.14;
      b.current.rotation.z += dt * 0.05;
    }
    if (c.current) {
      c.current.rotation.z += dt * 0.08;
      c.current.rotation.x -= dt * 0.04;
    }
    if (d.current) {
      d.current.rotation.x += dt * 0.05;
      d.current.rotation.z -= dt * 0.07;
    }
  });

  return (
    <group>
      <mesh ref={a} rotation={[1.2, 0.2, 0]}>
        <torusGeometry args={[3.5, 0.012, 16, 220]} />
        <meshBasicMaterial color={EMERALD} toneMapped={false} />
      </mesh>
      <mesh ref={b} rotation={[0.4, 1.1, 0.3]}>
        <torusGeometry args={[4.3, 0.01, 16, 260]} />
        <meshBasicMaterial color={BLUE} toneMapped={false} />
      </mesh>
      <mesh ref={c} rotation={[2.1, 0.5, 0.8]}>
        <torusGeometry args={[5.2, 0.008, 16, 300]} />
        <meshBasicMaterial color={EMERALD_SOFT} toneMapped={false} />
      </mesh>
      {/* a chunkier dark-metal ring so the glow has something to catch on */}
      <mesh ref={d} rotation={[1.0, 0.9, 0.2]}>
        <torusGeometry args={[3.0, 0.06, 32, 200]} />
        <meshPhysicalMaterial {...frameMetal} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── Lighting ───────────────────────── */

function Lights() {
  return (
    <>
      {/* Procedural studio environment: no network or HDR download needed */}
      <Environment resolution={256} frames={1}>
        <group rotation={[0, 0.4, 0]}>
          {/* big soft top box */}
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#ffffff"
            position={[0, 6, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[14, 6, 1]}
          />
          {/* emerald strip, left */}
          <Lightformer
            form="rect"
            intensity={3}
            color="#10f2a5"
            position={[-7, 1, 2]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[8, 3, 1]}
          />
          {/* blue strip, right */}
          <Lightformer
            form="rect"
            intensity={3}
            color="#3b8bff"
            position={[7, 0, -3]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[8, 3, 1]}
          />
          {/* rim ring behind */}
          <Lightformer
            form="ring"
            intensity={2.4}
            color="#ffffff"
            position={[0, 1, -8]}
            scale={6}
          />
          {/* front fill */}
          <Lightformer
            form="circle"
            intensity={1.4}
            color="#dfe9ff"
            position={[0, 0, 9]}
            rotation={[0, Math.PI, 0]}
            scale={5}
          />
        </group>
      </Environment>

      <ambientLight intensity={0.15} />
      <spotLight position={[6, 8, 6]} angle={0.35} penumbra={1} intensity={120} color="#bfffe8" />
      <pointLight position={[-6, -2, 4]} intensity={40} color="#3b8bff" />
    </>
  );
}

/* ───────────────────────── Scroll-driven camera ───────────────────────── */

// Camera flies in, circles the vault, then pulls back out as you scroll.
const CAM_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.0, 0.5, 10.5), // hero
    new THREE.Vector3(0.0, 0.3, 7.0), // fly in
    new THREE.Vector3(2.8, 0.9, 5.0),
    new THREE.Vector3(5.8, 0.8, 1.0), // right side
    new THREE.Vector3(4.6, 1.8, -4.8),
    new THREE.Vector3(0.0, 2.4, -7.2), // behind
    new THREE.Vector3(-5.2, 1.2, -3.2),
    new THREE.Vector3(-6.0, 0.4, 2.2), // left side
    new THREE.Vector3(-1.8, 0.7, 8.8),
    new THREE.Vector3(0.0, 0.8, 11.5), // footer
  ],
  false,
  'centripetal',
);

function CameraRig() {
  const smooth = useRef(0);
  const mouse = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  // Pointer parallax (the canvas itself ignores pointer events so the UI stays clickable)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, dt) => {
    smooth.current = THREE.MathUtils.damp(smooth.current, scrollState.progress, 4.5, dt);
    const t = THREE.MathUtils.clamp(smooth.current, 0, 1);

    const aspect = state.size.width / state.size.height;
    const portrait = aspect < 0.9;

    CAM_PATH.getPointAt(t, pos);
    if (portrait) pos.multiplyScalar(1.5); // pull back on phones so the vault fits

    const m = mouse.current;
    m.sx = THREE.MathUtils.damp(m.sx, m.x, 3, dt);
    m.sy = THREE.MathUtils.damp(m.sy, m.y, 3, dt);
    pos.x += m.sx * 0.5;
    pos.y += m.sy * 0.3;

    look.set(0, Math.sin(t * Math.PI * 2) * 0.2, 0);

    // In the hero, shift the look-at so the vault sits right of the headline (or above it on phones)
    const hero = 1 - THREE.MathUtils.smoothstep(t, 0, 0.2);
    if (aspect > 1.25) look.x -= 2.1 * hero;
    else look.y -= (portrait ? 1.7 : 0.8) * hero;

    state.camera.position.copy(pos);
    state.camera.lookAt(look);
  });

  return null;
}

/* ───────────────────────── Canvas ───────────────────────── */

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.5, 10.5], fov: 36, near: 0.1, far: 100 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#030406']} />
      <fog attach="fog" args={['#030406', 12, 38]} />

      <Suspense fallback={null}>
        <Lights />
        <Vault />
        <Rings />
        <Sparkles count={140} scale={[16, 9, 16]} size={2.2} speed={0.25} opacity={0.6} color="#7dffd2" />
        <Sparkles count={50} scale={[12, 7, 12]} size={3} speed={0.18} opacity={0.5} color="#6fa8ff" />
        <CameraRig />

        <EffectComposer multisampling={4}>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={1}
            luminanceSmoothing={0.15}
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
