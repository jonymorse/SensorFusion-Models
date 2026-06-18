// Main mount body concept.
// Clean starting point for the combined D435i + PT3 chassis.

const bodyWidth = Param.number("Body Width", 90, { min: 60, max: 120, unit: "mm" });
const bodyHeight = Param.number("Body Height", 25, { min: 18, max: 60, unit: "mm" });
const bodyDepth = Param.number("Body Depth", 6, { min: 2, max: 20, unit: "mm" });
const spineWidth = Param.number("Spine Width", 50, { min: 6, max: 60, unit: "mm" });
const spineDepth = Param.number("Spine Depth", 6, { min: 2, max: 20, unit: "mm" });
const spineOffsetX = Param.number("Spine Offset X", 0, { min: -40, max: 40, unit: "mm" });
const spineBottomClearance = Param.number("Spine Bottom Clearance", 0, { min: -10, max: 20, unit: "mm" });

const d435HoleSpacing = Param.number("D435 Hole Spacing", 45, { min: 20, max: 70, unit: "mm" });
const d435HoleDiameter = Param.number("D435 Hole Diameter", 3.2, { min: 2, max: 5, unit: "mm" });
const d435HoleZ = Param.number("D435 Hole Z", 0, { min: -8, max: 8, unit: "mm" });
const pt3TrayOffsetX = Param.number("PT3 Tray Offset X", 0, { min: -60, max: 60, unit: "mm" });
const pt3TrayOffsetY = Param.number("PT3 Tray Offset Y", 0, { min: -80, max: 80, unit: "mm" });
const pt3TrayOffsetZ = Param.number("PT3 Tray Offset Z", -42.5, { min: -60, max: 60, unit: "mm" });
const hubPcbWidth = Param.number("Hub PCB Width", 51, { min: 20, max: 80, unit: "mm" });
const hubPcbHeight = Param.number("Hub PCB Height", 51, { min: 20, max: 80, unit: "mm" });
const hubPcbThickness = Param.number("Hub PCB Thickness", 1.6, { min: 0.8, max: 4, unit: "mm" });
const hubPcbCornerRadius = Param.number("Hub PCB Corner Radius", 3, { min: 0, max: 8, unit: "mm" });
const hubHoleDiameter = Param.number("Hub Hole Diameter", 2.5, { min: 1, max: 5, unit: "mm" });
const hubHoleSpacingX = Param.number("Hub Hole Spacing X", 43, { min: 10, max: 70, unit: "mm" });
const hubHoleSpacingZ = Param.number("Hub Hole Spacing Z", 43, { min: 10, max: 70, unit: "mm" });
const hubBossDiameter = Param.number("Hub Boss Diameter", 8, { min: 3, max: 16, unit: "mm" });
const hubBossHoleDiameter = Param.number("Hub Boss Hole Diameter", 3.2, { min: 0, max: 6, unit: "mm" });
const hubBossTopClearance = Param.number("Hub Boss Top Clearance", 0, { min: 0, max: 2, unit: "mm" });
const hubPcbOffsetX = Param.number("Hub PCB Offset X", 0, { min: -60, max: 60, unit: "mm" });
const hubPcbOffsetY = Param.number("Hub PCB Offset Y", 8, { min: -80, max: 80, unit: "mm" });
const hubTopBossOffsetZ = Param.number("Hub Top Boss Offset Z", 0, { min: -40, max: 40, unit: "mm" });

const showReferenceZones = Param.choice("Show Reference Zones", "yes", ["yes", "no"]);

const pt3TrayRaw = Import.step("./purethermal_tray_only.step").rotateX(90).rotateY(90);
const pt3TrayBounds = pt3TrayRaw.boundingBox();
const pt3TrayCenterX = (pt3TrayBounds.min[0] + pt3TrayBounds.max[0]) / 2;
const pt3TrayBottomZ = pt3TrayBounds.min[2];
const pt3TrayBackY = pt3TrayBounds.max[1];
const spineFrontY = -spineDepth / 2;
const hubHx = hubHoleSpacingX / 2;
const hubHz = hubHoleSpacingZ / 2;
const pt3Tray = pt3TrayRaw
  .translate(
    pt3TrayOffsetX - pt3TrayCenterX,
    spineFrontY + pt3TrayOffsetY - pt3TrayBackY,
    pt3TrayOffsetZ - pt3TrayBottomZ
  )
  .color("#d95f02");

const bodyBottomZ = -bodyHeight / 2;
const targetSpineBottomZ = pt3TrayOffsetZ + spineBottomClearance;
const spineHeight = Math.max(1, bodyBottomZ - targetSpineBottomZ);

const frontBody = box(bodyWidth, bodyDepth, bodyHeight)
  .translate(0, 0, -bodyHeight / 2);

const spine = box(spineWidth, spineDepth, spineHeight)
  .translate(
    spineOffsetX,
    0,
    bodyBottomZ - spineHeight
  );

const d435LeftX = -d435HoleSpacing / 2;
const d435RightX = d435HoleSpacing / 2;
const d435Hole = (x) =>
  cylinder(bodyDepth + 2, d435HoleDiameter / 2, d435HoleDiameter / 2, 32)
    .pointAlong([0, 1, 0])
    .translate(x, -(bodyDepth / 2) - 1, d435HoleZ);

const hubPcbFrontY = hubPcbOffsetY - hubPcbThickness / 2;
const mountBackY = Math.max(bodyDepth, spineDepth) / 2;
const hubBossHeight = Math.max(1, hubPcbFrontY - mountBackY - hubBossTopClearance);
const hubBossRadius = hubBossDiameter / 2;
const hubBossHoleRadius = hubBossHoleDiameter / 2;
const d435ReferenceTopZ = 12.5;
const hubUpperZ = d435ReferenceTopZ + hubTopBossOffsetZ - hubBossRadius;
const hubLowerZ = hubUpperZ - hubHoleSpacingZ;
const hubPcbCenterZ = hubUpperZ - hubHz;

function hubBoss(x, z) {
  const boss = cylinder(hubBossHeight, hubBossRadius, hubBossRadius, 28)
    .pointAlong([0, 1, 0])
    .translate(x, mountBackY, z);
  if (hubBossHoleDiameter <= 0) {
    return boss;
  }
  const hole = cylinder(hubBossHeight + 0.4, hubBossHoleRadius, hubBossHoleRadius, 24)
    .pointAlong([0, 1, 0])
    .translate(x, mountBackY - 0.2, z);
  return difference(boss, hole);
}

const mainBody = difference(
  union(frontBody, spine),
  d435Hole(d435LeftX),
  d435Hole(d435RightX),
);

const hubBosses = union(
  hubBoss(hubPcbOffsetX - hubHx, hubUpperZ),
  hubBoss(hubPcbOffsetX + hubHx, hubUpperZ),
  hubBoss(hubPcbOffsetX - hubHx, hubLowerZ),
  hubBoss(hubPcbOffsetX + hubHx, hubLowerZ),
);

const mainBodyWithBosses = union(mainBody, hubBosses).color("#6b6f74");

const d435Zone = box(90, 2, 25)
  .translate(0, -(bodyDepth / 2) - 1, -12.5)
  .color("#1f77b4");

const hubPcbBlank = box(hubPcbWidth, hubPcbThickness, hubPcbHeight);
const hubPcbBody = fillet(
  hubPcbBlank,
  Math.min(hubPcbCornerRadius, hubPcbWidth / 2 - 0.1, hubPcbHeight / 2 - 0.1),
  { parallel: [0, 1, 0], convex: true }
);
const hubHoleCenterZ = hubPcbHeight / 2;
const hubMountHole = (x, z) =>
  cylinder(hubPcbThickness, hubHoleDiameter / 2, hubHoleDiameter / 2, 24)
    .pointAlong([0, 1, 0])
    .translate(x, -hubPcbThickness / 2, z);
const hubPcb = difference(
  hubPcbBody,
  hubMountHole(-hubHx, hubHoleCenterZ - hubHz),
  hubMountHole(hubHx, hubHoleCenterZ - hubHz),
  hubMountHole(-hubHx, hubHoleCenterZ + hubHz),
  hubMountHole(hubHx, hubHoleCenterZ + hubHz),
).translate(
  hubPcbOffsetX,
  hubPcbOffsetY,
  hubPcbCenterZ - hubPcbHeight / 2
).color("#2d7f6f");

return showReferenceZones === "yes"
  ? {
      "main mount body": mainBodyWithBosses,
      "d435 reference zone": d435Zone,
      "pt3 tray reference": pt3Tray,
      "hub pcb reference": hubPcb,
    }
  : {
      "main mount body": mainBodyWithBosses,
      "pt3 tray reference": pt3Tray,
      "hub pcb reference": hubPcb,
    };
