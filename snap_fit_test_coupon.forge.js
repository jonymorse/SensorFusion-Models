// Small snap-fit coupon for testing the frame-to-back-plate latch.
// Matches the current thermal calibration target snap dimensions.

const snapFitGeometry = require("./scripts/snap_fit_geometry.js");

const frontThickness = 3.5;
const edgeChamfer = 0.4;
const couponGap = 18;
const couponColor = "#8c8c8c";
const frontPlateInset = 12;

const layoutMode = Param.choice(
  "Layout",
  "assembled",
  ["assembled", "separated"]
);

const snapSetup = Param.choice(
  "Snap Profile",
  "current",
  ["current", "candidate"]
);

const clearanceVariant = Param.choice(
  "Clearance Variant",
  "current",
  ["current", "loose", "tight"]
);

const couponPart = Param.choice(
  "Coupon Part",
  "both",
  [
    "both",
    "Frame Socket Coupon",
    "Back Plate Snap Coupon",
  ]
);

const {
  frameDepth,
  frameWall,
  backThickness,
  snapTabWidth: baseSnapTabWidth,
  snapTabThickness: baseSnapTabThickness,
  snapTabDepth: baseSnapTabDepth,
  snapBarbHeight: baseSnapBarbHeight,
  snapBarbProjection: baseSnapBarbProjection,
} = snapFitGeometry.resolveSnapProfile(snapSetup);

const baseSnapWindowClearance = snapFitGeometry.resolveSnapWindowClearance(
  snapSetup,
  clearanceVariant
);

const sliderSnapTabWidth = Param.number(
  "Snap Tab Width",
  baseSnapTabWidth,
  { min: 12, max: 24, step: 0.1, unit: "mm" }
);
const sliderSnapTabThickness = Param.number(
  "Snap Tab Thickness",
  baseSnapTabThickness,
  { min: 1.2, max: 4, step: 0.05, unit: "mm" }
);
const sliderSnapTabDepth = Param.number(
  "Snap Tab Depth",
  baseSnapTabDepth,
  { min: 4, max: 12, step: 0.1, unit: "mm" }
);
const sliderSnapBarbHeight = Param.number(
  "Snap Barb Height",
  baseSnapBarbHeight,
  { min: 0.6, max: 3, step: 0.05, unit: "mm" }
);
const sliderSnapBarbProjection = Param.number(
  "Snap Barb Projection",
  baseSnapBarbProjection,
  { min: 0.2, max: 2.5, step: 0.05, unit: "mm" }
);
const sliderSnapWindowClearance = Param.number(
  "Snap Window Clearance",
  baseSnapWindowClearance,
  { min: 0, max: 2, step: 0.05, unit: "mm" }
);

const snapTabWidth =
  snapSetup === "candidate"
    ? sliderSnapTabWidth
    : baseSnapTabWidth;
const snapTabThickness =
  snapSetup === "candidate"
    ? sliderSnapTabThickness
    : baseSnapTabThickness;
const snapTabDepth =
  snapSetup === "candidate"
    ? sliderSnapTabDepth
    : baseSnapTabDepth;
const snapBarbHeight =
  snapSetup === "candidate"
    ? sliderSnapBarbHeight
    : baseSnapBarbHeight;
const snapBarbProjection =
  snapSetup === "candidate"
    ? sliderSnapBarbProjection
    : baseSnapBarbProjection;
const snapWindowClearance =
  snapSetup === "candidate"
    ? sliderSnapWindowClearance
    : baseSnapWindowClearance;

const couponLength = 46;
const frameSocketWidth = frameWall;

const backPlateLength = 42;
const backPlateWidth = 30;
const backPlateZ = frontThickness + frameDepth;
const assembledLatchOffsetX = 0;

const neckZ = backPlateZ - snapTabDepth;
const hookTipZ = neckZ + snapBarbHeight * 0.55;
const hookTopZ = neckZ + snapBarbHeight;
const frameWindowZ = frontThickness + snapTabDepth - snapBarbHeight / 2;

const frameWallBlank = chamfer(
  box(frameSocketWidth, couponLength, frameDepth),
  edgeChamfer,
  { convex: true, minLength: 20, atZ: frameDepth }
).translate(-frameSocketWidth / 2, 0, frontThickness);

const frontPlateStrip = chamfer(
  box(frameWall + frontPlateInset, couponLength, frontThickness),
  edgeChamfer,
  { convex: true, minLength: 20, atZ: 0 }
).translate(
  (frontPlateInset - frameWall) / 2,
  0,
  0
);

const frameSnapWindow = box(
  frameSocketWidth + 2,
  snapTabWidth + snapWindowClearance,
  snapBarbHeight + snapWindowClearance
).translate(
  -frameSocketWidth / 2,
  0,
  frameWindowZ
);

const frameSocket = difference(
  union(frontPlateStrip, frameWallBlank),
  frameSnapWindow
).color(couponColor);

function snapHook(y) {
  const rootX = 0;
  const insideX = snapTabThickness;
  const hookX = -snapBarbProjection;

  const topZ = backPlateZ;

  const points = [
    [rootX, topZ],
    [insideX, topZ],
    [insideX, neckZ],
    [rootX, neckZ],
    [hookX, hookTipZ],
    [rootX, hookTopZ],
  ];

  return filletCorners(
    points,
    [
      { index: 3, radius: 0.25, segments: 4 },
      { index: 4, radius: 0.35, segments: 6 },
      { index: 5, radius: 0.25, segments: 4 },
    ]
  )
    .extrude(snapTabWidth)
    .rotateX(90)
    .translate(0, y + snapTabWidth / 2, 0);
}

const latchPlate = chamfer(
  box(
    backPlateLength,
    backPlateWidth,
    backThickness
  ),
  edgeChamfer,
  {
    convex: true,
    minLength: 20,
    atZ: backThickness,
  }
).translate(
  backPlateLength / 2 - frameWall,
  0,
  backPlateZ
);

const latchPart = union(
  latchPlate,
  snapHook(0)
)
  .translate(
    layoutMode === "separated"
      ? couponGap
      : assembledLatchOffsetX,
    0,
    0
  )
  .color(couponColor);

const parts = [
  {
    name: "Frame Socket Coupon",
    shape: frameSocket,
  },
  {
    name: "Back Plate Snap Coupon",
    shape: latchPart,
  },
];

const selectedParts =
  couponPart === "both"
    ? parts
    : parts.filter(
        (part) => part.name === couponPart
      );

return group(...selectedParts);
