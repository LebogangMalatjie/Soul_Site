import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface RiverJourneyProps {
  onComplete: () => void;
}

const vertexShader = `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;

  #define PI 3.141592653589793

  void main() {
    vec3 pos = position;
    vUv = uv;
    float wave = cos(pos.x * uWaveFrequency * PI + uTime * uSpeed) * 
                 sin(pos.y * uWaveFrequency * PI + uTime * uSpeed) * 
                 uWaveAmplitude;
    vWave = wave;
    pos.z += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  varying vec2 vUv;
  varying float vWave;

  float circle(vec2 uv, vec2 pos, float radius) {
    return smoothstep(radius, 0.0, distance(uv, pos));
  }

  float sinwave(vec2 uv, float freq, float amp, float sinwidth, float offset, float yoffset) {
    return smoothstep(
      sinwidth, 0.0, 
      abs((sin((uv.y - (uTime * 0.2 * freq) + yoffset) * amp) * 0.5 + 0.5) + offset - uv.x) - sinwidth
    );
  }

  void main() {
    vec3 finalColor = uColor1;
    finalColor += circle(vUv, vec2(0.5, 0.5), 0.5) * 0.15;
    finalColor += uColor3 * sinwave(vUv, 1.0, 5.0, 0.2, 0.13, 0.0);
    finalColor += uColor4 * sinwave(vUv, 1.2, 4.0, 0.2, -0.13, 0.0);
    finalColor += uColor5 * sinwave(vUv, 0.8, 6.0, 0.2, 0.0, 0.0);
    finalColor += uColor6 * sinwave(vUv, 0.5, 3.0, 0.2, 0.0, 0.5);
    finalColor += vWave * 0.3;
    float alpha = max(0.05, distance(vWave, 0.0) * 3.0);
    alpha = clamp(alpha, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function RiverJourney({ onComplete }: RiverJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boatRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animationRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const progressRef = useRef(0);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#050508', 5, 40);
    scene.background = new THREE.Color('#050508');
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 12);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Water plane
    const geometry = new THREE.PlaneGeometry(80, 80, 512, 512);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.2 },
        uWaveAmplitude: { value: 0.4 },
        uWaveFrequency: { value: 1.5 },
        uColor1: { value: new THREE.Color('#050508') },
        uColor2: { value: new THREE.Color('#151e29') },
        uColor3: { value: new THREE.Color('#00E0C7') },
        uColor4: { value: new THREE.Color('#0A2F4E') },
        uColor5: { value: new THREE.Color('#04363E') },
        uColor6: { value: new THREE.Color('#0E141D') },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const water = new THREE.Mesh(geometry, material);
    scene.add(water);

    // Boat group
    const boatGroup = new THREE.Group();
    boatRef.current = boatGroup;

    // Boat hull (simple low-poly shape)
    const hullGeo = new THREE.BoxGeometry(1.5, 0.6, 3);
    const hullMat = new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      metalness: 0.8,
      roughness: 0.3,
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.3;
    boatGroup.add(hull);

    // Boat cabin
    const cabinGeo = new THREE.BoxGeometry(1, 0.5, 1.2);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: '#0f0f1a',
      metalness: 0.9,
      roughness: 0.2,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.85, -0.3);
    boatGroup.add(cabin);

    // Glowing edges
    const edgeGeo = new THREE.BoxGeometry(1.55, 0.05, 3.05);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: '#00E0C7',
      transparent: true,
      opacity: 0.6,
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.6;
    boatGroup.add(edge);

    // Light on boat
    const boatLight = new THREE.PointLight('#00E0C7', 2, 8);
    boatLight.position.set(0, 2, 0);
    boatGroup.add(boatLight);

    boatGroup.position.set(0, 0, 0);
    scene.add(boatGroup);

    // Ambient light
    const ambientLight = new THREE.AmbientLight('#00E0C7', 0.3);
    scene.add(ambientLight);

    // Directional light
    const dirLight = new THREE.DirectionalLight('#00E0C7', 0.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Particle system (bioluminescent sparkles)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: '#00E0C7',
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Gate in the distance
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 3, -35);

    const pillarGeo = new THREE.BoxGeometry(1, 8, 1);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#0a0a1a',
      metalness: 0.5,
      roughness: 0.8,
    });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-3, 0, 0);
    gateGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(3, 0, 0);
    gateGroup.add(rightPillar);

    // Gate glow
    const gateLight = new THREE.PointLight('#00E0C7', 3, 20);
    gateLight.position.set(0, 2, 0);
    gateGroup.add(gateLight);

    scene.add(gateGroup);

    // Animation
    const clock = clockRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      // Update progress (10 second journey)
      const progress = Math.min(elapsed / 10, 1);
      progressRef.current = progress;
      setElapsed(progress);

      // Move boat forward
      const boatZ = -progress * 35;
      boatGroup.position.z = boatZ;

      // Raycast to water surface for boat bobbing
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(water);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        gsap.to(boatGroup.position, {
          x: point.x * 0.3,
          y: point.y + 0.2,
          duration: 1.5,
          ease: 'power2.out',
          overwrite: true,
        });
      }

      // Boat rocking
      boatGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.05;
      boatGroup.rotation.x = Math.sin(elapsed * 2) * 0.03;

      // Camera follows boat
      camera.position.z = boatZ + 8;
      camera.position.x = Math.sin(elapsed * 0.3) * 1;
      camera.position.y = 5 + Math.sin(elapsed * 0.5) * 0.5;
      camera.lookAt(boatGroup.position.x, 1, boatZ - 5);

      // Particle animation
      const particlePositions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3 + 1] += Math.sin(elapsed + i) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Gate opening animation
      if (progress > 0.7) {
        const gateProgress = (progress - 0.7) / 0.3;
        leftPillar.position.x = -3 - gateProgress * 2;
        rightPillar.position.x = 3 + gateProgress * 2;
        gateLight.intensity = 3 + gateProgress * 5;
      }

      renderer.render(scene, camera);

      // Check completion
      if (progress >= 1 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setTimeout(onComplete, 500);
      }
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-void">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-xs text-teal/60 tracking-[0.3em]">
            NAVIGATING THE CURRENT
          </div>
          <div className="w-64 h-1 bg-teal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-300"
              style={{ width: `${elapsed * 100}%` }}
            />
          </div>
          <div className="font-mono text-[10px] text-teal/40">
            {Math.floor(elapsed * 10)}s / 10s
          </div>
        </div>
      </div>

      {/* Boat label */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
        <div className="font-mono text-[10px] text-teal/30 tracking-widest">
          VESSEL: SHADOW_CUTTER // SPEED: {(5 + elapsed * 15).toFixed(1)} KNOTS
        </div>
      </div>
    </div>
  );
}
