import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { MARK_PATH } from '@/ds/Mark';

/*
 * O "N em ponta" em 3D pro painel azul do login (técnica do login de Camelo, mxc/camelo-distribuidora):
 * o path do manual extrudado em metal cromado frio. Parado ele balança devagar; o mouse empurra e
 * ele gira, perde força no atrito e volta de frente.
 *
 * Duas armadilhas herdadas de Camelo:
 *  1. Metal quase espelho mostra o ambiente literalmente: painel de luz retangular vira LISTRA.
 *     O estúdio é feito de manchas redondas de queda suave.
 *  2. Sem soldar os vértices, cada tira da parede lateral fica com normal própria e o cromo listra.
 */

const CROMO = {
  depth: 16, // na unidade do path (caixa 66 × 92)
  bevel: 3.2,
  scale: 3.1,
  color: '#e6ecff', // levemente frio: no painel azul o cromo puxa pro azul do reflexo, não pro cinza
  roughness: 0.13,
  env: 3.6,
  exposure: 1.2,
  yaw: -0.32,
  pitch: 0.08,
};

/** Path do manual (só M, Q, L, Z) → THREE.Shape, com o y virado (SVG cresce pra baixo). */
function shapeDoPath(d: string) {
  const s = new THREE.Shape();
  const tk = d.match(/[MQLZ]|-?\d*\.?\d+/g) ?? [];
  let i = 0;
  const n = () => Number(tk[i++]);
  while (i < tk.length) {
    const c = tk[i++];
    if (c === 'M') s.moveTo(n(), -n());
    else if (c === 'L') s.lineTo(n(), -n());
    else if (c === 'Q') {
      const cx = n(), cy = -n(), x = n(), y = -n();
      s.quadraticCurveTo(cx, cy, x, y);
    } else if (c === 'Z') s.closePath();
  }
  return s;
}

function geometria() {
  const g = new THREE.ExtrudeGeometry(shapeDoPath(MARK_PATH), {
    depth: CROMO.depth,
    bevelEnabled: true,
    bevelThickness: CROMO.bevel,
    bevelSize: CROMO.bevel * 0.7,
    bevelSegments: 8,
    curveSegments: 16,
  });
  let out: THREE.BufferGeometry = g;
  try {
    out = mergeVertices(g, 1e-3);
  } catch {
    /* fica a original */
  }
  out.computeVertexNormals();
  out.center();
  out.computeBoundingBox();
  const size = new THREE.Vector3();
  out.boundingBox!.getSize(size);
  const k = CROMO.scale / Math.max(size.x, size.y);
  out.scale(k, k, k);
  return out;
}

/** Estúdio escuro com poucos estouros de luz: é o contraste que faz o metal parecer metal. */
function texturaEstudio() {
  const W = 1024;
  const H = 512; // equirretangular: 2:1
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const base = ctx.createLinearGradient(0, 0, 0, H);
  // mais claro que o ouro de Camelo: cromo sobre azul precisa ler prata, e a faixa escura vira só o contorno
  base.addColorStop(0, '#f4f7ff');
  base.addColorStop(0.32, '#c3cfee');
  base.addColorStop(0.5, '#6f82c2');
  base.addColorStop(0.7, '#1a2763');
  base.addColorStop(0.86, '#2a44a8'); // rebote azul do painel
  base.addColorStop(1, '#0a1240');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const mancha = (cx: number, cy: number, r: number, rgb: string, a: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    for (const [t, k] of [[0, 1], [0.25, 0.88], [0.45, 0.62], [0.65, 0.33], [0.82, 0.12], [1, 0]]) {
      g.addColorStop(t, `rgba(${rgb},${(a * k).toFixed(3)})`);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  ctx.globalCompositeOperation = 'lighter';
  mancha(W * 0.26, H * 0.22, W * 0.055, '255,255,255', 1);
  mancha(W * 0.26, H * 0.22, W * 0.16, '235,242,255', 0.4);
  mancha(W * 0.6, H * 0.14, W * 0.038, '255,255,255', 0.95);
  mancha(W * 0.86, H * 0.34, W * 0.03, '230,238,255', 0.9);
  mancha(W * 0.44, H * 0.44, W * 0.026, '220,232,255', 0.8);
  mancha(W * 0.95, H * 0.56, W * 0.075, '90,130,255', 0.6); // contraluz azul da marca
  mancha(W * 0.05, H * 0.44, W * 0.055, '120,160,255', 0.5);
  mancha(W * 0.5, H * 0.86, W * 0.22, '40,80,220', 0.45);
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Estudio() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const src = texturaEstudio();
    const env = pmrem.fromEquirectangular(src).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      src.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

const TAU = Math.PI * 2;
// arrasto empurra (vira velocidade), atrito freia, e só volta pro repouso quando já está devagar
const FLICK = { toSpin: 0.02, toTumble: 0.013, maxPixels: 320, maxSpin: 15, drag: 1.25, settle: 2.8, calmBelow: 1.2 };
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

function Marca() {
  const geo = useMemo(geometria, []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(CROMO.color),
        metalness: 1,
        roughness: CROMO.roughness,
        envMapIntensity: CROMO.env,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      }),
    [],
  );
  const tilt = useRef<THREE.Group>(null);
  const idle = useRef<THREE.Group>(null);
  const drag = useRef({ x: 0, y: 0, vYaw: 0, vPitch: 0, yaw: 0, pitch: 0 });
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const m = drag.current;
    if (idle.current && !reduced) {
      m.vYaw = clamp(m.vYaw + clamp(m.x, FLICK.maxPixels) * FLICK.toSpin, FLICK.maxSpin);
      m.vPitch = clamp(m.vPitch + clamp(m.y, FLICK.maxPixels) * FLICK.toTumble, FLICK.maxSpin * 0.5);
      m.x = 0;
      m.y = 0;
      m.yaw += m.vYaw * d;
      m.pitch += m.vPitch * d;
      const f = Math.exp(-FLICK.drag * d);
      m.vYaw *= f;
      m.vPitch *= f;
      const volta = (a: number, v: number) => a + (Math.round(a / TAU) * TAU - a) * FLICK.settle * d * (1 - Math.min(1, Math.abs(v) / FLICK.calmBelow));
      m.yaw = volta(m.yaw, m.vYaw);
      m.pitch = volta(m.pitch, m.vPitch);
      // frequências "quebradas" pra o balanço nunca repetir o desenho
      idle.current.rotation.y = m.yaw + Math.sin(t * 0.42) * 0.3 + Math.sin(t * 0.19 + 1) * 0.12;
      idle.current.rotation.x = m.pitch + Math.sin(t * 0.33 + 1) * 0.11;
      idle.current.rotation.z = Math.sin(t * 0.27 + 2) * 0.06;
      idle.current.position.y = Math.sin(t * 0.55) * 0.12;
    }
    if (tilt.current && !reduced) {
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, -0.05 + state.pointer.y * 0.18, 4, d);
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, state.pointer.x * 0.18, 4, d);
    }
  });

  return (
    <group
      ref={tilt}
      onPointerMove={(e) => {
        drag.current.x += e.nativeEvent.movementX;
        drag.current.y += e.nativeEvent.movementY;
      }}
    >
      <group ref={idle}>
        <group rotation={[CROMO.pitch, CROMO.yaw, 0]}>
          <mesh geometry={geo} material={mat} />
        </group>
      </group>
    </group>
  );
}

export default function Logo3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.4], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: CROMO.exposure }}
      style={{ width: '100%', height: '100%' }}
    >
      <Estudio />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={0.6} color="#f2f5ff" />
      <directionalLight position={[-5, -1, 3]} intensity={0.25} color="#9db6ff" />
      <Marca />
    </Canvas>
  );
}
