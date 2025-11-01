import * as THREE from 'three';

declare module 'three/examples/jsm/controls/OrbitControls.js' {
    export class OrbitControls extends THREE.EventDispatcher {
        constructor(object: THREE.Camera, domElement?: HTMLElement);
        
        // Properties used in ThreeDViewer.tsx
        object: THREE.Camera;
        enableDamping: boolean;
        dampingFactor: number;
        screenSpacePanning: boolean;
        minDistance: number;
        maxDistance: number;
        target: THREE.Vector3;

        // Methods used in ThreeDViewer.tsx
        update(): void;
        dispose(): void;
        reset(): void;
    }
}