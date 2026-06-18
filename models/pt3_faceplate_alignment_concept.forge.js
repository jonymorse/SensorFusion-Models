// PT3 front faceplate alignment concept.
// Goal: place an aperture relative to the real PT3 sensor opening.

const boardWidth = Param.number("Board Width", 25.8, { min: 20, max: 40, unit: "mm" });
const boardDepth = Param.number("Board Depth", 28.9, { min: 20, max: 45, unit: "mm" });
const faceplateMargin = Param.number("Faceplate Margin", 4, { min: 1, max: 12, unit: "mm" });
const faceplateThickness = Param.number("Faceplate Thickness", 3, { min: 1.5, max: 8, unit: "mm" });
const cornerFillet = Param.number("Corner Fillet", 3, { min: 0, max: 8, unit: "mm" });

const apertureWidth = Param.number("Aperture Width", 9, { min: 3, max: 20, unit: "mm" });
const apertureHeight = Param.number("Aperture Height", 7, { min: 3, max: 20, unit: "mm" });
const apertureCornerRadius = Param.number("Aperture Corner Radius", 2.5, { min: 0, max: 8, unit: "mm" });
const apertureOffsetX = Param.number("Aperture Offset X", 0.14, { min: -20, max: 20, unit: "mm" });
const apertureOffsetY = Param.number("Aperture Offset Y", 6.82, { min: -20, max: 20, unit: "mm" });

const holeSpacingX = Param.number("Hole Spacing X", 20.7, { min: 10, max: 35, unit: "mm" });
const holeSpacingY = Param.number("Hole Spacing Y", 23.9, { min: 10, max: 40, unit: "mm" });
const pegDiameter = Param.number("Peg Diameter", 1.8, { min: 0.8, max: 3, unit: "mm" });
const pegHeight = Param.number("Peg Height", 2.2, { min: 0, max: 8, unit: "mm" });

const boardOffsetZ = Param.number("Board Offset Z", 2, { min: -5, max: 20, unit: "mm" });
const showBoard = Param.choice("Show Board", "yes", ["yes", "no"]);

const plateWidth = boardWidth + faceplateMargin * 2;
const plateDepth = boardDepth + faceplateMargin * 2;

const plateBlank = box(plateWidth, plateDepth, faceplateThickness);
const plate = cornerFillet > 0
  ? fillet(plateBlank, cornerFillet, { parallel: [0, 0, 1], convex: true })
  : plateBlank;

const apertureBlank = box(apertureWidth, apertureHeight, faceplateThickness + 1)
  .translate(apertureOffsetX, apertureOffsetY, -0.5);
const aperture = apertureCornerRadius > 0
  ? fillet(
      apertureBlank,
      Math.min(apertureCornerRadius, apertureWidth / 2 - 0.1, apertureHeight / 2 - 0.1),
      { parallel: [0, 0, 1], convex: true }
    )
  : apertureBlank;

const faceplate = difference(plate, aperture).color("#6b6f74");

const hx = holeSpacingX / 2;
const hy = holeSpacingY / 2;
const pegRadius = pegDiameter / 2;

const makePeg = (x, y) =>
  cylinder(pegHeight, pegRadius, pegRadius, 20)
    .translate(x, y, faceplateThickness);

const pegs = pegHeight > 0
  ? [
      makePeg(-hx, -hy),
      makePeg(hx, -hy),
      makePeg(-hx, hy),
      makePeg(hx, hy),
    ]
  : [];

const faceplateWithPegs = union(faceplate, ...pegs).color("#6b6f74");

const pt3Raw = Import.step("./PT3.step");
const pt3Bounds = pt3Raw.boundingBox();
const pt3CenterX = (pt3Bounds.min[0] + pt3Bounds.max[0]) / 2;
const pt3CenterY = (pt3Bounds.min[1] + pt3Bounds.max[1]) / 2;
const pt3BottomZ = pt3Bounds.min[2];

const pt3 = pt3Raw
  .translate(-pt3CenterX, -pt3CenterY, faceplateThickness + boardOffsetZ - pt3BottomZ)
  .color("#2d7f6f");

return showBoard === "yes"
  ? {
      "pt3 faceplate": faceplateWithPegs,
      "pt3 board reference": pt3,
    }
  : {
      "pt3 faceplate": faceplateWithPegs,
    };
