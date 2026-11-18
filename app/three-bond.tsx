"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type ThreeBondProps = { active: boolean };

export default function ThreeBond({ active }: ThreeBondProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!active || !host) return;
    const hostElement = host as HTMLDivElement;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      host.dataset.webgl = "unavailable";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1.8, 0.1, 50);
    camera.position.set(0, 0.05, 7);

    scene.add(new THREE.HemisphereLight(0xfff3d5, 0x4b3111, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffe2a0, 3.8);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.7);
    rimLight.position.set(4, -1, 3);
    scene.add(rimLight);
    const warmFill = new THREE.PointLight(0xc58a31, 24, 14);
    warmFill.position.set(0, 2, 3);
    scene.add(warmFill);

    const leftRing = new THREE.Group();
    const rightRing = new THREE.Group();
    scene.add(leftRing, rightRing);
    leftRing.rotation.set(Math.PI / 2 - 0.22, -0.08, -0.05);
    rightRing.rotation.set(Math.PI / 2 - 0.22, 0.08, 0.05);

    let disposed = false;
    const loadedScenes: THREE.Object3D[] = [];
    const loader = new GLTFLoader();

    function releaseModel(model: THREE.Object3D) {
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) value.dispose();
          });
          material.dispose();
        });
      });
    }

    function loadRing(url: string, target: THREE.Group) {
      loader.load(url, (gltf) => {
        const model = gltf.scene;
        if (disposed) {
          releaseModel(model);
          return;
        }
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const largestSide = Math.max(size.x, size.y, size.z);
        model.position.sub(center);
        model.scale.setScalar(2.25 / largestSide);
        target.add(model);
        loadedScenes.push(model);
        scheduleRender();
      }, undefined, () => {
        if (!disposed) hostElement.dataset.modelError = "true";
      });
    }

    loadRing("/models/rihab-ring.glb", leftRing);
    loadRing("/models/tafzeena-ring.glb", rightRing);

    let frame = 0;
    let width = 0;
    let height = 0;

    function render() {
      frame = 0;
      if (disposed || width === 0 || height === 0) return;

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
      const descent = THREE.MathUtils.smoothstep(progress, 0, 0.94);
      const separation = THREE.MathUtils.lerp(1.55, 0.82, descent);
      const impact = progress > 0.86
        ? Math.sin(((progress - 0.86) / 0.14) * Math.PI) * (1 - progress) * 1.4
        : 0;

      leftRing.position.set(
        -separation,
        THREE.MathUtils.lerp(0.78, 0.015, descent) + impact,
        THREE.MathUtils.lerp(0.38, 0.16, descent),
      );
      rightRing.position.set(
        separation,
        THREE.MathUtils.lerp(1.18, -0.015, descent) - impact * 0.72,
        THREE.MathUtils.lerp(-0.38, -0.16, descent),
      );
      leftRing.rotation.set(
        THREE.MathUtils.lerp(Math.PI / 2 - 0.72, Math.PI / 2 - 0.14, descent),
        THREE.MathUtils.lerp(-0.95, -0.15, descent),
        THREE.MathUtils.lerp(-0.48, -0.06, descent),
      );
      rightRing.rotation.set(
        THREE.MathUtils.lerp(Math.PI / 2 - 0.5, Math.PI / 2 + 0.14, descent),
        THREE.MathUtils.lerp(0.95, 0.15, descent),
        THREE.MathUtils.lerp(0.48, 0.06, descent),
      );
      renderer.render(scene, camera);
    }

    function scheduleRender() {
      if (!frame && !disposed) frame = window.requestAnimationFrame(render);
    }

    function resize() {
      const bounds = hostElement.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      scheduleRender();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hostElement);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", scheduleRender, { passive: true });
    resize();

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", scheduleRender);
      loadedScenes.forEach(releaseModel);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [active]);

  if (!active) return null;
  return <div className="three-bond" ref={hostRef} role="img" aria-label="Gold three-dimensional wedding rings move together as you scroll" />;
}
