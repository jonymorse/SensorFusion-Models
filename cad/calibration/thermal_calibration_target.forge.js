// Thermal calibration target for RealSense RGB + Lepton 3.5.
// Compact heated target with a front plate/frame assembly and a removable
// M3 heat-set-insert back plate carrying a 6" x 8" reptile heating pad.

const frontThickness = 3.5;
const frameDepth = 10;
const frameWall = 3;

const holeDiameter = 25;
const holeRadius = holeDiameter / 2;
const holeSpacingX = 30;
const holeSpacingY = 35;
const rowCounts = [5, 4, 5, 4, 5];
const holePatternWidth = (Math.max(...rowCounts) - 1) * holeSpacingX + holeDiameter;
const holePatternHeight = (rowCounts.length - 1) * holeSpacingY + holeDiameter;

const heaterWidth = 152;
const heaterHeight = 203;
const heaterThickness = 2.5;

const fenceThickness = 2;
const fenceHeight = 5.5;
const heaterClearance = 3;
const heaterFenceWidth = heaterWidth + 2 * (heaterClearance + fenceThickness);
const heaterFenceHeight = heaterHeight + 2 * (heaterClearance + fenceThickness);

const targetMargin = 6;
const mainFastenerSideBand = 16;
const targetWidth = Param.number(
  "Target Width",
  Math.ceil(
    Math.max(holePatternWidth, heaterFenceWidth + 2 * mainFastenerSideBand)
  ),
  {
    min: Math.ceil(
      Math.max(holePatternWidth, heaterFenceWidth + 2 * mainFastenerSideBand)
    ),
    max: 220,
    step: 1,
    unit: "mm",
  }
);
const targetHeight = Param.number(
  "Target Height",
  Math.ceil(Math.max(holePatternHeight, heaterFenceHeight) + 2 * targetMargin),
  {
    min: Math.ceil(Math.max(holePatternHeight, heaterFenceHeight) + 2 * frameWall),
    max: 220,
    step: 1,
    unit: "mm",
  }
);
const innerSpanX = targetWidth - 2 * frameWall;
const innerSpanY = targetHeight - 2 * frameWall;
const backThickness = 3;

const cableNotchWidth = 20;
const cableNotchDepth = 10;
const cableReliefWidth = 36;
const cableReliefDepth = 24;
const cableReliefCornerRadius = 3;

const insertBossDiameter = Param.number("Main Boss Diameter", 10, {
  min: 9,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const insertBossCollarDiameter = insertBossDiameter + 4;
const insertBossCollarHeight = 2;
const insertPilotDiameter = Param.number("Insert Pilot Diameter", 3.9, {
  min: 3.7,
  max: 4.1,
  step: 0.1,
  unit: "mm",
});
// FFVRVSS M3 long insert: 4.2 mm body diameter x 5.0 mm long.
const insertDepth = 6;
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
const screwBossEdgeDistance = insertBossCollarDiameter / 2 + 4.5;
const screwYPositions = [-75, 0, 75];

const exportPart = Param.choice("Export Part", "all", [
  "all",
  "Front Plate + Frame",
  "Back Plate",
  "Heater",
]);

const edgeChamfer = 0.4;
const exposedEdgeSelector = { convex: true, minLength: 40 };
const frontPlateExposedEdgeSelector = { convex: true, minLength: 40, atZ: 0 };
const frameExposedEdgeSelector = { convex: true, minLength: 40, atZ: frameDepth };
const backPlateZ = frontThickness + frameDepth;

const insertBossRadius = insertBossDiameter / 2;
const insertBossCollarRadius = insertBossCollarDiameter / 2;
const screwBossX = targetWidth / 2 - screwBossEdgeDistance;
const screwPositions = [];

for (const y of screwYPositions) {
  screwPositions.push([-screwBossX, y]);
  screwPositions.push([screwBossX, y]);
}

function centeredPositions(count, spacing) {
  const offset = ((count - 1) * spacing) / 2;
  const positions = [];

  for (let i = 0; i < count; i += 1) {
    positions.push(i * spacing - offset);
  }

  return positions;
}

function rowPositions(count, spacing) {
  const maxCount = Math.max(...rowCounts);
  const start = -((maxCount - 1) * spacing) / 2;
  const positions = [];

  for (let i = 0; i < count; i += 1) {
    positions.push(start + i * spacing);
  }

  return positions;
}

const rowY = centeredPositions(rowCounts.length, holeSpacingY);
const holeCutters = [];

for (let row = 0; row < rowCounts.length; row += 1) {
  const xs = rowPositions(rowCounts[row], holeSpacingX);

  for (const x of xs) {
    holeCutters.push(
      cylinder(frontThickness + 2, holeRadius)
        .translate(x, rowY[row], -1)
    );
  }
}

const frontPlateBlank = chamfer(box(targetWidth, targetHeight, frontThickness), edgeChamfer, frontPlateExposedEdgeSelector);
const frontPlate = difference(frontPlateBlank, holeCutters).color("#d9d9d9");

const frameOuter = chamfer(box(targetWidth, targetHeight, frameDepth), edgeChamfer, frameExposedEdgeSelector)
  .translate(0, 0, frontThickness);
const frameInner = box(innerSpanX, innerSpanY, frameDepth + 2)
  .translate(0, 0, frontThickness - 1);
const frameCuts = [];

// Cable exit notch in the center of the short heater side.
frameCuts.push(
  box(
    cableNotchWidth,
    frameWall + 2,
    frameDepth + 2
  ).translate(0, -targetHeight / 2 + frameWall / 2, frontThickness - 1)
);

const frameShell = difference(frameOuter, frameInner, frameCuts);
const insertBossCollarOverlap = 0.3;
const insertBossPlateOverlap = 0.3;
const insertBosses = screwPositions.map(([x, y]) => {
  const bossBody = cylinder(
    frameDepth - insertBossCollarHeight + insertBossCollarOverlap,
    insertBossRadius
  ).translate(x, y, frontThickness + insertBossCollarHeight - insertBossCollarOverlap);
  const bossCollar = cylinder(
    insertBossCollarHeight + insertBossPlateOverlap,
    insertBossCollarRadius,
    insertBossRadius - 0.2
  ).translate(x, y, frontThickness - insertBossPlateOverlap);
  const pilotHole = cylinder(insertDepth + 1, insertPilotDiameter / 2)
    .translate(x, y, backPlateZ - insertDepth);

  return difference(union(bossBody, bossCollar), pilotHole);
});
const frame = union(frameShell, insertBosses).color("#8c8c8c");
const frontPlateAndFrame = union(frontPlate, frame).color("#b7b7b7");

const backPlateBase = difference(
  chamfer(box(targetWidth, targetHeight, backThickness), edgeChamfer, exposedEdgeSelector).translate(0, 0, backPlateZ),
  box(cableNotchWidth, cableNotchDepth + 1, backThickness + 2)
    .translate(0, -targetHeight / 2 + cableNotchDepth / 2, backPlateZ - 1)
).color("#5f6368");

const heaterZ = backPlateZ - heaterThickness;

const heaterFenceOuter = box(
  heaterFenceWidth,
  heaterFenceHeight,
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
  -heaterFenceHeight / 2
    + cableReliefDepth / 2 - cableReliefCornerRadius - 0.5,
  backPlateZ - fenceHeight - 1
);

const heaterFence = difference(
  heaterFenceOuter,
  heaterFenceInner,
  heaterFenceGap
)
  .color("#5f6368");

const screwClearanceHoles = screwPositions.map(([x, y]) =>
  cylinder(backThickness + 2, screwClearanceDiameter / 2)
    .translate(x, y, backPlateZ - 1)
);
const screwHeadCounterbores = screwPositions.map(([x, y]) =>
  cylinder(screwHeadCounterboreDepth + 1, screwHeadDiameter / 2)
    .translate(x, y, backPlateZ + backThickness - screwHeadCounterboreDepth)
);
const backPlate = difference(
  union(backPlateBase, heaterFence),
  screwClearanceHoles,
  screwHeadCounterbores
).color("#5f6368");

const heater = box(heaterWidth, heaterHeight, heaterThickness)
  .translate(0, 0, heaterZ)
  .color("#d77a61");

const totalDepth = frontThickness + frameDepth + backThickness;
const stackMidZ = totalDepth / 2;

cutPlane("Center X Section", [1, 0, 0], 0);
cutPlane("Center Y Section", [0, 1, 0], 0);
cutPlane("Mid Stack Section", [0, 0, 1], stackMidZ);

const parts = [
  { name: "Front Plate + Frame", shape: frontPlateAndFrame },
  { name: "Heater", shape: heater },
  { name: "Back Plate", shape: backPlate },
];
const selectedParts = exportPart === "all"
  ? parts
  : parts.filter((part) => part.name === exportPart);

return group(...selectedParts);
