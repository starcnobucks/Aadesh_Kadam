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



function createAstronautModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'Astronaut';

  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Helper to add mesh
  const addMesh = (geom: THREE.BufferGeometry, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], scale: [number, number, number] = [1, 1, 1], name = 'part') => {
    const mesh = new THREE.Mesh(geom, defaultMaterial);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.name = name;
    root.add(mesh);
    return mesh;
  };

  // Human proportions: Total height ~ 1.85m
  // 1. Helmet: y = 1.62, radius = 0.16
  const helmetGeom = new THREE.SphereGeometry(0.16, 24, 24);
  helmetGeom.scale(1.0, 1.05, 1.05);
  addMesh(helmetGeom, [0, 1.62, 0], [0, 0, 0], [1, 1, 1], 'Helmet');

  // Visor: y = 1.62, z = 0.08, bulbous convex visor facing +Z
  const visorGeom = new THREE.SphereGeometry(0.12, 20, 20, 0, Math.PI, 0, Math.PI);
  visorGeom.scale(1.05, 0.85, 0.95);
  addMesh(visorGeom, [0, 1.62, 0.07], [-Math.PI * 0.1, 0, 0], [1, 1, 1], 'Visor');

  // Neck ring
  const neckGeom = new THREE.TorusGeometry(0.11, 0.03, 12, 24);
  neckGeom.rotateX(Math.PI / 2);
  addMesh(neckGeom, [0, 1.48, 0], [0, 0, 0], [1, 1, 1], 'NeckRing');

  // 2. Torso (space suit upper body): y = 1.25, width = 0.38, height = 0.44, depth = 0.28
  const torsoGeom = new THREE.CylinderGeometry(0.20, 0.17, 0.44, 20);
  torsoGeom.scale(1.15, 1.0, 0.85);
  addMesh(torsoGeom, [0, 1.25, 0], [0, 0, 0], [1, 1, 1], 'Torso');

  // Chest control unit / pack
  const chestPackGeom = new THREE.BoxGeometry(0.18, 0.16, 0.08);
  addMesh(chestPackGeom, [0, 1.28, 0.13], [0, 0, 0], [1, 1, 1], 'ChestPack');

  // 3. Life Support Backpack (PLSS): y = 1.26, z = -0.16
  const backpackGeom = new THREE.BoxGeometry(0.32, 0.48, 0.18);
  addMesh(backpackGeom, [0, 1.26, -0.15], [0, 0, 0], [1, 1, 1], 'Backpack');

  // Backpack oxygen cylinders / thruster nozzles
  const tankGeom1 = new THREE.CylinderGeometry(0.05, 0.05, 0.42, 14);
  addMesh(tankGeom1, [-0.10, 1.28, -0.22], [0, 0, 0], [1, 1, 1], 'OxygenTankLeft');
  const tankGeom2 = new THREE.CylinderGeometry(0.05, 0.05, 0.42, 14);
  addMesh(tankGeom2, [0.10, 1.28, -0.22], [0, 0, 0], [1, 1, 1], 'OxygenTankRight');

  // Antenna on backpack
  const antennaGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8);
  addMesh(antennaGeom, [0.13, 1.58, -0.15], [0, 0, 0.1], [1, 1, 1], 'Antenna');

  // 4. Pelvis / Hip ring
  const pelvisGeom = new THREE.CylinderGeometry(0.17, 0.16, 0.18, 16);
  pelvisGeom.scale(1.1, 1.0, 0.85);
  addMesh(pelvisGeom, [0, 0.98, 0], [0, 0, 0], [1, 1, 1], 'Pelvis');

  // Belt / Utility gear
  const beltGeom = new THREE.TorusGeometry(0.18, 0.025, 12, 24);
  beltGeom.rotateX(Math.PI / 2);
  beltGeom.scale(1.05, 0.85, 1.0);
  addMesh(beltGeom, [0, 1.04, 0], [0, 0, 0], [1, 1, 1], 'Belt');

  // 5. Arms & Shoulders (standing pose, slightly relaxed at sides, hands facing thighs)
  [-1, 1].forEach((side) => {
    const isLeft = side === -1;
    const prefix = isLeft ? 'Left' : 'Right';

    // Shoulder joint
    const shoulderGeom = new THREE.SphereGeometry(0.09, 14, 14);
    addMesh(shoulderGeom, [side * 0.26, 1.38, 0], [0, 0, 0], [1, 1, 1], `${prefix}Shoulder`);

    // Upper arm
    const upperArmGeom = new THREE.CylinderGeometry(0.065, 0.06, 0.26, 14);
    upperArmGeom.translate(0, -0.13, 0);
    const upperArmMesh = addMesh(upperArmGeom, [side * 0.26, 1.38, 0], [0.1, 0, -side * 0.12], [1, 1, 1], `${prefix}UpperArm`);

    // Elbow
    const elbowPos: [number, number, number] = [side * 0.29, 1.14, 0.02];
    const elbowGeom = new THREE.SphereGeometry(0.065, 12, 12);
    addMesh(elbowGeom, elbowPos, [0, 0, 0], [1, 1, 1], `${prefix}Elbow`);

    // Forearm
    const forearmGeom = new THREE.CylinderGeometry(0.06, 0.055, 0.24, 14);
    forearmGeom.translate(0, -0.12, 0);
    addMesh(forearmGeom, elbowPos, [0.18, 0, -side * 0.08], [1, 1, 1], `${prefix}Forearm`);

    // Glove / Hand
    const handGeom = new THREE.SphereGeometry(0.055, 12, 12);
    handGeom.scale(0.8, 1.2, 0.9);
    addMesh(handGeom, [side * 0.31, 0.92, 0.06], [0, 0, -side * 0.1], [1, 1, 1], `${prefix}Hand`);
  });

  // 6. Legs & Boots (standing with stable grounded stance, feet slightly apart)
  [-1, 1].forEach((side) => {
    const isLeft = side === -1;
    const prefix = isLeft ? 'Left' : 'Right';
    const legX = side * 0.11;

    // Thigh
    const thighGeom = new THREE.CylinderGeometry(0.085, 0.075, 0.40, 16);
    thighGeom.translate(0, -0.20, 0);
    addMesh(thighGeom, [legX, 0.92, 0], [-0.02, 0, -side * 0.02], [1, 1, 1], `${prefix}Thigh`);

    // Knee joint
    const kneeGeom = new THREE.SphereGeometry(0.08, 14, 14);
    addMesh(kneeGeom, [legX, 0.52, 0.01], [0, 0, 0], [1, 1, 1], `${prefix}Knee`);

    // Shin / Calf
    const shinGeom = new THREE.CylinderGeometry(0.075, 0.07, 0.38, 16);
    shinGeom.translate(0, -0.19, 0);
    addMesh(shinGeom, [legX, 0.52, 0.01], [0.02, 0, side * 0.01], [1, 1, 1], `${prefix}Shin`);

    // Heavy Astronaut Boot
    const bootUpperGeom = new THREE.CylinderGeometry(0.075, 0.08, 0.14, 14);
    addMesh(bootUpperGeom, [legX, 0.14, 0.01], [0, 0, 0], [1, 1, 1], `${prefix}BootUpper`);

    const footGeom = new THREE.BoxGeometry(0.13, 0.10, 0.24);
    addMesh(footGeom, [legX, 0.05, 0.04], [0, 0, 0], [1, 1, 1], `${prefix}Foot`);

    // Boot tread / sole
    const soleGeom = new THREE.BoxGeometry(0.14, 0.03, 0.26);
    addMesh(soleGeom, [legX, 0.015, 0.04], [0, 0, 0], [1, 1, 1], `${prefix}Sole`);
  });

  return root;
}

async function main() {
  const model = createAstronautModel();
  const exporter = new GLTFExporter();

  const outDir = path.resolve(process.cwd(), 'public/models');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.join(outDir, 'astronaut.glb');

  await new Promise<void>((resolve, reject) => {
    exporter.parse(
      model,
      (gltf) => {
        try {
          const buffer = Buffer.from(gltf as ArrayBuffer);
          fs.writeFileSync(outFile, buffer);
          console.log(`Successfully generated ${outFile} (${buffer.length} bytes)`);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      (err) => {
        reject(err);
      },
      { binary: true }
    );
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

