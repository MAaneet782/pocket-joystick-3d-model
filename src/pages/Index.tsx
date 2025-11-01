import React, { useState, useCallback } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import ThreeDViewer from '@/components/ThreeDViewer';
import { cn } from '@/lib/utils';

type ViewType = 'default' | 'front' | 'back' | 'top' | 'side';

const Index = () => {
    const [currentView, setCurrentView] = useState<ViewType>('default');
    const [isExploded, setIsExploded] = useState(false);
    const [showPhone, setShowPhone] = useState(true);
    const [isRotating, setIsRotating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadingComplete = useCallback(() => {
        setIsLoading(false);
    }, []);

    const setView = (view: ViewType) => {
        setCurrentView(view);
    };

    const toggleExploded = () => {
        setIsExploded(prev => !prev);
    };

    const togglePhone = () => {
        setShowPhone(prev => !prev);
    };

    const toggleRotation = () => {
        setIsRotating(prev => !prev);
    };

    const resetView = () => {
        setCurrentView('default');
        setIsExploded(false);
        setShowPhone(true);
        setIsRotating(false);
    };

    const Button = ({ viewKey, label, onClick, isActive, icon }: { viewKey: string, label: string, onClick: () => void, isActive: boolean, icon: string }) => (
        <button
            onClick={onClick}
            className={cn(
                "border-none px-4 py-3 rounded-xl font-bold cursor-pointer transition-all duration-300 text-base",
                "bg-gradient-to-br from-[#00C9FF] to-[#0080FF] text-white",
                "hover:translate-y-[-4px] hover:shadow-[0_10px_35px_rgba(0,200,255,0.5)]",
                isActive && "bg-gradient-to-br from-[#92FE9D] to-[#00F260] text-gray-900 shadow-[0_10px_35px_rgba(0,242,96,0.5)]"
            )}
            id={`btn-${viewKey}`}
        >
            {icon} {label}
        </button>
    );

    const SpecCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="bg-gradient-to-br from-[rgba(45,55,72,0.95)] to-[rgba(26,32,44,0.95)] p-8 rounded-[20px] border-2 border-[rgba(0,200,255,0.3)]">
            <h3 className="text-2xl font-bold mb-4 text-[#00C9FF]">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2d3748] to-[#1a202c] text-[#e2e8f0] overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto p-8 md:p-12 lg:p-16">
                
                {/* Header */}
                <div className="text-center p-12 bg-gradient-to-br from-[rgba(45,55,72,0.95)] to-[rgba(26,32,44,0.95)] rounded-[25px] mb-10 border-3 border-[rgba(0,200,255,0.4)] shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
                    <h1 className="text-6xl font-black mb-5" style={{ 
                        background: 'linear-gradient(135deg, #00C9FF, #92FE9D)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        🎮 PocketJoystick Pro Grip
                    </h1>
                    <p className="text-3xl text-[#00C9FF] mb-4 font-bold">3D Console Controller Model</p>
                    <p className="text-lg text-[#a0aec0]">Horizontal phone • Console-style layout • Ergonomic grips</p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-4 p-6 bg-gradient-to-br from-[rgba(45,55,72,0.95)] to-[rgba(26,32,44,0.95)] rounded-[20px] border-2 border-[rgba(0,200,255,0.3)] mb-10">
                    <Button 
                        viewKey="default" 
                        label="Default View" 
                        onClick={() => setView('default')} 
                        isActive={currentView === 'default'} 
                        icon="🎯" 
                    />
                    <Button 
                        viewKey="front" 
                        label="Front View" 
                        onClick={() => setView('front')} 
                        isActive={currentView === 'front'} 
                        icon="📱" 
                    />
                    <Button 
                        viewKey="back" 
                        label="Back View" 
                        onClick={() => setView('back')} 
                        isActive={currentView === 'back'} 
                        icon="🔙" 
                    />
                    <Button 
                        viewKey="top" 
                        label="Top View" 
                        onClick={() => setView('top')} 
                        isActive={currentView === 'top'} 
                        icon="⬆️" 
                    />
                    <Button 
                        viewKey="side" 
                        label="Side View" 
                        onClick={() => setView('side')} 
                        isActive={currentView === 'side'} 
                        icon="↔️" 
                    />
                    <Button 
                        viewKey="explode" 
                        label={isExploded ? '🔧 Assemble' : '💥 Explode View'} 
                        onClick={toggleExploded} 
                        isActive={isExploded} 
                        icon="" 
                    />
                    <Button 
                        viewKey="phone" 
                        label={showPhone ? '📱 Hide Phone' : '📱 Show Phone'} 
                        onClick={togglePhone} 
                        isActive={!showPhone} 
                        icon="" 
                    />
                    <Button 
                        viewKey="rotate" 
                        label={isRotating ? '⏸️ Stop Rotation' : '🔄 Auto Rotate'} 
                        onClick={toggleRotation} 
                        isActive={isRotating} 
                        icon="" 
                    />
                    <Button 
                        viewKey="reset" 
                        label="Reset All" 
                        onClick={resetView} 
                        isActive={false} 
                        icon="🔁" 
                    />
                </div>

                {/* 3D Canvas Container */}
                <div className="relative bg-gradient-to-br from-[#4a5568] to-[#2d3748] rounded-[30px] p-12 border-3 border-[rgba(0,200,255,0.3)] mb-10 shadow-[0_25px_80px_rgba(0,0,0,0.6)] min-h-[900px]">
                    {isLoading && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-[#00C9FF] font-bold z-10 flex flex-col items-center">
                            <div className="text-5xl mb-2 animate-spin-slow">🎮</div>
                            Loading 3D Model...
                        </div>
                    )}
                    <ThreeDViewer 
                        view={currentView}
                        isExploded={isExploded}
                        showPhone={showPhone}
                        isRotating={isRotating}
                        onLoadingComplete={handleLoadingComplete}
                    />
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SpecCard title="📱 Phone Layout">
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Orientation:</strong> Horizontal/Landscape</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Size:</strong> 5.5" - 6.9" screens</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Position:</strong> Center (like Nintendo Switch)</p>
                    </SpecCard>

                    <SpecCard title="🕹️ Controls">
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Left:</strong> Analog stick + D-Pad</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Right:</strong> ABXY buttons (color-coded)</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Top:</strong> L1/L2 + R1/R2 triggers</p>
                    </SpecCard>

                    <SpecCard title="🎮 Design">
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Style:</strong> Xbox/PlayStation layout</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Grips:</strong> Curved ergonomic handles</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Weight:</strong> 180g (balanced)</p>
                    </SpecCard>

                    <SpecCard title="⚡ Performance">
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Latency:</strong> &lt; 10ms</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Battery:</strong> 100+ hours</p>
                        <p className="text-[#cbd5e0] leading-relaxed"><strong>Connection:</strong> Bluetooth 5.0</p>
                    </SpecCard>
                </div>
            </div>
            <MadeWithDyad />
        </div>
    );
};

export default Index;