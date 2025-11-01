import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { cn } from '@/lib/utils';
import { createControllerModel, ControllerGroups } from '@/utils/controller-model';
import ModelControls from './ModelControls';

// Explosion offsets and speed for smooth transition
const EXPLOSION_OFFSET_X = 2.5;
const EXPLOSION_OFFSET_Y = 1.5;
const EXPLOSION_OFFSET_Z = 1.0;
const LERP_SPEED = 0.05; 

// Initial positions
const INITIAL_LEFT_GRIP_POS = new THREE.Vector3(-2.3, -0.2, 0);
const INITIAL_RIGHT_GRIP_POS = new THREE.Vector3(2.3, -0.2, 0);

const targetPositions = {
    phone: new THREE.Vector3(0, 0, 0),
    leftGrip: INITIAL_LEFT_GRIP_POS.clone(),
    rightGrip: INITIAL_RIGHT_GRIP_POS.clone(),
    triggerGroup: new THREE.Vector3(0, 0, 0),
};

// Highlight Material
const highlightMat = new THREE.MeshStandardMaterial({
    color: 0xffa500, 
    emissive: 0xffa500,
    emissiveIntensity: 0.8,
    toneMapped: false,
    transparent: true,
    opacity: 0.9
});

const ThreeDViewer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<ControllerGroups | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    
    const [isExploded, setIsExploded] = React.useState(false);
    const [isPhoneVisible, setIsPhoneVisible] = React.useState(true);
    const [isControlsVisible, setIsControlsVisible] = React.useState(true);

    const updateTargetPositions = useCallback((exploded: boolean) => {
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111); // Darker background
        scene.fog = new THREE.Fog(0x111111, 10, 25);

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000); // Tighter FOV
        camera.position.set(0, 1.5, 8); 

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 4;
        controls.maxDistance = 15;
        controls.target.set(0, 0.5, 0); 
        controlsRef.current = controls;

        // --- Post-processing for Bloom Effect ---
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.2, 0.9); // Tuned bloom
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // --- Professional 3-Point Lighting ---
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
        keyLight.position.set(-5, 5, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x88aaff, 0.8);
        fillLight.position.set(5, 2, 5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffaaff, 1.0);
        rimLight.position.set(0, 3, -5);
        scene.add(rimLight);
        
        const groundPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.9, metalness: 0.1 })
        );
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.position.y = -2;
        groundPlane.receiveShadow = true;
        scene.add(groundPlane);

        const controllerModel = createControllerModel();
        scene.add(controllerModel.controller);
        modelRef.current = controllerModel;
        
        updateTargetPositions(isExploded);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let currentHighlightedGroup: THREE.Group | null = null;
        
        const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
        const groupsToInteract = [
            controllerModel.phoneGroup,
            controllerModel.leftGrip,
            controllerModel.rightGrip,
            controllerModel.triggerGroup,
        ];

        groupsToInteract.forEach(group => {
            group.traverse(child => {
                if (child instanceof THREE.Mesh) originalMaterials.set(child, child.material);
            });
        });

        const applyHighlight = (group: THREE.Group) => {
            if (currentHighlightedGroup === group) return;
            if (currentHighlightedGroup) removeHighlight();
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

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            
            if (modelRef.current) {
                modelRef.current.phoneGroup.position.lerp(targetPositions.phone, LERP_SPEED);
                modelRef.current.leftGrip.position.lerp(targetPositions.leftGrip, LERP_SPEED);
                modelRef.current.rightGrip.position.lerp(targetPositions.rightGrip, LERP_SPEED);
                modelRef.current.triggerGroup.position.lerp(targetPositions.triggerGroup, LERP_SPEED);

                modelRef.current.phoneGroup.visible = isPhoneVisible;
                modelRef.current.controlElementsGroup.visible = isControlsVisible;
            }

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects([controllerModel.controller], true);

            let parentGroup: THREE.Group | null = null;
            if (intersects.length > 0) {
                let current = intersects[0].object.parent;
                while (current) {
                    if (groupsToInteract.includes(current as THREE.Group)) {
                        parentGroup = current as THREE.Group;
                        break;
                    }
                    current = current.parent;
                }
            }
            
            if (parentGroup && parentGroup.visible) {
                applyHighlight(parentGroup);
            } else {
                removeHighlight();
            }

            composer.render();
        };
        animate();

        const handleResize = () => {
            const newWidth = canvas.clientWidth;
            const newHeight = canvas.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
            composer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('pointermove', onPointerMove);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            controls.dispose();
        };
    }, [isExploded, updateTargetPositions, isPhoneVisible, isControlsVisible]);

    const handleToggleExplosion = useCallback(() => setIsExploded(prev => !prev), []);
    const handleResetCamera = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.reset();
            controlsRef.current.object.position.set(0, 1.5, 8);
            controlsRef.current.target.set(0, 0.5, 0);
        }
    }, []);
    const handleTogglePhoneVisibility = useCallback(() => setIsPhoneVisible(prev => !prev), []);
    const handleToggleControlsVisibility = useCallback(() => setIsControlsVisible(prev => !prev), []);

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full p-4">
            <canvas
                ref={canvasRef} 
                id="canvas3d" 
                className={cn("w-full h-[80vh] max-w-4xl border rounded-lg shadow-lg bg-background flex-grow")}
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