// PureThermal 3 tray only.
// Extracted from the broader PT3 concept so it can be reused independently.

const boardWidth = Param.number("Board Width", 25.8, { min: 20, max: 40, unit: "mm" });
const boardDepth = Param.number("Board Depth", 28.9, { min: 20, max: 45, unit: "mm" });
const holeSpacingX = Param.number("Hole Spacing X", 20.7, { min: 10, max: 35, unit: "mm" });
const holeSpacingY = Param.number("Hole Spacing Y", 23.9, { min: 10, max: 40, unit: "mm" });

const trayWall = Param.number("Tray Wall", 2.5, { min: 1.5, max: 5, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 1.2, { min: 0.8, max: 3, unit: "mm" });
const trayHeight = Param.number("Tray Height", 5.2, { min: 3, max: 12, unit: "mm" });
const containmentWallHeight = Param.number("Containment Wall Height", 3.0, { min: 0, max: 20, unit: "mm" });
const containmentWallThickness = Param.number("Containment Wall Thickness", 1.8, { min: 0.8, max: 6, unit: "mm" });
const supportRim = Param.number("Support Rim", 0.7, { min: 0.3, max: 3, unit: "mm" });
const cavityCornerFillet = Param.number("Cavity Corner Fillet", 2, { min: 0, max: 8, unit: "mm" });
const trayFitMargin = Param.number("Tray Fit Margin", 0.2, { min: 0, max: 4, unit: "mm" });

const standoffDiameter = Param.number("Standoff Diameter", 5.2, { min: 3, max: 12, unit: "mm" });
const m2InsertPilotDiameter = Param.number("M2 Insert Pilot Diameter", 2.7, { min: 2.5, max: 3.2, unit: "mm" });
const m2InsertPocketDepth = Param.number("M2 Insert Pocket Depth", 2.2, { min: 2, max: 3.8, unit: "mm" });

const usbCutoutWidth = Param.number("USB Cutout Width", 10, { min: 4, max: 20, unit: "mm" });
const usbCutoutHeight = Param.number("USB Cutout Height", 4.2, { min: 2, max: 10, unit: "mm" });
const usbCutoutDepth = Param.number("USB Cutout Depth", 6, { min: 1, max: 20, unit: "mm" });
const usbCutoutCenterX = Param.number("USB Cutout Center X", 0, { min: -30, max: 30, unit: "mm" });
const usbCutoutCenterY = Param.number("USB Cutout Center Y", -14.33, { min: -40, max: 40, unit: "mm" });
const usbCutoutCenterZ = Param.number("USB Cutout Center Z", 8.51, { min: 0, max: 40, unit: "mm" });
const usbCutoutCornerRadius = Param.number("USB Cutout Corner Radius", 1.4, { min: 0, max: 5, unit: "mm" });
const wallExtensionDepth = Param.number("Wall Extension Depth", 6, { min: 0, max: 20, unit: "mm" });
const mountHoleDiameter = Param.number("Mount Hole Diameter", 3.2, { min: 1, max: 6, unit: "mm" });
const mountHoleSpacingX = Param.number("Mount Hole Spacing X", 8, { min: 4, max: 40, unit: "mm" });
const mountScrewHeadDiameter = Param.number("Mount Screw Head Clearance", 6.0, { min: 5.0, max: 8.0, step: 0.1, unit: "mm" });
const mountScrewHeadDepth = Param.number("Mount Screw Head Recess", 3.2, { min: 1.0, max: 5.0, step: 0.1, unit: "mm" });

const bossRadius = standoffDiameter / 2;
const tangentOuterWidth = holeSpacingX + standoffDiameter;
const tangentOuterDepth = holeSpacingY + standoffDiameter;
const minimumOuterWidth = boardWidth + trayFitMargin;
const minimumOuterDepth = boardDepth + trayFitMargin;
const trayInnerWidth = Math.max(tangentOuterWidth, minimumOuterWidth);
const trayInnerDepth = Math.max(tangentOuterDepth, minimumOuterDepth);
const outerWidth = trayInnerWidth + containmentWallThickness * 2;
const outerDepth = trayInnerDepth + containmentWallThickness * 2;
const innerWidth = Math.min(boardWidth, trayInnerWidth - supportRim * 2);
const innerDepth = Math.min(boardDepth, trayInnerDepth - supportRim * 2);
const containmentOuterRadius = bossRadius + containmentWallThickness;
const totalHeight = trayHeight + containmentWallHeight;

const outer = box(outerWidth, outerDepth, trayHeight);
const shell = fillet(outer, containmentOuterRadius, { parallel: [0, 0, 1], convex: true });

const cavityBlank = box(innerWidth, innerDepth, trayHeight - floorThickness + 0.01);
const cavity = cavityCornerFillet > 0
  ? fillet(
      cavityBlank,
      Math.min(cavityCornerFillet, innerWidth / 2 - 0.1, innerDepth / 2 - 0.1),
      { parallel: [0, 0, 1], convex: true }
    ).translate(0, 0, floorThickness + 0.01)
  : cavityBlank.translate(0, 0, floorThickness + 0.01);

let tray = difference(shell, cavity);

const containmentOuterBlank = box(outerWidth, outerDepth, totalHeight);
const containmentOuterBase = containmentWallHeight > 0
  ? containmentOuterBlank
  : null;
const wallExtension = wallExtensionDepth > 0
  ? box(outerWidth, wallExtensionDepth, totalHeight)
      .translate(0, outerDepth / 2 + wallExtensionDepth / 2, 0)
  : null;
const containmentOuterRaw = containmentOuterBase
  ? (wallExtension ? union(containmentOuterBase, wallExtension) : containmentOuterBase)
  : null;
const containmentOuterRadiusClamped = Math.min(
  containmentOuterRadius,
  outerWidth / 2 - 0.1,
  (outerDepth + wallExtensionDepth) / 2 - 0.1,
  wallExtensionDepth > 0 ? wallExtensionDepth / 2 - 0.1 : containmentOuterRadius
);
const containmentOuter = containmentOuterRaw
  ? fillet(
      containmentOuterRaw,
      Math.max(0, containmentOuterRadiusClamped),
      { parallel: [0, 0, 1], convex: true }
    )
  : null;
const containmentInnerWidth = Math.max(0.1, trayInnerWidth);
const containmentInnerDepth = Math.max(0.1, trayInnerDepth);
const containmentInnerBlank = box(containmentInnerWidth, containmentInnerDepth, totalHeight - floorThickness + 0.02);
const containmentInnerBase = containmentWallHeight > 0
  ? containmentInnerBlank
  : null;
const containmentInner = containmentInnerBase
  ? fillet(
      containmentInnerBase,
      Math.min(bossRadius, containmentInnerWidth / 2 - 0.1, containmentInnerDepth / 2 - 0.1),
      { parallel: [0, 0, 1], convex: true }
    ).translate(0, 0, floorThickness - 0.01)
  : null;
const containmentWall = containmentWallHeight > 0
  ? difference(containmentOuter, containmentInner)
  : null;

const bossHeight = trayHeight - floorThickness;
const hx = holeSpacingX / 2;
const hy = holeSpacingY / 2;

function screwBoss(x, y) {
  const boss = cylinder(bossHeight, bossRadius, bossRadius, 24)
    .translate(x, y, floorThickness);
  const pocketDepth = Math.min(m2InsertPocketDepth, bossHeight - 0.2);
  const insertPocket = cylinder(
    pocketDepth + 0.02,
    m2InsertPilotDiameter / 2,
    m2InsertPilotDiameter / 2,
    24
  ).translate(x, y, trayHeight - pocketDepth);
  return difference(boss, insertPocket);
}

tray = union(
  tray,
  screwBoss(-hx, -hy),
  screwBoss(hx, -hy),
  screwBoss(-hx, hy),
  screwBoss(hx, hy),
).color("#6b6f74");

tray = containmentWall ? union(tray, containmentWall).color("#6b6f74") : tray;

const wallInnerFaceY = trayInnerDepth / 2;
const extensionOuterFaceY = outerDepth / 2 + wallExtensionDepth;
const mountHoleCenterY = wallExtensionDepth > 0
  ? (wallInnerFaceY + extensionOuterFaceY) / 2
  : outerDepth / 2;
const extensionMountHole = (x) =>
  cylinder(totalHeight + 1, mountHoleDiameter / 2, mountHoleDiameter / 2, 24)
    .translate(x, mountHoleCenterY, -0.5);
const extensionMountCounterbore = (x) =>
  cylinder(mountScrewHeadDepth + 0.02, mountScrewHeadDiameter / 2, mountScrewHeadDiameter / 2, 32)
    .translate(x, mountHoleCenterY, totalHeight - mountScrewHeadDepth);

tray = wallExtensionDepth > 0
  ? difference(
      tray,
      extensionMountHole(-mountHoleSpacingX / 2),
      extensionMountHole(mountHoleSpacingX / 2),
      extensionMountCounterbore(-mountHoleSpacingX / 2),
      extensionMountCounterbore(mountHoleSpacingX / 2)
    ).color("#6b6f74")
  : tray;

const usbCutoutBlank = box(usbCutoutWidth, usbCutoutDepth, usbCutoutHeight + 0.02)
  .translate(
    usbCutoutCenterX,
    usbCutoutCenterY - usbCutoutDepth / 2,
    usbCutoutCenterZ - usbCutoutHeight / 2 - 0.01
  );
const usbCutout = usbCutoutCornerRadius > 0
  ? fillet(
      usbCutoutBlank,
      Math.min(usbCutoutCornerRadius, usbCutoutWidth / 2 - 0.1, usbCutoutHeight / 2 - 0.1),
      { parallel: [0, 1, 0], convex: true }
    )
  : usbCutoutBlank;

return difference(tray, usbCutout).color("#6b6f74");
