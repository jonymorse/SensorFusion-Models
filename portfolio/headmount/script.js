import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const viewport = document.querySelector('#three-view');
const loading = document.querySelector('#loading');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.screenSpacePanning = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x63706a, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(4, 6, 8);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x8fb5c2, 1.4);
fillLight.position.set(-6, 2, -4);
scene.add(fillLight);
const homePosition = new THREE.Vector3();
const homeTarget = new THREE.Vector3();
let modelRadius = 0;

function fitModel() {
  if (!modelRadius) return;
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const limitingFov = Math.min(verticalFov, horizontalFov);
  const distance = (modelRadius / Math.sin(limitingFov / 2)) * 1.3;
  const viewDirection = new THREE.Vector3(1.4, .85, 1.6).normalize();
  homePosition.copy(viewDirection.multiplyScalar(distance));
  camera.position.copy(homePosition);
  controls.target.set(modelRadius * .14, homeTarget.y, homeTarget.z);
  controls.update();
}

function resize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  fitModel();
}

new STLLoader().load(
  './assets/mq3s-mount-base.stl',
  (geometry) => {
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const center = geometry.boundingSphere.center.clone();
    const radius = geometry.boundingSphere.radius;
    modelRadius = radius;
    geometry.translate(-center.x, -center.y, -center.z);

    const material = new THREE.MeshStandardMaterial({
      color: 0x5f8995,
      roughness: 0.62,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
    const model = new THREE.Mesh(geometry, material);
    model.rotation.x = -Math.PI / 2;
    scene.add(model);

    homeTarget.set(0, 0, 0);
    camera.near = Math.max(radius / 1000, .01);
    camera.far = radius * 20;
    camera.updateProjectionMatrix();
    fitModel();
    loading.hidden = true;
  },
  undefined,
  (error) => {
    loading.textContent = 'Could not load STL geometry';
    console.error(error);
  },
);

window.addEventListener('resize', resize);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
