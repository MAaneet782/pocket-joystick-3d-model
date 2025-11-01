import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThreeDViewerProps {
  // Define props if necessary, assuming none for simplicity unless context dictates otherwise
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Placeholder for Three.js initialization logic
            console.log("Initializing 3D viewer on canvas:", canvasRef.current.id);
            
            // In a real scenario, Three.js setup (scene, camera, renderer) would go here.
            // The renderer size should be updated based on the canvas dimensions provided by CSS.
        }
    }, []);

    return (
        <div className="flex justify-center w-full p-4">
            <canvas
                ref={canvasRef} 
                id="canvas3d" 
                // Using w-full and h-[80vh] to make it large and fit the page
                className={cn(
                    "w-full h-[80vh] max-w-4xl border rounded-lg shadow-lg bg-gray-50"
                )}
            />
        </div>
    );
};

export default ThreeDViewer;