// PureThermal 3 mounting tray.
// Rebuilt from scratch using a simple XY-centered, Z-up enclosure workflow.

const boardWidth = Param.number("Board Width", 25.8, { min: 20, max: 40, unit: "mm" });
const boardDepth = Param.number("Board Depth", 28.9, { min: 20, max: 45, unit: "mm" });
const boardThickness = Param.number("Board Thickness", 1.6, { min: 1, max: 3, unit: "mm" });

const holeSpacingX = Param.number("Hole Spacing X", 20.7, { min: 10, max: 35, unit: "mm" });
const holeSpacingY = Param.number("Hole Spacing Y", 23.9, { min: 10, max: 40, unit: "mm" });

const faceplateMargin = Param.number("Faceplate Margin", 4, { min: 1, max: 12, unit: "mm" });
const faceplateThickness = Param.number("Faceplate Thickness", 3, { min: 1.5, max: 8, unit: "mm" });
const faceplateCornerFillet = Param.number("Faceplate Corner Fillet", 3, { min: 0, max: 8, unit: "mm" });

const apertureWidth = Param.number("Aperture Width", 9, { min: 3, max: 20, unit: "mm" });
const apertureHeight = Param.number("Aperture Height", 7, { min: 3, max: 20, unit: "mm" });
const apertureCornerRadius = Param.number("Aperture Corner Radius", 2.5, { min: 0, max: 8, unit: "mm" });
const apertureOffsetX = Param.number("Aperture Offset X", 0.14, { min: -20, max: 20, unit: "mm" });
const apertureOffsetY = Param.number("Aperture Offset Y", 6.82, { min: -20, max: 20, unit: "mm" });
const faceplatePegDiameter = Param.number("Faceplate Peg Diameter", 1.8, { min: 0.8, max: 3, unit: "mm" });
const faceplatePegBaseDiameter = Param.number("Faceplate Peg Base Diameter", 3.2, { min: 1.8, max: 6, unit: "mm" });
const faceplatePegBaseHeight = Param.number("Faceplate Peg Base Height", 2.5, { min: 0, max: 8, unit: "mm" });
const pegHeightMode = Param.choice("Peg Height Mode", "auto", ["auto", "manual"]);
const faceplatePegHeight = Param.number("Manual Peg Height", 10, { min: 0, max: 20, unit: "mm" });
const pegTipClearance = Param.number("Peg Tip Clearance", 0, { min: 0, max: 1, unit: "mm" });

const trayWall = Param.number("Tray Wall", 2.5, { min: 1.5, max: 5, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 1.2, { min: 0.8, max: 3, unit: "mm" });
const trayHeight = Param.number("Tray Height", 5.2, { min: 3, max: 12, unit: "mm" });
const containmentWallHeight = Param.number("Containment Wall Height", 4, { min: 0, max: 20, unit: "mm" });
const containmentWallThickness = Param.number("Containment Wall Thickness", 1.8, { min: 0.8, max: 6, unit: "mm" });
const usbCutoutWidth = Param.number("USB Cutout Width", 10, { min: 4, max: 20, unit: "mm" });
const usbCutoutHeight = Param.number("USB Cutout Height", 4.2, { min: 2, max: 10, unit: "mm" });
const usbCutoutDepth = Param.number("USB Cutout Depth", 6, { min: 1, max: 20, unit: "mm" });
const usbCutoutCenterX = Param.number("USB Cutout Center X", 0, { min: -30, max: 30, unit: "mm" });
const usbCutoutCenterY = Param.number("USB Cutout Center Y", -14.33, { min: -40, max: 40, unit: "mm" });
const usbCutoutCenterZ = Param.number("USB Cutout Center Z", 8.51, { min: 0, max: 40, unit: "mm" });
const usbCutoutCornerRadius = Param.number("USB Cutout Corner Radius", 1.4, { min: 0, max: 5, unit: "mm" });
const supportRim = Param.number("Support Rim", 0.7, { min: 0.3, max: 3, unit: "mm" });
const cavityCornerFillet = Param.number("Cavity Corner Fillet", 2, { min: 0, max: 8, unit: "mm" });
const trayFitMargin = Param.number("Tray Fit Margin", 0.2, { min: 0, max: 4, unit: "mm" });

const standoffDiameter = Param.number("Standoff Diameter", 5.2, { min: 3, max: 12, unit: "mm" });
const screwClearance = Param.number("Screw Clearance", 2.4, { min: 1.6, max: 3.5, unit: "mm" });
const pt3SeatOffset = Param.number("PT3 Seat Offset", -0.4, { min: -3, max: 3, unit: "mm" });

const showBoard = Param.choice("Show Board", "yes", ["yes", "no"]);

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
const containmentOuterWidth = outerWidth;
const containmentOuterDepth = outerDepth;
const containmentOuterRadius = bossRadius + containmentWallThickness;
const plateWidth = containmentOuterWidth;
const plateDepth = containmentOuterDepth;

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

let mount = difference(shell, cavity);

const containmentOuterBlank = box(containmentOuterWidth, containmentOuterDepth, containmentWallHeight);
const containmentOuter = containmentWallHeight > 0
  ? fillet(containmentOuterBlank, containmentOuterRadius, { parallel: [0, 0, 1], convex: true })
  : null;
const containmentInnerWidth = Math.max(0.1, trayInnerWidth);
const containmentInnerDepth = Math.max(0.1, trayInnerDepth);
const containmentInnerRadius = Math.max(0, bossRadius);
const containmentInnerBlank = box(containmentInnerWidth, containmentInnerDepth, containmentWallHeight + 0.02);
const containmentInner = containmentWallHeight > 0
  ? (
      containmentInnerRadius > 0
        ? fillet(containmentInnerBlank, containmentInnerRadius, { parallel: [0, 0, 1], convex: true })
        : containmentInnerBlank
    ).translate(0, 0, -0.01)
  : null;
const containmentWall = containmentWallHeight > 0
  ? difference(containmentOuter, containmentInner).translate(0, 0, trayHeight)
  : null;

const bossHeight = trayHeight - floorThickness;

function screwBoss(x, y) {
  const boss = cylinder(bossHeight, bossRadius, bossRadius, 24)
    .translate(x, y, floorThickness);
  const hole = cylinder(bossHeight + 1, screwClearance / 2, screwClearance / 2, 16)
    .translate(x, y, floorThickness - 0.5);

  return difference(boss, hole);
}

const hx = holeSpacingX / 2;
const hy = holeSpacingY / 2;

const bosses = [
  screwBoss(-hx, -hy),
  screwBoss(hx, -hy),
  screwBoss(-hx, hy),
  screwBoss(hx, hy),
];

mount = union(mount, ...bosses).color("#6b6f74");
mount = containmentWall ? union(mount, containmentWall).color("#6b6f74") : mount;

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

mount = difference(mount, usbCutout).color("#6b6f74");

const faceplateBlank = box(plateWidth, plateDepth, faceplateThickness);
const faceplateBody = faceplateCornerFillet > 0
  ? fillet(faceplateBlank, containmentOuterRadius, { parallel: [0, 0, 1], convex: true })
  : faceplateBlank;

const apertureBlank = box(apertureWidth, apertureHeight, faceplateThickness + 1)
  .translate(apertureOffsetX, apertureOffsetY, -0.5);
const aperture = apertureCornerRadius > 0
  ? fillet(
      apertureBlank,
      Math.min(apertureCornerRadius, apertureWidth / 2 - 0.1, apertureHeight / 2 - 0.1),
      { parallel: [0, 0, 1], convex: true }
    )
  : apertureBlank;

const faceplate = difference(faceplateBody, aperture);
const faceplatePegRadius = faceplatePegDiameter / 2;
const faceplatePegBaseRadius = faceplatePegBaseDiameter / 2;

const pt3Raw = Import.step("../../hardware_refs/PT3.step");
const pt3Bounds = pt3Raw.boundingBox();
const pt3CenterX = (pt3Bounds.min[0] + pt3Bounds.max[0]) / 2;
const pt3CenterY = (pt3Bounds.min[1] + pt3Bounds.max[1]) / 2;
const pt3PcbBottomZ = -boardThickness;
const pt3PcbTopZ = 0;
const boardBottomZ = trayHeight + pt3SeatOffset;
const boardTopZ = boardBottomZ + boardThickness;

const board = pt3Raw
  .translate(-pt3CenterX, -pt3CenterY, boardBottomZ - pt3PcbBottomZ)
  .color("#2d7f6f");

// The containment wall height is the primary datum for the faceplate seat.
const faceplateZ = trayHeight + containmentWallHeight;
const effectivePegHeight = pegHeightMode === "auto"
  ? Math.max(0, faceplateZ - floorThickness - pegTipClearance)
  : faceplatePegHeight;

function faceplatePeg(x, y) {
  const baseHeight = Math.min(faceplatePegBaseHeight, effectivePegHeight);
  const tipHeight = Math.max(0, effectivePegHeight - baseHeight);
  const base = baseHeight > 0
    ? cylinder(baseHeight, faceplatePegBaseRadius, faceplatePegBaseRadius, 24)
        .translate(x, y, -baseHeight)
    : null;
  const tip = tipHeight > 0
    ? cylinder(tipHeight, faceplatePegRadius, faceplatePegRadius, 20)
        .translate(x, y, -effectivePegHeight)
    : null;

  return base && tip ? union(base, tip) : (base || tip);
}

const faceplatePegs = effectivePegHeight > 0
  ? [
      faceplatePeg(-hx, -hy),
      faceplatePeg(hx, -hy),
      faceplatePeg(-hx, hy),
      faceplatePeg(hx, hy),
    ]
  : [];

const faceplateAssembly = union(faceplate, ...faceplatePegs)
  .translate(0, 0, faceplateZ)
  .color("#6b6f74");

return showBoard === "yes"
  ? {
      "purethermal tray": mount,
      "pt3 faceplate": faceplateAssembly,
      "purethermal board reference": board,
    }
  : {
      "purethermal tray": mount,
      "pt3 faceplate": faceplateAssembly,
    };
