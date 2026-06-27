// Simple desktop camera stand using the female interface from gopro_prongs.forge.js.

const standHeight = Param.number("Stand Height", 120, {
  min: 70,
  max: 200,
  step: 5,
  unit: "mm",
});
const standBaseWidth = Param.number("Stand Base Width", 110, {
  min: 70,
  max: 180,
  step: 5,
  unit: "mm",
});
const standBaseDepth = Param.number("Stand Base Depth", 80, {
  min: 50,
  max: 140,
  step: 5,
  unit: "mm",
});
const standBaseThickness = Param.number("Stand Base Thickness", 8, {
  min: 5,
  max: 15,
  step: 1,
  unit: "mm",
});
const postWidth = Param.number("Post Width", 26, {
  min: 22.5,
  max: 40,
  step: 0.5,
  unit: "mm",
});
const postDepth = Param.number("Post Depth", 24, {
  min: 20,
  max: 40,
  step: 0.5,
  unit: "mm",
});
const bracketProjection = Param.number("Bracket Projection", 35, {
  min: 15,
  max: 70,
  step: 5,
  unit: "mm",
});

const baseCornerRadius = Math.min(10, standBaseWidth / 5, standBaseDepth / 5);
const jointOverlap = 0.4;
const prongBaseThickness = 4;
const prongBaseWidth = 20;
const bracketWidth = postWidth;
const bracketThickness = 4;
const bracketProngSideOverhang = Param.number("Bracket Prong-Side Overhang", 3, {
  min: 0,
  max: 12,
  step: 1,
  unit: "mm",
});
// The hex-nut capture extends only on one side of the female interface.
// Shift the imported prong so the complete nut-side face is centered.
const femaleNutSupportLength = 0.3 + 1.5 + 5.0;
const femaleProngCenterOffsetX = -femaleNutSupportLength / 2;
const bracketScrewSpacingX = Param.number("Bracket Screw Spacing X", 16, {
  min: 10,
  max: Math.max(10, postWidth - 4),
  step: 1,
  unit: "mm",
});
const bracketScrewClearanceDiameter = Param.number("Bracket Screw Clearance Diameter", 3.4, {
  min: 3,
  max: 4,
  step: 0.1,
  unit: "mm",
});
const standInsertPilotDiameter = Param.number("Stand M3 Insert Pilot Diameter", 3.8, {
  min: 3.5,
  max: 4.2,
  step: 0.1,
  unit: "mm",
});
const standInsertPocketDepth = Param.number("Stand M3 Insert Pocket Depth", 5, {
  min: 3,
  max: 8,
  step: 0.1,
  unit: "mm",
});

const importedProngs = require("./gopro_prongs.forge.js", {
  "Prong Set": "female",
  "Finger Thickness": 3.0,
  "Mating Gap": 3.5,
  "Pivot Hole Diameter": 5.3,
  "Finger Height": 17,
  "Base Width": prongBaseWidth,
  "Base Thickness": prongBaseThickness,
  "Female Nut Capture": "hex",
  "M5 Nut Pocket Across Flats": 8.3,
  "M5 Nut Pocket Depth": 5.0,
});

const femaleProng = importedProngs.child("Female 3-Prong Interface");
const base = roundedRect(standBaseWidth, standBaseDepth, baseCornerRadius)
  .extrude(standBaseThickness);
const post = box(postWidth, postDepth, standHeight)
  .translate(0, 0, standBaseThickness);
const postTopZ = standBaseThickness + standHeight;
const supportPlateInnerY = postDepth / 2;
const supportPlateOuterY = -postDepth / 2 - bracketProngSideOverhang;
const supportPlateDepth = supportPlateInnerY - supportPlateOuterY;
const supportPlateCenterY = (supportPlateInnerY + supportPlateOuterY) / 2;
const prongPlateCenterY = supportPlateOuterY - bracketThickness / 2;
const prongMountY = prongPlateCenterY - bracketThickness / 2 + jointOverlap;
const supportPlate = box(
  bracketWidth,
  supportPlateDepth,
  bracketThickness
).translate(
  0,
  supportPlateCenterY,
  postTopZ
);
const prongPlate = box(
  bracketWidth,
  bracketThickness,
  bracketProjection
).translate(
  0,
  prongPlateCenterY,
  postTopZ
);
const mountedProng = femaleProng
  .rotateX(90)
  .translate(
    femaleProngCenterOffsetX,
    prongMountY,
    postTopZ + bracketProjection / 2
  );
const unflippedBracketAssembly = union(
  supportPlate,
  prongPlate,
  mountedProng
);
const bracketAssemblyPivotZ = postTopZ + bracketThickness / 2;
const bracketAssembly = unflippedBracketAssembly
  .translate(0, 0, -bracketAssemblyPivotZ)
  .rotateY(180)
  .translate(0, 0, bracketAssemblyPivotZ);
const bracketScrewY = 0;
const bracketScrewXs = [
  -bracketScrewSpacingX / 2,
  bracketScrewSpacingX / 2,
];
const bracketScrewClearanceHoles = bracketScrewXs.map((x) =>
  cylinder(bracketThickness + 2, bracketScrewClearanceDiameter / 2)
    .translate(x, bracketScrewY, postTopZ - 1)
);
const standInsertPockets = bracketScrewXs.map((x) =>
  cylinder(standInsertPocketDepth + 0.2, standInsertPilotDiameter / 2)
    .translate(x, bracketScrewY, postTopZ - standInsertPocketDepth)
);

const standPart = difference(
  union(base, post),
  standInsertPockets
).color("#527a67");
const bracketPart = difference(
  bracketAssembly,
  bracketScrewClearanceHoles
).color("#477b9e");

return group(
  { name: "Camera Stand", shape: standPart },
  { name: "Removable GoPro Bracket", shape: bracketPart }
);
