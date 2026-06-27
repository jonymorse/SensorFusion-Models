const fs = require("fs");
const path = require("path");

const geometryPath = path.join(__dirname, "..", "models", "snap_fit_geometry.js");

function parseArgs(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    i += 1;
  }

  return options;
}

function toNumber(value, name) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${name}: ${value}`);
  }

  return parsed;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function buildProfileBlock(profileName, values) {
  return `  ${profileName}: {
    frameDepth: ${formatNumber(values.frameDepth)},
    frameWall: ${formatNumber(values.frameWall)},
    backThickness: ${formatNumber(values.backThickness)},
    snapTabWidth: ${formatNumber(values.snapTabWidth)},
    snapTabThickness: ${formatNumber(values.snapTabThickness)},
    snapTabDepth: ${formatNumber(values.snapTabDepth)},
    snapBarbHeight: ${formatNumber(values.snapBarbHeight)},
    snapBarbProjection: ${formatNumber(values.snapBarbProjection)},
    snapWindowClearance: {
      tight: ${formatNumber(values.snapWindowClearanceTight)},
      current: ${formatNumber(values.snapWindowClearanceCurrent)},
      loose: ${formatNumber(values.snapWindowClearanceLoose)},
    },
  },`;
}

function replaceProfileBlock(source, profileName, nextBlock) {
  const pattern = new RegExp(
    `  ${profileName}: \\{[\\s\\S]*?\\n  \\},`,
    "m"
  );

  if (!pattern.test(source)) {
    throw new Error(`Could not find profile block for "${profileName}"`);
  }

  return source.replace(pattern, nextBlock);
}

function readProfiles() {
  delete require.cache[require.resolve("../cad/tests/snap_fit_geometry.js")];
  const geometry = require("../cad/tests/snap_fit_geometry.js");
  return geometry.snapProfiles;
}

function writeProfile(profileName, values) {
  const source = fs.readFileSync(geometryPath, "utf8");
  const nextBlock = buildProfileBlock(profileName, values);
  const updated = replaceProfileBlock(source, profileName, nextBlock);
  fs.writeFileSync(geometryPath, updated);
}

function getProfileValues(profileName) {
  const profiles = readProfiles();
  const profile = profiles[profileName];

  if (!profile) {
    throw new Error(`Unknown profile "${profileName}"`);
  }

  return {
    frameDepth: profile.frameDepth,
    frameWall: profile.frameWall,
    backThickness: profile.backThickness,
    snapTabWidth: profile.snapTabWidth,
    snapTabThickness: profile.snapTabThickness,
    snapTabDepth: profile.snapTabDepth,
    snapBarbHeight: profile.snapBarbHeight,
    snapBarbProjection: profile.snapBarbProjection,
    snapWindowClearanceTight: profile.snapWindowClearance.tight,
    snapWindowClearanceCurrent: profile.snapWindowClearance.current,
    snapWindowClearanceLoose: profile.snapWindowClearance.loose,
  };
}

module.exports = {
  geometryPath,
  getProfileValues,
  parseArgs,
  toNumber,
  writeProfile,
};
