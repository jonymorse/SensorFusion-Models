const view = Param.choice("View", "top", ["top", "front", "right"]);

const pt3Raw = Import.step("./PT3.step");
const bounds = pt3Raw.boundingBox();
const centerX = (bounds.min[0] + bounds.max[0]) / 2;
const centerY = (bounds.min[1] + bounds.max[1]) / 2;
const bottomZ = bounds.min[2];

let pt3 = pt3Raw.translate(-centerX, -centerY, -bottomZ).color("#6db8ae");

if (view === "front") {
  pt3 = pt3.rotateX(90);
} else if (view === "right") {
  pt3 = pt3.rotateX(90).rotateZ(90);
}

return {
  "pt3 inspect": pt3,
};
