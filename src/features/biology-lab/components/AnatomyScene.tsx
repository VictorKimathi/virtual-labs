import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  Box3,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  type Material,
  type Object3D,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  anatomyGroupFor,
  type AnatomyGroup,
  type AnatomyView,
} from "../anatomy.types";
import {
  createMaterialFactory,
  highlightMaterial,
  shellStyle,
} from "./anatomyMaterials";

type PartMesh = {
  object: Object3D;
  origin: Vector3;
  originScale: Vector3;
  displayScale: number;
  group: Exclude<AnatomyGroup, "all">;
};

const groupOrder: Exclude<AnatomyGroup, "all">[] = [
  "muscular",
  "organs",
  "skeletal",
  "nervous",
  "lymphatic",
];
const gridColumns = 18;
const gridColumnWidth = 0.24;
const gridRowHeight = 0.23;
const gridGroupGap = 0.18;

function layoutParts(parts: PartMesh[], group: AnatomyGroup) {
  const activeGroups = group === "all" ? groupOrder : [group];
  const sections = activeGroups.map((activeGroup) => ({
    group: activeGroup,
    parts: parts
      .filter((part) => part.group === activeGroup)
      .sort(
        (a, b) =>
          b.origin.y - a.origin.y ||
          a.origin.x - b.origin.x ||
          a.object.name.localeCompare(b.object.name),
      ),
  }));
  const rowCount = sections.reduce(
    (total, section) => total + Math.ceil(section.parts.length / gridColumns),
    0,
  );
  const height =
    rowCount * gridRowHeight + (sections.length - 1) * gridGroupGap;
  let y = 0.9 + height / 2 - gridRowHeight / 2;
  const positions = new Map<string, Vector3>();
  for (const section of sections) {
    const rows = Math.ceil(section.parts.length / gridColumns);
    for (let row = 0; row < rows; row++) {
      const rowParts = section.parts.slice(
        row * gridColumns,
        (row + 1) * gridColumns,
      );
      rowParts.forEach((part, index) => {
        positions.set(
          part.object.name,
          new Vector3(
            (index - (rowParts.length - 1) / 2) * gridColumnWidth,
            y,
            0,
          ),
        );
      });
      y -= gridRowHeight;
    }
    y -= gridGroupGap;
  }
  return positions;
}

function setPartVisibility(
  parts: PartMesh[],
  group: AnatomyGroup,
  separation: number,
  showInside: boolean,
) {
  for (const part of parts) {
    part.object.visible =
      group === "all"
        ? separation > 0 ||
          (showInside ? part.group !== "muscular" : part.group === "muscular")
        : part.group === group;
  }
}

function setShellVisibility(shells: Mesh[], visible: boolean) {
  for (const shell of shells) shell.visible = visible;
}

const viewDirections: Record<AnatomyView, Vector3> = {
  front: new Vector3(0, 0.06, 1).normalize(),
  back: new Vector3(0, 0.06, -1).normalize(),
  side: new Vector3(1, 0.06, 0).normalize(),
  perspective: new Vector3(0.7, 0.22, 0.9).normalize(),
};
const assembledDistance = 4.2;
const controlsOffset = 0.12;
const targetHeight = 0.9;

function CameraControls({
  separation,
  group,
  view,
}: {
  separation: number;
  group: AnatomyGroup;
  view: AnatomyView;
}) {
  const { camera, gl, invalidate } = useThree();
  const size = useThree((state) => state.size);
  const controlsRef = useRef<OrbitControls | null>(null);
  const goal = useRef({
    direction: viewDirections.front.clone(),
    distance: assembledDistance,
    animating: false,
  });
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minDistance = 1.1;
    controls.maxDistance = 18;
    controls.target.set(0, targetHeight, 0);
    camera.position
      .copy(controls.target)
      .addScaledVector(viewDirections.front, assembledDistance);
    controls.update();
    const onChange = () => invalidate();
    const onStart = () => {
      goal.current.animating = false;
    };
    controls.addEventListener("change", onChange);
    controls.addEventListener("start", onStart);
    controlsRef.current = controls;
    return () => {
      controls.removeEventListener("change", onChange);
      controls.removeEventListener("start", onStart);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    // Lift the model clear of the floating control panel at any zoom level.
    camera.setViewOffset(
      size.width,
      size.height,
      0,
      size.height * controlsOffset,
      size.width,
      size.height,
    );
    invalidate();
    return () => camera.clearViewOffset();
  }, [camera, invalidate, size.height, size.width]);
  useEffect(() => {
    goal.current.direction.copy(viewDirections[view]);
    goal.current.animating = true;
    invalidate();
  }, [invalidate, view]);
  useEffect(() => {
    const expandedDistance =
      group === "all"
        ? 16.5
        : group === "skeletal"
          ? 6
          : group === "muscular"
            ? 7
            : 5.2;
    goal.current.distance =
      assembledDistance +
      (separation / 100) * (expandedDistance - assembledDistance);
    goal.current.animating = true;
    invalidate();
  }, [group, invalidate, separation]);
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    const current = goal.current;
    if (!controls || !current.animating) return;
    const offset = camera.position.clone().sub(controls.target);
    const distance = offset.length();
    const direction = offset.normalize();
    const turned = direction.lerp(current.direction, 1 - Math.exp(-6 * delta));
    const nextDistance = MathUtils.damp(distance, current.distance, 6, delta);
    camera.position
      .copy(controls.target)
      .addScaledVector(turned.normalize(), nextDistance);
    controls.update();
    const settled =
      turned.distanceToSquared(current.direction) < 0.00002 &&
      Math.abs(nextDistance - current.distance) < 0.004;
    if (settled) current.animating = false;
    invalidate();
  });
  return null;
}

function AnatomyModel({
  separation,
  group,
  showInside,
  selectedId,
  onSelect,
  onExplode,
  onLoaded,
}: {
  separation: number;
  group: AnatomyGroup;
  showInside: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExplode: () => void;
  onLoaded: () => void;
}) {
  const [body, muscles, cerebrum, cerebellum] = useLoader(GLTFLoader, [
    "/models/z-anatomy-1.2.0-full-body.glb",
    "/models/z-anatomy-1.4.0-muscular.glb",
    "/models/z-anatomy-cerebrum.glb",
    "/models/z-anatomy-cerebellum.glb",
  ]);
  const { invalidate } = useThree();
  const { scene, parts, shells } = useMemo(() => {
    const scene = body.scene.clone(true);
    const parts: PartMesh[] = [];
    const shells: Mesh[] = [];
    const gaps: Mesh[] = [];
    const enhance = createMaterialFactory();
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      if (object.userData.anatomySystem === "regional-anatomy") {
        const style = shellStyle(
          String(object.userData.sourceName ?? ""),
          object.position.y,
        );
        if (style) {
          object.material = enhance(object.material, style.look, style.color);
          shells.push(object);
        } else if (/urogenital/i.test(String(object.userData.sourceName))) {
          gaps.push(object);
        }
        object.visible = false;
        return;
      }
      object.material = enhance(
        object.material,
        object.userData.anatomySystem === "muscular" ? "fibre" : "smooth",
      );
      const origin = object.position.clone();
      object.geometry.computeBoundingBox();
      const size =
        object.geometry.boundingBox?.getSize(new Vector3()) ??
        new Vector3(0.1, 0.1, 0.1);
      const maxSize = Math.max(
        size.x * Math.abs(object.scale.x),
        size.y * Math.abs(object.scale.y),
        size.z * Math.abs(object.scale.z),
        0.001,
      );
      parts.push({
        object,
        origin,
        originScale: object.scale.clone(),
        displayScale: Math.min(12, Math.max(0.35, 0.16 / maxSize)),
        group: anatomyGroupFor(String(object.userData.anatomySystem)),
      });
    });
    if (gaps.length) {
      scene.updateMatrixWorld(true);
      const bounds = new Box3();
      for (const gap of gaps) bounds.expandByObject(gap);
      const centre = bounds.getCenter(new Vector3());
      const extent = bounds.getSize(new Vector3());
      const cover = new Mesh(
        new SphereGeometry(1, 24, 16),
        enhance(
          new MeshStandardMaterial({ roughness: 0.5 }),
          "fibre",
          "#9d2a25",
        ) as Material,
      );
      cover.position.set(centre.x, centre.y, centre.z - extent.z * 0.4);
      cover.scale.set(extent.x * 0.6, extent.y * 0.6, extent.z * 0.15);
      scene.add(cover);
      shells.push(cover);
    }
    for (const muscle of muscles.scene.children) {
      if (!(muscle instanceof Mesh)) continue;
      const object = muscle.clone();
      object.material = enhance(object.material, "fibre");
      scene.add(object);
      object.geometry.computeBoundingBox();
      const size =
        object.geometry.boundingBox?.getSize(new Vector3()) ??
        new Vector3(0.1, 0.1, 0.1);
      const maxSize = Math.max(
        size.x * Math.abs(object.scale.x),
        size.y * Math.abs(object.scale.y),
        size.z * Math.abs(object.scale.z),
        0.001,
      );
      parts.push({
        object,
        origin: object.position.clone(),
        originScale: object.scale.clone(),
        displayScale: Math.min(12, Math.max(0.35, 0.16 / maxSize)),
        group: "muscular",
      });
    }
    for (const brain of [
      { id: "brain-cerebrum", source: cerebrum.scene },
      { id: "brain-cerebellum", source: cerebellum.scene },
    ]) {
      const model = brain.source.clone(true);
      const bounds = new Box3().setFromObject(model);
      const origin = bounds.getCenter(new Vector3());
      const size = bounds.getSize(new Vector3());
      const wrapper = new Group();
      wrapper.name = brain.id;
      wrapper.position.copy(origin);
      model.position.sub(origin);
      model.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.userData.anatomyPartId = brain.id;
        object.material = enhance(object.material, "smooth");
      });
      wrapper.add(model);
      scene.add(wrapper);
      parts.push({
        object: wrapper,
        origin,
        originScale: wrapper.scale.clone(),
        displayScale: Math.min(
          12,
          Math.max(0.35, 0.16 / Math.max(size.x, size.y, size.z, 0.001)),
        ),
        group: "nervous",
      });
    }
    return { scene, parts, shells };
  }, [body.scene, muscles.scene, cerebrum.scene, cerebellum.scene]);
  const gridPositions = useMemo(
    () => layoutParts(parts, group),
    [parts, group],
  );

  useEffect(() => onLoaded(), [onLoaded]);

  useEffect(() => {
    setPartVisibility(parts, group, separation, showInside);
    setShellVisibility(
      shells,
      separation === 0 &&
        !showInside &&
        (group === "all" || group === "muscular"),
    );
    invalidate();
  }, [group, invalidate, parts, separation, shells, showInside]);

  useEffect(() => {
    if (!selectedId) return;
    const selected = parts.find(
      (part) => part.object.name === selectedId,
    )?.object;
    if (!selected) return;
    const highlighted: {
      mesh: Mesh;
      original: Material | Material[];
      copies: Material[];
    }[] = [];
    selected.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const original = object.material;
      const originals = Array.isArray(original) ? original : [original];
      const copies = originals.map(highlightMaterial);
      object.material = Array.isArray(original) ? copies : copies[0];
      highlighted.push({ mesh: object, original, copies });
    });
    invalidate();
    return () => {
      highlighted.forEach(({ mesh, original, copies }) => {
        mesh.material = original;
        copies.forEach((material) => material.dispose());
      });
      invalidate();
    };
  }, [invalidate, parts, selectedId]);

  useFrame((_, delta) => {
    const factor = 1 - Math.exp(-7 * delta);
    const target = new Vector3();
    const targetScale = new Vector3();
    const progress = Math.min(1, separation / 45);
    const spread = 0.72 + 0.28 * (separation / 100);
    let moving = false;
    for (const part of parts) {
      const slot = gridPositions.get(part.object.name);
      if (!slot) continue;
      target.set(slot.x * spread, 0.9 + (slot.y - 0.9) * spread, 0);
      target.lerpVectors(part.origin, target, progress);
      targetScale
        .copy(part.originScale)
        .multiplyScalar(1 + (part.displayScale - 1) * progress);
      if (part.object.position.distanceToSquared(target) > 0.000001) {
        part.object.position.lerp(target, factor);
        moving = true;
      } else {
        part.object.position.copy(target);
      }
      if (part.object.scale.distanceToSquared(targetScale) > 0.000001) {
        part.object.scale.lerp(targetScale, factor);
        moving = true;
      } else {
        part.object.scale.copy(targetScale);
      }
    }
    if (moving) invalidate();
  });

  return (
    <primitive
      object={scene}
      onClick={(event: {
        stopPropagation: () => void;
        object: { name: string; userData: { anatomyPartId?: string } };
      }) => {
        event.stopPropagation();
        if (separation === 0) onExplode();
        else onSelect(event.object.userData.anatomyPartId ?? event.object.name);
      }}
    />
  );
}

export function AnatomyScene({
  separation,
  group,
  view,
  showInside,
  selectedId,
  fallback,
  onSelect,
  onExplode,
  onLoaded,
}: {
  separation: number;
  group: AnatomyGroup;
  view: AnatomyView;
  showInside: boolean;
  selectedId: string | null;
  fallback: ReactNode;
  onSelect: (id: string | null) => void;
  onExplode: () => void;
  onLoaded: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0, 1, 4.2], fov: 38, near: 0.01, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={fallback}
      onPointerMissed={() => onSelect(null)}
    >
      <hemisphereLight args={["#dbeafe", "#3b0d0d", 0.9]} />
      <directionalLight
        position={[2.5, 4, 4]}
        intensity={2.6}
        color="#fff1e6"
      />
      <directionalLight
        position={[-3, 1.5, 2]}
        intensity={0.8}
        color="#93c5fd"
      />
      <directionalLight
        position={[-2, 3, -4]}
        intensity={2.2}
        color="#7dd3fc"
      />
      <directionalLight position={[3, 1, -3]} intensity={1.2} color="#fca5a5" />
      <AnatomyModel
        separation={separation}
        group={group}
        showInside={showInside}
        selectedId={selectedId}
        onSelect={onSelect}
        onExplode={onExplode}
        onLoaded={onLoaded}
      />
      <CameraControls separation={separation} group={group} view={view} />
    </Canvas>
  );
}
