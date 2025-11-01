import React, { useState, useCallback } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import ThreeDViewer from '@/components/ThreeDViewer';
import { cn } from '@/lib/utils';

type ViewType = 'default' | 'front' | 'back' | 'top' | 'side';

const Index = () => {
    const [currentView, setCurrentView] = useState<ViewType>('default');
    const [isExploded, setIsExploded] = useState(false);
    const [showPhone, setShowPhone] = useState(true);
    const [isRotating, setIsRotating] = useState(true); // Auto-rotate by default
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
        setIsRotating(true);
    };

    const Button = ({ viewKey, label, onClick, isActive, icon }: { viewKey: string, label: string, onClick: () => void, isActive: boolean, icon: string }) => (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center justify-center gap-2 border-none px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 text-sm md:text-base whitespace-nowrap",
                "bg-gray-700/80 backdrop-blur-sm text-white shadow-lg",
                "hover:bg-gray-600/80 hover:translate-y-[-2px] hover:shadow-xl",
                isActive && "bg-gradient-to-br from-[#00C9FF] to-[#0080FF] text-white shadow-[0_5px_20px_rgba(0,200,255,0.5)]",
                isActive && "hover:from-[#0080FF] hover:to-[#00C9FF] hover:translate-y-0"
            )}
            id={`btn-${viewKey}`}
        >
            <span className="text-lg">{icon}</span> <span>{label}</span>
        </button>
    );

    const SpecCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 rounded-[20px] border border-gray-700/50 shadow-2xl transition-transform hover:scale-[1.02] duration-300">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#00C9FF] border-b border-[#00C9FF]/30 pb-2">{title}</h3>
            <div className="space-y-2 text-sm md:text-base">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-50 flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 animate-spin-slow">🎮</div>
                    <p className="text-3xl text-[#00C9FF] font-bold">Loading 3D Model...</p>
                </div>
            )}
            <ThreeDViewer 
                view={currentView}
                isExploded={isExploded}
                showPhone={showPhone}
                isRotating={isRotating}
                onLoadingComplete={handleLoadingComplete}
            />
            <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12">
                
                {/* Header */}
                <div className="text-center p-8 md:p-12 bg-gray-800/80 backdrop-blur-md rounded-[25px] mb-10 shadow-2xl border border-gray-700/50">
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
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-4 md:p-6 bg-gray-800/80 backdrop-blur-md rounded-[20px] border border-gray-700/50 mb-10 shadow-xl sticky top-4 z-20">
                    <Button viewKey="default" label="Default" onClick={() => setView('default')} isActive={currentView === 'default'} icon="🎯" />
                    <Button viewKey="front" label="Front" onClick={() => setView('front')} isActive={currentView === 'front'} icon="📱" />
                    <Button viewKey="back" label="Back" onClick={() => setView('back')} isActive={currentView === 'back'} icon="🔙" />
                    <Button viewKey="top" label="Top" onClick={() => setView('top')} isActive={currentView === 'top'} icon="⬆️" />
                    <Button viewKey="side" label="Side" onClick={() => setView('side')} isActive={currentView === 'side'} icon="↔️" />
                    <Button viewKey="explode" label={isExploded ? 'Assemble' : 'Explode'} onClick={toggleExploded} isActive={isExploded} icon={isExploded ? '🔧' : '💥'} />
                    <Button viewKey="phone" label={showPhone ? 'Hide Phone' : 'Show Phone'} onClick={togglePhone} isActive={!showPhone} icon="📱" />
                    <Button viewKey="rotate" label={isRotating ? 'Stop' : 'Rotate'} onClick={toggleRotation} isActive={isRotating} icon={isRotating ? '⏸️' : '🔄'} />
                    <Button viewKey="reset" label="Reset" onClick={resetView} isActive={false} icon="🔁" />
                </div>

                {/* Spacer to create scroll area */}
                <div className="h-[60vh] md:h-[70vh]"></div>

                {/* Specifications Section */}
                <div className="bg-gray-900/80 backdrop-blur-md py-12 px-6 rounded-[25px] border border-gray-700/50">
                    <h2 className="text-center text-4xl font-bold mb-12 text-white">Technical Specifications</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SpecCard title="📱 Phone Layout">
                            <p className="text-gray-300 leading-relaxed"><strong>Orientation:</strong> Horizontal</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Size:</strong> 5.5" - 6.9" screens</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Position:</strong> Center Mount</p>
                        </SpecCard>

                        <SpecCard title="🕹️ Controls">
                            <p className="text-gray-300 leading-relaxed"><strong>Left:</strong> Analog stick + D-Pad</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Right:</strong> ABXY buttons</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Top:</strong> L1/L2 + R1/R2 triggers</p>
                        </SpecCard>

                        <SpecCard title="🎮 Design">
                            <p className="text-gray-300 leading-relaxed"><strong>Style:</strong> Ergonomic Console</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Grips:</strong> Contoured Handles</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Weight:</strong> 180g (balanced)</p>
                        </SpecCard>

                        <SpecCard title="⚡ Performance">
                            <p className="text-gray-300 leading-relaxed"><strong>Latency:</strong> &lt; 10ms (Bluetooth 5.0)</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Battery:</strong> 100+ hours</p>
                            <p className="text-gray-300 leading-relaxed"><strong>Haptics:</strong> Dual-rumble motors</p>
                        </SpecCard>
                    </div>
                </div>
            </div>
            <MadeWithDyad />
        </div>
    );
};

export default Index;