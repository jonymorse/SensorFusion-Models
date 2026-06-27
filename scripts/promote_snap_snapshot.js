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
const defaultCouponSnapshotFiles = [
  "cad/tests/snap_fit_test_coupon.forge.js",
  "snap_fit_test_coupon.forge.js",
];

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

function normalizeFileNames(fileName) {
  if (Array.isArray(fileName)) {
    return fileName;
  }

  if (typeof fileName === "string" && fileName.trim().length > 0) {
    return [fileName];
  }

  return defaultCouponSnapshotFiles;
}

function readSnapshotCache(storageDir, fileName) {
  const fileNames = normalizeFileNames(fileName);
  const files = listStorageFiles(storageDir);
  let bestMatch = null;
  let bestTimestamp = -1;
  let bestFileName = null;

  for (const filePath of files) {
    const objects = findViewPreferenceObjects(filePath);

    for (const object of objects) {
      for (const currentFileName of fileNames) {
        const snapshots = object.paramSnapshotsByFile?.[currentFileName];

        if (!Array.isArray(snapshots) || snapshots.length === 0) {
          continue;
        }

        const latestTimestamp = Math.max(
          ...snapshots.map((snapshot) => snapshot.createdAt || 0)
        );

        if (latestTimestamp > bestTimestamp) {
          bestTimestamp = latestTimestamp;
          bestMatch = snapshots;
          bestFileName = currentFileName;
        }
      }
    }
  }

  if (!bestMatch) {
    throw new Error(
      `No ForgeCAD snapshots found for ${fileNames.join(", ")} in ${storageDir}`
    );
  }

  return {
    fileName: bestFileName,
    snapshots: bestMatch,
  };
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
  const clearanceVariant =
    overrides["Setup: Clearance Variant"] ||
    overrides["Clearance Variant"] ||
    "current";
  const values = {
    ...baseValues,
  };

  const sharedSnapTabWidth =
    overrides["Interface: Snap Tab Width"] ??
    overrides["Snap Tab Width"];
  const snapTabThickness =
    overrides["Hook: Snap Tab Thickness"] ??
    overrides["Snap Tab Thickness"];
  const sharedLatchDepth =
    overrides["Interface: Latch Depth"] ??
    overrides["Snap Tab Depth"];
  const extraTabDepth =
    overrides["Hook: Extra Tab Depth"] ?? 0;
  const sharedSnapBarbHeight =
    overrides["Interface: Snap Barb Height"] ??
    overrides["Snap Barb Height"];
  const extraBarbHeight =
    overrides["Hook: Extra Barb Height"] ?? 0;
  const snapBarbProjection =
    overrides["Hook: Snap Barb Projection"] ??
    overrides["Snap Barb Projection"];
  const snapWindowClearance =
    overrides["Socket: Snap Window Clearance"] ??
    overrides["Snap Window Clearance"];

  if (sharedSnapTabWidth !== undefined) {
    values.snapTabWidth = Number(sharedSnapTabWidth);
  }
  if (snapTabThickness !== undefined) {
    values.snapTabThickness = Number(snapTabThickness);
  }
  if (sharedLatchDepth !== undefined || extraTabDepth !== undefined) {
    values.snapTabDepth =
      Number(sharedLatchDepth ?? values.snapTabDepth) +
      Number(extraTabDepth ?? 0);
  }
  if (sharedSnapBarbHeight !== undefined || extraBarbHeight !== undefined) {
    values.snapBarbHeight =
      Number(sharedSnapBarbHeight ?? values.snapBarbHeight) +
      Number(extraBarbHeight ?? 0);
  }
  if (snapBarbProjection !== undefined) {
    values.snapBarbProjection = Number(snapBarbProjection);
  }
  if (snapWindowClearance !== undefined) {
    const clearanceValue = Number(snapWindowClearance);

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
    fileName = defaultCouponSnapshotFiles,
    profile = "candidate",
    snapshotName,
    storageDir = defaultStorageDir,
    dryRun = false,
    listOnly = false,
  } = options;

  if (!fs.existsSync(storageDir)) {
    throw new Error(`Storage directory not found: ${storageDir}`);
  }

  const snapshotCache = readSnapshotCache(storageDir, fileName);
  const snapshots = snapshotCache.snapshots;

  if (listOnly) {
    return {
      fileName: snapshotCache.fileName,
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
    fileName: snapshotCache.fileName,
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
  buildPromotedValues,
  defaultCouponSnapshotFiles,
  defaultStorageDir,
  promoteSnapshot,
};
