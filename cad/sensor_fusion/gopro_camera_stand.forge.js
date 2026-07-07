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
const prongBaseThickness = 4;
const prongBaseWidth = 20;
const prongFingerHeight = 17;
const bracketWidth = postWidth;
const bracketThickness = 4;
const bracketProngSideOverhang = Param.number("Bracket Prong-Side Overhang", 0.5, {
  min: 0,
  max: 12,
  step: 0.5,
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
const bracketScrewHeadRecessDiameter = Param.number("Bracket Screw Head Recess Diameter", 6.4, {
  min: 5.5,
  max: 8,
  step: 0.1,
  unit: "mm",
});
const bracketScrewHeadRecessDepth = Param.number("Bracket Screw Head Recess Depth", 1.2, {
  min: 0.5,
  max: bracketThickness - 1,
  step: 0.1,
  unit: "mm",
});
const prongJointFilletRadius = Param.number("Prong Joint Fillet Radius", 0, {
  min: 0,
  max: 1.2,
  step: 0.1,
  unit: "mm",
});
const prongLengthExtension = Param.number("Prong Length Extension", 3, {
  min: 0,
  max: 10,
  step: 0.5,
  unit: "mm",
});
const bracketPlateCornerRadius = Param.number("Bracket Plate Corner Radius", 4, {
  min: 0,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const bracketInsideFilletRadius = Param.number("Bracket Inside Fillet Radius", 6, {
  min: 0,
  max: 20,
  step: 0.5,
  unit: "mm",
});
const bracketExteriorBendSoftening = Param.number("Bracket Exterior Bend Softening", 0.4, {
  min: 0,
  max: 2,
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
const exportPart = Param.choice("Export Part", "assembly", [
  "assembly",
  "camera stand",
  "removable gopro bracket",
]);

const importedProngs = require("./gopro_prongs.forge.js", {
  "Prong Set": "female",
  "Mount Style": "flush mount",
  "Finger Thickness": 3.0,
  "Mating Gap": 3.5,
  "Pivot Hole Diameter": 5.3,
  "Finger Height": prongFingerHeight + prongLengthExtension,
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
const prongJointY = prongPlateCenterY - bracketThickness / 2;
const prongMountY = prongJointY;
const bracketArcSegments = 48;
const bracketCornerRadius = Math.min(
  bracketPlateCornerRadius,
  Math.max(0, bracketWidth / 2 - 0.2),
  Math.max(0, supportPlateDepth / 2 - 0.2),
  Math.max(0, bracketProjection / 2 - 0.2)
);
const bracketRootRadius = Math.min(
  bracketInsideFilletRadius,
  Math.max(0, supportPlateDepth - bracketCornerRadius - 0.2),
  Math.max(0, bracketProjection - bracketThickness - bracketCornerRadius - 0.2)
);
const bracketExteriorSoftening = Math.min(
  bracketExteriorBendSoftening,
  Math.max(0, bracketThickness / 3)
);

function arcPoints(centerX, centerY, radius, startAngle, endAngle) {
  if (radius <= 0) {
    return [];
  }

  return Array.from({ length: bracketArcSegments + 1 }, (_, index) => {
    const angle = startAngle + (index / bracketArcSegments) * (endAngle - startAngle);
    return [
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    ];
  });
}

function roundedRectPoints(
  xMin,
  xMax,
  yMin,
  yMax,
  radius,
  roundBottom = true,
  roundTop = true
) {
  const r = Math.min(radius, (xMax - xMin) / 2, (yMax - yMin) / 2);

  if (r <= 0) {
    return [
      [xMin, yMin],
      [xMax, yMin],
      [xMax, yMax],
      [xMin, yMax],
    ];
  }

  const bottomRight = roundBottom
    ? arcPoints(xMax - r, yMin + r, r, -Math.PI / 2, 0)
    : [[xMax, yMin]];
  const bottomLeft = roundBottom
    ? arcPoints(xMin + r, yMin + r, r, Math.PI, Math.PI * 1.5)
    : [[xMin, yMin]];
  const topRight = roundTop
    ? arcPoints(xMax - r, yMax - r, r, 0, Math.PI / 2)
    : [[xMax, yMax]];
  const topLeft = roundTop
    ? arcPoints(xMin + r, yMax - r, r, Math.PI / 2, Math.PI)
    : [[xMin, yMax]];

  return [
    ...bottomRight,
    ...topRight,
    ...topLeft,
    ...bottomLeft,
  ];
}

function yzProfileToSolid(points, depth) {
  return polygon(points)
    .extrude(depth)
    .rotateX(90)
    .rotateZ(90)
    .translate(-depth / 2, 0, 0);
}

function xzProfileToSolid(points, depth) {
  return polygon(points)
    .extrude(depth)
    .rotateX(90)
    .translate(0, depth, 0);
}

const supportPlate = polygon(
  roundedRectPoints(
    -bracketWidth / 2,
    bracketWidth / 2,
    bracketThickness,
    bracketThickness + supportPlateDepth,
    bracketCornerRadius,
    false,
    true
  )
)
  .extrude(bracketThickness)
  .translate(0, prongJointY, postTopZ);
const prongPlate = xzProfileToSolid(
  roundedRectPoints(
    -bracketWidth / 2,
    bracketWidth / 2,
    0,
    bracketProjection,
    bracketCornerRadius,
    false
  ),
  bracketThickness
).translate(0, prongJointY, postTopZ);
const bracketRootProfile = [
  [bracketThickness, bracketThickness],
  [bracketThickness, bracketThickness + bracketRootRadius],
  ...arcPoints(
    bracketThickness + bracketRootRadius,
    bracketThickness + bracketRootRadius,
    bracketRootRadius,
    Math.PI,
    Math.PI * 1.5
  ),
  [bracketThickness + bracketRootRadius, bracketThickness],
];
const bracketRootReinforcement = bracketRootRadius > 0
  ? yzProfileToSolid(bracketRootProfile, bracketWidth)
      .translate(0, prongJointY, postTopZ)
  : null;
const bracketLShape = bracketRootReinforcement
  ? union(supportPlate, prongPlate, bracketRootReinforcement)
  : union(supportPlate, prongPlate);
const exteriorBendChamferCut = yzProfileToSolid(
  [
    [0, 0],
    [bracketExteriorSoftening + 0.2, 0],
    [0, bracketExteriorSoftening + 0.2],
  ],
  bracketWidth + 2
).translate(0, prongJointY, postTopZ);
const softenedBracketLShape = bracketExteriorSoftening > 0
  ? difference(bracketLShape, exteriorBendChamferCut)
  : bracketLShape;
const mountedProng = femaleProng
  .rotateX(90)
  .translate(
    femaleProngCenterOffsetX,
    prongMountY,
    postTopZ + bracketProjection / 2
  );
const unfilletedBracketAssembly = union(
  softenedBracketLShape,
  mountedProng
);
const unflippedBracketAssembly = prongJointFilletRadius > 0
  ? fillet(
      unfilletedBracketAssembly,
      prongJointFilletRadius,
      { concave: true, atY: prongJointY, parallel: [1, 0, 0], minLength: 10 }
    )
  : unfilletedBracketAssembly;
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
const bracketScrewHeadRecesses = bracketScrewXs.map((x) =>
  cylinder(bracketScrewHeadRecessDepth + 1, bracketScrewHeadRecessDiameter / 2)
    .translate(x, bracketScrewY, postTopZ + bracketThickness - bracketScrewHeadRecessDepth)
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
  bracketScrewClearanceHoles,
  bracketScrewHeadRecesses
).color("#477b9e");

if (exportPart === "camera stand") {
  return group({ name: "Camera Stand", shape: standPart });
}

if (exportPart === "removable gopro bracket") {
  return group({ name: "Removable GoPro Bracket", shape: bracketPart });
}

return group(
  { name: "Camera Stand", shape: standPart },
  { name: "Removable GoPro Bracket", shape: bracketPart }
);
