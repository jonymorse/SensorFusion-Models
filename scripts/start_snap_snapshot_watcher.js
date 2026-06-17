const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const pidPath = path.join(__dirname, ".snap_snapshot_watcher.pid");

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (fs.existsSync(pidPath)) {
  const existingPid = Number(fs.readFileSync(pidPath, "utf8"));
  if (Number.isFinite(existingPid) && isProcessRunning(existingPid)) {
    console.log(`Watcher already running with pid ${existingPid}`);
    process.exit(0);
  }
  fs.unlinkSync(pidPath);
}

const child = spawn(
  process.execPath,
  [path.join(__dirname, "watch_snap_snapshot.js"), "--quiet"],
  {
    cwd: __dirname,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }
);

child.unref();

console.log(`Started watcher with pid ${child.pid}`);
