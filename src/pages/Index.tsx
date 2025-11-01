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
                "flex items-center justify-center gap-2 border-none px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 text-sm md:text-base whitespace-nowrap",
                "bg-gray-700 text-white shadow-lg",
                "hover:bg-gray-600 hover:translate-y-[-2px] hover:shadow-xl",
                isActive && "bg-gradient-to-br from-[#00C9FF] to-[#0080FF] text-white shadow-[0_5px_20px_rgba(0,200,255,0.5)]",
                isActive && "hover:from-[#0080FF] hover:to-[#00C9FF] hover:translate-y-0"
            )}
            id={`btn-${viewKey}`}
        >
            <span className="text-lg">{icon}</span> <span>{label}</span>
        </button>
    );

    const SpecCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 rounded-[20px] border border-gray-700 shadow-2xl transition-transform hover:scale-[1.02] duration-300">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#00C9FF] border-b border-[#00C9FF]/30 pb-2">{title}</h3>
            <div className="space-y-2 text-sm md:text-base">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12">
                
                {/* Header */}
                <div className="text-center p-8 md:p-12 bg-gray-800 rounded-[25px] mb-10 shadow-2xl border border-gray-700">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-3" style={{ 
                        background: 'linear-gradient(135deg, #00C9FF, #92FE9D)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        PocketJoystick Pro Grip
                    </h1>
                    <p className="text-xl md:text-3xl text-[#00C9FF] mb-4 font-bold">3D Console Controller Model</p>
                    <p className="text-md text-gray-400 max-w-3xl mx-auto">Explore the modular design and ergonomic features of the next-generation mobile gaming controller.</p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-4 md:p-6 bg-gray-800 rounded-[20px] border border-gray-700 mb-10 shadow-xl">
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
                        label={isExploded ? 'Assemble' : 'Explode View'} 
                        onClick={toggleExploded} 
                        isActive={isExploded} 
                        icon={isExploded ? '🔧' : '💥'} 
                    />
                    <Button 
                        viewKey="phone" 
                        label={showPhone ? 'Hide Phone' : 'Show Phone'} 
                        onClick={togglePhone} 
                        isActive={!showPhone} 
                        icon="📱" 
                    />
                    <Button 
                        viewKey="rotate" 
                        label={isRotating ? 'Stop Rotation' : 'Auto Rotate'} 
                        onClick={toggleRotation} 
                        isActive={isRotating} 
                        icon={isRotating ? '⏸️' : '🔄'} 
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
                <div className="relative bg-gray-800 rounded-[30px] border border-gray-700 mb-10 shadow-2xl min-h-[70vh] xl:min-h-[850px] flex items-center justify-center overflow-hidden">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SpecCard title="📱 Phone Layout">
                        <p className="text-gray-300 leading-relaxed"><strong>Orientation:</strong> Horizontal/Landscape</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Size:</strong> 5.5" - 6.9" screens</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Position:</strong> Center (like Nintendo Switch)</p>
                    </SpecCard>

                    <SpecCard title="🕹️ Controls">
                        <p className="text-gray-300 leading-relaxed"><strong>Left:</strong> Analog stick + D-Pad</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Right:</strong> ABXY buttons (color-coded)</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Top:</strong> L1/L2 + R1/R2 triggers</p>
                    </SpecCard>

                    <SpecCard title="🎮 Design">
                        <p className="text-gray-300 leading-relaxed"><strong>Style:</strong> Xbox/PlayStation layout</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Grips:</strong> Curved ergonomic handles</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Weight:</strong> 180g (balanced)</p>
                    </SpecCard>

                    <SpecCard title="⚡ Performance">
                        <p className="text-gray-300 leading-relaxed"><strong>Latency:</strong> &lt; 10ms</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Battery:</strong> 100+ hours</p>
                        <p className="text-gray-300 leading-relaxed"><strong>Connection:</strong> Bluetooth 5.0</p>
                    </SpecCard>
                </div>
            </div>
            <MadeWithDyad />
        </div>
    );
};

export default Index;