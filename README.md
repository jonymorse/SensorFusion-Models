# Sensor Fusion Models

ForgeCAD models and supporting scripts for the sensor fusion project's 3D
design work.

## Layout

```text
cad/
  sensor_fusion/  Active sensor fusion, PT3, GoPro, and RealSense CAD sources
  calibration/    Active thermal calibration target CAD source
  tests/          Printable fit/check coupons and their local helpers
  concepts/       Older concepts and exploratory designs

hardware_refs/    Imported STEP/F3D/3MF reference geometry
docs/             Design notes and requirements
outputs/
  previews/       Rendered preview images
  exports/        Generated CAD exports
archive/          Historical reports, tiny experiments, and superseded sources
scripts/          Utility scripts for snap-fit tuning workflows
```

`forgecad_work_2026-06-22/references/` is intentionally ignored. It is a local
copied reference bundle, not part of the cleaned source tree.

## Commands

```powershell
npm.cmd run check:coupon
npm.cmd run check:insert-coupon
npm.cmd run check:thermal
npm.cmd run check:realsense
npm.cmd run check:sensor-fusion
npm.cmd run check:gopro-stand
npm.cmd run studio
```

PowerShell script execution is disabled on this machine, so use `npm.cmd` and
`forgecad.cmd` rather than the `.ps1` shims.
