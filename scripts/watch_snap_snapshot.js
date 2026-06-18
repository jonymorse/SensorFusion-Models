const fs = require("fs");
const path = require("path");

const {
  parseArgs,
} = require("./snap_profile_utils.js");
const {
  defaultCouponSnapshotFiles,
  defaultStorageDir,
  promoteSnapshot,
} = require("./promote_snap_snapshot.js");

const statePath = path.join(__dirname, ".snap_snapshot_watcher_state.json");
const pidPath = path.join(__dirname, ".snap_snapshot_watcher.pid");

function loadState() {
  if (!fs.existsSync(statePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function latestMtimeMs(storageDir) {
  const names = fs.readdirSync(storageDir)
    .filter((name) => name.endsWith(".log") || name.endsWith(".ldb"));

  let maxMtime = 0;

  for (const name of names) {
    try {
      const mtime = fs.statSync(path.join(storageDir, name)).mtimeMs;
      if (mtime > maxMtime) {
        maxMtime = mtime;
      }
    } catch {
      // Ignore files that are briefly unavailable while Chrome writes them.
    }
  }

  return maxMtime;
}

function runWatcher(options) {
  const {
    fileName,
    profile,
    snapshotName,
    storageDir,
    intervalMs,
    quiet,
  } = options;

  const state = loadState();
  let lastSeenStorageMtime = state.lastSeenStorageMtime || 0;
  let lastPromotedSnapshotAt = state.lastPromotedSnapshotAt || 0;

  fs.writeFileSync(pidPath, String(process.pid));

  const tick = () => {
    try {
      const currentMtime = latestMtimeMs(storageDir);

      if (currentMtime <= lastSeenStorageMtime) {
        return;
      }

      lastSeenStorageMtime = currentMtime;
      const result = promoteSnapshot({
        fileName,
        profile,
        snapshotName,
        storageDir,
        dryRun: true,
      });

      if ((result.createdAt || 0) <= lastPromotedSnapshotAt) {
        saveState({
          lastSeenStorageMtime,
          lastPromotedSnapshotAt,
        });
        return;
      }

      promoteSnapshot({
        fileName,
        profile,
        snapshotName,
        storageDir,
      });

      lastPromotedSnapshotAt = result.createdAt || 0;
      saveState({
        lastSeenStorageMtime,
        lastPromotedSnapshotAt,
      });

      if (!quiet) {
        console.log(
          `[watch] promoted snapshot "${result.snapshotName}" at ${new Date(lastPromotedSnapshotAt).toISOString()}`
        );
      }
    } catch (error) {
      if (!quiet) {
        console.error(`[watch] ${error.message}`);
      }
    }
  };

  if (!quiet) {
    console.log(
      `[watch] watching ${snapshotName} for ${fileName} every ${intervalMs}ms`
    );
  }

  tick();
  const timer = setInterval(tick, intervalMs);

  const cleanup = () => {
    clearInterval(timer);
    if (fs.existsSync(pidPath)) {
      fs.unlinkSync(pidPath);
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const fileName = args.file || defaultCouponSnapshotFiles;
  const profile = args.profile || "candidate";
  const snapshotName = args.snapshot;
  const storageDir = args.storageDir || defaultStorageDir;
  const intervalMs = Number(args.intervalMs || 3000);
  const quiet = Boolean(args.quiet);

  runWatcher({
    fileName,
    profile,
    snapshotName,
    storageDir,
    intervalMs,
    quiet,
  });
}

main();
