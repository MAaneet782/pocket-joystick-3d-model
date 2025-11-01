import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { createControllerModel, ControllerGroups } from '@/utils/controller-model';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

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
    const composerRef = useRef<EffectComposer | null>(null);
    const controllerGroupsRef = useRef<ControllerGroups | null>(null);
    const animationFrameRef = useRef<number>();

    // --- Initialization ---
    const initThree = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111827); // Darker background to match page
        scene.fog = new THREE.Fog(0x111827, 15, 30);
        sceneRef.current = scene;

        // Camera
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        camera.position.copy(CAMERA_POSITIONS.default);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        // Post-processing Composer
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.7, // Strength
            0.1, // Radius
            0.1  // Threshold
        );
        composer.addPass(bloomPass);
        composerRef.current = composer;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xa0c4ff, 1.0);
        fillLight.position.set(-10, 8, -10);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0x00C9FF, 1.5, 20);
        rimLight.position.set(0, 10, -10);
        scene.add(rimLight);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(50, 50);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x111827,
            metalness: 0.1,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -3;
        ground.receiveShadow = true;
        scene.add(ground);

        // Create controller
        const groups = createControllerModel();
        controllerGroupsRef.current = groups;
        scene.add(groups.controller);

        onLoadingComplete();
    }, [onLoadingComplete]);

    // --- Animation Loop ---
    const animate = useCallback(() => {
        if (!composerRef.current || !controllerGroupsRef.current) return;

        if (isRotating) {
            controllerGroupsRef.current.controller.rotation.y += 0.005;
        }

        composerRef.current.render();
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
                
                controller.rotation.y += deltaX * 0.005; 
                controller.rotation.x += deltaY * 0.005;
                
                controller.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controller.rotation.x));

                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
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
            const camera = cameraRef.current;
            const renderer = rendererRef.current;
            const composer = composerRef.current;

            if (camera && renderer && composer) {
                const width = window.innerWidth;
                const height = window.innerHeight;

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                composer.setSize(width, height);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <canvas 
            ref={canvasRef} 
            id="canvas3d" 
            className="fixed top-0 left-0 w-full h-full -z-10 cursor-grab active:cursor-grabbing"
        />
    );
};

export default ThreeDViewer;