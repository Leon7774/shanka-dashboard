import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

// ParticleCloud component removed as it was unused

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
