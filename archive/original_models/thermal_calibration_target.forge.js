// Thermal calibration target for RealSense RGB + Lepton 3.5.
// Version 1: simplest heated target with a front hole plate, spacer frame,
// and snap-fit back plate carrying a 6" x 8" reptile heating pad.

const snapFitGeometry = require("../../cad/tests/snap_fit_geometry.js");

const plateSize = 220;
const frontThickness = 3.5;

const holeDiameter = 25;
const holeRadius = holeDiameter / 2;
const holeSpacing = 35;
const rowCounts = [6, 5, 6, 5, 6];

const heaterWidth = 152;
const heaterHeight = 203;
const heaterThickness = 2.5;

const fenceThickness = 2;
const fenceHeight = 4;
const heaterClearance = 3;
const retainerThickness = 1.5;
const retainerLipOverlap = 5;
const retainerSkirtHeight = 3;
const retainerSkirtClearance = 0.5;
const retainerSnapWidth = 16;
const retainerSnapHeight = 1.2;
const retainerSnapProjection = 0.8;
const retainerSnapClearance = 0.4;

const cableNotchWidth = 20;
const cableNotchDepth = 10;
const cableReliefWidth = 36;
const cableReliefDepth = 24;
const cableReliefHeight = 6;

const snapTabOffset = 52;

const heaterLidStyle = Param.choice("Heater Lid Style", "open", ["open", "closed"]);
const snapGeometry = Param.choice("Snap Geometry", "current", ["current", "candidate"]);
const exportPart = Param.choice("Export Part", "all", [
  "all",
  "Front Plate + Frame",
  "Back Plate",
  "Heater Retainer Lid",
  "Heater",
]);

const {
  frameDepth,
  frameWall,
  backThickness,
  snapTabWidth,
  snapTabThickness,
  snapTabDepth,
  snapBarbHeight,
  snapBarbProjection,
} = snapFitGeometry.resolveSnapProfile(snapGeometry);
const snapWindowClearance = snapFitGeometry.resolveSnapWindowClearance(
  snapGeometry,
  "current"
);
const innerSpan = plateSize - 2 * frameWall;

const edgeChamfer = 0.4;
const snapChamfer = 0.35;
const exposedEdgeSelector = { convex: true, minLength: 40 };
const frontPlateExposedEdgeSelector = { convex: true, minLength: 40, atZ: 0 };
const frameExposedEdgeSelector = { convex: true, minLength: 40, atZ: frameDepth };
const tabLeadInSelector = { convex: true, parallel: [0, 1, 0] };
const sideTabLeadInSelector = { convex: true, parallel: [1, 0, 0] };

function centeredPositions(count, spacing) {
  const offset = ((count - 1) * spacing) / 2;
  const positions = [];

  for (let i = 0; i < count; i += 1) {
    positions.push(i * spacing - offset);
  }

  return positions;
}

const rowY = centeredPositions(rowCounts.length, holeSpacing);
const holeCutters = [];

for (let row = 0; row < rowCounts.length; row += 1) {
  const xs = centeredPositions(rowCounts[row], holeSpacing);

  for (const x of xs) {
    holeCutters.push(
      cylinder(frontThickness + 2, holeRadius)
        .translate(x, rowY[row], -1)
    );
  }
}

const frontPlateBlank = chamfer(box(plateSize, plateSize, frontThickness), edgeChamfer, frontPlateExposedEdgeSelector);
const frontPlate = difference(frontPlateBlank, holeCutters).color("#d9d9d9");

const frameOuter = chamfer(box(plateSize, plateSize, frameDepth), edgeChamfer, frameExposedEdgeSelector)
  .translate(0, 0, frontThickness);
const frameInner = box(innerSpan, innerSpan, frameDepth + 2)
  .translate(0, 0, frontThickness - 1);

const frameWindowZ = frontThickness + snapTabDepth - snapBarbHeight / 2;
const sideWindowY = [-snapTabOffset, snapTabOffset];
const frameCuts = [];

for (const y of sideWindowY) {
  frameCuts.push(
    box(
      frameWall + 2,
      snapTabWidth + snapWindowClearance,
      snapBarbHeight + snapWindowClearance
    ).translate(-plateSize / 2 + frameWall / 2, y, frameWindowZ)
  );
  frameCuts.push(
    box(
      frameWall + 2,
      snapTabWidth + snapWindowClearance,
      snapBarbHeight + snapWindowClearance
    ).translate(plateSize / 2 - frameWall / 2, y, frameWindowZ)
  );
}

// Cable exit notch in the center of the short heater side.
frameCuts.push(
  box(
    cableNotchWidth,
    frameWall + 2,
    frameDepth + 2
  ).translate(0, -plateSize / 2 + frameWall / 2, frontThickness + frameDepth / 2)
);

const frame = difference(frameOuter, frameInner, frameCuts).color("#8c8c8c");
const frontPlateAndFrame = union(frontPlate, frame).color("#b7b7b7");

const backPlateZ = frontThickness + frameDepth;
const backPlateBase = difference(
  chamfer(box(plateSize, plateSize, backThickness), edgeChamfer, exposedEdgeSelector).translate(0, 0, backPlateZ),
  box(cableNotchWidth, cableNotchDepth + 1, backThickness + 2)
    .translate(0, -plateSize / 2 + cableNotchDepth / 2, backPlateZ - 1)
).color("#5f6368");

const heaterZ = backPlateZ - heaterThickness;

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
const heaterFenceGap = box(
  cableReliefWidth,
  fenceThickness + 2,
  fenceHeight + 2
).translate(
  0,
  -(heaterHeight + 2 * heaterClearance) / 2 - fenceThickness / 2,
  backPlateZ - fenceHeight - 1
);

const retainerOuterWidth = heaterWidth + 2 * (heaterClearance + fenceThickness);
const retainerOuterHeight = heaterHeight + 2 * (heaterClearance + fenceThickness);
const retainerInnerWidth = heaterWidth - 2 * retainerLipOverlap;
const retainerInnerHeight = heaterHeight - 2 * retainerLipOverlap;
const retainerTopZ = backPlateZ - fenceHeight - retainerThickness;
const retainerSkirtZ = retainerTopZ + retainerThickness;

const retainerSnapY = [
  -retainerOuterHeight / 2 - retainerSnapProjection / 2,
  retainerOuterHeight / 2 + retainerSnapProjection / 2,
];
const retainerSnapX = [
  -retainerOuterWidth / 2 - retainerSnapProjection / 2,
  retainerOuterWidth / 2 + retainerSnapProjection / 2,
];

const heaterFenceSnapWindows = [
  box(retainerSnapWidth + retainerSnapClearance, fenceThickness + 2, retainerSnapHeight + retainerSnapClearance)
    .translate(-42, retainerSnapY[0], retainerSkirtZ + retainerSkirtHeight / 2),
  box(retainerSnapWidth + retainerSnapClearance, fenceThickness + 2, retainerSnapHeight + retainerSnapClearance)
    .translate(42, retainerSnapY[0], retainerSkirtZ + retainerSkirtHeight / 2),
  box(retainerSnapWidth + retainerSnapClearance, fenceThickness + 2, retainerSnapHeight + retainerSnapClearance)
    .translate(-42, retainerSnapY[1], retainerSkirtZ + retainerSkirtHeight / 2),
  box(retainerSnapWidth + retainerSnapClearance, fenceThickness + 2, retainerSnapHeight + retainerSnapClearance)
    .translate(42, retainerSnapY[1], retainerSkirtZ + retainerSkirtHeight / 2),
  box(fenceThickness + 2, retainerSnapWidth + retainerSnapClearance, retainerSnapHeight + retainerSnapClearance)
    .translate(retainerSnapX[0], -56, retainerSkirtZ + retainerSkirtHeight / 2),
  box(fenceThickness + 2, retainerSnapWidth + retainerSnapClearance, retainerSnapHeight + retainerSnapClearance)
    .translate(retainerSnapX[0], 56, retainerSkirtZ + retainerSkirtHeight / 2),
  box(fenceThickness + 2, retainerSnapWidth + retainerSnapClearance, retainerSnapHeight + retainerSnapClearance)
    .translate(retainerSnapX[1], -56, retainerSkirtZ + retainerSkirtHeight / 2),
  box(fenceThickness + 2, retainerSnapWidth + retainerSnapClearance, retainerSnapHeight + retainerSnapClearance)
    .translate(retainerSnapX[1], 56, retainerSkirtZ + retainerSkirtHeight / 2),
];

const heaterFence = difference(
  heaterFenceOuter,
  heaterFenceInner,
  heaterFenceGap,
  heaterFenceSnapWindows
)
  .color("#5f6368");

function backPlateSnap(side, y) {
  const rootX = side * innerSpan / 2;
  const insideX = rootX - side * snapTabThickness;
  const hookX = rootX + side * snapBarbProjection;
  const topZ = backPlateZ;
  const neckZ = backPlateZ - snapTabDepth;
  const hookTipZ = neckZ + snapBarbHeight * 0.55;
  const hookTopZ = neckZ + snapBarbHeight;
  const points = [
    [rootX, topZ],
    [insideX, topZ],
    [insideX, neckZ],
    [rootX, neckZ],
    [hookX, hookTipZ],
    [rootX, hookTopZ],
  ];

  // A single side profile makes the latch one continuous printable hook.
  return filletCorners(points, [
    { index: 3, radius: 0.25, segments: 4 },
    { index: 4, radius: 0.35, segments: 6 },
    { index: 5, radius: 0.25, segments: 4 },
  ])
    .extrude(snapTabWidth)
    .rotateX(90)
    .translate(0, y + snapTabWidth / 2, 0);
}

const snapTabs = [];

for (const y of sideWindowY) {
  snapTabs.push(backPlateSnap(-1, y));
  snapTabs.push(backPlateSnap(1, y));
}

const backPlate = union(backPlateBase, heaterFence, snapTabs).color("#5f6368");

const heater = box(heaterWidth, heaterHeight, heaterThickness)
  .translate(0, 0, heaterZ)
  .color("#d77a61");

const retainerBlank = chamfer(box(retainerOuterWidth, retainerOuterHeight, retainerThickness), edgeChamfer, exposedEdgeSelector)
  .translate(0, 0, retainerTopZ);
const retainerOpening = box(retainerInnerWidth, retainerInnerHeight, retainerThickness + 2)
  .translate(0, 0, retainerTopZ - 1);
const retainerTop = heaterLidStyle === "closed"
  ? retainerBlank
  : difference(retainerBlank, retainerOpening);

const skirtOuter = box(
  retainerOuterWidth,
  retainerOuterHeight,
  retainerSkirtHeight
).translate(0, 0, retainerSkirtZ);
const skirtInner = box(
  heaterWidth + 2 * heaterClearance + 2 * retainerSkirtClearance,
  heaterHeight + 2 * heaterClearance + 2 * retainerSkirtClearance,
  retainerSkirtHeight + 2
).translate(0, 0, retainerSkirtZ - 1);
const retainerSkirt = difference(skirtOuter, skirtInner);

const retainerSnaps = [
  chamfer(box(retainerSnapWidth, retainerSnapProjection, retainerSnapHeight), snapChamfer, tabLeadInSelector)
    .translate(-42, retainerSnapY[0], retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapWidth, retainerSnapProjection, retainerSnapHeight), snapChamfer, tabLeadInSelector)
    .translate(42, retainerSnapY[0], retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapWidth, retainerSnapProjection, retainerSnapHeight), snapChamfer, tabLeadInSelector)
    .translate(-42, retainerSnapY[1], retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapWidth, retainerSnapProjection, retainerSnapHeight), snapChamfer, tabLeadInSelector)
    .translate(42, retainerSnapY[1], retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapProjection, retainerSnapWidth, retainerSnapHeight), snapChamfer, sideTabLeadInSelector)
    .translate(retainerSnapX[0], -56, retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapProjection, retainerSnapWidth, retainerSnapHeight), snapChamfer, sideTabLeadInSelector)
    .translate(retainerSnapX[0], 56, retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapProjection, retainerSnapWidth, retainerSnapHeight), snapChamfer, sideTabLeadInSelector)
    .translate(retainerSnapX[1], -56, retainerSkirtZ + retainerSkirtHeight / 2),
  chamfer(box(retainerSnapProjection, retainerSnapWidth, retainerSnapHeight), snapChamfer, sideTabLeadInSelector)
    .translate(retainerSnapX[1], 56, retainerSkirtZ + retainerSkirtHeight / 2),
];
const heaterRetainerLid = union(
  retainerTop,
  retainerSkirt,
  retainerSnaps
).color("#4c5358");

const totalDepth = frontThickness + frameDepth + backThickness;
const stackMidZ = totalDepth / 2;

cutPlane("Center X Section", [1, 0, 0], 0);
cutPlane("Center Y Section", [0, 1, 0], 0);
cutPlane("Mid Stack Section", [0, 0, 1], stackMidZ);

const parts = [
  { name: "Front Plate + Frame", shape: frontPlateAndFrame },
  { name: "Heater", shape: heater },
  { name: "Heater Retainer Lid", shape: heaterRetainerLid },
  { name: "Back Plate", shape: backPlate },
];
const selectedParts = exportPart === "all"
  ? parts
  : parts.filter((part) => part.name === exportPart);

return group(...selectedParts);
