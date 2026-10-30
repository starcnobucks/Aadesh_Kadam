import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as fs from 'fs';
import * as path from 'path';

// Node polyfill for FileReader
if (typeof (globalThis as any).FileReader === 'undefined') {
  class NodeFileReader {
    onload: any = null;
    onloadend: any = null;
    onerror: any = null;
    result: any = null;
    readAsArrayBuffer(blob: any) {
      blob.arrayBuffer().then((buf: ArrayBuffer) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }).catch((err: any) => {
        if (this.onerror) this.onerror(err);
      });
    }
  }
  (globalThis as any).FileReader = NodeFileReader;
}

/**
 * Creates the monumental monolithic wall with a single tall, narrow rectangular opening.
 * STRICTLY NO ARCHES, NO GOTHIC GATES, NO BUSY ORNAMENTS.
 * Clean, stark, imposing minimalist architectural monolith with thick physical depth.
 */
function createMonolithDoorwayModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'MonolithDoorway';
  const mat = new THREE.MeshBasicMaterial();

  const add = (
    g: THREE.BufferGeometry,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
    name = 'part'
  ) => {
    const m = new THREE.Mesh(g, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scale);
    m.name = name;
    root.add(m);
    return m;
  };

  // Dimensions:
  // Total wall width = 26m, height = 18m, depth = 2.4m
  // Tall, narrow rectangular portal: width = 2.0m (from x = -1.0 to +1.0), height = 15m (from y = 0 to 15m)

  // 1. Left Monolithic Wall Slab (x = -13.5 to -1.0, width = 12.5m, height = 18m, depth = 2.4m)
  add(new THREE.BoxGeometry(12.5, 18.0, 2.4), [-7.25, 9.0, 0], [0, 0, 0], [1, 1, 1], 'LeftWallSlab');

  // 2. Right Monolithic Wall Slab (x = +1.0 to +13.5, width = 12.5m, height = 18m, depth = 2.4m)
  add(new THREE.BoxGeometry(12.5, 18.0, 2.4), [7.25, 9.0, 0], [0, 0, 0], [1, 1, 1], 'RightWallSlab');

  // 3. Top Lintel Monolithic Header (spanning across the opening from x = -1.0 to +1.0, y = 15.0 to 18.0, height = 3.0m)
  add(new THREE.BoxGeometry(2.0, 3.0, 2.4), [0, 16.5, 0], [0, 0, 0], [1, 1, 1], 'HeaderSlab');

  // 4. Inner Portal Reveals (jambs and soffit with physical depth)
  // Left inner jamb face
  add(new THREE.BoxGeometry(0.1, 15.0, 2.4), [-1.0, 7.5, 0], [0, 0, 0], [1, 1, 1], 'LeftInnerJamb');
  // Right inner jamb face
  add(new THREE.BoxGeometry(0.1, 15.0, 2.4), [1.0, 7.5, 0], [0, 0, 0], [1, 1, 1], 'RightInnerJamb');
  // Top soffit
  add(new THREE.BoxGeometry(2.0, 0.1, 2.4), [0, 15.0, 0], [0, 0, 0], [1, 1, 1], 'TopInnerSoffit');

  // 5. Ground Threshold Platform (extending forward and backward for camera transit)
  add(new THREE.BoxGeometry(26.0, 0.4, 12.0), [0, -0.2, 2.0], [0, 0, 0], [1, 1, 1], 'ThresholdPlatform');

  // 6. Luminous Central Portal Curtain Plane (hidden source geometry for light particle sampling)
  add(new THREE.PlaneGeometry(1.9, 14.9, 10, 30), [0, 7.5, 0], [0, 0, 0], [1, 1, 1], 'PortalLightSheet');

  return root;
}

async function exportModel(model: THREE.Group, filename: string) {
  const exporter = new GLTFExporter();
  const outDir = path.resolve(process.cwd(), 'public/models');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, filename);

  await new Promise<void>((resolve, reject) => {
    exporter.parse(
      model,
      (gltf) => {
        try {
          const buffer = Buffer.from(gltf as ArrayBuffer);
          fs.writeFileSync(outFile, buffer);
          console.log(`Exported ${outFile} (${buffer.length} bytes)`);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

async function main() {
  await exportModel(createMonolithDoorwayModel(), 'doorway.glb');
  console.log('Successfully generated monolithic rectangular doorway GLB');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
