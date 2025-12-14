import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Basic rotation (wobble/spin)
            const t = state.clock.getElapsedTime();
            groupRef.current.rotation.y = Math.sin(t / 4) / 10;
            groupRef.current.rotation.x = Math.cos(t / 4) / 10;
            groupRef.current.position.y = Math.sin(t / 2) / 10;

            // Mouse follow (smooth interpolation)
            // state.pointer.x/y are normalized [-1, 1]
            const targetX = state.pointer.x * 0.5; // Scale factor for sensitivity
            const targetY = state.pointer.y * 0.5;

            groupRef.current.rotation.y += targetX * 0.1;
            groupRef.current.rotation.x -= targetY * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Primary Blue Particles */}
            <Sparkles
                count={200}
                scale={12}
                size={6}
                speed={0.4}
                opacity={1}
                color="#4285F4" // Google Blue
            />
            {/* Secondary darker blue for depth */}
            <Sparkles
                count={150}
                scale={10}
                size={4}
                speed={0.3}
                opacity={0.7}
                color="#1967d2"
            />
            {/* Subtle smaller ones */}
            <Sparkles
                count={300}
                scale={15}
                size={2}
                speed={0.2}
                opacity={0.5}
                color="#8ab4f8"
            />
        </group>
    );
}

export default function ThreeBackground() {
    return (
        <div className="absolute inset-0 -z-10 bg-white opacity-65">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                {/* Set background color to white */}
                <color attach="background" args={['#ffffff']} />
                <fog attach="fog" args={['#ffffff', 5, 20]} />

                <ParticleCloud />
            </Canvas>
        </div>
    );
}
