// Heat-set insert fit coupon for the insert set used by the sensor-fusion mount.
// Pockets use the smaller entry diameter and are 0.2 mm deeper than each insert.

const couponThickness = Param.number("Coupon Thickness", 10, {
  min: 9,
  max: 15,
  step: 0.5,
  unit: "mm",
});
const couponWidth = 104;
const couponDepth = 28;
const couponCornerRadius = 4;

const insertSpecs = [
  { label: "M2", x: -42.5, diameter: 2.7, depth: 2.2 },
  { label: "M2.5", x: -25.5, diameter: 3.1, depth: 2.7 },
  { label: "M3 Short", x: -8.5, diameter: 3.8, depth: 3.2 },
  { label: "M3 Long", x: 8.5, diameter: 3.8, depth: 5.2 },
  { label: "M4", x: 25.5, diameter: 5.0, depth: 6.2 },
  { label: "M5", x: 42.5, diameter: 6.2, depth: 8.2 },
];

const couponBody = roundedRect(couponWidth, couponDepth, couponCornerRadius)
  .extrude(couponThickness);

function insertPocket(spec) {
  const depth = Math.min(spec.depth, couponThickness - 0.8);
  return cylinder(depth + 0.02, spec.diameter / 2, spec.diameter / 2, 32)
    .translate(spec.x, 0, couponThickness - depth);
}

const coupon = difference(
  couponBody,
  ...insertSpecs.map(insertPocket)
).color("#d28a3a");

for (const spec of insertSpecs) {
  Viewport.highlight([spec.x, 0, couponThickness], {
    label: `${spec.label}: Ø${spec.diameter.toFixed(1)} x ${spec.depth.toFixed(1)} mm`,
    color: "#ffe08a",
  });
}

verify.boundingBoxSize(
  "coupon dimensions",
  coupon,
  [couponWidth, couponDepth, couponThickness],
  0.05
);

return group({ name: "Heat-Set Insert Fit Coupon", shape: coupon });
