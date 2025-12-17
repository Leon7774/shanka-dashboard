import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

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

function SceneContent({ isDark }: { isDark: boolean }) {
    const bgColor = isDark ? "#020617" : "#ffffff"; // slate-950 vs white
    // Fog args: color, near, far
    const fogColor = isDark ? "#020617" : "#ffffff";

    return (
        <>
            <color attach="background" args={[bgColor]} />
            <fog attach="fog" args={[fogColor, 5, 20]} />
            {/* <ParticleCloud /> */}
        </>
    );
}

export default function ThreeBackground() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const isDarkMode =
                document.documentElement.classList.contains("dark");
            setIsDark(isDarkMode);
        };

        // Initial check
        checkTheme();

        // Observer for class changes on html element
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="absolute inset-0 -z-10 bg-white dark:bg-slate-950 opacity-65 transition-colors duration-500">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <SceneContent isDark={isDark} />
            </Canvas>
        </div>
    );
}
