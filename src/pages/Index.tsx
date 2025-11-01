import React, { useState, useCallback } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import ThreeDViewer from '@/components/ThreeDViewer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rotate3D, Split, Smartphone, RefreshCw, Play, Pause, Target } from 'lucide-react';

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

    const ControlButton = ({ viewKey, label, onClick, isActive, Icon }: { viewKey: string, label: string, onClick: () => void, isActive: boolean, Icon: React.ElementType }) => (
        <Button
            onClick={onClick}
            variant={isActive ? "default" : "secondary"}
            className={cn(
                "w-full justify-start transition-all duration-300",
                isActive && "bg-gradient-to-r from-[#00C9FF] to-[#0080FF] text-white hover:bg-gradient-to-r hover:from-[#0080FF] hover:to-[#00C9FF]",
                !isActive && "bg-gray-700 text-gray-200 hover:bg-gray-600"
            )}
            id={`btn-${viewKey}`}
        >
            <Icon className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );

    const SpecCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
        <Card className="bg-gray-800 border-gray-700 text-gray-100 shadow-xl transition-transform hover:scale-[1.02] duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#00C9FF]">{title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );

    const ViewControls = () => (
        <Card className="bg-gray-800 border-gray-700 shadow-xl h-full">
            <CardHeader>
                <CardTitle className="text-xl text-white">Camera Views</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <ControlButton 
                    viewKey="default" 
                    label="Default View" 
                    onClick={() => setView('default')} 
                    isActive={currentView === 'default'} 
                    Icon={Target} 
                />
                <ControlButton 
                    viewKey="front" 
                    label="Front View" 
                    onClick={() => setView('front')} 
                    isActive={currentView === 'front'} 
                    Icon={Smartphone} 
                />
                <ControlButton 
                    viewKey="back" 
                    label="Back View" 
                    onClick={() => setView('back')} 
                    isActive={currentView === 'back'} 
                    Icon={Smartphone} 
                />
                <ControlButton 
                    viewKey="top" 
                    label="Top View" 
                    onClick={() => setView('top')} 
                    isActive={currentView === 'top'} 
                    Icon={Rotate3D} 
                />
                <ControlButton 
                    viewKey="side" 
                    label="Side View" 
                    onClick={() => setView('side')} 
                    isActive={currentView === 'side'} 
                    Icon={Rotate3D} 
                />
            </CardContent>
        </Card>
    );

    const ModelControls = () => (
        <Card className="bg-gray-800 border-gray-700 shadow-xl h-full">
            <CardHeader>
                <CardTitle className="text-xl text-white">Model Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <ControlButton 
                    viewKey="explode" 
                    label={isExploded ? 'Assemble Model' : 'Explode View'} 
                    onClick={toggleExploded} 
                    isActive={isExploded} 
                    Icon={Split} 
                />
                <ControlButton 
                    viewKey="phone" 
                    label={showPhone ? 'Hide Phone' : 'Show Phone'} 
                    onClick={togglePhone} 
                    isActive={!showPhone} 
                    Icon={Smartphone} 
                />
                <ControlButton 
                    viewKey="rotate" 
                    label={isRotating ? 'Stop Rotation' : 'Auto Rotate'} 
                    onClick={toggleRotation} 
                    isActive={isRotating} 
                    Icon={isRotating ? Pause : Play} 
                />
                <ControlButton 
                    viewKey="reset" 
                    label="Reset All" 
                    onClick={resetView} 
                    isActive={false} 
                    Icon={RefreshCw} 
                />
            </CardContent>
        </Card>
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
                    <p className="text-xl md:text-3xl text-[#00C9FF] mb-4 font-bold">Interactive 3D Model Dashboard</p>
                    <p className="text-md text-gray-400 max-w-3xl mx-auto">Explore the modular design and ergonomic features of the next-generation mobile gaming controller.</p>
                </div>

                {/* KPI Cards (Top Row) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <SpecCard title="Latency" value="< 10ms" icon={RefreshCw} />
                    <SpecCard title="Battery Life" value="100+ hours" icon={Play} />
                    <SpecCard title="Connection" value="Bluetooth 5.0" icon={Smartphone} />
                    <SpecCard title="Weight" value="180g" icon={Target} />
                </div>

                {/* Main Content: 3D Viewer (Full Width) */}
                <div className="mb-6">
                    <div className="relative bg-gray-800 rounded-[30px] p-4 md:p-8 lg:p-12 border border-gray-700 shadow-2xl min-h-[800px] flex items-center justify-center">
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
                </div>
                
                {/* Controls (Below Viewer, side-by-side on large screens) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ViewControls />
                    <ModelControls />
                </div>
            </div>
            <MadeWithDyad />
        </div>
    );
};

export default Index;