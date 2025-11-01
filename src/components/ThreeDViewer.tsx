import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createControllerModel, ControllerGroups } from '@/utils/controller-model';
import { cn } from '@/lib/utils';

interface ThreeDViewerProps {
    view: 'default' | 'front' | 'back' | 'top' | 'side';
    isExploded: boolean;
    showPhone: boolean;
    isRotating: boolean;
    onLoadingComplete: () => void;
}

const CAMERA_POSITIONS = {
    default: new THREE.Vector3(0, 5, 12),
    front: new THREE.Vector3(0, 2, 14),
    back: new THREE.Vector3(0, 2, -14),
    top: new THREE.Vector3(0, 15, 0.1),
    side: new THREE.Vector3(14, 2, 0),
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    view, 
    isExploded, 
    showPhone, 
    isRotating,
    onLoadingComplete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controllerGroupsRef = useRef<ControllerGroups | null>(null);
    const animationFrameRef = useRef<number>();

    // --- Initialization ---
    const initThree = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x5a6c7d);
        scene.fog = new THREE.Fog(0x5a6c7d, 15, 30);
        sceneRef.current = scene;

        // Camera
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        camera.position.copy(CAMERA_POSITIONS.default);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth / 2, canvas.clientHeight / 2); // Start smaller for performance
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        // Lights
        // Increased ambient light slightly to compensate for darker materials
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
        scene.add(ambientLight);

        // Main directional light (stronger)
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        scene.add(mainLight);

        // Fill light (so shadows aren't pure black)
        const fillLight = new THREE.DirectionalLight(0xa0c4ff, 1.0);
        fillLight.position.set(-10, 8, -10);
        scene.add(fillLight);

        // Rim light for highlights on edges
        const rimLight = new THREE.PointLight(0x00C9FF, 1.5, 20);
        rimLight.position.set(0, 10, -10);
        scene.add(rimLight);

        // Ground
        const groundGeo = new THREE.CircleGeometry(20, 64);
        const groundMat = new THREE.ShadowMaterial({ opacity: 0.4 }); // Slightly darker shadow
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -3;
        ground.receiveShadow = true;
        scene.add(ground);

        // Grid (kept for aesthetic background)
        const gridHelper = new THREE.GridHelper(20, 20, 0x00C9FF, 0x4a5568);
        gridHelper.position.y = -2.95;
        (gridHelper.material as THREE.Material).opacity = 0.3;
        (gridHelper.material as THREE.Material).transparent = true;
        scene.add(gridHelper);

        // Create controller
        const groups = createControllerModel();
        controllerGroupsRef.current = groups;
        scene.add(groups.controller);

        onLoadingComplete();
    }, [onLoadingComplete]);

    // --- Animation Loop ---
    const animate = useCallback(() => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        if (isRotating && controllerGroupsRef.current) {
            controllerGroupsRef.current.controller.rotation.y += 0.005;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [isRotating]);

    useEffect(() => {
        initThree();
        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [initThree, animate]);

    // --- Interaction Handlers (Mouse/Touch) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const camera = cameraRef.current;
        const controller = controllerGroupsRef.current?.controller;

        if (!canvas || !camera || !controller) return;

        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                // Rotation sensitivity adjustment
                controller.rotation.y += deltaX * 0.005; 
                controller.rotation.x += deltaY * 0.005;
                
                // Clamp X rotation to prevent flipping
                controller.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controller.rotation.x));

                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Zoom sensitivity adjustment
            camera.position.z += e.deltaY * 0.005; 
            camera.position.z = Math.max(6, Math.min(20, camera.position.z));
        };

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onWheel);

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('wheel', onWheel);
        };
    }, []);

    // --- View/State Updates ---

    // Handle Camera View changes
    useEffect(() => {
        const camera = cameraRef.current;
        if (camera) {
            const targetPosition = CAMERA_POSITIONS[view];
            camera.position.copy(targetPosition);
            camera.lookAt(0, 0, 0);
        }
    }, [view]);

    // Handle Exploded View changes
    useEffect(() => {
        const groups = controllerGroupsRef.current;
        if (groups) {
            // Use a slightly smaller offset for a cleaner exploded view
            const offset = isExploded ? 1.8 : 0; 
            
            groups.phoneGroup.position.z = offset;
            groups.leftGrip.position.x = -2.2 - offset; 
            groups.rightGrip.position.x = 2.2 + offset; 
            groups.triggerGroup.position.y = offset;
        }
    }, [isExploded]);

    // Handle Phone Visibility changes
    useEffect(() => {
        const groups = controllerGroupsRef.current;
        if (groups) {
            groups.phoneGroup.visible = showPhone;
        }
    }, [showPhone]);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const camera = cameraRef.current;
            const renderer = rendererRef.current;

            if (canvas && camera && renderer) {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <canvas 
            ref={canvasRef} 
            id="canvas3d" 
            className={cn(
                "w-full h-full block rounded-[20px] cursor-grab active:cursor-grabbing",
                "bg-[radial-gradient(circle_at_center,_#4a5568_0%,_#2d3748_100%)]" // Darker background gradient
            )}
        />
    );
};

export default ThreeDViewer;