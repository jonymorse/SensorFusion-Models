// Simple L bracket concept with rounded plate corners and an inside root radius.

const width = Param.number("Width", 40, {
  min: 10,
  max: 150,
  step: 1,
  unit: "mm",
});
const baseLength = Param.number("Base Length", 40, {
  min: 10,
  max: 150,
  step: 1,
  unit: "mm",
});
const armHeight = Param.number("Arm Height", 40, {
  min: 10,
  max: 150,
  step: 1,
  unit: "mm",
});
const thickness = Param.number("Thickness", 4, {
  min: 2,
  max: 12,
  step: 0.5,
  unit: "mm",
});
const plateCornerRadius = Param.number("Plate Corner Radius", 4, {
  min: 0,
  max: 20,
  step: 0.5,
  unit: "mm",
});
const insideFilletRadius = Param.number("Inside Fillet Radius", 6, {
  min: 0,
  max: 30,
  step: 0.5,
  unit: "mm",
});
const exteriorBendSoftening = Param.number("Exterior Bend Softening", 0.4, {
  min: 0,
  max: 2,
  step: 0.1,
  unit: "mm",
});

const arcSegments = 48;
const cornerRadius = Math.min(
  plateCornerRadius,
  Math.max(0, width / 2 - 0.2),
  Math.max(0, baseLength / 2 - 0.2),
  Math.max(0, armHeight / 2 - 0.2)
);
const rootRadius = Math.min(
  insideFilletRadius,
  Math.max(0, baseLength - thickness - cornerRadius - 0.2),
  Math.max(0, armHeight - thickness - cornerRadius - 0.2)
);
const exteriorSoftening = Math.min(
  exteriorBendSoftening,
  Math.max(0, thickness / 3)
);

function arcPoints(centerX, centerY, radius, startAngle, endAngle) {
  if (radius <= 0) {
    return [];
  }

  return Array.from({ length: arcSegments + 1 }, (_, index) => {
    const angle = startAngle + (index / arcSegments) * (endAngle - startAngle);
    return [
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    ];
  });
}

function roundedRectPoints(xMin, xMax, yMin, yMax, radius, roundBottom = true) {
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

  return [
    ...bottomRight,
    ...arcPoints(xMax - r, yMax - r, r, 0, Math.PI / 2),
    ...arcPoints(xMin + r, yMax - r, r, Math.PI / 2, Math.PI),
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

const basePlate = polygon(
  roundedRectPoints(-width / 2, width / 2, 0, baseLength, cornerRadius, true)
).extrude(thickness);

const armPlate = xzProfileToSolid(
  roundedRectPoints(-width / 2, width / 2, 0, armHeight, cornerRadius, false),
  thickness
);

const rootProfile = [
  [thickness, thickness],
  [thickness, thickness + rootRadius],
  ...arcPoints(
    thickness + rootRadius,
    thickness + rootRadius,
    rootRadius,
    Math.PI,
    Math.PI * 1.5
  ),
  [thickness + rootRadius, thickness],
];
const rootReinforcement = rootRadius > 0
  ? yzProfileToSolid(rootProfile, width)
  : null;

const bracketRaw = rootReinforcement
  ? union(basePlate, armPlate, rootReinforcement)
  : union(basePlate, armPlate);
const exteriorBendChamferCut = yzProfileToSolid(
  [
    [0, 0],
    [exteriorSoftening + 0.2, 0],
    [0, exteriorSoftening + 0.2],
  ],
  width + 2
);
const bracket = exteriorSoftening > 0
  ? difference(bracketRaw, exteriorBendChamferCut)
  : bracketRaw;

return group({ name: "Simple L Bracket - Rounded Plate Corners", shape: bracket.color("#7a7a7a") });
