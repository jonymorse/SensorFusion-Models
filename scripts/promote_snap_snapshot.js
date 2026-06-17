const fs = require("fs");
const path = require("path");

const {
  getProfileValues,
  parseArgs,
  writeProfile,
} = require("./snap_profile_utils.js");

const defaultStorageDir = path.join(
  process.env.LOCALAPPDATA || "",
  "Google",
  "Chrome",
  "User Data",
  "Default",
  "Local Storage",
  "leveldb"
);

function listStorageFiles(storageDir) {
  return fs
    .readdirSync(storageDir)
    .filter((name) => name.endsWith(".log") || name.endsWith(".ldb"))
    .map((name) => path.join(storageDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
}

function extractBalancedJson(text, startIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  return null;
}

function findViewPreferenceObjects(filePath) {
  const text = fs.readFileSync(filePath, "latin1");
  const marker = "fc-view-preferences-v1";
  const objects = [];
  let searchIndex = 0;

  while (true) {
    const markerIndex = text.indexOf(marker, searchIndex);

    if (markerIndex === -1) {
      break;
    }

    const jsonStart = text.indexOf("{", markerIndex);

    if (jsonStart === -1) {
      break;
    }

    const rawJson = extractBalancedJson(text, jsonStart);

    if (rawJson) {
      try {
        objects.push(JSON.parse(rawJson));
      } catch {
        // Ignore malformed matches from binary fragments.
      }
    }

    searchIndex = markerIndex + marker.length;
  }

  return objects;
}

function readSnapshotCache(storageDir, fileName) {
  const files = listStorageFiles(storageDir);
  let bestMatch = null;
  let bestTimestamp = -1;

  for (const filePath of files) {
    const objects = findViewPreferenceObjects(filePath);

    for (const object of objects) {
      const snapshots = object.paramSnapshotsByFile?.[fileName];

      if (!Array.isArray(snapshots) || snapshots.length === 0) {
        continue;
      }

      const latestTimestamp = Math.max(
        ...snapshots.map((snapshot) => snapshot.createdAt || 0)
      );

      if (latestTimestamp > bestTimestamp) {
        bestTimestamp = latestTimestamp;
        bestMatch = snapshots;
      }
    }
  }

  if (!bestMatch) {
    throw new Error(
      `No ForgeCAD snapshots found for ${fileName} in ${storageDir}`
    );
  }

  return bestMatch;
}

function pickSnapshot(snapshots, snapshotName) {
  if (snapshotName) {
    const named = snapshots.find((snapshot) => snapshot.name === snapshotName);

    if (!named) {
      throw new Error(`Snapshot "${snapshotName}" was not found.`);
    }

    return named;
  }

  return [...snapshots].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  )[0];
}

function buildPromotedValues(baseValues, snapshot) {
  const overrides = snapshot.overrides || {};
  const clearanceVariant = overrides["Clearance Variant"] || "current";
  const values = {
    ...baseValues,
  };

  if (overrides["Snap Tab Width"] !== undefined) {
    values.snapTabWidth = Number(overrides["Snap Tab Width"]);
  }
  if (overrides["Snap Tab Thickness"] !== undefined) {
    values.snapTabThickness = Number(overrides["Snap Tab Thickness"]);
  }
  if (overrides["Snap Tab Depth"] !== undefined) {
    values.snapTabDepth = Number(overrides["Snap Tab Depth"]);
  }
  if (overrides["Snap Barb Height"] !== undefined) {
    values.snapBarbHeight = Number(overrides["Snap Barb Height"]);
  }
  if (overrides["Snap Barb Projection"] !== undefined) {
    values.snapBarbProjection = Number(overrides["Snap Barb Projection"]);
  }
  if (overrides["Snap Window Clearance"] !== undefined) {
    const clearanceValue = Number(overrides["Snap Window Clearance"]);

    if (clearanceVariant === "tight") {
      values.snapWindowClearanceTight = clearanceValue;
    } else if (clearanceVariant === "loose") {
      values.snapWindowClearanceLoose = clearanceValue;
    } else {
      values.snapWindowClearanceCurrent = clearanceValue;
    }
  }

  return {
    values,
    clearanceVariant,
  };
}

function promoteSnapshot(options = {}) {
  const {
    fileName = "snap_fit_test_coupon.forge.js",
    profile = "candidate",
    snapshotName,
    storageDir = defaultStorageDir,
    dryRun = false,
    listOnly = false,
  } = options;

  if (!fs.existsSync(storageDir)) {
    throw new Error(`Storage directory not found: ${storageDir}`);
  }

  const snapshots = readSnapshotCache(storageDir, fileName);

  if (listOnly) {
    return {
      snapshots: snapshots
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .map((snapshot) => ({
          name: snapshot.name,
          createdAt: snapshot.createdAt,
          overrides: snapshot.overrides || {},
        })),
    };
  }

  const snapshot = pickSnapshot(snapshots, snapshotName);
  const baseValues = getProfileValues(profile);
  const { values, clearanceVariant } = buildPromotedValues(baseValues, snapshot);

  if (!dryRun) {
    writeProfile(profile, values);
  }

  return {
    fileName,
    profile,
    snapshotName: snapshot.name,
    createdAt: snapshot.createdAt,
    promotedClearanceVariant: clearanceVariant,
    overrides: snapshot.overrides || {},
    values,
    dryRun,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = promoteSnapshot({
    fileName: args.file,
    profile: args.profile,
    snapshotName: args.snapshot,
    storageDir: args.storageDir,
    dryRun: Boolean(args["dry-run"]),
    listOnly: Boolean(args.list),
  });

  if (result.snapshots) {
    console.log(JSON.stringify(result.snapshots, null, 2));
    return;
  }

  console.log(
    result.dryRun
      ? `Dry run for snapshot "${result.snapshotName}" into ${result.profile}`
      : `Promoted snapshot "${result.snapshotName}" into ${result.profile} in snap_fit_geometry.js`
  );
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  defaultStorageDir,
  promoteSnapshot,
};
