# GoPro-Compatible Mount Requirements

## Scope

Design a new, 3D-printable GoPro-compatible mount without modifying the thermal
calibration target. The first interface should be the accessory-side 3-prong
receiver that accepts the two folding fingers on a GoPro camera.

GoPro confirms that its ecosystem uses standard mounting fingers and offers
adapters between mounting fingers and 1/4-20 equipment, but GoPro does not
publish a dimensioned finger-interface drawing.

Official references:

- https://gopro.com/en/pl/shop/mounts-accessories/mounting-finger-adapter/ABTFR-001.html
- https://gopro.com/en/at/shop/mounts-accessories/tripod-adapters/ABQRT-003.html

The dimensions below are de facto compatibility dimensions cross-checked from
measured examples and a parametric OpenSCAD implementation. They are not an
official GoPro mechanical standard.

Measured and parametric references:

- https://www.instructables.com/GoPro-clamp-mount-for-multiple-angles-with-one-cam/
- https://github.com/ridercz/GoProScad/blob/master/GoPro.scad

## Interface Datasheet

| Feature | Nominal | First-print target | Notes |
|---|---:|---:|---|
| Finger thickness | 3.0 mm | 3.0 mm | Both 2-prong and 3-prong fingers |
| Mating gap | 3.5 mm | 3.4-3.5 mm | Includes practical print clearance |
| Pivot screw | M5 | M5 x 0.8 | Original GoPro thumb screw preferred |
| Pivot hole | 5.0 mm | 5.3 mm | Tune from 5.1-5.5 mm by test print |
| Rounded finger-end diameter | 15.0 mm | 15.0 mm | Radius 7.5 mm |
| Finger/leg height | 17.0 mm | 17.0 mm | Do not reduce below 15 mm |
| Base thickness | 3.0 mm | 3.5-4.0 mm | Increased for FDM strength |
| Minimum mount width | 15.0 mm | 20.0 mm | Width perpendicular to finger stack |
| 2-prong stack depth | 9.5 mm | 9.5 mm | 3 + 3.5 + 3 |
| 3-prong interface depth | 16.0 mm | 16.0 mm | 3 + 3.5 + 3 + 3.5 + 3 |
| Nut-capture allowance | 3.0 mm | Optional | Raises 3-prong base depth to 19 mm |

For a 17 mm leg and 3 mm base, the pivot axis is 12.5 mm above the bottom of
the base, or 9.5 mm above the base's top face.

## Parametric Controls

The ForgeCAD model should expose these controls:

- `Interface`: 3-prong receiver or 2-prong arm.
- `Finger Thickness`: default 3.0 mm, range 2.8-3.2 mm.
- `Mating Gap`: default 3.5 mm, range 3.2-3.8 mm.
- `Pivot Hole Diameter`: default 5.3 mm, range 5.0-5.6 mm.
- `Finger Height`: default 17 mm, range 15-22 mm.
- `Base Width`: default 20 mm, minimum 15 mm.
- `Base Thickness`: default 4 mm, minimum 3 mm.
- `Nut Capture`: none, square M5 nut, or hex M5 nut.

Do not scale the entire interface uniformly. Finger width, mating clearance,
and pivot-hole clearance need independent tolerances.

## Structural Requirements

- Add at least a 2 mm root fillet or equivalent tapered gusset at each finger.
- Keep at least 2.0 mm of material around the pivot hole.
- Avoid sharp internal corners at the finger-to-base transition.
- Use the original metal M5 thumb screw rather than a printed screw.
- Add a mechanical safety tether for vehicle, helmet, overhead, or outdoor use.
- Keep the camera center of mass as close to the pivot as the application allows.
- Treat the mount as a prototype until it passes fit, torque, vibration, and drop tests.

## Bambu A1 Print Requirements

- PLA+ is acceptable for fit prototypes; PETG or ASA is preferred for outdoor,
  hot-car, vibration, or impact exposure.
- Use a 0.4 mm nozzle with at least four walls/perimeters.
- Use 0.16-0.20 mm layers around the interface.
- Use at least 40% infill; use more for long arms or high-vibration mounts.
- Orient the part so layer lines run along the finger length, not across the
  finger roots. Side printing will usually require support but is stronger.
- Avoid aggressive cooling on PETG/ASA finger roots to preserve layer adhesion.

## Validation Coupon

Before printing the full mount, print a coupon containing only:

- The 3-prong finger interface.
- A 5.3 mm through-hole.
- One 3.4 mm gap and one 3.5 mm gap option.
- The 15 mm rounded finger ends.

Acceptance criteria:

- Camera fingers insert by hand without forcing or visible spreading.
- The M5 thumb screw passes through without drilling.
- The joint clamps firmly and holds angle without wobble.
- Fingers show no whitening, cracking, or delamination after ten clamp cycles.
- The camera can be removed without tools other than the normal thumb screw.

## Decisions Needed Before Full Geometry

- Base attachment: flat screw-down plate, adhesive base, clamp, 1/4-20 socket,
  tripod adapter, or custom device interface.
- Camera model and expected payload.
- Required tilt range and whether the joint must rotate continuously.
- Indoor prototype or outdoor/action use.
- Original GoPro thumb screw or generic M5 hardware.

