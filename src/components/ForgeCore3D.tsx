import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ForgeCore3DProps {
  className?: string;
}

/**
 * High-performance 2D Canvas Fallback
 * Renders an interactive 3D Molten Core using pure 2D Canvas math.
 * 100% immune to WebGL driver limitations, OES_packed_depth_stencil absence, and iframe sandbox restrictions.
 */
const ForgeCoreCanvas2D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 480);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || 480;
      height = rect.height || 480;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currRotX = 0;
    let currRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Geodesic Icosahedron 3D Geometry vertices (Neural Edge Router Node)
    const t = 1.61803398875;
    const s = 0.88;
    const rawVertices = [
      { x: -1, y:  t, z:  0 },
      { x:  1, y:  t, z:  0 },
      { x: -1, y: -t, z:  0 },
      { x:  1, y: -t, z:  0 },
      { x:  0, y: -1, z:  t },
      { x:  0, y:  1, z:  t },
      { x:  0, y: -1, z: -t },
      { x:  0, y:  1, z: -t },
      { x:  t, y:  0, z: -1 },
      { x:  t, y:  0, z:  1 },
      { x: -t, y:  0, z: -1 },
      { x: -t, y:  0, z:  1 }
    ];
    const vertices = rawVertices.map(v => ({ x: v.x * s, y: v.y * s, z: v.z * s }));

    // 20 Triangular Facets of Icosahedron Core
    const faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    // Embers Particle Pool
    const emberCount = 65;
    const embers = Array.from({ length: emberCount }, () => ({
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160,
      z: (Math.random() - 0.5) * 160,
      vy: -(Math.random() * 0.9 + 0.5),
      vx: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.45 ? '#FF6B35' : '#FFB627'
    }));

    let startTime = performance.now();

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse follow
      currRotX += (targetRotX - currRotX) * 0.05;
      currRotY += (targetRotY - currRotY) * 0.05;

      const rotY = elapsed * 0.4 + currRotY;
      const rotX = Math.sin(elapsed * 0.25) * 0.15 + currRotX;
      const rotZ = Math.cos(elapsed * 0.2) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.22;

      // 1. Draw Molten Ambient Heat Core (Radial Gradient)
      const pulse = Math.sin(elapsed * 2.5) * 0.15 + 0.85;
      const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, scale * 1.8 * pulse);
      coreGrad.addColorStop(0, 'rgba(255, 182, 39, 0.45)');
      coreGrad.addColorStop(0.25, 'rgba(255, 107, 53, 0.3)');
      coreGrad.addColorStop(0.55, 'rgba(13, 59, 59, 0.2)');
      coreGrad.addColorStop(1, 'rgba(18, 18, 18, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.8 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 2. 3D Rotation Helper for vertices
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      const projectVertex = (v: { x: number; y: number; z: number }) => {
        // Y-axis rotation
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;

        // X-axis rotation
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;

        // Z-axis rotation
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Perspective projection
        const fov = 4.5;
        const p = fov / (fov + z2);
        return {
          x: cx + x3 * scale * p,
          y: cy - y3 * scale * p,
          z: z2,
          p
        };
      };

      const projected = vertices.map(projectVertex);

      // 3. Draw Gyroscopic Outer Concentric Ring 1 (Gold)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(elapsed * 0.2 + currRotY * 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, scale * 1.7, scale * 0.65, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 182, 39, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFB627';
      ctx.stroke();

      // Orbital Node on Ring 1
      const ring1Angle = elapsed * 0.9;
      const n1x = Math.cos(ring1Angle) * scale * 1.7;
      const n1y = Math.sin(ring1Angle) * scale * 0.65;
      const rot45 = Math.PI / 4;
      const px1 = n1x * Math.cos(rot45) - n1y * Math.sin(rot45);
      const py1 = n1x * Math.sin(rot45) + n1y * Math.cos(rot45);
      ctx.beginPath();
      ctx.arc(px1, py1, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFEAA7';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#FFEAA7';
      ctx.fill();
      ctx.restore();

      // Gyroscopic Outer Concentric Ring 2 (Teal)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-elapsed * 0.25 - currRotX * 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, scale * 1.95, scale * 0.75, -Math.PI / 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(13, 59, 59, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Orbital Node on Ring 2
      const ring2Angle = -elapsed * 0.7;
      const n2x = Math.cos(ring2Angle) * scale * 1.95;
      const n2y = Math.sin(ring2Angle) * scale * 0.75;
      const rotM60 = -Math.PI / 3;
      const px2 = n2x * Math.cos(rotM60) - n2y * Math.sin(rotM60);
      const py2 = n2x * Math.sin(rotM60) + n2y * Math.cos(rotM60);
      ctx.beginPath();
      ctx.arc(px2, py2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#34D399';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#34D399';
      ctx.fill();
      ctx.restore();

      // 4. Sort and Draw 3D Molten Octahedron Faces (Painter's Algorithm)
      const sortedFaces = faces.map((indices, idx) => {
        const p0 = projected[indices[0]];
        const p1 = projected[indices[1]];
        const p2 = projected[indices[2]];
        const avgZ = (p0.z + p1.z + p2.z) / 3;
        // Surface normal Z for light shading
        const vAx = p1.x - p0.x;
        const vAy = p1.y - p0.y;
        const vBx = p2.x - p0.x;
        const vBy = p2.y - p0.y;
        const crossZ = vAx * vBy - vAy * vBx;
        return { indices, avgZ, crossZ, id: idx };
      }).sort((a, b) => a.avgZ - b.avgZ);

      sortedFaces.forEach(face => {
        const p0 = projected[face.indices[0]];
        const p1 = projected[face.indices[1]];
        const p2 = projected[face.indices[2]];

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        // Shading intensity
        const isFacing = face.crossZ > 0;
        const baseShade = isFacing ? 0.35 : 0.15;
        const moltenPulse = Math.sin(elapsed * 3 + face.id) * 0.1 + 0.2;

        // Dark metallic forge facet with glowing molten fissures
        ctx.fillStyle = `rgba(31, 26, 20, ${baseShade + moltenPulse * 0.5})`;
        ctx.fill();

        ctx.strokeStyle = isFacing ? 'rgba(255, 182, 39, 0.75)' : 'rgba(255, 107, 53, 0.4)';
        ctx.lineWidth = isFacing ? 2 : 1.2;
        ctx.shadowBlur = isFacing ? 12 : 6;
        ctx.shadowColor = '#FF6B35';
        ctx.stroke();
      });

      // 5. Inner Core Radiant Sparkle
      const innerRadius = scale * 0.25 * (Math.sin(elapsed * 4) * 0.1 + 0.9);
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      innerGrad.addColorStop(0.3, 'rgba(255, 182, 39, 0.85)');
      innerGrad.addColorStop(0.7, 'rgba(255, 107, 53, 0.5)');
      innerGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      // 6. Floating Rising Embers / Sparks
      embers.forEach(ember => {
        ember.y += ember.vy;
        ember.x += ember.vx + Math.sin(elapsed + ember.y * 0.05) * 0.3;

        // Reset if drifted too far upwards
        if (ember.y < -height * 0.45) {
          ember.y = height * 0.35;
          ember.x = (Math.random() - 0.5) * scale * 1.5;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx + ember.x, cy + ember.y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = ember.color;
        ctx.globalAlpha = ember.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = ember.color;
        ctx.fill();
        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

/**
 * ForgeCore3D
 * Tries WebGL with safe attributes (stencil: false to eliminate OES_packed_depth_stencil requirement).
 * Automatically and seamlessly falls back to ForgeCoreCanvas2D if WebGL is unavailable or fails.
 */
export const ForgeCore3D: React.FC<ForgeCore3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return true;
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2', { stencil: false }) ||
                 testCanvas.getContext('webgl', { stencil: false }) ||
                 testCanvas.getContext('experimental-webgl', { stencil: false });
      return !gl;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (useFallback) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      // Explicitly set stencil: false to avoid OES_packed_depth_stencil requirement!
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        depth: true,
        stencil: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGLRenderer creation bypassed, using high-performance 2D Canvas fallback:', err);
      setUseFallback(true);
      return;
    }

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const forgeGroup = new THREE.Group();
    scene.add(forgeGroup);

    // Molten Cyber Neural Router Mesh (Faceted Geodesic Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.55, 0);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1f1a14,
      metalness: 0.92,
      roughness: 0.22,
      emissive: 0xff6b35,
      emissiveIntensity: 0.45,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, metalMat);
    forgeGroup.add(coreMesh);

    // Inner Glowing Molten Core
    const innerGeo = new THREE.IcosahedronGeometry(1.1, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffb627,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    forgeGroup.add(innerCore);

    // Outer Concentric Industrial Forge Rings
    const ringGeo1 = new THREE.TorusGeometry(2.35, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xffb627,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xff6b35,
      emissiveIntensity: 0.2
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    forgeGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(2.65, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x0d3b3b,
      metalness: 0.85,
      roughness: 0.3,
      emissive: 0x145a5a,
      emissiveIntensity: 0.35
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    ringMesh2.rotation.x = -Math.PI / 6;
    forgeGroup.add(ringMesh2);

    // Floating Ember / Spark Particles
    const emberCount = 100;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberVel = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);

    const orangeColor = new THREE.Color(0xff6b35);
    const goldColor = new THREE.Color(0xffb627);

    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 3.5;
      emberPos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

      emberVel[i * 3] = (Math.random() - 0.5) * 0.008;
      emberVel[i * 3 + 1] = 0.012 + Math.random() * 0.02;
      emberVel[i * 3 + 2] = (Math.random() - 0.5) * 0.008;

      const mix = Math.random();
      const c = orangeColor.clone().lerp(goldColor, mix);
      emberColors[i * 3] = c.r;
      emberColors[i * 3 + 1] = c.g;
      emberColors[i * 3 + 2] = c.b;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(emberColors, 3));

    const emberMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const embers = new THREE.Points(emberGeo, emberMat);
    forgeGroup.add(embers);

    // Dynamic Forge Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1512, 1.8);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0xff6b35, 4.5, 12);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const rimLightGold = new THREE.DirectionalLight(0xffb627, 2.5);
    rimLightGold.position.set(4, 5, 4);
    scene.add(rimLightGold);

    const rimLightTeal = new THREE.DirectionalLight(0x0d3b3b, 1.8);
    rimLightTeal.position.set(-4, -4, -3);
    scene.add(rimLightTeal);

    // Mouse Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      forgeGroup.rotation.y += (targetRotY - forgeGroup.rotation.y) * 0.05;
      forgeGroup.rotation.x += (targetRotX - forgeGroup.rotation.x) * 0.05;

      coreMesh.rotation.y = elapsed * 0.35;
      coreMesh.rotation.x = Math.sin(elapsed * 0.25) * 0.2;
      coreMesh.rotation.z = Math.cos(elapsed * 0.2) * 0.15;

      innerCore.rotation.y = -elapsed * 0.45;
      innerCore.rotation.x = -elapsed * 0.2;

      ringMesh1.rotation.z = elapsed * 0.25;
      ringMesh2.rotation.z = -elapsed * 0.3;

      const pulse = Math.sin(elapsed * 2.5) * 0.15 + 0.5;
      metalMat.emissiveIntensity = pulse;
      coreLight.intensity = 3.5 + pulse * 2.0;

      const positions = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        positions[i * 3 + 1] += emberVel[i * 3 + 1];
        positions[i * 3] += Math.sin(elapsed + i) * 0.003;

        if (positions[i * 3 + 1] > 2.8) {
          positions[i * 3 + 1] = -2.2;
          positions[i * 3] = (Math.random() - 0.5) * 2.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
      coreGeo.dispose();
      metalMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      emberGeo.dispose();
      emberMat.dispose();
    };
  }, [useFallback]);

  if (useFallback) {
    return <ForgeCoreCanvas2D className={className} />;
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
    />
  );
};
