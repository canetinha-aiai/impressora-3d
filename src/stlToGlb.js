import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export async function stlFileToGlbBlob(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loader = new STLLoader();
  const geometry = loader.parse(arrayBuffer);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0xb7bdc4,
    metalness: 0.05,
    roughness: 0.6,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const scene = new THREE.Scene();
  scene.add(mesh);

  const exporter = new GLTFExporter();
  const glbArrayBuffer = await new Promise((resolve, reject) => {
    exporter.parse(scene, resolve, reject, { binary: true });
  });

  return new Blob([glbArrayBuffer], { type: "model/gltf-binary" });
}
