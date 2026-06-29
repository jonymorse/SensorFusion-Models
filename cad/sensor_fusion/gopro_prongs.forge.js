// Parametric GoPro-compatible finger interfaces.
// De facto dimensions based on measured mounts; not an official GoPro drawing.

const prongSet = Param.choice("Prong Set", "both", ["both", "male", "female"]);
const fingerThickness = Param.number("Finger Thickness", 3.0, {
  min: 2.8,
  max: 3.2,
  step: 0.1,
  unit: "mm",
});
const matingGap = Param.number("Mating Gap", 3.5, {
  min: 3.2,
  max: 3.8,
  step: 0.1,
  unit: "mm",
});
const pivotHoleDiameter = Param.number("Pivot Hole Diameter", 5.3, {
  min: 5.0,
  max: 5.6,
  step: 0.1,
  unit: "mm",
});
const fingerHeight = Param.number("Finger Height", 17, {
  min: 15,
  max: 22,
  step: 0.5,
  unit: "mm",
});
const baseWidth = Param.number("Base Width", 20, {
  min: 15,
  max: 30,
  step: 0.5,
  unit: "mm",
});
const baseThickness = Param.number("Base Thickness", 4, {
  min: 3,
  max: 8,
  step: 0.5,
  unit: "mm",
});
const femaleNutCapture = Param.choice("Female Nut Capture", "hex", ["hex", "none"]);
const nutPocketAcrossFlats = Param.number("M5 Nut Pocket Across Flats", 8.3, {
  min: 8.0,
  max: 8.8,
  step: 0.1,
  unit: "mm",
});
const nutPocketDepth = Param.number("M5 Nut Pocket Depth", 5.0, {
  min: 4.2,
  max: 5.4,
  step: 0.1,
  unit: "mm",
});

const fingerEndDiameter = 15;
const fingerEndRadius = fingerEndDiameter / 2;
const rootReinforcementHeight = 2;
const displaySpacing = 38;
const nutSeatThickness = 1.5;

function hexPrism(depth, acrossFlats) {
  const radius = acrossFlats / Math.sqrt(3);
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + index * Math.PI / 3;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
    ];
  });

  return polygon(points).extrude(depth);
}

function buildProngs(fingerCount, color, addNutCapture = false) {
  const stackDepth = fingerCount * fingerThickness + (fingerCount - 1) * matingGap;
  const pivotZ = baseThickness + fingerHeight - fingerEndRadius;
  const base = box(stackDepth, baseWidth, baseThickness);
  const fingers = [];
  const roots = [];

  for (let index = 0; index < fingerCount; index += 1) {
    const x = -stackDepth / 2
      + fingerThickness / 2
      + index * (fingerThickness + matingGap);
    const stem = box(fingerThickness, fingerEndDiameter, pivotZ)
      .translate(x, 0, 0);
    const roundedEnd = cylinder(fingerThickness, fingerEndRadius)
      .rotateY(90)
      .translate(x - fingerThickness / 2, 0, pivotZ);
    const reinforcedRoot = box(
      fingerThickness,
      Math.max(fingerEndDiameter, baseWidth - 1),
      rootReinforcementHeight
    ).translate(x, 0, baseThickness);

    fingers.push(union(stem, roundedEnd));
    roots.push(reinforcedRoot);
  }

  const pivotHole = cylinder(stackDepth + 2, pivotHoleDiameter / 2)
    .rotateY(90)
    .translate(-stackDepth / 2 - 1, 0, pivotZ);

  let shape = difference(
    union(base, [...fingers, ...roots]),
    pivotHole
  );

  if (addNutCapture) {
    const supportOverlap = 0.3;
    const supportLength = supportOverlap + nutSeatThickness + nutPocketDepth;
    const supportStartX = stackDepth / 2 - supportOverlap;
    const supportCenterX = supportStartX + supportLength / 2;
    const supportExtension = union(
      box(supportLength, baseWidth, baseThickness)
        .translate(supportCenterX, 0, 0),
      box(supportLength, fingerEndDiameter, pivotZ)
        .translate(supportCenterX, 0, 0),
      cylinder(supportLength, fingerEndRadius)
        .rotateY(90)
        .translate(supportStartX, 0, pivotZ),
      box(
        supportLength,
        Math.max(fingerEndDiameter, baseWidth - 1),
        rootReinforcementHeight
      ).translate(supportCenterX, 0, baseThickness)
    );
    const nutPocket = hexPrism(
      nutPocketDepth + 0.6,
      nutPocketAcrossFlats
    )
      .rotateY(90)
      .translate(stackDepth / 2 + nutSeatThickness, 0, pivotZ);
    const nutPassage = cylinder(
      supportOverlap + nutSeatThickness + 0.4,
      pivotHoleDiameter / 2
    )
      .rotateY(90)
      .translate(stackDepth / 2 - supportOverlap - 0.1, 0, pivotZ);

    shape = difference(
      union(shape, supportExtension),
      nutPocket,
      nutPassage
    );
  }

  return shape.color(color);
}

const maleProngs = buildProngs(2, "#d97745");
const femaleProngs = buildProngs(3, "#477b9e", femaleNutCapture === "hex");

const parts = [];

if (prongSet === "both" || prongSet === "male") {
  parts.push({
    name: "Male 2-Prong Interface",
    shape: prongSet === "both"
      ? maleProngs.translate(0, -displaySpacing / 2, 0)
      : maleProngs,
  });
}

if (prongSet === "both" || prongSet === "female") {
  parts.push({
    name: "Female 3-Prong Interface",
    shape: prongSet === "both"
      ? femaleProngs.translate(0, displaySpacing / 2, 0)
      : femaleProngs,
  });
}

return group(...parts);
