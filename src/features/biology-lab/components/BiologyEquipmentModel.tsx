import type { ThreeEvent } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
import type { PlacedBiologyEquipment } from "../equipment.types";

const benchPlane = new Plane(new Vector3(0, 1, 0), 0);
type CaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};

type Props = {
  equipment: PlacedBiologyEquipment;
  selected: boolean;
  dragging: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onMove: (x: number, z: number) => void;
  onDragEnd: () => void;
};

export function BiologyEquipmentModel({
  equipment,
  selected,
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
          <torusGeometry args={[0.75, 0.035, 8, 40]} />
          <meshBasicMaterial color="#006600" />
        </mesh>
      )}
      {equipment.kind === "microscope" && (
        <>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[1.3, 0.2, 0.95]} />
            <meshStandardMaterial color="#263b45" />
          </mesh>
          <mesh position={[0.32, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 1.25, 20]} />
            <meshStandardMaterial color="#d7e3e8" metalness={0.45} />
          </mesh>
          <mesh position={[-0.12, 0.58, 0]} castShadow>
            <boxGeometry args={[0.8, 0.09, 0.62]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[-0.22, 1.2, 0]} rotation={[0, 0, -0.38]} castShadow>
            <cylinderGeometry args={[0.19, 0.23, 0.8, 20]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.25} />
          </mesh>
          <mesh position={[-0.42, 1.54, 0]} rotation={[0, 0, -0.38]}>
            <cylinderGeometry args={[0.24, 0.24, 0.16, 20]} />
            <meshStandardMaterial color="#172a34" />
          </mesh>
        </>
      )}
      {equipment.kind === "slide" && (
        <>
          <mesh position={[0, 0.045, 0]} castShadow>
            <boxGeometry args={[1.25, 0.08, 0.5]} />
            <meshStandardMaterial color="#c6e7e8" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.095, 0]}>
            <boxGeometry args={[0.46, 0.025, 0.32]} />
            <meshStandardMaterial color="#65a30d" transparent opacity={0.8} />
          </mesh>
        </>
      )}
      {equipment.kind === "petri-dish" && (
        <>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.57, 0.57, 0.16, 32]} />
            <meshStandardMaterial color="#bdd9cf" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.54, 0.04, 8, 32]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0.12, 0.17, 0.08]}>
            <sphereGeometry args={[0.19, 16, 12]} />
            <meshStandardMaterial color="#84cc16" />
          </mesh>
        </>
      )}
      {equipment.kind === "dropper" && (
        <>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, -0.5]} castShadow>
            <cylinderGeometry args={[0.085, 0.05, 0.9, 16]} />
            <meshStandardMaterial color="#dbeafe" transparent opacity={0.85} />
          </mesh>
          <mesh position={[-0.27, 0.31, 0]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
        </>
      )}
    </group>
  );
}
