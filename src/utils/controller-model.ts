import * as THREE from 'three';

// --- Materials ---

// Main Body/Grip Material (Matte Plastic)
const gripMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
});

// Phone Body & Control Base Material
const phoneMat = new THREE.MeshStandardMaterial({ 
    color: 0x080808,
    metalness: 0.8,
    roughness: 0.2
});

// Screen Material
const screenMat = new THREE.MeshStandardMaterial({ 
    color: 0x4f4f9f, 
    emissive: 0x4f4f9f, 
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.1
});

// Analog Stick Material
const analogStickMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.3 });

// D-Pad Material
const dpadMat = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.1, roughness: 0.5 });

// --- Emissive (Glowing) Materials ---
const ledStripMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const leftAnalogGlowMat = new THREE.MeshBasicMaterial({ color: 0x99ff33 });
const rightAnalogGlowMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });

// --- Geometries ---
const phoneGeo = new THREE.BoxGeometry(3.8, 1.9, 0.2);
const screenGeo = new THREE.BoxGeometry(3.6, 1.7, 0.02);
const analogBaseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
const analogStickGeo = new THREE.SphereGeometry(0.32, 32, 16);
const analogGlowGeo = new THREE.TorusGeometry(0.35, 0.05, 16, 32, Math.PI * 1.2);
const dpadCrossGeo = new THREE.BoxGeometry(0.6, 0.2, 0.08);
const buttonGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 32);
const ledStripGeo = new THREE.BoxGeometry(1.8, 0.08, 0.08);

// PlayStation-style button configuration
const buttonsConfig = [
    { x: 1.95, y: 0, color: 0xff3333 },    // Circle (Right, Red)
    { x: 1.6, y: -0.35, color: 0x3399ff }, // Cross (Bottom, Blue)
    { x: 1.25, y: 0, color: 0xff66ff },    // Square (Left, Pink)
    { x: 1.6, y: 0.35, color: 0x33ff99 }   // Triangle (Top, Green)
];

const createGripShape = () => {
    const gripShape = new THREE.Shape();
    gripShape.moveTo(0, 1);
    gripShape.lineTo(0, 0.3);
    gripShape.quadraticCurveTo(-0.2, 0, -0.3, -0.3);
    gripShape.quadraticCurveTo(-0.4, -0.8, -0.2, -1.3);
    gripShape.lineTo(0.3, -1.3);
    gripShape.lineTo(0.3, 1);
    gripShape.lineTo(0, 1);
    
    const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 };
    return new THREE.ExtrudeGeometry(gripShape, extrudeSettings);
};

export interface ControllerGroups {
    controller: THREE.Group;
    phoneGroup: THREE.Group;
    leftGrip: THREE.Group;
    rightGrip: THREE.Group;
    triggerGroup: THREE.Group;
    controlElementsGroup: THREE.Group;
}

export function createControllerModel(): ControllerGroups {
    const controller = new THREE.Group();
    const phoneGroup = new THREE.Group();
    const leftGrip = new THREE.Group();
    const rightGrip = new THREE.Group();
    const triggerGroup = new THREE.Group();
    const controlElementsGroup = new THREE.Group();

    // --- Phone & Control Base ---
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.castShadow = true;
    phoneGroup.add(phone);

    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.11;
    phoneGroup.add(screen);

    // --- Grips ---
    const leftGripGeo = createGripShape();
    const leftGripMesh = new THREE.Mesh(leftGripGeo, gripMat);
    leftGripMesh.rotation.y = Math.PI / 2;
    leftGripMesh.castShadow = true;
    leftGrip.add(leftGripMesh);
    leftGrip.position.set(-2.3, -0.2, 0);

    const rightGripMesh = leftGripMesh.clone();
    rightGripMesh.rotation.y = -Math.PI / 2;
    rightGrip.add(rightGripMesh);
    rightGrip.position.set(2.3, -0.2, 0);

    // --- LED Strips on Grips ---
    const leftLedStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
    leftLedStrip.position.set(-0.1, -0.5, 0.45);
    leftLedStrip.rotation.y = -Math.PI / 8;
    leftGrip.add(leftLedStrip);

    const rightLedStrip = leftLedStrip.clone();
    rightLedStrip.position.x = 0.1;
    rightLedStrip.rotation.y = Math.PI / 8;
    rightGrip.add(rightLedStrip);

    // --- Left Controls ---
    const leftAnalogBase = new THREE.Mesh(analogBaseGeo, phoneMat);
    leftAnalogBase.rotation.x = Math.PI / 2;
    leftAnalogBase.position.set(-1.6, 0.3, 0.1);
    controlElementsGroup.add(leftAnalogBase);

    const leftAnalogStick = new THREE.Mesh(analogStickGeo, analogStickMat);
    leftAnalogStick.position.set(-1.6, 0.3, 0.25);
    leftAnalogStick.scale.set(1, 1, 0.7);
    leftAnalogStick.castShadow = true;
    controlElementsGroup.add(leftAnalogStick);

    const leftAnalogGlow = new THREE.Mesh(analogGlowGeo, leftAnalogGlowMat);
    leftAnalogGlow.position.copy(leftAnalogStick.position);
    leftAnalogGlow.rotation.z = Math.PI / 1.5;
    controlElementsGroup.add(leftAnalogGlow);

    // --- D-Pad ---
    const dpadH = new THREE.Mesh(dpadCrossGeo, dpadMat);
    dpadH.position.set(-1.6, -0.4, 0.15);
    controlElementsGroup.add(dpadH);
    const dpadV = dpadH.clone();
    dpadV.rotation.z = Math.PI / 2;
    controlElementsGroup.add(dpadV);

    // --- Right Controls (Buttons) ---
    buttonsConfig.forEach(btn => {
        const button = new THREE.Mesh(buttonGeo, new THREE.MeshBasicMaterial({ color: btn.color }));
        button.rotation.x = Math.PI / 2;
        button.position.set(btn.x, btn.y, 0.15);
        controlElementsGroup.add(button);
    });

    // --- Right Analog Stick ---
    const rightAnalogBase = leftAnalogBase.clone();
    rightAnalogBase.position.set(1.6, -0.4, 0.1);
    controlElementsGroup.add(rightAnalogBase);

    const rightAnalogStick = leftAnalogStick.clone();
    rightAnalogStick.position.set(1.6, -0.4, 0.25);
    controlElementsGroup.add(rightAnalogStick);

    const rightAnalogGlow = new THREE.Mesh(analogGlowGeo, rightAnalogGlowMat);
    rightAnalogGlow.position.copy(rightAnalogStick.position);
    rightAnalogGlow.rotation.z = -Math.PI / 1.5;
    controlElementsGroup.add(rightAnalogGlow);

    // --- Top Triggers (Simplified) ---
    const triggerGeo = new THREE.BoxGeometry(0.9, 0.3, 0.4);
    const l1 = new THREE.Mesh(triggerGeo, gripMat);
    l1.position.set(-2.2, 1.0, -0.2);
    l1.castShadow = true;
    triggerGroup.add(l1);
    
    const r1 = l1.clone();
    r1.position.set(2.2, 1.0, -0.2);
    triggerGroup.add(r1);

    // --- Assembly ---
    phoneGroup.add(controlElementsGroup);
    controller.add(phoneGroup);
    controller.add(leftGrip);
    controller.add(rightGrip);
    controller.add(triggerGroup);
    controller.position.y = 0.5;

    return { controller, phoneGroup, leftGrip, rightGrip, triggerGroup, controlElementsGroup };
}