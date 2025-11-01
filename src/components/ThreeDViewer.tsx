import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cn } from '@/lib/utils';
import { createControllerModel, ControllerGroups } from '@/utils/controller-model';
import ModelControls from './ModelControls';

// Explosion offsets and speed for smooth transition
const EXPLOSION_OFFSET_X = 2.5;
const EXPLOSION_OFFSET_Y = 1.5;
const EXPLOSION_OFFSET_Z = 1.0;
const LERP_SPEED = 0.05; 

// Initial positions defined in controller-model.ts
const INITIAL_LEFT_GRIP_POS = new THREE.Vector3(-2.2, -0.2, 0);
const INITIAL_RIGHT_GRIP_POS = new THREE.Vector3(2.2, -0.2, 0);

const targetPositions = {
    phone: new THREE.Vector3(0, 0, 0),
    leftGrip: INITIAL_LEFT_GRIP_POS.clone(),
    rightGrip: INITIAL_RIGHT_GRIP_POS.clone(),
    triggerGroup: new THREE.Vector3(0, 0, 0),
};

// Highlight Material (Orange emissive)
const highlightMat = new THREE.MeshStandardMaterial({
    color: 0xffa500, 
    emissive: 0xffa500,
    emissiveIntensity: 0.5,
    metalness: 0.1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8
});

const ThreeDViewer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<ControllerGroups | null>(null);
    
    const [isExploded, setIsExploded] = React.useState(false);
    const [isPhoneVisible, setIsPhoneVisible] = React.useState(true);
    const [isControlsVisible, setIsControlsVisible] = React.useState(true);


    const updateTargetPositions = useCallback((exploded: boolean) => {
        if (!modelRef.current) return;

        if (exploded) {
            targetPositions.phone.set(0, 0, EXPLOSION_OFFSET_Z);
            targetPositions.leftGrip.set(INITIAL_LEFT_GRIP_POS.x - EXPLOSION_OFFSET_X, INITIAL_LEFT_GRIP_POS.y, INITIAL_LEFT_GRIP_POS.z);
            targetPositions.rightGrip.set(INITIAL_RIGHT_GRIP_POS.x + EXPLOSION_OFFSET_X, INITIAL_RIGHT_GRIP_POS.y, INITIAL_RIGHT_GRIP_POS.z);
            targetPositions.triggerGroup.set(0, EXPLOSION_OFFSET_Y, 0);
        } else {
            targetPositions.phone.set(0, 0, 0);
            targetPositions.leftGrip.copy(INITIAL_LEFT_GRIP_POS);
            targetPositions.rightGrip.copy(INITIAL_RIGHT_GRIP_POS);
            targetPositions.triggerGroup.set(0, 0, 0);
        }
    }, []);

    const setupScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // 1. Scene, Camera, Renderer, Controls, Lighting, Ground Plane (omitted for brevity, assumed functional)
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a); // Dark background
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        // Adjusted camera position: slightly higher (Y=1) and further back (Z=7)
        camera.position.set(0, 1, 7); 
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 15;
        // Set target slightly higher to center the raised model
        controls.target.set(0, 0.5, 0); 
        controlsRef.current = controls;

        // --- Enhanced Lighting for Realism ---
        
        // Ambient Light (General fill)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
        scene.add(ambientLight);

        // Hemisphere Light (Simulates environmental bounce/sky)
        const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.5);
        scene.add(hemisphereLight);

        // Directional Light (Main key light, increased intensity for PBR materials)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); 
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
        
        // Subtle Point Light for Specular Highlights
        const pointLight = new THREE.PointLight(0xffffff, 10, 10);
        pointLight.position.set(-3, 3, 3);
        scene.add(pointLight);


        const planeGeo = new THREE.PlaneGeometry(20, 20);
        const planeMat = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide }); // Darker plane
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -1.5;
        plane.receiveShadow = true;
        scene.add(plane);

        // 7. Load Model
        const controllerModel = createControllerModel();
        scene.add(controllerModel.controller);
        modelRef.current = controllerModel;
        
        updateTargetPositions(isExploded);

        // --- Interaction Setup (Raycasting) ---
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let currentHighlightedGroup: THREE.Group | null = null;
        
        const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
        const groupsToInteract = [
            controllerModel.phoneGroup,
            controllerModel.leftGrip,
            controllerModel.rightGrip,
            controllerModel.triggerGroup,
            controllerModel.controlElementsGroup, // Include new group for interaction
        ];

        // Store original materials
        groupsToInteract.forEach(group => {
            group.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    originalMaterials.set(child, child.material);
                }
            });
        });

        const applyHighlight = (group: THREE.Group) => {
            if (currentHighlightedGroup === group) return;

            // Remove highlight from previous group
            if (currentHighlightedGroup) {
                removeHighlight();
            }

            // Apply highlight to new group
            group.traverse(child => {
                if (child instanceof THREE.Mesh && originalMaterials.has(child)) {
                    child.material = highlightMat;
                }
            });
            currentHighlightedGroup = group;
        };

        const removeHighlight = () => {
            if (currentHighlightedGroup) {
                currentHighlightedGroup.traverse(child => {
                    if (child instanceof THREE.Mesh && originalMaterials.has(child)) {
                        child.material = originalMaterials.get(child)!;
                    }
                });
                currentHighlightedGroup = null;
            }
        };

        const onPointerMove = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        canvas.addEventListener('pointermove', onPointerMove);

        // 8. Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            
            // Lerp model groups towards target positions
            if (modelRef.current) {
                modelRef.current.phoneGroup.position.lerp(targetPositions.phone, LERP_SPEED);
                modelRef.current.leftGrip.position.lerp(targetPositions.leftGrip, LERP_SPEED);
                modelRef.current.rightGrip.position.lerp(targetPositions.rightGrip, LERP_SPEED);
                modelRef.current.triggerGroup.position.lerp(targetPositions.triggerGroup, LERP_SPEED);

                // Apply visibility based on state
                modelRef.current.phoneGroup.visible = isPhoneVisible;
                modelRef.current.controlElementsGroup.visible = isControlsVisible;
            }

            // Raycasting check
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(controllerModel.controller.children, true);

            if (intersects.length > 0) {
                const intersectedMesh = intersects[0].object as THREE.Mesh;
                
                // Find the top-level group (phoneGroup, leftGrip, rightGrip, triggerGroup, controlElementsGroup)
                let parentGroup: THREE.Group | null = null;
                let current = intersectedMesh.parent;
                
                // Traverse up the hierarchy until we hit one of the main interactive groups or the controller root
                while (current && current !== controllerModel.controller) {
                    if (groupsToInteract.includes(current as THREE.Group)) {
                        parentGroup = current as THREE.Group;
                        break;
                    }
                    current = current.parent;
                }

                if (parentGroup && parentGroup.visible) {
                    applyHighlight(parentGroup);
                } else {
                    removeHighlight();
                }
            } else {
                removeHighlight();
            }

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
            canvas.removeEventListener('pointermove', onPointerMove);
            renderer.dispose();
            controls.dispose();
        };
    }, [isExploded, updateTargetPositions, isPhoneVisible, isControlsVisible]);

    useEffect(() => {
        const cleanup = setupScene();
        return cleanup;
    }, [setupScene]);

    const handleToggleExplosion = useCallback(() => {
        setIsExploded(prev => {
            const newState = !prev;
            updateTargetPositions(newState);
            return newState;
        });
    }, [updateTargetPositions]);

    const handleResetCamera = useCallback(() => {
        if (controlsRef.current && cameraRef.current) {
            controlsRef.current.reset();
            cameraRef.current.position.set(0, 1, 7); // Reset to new default position
            controlsRef.current.target.set(0, 0.5, 0); // Reset target
        }
    }, []);
    
    const handleTogglePhoneVisibility = useCallback(() => {
        setIsPhoneVisible(prev => !prev);
    }, []);

    const handleToggleControlsVisibility = useCallback(() => {
        setIsControlsVisible(prev => !prev);
    }, []);


    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full p-4">
            <canvas
                ref={canvasRef} 
                id="canvas3d" 
                className={cn(
                    "w-full h-[80vh] max-w-4xl border rounded-lg shadow-lg bg-background flex-grow"
                )}
            />
            <div className="lg:w-1/4 w-full">
                <ModelControls 
                    isExploded={isExploded}
                    onToggleExplosion={handleToggleExplosion}
                    onResetCamera={handleResetCamera}
                    isPhoneVisible={isPhoneVisible}
                    onTogglePhoneVisibility={handleTogglePhoneVisibility}
                    isControlsVisible={isControlsVisible}
                    onToggleControlsVisibility={handleToggleControlsVisibility}
                />
            </div>
        </div>
    );
};

export default ThreeDViewer;