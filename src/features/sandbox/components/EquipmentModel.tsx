import type { ThreeEvent } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
import type { PlacedEquipment } from "../equipment.types";

const benchPlane = new Plane(new Vector3(0, 1, 0), 0);
type CaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};

type Props = {
  equipment: PlacedEquipment;
  selected: boolean;
  running: boolean;
  dragging: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onMove: (x: number, z: number) => void;
  onDragEnd: () => void;
};

export function EquipmentModel({
  equipment,
  selected,
  running,
  dragging,
  onSelect,
  onDragStart,
  onMove,
  onDragEnd,
}: Props) {
  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    (event.target as CaptureTarget | null)?.setPointerCapture(event.pointerId);
    onSelect();
    onDragStart();
  }
  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!dragging) return;
    event.stopPropagation();
    const point = new Vector3();
    if (event.ray.intersectPlane(benchPlane, point)) onMove(point.x, point.z);
  }
  function handlePointerUp(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    (event.target as CaptureTarget | null)?.releasePointerCapture(
      event.pointerId,
    );
    onDragEnd();
  }
  return (
    <group
      position={[equipment.x, 0, equipment.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={onDragEnd}
      onLostPointerCapture={onDragEnd}
    >
      {selected && (
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.035, 8, 40]} />
          <meshBasicMaterial color="#006600" />
        </mesh>
      )}
      {equipment.kind === "cell" && (
        <>
          <mesh position={[0, 0.46, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.82, 24]} />
            <meshStandardMaterial
              color="#bb0000"
              metalness={0.25}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0.88, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 20]} />
            <meshStandardMaterial
              color="#d9e2e7"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 24]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </>
      )}
      {equipment.kind === "bulb" && (
        <>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.31, 0.22, 24]} />
            <meshStandardMaterial
              color="#94a3b8"
              metalness={0.75}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[0.4, 24, 16]} />
            <meshStandardMaterial
              color={running ? "#facc15" : "#fde68a"}
              emissive={running ? "#f59e0b" : "#000000"}
              emissiveIntensity={running ? 0.9 : 0}
              transparent
              opacity={0.9}
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.26, 12]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        </>
      )}
      {equipment.kind === "switch" && (
        <>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[1.15, 0.18, 0.6]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[-0.34, 0.28, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.24, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.65} />
          </mesh>
          <mesh position={[0.34, 0.28, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.24, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, -0.25]} castShadow>
            <boxGeometry args={[0.78, 0.09, 0.12]} />
            <meshStandardMaterial color="#bb0000" metalness={0.4} />
          </mesh>
        </>
      )}
      {equipment.kind === "wire" && (
        <>
          <mesh
            position={[0, 0.11, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow
          >
            <torusGeometry args={[0.48, 0.065, 10, 36, Math.PI * 1.7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          <mesh position={[0.44, 0.1, -0.2]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color="#d97706" metalness={0.65} />
          </mesh>
        </>
      )}
      {(equipment.kind === "ammeter" || equipment.kind === "voltmeter") && (
        <>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.92, 0.48, 0.7]} />
            <meshStandardMaterial
              color={equipment.kind === "ammeter" ? "#2563eb" : "#15803d"}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0.525, 0]}>
            <boxGeometry args={[0.66, 0.025, 0.42]} />
            <meshStandardMaterial color="#eff6ff" />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.48, 0.03, 0.08]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[-0.28, 0.55, 0.28]}>
            <sphereGeometry args={[0.07, 12, 8]} />
            <meshStandardMaterial color="#bb0000" />
          </mesh>
          <mesh position={[0.28, 0.55, 0.28]}>
            <sphereGeometry args={[0.07, 12, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </>
      )}
    </group>
  );
}
