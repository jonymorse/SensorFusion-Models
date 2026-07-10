const plateWidth = Param.number("Plate Width", 60, { min: 35, max: 90, unit: "mm" });
const plateHeight = Param.number("Plate Height", 75, { min: 50, max: 120, unit: "mm" });
const plateThickness = Param.number("Plate Thickness", 5, { min: 2, max: 16, unit: "mm" });
const holeDiameter = Param.number("D435i Hole Diameter", 3.2, { min: 2, max: 5, unit: "mm" });
const holeSpacing = Param.number("D435i Hole Spacing", 45, { min: 20, max: 70, unit: "mm" });
const d435iHoleCenterZ = Param.number("D435i Hole Center Z", 8, { min: -35, max: 30, unit: "mm" });
const retainerSlotWidth = Param.number("Retainer Slot Width", 21.9, { min: 10, max: 45, unit: "mm" });
const retainerHeight = Param.number("Retainer Height", 31, { min: 12, max: 55, unit: "mm" });
const retainerRailThickness = Param.number("Retainer Rail Thickness", 4, { min: 1, max: 5, unit: "mm" });
const retainerDepth = Param.number("Retainer Depth", 8, { min: 2, max: 12, unit: "mm" });
const pcbSlotThickness = Param.number("PCB Slot Thickness", 1.8, { min: 0.8, max: 4, unit: "mm" });
const pcbSlotRailEngagement = Param.number("PCB Slot Rail Engagement", 2, { min: 0.2, max: 4, unit: "mm" });
const pcbSlotHeight = Param.number("PCB Slot Height", 29.1, { min: 2, max: 60, unit: "mm" });
const secondRetainerSlotWidth = Param.number("Second Retainer Slot Width", 50, { min: 20, max: 80, unit: "mm" });
const secondRetainerHeight = Param.number("Second Retainer Height", 54, { min: 20, max: 80, unit: "mm" });
const secondRetainerRailThickness = Param.number("Second Retainer Rail Thickness", 2, { min: 1, max: 5, unit: "mm" });
const secondRetainerDepth = Param.number("Second Retainer Depth", 6, { min: 2, max: 12, unit: "mm" });
const secondPcbSlotThickness = Param.number("Second PCB Slot Thickness", 2, { min: 0.8, max: 4, unit: "mm" });
const secondPcbSlotRailEngagement = Param.number("Second PCB Slot Rail Engagement", 0.5, { min: 0.2, max: 4, unit: "mm" });
const secondPcbSlotHeight = Param.number("Second PCB Slot Height", 52.9, { min: 2, max: 80, unit: "mm" });

const plate = box(plateWidth, plateThickness, plateHeight)
  .translate(0, 0, -plateHeight / 2)
  .color("#7a7970");

const leftHoleX = -holeSpacing / 2;
const rightHoleX = holeSpacing / 2;
const holeZ = d435iHoleCenterZ;

const throughHole = (x) =>
  cylinder(plateThickness + 2, holeDiameter / 2, undefined, 48)
    .pointAlong([0, 1, 0])
    .translate(x, -plateThickness / 2 - 1, holeZ);

const retainerBottomZ = -plateHeight / 2;

const basePlate = plate.subtract(
  throughHole(leftHoleX),
  throughHole(rightHoleX),
);

// D435i reference envelope (90 x 25 x 25 mm), centered on the D435i mounting
// hole line and seated against the front side of the plate. This mock is only
// for placement/layout checks and is not fused into the printable plate.
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
    holeZ - d435ReferenceHeight / 2
  )
  .color("#3b82b8");
mock(d435ReferenceBody, "Intel RealSense D435i Reference");

const retainerCenterX = 0;
const retainerBackY = -plateThickness / 2 - retainerDepth / 2;
const retainerTopZ = retainerBottomZ + retainerHeight;
const retainerPivotZ = retainerBottomZ + retainerHeight / 2;
const railHeight = retainerHeight;
const railSpacing = retainerSlotWidth + retainerRailThickness;
const leftRailCenterX = retainerCenterX - railSpacing / 2;
const rightRailCenterX = retainerCenterX + railSpacing / 2;
const effectivePcbSlotThickness = Math.min(pcbSlotThickness, retainerDepth - 0.4);
const effectivePcbSlotRailEngagement = Math.min(pcbSlotRailEngagement, retainerRailThickness - 0.2);
const effectivePcbSlotHeight = Math.min(pcbSlotHeight, retainerHeight);
const pcbSlotCutWidth = retainerSlotWidth + effectivePcbSlotRailEngagement * 2;

const pcbSlotCut = box(pcbSlotCutWidth, effectivePcbSlotThickness, effectivePcbSlotHeight + 0.2)
  .translate(retainerCenterX, retainerBackY, retainerBottomZ - 0.1);

const leftRetainerRailBlank = box(retainerRailThickness, retainerDepth, railHeight)
  .translate(leftRailCenterX, retainerBackY, retainerBottomZ);

const rightRetainerRailBlank = box(retainerRailThickness, retainerDepth, railHeight)
  .translate(rightRailCenterX, retainerBackY, retainerBottomZ);

const rotateRetainerOnY = (shape) =>
  shape
    .translate(-retainerCenterX, -retainerBackY, -retainerPivotZ)
    .rotateY(90)
    .translate(retainerCenterX, retainerBackY, retainerPivotZ);

const leftRetainerRail = rotateRetainerOnY(leftRetainerRailBlank
  .subtract(pcbSlotCut)
  .color("#65645d"));

const rightRetainerRail = rotateRetainerOnY(rightRetainerRailBlank
  .subtract(pcbSlotCut)
  .color("#65645d"));

const retainerTopStopBlank = box(
  retainerSlotWidth + retainerRailThickness * 2,
  retainerDepth,
  retainerRailThickness,
)
  .translate(retainerCenterX, retainerBackY, retainerTopZ - retainerRailThickness);

const retainerTopStop = rotateRetainerOnY(retainerTopStopBlank
  .subtract(pcbSlotCut)
  .color("#65645d"));

const secondRetainerFrontY = plateThickness / 2 + secondRetainerDepth / 2;
const secondRetainerTopZ = retainerBottomZ + secondRetainerHeight;
const secondRetainerPivotZ = retainerBottomZ + secondRetainerHeight / 2;
const secondRailSpacing = secondRetainerSlotWidth + secondRetainerRailThickness;
const secondLeftRailCenterX = retainerCenterX - secondRailSpacing / 2;
const secondRightRailCenterX = retainerCenterX + secondRailSpacing / 2;
const effectiveSecondPcbSlotThickness = Math.min(secondPcbSlotThickness, secondRetainerDepth - 0.4);
const effectiveSecondPcbSlotRailEngagement = Math.min(secondPcbSlotRailEngagement, secondRetainerRailThickness - 0.2);
const effectiveSecondPcbSlotHeight = Math.min(secondPcbSlotHeight, secondRetainerHeight);
const secondPcbSlotCutWidth = secondRetainerSlotWidth + effectiveSecondPcbSlotRailEngagement * 2;

const secondPcbSlotCut = box(secondPcbSlotCutWidth, effectiveSecondPcbSlotThickness, effectiveSecondPcbSlotHeight + 0.2)
  .translate(retainerCenterX, secondRetainerFrontY, retainerBottomZ - 0.1);

const secondLeftRetainerRailBlank = box(secondRetainerRailThickness, secondRetainerDepth, secondRetainerHeight)
  .translate(secondLeftRailCenterX, secondRetainerFrontY, retainerBottomZ);

const secondRightRetainerRailBlank = box(secondRetainerRailThickness, secondRetainerDepth, secondRetainerHeight)
  .translate(secondRightRailCenterX, secondRetainerFrontY, retainerBottomZ);

const rotateSecondRetainerOnY = (shape) =>
  shape
    .translate(-retainerCenterX, -secondRetainerFrontY, -secondRetainerPivotZ)
    .rotateY(90)
    .translate(retainerCenterX, secondRetainerFrontY, secondRetainerPivotZ);

const secondLeftRetainerRail = rotateSecondRetainerOnY(secondLeftRetainerRailBlank
  .subtract(secondPcbSlotCut)
  .color("#65645d"));

const secondRightRetainerRail = rotateSecondRetainerOnY(secondRightRetainerRailBlank
  .subtract(secondPcbSlotCut)
  .color("#65645d"));

const finishedPlate = union(
  basePlate,
  leftRetainerRail,
  rightRetainerRail,
  retainerTopStop,
  secondLeftRetainerRail,
  secondRightRetainerRail,
);

return {
  "realsense mount plate with purethermal retainer": finishedPlate,
};
