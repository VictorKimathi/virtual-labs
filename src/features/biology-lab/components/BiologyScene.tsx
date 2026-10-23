import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
import type { Camera } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { PlacedBiologyEquipment } from "../equipment.types";
import { BiologyEquipmentModel } from "./BiologyEquipmentModel";

function CameraControls({ enabled }: { enabled: boolean }) {
  const { camera, gl, invalidate } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 0, 0);
    const onChange = () => invalidate();
    controls.addEventListener("change", onChange);
    controls.update();
    controlsRef.current = controls;
    return () => {
      controls.removeEventListener("change", onChange);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.enabled = enabled;
  }, [enabled]);
  return null;
}

type Props = {
  equipment: PlacedBiologyEquipment[];
  selectedId: string | null;
  draggingId: string | null;
  fallback: ReactNode;
  onCameraReady: (camera: Camera) => void;
  onSelect: (id: string | null) => void;
  onDragStart: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
  onDragEnd: () => void;
};

export function BiologyScene({
  equipment,
  selectedId,
  draggingId,
  fallback,
  onCameraReady,
  onSelect,
  onDragStart,
  onMove,
  onDragEnd,
}: Props) {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [7, 7, 9], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      fallback={fallback}
      onCreated={({ camera }) => onCameraReady(camera)}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#edf4e8"]} />
      <ambientLight intensity={1.7} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[10, 0.3, 8]} />
        <meshStandardMaterial color="#e5ebe1" roughness={0.85} />
      </mesh>
      <gridHelper
        args={[8, 16, "#b4c9a7", "#d2dfcb"]}
        position={[0, 0.005, 0]}
      />
      <mesh position={[0, -0.39, 0]}>
        <boxGeometry args={[10.3, 0.18, 8.3]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      {equipment.map((item) => (
        <BiologyEquipmentModel
          key={item.id}
          equipment={item}
          selected={selectedId === item.id}
          dragging={draggingId === item.id}
          onSelect={() => onSelect(item.id)}
          onDragStart={() => onDragStart(item.id)}
          onMove={(x, z) => onMove(item.id, x, z)}
          onDragEnd={onDragEnd}
        />
      ))}
      <CameraControls enabled={!draggingId} />
    </Canvas>
  );
}
