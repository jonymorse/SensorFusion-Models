// PureThermal 3 tray only.
// Extracted from the broader PT3 concept so it can be reused independently.

const boardWidth = Param.number("Board Width", 25.8, { min: 20, max: 40, unit: "mm" });
const boardDepth = Param.number("Board Depth", 28.9, { min: 20, max: 45, unit: "mm" });
const holeSpacingX = Param.number("Hole Spacing X", 20.7, { min: 10, max: 35, unit: "mm" });
const holeSpacingY = Param.number("Hole Spacing Y", 23.9, { min: 10, max: 40, unit: "mm" });

const trayWall = Param.number("Tray Wall", 2.5, { min: 1.5, max: 5, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 1.2, { min: 0.8, max: 3, unit: "mm" });
const trayHeight = Param.number("Tray Height", 5.2, { min: 3, max: 12, unit: "mm" });
const containmentWallHeight = Param.number("Containment Wall Height", 4, { min: 0, max: 20, unit: "mm" });
const containmentWallThickness = Param.number("Containment Wall Thickness", 1.8, { min: 0.8, max: 6, unit: "mm" });
const supportRim = Param.number("Support Rim", 0.7, { min: 0.3, max: 3, unit: "mm" });
const cavityCornerFillet = Param.number("Cavity Corner Fillet", 2, { min: 0, max: 8, unit: "mm" });
const trayFitMargin = Param.number("Tray Fit Margin", 0.2, { min: 0, max: 4, unit: "mm" });

const standoffDiameter = Param.number("Standoff Diameter", 5.2, { min: 3, max: 12, unit: "mm" });
const screwClearance = Param.number("Screw Clearance", 2.4, { min: 1.6, max: 3.5, unit: "mm" });

const usbCutoutWidth = Param.number("USB Cutout Width", 10, { min: 4, max: 20, unit: "mm" });
const usbCutoutHeight = Param.number("USB Cutout Height", 4.2, { min: 2, max: 10, unit: "mm" });
const usbCutoutDepth = Param.number("USB Cutout Depth", 6, { min: 1, max: 20, unit: "mm" });
const usbCutoutCenterX = Param.number("USB Cutout Center X", 0, { min: -30, max: 30, unit: "mm" });
const usbCutoutCenterY = Param.number("USB Cutout Center Y", -14.33, { min: -40, max: 40, unit: "mm" });
const usbCutoutCenterZ = Param.number("USB Cutout Center Z", 8.51, { min: 0, max: 40, unit: "mm" });
const usbCutoutCornerRadius = Param.number("USB Cutout Corner Radius", 1.4, { min: 0, max: 5, unit: "mm" });

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

const containmentOuterBlank = box(outerWidth, outerDepth, containmentWallHeight);
const containmentOuter = containmentWallHeight > 0
  ? fillet(containmentOuterBlank, containmentOuterRadius, { parallel: [0, 0, 1], convex: true })
  : null;
const containmentInnerWidth = Math.max(0.1, trayInnerWidth);
const containmentInnerDepth = Math.max(0.1, trayInnerDepth);
const containmentInnerBlank = box(containmentInnerWidth, containmentInnerDepth, containmentWallHeight + 0.02);
const containmentInner = containmentWallHeight > 0
  ? fillet(containmentInnerBlank, bossRadius, { parallel: [0, 0, 1], convex: true }).translate(0, 0, -0.01)
  : null;
const containmentWall = containmentWallHeight > 0
  ? difference(containmentOuter, containmentInner).translate(0, 0, trayHeight)
  : null;

const bossHeight = trayHeight - floorThickness;
const hx = holeSpacingX / 2;
const hy = holeSpacingY / 2;

function screwBoss(x, y) {
  const boss = cylinder(bossHeight, bossRadius, bossRadius, 24)
    .translate(x, y, floorThickness);
  const hole = cylinder(bossHeight + 1, screwClearance / 2, screwClearance / 2, 16)
    .translate(x, y, floorThickness - 0.5);
  return difference(boss, hole);
}

tray = union(
  tray,
  screwBoss(-hx, -hy),
  screwBoss(hx, -hy),
  screwBoss(-hx, hy),
  screwBoss(hx, hy),
).color("#6b6f74");

tray = containmentWall ? union(tray, containmentWall).color("#6b6f74") : tray;

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
