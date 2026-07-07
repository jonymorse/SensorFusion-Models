// Thermal calibration target for RealSense RGB + Lepton 3.5.
// Version 2: shallow chamfered aperture plate in a screw-together rectangular
// enclosure with compact corner bosses kept outside the heater footprint.

const plateWidth = 175;
const plateHeight = 225;
const frontThickness = 2;
const thermalGap = 1.5;
const frameDepth = 9;
const frameWall = 3;
const framePlateOverlap = 1.2;
const backThickness = 3;
const innerWidth = plateWidth - 2 * frameWall;
const innerHeight = plateHeight - 2 * frameWall;

const holeDiameter = 20;
const holeRadius = holeDiameter / 2;
const holeSpacingX = 28;
const holeSpacingY = 28;
const holeFaceFlare = 0.25;
const rowCounts = [5, 4, 5, 4, 5];

const heaterWidth = 152;
const heaterHeight = 203;
const heaterThickness = 2.5;

const fenceThickness = 1.5;
const fenceHeight = 5.5;
const heaterClearance = 0;

const cableNotchWidth = 20;
const cableNotchDepth = 10;
const cableReliefWidth = 36;
const cableReliefDepth = 24;
const cableReliefCornerRadius = 3;
const frontPlateEdgeFilletRadius = Param.number("Front Plate Edge Fillet Radius", 1.2, {
  min: 0,
  max: 3,
  step: 0.1,
  unit: "mm",
});
const frameEdgeFilletRadius = Param.number("Frame Edge Fillet Radius", 1.2, {
  min: 0,
  max: frameWall / 2 - 0.2,
  step: 0.1,
  unit: "mm",
});
const backPlateEdgeFilletRadius = Param.number("Back Plate Edge Fillet Radius", 1.2, {
  min: 0,
  max: backThickness / 2 - 0.2,
  step: 0.1,
  unit: "mm",
});

const insertBossDiameter = Param.number("Main Boss Diameter", 10, {
  min: 9,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const insertBossCollarDiameter = insertBossDiameter;
const insertBossCollarHeight = 2;
const insertPilotDiameter = Param.number("Insert Pilot Diameter", 4.0, {
  min: 3.7,
  max: 4.1,
  step: 0.1,
  unit: "mm",
});
// FFVRVSS M3 long insert: 4.2 mm body diameter x 5.0 mm long.
const insertDepth = 5.3;
const screwClearanceDiameter = Param.number("Screw Clearance Diameter", 3.4, {
  min: 3,
  max: 4,
  step: 0.1,
  unit: "mm",
});
const screwHeadDiameter = Param.number("Screw Head Counterbore Diameter", 6.4, {
  min: 5.5,
  max: 7,
  step: 0.1,
  unit: "mm",
});
const screwHeadCounterboreDepth = 1.2;
const insertBossRadius = insertBossDiameter / 2;
const insertBossCollarRadius = insertBossCollarDiameter / 2;
const screwSideX = plateWidth / 2 - insertBossRadius;
const screwSideYPositions = [-55, 55];
const bracketFlangeLength = 40;
const bracketWidth = 58;
const bracketThickness = 4;
const bracketSideLegThickness = 3;
const bracketConceptPlateCornerRadius = 4;
const goproFingerThickness = 3.0;
const goproMatingGap = 3.5;
const goproPivotHoleDiameter = 5.3;
const goproFingerHeight = 17;
const goproBaseWidth = 20;
const goproBaseThickness = 4;
const goproFingerEndDiameter = 15;
const goproFingerEndRadius = goproFingerEndDiameter / 2;
const goproRootReinforcementHeight = 2;
const goproNutSeatThickness = 1.5;
const goproNutPocketAcrossFlats = 8.3;
const goproNutPocketDepth = 5.0;
const goproFemaleStackDepth = 3 * goproFingerThickness + 2 * goproMatingGap;
const goproFemaleSupportLength = 0.3 + goproNutSeatThickness + goproNutPocketDepth;
const goproFemaleTotalDepth = goproFemaleStackDepth + goproFemaleSupportLength;
const goproFemaleHeight = goproBaseThickness + goproFingerHeight;
const bracketOriginalOuterHeight = frameDepth + backThickness + bracketThickness;
const bracketOuterHeight = Math.max(
  bracketOriginalOuterHeight,
  goproBaseWidth + bracketConceptPlateCornerRadius
);
const bracketBottomZ = frontThickness - (bracketOuterHeight - bracketOriginalOuterHeight);
const bracketProngCenterZ = bracketBottomZ + goproBaseWidth / 2;
const accessoryMountYPositions = [-22, 22];
const accessoryBossX = plateWidth / 2 - insertBossRadius;
const accessoryBossY = plateHeight / 2 - insertBossRadius;
const accessoryMountZ = frontThickness + frameDepth / 2;

const exportPart = Param.choice("Export Part", "all", [
  "all",
  "Front Plate",
  "Frame",
  "Front Plate + Frame",
  "Back Plate",
  "L Bracket",
  "Heater",
]);

const backPlateZ = frontThickness + frameDepth;
const heaterZ = backPlateZ - heaterThickness;

const screwPositions = [];

for (const y of screwSideYPositions) {
  screwPositions.push([-screwSideX, y]);
  screwPositions.push([screwSideX, y]);
}

const accessoryPositions = [];
const oppositeCableAccessoryPositions = accessoryMountYPositions.map((x) => [
  x,
  accessoryBossY,
]);

for (const y of accessoryMountYPositions) {
  accessoryPositions.push([-accessoryBossX, y]);
  accessoryPositions.push([accessoryBossX, y]);
}

accessoryPositions.push(...oppositeCableAccessoryPositions);

function centeredPositions(count, spacing) {
  const offset = ((count - 1) * spacing) / 2;
  const positions = [];

  for (let i = 0; i < count; i += 1) {
    positions.push(i * spacing - offset);
  }

  return positions;
}

function arcPoints(centerX, centerZ, radius, startAngle, endAngle, segments = 24) {
  if (radius <= 0) {
    return [];
  }

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (index / segments) * (endAngle - startAngle);
    return [
      centerX + Math.cos(angle) * radius,
      centerZ + Math.sin(angle) * radius,
    ];
  });
}

function roundedRectPoints(xMin, xMax, yMin, yMax, radius, roundBottom = true) {
  const r = Math.min(radius, (xMax - xMin) / 2, (yMax - yMin) / 2);

  if (r <= 0) {
    return [
      [xMin, yMin],
      [xMax, yMin],
      [xMax, yMax],
      [xMin, yMax],
    ];
  }

  const bottomRight = roundBottom
    ? arcPoints(xMax - r, yMin + r, r, -Math.PI / 2, 0)
    : [[xMax, yMin]];
  const bottomLeft = roundBottom
    ? arcPoints(xMin + r, yMin + r, r, Math.PI, Math.PI * 1.5)
    : [[xMin, yMin]];

  return [
    ...bottomRight,
    ...arcPoints(xMax - r, yMax - r, r, 0, Math.PI / 2),
    ...arcPoints(xMin + r, yMax - r, r, Math.PI / 2, Math.PI),
    ...bottomLeft,
  ];
}

function xzProfileToCenteredYPrism(points, depth) {
  return polygon(points)
    .extrude(depth)
    .rotateX(90)
    .translate(0, depth / 2, 0);
}

function yzProfileToCenteredXPrism(points, depth) {
  return polygon(points)
    .extrude(depth)
    .rotateX(90)
    .rotateZ(90)
    .translate(-depth / 2, 0, 0);
}

function conceptStyleLBracketBody(xMin, xMax, zMin, zMax, width, thickness, rootRadius, cornerRadius) {
  const innerX = xMax - thickness;
  const innerZ = zMax - thickness;
  const bodyOverlap = 0.25;
  const plateCornerRadius = Math.min(
    cornerRadius,
    Math.max(0, width / 2 - 0.2),
    Math.max(0, (xMax - xMin) / 2 - 0.2),
    Math.max(0, (zMax - zMin) / 2 - 0.2)
  );
  const radius = Math.min(
    rootRadius,
    Math.max(0, innerX - xMin - 0.2),
    Math.max(0, innerZ - zMin - 0.2)
  );
  const basePlate = polygon(
    roundedRectPoints(xMin, xMax, -width / 2, width / 2, plateCornerRadius, true)
  )
    .extrude(thickness + bodyOverlap)
    .translate(0, 0, innerZ - bodyOverlap);
  const armPlate = yzProfileToCenteredXPrism(
    roundedRectPoints(-width / 2, width / 2, zMin, zMax, plateCornerRadius, false),
    thickness + bodyOverlap
  ).translate(xMax - thickness / 2, 0, 0);
  const rootProfile = [
    [innerX + bodyOverlap, innerZ + bodyOverlap],
    [innerX + bodyOverlap, innerZ - radius],
    ...arcPoints(
      innerX - radius,
      innerZ - radius,
      radius,
      0,
      Math.PI / 2
    ),
    [innerX + bodyOverlap, innerZ + bodyOverlap],
  ];
  const rootReinforcement = radius > 0
    ? xzProfileToCenteredYPrism(rootProfile, width)
    : null;

  return rootReinforcement
    ? union(basePlate, armPlate, rootReinforcement)
    : union(basePlate, armPlate);
}

function buildFemaleGoProProngs() {
  const pivotZ = goproBaseThickness + goproFingerHeight - goproFingerEndRadius;
  const base = box(goproFemaleStackDepth, goproBaseWidth, goproBaseThickness);
  const fingers = [];
  const roots = [];

  for (let index = 0; index < 3; index += 1) {
    const x = -goproFemaleStackDepth / 2
      + goproFingerThickness / 2
      + index * (goproFingerThickness + goproMatingGap);
    const stem = box(goproFingerThickness, goproFingerEndDiameter, pivotZ)
      .translate(x, 0, 0);
    const roundedEnd = cylinder(goproFingerThickness, goproFingerEndRadius)
      .rotateY(90)
      .translate(x - goproFingerThickness / 2, 0, pivotZ);
    const reinforcedRoot = box(
      goproFingerThickness,
      Math.max(goproFingerEndDiameter, goproBaseWidth - 1),
      goproRootReinforcementHeight
    ).translate(x, 0, goproBaseThickness);

    fingers.push(union(stem, roundedEnd));
    roots.push(reinforcedRoot);
  }

  const pivotHole = cylinder(goproFemaleStackDepth + 2, goproPivotHoleDiameter / 2)
    .rotateY(90)
    .translate(-goproFemaleStackDepth / 2 - 1, 0, pivotZ);
  const femaleProngs = difference(
    union(base, fingers, roots),
    pivotHole
  );

  const supportOverlap = 0.3;
  const supportStartX = goproFemaleStackDepth / 2 - supportOverlap;
  const supportCenterX = supportStartX + goproFemaleSupportLength / 2;
  const supportExtension = union(
    box(goproFemaleSupportLength, goproBaseWidth, goproBaseThickness)
      .translate(supportCenterX, 0, 0),
    box(goproFemaleSupportLength, goproFingerEndDiameter, pivotZ)
      .translate(supportCenterX, 0, 0),
    cylinder(goproFemaleSupportLength, goproFingerEndRadius)
      .rotateY(90)
      .translate(supportStartX, 0, pivotZ),
    box(
      goproFemaleSupportLength,
      Math.max(goproFingerEndDiameter, goproBaseWidth - 1),
      goproRootReinforcementHeight
    ).translate(supportCenterX, 0, goproBaseThickness)
  );
  const nutPocketRadius = goproNutPocketAcrossFlats / Math.sqrt(3);
  const nutPocket = cylinder(
    goproNutPocketDepth + 0.6,
    nutPocketRadius,
    nutPocketRadius,
    6
  )
    .rotateY(90)
    .translate(goproFemaleStackDepth / 2 + goproNutSeatThickness, 0, pivotZ);
  const nutPassage = cylinder(
    supportOverlap + goproNutSeatThickness + 0.4,
    goproPivotHoleDiameter / 2
  )
    .rotateY(90)
    .translate(goproFemaleStackDepth / 2 - supportOverlap - 0.1, 0, pivotZ);

  return difference(
    union(femaleProngs, supportExtension),
    nutPocket,
    nutPassage
  );
}

const rowY = centeredPositions(rowCounts.length, holeSpacingY);
const holeCutters = [];

for (let row = 0; row < rowCounts.length; row += 1) {
  const xs = centeredPositions(rowCounts[row], holeSpacingX);
  const rowAlignX = rowCounts[row] === 4 ? -holeSpacingX / 2 : 0;

  for (const x of xs) {
    holeCutters.push(
      cylinder(
        frontThickness + 2,
        holeRadius + holeFaceFlare,
        holeRadius
      ).translate(x + rowAlignX, rowY[row], -1)
    );
  }
}

const frontPlateBase = box(plateWidth, plateHeight, frontThickness);
const frontPlateBlank = frontPlateEdgeFilletRadius > 0
  ? fillet(frontPlateBase, frontPlateEdgeFilletRadius, { parallel: [0, 0, 1], convex: true })
  : frontPlateBase;
const frontPlate = difference(frontPlateBlank, holeCutters).color("#d9d9d9");

const frameOuterBlank = box(plateWidth, plateHeight, frameDepth + framePlateOverlap);
const frameOuterBody = frameEdgeFilletRadius > 0
  ? fillet(frameOuterBlank, frameEdgeFilletRadius, { parallel: [0, 0, 1], convex: true })
  : frameOuterBlank;
const frameOuter = frameOuterBody.translate(0, 0, frontThickness - framePlateOverlap);
const frameInnerBlank = box(innerWidth, innerHeight, frameDepth + framePlateOverlap + 2);
const frameInnerBody = frameEdgeFilletRadius > 0
  ? fillet(frameInnerBlank, frameEdgeFilletRadius, { parallel: [0, 0, 1], convex: true })
  : frameInnerBlank;
const frameInner = frameInnerBody.translate(0, 0, frontThickness - framePlateOverlap - 1);
const frameCuts = [];

// Cable exit notch in the center of the short heater side.
frameCuts.push(
  box(
    cableNotchWidth,
    frameWall + 2,
    frameDepth + framePlateOverlap + 2
  ).translate(0, -plateHeight / 2 + frameWall / 2, frontThickness - framePlateOverlap - 1)
);

const frameShell = difference(frameOuter, frameInner, frameCuts);
const insertBossCollarOverlap = 0.3;
const insertBossPlateOverlap = 0.3;
const insertBosses = screwPositions.map(([x, y]) => {
  const boss = cylinder(
    frameDepth + insertBossPlateOverlap,
    insertBossRadius
  ).translate(x, y, frontThickness - insertBossPlateOverlap);
  const pilotHole = cylinder(insertDepth + 1, insertPilotDiameter / 2)
    .translate(x, y, backPlateZ - insertDepth);

  return difference(boss, pilotHole);
});
const accessoryBosses = accessoryPositions.map(([x, y]) => {
  const boss = cylinder(
    frameDepth + insertBossPlateOverlap,
    insertBossRadius
  ).translate(
    x,
    y,
    frontThickness - insertBossPlateOverlap
  );
  const pilotHole = cylinder(insertDepth + 1, insertPilotDiameter / 2)
    .translate(x, y, backPlateZ - insertDepth);

  return difference(boss, pilotHole);
});
const frame = union(
  frameShell,
  insertBosses,
  accessoryBosses
).color("#8c8c8c");
const frontPlateAndFrame = union(frontPlate, frame).color("#b7b7b7");

const bracketTargetSideClearance = 0.5;
const bracketFaceX = plateWidth / 2
  + bracketThickness
  + 6
  + bracketTargetSideClearance;
const bracketTopZ = backPlateZ + backThickness + bracketThickness;
const importedConceptBracket = require("./simple_l_bracket_concept.forge.js", {
  Width: bracketWidth,
  "Base Length": bracketFlangeLength,
  "Arm Height": bracketOuterHeight,
  Thickness: bracketThickness,
  "Plate Corner Radius": bracketConceptPlateCornerRadius,
});
const bracketBody = importedConceptBracket
  .child("Simple L Bracket - Rounded Plate Corners")
  .rotateZ(90)
  .rotateX(180)
  .translate(bracketFaceX, 0, bracketTopZ);
const bracketMountHoles = accessoryMountYPositions.map((y) =>
  cylinder(bracketThickness + 2, screwClearanceDiameter / 2)
    .translate(accessoryBossX, y, backPlateZ + backThickness - 1)
);
const bracketHeadCounterbores = accessoryMountYPositions.map((y) =>
  cylinder(screwHeadCounterboreDepth + 0.4, screwHeadDiameter / 2)
    .translate(accessoryBossX, y, backPlateZ + backThickness + bracketThickness - screwHeadCounterboreDepth)
);

const goproFemale = buildFemaleGoProProngs()
  .rotateY(90)
  .rotateX(90)
  .translate(
    bracketFaceX,
    0,
    bracketProngCenterZ
  );
const lBracketBody = difference(
  bracketBody,
  bracketMountHoles,
  bracketHeadCounterbores
);
const lBracket = union(lBracketBody, goproFemale).color("#3f6f8f");

const backPlateBlank = box(plateWidth, plateHeight, backThickness);
const backPlateBody = backPlateEdgeFilletRadius > 0
  ? fillet(backPlateBlank, backPlateEdgeFilletRadius, { parallel: [0, 0, 1], convex: true })
  : backPlateBlank;
const backPlateBase = difference(
  backPlateBody.translate(0, 0, backPlateZ),
  box(cableNotchWidth, cableNotchDepth + 1, backThickness + 2)
    .translate(0, -plateHeight / 2 + cableNotchDepth / 2, backPlateZ - 1)
).color("#5f6368");

const heaterFenceOuter = box(
  heaterWidth + 2 * (heaterClearance + fenceThickness),
  heaterHeight + 2 * (heaterClearance + fenceThickness),
  fenceHeight
).translate(0, 0, backPlateZ - fenceHeight);
const heaterFenceInner = box(
  heaterWidth + 2 * heaterClearance,
  heaterHeight + 2 * heaterClearance,
  fenceHeight + 2
).translate(0, 0, backPlateZ - fenceHeight - 1);
const heaterFenceGap = roundedRect(
  cableReliefWidth,
  cableReliefDepth,
  cableReliefCornerRadius
).extrude(fenceHeight + 2).translate(
  0,
  -(heaterHeight + 2 * (heaterClearance + fenceThickness)) / 2
    + cableReliefDepth / 2 - cableReliefCornerRadius - 0.5,
  backPlateZ - fenceHeight - 1
);
const heaterFenceBossClearances = oppositeCableAccessoryPositions.map(([x, y]) =>
  cylinder(fenceHeight + 2, insertBossRadius + 0.6)
    .translate(x, y, backPlateZ - fenceHeight - 1)
);

const heaterFence = difference(
  heaterFenceOuter,
  heaterFenceInner,
  heaterFenceGap,
  heaterFenceBossClearances
)
  .color("#5f6368");

const screwClearanceHoles = screwPositions.map(([x, y]) =>
  cylinder(backThickness + 2, screwClearanceDiameter / 2)
    .translate(x, y, backPlateZ - 1)
);
const accessoryClearanceHoles = accessoryPositions.map(([x, y]) =>
  cylinder(backThickness + 2, screwClearanceDiameter / 2)
    .translate(x, y, backPlateZ - 1)
);
const screwHeadCounterbores = screwPositions.map(([x, y]) =>
  cylinder(screwHeadCounterboreDepth + 1, screwHeadDiameter / 2)
    .translate(x, y, backPlateZ + backThickness - screwHeadCounterboreDepth)
);
const accessoryHeadCounterbores = accessoryPositions.map(([x, y]) =>
  cylinder(screwHeadCounterboreDepth + 1, screwHeadDiameter / 2)
    .translate(x, y, backPlateZ + backThickness - screwHeadCounterboreDepth)
);
const backPlate = difference(
  union(backPlateBase, heaterFence),
  screwClearanceHoles,
  accessoryClearanceHoles,
  screwHeadCounterbores,
  accessoryHeadCounterbores
).color("#5f6368");

const heater = box(heaterWidth, heaterHeight, heaterThickness)
  .translate(0, 0, heaterZ)
  .color("#d77a61");

const totalDepth = frontThickness + frameDepth + backThickness;
const stackMidZ = totalDepth / 2;

cutPlane("Center X Section", [1, 0, 0], 0);
cutPlane("Center Y Section", [0, 1, 0], 0);
cutPlane("Mid Stack Section", [0, 0, 1], stackMidZ);

const exportParts = [
  { name: "Front Plate", shape: frontPlate },
  { name: "Frame", shape: frame },
  { name: "Front Plate + Frame", shape: frontPlateAndFrame },
  { name: "L Bracket", shape: lBracket },
  { name: "Heater", shape: heater },
  { name: "Back Plate", shape: backPlate },
];
const assemblyParts = exportParts.filter((part) =>
  part.name !== "Front Plate" && part.name !== "Frame"
);
const selectedParts = exportPart === "all"
  ? assemblyParts
  : exportParts.filter((part) => part.name === exportPart);

return group(...selectedParts);
