// Slide-in PureThermal 3 carrier.
// Uses side grooves to retain the PCB, plus the same two-hole chassis mount
// pattern used by the sensor-fusion PT3 tray.

const boardWidth = Param.number("Board Width", 25.8, { min: 20, max: 40, unit: "mm" });
const boardDepth = Param.number("Board Depth", 28.9, { min: 20, max: 45, unit: "mm" });
const boardThickness = Param.number("Board Thickness", 1.6, { min: 1.2, max: 2.4, step: 0.1, unit: "mm" });
const slotFitMargin = Param.number("Slot Fit Margin", 0.25, { min: -0.4, max: 1, step: 0.05, unit: "mm" });
const slotHeightClearance = Param.number("Slot Height Clearance", 0.6, {
  min: 0,
  max: 1.5,
  step: 0.05,
  unit: "mm",
});
const bottomComponentClearance = Param.number("Bottom Component Clearance", 2.2, {
  min: 0,
  max: 6,
  step: 0.1,
  unit: "mm",
});

const floorThickness = Param.number("Floor Thickness", 1.2, { min: 0.8, max: 3, unit: "mm" });
const railThickness = Param.number("Side Rail Thickness", 3.0, { min: 1.5, max: 6, step: 0.1, unit: "mm" });
const railHeight = Param.number("Side Rail Height", 7.2, { min: 3, max: 12, step: 0.1, unit: "mm" });
const railSlotDepth = Param.number("Rail Slot Depth", 1.5, { min: 0.5, max: 3, step: 0.1, unit: "mm" });
const topCaptureLip = Param.number("Top Capture Lip", 1.0, { min: 0.4, max: 3, step: 0.1, unit: "mm" });
const backStopThickness = Param.number("Back Stop Thickness", 2.5, { min: 1, max: 6, step: 0.1, unit: "mm" });
const edgeMode = Param.choice("Edge Mode", "hard edges", [
  "hard edges",
  "filleted overhang",
]);
const mountingHoles = Param.choice("Mounting Holes", "include", [
  "include",
  "omit for prototype",
]);
const slideInOverhang = Param.number("Slide-In Overhang", 3, {
  min: 0,
  max: 10,
  step: 0.5,
  unit: "mm",
});

const mountExtensionDepth = Param.number("Wall Extension Depth", 6, { min: 0, max: 20, step: 0.5, unit: "mm" });
const mountPadMargin = Param.number("Mount Hole Pad Margin", 2.0, { min: 0, max: 6, step: 0.5, unit: "mm" });
const mountHoleDiameter = Param.number("Mount Hole Diameter", 3.2, { min: 1, max: 6, step: 0.1, unit: "mm" });
const mountHoleSpacingX = Param.number("Mount Hole Spacing X", 8, { min: 4, max: 40, step: 0.5, unit: "mm" });
const mountScrewHeadDiameter = Param.number("Mount Screw Head Clearance", 6.0, { min: 5.0, max: 8.0, step: 0.1, unit: "mm" });
const mountScrewHeadDepth = Param.number("Mount Screw Head Recess", 3.2, { min: 1.0, max: 5.0, step: 0.1, unit: "mm" });

const usbCutoutWidth = Param.number("USB Cutout Width", 10, { min: 4, max: 20, unit: "mm" });
const usbCutoutHeight = Param.number("USB Cutout Height", 4.2, { min: 2, max: 10, unit: "mm" });
const usbCutoutDepth = Param.number("USB Cutout Depth", 6, { min: 1, max: 20, unit: "mm" });
const usbCutoutCenterX = Param.number("USB Cutout Center X", 0, { min: -30, max: 30, unit: "mm" });

const boardCaptureWidth = boardWidth + slotFitMargin;
const slotClearanceWidth = Math.max(1, boardCaptureWidth - railSlotDepth * 2);
const boardSlotThickness = boardThickness + slotHeightClearance;
const outerWidth = slotClearanceWidth + railThickness * 2;
const boardPocketDepth = boardDepth + slotFitMargin;
const mountPadDepth = Math.max(mountExtensionDepth, mountScrewHeadDiameter + mountPadMargin * 2);
const hasMountExtension = mountingHoles === "include";
const effectiveMountExtensionDepth = hasMountExtension
  ? Math.max(mountExtensionDepth, mountPadDepth)
  : 0;
const frontOverhang = edgeMode === "filleted overhang" ? slideInOverhang : 0;
const outerEdgeFillet = edgeMode === "filleted overhang" ? 0.4 : 0;
const carrierDepth = frontOverhang + boardPocketDepth + backStopThickness + effectiveMountExtensionDepth;
const boardCenterY = -carrierDepth / 2 + frontOverhang + boardPocketDepth / 2;
const railCenterY = boardCenterY;
const backStopCenterY = -carrierDepth / 2 + frontOverhang + boardPocketDepth + backStopThickness / 2;
const extensionCenterY = backStopCenterY + backStopThickness / 2 + effectiveMountExtensionDepth / 2;
const slotCenterZ = floorThickness + bottomComponentClearance + boardSlotThickness / 2;
const slotTopZ = slotCenterZ + boardSlotThickness / 2;
const effectiveRailHeight = Math.max(railHeight, slotTopZ + topCaptureLip);
const leftRailX = -slotClearanceWidth / 2 - railThickness / 2;
const rightRailX = slotClearanceWidth / 2 + railThickness / 2;

const floor = box(outerWidth, carrierDepth, floorThickness)
  .translate(0, 0, 0);

const railBodyDepth = boardPocketDepth + backStopThickness;
const railBodyCenterY = -carrierDepth / 2 + frontOverhang + railBodyDepth / 2;
const leftRailBlank = box(railThickness, railBodyDepth, effectiveRailHeight)
  .translate(leftRailX, railBodyCenterY, 0);
const rightRailBlank = box(railThickness, railBodyDepth, effectiveRailHeight)
  .translate(rightRailX, railBodyCenterY, 0);

const leftRailSlot = box(railSlotDepth + 0.02, boardPocketDepth + 0.6, boardSlotThickness)
  .translate(-slotClearanceWidth / 2 - railSlotDepth / 2, boardCenterY, slotCenterZ);
const rightRailSlot = box(railSlotDepth + 0.02, boardPocketDepth + 0.6, boardSlotThickness)
  .translate(slotClearanceWidth / 2 + railSlotDepth / 2, boardCenterY, slotCenterZ);

const leftRail = difference(leftRailBlank, leftRailSlot);
const rightRail = difference(rightRailBlank, rightRailSlot);

const backStop = box(outerWidth, backStopThickness, effectiveRailHeight)
  .translate(0, backStopCenterY, 0);
const mountExtension = effectiveMountExtensionDepth > 0
  ? box(outerWidth, effectiveMountExtensionDepth, effectiveRailHeight)
      .translate(0, extensionCenterY, 0)
  : null;

const mountHoleCenterY = effectiveMountExtensionDepth > 0
  ? extensionCenterY
  : backStopCenterY;
const mountHole = (x) =>
  cylinder(effectiveRailHeight + 1, mountHoleDiameter / 2, mountHoleDiameter / 2, 24)
    .translate(x, mountHoleCenterY, -0.5);
const mountCounterbore = (x) =>
  cylinder(mountScrewHeadDepth + 0.02, mountScrewHeadDiameter / 2, mountScrewHeadDiameter / 2, 32)
    .translate(x, mountHoleCenterY, effectiveRailHeight - mountScrewHeadDepth);

const usbCutoutBlank = box(usbCutoutWidth, usbCutoutDepth, usbCutoutHeight + 0.02)
  .translate(
    usbCutoutCenterX,
    -carrierDepth / 2 - 0.01,
    floorThickness + bottomComponentClearance + boardThickness / 2
  );

const body = union(
  floor,
  leftRail,
  rightRail,
  backStop,
  ...(mountExtension ? [mountExtension] : [])
);

const bodyWithEdges = outerEdgeFillet > 0
  ? fillet(
      body,
      Math.min(outerEdgeFillet, railThickness / 2 - 0.1, effectiveRailHeight / 2 - 0.1),
      { parallel: [0, 0, 1], convex: true }
    )
  : body;

const carrierCutters = hasMountExtension
  ? [
      mountHole(-mountHoleSpacingX / 2),
      mountHole(mountHoleSpacingX / 2),
      mountCounterbore(-mountHoleSpacingX / 2),
      mountCounterbore(mountHoleSpacingX / 2),
      usbCutoutBlank,
    ]
  : [usbCutoutBlank];

const finishedCarrier = difference(
  bodyWithEdges,
  ...carrierCutters
).color("#6b6f74");

return {
  "PureThermal 3 Slot Retainer": finishedCarrier,
};
