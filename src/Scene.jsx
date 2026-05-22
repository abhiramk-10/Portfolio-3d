import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';

function CoreShape() {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.35;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.45) * 0.16;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={1.5}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.85, 4]} />
          <MeshDistortMaterial
            color="#57c7a2"
            distort={0.28}
            speed={1.8}
            roughness={0.22}
            metalness={0.34}
          />
        </mesh>
      </Float>
      <mesh position={[-2.45, 0, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.22, 2.5, 0.18]} />
        <meshStandardMaterial color="#f16b5c" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[2.45, 0, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.22, 2.5, 0.18]} />
        <meshStandardMaterial color="#f16b5c" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, -2.15, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.95, 0.035, 12, 96]} />
        <meshStandardMaterial color="#222222" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={1.7} />
      <pointLight position={[-3, -2, 3]} color="#f16b5c" intensity={2.5} />
      <CoreShape />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
    </Canvas>
  );
}

export default Scene;
