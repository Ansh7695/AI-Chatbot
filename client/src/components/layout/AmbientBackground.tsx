import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// A slow-drifting distorted 3D blob
const DistortedBlob: React.FC<{
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  distort: number;
}> = ({ position, color, size, speed, distort }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow organic drift
    meshRef.current.position.y = position[1] + Math.sin(time * 0.15 * speed) * 0.6;
    meshRef.current.position.x = position[0] + Math.cos(time * 0.1 * speed) * 0.6;
    
    // Slow rotation
    meshRef.current.rotation.x = time * 0.02 * speed;
    meshRef.current.rotation.y = time * 0.03 * speed;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={speed * 1.5}
        roughness={0.45}
        metalness={0.15}
        clearcoat={0.5}
        clearcoatRoughness={0.3}
      />
    </mesh>
  );
};

export const AmbientBackground: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // 1. Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    // 2. Check for WebGL compatibility
    try {
      const canvas = document.createElement('canvas');
      const supports = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setHasWebGL(supports);
    } catch {
      setHasWebGL(false);
    }

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  // Fallback styling if WebGL is disabled or client requests reduced motion
  if (reducedMotion || !hasWebGL) {
    return (
      <div 
        className="fixed inset-0 -z-50 w-full h-full bg-pool-deep overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(232, 145, 124, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(111, 231, 221, 0.06) 0%, transparent 45%),
            linear-gradient(to bottom, #0e1b2a, #162737)
          `
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-50 w-full h-full bg-pool-deep overflow-hidden select-none pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0e1b2a']} />
        
        {/* Soft studio lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        
        {/* Bioluminescent colored accent lights */}
        <pointLight position={[-10, 5, -2]} color="#6FE7DD" intensity={0.8} distance={20} />
        <pointLight position={[10, -5, 2]} color="#E8917C" intensity={0.8} distance={20} />
        
        {/* organic Distorting clay blobs */}
        <DistortedBlob 
          position={[-3.5, 2, -1]} 
          color="#1b3040" 
          size={1.6} 
          speed={0.25} 
          distort={0.4} 
        />
        <DistortedBlob 
          position={[3.5, -2, 0]} 
          color="#e8917c" 
          size={1.4} 
          speed={0.3} 
          distort={0.5} 
        />
        <DistortedBlob 
          position={[-0.5, -3.5, -2]} 
          color="#0b131d" 
          size={2.3} 
          speed={0.15} 
          distort={0.3} 
        />
      </Canvas>
    </div>
  );
};
