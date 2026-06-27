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

const baseCornerRadius = Math.min(10, standBaseWidth / 5, standBaseDepth / 5);
const jointOverlap = 0.4;

const importedProngs = require("./gopro_prongs.forge.js", {
  "Prong Set": "female",
  "Finger Thickness": 3.0,
  "Mating Gap": 3.5,
  "Pivot Hole Diameter": 5.3,
  "Finger Height": 17,
  "Base Width": 20,
  "Base Thickness": 4,
  "Female Nut Capture": "hex",
  "M5 Nut Pocket Across Flats": 8.3,
  "M5 Nut Pocket Depth": 5.0,
});

const femaleProng = importedProngs.child("Female 3-Prong Interface");
const base = roundedRect(standBaseWidth, standBaseDepth, baseCornerRadius)
  .extrude(standBaseThickness);
const post = box(postWidth, postDepth, standHeight)
  .translate(0, 0, standBaseThickness);
const mountedProng = femaleProng.placeReference("bottom", [
  0,
  0,
  standBaseThickness + standHeight - jointOverlap,
]);

const cameraStand = union(base, post, mountedProng).color("#527a67");

return group({
  name: "Camera Stand with Female GoPro Mount",
  shape: cameraStand,
});
