import * as THREE from 'three';

// --- Enhanced Materials for Realism ---

// Main Body/Grip Material (Matte Plastic)
const gripMat = new THREE.MeshStandardMaterial({ 
    color: 0x1f1f1f, // Slightly darker grey/black for main body
    roughness: 0.7, // Slightly rougher matte finish
    metalness: 0.05, // Less metallic
    side: THREE.DoubleSide
});

// Phone Body Material (Glossy Black)
const phoneMat = new THREE.MeshStandardMaterial({ 
    color: 0x121212, // Deep black, but not pure 0x000000
    metalness: 0.95, // Very high metalness for glass/screen look
    roughness: 0.02 // Extremely glossy
});

// Screen Material (Emissive Blue/Cyan)
const screenMat = new THREE.MeshStandardMaterial({ 
    color: 0x00C9FF, 
    emissive: 0x00C9FF, 
    emissiveIntensity: 0.4, // Slightly brighter screen
    metalness: 0.1,
    roughness: 0.1
});

// Bezel Material (Slightly lighter plastic)
const bezelMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    metalness: 0.1, 
    roughness: 0.5 
});

// Button/Stick Materials
const dotMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5 });
const analogBaseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.3 });
const dpadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.2, roughness: 0.4 });
const triggerMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a4a,
    metalness: 0.3,
    roughness: 0.4
});
const lightMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff88,
    transparent: true,
    opacity: 0.9
});
const centerBtnMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });

// --- NEW Colored Materials ---
const leftAnalogStickMat = new THREE.MeshStandardMaterial({ 
    color: 0x2196F3, // Blue
    metalness: 0.4,
    roughness: 0.2
});
const rightAnalogStickMat = new THREE.MeshStandardMaterial({ 
    color: 0xFF1744, // Red
    metalness: 0.4,
    roughness: 0.2
});
const dpadCrossMat = new THREE.MeshStandardMaterial({ 
    color: 0x39FF14, // Green
});


// --- Geometries ---
const phoneGeo = new THREE.BoxGeometry(3.5, 1.8, 0.15);
const screenGeo = new THREE.BoxGeometry(3.3, 1.6, 0.02);
const bezelGeo = new THREE.BoxGeometry(3.5, 0.15, 0.05);
const dotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
const analogBaseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 32);
const ringGeo = new THREE.TorusGeometry(0.52, 0.04, 16, 32);
const analogStickGeo = new THREE.SphereGeometry(0.32, 32, 32);
const dpadGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 32);
const crossH = new THREE.BoxGeometry(0.5, 0.12, 0.08);
const crossV = new THREE.BoxGeometry(0.12, 0.5, 0.08);
const buttonGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.14, 32);
const labelGeo = new THREE.CircleGeometry(0.14, 32);
const triggerGeo = new THREE.BoxGeometry(0.9, 0.3, 0.25);
const l2Geo = new THREE.BoxGeometry(0.9, 0.35, 0.3);
const centerBtnGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 32);
const lightGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16);

const buttonsConfig = [
    { x: 1.6, y: 0.35, color: 0x39FF14, label: 'A' },  // Bottom - Green
    { x: 2.05, y: 0, color: 0xFF1744, label: 'B' },    // Right - Red
    { x: 1.15, y: 0, color: 0x2196F3, label: 'X' },    // Left - Blue
    { x: 1.6, y: -0.35, color: 0xFFEB3B, label: 'Y' }  // Top - Yellow
];

const createGripShape = () => {
    const leftGripShape = new THREE.Shape();
    leftGripShape.moveTo(0, 1);
    leftGripShape.lineTo(0, 0.3);
    leftGripShape.quadraticCurveTo(-0.2, 0, -0.3, -0.3);
    leftGripShape.quadraticCurveTo(-0.35, -0.8, -0.2, -1.2);
    leftGripShape.lineTo(0.2, -1.2);
    leftGripShape.lineTo(0.2, 1);
    leftGripShape.lineTo(0, 1);
    
    const extrudeSettings = { depth: 0.9, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 };
    return new THREE.ExtrudeGeometry(leftGripShape, extrudeSettings);
};

export interface ControllerGroups {
    controller: THREE.Group;
    phoneGroup: THREE.Group;
    leftGrip: THREE.Group;
    rightGrip: THREE.Group;
    triggerGroup: THREE.Group;
    leftControlsGroup: THREE.Group;
    rightControlsGroup: THREE.Group;
}

export function createControllerModel(): ControllerGroups {
    const controller = new THREE.Group();
    
    const phoneGroup = new THREE.Group();
    const leftGrip = new THREE.Group();
    const rightGrip = new THREE.Group();
    const triggerGroup = new THREE.Group();
    const leftControlsGroup = new THREE.Group();
    const rightControlsGroup = new THREE.Group();

    // --- Phone ---
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.castShadow = true;
    phoneGroup.add(phone);

    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.085;
    phoneGroup.add(screen);

    const topBezel = new THREE.Mesh(bezelGeo, bezelMat);
    topBezel.position.set(0, 0.875, 0.1);
    phoneGroup.add(topBezel);
    
    const bottomBezel = topBezel.clone();
    bottomBezel.position.set(0, -0.875, 0.1);
    phoneGroup.add(bottomBezel);

    // --- Grips ---
    const leftGripGeo = createGripShape();
    const leftGripMesh = new THREE.Mesh(leftGripGeo, gripMat);
    leftGripMesh.rotation.y = Math.PI / 2;
    leftGripMesh.castShadow = true;
    leftGrip.add(leftGripMesh);
    leftGrip.position.set(-2.2, -0.2, 0);

    const rightGripMesh = leftGripMesh.clone();
    rightGripMesh.rotation.y = -Math.PI / 2;
    rightGrip.add(rightGripMesh);
    rightGrip.position.set(2.2, -0.2, 0);

    // Small circular accent dots
    for (let i = 0; i < 3; i++) {
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.rotation.x = Math.PI / 2;
        dot.position.set(0, 1 - i * 0.3, 0.5); // Relative to grip
        leftGrip.add(dot);
        
        const dotR = dot.clone();
        rightGrip.add(dotR);
    }

    // --- Left Controls ---
    const analogBase = new THREE.Mesh(analogBaseGeo, analogBaseMat);
    analogBase.rotation.x = Math.PI / 2;
    analogBase.position.set(0.6, -0.2, 0.55); // Relative to grip
    analogBase.castShadow = true;
    leftControlsGroup.add(analogBase);

    const rgbRing = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5 }));
    rgbRing.rotation.x = Math.PI / 2;
    rgbRing.position.set(0.6, -0.2, 0.55); // Relative to grip
    leftControlsGroup.add(rgbRing);

    const analogStick = new THREE.Mesh(analogStickGeo, leftAnalogStickMat); // Blue stick
    analogStick.position.set(0.6, -0.2, 0.72); // Relative to grip
    analogStick.scale.set(1, 1, 0.75);
    analogStick.castShadow = true;
    leftControlsGroup.add(analogStick);

    const dpad = new THREE.Mesh(dpadGeo, dpadMat);
    dpad.rotation.x = Math.PI / 2;
    dpad.position.set(0.6, 0.7, 0.55); // Relative to grip
    dpad.castShadow = true;
    leftControlsGroup.add(dpad);

    const hCross = new THREE.Mesh(crossH, dpadCrossMat); // Green D-pad
    hCross.position.set(0.6, 0.7, 0.62); // Relative to grip
    leftControlsGroup.add(hCross);
    
    const vCross = new THREE.Mesh(crossV, dpadCrossMat); // Green D-pad
    vCross.position.set(0.6, 0.7, 0.62); // Relative to grip
    leftControlsGroup.add(vCross);

    // --- Right Controls (ABXY) ---
    buttonsConfig.forEach(btn => {
        const buttonMat = new THREE.MeshStandardMaterial({ color: btn.color, metalness: 0.3, roughness: 0.3 });
        const button = new THREE.Mesh(buttonGeo, buttonMat);
        button.rotation.x = Math.PI / 2;
        button.position.set(btn.x - 2.2, btn.y + 0.2, 0.6); // Relative to grip
        button.castShadow = true;
        rightControlsGroup.add(button);

        const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(btn.x - 2.2, btn.y + 0.2, 0.68); // Relative to grip
        rightControlsGroup.add(label);
    });

    // Right Analog Stick
    const rightAnalogBase = analogBase.clone();
    rightAnalogBase.position.set(-0.6, -0.2, 0.55); // Relative to grip
    rightControlsGroup.add(rightAnalogBase);

    const rightRgbRing = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xff0088, emissive: 0xff0088, emissiveIntensity: 0.5 }));
    rightRgbRing.rotation.x = Math.PI / 2;
    rightRgbRing.position.set(-0.6, -0.2, 0.55); // Relative to grip
    rightControlsGroup.add(rightRgbRing);

    const rightAnalogStick = new THREE.Mesh(analogStickGeo, rightAnalogStickMat); // Red stick
    rightAnalogStick.position.set(-0.6, -0.2, 0.72); // Relative to grip
    rightAnalogStick.scale.set(1, 1, 0.75);
    rightAnalogStick.castShadow = true;
    rightControlsGroup.add(rightAnalogStick);

    // --- Top Triggers ---
    const l1 = new THREE.Mesh(triggerGeo, triggerMat);
    l1.position.set(-2.2, 1.15, -0.1);
    l1.castShadow = true;
    triggerGroup.add(l1);
    
    const r1 = l1.clone();
    r1.position.set(2.2, 1.15, -0.1);
    triggerGroup.add(r1);
    
    const l2 = new THREE.Mesh(l2Geo, triggerMat);
    l2.position.set(-2.2, 1.5, -0.35);
    l2.rotation.x = -Math.PI / 6;
    l2.castShadow = true;
    triggerGroup.add(l2);
    
    const r2 = l2.clone();
    r2.position.set(2.2, 1.5, -0.35);
    triggerGroup.add(r2);

    const l1Light = new THREE.Mesh(lightGeo, lightMat);
    l1Light.position.set(-2.2, 1.15, 0.05);
    triggerGroup.add(l1Light);
    
    const r1Light = l1Light.clone();
    r1Light.position.set(2.2, 1.15, 0.05);
    triggerGroup.add(r1Light);

    // --- Center buttons ---
    const menuBtn = new THREE.Mesh(centerBtnGeo, centerBtnMat);
    menuBtn.rotation.x = Math.PI / 2;
    menuBtn.position.set(-0.35, -0.95, 0.55);
    phoneGroup.add(menuBtn);
    
    const homeBtn = menuBtn.clone();
    homeBtn.position.set(0.35, -0.95, 0.55);
    phoneGroup.add(homeBtn);

    // Add control groups to grips
    leftGrip.add(leftControlsGroup);
    rightGrip.add(rightControlsGroup);

    // Add all groups to controller
    controller.add(phoneGroup);
    controller.add(leftGrip);
    controller.add(rightGrip);
    controller.add(triggerGroup);

    controller.position.y = 0.5;

    return { controller, phoneGroup, leftGrip, rightGrip, triggerGroup, leftControlsGroup, rightControlsGroup };
}