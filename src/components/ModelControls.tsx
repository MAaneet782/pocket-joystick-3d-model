import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Smartphone, Grip, ArrowUp, Camera, Gamepad } from 'lucide-react';

interface ModelControlsProps {
    isExploded: boolean;
    onToggleExplosion: () => void;
    onResetCamera: () => void;
    isPhoneVisible: boolean;
    onTogglePhoneVisibility: () => void;
    isControlsVisible: boolean;
    onToggleControlsVisibility: () => void;
}

const ModelControls: React.FC<ModelControlsProps> = ({ 
    isExploded, 
    onToggleExplosion, 
    onResetCamera,
    isPhoneVisible,
    onTogglePhoneVisibility,
    isControlsVisible,
    onToggleControlsVisibility
}) => {
    return (
        <Card className="w-full max-w-xs lg:max-w-sm h-fit">
            <CardHeader>
                <CardTitle>Model Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                
                {/* Explosion Controls */}
                <Button 
                    onClick={onToggleExplosion} 
                    className="w-full"
                    variant={isExploded ? "destructive" : "default"}
                >
                    <Zap className="mr-2 h-4 w-4" />
                    {isExploded ? "Reassemble Model" : "Explode View"}
                </Button>
                
                <Button 
                    onClick={onResetCamera} 
                    className="w-full"
                    variant="secondary"
                >
                    <Camera className="mr-2 h-4 w-4" />
                    Reset Camera View
                </Button>
                
                {/* Visibility Controls */}
                <div className="pt-4 space-y-2 border-t mt-4">
                    <h3 className="font-semibold text-sm text-foreground">Component Visibility:</h3>
                    <Button 
                        onClick={onTogglePhoneVisibility} 
                        className="w-full"
                        variant={isPhoneVisible ? "outline" : "secondary"}
                    >
                        <Smartphone className="mr-2 h-4 w-4" />
                        {isPhoneVisible ? "Hide Phone Body" : "Show Phone Body"}
                    </Button>
                    <Button 
                        onClick={onToggleControlsVisibility} 
                        className="w-full"
                        variant={isControlsVisible ? "outline" : "secondary"}
                    >
                        <Gamepad className="mr-2 h-4 w-4" />
                        {isControlsVisible ? "Hide Other Controls" : "Show Other Controls"}
                    </Button>
                </div>

                {/* Legend */}
                <div className="text-sm text-muted-foreground pt-4 border-t mt-4">
                    <h3 className="font-semibold mb-1 text-foreground">Explosion Movement:</h3>
                    <ul className="space-y-1">
                        <li className="flex items-center"><Smartphone className="h-4 w-4 mr-2 text-blue-500" /> Phone Body (Z-axis)</li>
                        <li className="flex items-center"><Grip className="h-4 w-4 mr-2 text-green-500" /> Left/Right Grips (X-axis)</li>
                        <li className="flex items-center"><ArrowUp className="h-4 w-4 mr-2 text-red-500" /> Triggers/Shoulders (Y-axis)</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default ModelControls;