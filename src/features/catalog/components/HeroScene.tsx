import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, MathUtils, Object3D } from "three";
import type { Group, InstancedMesh, Mesh, MeshStandardMaterial } from "three";
import type { SubjectId } from "../data/catalog.types";
import { orbits, scenePalette, type OrbitConfig } from "../hero.config";
import { HeroBackdrop } from "./HeroBackdrop";

type Palette = (typeof scenePalette)["light" | "dark"];
type Vec3 = [number, number, number];

type SceneProps = {
  dark: boolean;
  active: SubjectId | null;
};

type Props = SceneProps & {
  eventSource: HTMLElement;
  animate: boolean;
};

const NUCLEON_COUNT = 18;
const CRYSTAL_COUNT = 42;
const DUST_COUNT = 700;
const GOLDEN_ANGLE = 2.399963;

// Deterministic generator so the scene is identical on every render.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Nucleus({ palette }: { palette: Palette }) {
  const group = useRef<Group>(null);
  const nucleons = useMemo(
    () =>
      Array.from({ length: NUCLEON_COUNT }, (_, index) => {
        const y = 1 - (index / (NUCLEON_COUNT - 1)) * 2;
        const ring = Math.sqrt(1 - y * y);
        const theta = index * GOLDEN_ANGLE;
        const position: Vec3 = [
          Math.cos(theta) * ring * 0.45,
          y * 0.45,
          Math.sin(theta) * ring * 0.45,
        ];
        return { position, proton: index % 2 === 0 };
      }),
    [],
  );
  useFrame(({ clock }, delta) => {
    const node = group.current;
    if (!node) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.8) * 0.05;
    node.scale.setScalar(pulse);
    node.rotation.y += delta * 0.4;
    node.rotation.x += delta * 0.15;
  });
  return (
    <group ref={group}>
      {nucleons.map(({ position, proton }) => (
        <mesh key={position.join()} position={position}>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial
            color={proton ? palette.proton : palette.neutron}
            emissive={proton ? palette.proton : palette.neutron}
            emissiveIntensity={proton ? 0.45 : 0.12}
            roughness={0.28}
            metalness={0.25}
          />
        </mesh>
      ))}
      <pointLight color={palette.proton} intensity={18} distance={7} />
    </group>
  );
}

function Orbit({
  orbit,
  dark,
  highlighted,
  dimmed,
}: {
  orbit: OrbitConfig;
  dark: boolean;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const color = dark ? orbit.color.dark : orbit.color.light;
  const ring = useRef<MeshStandardMaterial>(null);
  const electrons = useRef<Array<Mesh | null>>([]);
  const phases = [0, Math.PI];
  useFrame(({ clock }, delta) => {
    const angleBase = clock.elapsedTime * orbit.speed;
    phases.forEach((phase, index) => {
      const electron = electrons.current[index];
      if (!electron) return;
      const angle = angleBase + phase;
      electron.position.set(
        Math.cos(angle) * orbit.radius,
        Math.sin(angle) * orbit.radius,
        0,
      );
      electron.scale.setScalar(
        MathUtils.damp(electron.scale.x, highlighted ? 1.8 : 1, 6, delta),
      );
    });
    const material = ring.current;
    if (material) {
      const target = highlighted ? 2.2 : dimmed ? 0.12 : 0.6;
      material.emissiveIntensity = MathUtils.damp(
        material.emissiveIntensity,
        target,
        6,
        delta,
      );
      material.opacity = MathUtils.damp(
        material.opacity,
        dimmed ? 0.3 : 0.9,
        6,
        delta,
      );
    }
  });
  return (
    <group rotation={orbit.tilt}>
      <mesh>
        <torusGeometry args={[orbit.radius, 0.02, 12, 200]} />
        <meshStandardMaterial
          ref={ring}
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>
      {phases.map((phase, index) => (
        <mesh
          key={phase}
          ref={(node) => {
            electrons.current[index] = node;
          }}
        >
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.6}
            roughness={0.2}
          />
          <mesh>
            <sphereGeometry args={[0.34, 24, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}

function Crystals({ dark }: { dark: boolean }) {
  const mesh = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  useEffect(() => {
    const instances = mesh.current;
    if (!instances) return;
    const random = seeded(7);
    const dummy = new Object3D();
    const tint = new Color();
    for (let index = 0; index < CRYSTAL_COUNT; index += 1) {
      const radius = 4.6 + random() * 2;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      dummy.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi) * 0.7,
        radius * Math.sin(phi) * Math.sin(theta),
      );
      dummy.rotation.set(random() * 3, random() * 3, random() * 3);
      dummy.scale.setScalar(0.4 + random() * 0.8);
      dummy.updateMatrix();
      instances.setMatrixAt(index, dummy.matrix);
      const orbit = orbits[index % orbits.length];
      instances.setColorAt(
        index,
        tint.set(dark ? orbit.color.dark : orbit.color.light),
      );
    }
    instances.instanceMatrix.needsUpdate = true;
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
  }, [dark]);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y -= delta * 0.05;
  });
  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, CRYSTAL_COUNT]}>
        <octahedronGeometry args={[0.16]} />
        <meshStandardMaterial roughness={0.25} metalness={0.5} />
      </instancedMesh>
    </group>
  );
}

function Dust({ palette, dark }: { palette: Palette; dark: boolean }) {
  const points = useRef<Group>(null);
  const positions = useMemo(() => {
    const random = seeded(21);
    const array = new Float32Array(DUST_COUNT * 3);
    for (let index = 0; index < DUST_COUNT; index += 1) {
      const radius = 5 + random() * 9;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      array[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[index * 3 + 1] = radius * Math.cos(phi) * 0.6;
      array[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return array;
  }, []);
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.02;
  });
  return (
    <group ref={points}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={palette.dust}
          size={0.045}
          sizeAttenuation
          transparent
          opacity={dark ? 0.8 : 0.6}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Atom({ dark, active }: SceneProps) {
  const palette = dark ? scenePalette.dark : scenePalette.light;
  const viewport = useThree((state) => state.viewport);
  const rig = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const shell = useRef<Group>(null);
  const wide = viewport.width > viewport.height * 1.15;
  const scale = wide
    ? Math.min(1.1, viewport.height / 8.6)
    : Math.min(1, viewport.width / 10.5);
  const position: Vec3 = wide
    ? [viewport.width * 0.26, 0, 0]
    : [0, viewport.height * 0.27, 0];
  useFrame((state, delta) => {
    const node = rig.current;
    if (node) {
      node.rotation.y = MathUtils.damp(
        node.rotation.y,
        state.pointer.x * 0.5,
        3,
        delta,
      );
      node.rotation.x = MathUtils.damp(
        node.rotation.x,
        -state.pointer.y * 0.3,
        3,
        delta,
      );
    }
    if (spin.current) spin.current.rotation.y += delta * 0.18;
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.08;
      shell.current.rotation.z += delta * 0.04;
    }
  });
  return (
    <group position={position} scale={scale}>
      <group ref={rig}>
        <group ref={spin}>
          <Nucleus palette={palette} />
          {orbits.map((orbit) => (
            <Orbit
              key={orbit.subject}
              orbit={orbit}
              dark={dark}
              highlighted={active === orbit.subject}
              dimmed={active !== null && active !== orbit.subject}
            />
          ))}
        </group>
        <group ref={shell}>
          <mesh>
            <icosahedronGeometry args={[4.1, 1]} />
            <meshBasicMaterial
              color={palette.shell}
              wireframe
              transparent
              opacity={dark ? 0.14 : 0.12}
            />
          </mesh>
        </group>
        <Crystals dark={dark} />
        <Dust palette={palette} dark={dark} />
      </group>
    </group>
  );
}

export function HeroScene({ dark, active, eventSource, animate }: Props) {
  return (
    <Canvas
      frameloop={animate ? "always" : "demand"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={eventSource}
      eventPrefix="client"
      fallback={<HeroBackdrop />}
    >
      <ambientLight intensity={dark ? 0.9 : 1.5} />
      <directionalLight position={[5, 6, 8]} intensity={dark ? 2 : 2.6} />
      <directionalLight
        position={[-6, -3, -4]}
        intensity={1}
        color={dark ? "#38bdf8" : "#f59e0b"}
      />
      <Atom dark={dark} active={active} />
    </Canvas>
  );
}
