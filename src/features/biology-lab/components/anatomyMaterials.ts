import {
  Color,
  MeshStandardMaterial,
  type Material,
  type WebGLProgramParametersWithUniforms,
} from "three";

export type AnatomyLook = "fibre" | "smooth";

type ShellStyle = { color: string; look: AnatomyLook };

const noiseChunk = /* glsl */ `
varying vec3 vLocal;
float anHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float anNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(anHash(i), anHash(i + vec2(1.0, 0.0)), f.x),
    mix(anHash(i + vec2(0.0, 1.0)), anHash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
`;

const fibreColorChunk = /* glsl */ `
float anAcross = vLocal.x * 310.0 + vLocal.z * 270.0;
float anAlong = vLocal.y * 22.0;
float anStrands = anNoise(vec2(anAcross, anAlong)) * 0.6
  + anNoise(vec2(anAcross * 2.3, anAlong * 2.1)) * 0.4;
float anBundles = anNoise(vec2((vLocal.x + vLocal.z) * 38.0, vLocal.y * 7.0));
diffuseColor.rgb *= 0.74 + 0.32 * anStrands + 0.14 * anBundles;
`;

const fibreRoughnessChunk = /* glsl */ `
roughnessFactor = clamp(roughnessFactor - 0.14 * anStrands, 0.2, 1.0);
`;

const rimChunk = /* glsl */ `
float anRim = pow(
  1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0),
  2.4
);
totalEmissiveRadiance += diffuseColor.rgb * anRim * 0.4;
`;

function patch(material: MeshStandardMaterial, look: AnatomyLook) {
  material.userData.anatomyLook = look;
  material.customProgramCacheKey = () => `anatomy-${look}`;
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLocal = position;",
      );
    let fragment = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>\n${noiseChunk}`,
    );
    if (look === "fibre") {
      fragment = fragment
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>\n${fibreColorChunk}`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>\n${fibreRoughnessChunk}`,
        );
    }
    shader.fragmentShader = fragment.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>\n${rimChunk}`,
    );
  };
}

/** Returns a patched copy of a material; copies are cached per source/colour/look. */
export function createMaterialFactory() {
  const cache = new Map<string, Material | Material[]>();
  return function enhance(
    source: Material | Material[],
    look: AnatomyLook,
    color?: string,
  ): Material | Material[] {
    const sources = Array.isArray(source) ? source : [source];
    const key = `${sources.map((item) => item.uuid).join("+")}|${color ?? ""}|${look}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const copies = sources.map((item) => {
      const copy = item.clone();
      if (copy instanceof MeshStandardMaterial) {
        if (color) copy.color.set(color);
        else if (look === "fibre") copy.color.offsetHSL(0, 0.18, -0.12);
        patch(copy, look);
      }
      return copy;
    });
    const result = Array.isArray(source) ? copies : copies[0];
    cache.set(key, result);
    return result;
  };
}

/** Clone a (possibly patched) material with a yellow selection glow. */
export function highlightMaterial(source: Material): Material {
  const copy = source.clone();
  if (copy instanceof MeshStandardMaterial) {
    const look = source.userData.anatomyLook as AnatomyLook | undefined;
    if (look) patch(copy, look);
    copy.emissive.set("#facc15");
    copy.emissiveIntensity = 0.8;
  }
  return copy;
}

function hashName(name: string) {
  let hash = 2166136261;
  for (let index = 0; index < name.length; index++) {
    hash ^= name.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

const hiddenRegions =
  /urogenital|pubic hair|^hairs? of|hairs? of eyebrow|eyelash/i;
const bodyRegions =
  /(?:region of (?:arm|forearm|elbow|wrist|thorax)|border of forearm|bicipital groove|cubital fossa|pectoral region|presternal region|mammary region|inframammary region|scapular region|interscapular region|infrascapular region|vertebral region|palm|dorsum of hand|hip region|gluteal region|inguinal region|femoral triangle|sacral region)/i;
const extremities =
  /(?:digits|palm|dorsum|wrist|nail|perionyx|sole|malleol|heel|foot|tars|plantar|arch|hallucial|ankle|toe)/i;
const joints = /(?:knee|elbow|popliteal|cubital)/i;

/**
 * Decides whether a body-surface region is part of the assembled écorché
 * presentation and how it is coloured. Returns null when it stays hidden.
 */
export function shellStyle(name: string, y: number): ShellStyle | null {
  if (hiddenRegions.test(name)) return null;
  const isHead = y >= 1.5;
  if (!(isHead || y < 0.78 || bodyRegions.test(name))) return null;
  if (isHead) return { color: "#efe8d8", look: "smooth" };
  const variation = hashName(name);
  const color = new Color();
  if (extremities.test(name)) {
    color.set("#d6b3a0");
  } else if (joints.test(name)) {
    color.set("#b8443a");
  } else {
    color.set("#b3322c");
  }
  color.offsetHSL((variation - 0.5) * 0.02, 0, (variation - 0.5) * 0.12);
  return { color: `#${color.getHexString()}`, look: "fibre" };
}
