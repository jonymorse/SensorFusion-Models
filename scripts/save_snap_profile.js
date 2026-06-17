const {
  parseArgs,
  toNumber,
  writeProfile,
} = require("./snap_profile_utils.js");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const profile = args.profile || "candidate";

  if (!["current", "candidate"].includes(profile)) {
    throw new Error(`Unsupported profile "${profile}". Use current or candidate.`);
  }

  const values = {
    frameDepth: toNumber(args.frameDepth ?? 16, "frameDepth"),
    frameWall: toNumber(args.frameWall ?? 3, "frameWall"),
    backThickness: toNumber(args.backThickness ?? 3, "backThickness"),
    snapTabWidth: toNumber(args.snapTabWidth ?? 18, "snapTabWidth"),
    snapTabThickness: toNumber(args.snapTabThickness ?? 2.2, "snapTabThickness"),
    snapTabDepth: toNumber(args.snapTabDepth ?? 8, "snapTabDepth"),
    snapBarbHeight: toNumber(args.snapBarbHeight ?? 1.8, "snapBarbHeight"),
    snapBarbProjection: toNumber(args.snapBarbProjection ?? 1.0, "snapBarbProjection"),
    snapWindowClearanceTight: toNumber(args.snapWindowClearanceTight ?? 0.6, "snapWindowClearanceTight"),
    snapWindowClearanceCurrent: toNumber(args.snapWindowClearanceCurrent ?? 0.9, "snapWindowClearanceCurrent"),
    snapWindowClearanceLoose: toNumber(args.snapWindowClearanceLoose ?? 1.2, "snapWindowClearanceLoose"),
  };

  writeProfile(profile, values);

  console.log(`Updated ${profile} in snap_fit_geometry.js`);
  console.log(JSON.stringify({ profile, values }, null, 2));
}

main();
