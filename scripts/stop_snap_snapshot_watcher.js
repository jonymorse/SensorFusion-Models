const fs = require("fs");
const path = require("path");

const pidPath = path.join(__dirname, ".snap_snapshot_watcher.pid");

if (!fs.existsSync(pidPath)) {
  console.log("Watcher is not running");
  process.exit(0);
}

const pid = Number(fs.readFileSync(pidPath, "utf8"));

if (!Number.isFinite(pid)) {
  fs.unlinkSync(pidPath);
  console.log("Watcher pid file was invalid and has been cleared");
  process.exit(0);
}

try {
  process.kill(pid);
  fs.unlinkSync(pidPath);
  console.log(`Stopped watcher pid ${pid}`);
} catch {
  if (fs.existsSync(pidPath)) {
    fs.unlinkSync(pidPath);
  }
  console.log(`Watcher pid ${pid} was not running; cleared pid file`);
}
