const plateWidth = Param.number("Plate Width", 60, { min: 35, max: 90, unit: "mm" });
const plateHeight = Param.number("Plate Height", 75, { min: 50, max: 120, unit: "mm" });
const standPegDiameter = Param.number("Stand Peg Diameter", 4, { min: 2, max: 8, unit: "mm" });
const standPegHoleClearance = Param.number("Stand Peg Hole Clearance", 0.2, { min: 0, max: 1, unit: "mm" });
const standPegLength = Param.number("Stand Peg Length", 8, { min: 2, max: 20, unit: "mm" });
const standPegSpacing = Param.number("Stand Peg Spacing", 40, { min: 10, max: 70, unit: "mm" });
const standFootWidth = Param.number("Stand Foot Width", 14, { min: 8, max: 30, unit: "mm" });
const standFootDepth = Param.number("Stand Foot Depth", 30, { min: 10, max: 60, unit: "mm" });
const standFootThickness = Param.number("Stand Foot Thickness", 6, { min: 3, max: 15, unit: "mm" });
const standRiserHeight = Param.number("Stand Riser Height", 34, { min: 0, max: 60, unit: "mm" });
const standRiserBaseDiameter = Param.number("Stand Riser Base Diameter", 12, { min: 4, max: 20, unit: "mm" });
const plateThickness = Param.number("Plate Thickness", 5, { min: 2, max: 16, unit: "mm" });
const holeDiameter = Param.number("Hole Diameter", 3.2, { min: 2, max: 5, unit: "mm" });
const holeTopInset = Param.number("Hole Top Inset", 7.5, { min: 4, max: 15, unit: "mm" });
const holeSpacing = Param.number("Hole Spacing", 45, { min: 20, max: 70, unit: "mm" });
const retainerSlotWidth = Param.number("Retainer Slot Width", 22.2, { min: 10, max: 45, unit: "mm" });
const retainerHeight = Param.number("Retainer Height", 31, { min: 12, max: 55, unit: "mm" });
const retainerRailThickness = Param.number("Retainer Rail Thickness", 4, { min: 1, max: 5, unit: "mm" });
const retainerDepth = Param.number("Retainer Depth", 8, { min: 2, max: 12, unit: "mm" });
const pcbSlotThickness = Param.number("PCB Slot Thickness", 2, { min: 0.8, max: 4, unit: "mm" });
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
const holeZ = plateHeight / 2 - holeTopInset;

const throughHole = (x) =>
  cylinder(plateThickness + 2, holeDiameter / 2, undefined, 48)
    .pointAlong([0, 1, 0])
    .translate(x, -plateThickness / 2 - 1, holeZ);

const retainerBottomZ = -plateHeight / 2;

const standPegLeftX = -standPegSpacing / 2;
const standPegRightX = standPegSpacing / 2;
const standPegHoleRadius = (standPegDiameter + standPegHoleClearance) / 2;
const standPegHoleDepth = standPegLength + 0.3;

const standPegHole = (x) =>
  cylinder(standPegHoleDepth + 0.5, standPegHoleRadius, undefined, 32)
    .pointAlong([0, 0, 1])
    .translate(x, 0, retainerBottomZ - 0.5);

const basePlate = plate.subtract(
  throughHole(leftHoleX),
  throughHole(rightHoleX),
  standPegHole(standPegLeftX),
  standPegHole(standPegRightX),
);

const retainerCenterX = 0;
const retainerBackY = -plateThickness / 2 - retainerDepth / 2;
const retainerTopZ = retainerBottomZ + retainerHeight;
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

const leftRetainerRail = leftRetainerRailBlank
  .subtract(pcbSlotCut)
  .color("#65645d");

const rightRetainerRail = rightRetainerRailBlank
  .subtract(pcbSlotCut)
  .color("#65645d");

const retainerTopStopBlank = box(
  retainerSlotWidth + retainerRailThickness * 2,
  retainerDepth,
  retainerRailThickness,
)
  .translate(retainerCenterX, retainerBackY, retainerTopZ - retainerRailThickness);

const retainerTopStop = retainerTopStopBlank
  .subtract(pcbSlotCut)
  .color("#65645d");

const secondRetainerFrontY = plateThickness / 2 + secondRetainerDepth / 2;
const secondRetainerTopZ = retainerBottomZ + secondRetainerHeight;
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

const secondLeftRetainerRail = secondLeftRetainerRailBlank
  .subtract(secondPcbSlotCut)
  .color("#65645d");

const secondRightRetainerRail = secondRightRetainerRailBlank
  .subtract(secondPcbSlotCut)
  .color("#65645d");

const secondRetainerTopStopBlank = box(
  secondRetainerSlotWidth + secondRetainerRailThickness * 2,
  secondRetainerDepth,
  secondRetainerRailThickness,
)
  .translate(retainerCenterX, secondRetainerFrontY, secondRetainerTopZ - secondRetainerRailThickness);

const secondRetainerTopStop = secondRetainerTopStopBlank
  .subtract(secondPcbSlotCut)
  .color("#65645d");

const standFootTopZ = retainerBottomZ - standRiserHeight;
const standFootBottomZ = standFootTopZ - standFootThickness;

const standInsertPeg = (x) =>
  cylinder(standPegLength, standPegDiameter / 2, undefined, 32)
    .pointAlong([0, 0, 1])
    .translate(x, 0, retainerBottomZ);

const standRiserPost = (x) =>
  cylinder(standRiserHeight, standRiserBaseDiameter / 2, standPegDiameter / 2, 32)
    .pointAlong([0, 0, 1])
    .translate(x, 0, standFootTopZ);

const standPeg = (x) => union(standInsertPeg(x), standRiserPost(x));

const standFoot = (x) =>
  box(standFootWidth, standFootDepth, standFootThickness)
    .translate(x, 0, standFootBottomZ)
    .color("#5a5950");

const stand = union(
  standFoot(standPegLeftX),
  standPeg(standPegLeftX),
  standFoot(standPegRightX),
  standPeg(standPegRightX),
);

const finishedPlate = union(
  basePlate,
  leftRetainerRail,
  rightRetainerRail,
  retainerTopStop,
  secondLeftRetainerRail,
  secondRightRetainerRail,
  secondRetainerTopStop,
);

return {
  "realsense mount plate with purethermal retainer": finishedPlate,
  "realsense mount stand": stand,
};
