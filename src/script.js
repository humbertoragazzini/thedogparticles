import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  particlesMaterial.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 18);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor("#181818");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 *
 * Canvas (2d one)
 */

const displacement = {};

// create canvas in html
displacement.canvas = document.createElement("canvas");
displacement.canvas.width = 128;
displacement.canvas.height = 128;
displacement.canvas.style.position = "fixed";
displacement.canvas.style.width = "512px";
displacement.canvas.style.height = "512px";
displacement.canvas.style.top = 0;
displacement.canvas.style.left = 0;
displacement.canvas.style.zIndex = 10;
document.body.append(displacement.canvas);

// context
displacement.context = displacement.canvas.getContext("2d");
// displacement.context.fillStyle = "red";
displacement.context.fillRect(
  0,
  0,
  displacement.canvas.width,
  displacement.canvas.height
);

// glow image
displacement.glowImage = new Image();
displacement.glowImage.src = "./glow.png";
window.setTimeout(() => {
  displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32);
}, 1000);

// plane for raycasting (to track and send to canvas for drawing
displacement.interactivePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: "red", side: THREE.DoubleSide })
);
displacement.interactivePlane.visible = false;
scene.add(displacement.interactivePlane);

/**
 * Raycaster
 */

displacement.raycaster = new THREE.Raycaster();

// Coordinates
displacement.cursorCoordinates = new THREE.Vector2(999, 999);
displacement.canvasCoordinates = new THREE.Vector2(999, 999);
window.addEventListener("pointermove", (e) => {
  displacement.cursorCoordinates.x = (e.clientX / sizes.width) * 2 - 1;
  displacement.cursorCoordinates.y = -(e.clientY / sizes.height) * 2 + 1;
});

// texture from canvas
displacement.texture = new THREE.CanvasTexture(displacement.canvas);

/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 500, 500);
particlesGeometry.setIndex(null);
particlesGeometry.deleteAttribute("normal");
// Intensity array
const intensityArray = new Float32Array(
  particlesGeometry.attributes.position.count
);

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  intensityArray[i] = Math.random();
}

particlesGeometry.setAttribute(
  "aIntensity",
  new THREE.BufferAttribute(intensityArray, 1)
);

// Angle array
const anglesArray = new Float32Array(
  particlesGeometry.attributes.position.count
);

for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
  anglesArray[i] = Math.random() * Math.PI * 2;
}

particlesGeometry.setAttribute(
  "aAngles",
  new THREE.BufferAttribute(anglesArray, 1)
);

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      )
    ),
    uPictureTexture: new THREE.Uniform(textureLoader.load("./picture-1.png")),
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
  },
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**ec3(distanceToCenter)
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  //raycaster
  displacement.raycaster.setFromCamera(displacement.cursorCoordinates, camera);
  const intercections = displacement.raycaster.intersectObject(
    displacement.interactivePlane
  );

  if (intercections.length > 0) {
    const uv = intercections[0].uv;
    displacement.canvasCoordinates.x = uv.x * displacement.canvas.width;
    displacement.canvasCoordinates.y = (1 - uv.y) * displacement.canvas.height;
    console.log(uv);
  }

  // fading all in the canvas
  displacement.context.globalCompositeOperation = "source-over";
  displacement.context.globalAlpha = 0.02;
  displacement.context.fillRect(
    0,
    0,
    displacement.canvas.width,
    displacement.canvas.height
  );

  //displacement draw image
  const glowSize = displacement.canvas.width * 0.25;
  displacement.context.globalCompositeOperation = "lighten";
  displacement.context.globalAlpha = 1;
  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCoordinates.x - glowSize / 2,
    displacement.canvasCoordinates.y - glowSize / 2,
    glowSize,
    glowSize
  );

  // update the buffer from the canvas
  displacement.texture.needsUpdate = true;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
