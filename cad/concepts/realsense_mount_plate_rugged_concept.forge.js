// Rugged redesign concept for the RealSense / PureThermal / USB-C hub stack.
// This version keeps the original model intact and explores a more compact,
// screw-mounted architecture with a structural spine and protected board zones.

const coreWidth = Param.number("Core Width", 60, { min: 45, max: 90, unit: "mm" });
const coreHeight = Param.number("Core Height", 64, { min: 48, max: 100, unit: "mm" });
const plateThickness = Param.number("Plate Thickness", 5, { min: 3, max: 12, unit: "mm" });

const spineWidth = Param.number("Spine Width", 32, { min: 20, max: 50, unit: "mm" });
const topPadHeight = Param.number("Top Pad Height", 16, { min: 10, max: 28, unit: "mm" });
const lowerBlockHeight = Param.number("Lower Block Height", 20, { min: 12, max: 32, unit: "mm" });
const edgeChamfer = Param.number("Edge Chamfer", 1, { min: 0, max: 3, unit: "mm" });

const d435HoleDiameter = Param.number("D435i Hole Diameter", 3.2, { min: 2, max: 5, unit: "mm" });
const d435HoleSpacing = Param.number("D435i Hole Spacing", 45, { min: 20, max: 70, unit: "mm" });
const d435HoleTopInset = Param.number("D435i Hole Top Inset", 7.5, { min: 4, max: 18, unit: "mm" });

const standPegDiameter = Param.number("Stand Peg Diameter", 4, { min: 2, max: 8, unit: "mm" });
const standPegHoleClearance = Param.number("Stand Peg Hole Clearance", 0.2, { min: 0, max: 1, unit: "mm" });
const standPegLength = Param.number("Stand Peg Length", 8, { min: 2, max: 20, unit: "mm" });
const standPegSpacing = Param.number("Stand Peg Spacing", 40, { min: 10, max: 70, unit: "mm" });
const standFootWidth = Param.number("Stand Foot Width", 14, { min: 8, max: 30, unit: "mm" });
const standFootDepth = Param.number("Stand Foot Depth", 30, { min: 10, max: 60, unit: "mm" });
const standFootThickness = Param.number("Stand Foot Thickness", 6, { min: 3, max: 15, unit: "mm" });
const standRiserHeight = Param.number("Stand Riser Height", 34, { min: 0, max: 60, unit: "mm" });
const standRiserBaseDiameter = Param.number("Stand Riser Base Diameter", 12, { min: 4, max: 20, unit: "mm" });

const frontBoardMountX = Param.number("Front Board Mount X Spacing", 18, { min: 8, max: 40, unit: "mm" });
const frontBoardMountZ = Param.number("Front Board Mount Z Spacing", 24, { min: 8, max: 50, unit: "mm" });
const frontBoardCenterZ = Param.number("Front Board Center Z", -2, { min: -20, max: 20, unit: "mm" });
const frontBoardBossDiameter = Param.number("Front Board Boss Diameter", 7, { min: 4, max: 12, unit: "mm" });
const frontBoardStandoff = Param.number("Front Board Standoff", 4, { min: 2, max: 12, unit: "mm" });
const frontBoardScrewDiameter = Param.number("Front Board Screw Diameter", 2.4, { min: 1.4, max: 4, unit: "mm" });
const frontGuardDepth = Param.number("Front Guard Depth", 3, { min: 1, max: 8, unit: "mm" });
const frontGuardThickness = Param.number("Front Guard Thickness", 2.5, { min: 1, max: 6, unit: "mm" });

const rearBoardMountX = Param.number("Rear Board Mount X Spacing", 42, { min: 12, max: 70, unit: "mm" });
const rearBoardMountZ = Param.number("Rear Board Mount Z Spacing", 30, { min: 8, max: 60, unit: "mm" });
const rearBoardCenterZ = Param.number("Rear Board Center Z", -4, { min: -24, max: 20, unit: "mm" });
const rearBoardBossDiameter = Param.number("Rear Board Boss Diameter", 7, { min: 4, max: 12, unit: "mm" });
const rearBoardStandoff = Param.number("Rear Board Standoff", 5, { min: 2, max: 14, unit: "mm" });
const rearBoardScrewDiameter = Param.number("Rear Board Screw Diameter", 2.4, { min: 1.4, max: 4, unit: "mm" });
const rearGuardDepth = Param.number("Rear Guard Depth", 3.5, { min: 1, max: 10, unit: "mm" });
const rearGuardThickness = Param.number("Rear Guard Thickness", 3, { min: 1, max: 8, unit: "mm" });

const boardGuardClearance = Param.number("Board Guard Clearance", 2, { min: 0.5, max: 6, unit: "mm" });
const lighteningWindowWidth = Param.number("Lightening Window Width", 10, { min: 0, max: 20, unit: "mm" });

const bottomZ = -coreHeight / 2;
const topZ = coreHeight / 2;
const topPadCenterZ = topZ - topPadHeight / 2;
const lowerBlockCenterZ = bottomZ + lowerBlockHeight / 2;
const topPadWidth = Math.max(coreWidth, d435HoleSpacing + 12, frontBoardMountX + frontBoardBossDiameter + 10);
const lowerBlockWidth = Math.max(coreWidth, rearBoardMountX + rearBoardBossDiameter + 10, standPegSpacing + 12);
const spineHeight = Math.max(8, coreHeight - topPadHeight - lowerBlockHeight + 10);
const sideWindowHeight = Math.max(0, coreHeight - topPadHeight - lowerBlockHeight - 6);
const d435HoleZ = topZ - d435HoleTopInset;
const standPegLeftX = -standPegSpacing / 2;
const standPegRightX = standPegSpacing / 2;
const standPegHoleRadius = (standPegDiameter + standPegHoleClearance) / 2;

function chamferedBox(width, depth, height) {
  const shape = box(width, depth, height);
  if (edgeChamfer <= 0) {
    return shape;
  }

  return chamfer(shape, edgeChamfer, { convex: true, minLength: 4 });
}

function faceHole(x, z, diameter) {
  return cylinder(plateThickness + 2, diameter / 2, undefined, 48)
    .pointAlong([0, 1, 0])
    .translate(x, -plateThickness / 2 - 1, z);
}

function verticalPegHole(x) {
  return cylinder(standPegLength + 1, standPegHoleRadius, undefined, 32)
    .pointAlong([0, 0, 1])
    .translate(x, 0, bottomZ - 0.5);
}

function boardHolePositions(centerZ, spacingX, spacingZ) {
  return [
    { x: -spacingX / 2, z: centerZ - spacingZ / 2 },
    { x: spacingX / 2, z: centerZ - spacingZ / 2 },
    { x: -spacingX / 2, z: centerZ + spacingZ / 2 },
    { x: spacingX / 2, z: centerZ + spacingZ / 2 },
  ];
}

function bossOnFace(x, z, side, length, diameter) {
  const direction = side === "front" ? [0, -1, 0] : [0, 1, 0];
  const startY = side === "front" ? -plateThickness / 2 : plateThickness / 2;

  return cylinder(length, diameter / 2, undefined, 32)
    .pointAlong(direction)
    .translate(x, startY, z);
}

function screwPathOnFace(x, z, side, length, diameter) {
  const direction = side === "front" ? [0, -1, 0] : [0, 1, 0];
  const startY = side === "front" ? plateThickness / 2 + 1 : -plateThickness / 2 - 1;

  return cylinder(length + plateThickness + 2, diameter / 2, undefined, 32)
    .pointAlong(direction)
    .translate(x, startY, z);
}

function protectiveGuards(side, centerZ, spacingX, spacingZ, guardDepth, guardThickness, color) {
  const direction = side === "front" ? -1 : 1;
  const boardWidth = spacingX + 2 * (boardGuardClearance + guardThickness);
  const boardHeight = spacingZ + 2 * (boardGuardClearance + guardThickness);
  const guardCenterY = direction * (plateThickness / 2 + guardDepth / 2);

  const leftGuard = chamferedBox(guardThickness, guardDepth, boardHeight).translate(
    -(spacingX / 2 + boardGuardClearance + guardThickness / 2),
    guardCenterY,
    centerZ
  );

  const rightGuard = chamferedBox(guardThickness, guardDepth, boardHeight).translate(
    spacingX / 2 + boardGuardClearance + guardThickness / 2,
    guardCenterY,
    centerZ
  );

  const bottomGuard = chamferedBox(boardWidth, guardDepth, guardThickness).translate(
    0,
    guardCenterY,
    centerZ - boardHeight / 2 + guardThickness / 2
  );

  const topBridge = chamferedBox(boardWidth * 0.65, guardDepth, guardThickness).translate(
    0,
    guardCenterY,
    centerZ + boardHeight / 2 - guardThickness / 2
  );

  return union(leftGuard, rightGuard, bottomGuard, topBridge).color(color);
}

function boardMount(side, centerZ, spacingX, spacingZ, bossDiameter, standoff, screwDiameter, guardDepth, guardThickness, color) {
  const bosses = [];
  const screwHoles = [];

  for (const position of boardHolePositions(centerZ, spacingX, spacingZ)) {
    bosses.push(bossOnFace(position.x, position.z, side, standoff, bossDiameter));
    screwHoles.push(screwPathOnFace(position.x, position.z, side, standoff, screwDiameter));
  }

  const bossCluster = difference(union(...bosses), ...screwHoles).color(color);
  const guards = protectiveGuards(
    side,
    centerZ,
    spacingX,
    spacingZ,
    guardDepth,
    guardThickness,
    color
  );

  return union(bossCluster, guards).color(color);
}

const bodyPositioned = union(
  chamferedBox(topPadWidth, plateThickness, topPadHeight)
    .translate(0, 0, topPadCenterZ),
  chamferedBox(spineWidth, plateThickness, spineHeight)
    .translate(0, 0, 0),
  chamferedBox(lowerBlockWidth, plateThickness, lowerBlockHeight)
    .translate(0, 0, lowerBlockCenterZ)
);

const lighteningCuts = [];
if (lighteningWindowWidth > 0 && sideWindowHeight > 0) {
  const windowCenterOffset = spineWidth / 2 + lighteningWindowWidth / 2 + 3;
  const windowZ = (topPadCenterZ + lowerBlockCenterZ) / 2;

  lighteningCuts.push(
    box(lighteningWindowWidth, plateThickness + 2, sideWindowHeight)
      .translate(-windowCenterOffset, 0, windowZ)
  );
  lighteningCuts.push(
    box(lighteningWindowWidth, plateThickness + 2, sideWindowHeight)
      .translate(windowCenterOffset, 0, windowZ)
  );
}

const body = difference(
  bodyPositioned,
  faceHole(-d435HoleSpacing / 2, d435HoleZ, d435HoleDiameter),
  faceHole(d435HoleSpacing / 2, d435HoleZ, d435HoleDiameter),
  verticalPegHole(standPegLeftX),
  verticalPegHole(standPegRightX),
  ...lighteningCuts
).color("#6d6f73");

const frontMount = boardMount(
  "front",
  frontBoardCenterZ,
  frontBoardMountX,
  frontBoardMountZ,
  frontBoardBossDiameter,
  frontBoardStandoff,
  frontBoardScrewDiameter,
  frontGuardDepth,
  frontGuardThickness,
  "#585a5e"
);

const rearMount = boardMount(
  "rear",
  rearBoardCenterZ,
  rearBoardMountX,
  rearBoardMountZ,
  rearBoardBossDiameter,
  rearBoardStandoff,
  rearBoardScrewDiameter,
  rearGuardDepth,
  rearGuardThickness,
  "#4d5054"
);

const accessoryBoss = chamferedBox(
  Math.min(lowerBlockWidth - 8, Math.max(18, spineWidth + 6)),
  8,
  lowerBlockHeight - 4
)
  .translate(0, plateThickness / 2 + 4, lowerBlockCenterZ)
  .color("#4d5054");

const standFootTopZ = bottomZ - standRiserHeight;
const standFootBottomZ = standFootTopZ - standFootThickness;

const standInsertPeg = (x) =>
  cylinder(standPegLength, standPegDiameter / 2, undefined, 32)
    .pointAlong([0, 0, 1])
    .translate(x, 0, bottomZ);

const standRiserPost = (x) =>
  cylinder(standRiserHeight, standRiserBaseDiameter / 2, standPegDiameter / 2, 32)
    .pointAlong([0, 0, 1])
    .translate(x, 0, standFootTopZ);

const standFoot = (x) =>
  chamferedBox(standFootWidth, standFootDepth, standFootThickness)
    .translate(x, 0, standFootBottomZ)
    .color("#5a5950");

const stand = union(
  standFoot(standPegLeftX),
  union(standInsertPeg(standPegLeftX), standRiserPost(standPegLeftX)),
  standFoot(standPegRightX),
  union(standInsertPeg(standPegRightX), standRiserPost(standPegRightX))
);

return {
  "realsense rugged concept bracket": union(body, frontMount, rearMount, accessoryBoss),
  "realsense rugged concept stand": stand,
};
