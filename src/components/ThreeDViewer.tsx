import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cn } from '@/lib/utils';
import { createControllerModel, ControllerGroups } from '@/utils/controller-model';

const ThreeDViewer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<ControllerGroups | null>(null);

    const setupScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Get dimensions from the canvas element defined by CSS
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // 1. Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0); // Light background
        sceneRef.current = scene;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 6);
        cameraRef.current = camera;

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        // 4. Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 15;
        controlsRef.current = controls;

        // 5. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        scene.add(directionalLight);

        // 6. Ground Plane (for shadows)
        const planeGeo = new THREE.PlaneGeometry(20, 20);
        const planeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -1.5;
        plane.receiveShadow = true;
        scene.add(plane);

        // 7. Load Model
        const controllerModel = createControllerModel();
        scene.add(controllerModel.controller);
        modelRef.current = controllerModel;

        // 8. Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // 9. Handle Resize
        const handleResize = () => {
            const newWidth = canvas.clientWidth;
            const newHeight = canvas.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            controls.dispose();
        };
    }, []);

    useEffect(() => {
        const cleanup = setupScene();
        return cleanup;
    }, [setupScene]);

    return (
        <div className="flex justify-center w-full p-4">
            <canvas
                ref={canvasRef} 
                id="canvas3d" 
                className={cn(
                    "w-full h-[80vh] max-w-4xl border rounded-lg shadow-lg bg-gray-50"
                )}
            />
        </div>
    );
};

export default ThreeDViewer;