'use client';
import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Text,
    PresentationControls,
    Float,
    Environment,
    ContactShadows,
    RoundedBox,
    Sparkles as ThreeSparkles,
    Center,
    MeshTransmissionMaterial,
    Grid,
    GradientTexture,
    Image // Import Image
} from '@react-three/drei';
import { Copy, Share2, Check, Loader2, AlertCircle } from 'lucide-react';
import * as THREE from 'three';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("GreetingCard 3D Error:", error);
        if (this.props.onError) this.props.onError(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}


// --- Theme Configurations ---
const themes = {
    modern: {
        css: "bg-gradient-to-br from-slate-900 to-slate-800",
        accent: "#a855f7",
        env: "city",
        type: "glass"
    },
    birthday: {
        css: "bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500",
        accent: "#fcd34d",
        env: "park",
        type: "party"
    },
    love: {
        css: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900 via-pink-900 to-black",
        accent: "#fb7185",
        env: "sunset",
        type: "romantic"
    },
    neon: {
        css: "bg-black",
        accent: "#ec4899",
        env: "warehouse",
        type: "cyber"
    },
    nature: {
        css: "bg-gradient-to-br from-green-900 to-emerald-950",
        accent: "#34d399",
        env: "park",
        type: "forest"
    },
};

// --- Animation Hook ---
function useEntranceAnim() {
    const ref = useRef();
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2.5);
        }
    });
    return ref;
}

// --- Fonts ---
const FONTS = {
    modern: null, // System default or 'Inter' if loaded
    serif: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff',
    handwriting: 'https://fonts.gstatic.com/s/dancingcharts/v10/If2RXTr6YS-zF4S-kcSWSVi_sxjsohD9F50.woff'
};

// --- Templates ---
// Updated to accept customColor, font, and customImageTexture

const TemplateModern = ({ text, accent, customColor, font, customImageTexture }) => (
    <group>
        {/* Clean Frosted Glass */}
        <RoundedBox args={[5, 3.2, 0.15]} radius={0.15} smoothness={4}>
            <meshPhysicalMaterial
                transparent
                transmission={1}
                roughness={0}
                thickness={0.1}
                color="#ffffff"
                clearcoat={1}
                ior={1.2}
            />
        </RoundedBox>
        {/* Accent Rim */}
        <RoundedBox args={[5.1, 3.3, 0.14]} radius={0.15} smoothness={4}>
            <meshBasicMaterial color={accent} transparent opacity={0.3} wireframe />
        </RoundedBox>

        {/* Poster - Image or Gradient */}
        {customImageTexture ? (
            <Image
                url={customImageTexture}
                position={[0, 0, 0.06]}
                scale={[4.5, 2.7, 1]}
                transparent
                opacity={0.95}
                toneMapped={false}
            />
        ) : (
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[4.5, 2.7]} />
                <meshBasicMaterial toneMapped={false}>
                    <GradientTexture stops={[0, 1]} colors={['#ffffff', '#f1f5f9']} size={128} />
                </meshBasicMaterial>
            </mesh>
        )}

        <Text position={[0, 0, 0.22]} fontSize={0.22} color={customColor || "#020617"} font={font} maxWidth={4} textAlign="center" lineHeight={1.5}>
            {text}
        </Text>
    </group>
);

const TemplateBirthday = ({ text, accent, customColor, font, customImageTexture }) => (
    <group>
        {/* Frame */}
        <RoundedBox args={[5, 3.2, 0.2]} radius={0.3} smoothness={4}>
            <meshStandardMaterial color="#fff1f2" roughness={0.3} />
        </RoundedBox>

        {/* Poster - Image or Gradient */}
        {customImageTexture ? (
            <Image
                url={customImageTexture}
                position={[0, 0, 0.06]}
                scale={[4.5, 2.8, 1]}
                transparent
                opacity={0.95}
                toneMapped={false}
            />
        ) : (
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[4.5, 2.8]} />
                <meshBasicMaterial toneMapped={false}>
                    <GradientTexture stops={[0, 1]} colors={['#fff1f2', '#fce7f3']} size={128} />
                </meshBasicMaterial>
            </mesh>
        )}

        {/* Confetti */}
        <ThreeSparkles count={80} scale={6} size={3} speed={0.4} opacity={1} color={["#f472b6", "#60a5fa", "#fbbf24"]} />

        <Text position={[0, 0, 0.22]} fontSize={0.28} color={customColor || "#9d174d"} font={font} maxWidth={4.2} textAlign="center" lineHeight={1.4}>
            {text}
        </Text>

        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[-2.5, 1.5, 0.2]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="#f472b6" roughness={0.1} />
            </mesh>
            <mesh position={[2.5, -1.5, 0.2]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#60a5fa" roughness={0.1} />
            </mesh>
        </Float>
    </group>
);

const TemplateLove = ({ text, accent, customColor, font, customImageTexture }) => (
    <group>
        {/* Frame */}
        <RoundedBox args={[5, 3.2, 0.2]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial
                transparent
                transmission={0.6}
                roughness={0.2}
                thickness={0.8}
                color="#be123c"
                attenuationColor="#881337"
                attenuationDistance={1}
            />
        </RoundedBox>

        {/* Poster - Image or Gradient */}
        {customImageTexture ? (
            <Image
                url={customImageTexture}
                position={[0, 0, 0.06]}
                scale={[4.5, 2.8, 1]}
                transparent
                opacity={0.95}
                toneMapped={false}
            />
        ) : (
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[4.5, 2.8]} />
                <meshBasicMaterial toneMapped={false}>
                    <GradientTexture stops={[0, 1]} colors={['#fff1f2', '#fbcfe8']} size={128} />
                </meshBasicMaterial>
            </mesh>
        )}

        <Text position={[0, 0, 0.22]} fontSize={0.25} color={customColor || "#4c0519"} font={font} maxWidth={4.2} textAlign="center" lineHeight={1.4}>
            {text}
        </Text>
        <ThreeSparkles count={40} color="#fda4af" size={3} scale={4} opacity={0.6} speed={0.2} noise={0.5} />
    </group>
);

const TemplateNeon = ({ text, accent, customColor, font, customImageTexture }) => (
    <group>
        {/* Frame */}
        <RoundedBox args={[5, 3.2, 0.1]} radius={0.1} smoothness={1}>
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        {/* Neon Border */}
        <RoundedBox args={[5.1, 3.3, 0.08]} radius={0.1} smoothness={1}>
            <meshStandardMaterial color="black" emissive={accent} emissiveIntensity={3} />
        </RoundedBox>

        {/* Poster - Image or Gradient */}
        {customImageTexture ? (
            <Image
                url={customImageTexture}
                position={[0, 0, 0.06]}
                scale={[4.5, 2.8, 1]}
                transparent
                opacity={0.95}
                toneMapped={false}
            />
        ) : (
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[4.5, 2.8]} />
                <meshBasicMaterial toneMapped={false}>
                    <GradientTexture stops={[0, 1]} colors={['#0f172a', '#1e293b']} size={128} />
                </meshBasicMaterial>
            </mesh>
        )}

        <Grid position={[0, 0, 0.06]} args={[4.5, 2.8]} cellSize={0.2} sectionSize={1} fadeDistance={3} sectionColor={accent} cellColor={accent} />

        <Text position={[0, 0, 0.22]} fontSize={0.25} color={customColor || "#f8fafc"} font={font} maxWidth={4.2} textAlign="center" lineHeight={1.4} anchorX="center" anchorY="middle">
            {text}
        </Text>
    </group>
);

const TemplateNature = ({ text, accent, customColor, font, customImageTexture }) => (
    <group>
        {/* Frame */}
        <RoundedBox args={[5, 3.2, 0.2]} radius={0.4} smoothness={4}>
            <meshPhysicalMaterial
                transparent
                transmission={0.4}
                roughness={0}
                color="#047857"
                metalness={0.4}
                clearcoat={1}
            />
        </RoundedBox>

        {/* Poster - Image or Gradient */}
        {customImageTexture ? (
            <Image
                url={customImageTexture}
                position={[0, 0, 0.06]}
                scale={[4.5, 2.8, 1]}
                transparent
                opacity={0.95}
                toneMapped={false}
            />
        ) : (
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[4.5, 2.8]} />
                <meshBasicMaterial toneMapped={false}>
                    <GradientTexture stops={[0, 1]} colors={['#f0fdf4', '#dcfce7']} size={128} />
                </meshBasicMaterial>
            </mesh>
        )}

        <Text position={[0, 0, 0.22]} fontSize={0.25} color={customColor || "#052e16"} font={font} maxWidth={4.2} textAlign="center" lineHeight={1.4}>
            {text}
        </Text>
        <ThreeSparkles count={30} color="#6ee7b7" size={3} scale={4} opacity={0.4} speed={0.2} />
    </group>
);

const TemplateOcean = ({ text, customColor, font, customImageTexture }) => (
    <group>
        {/* Aquatic Glass */}
        <RoundedBox args={[5, 3.2, 0.2]} radius={0.2} smoothness={4}>
            <meshPhysicalMaterial
                transparent
                transmission={0.8}
                roughness={0.1}
                metalness={0.1}
                thickness={0.1}
                color="#0ea5e9"
                clearcoat={1}
                envMapIntensity={2}
            />
        </RoundedBox>

        {/* Poster - Image or Gradient */}
        {customImageTexture ? (
            <Image
                url={customImageTexture}
                position={[0, 0, 0.06]}
                scale={[4.5, 2.7, 1]}
                transparent
                opacity={0.95}
                toneMapped={false}
            />
        ) : (
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[4.5, 2.7]} />
                <meshBasicMaterial toneMapped={false}>
                    <GradientTexture stops={[0, 1]} colors={['#f0f9ff', '#e0f2fe']} size={128} />
                </meshBasicMaterial>
            </mesh>
        )}

        <Text position={[0, 0, 0.22]} fontSize={0.25} color={customColor || "#0c4a6e"} font={font} maxWidth={4.2} textAlign="center" lineHeight={1.4}>
            {text}
        </Text>
        <ThreeSparkles count={50} color="#38bdf8" size={2} scale={3} opacity={0.5} speed={0.1} noise={0.3} />
    </group>
);

// --- Main Scene ---
const CardScene = ({ text, themeName, customColor, font, customImageTexture }) => {
    // Direct mapping from dashboard IDs to logic
    const activeThemeKey = themeName || 'modern';
    const theme = themes[activeThemeKey] || themes.modern;
    const groupRef = useEntranceAnim();

    return (
        <group ref={groupRef} scale={[0.1, 0.1, 0.1]}>
            {/* Essential Lights for Visibility check */}
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="white" />
            <spotLight position={[0, 5, 0]} intensity={2} angle={0.5} penumbra={1} />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                {activeThemeKey === 'birthday' && <TemplateBirthday text={text} accent={theme.accent} customColor={customColor} font={font} customImageTexture={customImageTexture} />}
                {activeThemeKey === 'love' && <TemplateLove text={text} accent={theme.accent} customColor={customColor} font={font} customImageTexture={customImageTexture} />}
                {activeThemeKey === 'neon' && <TemplateNeon text={text} accent={theme.accent} customColor={customColor} font={font} customImageTexture={customImageTexture} />}
                {activeThemeKey === 'nature' && <TemplateNature text={text} accent={theme.accent} customColor={customColor} font={font} customImageTexture={customImageTexture} />}
                {activeThemeKey === 'ocean' && <TemplateOcean text={text} customColor={customColor} font={font} customImageTexture={customImageTexture} />}
                {(!['birthday', 'love', 'neon', 'nature', 'ocean'].includes(activeThemeKey)) && <TemplateModern text={text} accent={theme.accent} customColor={customColor} font={font} customImageTexture={customImageTexture} />}
            </Float>

            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} frames={1} />
            <Environment preset={theme.env} />
        </group>
    );
};

const GreetingCard = ({ text, theme = 'modern', customColor = null, customFont = null, activeTemplate = null, customImageTexture = null }) => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    // Determines the visual theme
    // 1. If activeTemplate is set (User override), use that.
    // 2. Else fall back to auto-theme 'theme' prop.
    let displayThemeKey = activeTemplate || theme;

    // Normalize logic
    if (!activeTemplate) {
        if (theme === 'anniversary') displayThemeKey = 'love';
        if (theme === 'forest') displayThemeKey = 'nature';
        if (theme === 'sunset') displayThemeKey = 'love';
        if (theme === 'ocean') displayThemeKey = 'ocean'; // keep ocean
    }

    // Fallback if key doesn't exist in map
    if (!themes[displayThemeKey]) displayThemeKey = 'modern';

    const activeTheme = themes[displayThemeKey] || themes.modern;

    // Determine font URL
    const fontUrl = customFont === 'default' ? undefined : FONTS[customFont] || undefined;

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (error) {
        // Fallback UI in case 3D fails completely
        return (
            <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900 rounded-3xl border border-white/10 p-8 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">3D Scene Error</h3>
                <p className="text-gray-400 text-sm mb-6">We switched to a simple view.</p>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 max-w-md">
                    <p className="text-white whitespace-pre-wrap leading-relaxed">&quot;{text}&quot;</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full h-full min-h-[500px] relative rounded-3xl overflow-hidden border border-white/10 group shadow-2xl transition-colors duration-1000 ${activeTheme.css}`}>

            {/* 3D Canvas */}
            <div className="absolute inset-0 cursor-grab active:cursor-grabbing z-0 text-clip">
                <ErrorBoundary onError={setError} fallback={
                    <div className="w-full h-full flex items-center justify-center bg-transparent">
                        {/* We rely on the parent checking 'error' state to render the full fallback UI, 
                              but if ErrorBoundary catches it, we need to trigger that state update. 
                              The componentDidCatch calls setError. 
                              We can render nothing here or a simple placeholder while the state updates. */}
                    </div>
                }>
                    <Canvas
                        key={theme} // FORCE REMOUNT ON THEME CHANGE
                        camera={{ position: [0, 0, 7], fov: 40 }}
                        dpr={1}
                        gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
                        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
                    // onError={setError} // Canvas onError might not catch Suspense errors from drei/Image
                    >
                        <Suspense fallback={null}>
                            <PresentationControls
                                global
                                config={{ mass: 2, tension: 500 }}
                                snap={{ mass: 4, tension: 1500 }}
                                rotation={[0, 0, 0]}
                                polar={[-Math.PI / 4, Math.PI / 4]}
                                azimuth={[-Math.PI / 4, Math.PI / 4]}
                            >
                                <CardScene text={text} themeName={displayThemeKey} customColor={customColor} font={fontUrl} customImageTexture={customImageTexture} />
                            </PresentationControls>
                        </Suspense>
                    </Canvas>
                </ErrorBoundary>
            </div>

            {/* Overlay UI */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-4 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-xl text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm font-medium">Copy</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); navigator.share && navigator.share({ title: 'Wish', text }); }}
                    className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-xl text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
};

export default GreetingCard;
