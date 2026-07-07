// Printable sensor-fusion chassis for the D435i, PureThermal 3, and ORICO hub.
// The male GoPro interface mates with gopro_camera_stand.forge.js.

const plateWidth = Param.number("Plate Width", 67, {
  min: 60,
  max: 130,
  step: 1,
  unit: "mm",
});
const plateHeight = Param.number("Plate Height", 70, {
  min: 60,
  max: 120,
  step: 1,
  unit: "mm",
});
const plateThickness = Param.number("Plate Thickness", 5, {
  min: 4,
  max: 8,
  step: 0.5,
  unit: "mm",
});
const edgeRadius = Param.number("Plate Corner Radius", 5, {
  min: 0,
  max: 10,
  step: 0.5,
  unit: "mm",
});
const pt3BottomClearance = Param.number("PT3 Bottom Clearance", 4.5, {
  min: 0,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const cameraGap = Param.number("D435i to PT3 Gap", 3, {
  min: 0,
  max: 8,
  step: 0.5,
  unit: "mm",
});

const d435HoleSpacing = 45;
const d435HoleDiameter = Param.number("D435i M3 Clearance", 3.4, {
  min: 3.2,
  max: 3.8,
  step: 0.1,
  unit: "mm",
});
const pt3TrayMountHoleSpacingX = Param.number("PT3 Tray Mount Hole Spacing X", 8, {
  min: 4,
  max: 40,
  step: 0.5,
  unit: "mm",
});
const pt3TrayMountOffsetX = Param.number("PT3 Tray Mount Offset X", 15.45, {
  min: 10,
  max: 30,
  step: 0.05,
  unit: "mm",
});
const pt3WallExtensionDepth = Param.number("PT3 Wall Extension Depth", 6, {
  min: 0,
  max: 20,
  step: 0.5,
  unit: "mm",
});
const pt3InsertPilotDiameter = Param.number("PT3 M3 Insert Pilot Diameter", 4.0, {
  min: 3.5,
  max: 4.2,
  step: 0.1,
  unit: "mm",
});
const pt3InsertPocketDepth = Param.number("PT3 M3 Insert Pocket Depth", 3.2, {
  min: 2.5,
  max: 6,
  step: 0.1,
  unit: "mm",
});
const frontMembraneThickness = Param.number("Front Sacrificial Membrane Thickness", 0.2, {
  min: 0,
  max: 0.6,
  step: 0.05,
  unit: "mm",
});
const hubBossDiameter = Param.number("ORICO Hub Boss Diameter", 9, {
  min: 6,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const hubStandoff = Param.number("ORICO Hub Standoff", 5, {
  min: 3,
  max: 10,
  step: 0.5,
  unit: "mm",
});
const hubInsertPilotDiameter = Param.number("ORICO M3 Insert Pilot Diameter", 4.0, {
  min: 3.8,
  max: 4.4,
  step: 0.1,
  unit: "mm",
});
const hubInsertPocketDepth = Param.number("ORICO M3 Insert Pocket Depth", 3.2, {
  min: 2.8,
  max: 4.0,
  step: 0.1,
  unit: "mm",
});
const hubVerticalOffset = Param.number("ORICO Vertical Offset", 3, {
  min: 0,
  max: 6,
  step: 0.5,
  unit: "mm",
});
const hubLocatorClearance = Param.number("ORICO PCB Locator Clearance", 0.4, {
  min: 0.1,
  max: 1.5,
  step: 0.1,
  unit: "mm",
});
const hubLocatorTabLength = Param.number("ORICO PCB Locator Tab Length", 6, {
  min: 3,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const hubLocatorTabThickness = Param.number("ORICO PCB Locator Tab Thickness", 1.2, {
  min: 0.8,
  max: 3,
  step: 0.1,
  unit: "mm",
});
const showClearanceDimensions = Param.choice(
  "Show ORICO Clearance Dimensions",
  "yes",
  ["yes", "no"]
);
const outputPart = Param.choice("Output Part", "assembly", [
  "assembly",
  "sensor chassis",
  "sensor chassis with membrane",
  "pt3 tray",
  "gopro adapter",
]);

const bodyOverlap = 0.4;
const d435BodyHeight = 25;
const pt3BoardHeight = 28.9;
const hubHoleSpacing = 43;
const hubOffsetX = 0;
const componentStackCenterZ = pt3BottomClearance
  + d435BodyHeight / 2
  + cameraGap / 2
  + pt3BoardHeight / 2;
const pt3CenterZ = componentStackCenterZ - d435BodyHeight / 2 - cameraGap / 2;
const d435HoleZ = componentStackCenterZ + pt3BoardHeight / 2 + cameraGap / 2;
const hubCenterZ = componentStackCenterZ + hubVerticalOffset;
const hubBossRadius = hubBossDiameter / 2;
const hubPatternHalfWidth = hubHoleSpacing / 2;
const leftHubBossOuterX = hubOffsetX - hubPatternHalfWidth - hubBossRadius;
const rightHubBossOuterX = hubOffsetX + hubPatternHalfWidth + hubBossRadius;
const leftHubClearance = leftHubBossOuterX + plateWidth / 2;
const rightHubClearance = plateWidth / 2 - rightHubBossOuterX;

function mountingBoss(x, z, side, length, outsideDiameter, holeDiameter, holeDepth) {
  const front = side === "front";
  const direction = front ? [0, -1, 0] : [0, 1, 0];
  const faceY = front ? -plateThickness / 2 : plateThickness / 2;
  const startY = faceY + (front ? bodyOverlap : -bodyOverlap);
  const boss = cylinder(length + bodyOverlap, outsideDiameter / 2, undefined, 32)
    .pointAlong(direction)
    .translate(x, startY, z);
  const bossEndY = startY + (front ? -(length + bodyOverlap) : length + bodyOverlap);
  const pocketDepth = Math.min(holeDepth, length - 0.4);
  const hole = cylinder(pocketDepth + 0.02, holeDiameter / 2, undefined, 24)
    .pointAlong(front ? [0, 1, 0] : [0, -1, 0])
    .translate(x, bossEndY + (front ? -0.01 : 0.01), z);

  return difference(boss, hole);
}

function fourBossPattern(centerX, centerZ, spacingX, spacingZ, side, length, bossDiameter, holeDiameter, holeDepth) {
  const hx = spacingX / 2;
  const hz = spacingZ / 2;
  return union(
    mountingBoss(centerX - hx, centerZ - hz, side, length, bossDiameter, holeDiameter, holeDepth),
    mountingBoss(centerX + hx, centerZ - hz, side, length, bossDiameter, holeDiameter, holeDepth),
    mountingBoss(centerX - hx, centerZ + hz, side, length, bossDiameter, holeDiameter, holeDepth),
    mountingBoss(centerX + hx, centerZ + hz, side, length, bossDiameter, holeDiameter, holeDepth)
  );
}

const plateProfile = edgeRadius > 0
  ? roundedRect(
      plateWidth,
      plateHeight,
      Math.min(edgeRadius, plateWidth / 2 - 0.1, plateHeight / 2 - 0.1)
    )
  : rect(plateWidth, plateHeight);
const roundedPlate = plateProfile
  .extrude(plateThickness)
  .rotateX(-90)
  .translate(0, -plateThickness / 2, plateHeight / 2);

function d435Hole(x) {
  return cylinder(plateThickness + 2, d435HoleDiameter / 2, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(x, -plateThickness / 2 - 1, d435HoleZ);
}

// Blind pockets for M3 heat-set inserts, aligned with the two extension holes
// in the rotated PT3 tray. The offset is the tray hole line after rotation.
function pt3InsertPocket(z) {
  const depth = Math.min(pt3InsertPocketDepth, plateThickness - 0.5);
  return cylinder(depth + 0.02, pt3InsertPilotDiameter / 2, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(pt3TrayMountOffsetX, -plateThickness / 2 - 0.01, z);
}

const plate = difference(
  roundedPlate,
  d435Hole(-d435HoleSpacing / 2),
  d435Hole(d435HoleSpacing / 2),
  pt3InsertPocket(pt3CenterZ - pt3TrayMountHoleSpacingX / 2),
  pt3InsertPocket(pt3CenterZ + pt3TrayMountHoleSpacingX / 2)
);

function frontHoleMembrane(x, z, diameter) {
  const thickness = Math.min(frontMembraneThickness, plateThickness - 0.5);
  return cylinder(thickness, diameter / 2, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(x, -plateThickness / 2, z);
}

const frontSacrificialMembranes = union(
  frontHoleMembrane(-d435HoleSpacing / 2, d435HoleZ, d435HoleDiameter),
  frontHoleMembrane(d435HoleSpacing / 2, d435HoleZ, d435HoleDiameter),
  frontHoleMembrane(
    pt3TrayMountOffsetX,
    pt3CenterZ - pt3TrayMountHoleSpacingX / 2,
    pt3InsertPilotDiameter
  ),
  frontHoleMembrane(
    pt3TrayMountOffsetX,
    pt3CenterZ + pt3TrayMountHoleSpacingX / 2,
    pt3InsertPilotDiameter
  )
).color("#8fb7c9");

// D435i reference envelope (90 x 25 x 25 mm), centered on its mounting
// hole line and seated against the front of the chassis. As a mock it is
// visible for layout/fit checks but is not included in exports.
const d435ReferenceWidth = 90;
const d435ReferenceDepth = 25;
const d435ReferenceHeight = 25;
const d435ReferenceBody = fillet(
  box(d435ReferenceWidth, d435ReferenceDepth, d435ReferenceHeight),
  2,
  { parallel: [0, 1, 0], convex: true }
)
  .translate(
    0,
    -plateThickness / 2 - d435ReferenceDepth / 2,
    d435HoleZ - d435ReferenceHeight / 2
  )
  .color("#3b82b8");
if (outputPart === "assembly") {
  mock(d435ReferenceBody, "Intel RealSense D435i Reference");
}

// Reuse the complete PT3 tray as a separate, removable part. Its native XY
// board plane maps to the chassis XZ plane and seats against the front face.
const pt3TrayPart = require("./purethermal_tray_only.forge.js", {
  "Mount Hole Spacing X": pt3TrayMountHoleSpacingX,
  "Wall Extension Depth": pt3WallExtensionDepth,
});
const pt3Tray = pt3TrayPart
  .rotateX(90)
  .rotateY(90)
  .translate(-pt3WallExtensionDepth / 2, -plateThickness / 2, pt3CenterZ);
const hubBosses = fourBossPattern(
  hubOffsetX,
  hubCenterZ,
  hubHoleSpacing,
  hubHoleSpacing,
  "rear",
  hubStandoff,
  hubBossDiameter,
  hubInsertPilotDiameter,
  hubInsertPocketDepth
);

// ORICO-XHJ2U2C-G2 bare PCB reference, seated on the rear standoffs.
// Direct measurements: 51 x 51 x 1.6 mm with a 43 mm square hole pattern.
const hubPcbWidth = 51;
const hubPcbHeight = 51;
const hubPcbThickness = 1.6;
const hubPcbHoleDiameter = 3.4;
const hubPcbCornerRadius = 3;
const hubPcbBackY = plateThickness / 2 + hubStandoff;
const hubPcbBlank = fillet(
  box(hubPcbWidth, hubPcbThickness, hubPcbHeight),
  hubPcbCornerRadius,
  { parallel: [0, 1, 0], convex: true }
);
const hubPcbHole = (x, z) =>
  cylinder(
    hubPcbThickness + 4,
    hubPcbHoleDiameter / 2,
    hubPcbHoleDiameter / 2,
    24
  )
    .pointAlong([0, 1, 0])
    .translate(x, -2, z);
const hubPcbReference = difference(
  hubPcbBlank,
  hubPcbHole(-hubPatternHalfWidth, hubPcbHeight / 2 - hubPatternHalfWidth),
  hubPcbHole(hubPatternHalfWidth, hubPcbHeight / 2 - hubPatternHalfWidth),
  hubPcbHole(-hubPatternHalfWidth, hubPcbHeight / 2 + hubPatternHalfWidth),
  hubPcbHole(hubPatternHalfWidth, hubPcbHeight / 2 + hubPatternHalfWidth)
)
  .translate(
    hubOffsetX,
    hubPcbBackY + hubPcbThickness / 2,
    hubCenterZ - hubPcbHeight / 2
  )
  .color("#2d8a67");
if (outputPart === "assembly") {
  mock(hubPcbReference, "ORICO USB-C Hub PCB Reference");
}

const hubLocatorDepth = hubStandoff + hubPcbThickness + 0.6;
const hubLocatorStartY = plateThickness / 2 + hubLocatorDepth - bodyOverlap / 2;
const hubLocatorCornerOffsetX = hubPcbWidth / 2 - hubPcbCornerRadius;
const hubLocatorCornerOffsetZ = hubPcbHeight / 2 - hubPcbCornerRadius;
const hubLocatorInnerRadius = hubPcbCornerRadius + hubLocatorClearance;
const hubLocatorOuterRadius = hubLocatorInnerRadius + hubLocatorTabThickness;
const hubLocatorSegments = Math.max(10, Math.round(hubLocatorTabLength * 2));

function arcPointsXZ(cx, cz, radius, startAngle, endAngle, segments) {
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const angle = startAngle + (endAngle - startAngle) * t;
    points.push([
      cx + Math.cos(angle) * radius,
      cz + Math.sin(angle) * radius,
    ]);
  }
  return points;
}

function xzProfileToRearPrism(points, depth) {
  return polygon(points)
    .extrude(depth)
    .rotateX(90)
    .translate(0, hubLocatorStartY, 0);
}

function hubCornerLocator(cx, cz, startAngle, endAngle) {
  const outerArc = arcPointsXZ(cx, cz, hubLocatorOuterRadius, startAngle, endAngle, hubLocatorSegments);
  const innerArc = arcPointsXZ(cx, cz, hubLocatorInnerRadius, endAngle, startAngle, hubLocatorSegments);
  return xzProfileToRearPrism([...outerArc, ...innerArc], hubLocatorDepth);
}

const hubPcbLocators = union(
  hubCornerLocator(
    hubOffsetX + hubLocatorCornerOffsetX,
    hubCenterZ + hubLocatorCornerOffsetZ,
    0,
    Math.PI / 2
  ),
  hubCornerLocator(
    hubOffsetX - hubLocatorCornerOffsetX,
    hubCenterZ + hubLocatorCornerOffsetZ,
    Math.PI / 2,
    Math.PI
  ),
  hubCornerLocator(
    hubOffsetX - hubLocatorCornerOffsetX,
    hubCenterZ - hubLocatorCornerOffsetZ,
    Math.PI,
    Math.PI * 1.5
  ),
  hubCornerLocator(
    hubOffsetX + hubLocatorCornerOffsetX,
    hubCenterZ - hubLocatorCornerOffsetZ,
    Math.PI * 1.5,
    Math.PI * 2
  )
);

if (showClearanceDimensions === "yes") {
  const dimensionY = plateThickness / 2 + hubStandoff + 2;
  dim(
    [-plateWidth / 2, dimensionY, hubCenterZ - hubPatternHalfWidth],
    [leftHubBossOuterX, dimensionY, hubCenterZ - hubPatternHalfWidth],
    {
      label: `Rear left boss clearance: ${leftHubClearance.toFixed(1)} mm`,
      color: "#f4a261",
      offset: 5,
    }
  );
  dim(
    [rightHubBossOuterX, dimensionY, hubCenterZ + hubPatternHalfWidth],
    [plateWidth / 2, dimensionY, hubCenterZ + hubPatternHalfWidth],
    {
      label: `Rear right boss clearance: ${rightHubClearance.toFixed(1)} mm`,
      color: "#e63946",
      offset: 5,
    }
  );
}

// Rear-face receiver for a detachable, downward-facing GoPro adapter.
const receiverWidth = 30;
const receiverHeight = 18;
const adapterThickness = 4;
const adapterScrewSpacing = 20;
const receiverBaseZ = plateHeight - receiverHeight;
const receiverTopZ = plateHeight;
const adapterScrewZ = receiverBaseZ + receiverHeight / 2;
const m3ClearanceDiameter = 3.4;
const m3InsertPilotDiameter = 3.8;
const m3InsertPocketDepth = 3.2;
const locatingKeyWidth = 10;
const locatingKeyDepth = 4;
const locatingKeyHeight = 1.5;
const locatingKeyClearance = 0.25;
const receiverRearY = plateThickness / 2;

const insertPocket = (x) =>
  cylinder(m3InsertPocketDepth + 0.1, m3InsertPilotDiameter / 2, undefined, 32)
    .pointAlong([0, -1, 0])
    .translate(x, receiverRearY + 0.1, adapterScrewZ);
const receiverKeyRecessDepth = locatingKeyHeight + 0.2;
const receiverKeyRecess = box(
  locatingKeyWidth + locatingKeyClearance * 2,
  receiverKeyRecessDepth,
  locatingKeyDepth + locatingKeyClearance * 2
).translate(
  0,
  receiverRearY - receiverKeyRecessDepth / 2 + 0.1,
  adapterScrewZ - (locatingKeyDepth + locatingKeyClearance * 2) / 2
);

const importedProngs = require("./gopro_prongs.forge.js", {
  "Prong Set": "male",
  "Finger Thickness": 3.0,
  "Mating Gap": 3.5,
  "Pivot Hole Diameter": 5.3,
  "Finger Height": 15,
  "Base Width": 20,
  "Base Thickness": 4,
  "Female Nut Capture": "none",
  "M5 Nut Pocket Across Flats": 8.3,
  "M5 Nut Pocket Depth": 5.0,
});
const maleProng = importedProngs
  .child("Male 2-Prong Interface")
  .placeReference("bottom", [
    0,
    receiverRearY + 10,
    receiverTopZ - bodyOverlap,
  ]);

const chassis = difference(
  union(plate, hubBosses, hubPcbLocators),
  insertPocket(-adapterScrewSpacing / 2),
  insertPocket(adapterScrewSpacing / 2),
  receiverKeyRecess
).color("#586a73");

const adapterClearanceHole = (x) =>
  cylinder(adapterThickness + 1, m3ClearanceDiameter / 2, undefined, 32)
    .pointAlong([0, 1, 0])
    .translate(x, receiverRearY - 0.5, adapterScrewZ);
const adapterFlange = box(receiverWidth, adapterThickness, receiverHeight)
  .translate(0, receiverRearY + adapterThickness / 2, receiverBaseZ);
const adapterFoot = box(receiverWidth, 20, adapterThickness)
  .translate(0, receiverRearY + 10, receiverTopZ - adapterThickness);
const adapterKey = box(
  locatingKeyWidth,
  locatingKeyHeight + bodyOverlap,
  locatingKeyDepth
).translate(
  0,
  receiverRearY - (locatingKeyHeight - bodyOverlap) / 2,
  adapterScrewZ - locatingKeyDepth / 2
);
const goproAdapter = difference(
  union(adapterFlange, adapterFoot, adapterKey, maleProng),
  adapterClearanceHole(-adapterScrewSpacing / 2),
  adapterClearanceHole(adapterScrewSpacing / 2)
).color("#c56b3f");

if (outputPart === "sensor chassis") {
  return group({ name: "Sensor Fusion Chassis", shape: chassis });
}

if (outputPart === "sensor chassis with membrane") {
  return group(
    { name: "Sensor Fusion Chassis", shape: chassis },
    { name: "Front Sacrificial Membranes", shape: frontSacrificialMembranes }
  );
}

if (outputPart === "pt3 tray") {
  return group({ name: "PureThermal 3 Tray", shape: pt3TrayPart });
}

if (outputPart === "gopro adapter") {
  const printOrientedAdapter = goproAdapter.placeReference("bottom", [0, 0, 0]);
  return group({ name: "Detachable GoPro Adapter", shape: printOrientedAdapter });
}

return group(
  { name: "Sensor Fusion Chassis", shape: chassis },
  { name: "Front Sacrificial Membranes", shape: frontSacrificialMembranes },
  { name: "PureThermal 3 Tray", shape: pt3Tray },
  { name: "Detachable GoPro Adapter", shape: goproAdapter }
);
