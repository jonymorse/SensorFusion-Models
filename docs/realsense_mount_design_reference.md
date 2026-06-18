# RealSense Mount Design Reference

This document is the measurement and packaging reference for the redesigned
RealSense / PureThermal / USB-C hub mount.

It is meant to answer two questions before CAD work starts:

1. What hardware is definitely part of the assembly?
2. What dimensions are confirmed vs. still need to be measured?

## Assembly Scope

Current known components:

- Intel RealSense Depth Camera `D435i`
- PureThermal 3 FLIR Lepton Smart I/O Board
- ORICO USB-C hub PCB from the `ORICO-XHJ2U2C-G2`
- Optional rear mounting interface
  - original design: GoPro-style prongs
  - current alternate mode: stand legs

## Confirmed Dimensions

### Intel RealSense D435i

Source status: `confirmed from official Intel / RealSense documentation`

| Item | Value | Notes |
| --- | --- | --- |
| Overall width | `90 mm` nominal | D435 / D435i body width |
| Overall height | `25 mm` nominal | cross-section height |
| Overall depth | `25 mm` nominal | housing depth |
| Weight | `72 g` in 2018 datasheet, `75 g` in later RealSense datasheet | small revision difference between source editions |
| Mounting holes | `2x M3` | mechanical drawing calls out `2X M3 mounting point` |
| Max screw insertion depth | `3 mm` | called out in mechanical drawing |
| Mount hole spacing | `45 mm` | center-to-center spacing shown in the mechanical drawing top view |
| Stereo baseline | `50 mm` | useful reference, but not the mount-hole spacing |
| IMU | `6DoF` | D435i-specific feature |
| Depth FOV (HD) | `87 deg x 58 deg` | from product family table |

### D435i Mounting Notes

- Use `M3` screws only for the D435i mount points.
- Treat `3 mm` as the maximum safe thread engagement into the camera body.
- The `45 mm` value is the relevant bracket dimension for the two camera mount
  points.
- The `50 mm` value shown in the mechanical drawing is the stereo baseline, not
  the screw-hole spacing.
- Rear USB-C cable clearance must be preserved in the final bracket layout.

### PureThermal 3 FLIR Lepton Smart I/O Board

Source status: `confirmed from official GroupGets datasheet / mechanical drawing`

| Item | Value | Notes |
| --- | --- | --- |
| Overall board width | `25.8 mm` | mechanical drawing |
| Overall board height | `28.9 mm` | mechanical drawing |
| Mounting holes | `4` | one near each rounded corner |
| Mounting hole diameter | `2.2 mm` | drawing callout `diameter 2.2` |
| Mounting hole X spacing | `20.7 mm` | center-to-center from left to right mounting holes |
| Mounting hole Z spacing | `23.9 mm` | center-to-center from top to bottom mounting holes |
| Board tolerance | `+/- 0.2 mm` | stated on the mechanical drawing |
| Board thickness / section reference | `1.6 mm` | shown on side-view drawing; interpreted as PCB thickness |
| USB connector | `USB-C` | edge-mounted on one side of the board |
| Breakout edges | `0.1 in / 2.54 mm` pitch through-holes | per datasheet feature list |

### PureThermal 3 Mounting Notes

- The corner mounting pattern is much smaller than the D435i pattern, which
  means the PureThermal 3 can likely fit well inside the D435i mounting-height
  envelope.
- The mounting holes are `2.2 mm`, so they are suited to approximately `M2`
  class hardware or clearance around similarly sized fasteners.
- The board includes an edge-mounted `USB-C` connector and side breakout rows,
  so the bracket should avoid trapping cable insertion or access to edge I/O.
- The Lepton socket occupies the central top-face area, so front-side keep-outs
  around the sensor module and its viewing path are important.

### ORICO USB-C Hub PCB

Source status: `exact product identified; external enclosure confirmed from official ORICO documentation; bare PCB dimensions provided from direct user measurement and redesign notes`

Exact product in use:

- Retail description: `ORICO 10Gbps USB-C Hub, 4-Port Zinc Alloy USB 3.2 Splitter with 2 USB-A & 2 USB-C Ports`
- Official ORICO model: `ORICO-XHJ2U2C-G2`

Confirmed external product details:

| Item | Value | Notes |
| --- | --- | --- |
| Product model | `ORICO-XHJ2U2C-G2` | official ORICO page |
| Housing material | `Zinc Alloy + PC` | official ORICO page |
| Input | `USB-C` | official ORICO page |
| Outputs | `2x USB-A, 2x USB-C` | official ORICO page |
| Transfer rate | `10 Gbps` | official ORICO page |
| Cable | `USB-C to USB-C, 0.5 m / 1 m` | official ORICO page |
| External housing size | `56.9 x 56.9 x 20.7 mm` | official ORICO page |
| Alternate retail size listing | `2.24 x 2.24 x 0.81 in` | Amazon listing; effectively the same size after unit conversion |

Confirmed PCB and mounting details:

| Item | Value | Notes |
| --- | --- | --- |
| PCB size | `51.0 x 51.0 mm` | from direct measurement / redesign notes |
| PCB thickness | `~1.6 mm` | from direct measurement / redesign notes |
| Mounting holes | `4` | one near each corner |
| Hole diameter | `2.4 mm to 2.6 mm` measured | design assumption `2.5 mm` |
| Hole center inset from edges | `~4.0 mm` | measured `~3.94 mm`, use `4.0 mm` for CAD |
| Hole spacing | `43.0 x 43.0 mm` | center-to-center |
| Hole centers | `(4,4), (47,4), (4,47), (47,47)` mm | using lower-left board corner as origin |
| Recommended PCB pocket | `51.8 x 51.8 mm` | includes clearance |
| Pocket clearance per side | `~0.4 mm` | from redesign notes |

### ORICO USB-C Hub Mounting Notes

- The official `56.9 x 56.9 x 20.7 mm` dimension is for the complete hub
  enclosure, not the bare PCB.
- The bare PCB is now dimensioned well enough to drive CAD for a replacement
  bottom shell or bracket interface.
- The hub has one upstream `USB-C` input and four downstream ports, so
  connector orientation and cable bend relief will be major layout drivers.
- A `51.8 x 51.8 mm` support pocket with `0.4 mm` clearance per side is the
  current recommended starting point.
- The replacement bottom shell should preserve the original screw geometry, port
  alignment, and PCB orientation so the stock clear top cover still fits.

## Needs Measurement

These items are part of the design, but I do not yet have every packaging
detail confirmed in-repo.

### USB-C PCB Hub

Still useful to confirm during shell redesign:

- boss/standoff height required to match the original enclosure stack
- exact screw head diameter and recess depth
- connector keep-out zones relative to the bare PCB
- solder-joint and underside component clearance depth
- whether the custom bottom shell should fully guard the sides or stay minimal

## Design Implications From Current Data

### D435i

- The camera is not the main height driver by itself; at `25 mm` tall it is
  relatively compact.
- The `45 mm` mount-hole spacing is close to the current CAD model's `45 mm`
  assumption, which is a good sign.
- Because the screw spec is `M3` with only `3 mm` max insertion depth, the
  bracket should avoid deep engagement assumptions or long screws bottoming out.

### PureThermal 3

- The PureThermal 3 board is small enough that it should not drive the overall
  mount height by itself.
- Its `20.7 mm x 23.9 mm` hole pattern makes screw-mounting much more attractive
  than long retainer rails.
- Because the board is only `25.8 mm x 28.9 mm`, it should be possible to place
  it within the same vertical envelope as the D435i mounting zone if desired.
- The `USB-C` edge and Lepton optical path should be treated as hard keep-out
  zones when shaping guards or protective walls.

### ORICO USB-C Hub

- The official product envelope is only moderately smaller than the current
  plate width, so this hub may still be one of the main packaging drivers.
- The measured `51.0 x 51.0 mm` PCB with a `43.0 mm` square hole pattern is now
  specific enough to support a proper shell redesign.
- This is the part most likely to determine whether the redesign uses
  screw-mounted shell capture, a pocketed cradle, or a guarded clamp strategy.

### Overall Mount Strategy

Because the D435i, PureThermal 3, and ORICO hub PCB all now have usable
mounting references, the redesign should strongly consider:

- screw-mounted boards instead of long rail retainers
- explicit standoffs or bosses
- controlled cable-clearance zones
- a separate decision about whether the GoPro interface is integrated or modular

## Open Questions

- Which exact PureThermal 3 board revision are we mounting?
- What boss/standoff height is required to reproduce the original ORICO shell's
  PCB stack-up under the reused clear top cover?
- What are the exact connector keep-out zones on the ORICO PCB relative to the
  mounting-hole origin?
- Should the GoPro-style rear interface be built into the main bracket or become
  a removable secondary part?
- Is the preferred redesign priority `smallest`, `cleanest`, `most rugged`, or
  some mix of those?

## Sources

- Intel RealSense D400 Series datasheet:
  https://cdrdv2-public.intel.com/841984/Intel-RealSense-D400-Series-Datasheet.pdf
- RealSense D435i product page:
  https://realsenseai.com/products/depth-camera-d435i/
- RealSense D400 Series datasheet, later revision:
  https://www.realsenseai.com/wp-content/uploads/2023/10/Intel-RealSense-D400-Series-Datasheet-September-2023.pdf
- GroupGets PureThermal 3 product page:
  https://groupgets.com/products/purethermal-3
- GroupGets PureThermal 3 datasheet:
  https://media.digikey.com/pdf/Data%20Sheets/GroupGets%20PDFs/PURETHERMAL-3_Rev2_Oct2022.pdf
- SparkFun PureThermal 3 listing:
  https://www.sparkfun.com/purethermal-3-flir-lepton-smart-i-o-board.html
- ORICO product page for the compact zinc alloy hub:
  https://www.orico.cc/index/product/detail/3473.html
- Amazon listing matching the retail description:
  https://www.amazon.com/ORICO-Splitter-High-Speed-Extender-Desktops/dp/B0FDB3WV1K
- Newegg listing with the matching ORICO model:
  https://www.newegg.com/p/0J2-001S-001Z6

## Source Notes

- Overall D435i body dimensions come from the D400 Series datasheet mechanical
  dimensions table.
- The `2x M3`, `45 mm` spacing, and `3 mm` max insertion depth values come from
  the D435/D435i mechanical drawing figure in the Intel datasheet.
- The later RealSense-hosted datasheet revision reports slightly tighter
  min/nominal/max dimensional tolerances and a `75 g` nominal weight; the core
  package size remains effectively the same for bracket design.
- The PureThermal 3 `25.8 mm x 28.9 mm` form factor is stated in the GroupGets
  datasheet feature list and in distributor product listings.
- The PureThermal 3 mounting-hole count, `2.2 mm` hole diameter, and
  `20.7 mm x 23.9 mm` hole spacing come from the mechanical drawing page in the
  GroupGets PureThermal 3 datasheet.
- The `1.6 mm` value is shown in the side-view mechanical drawing and is treated
  here as the PCB thickness reference.
- The ORICO model number `ORICO-XHJ2U2C-G2` and external dimensions
  `56.9 x 56.9 x 20.7 mm` come from ORICO's official product page.
- The Amazon size listing `2.24 x 2.24 x 0.81 in` is consistent with the
  official ORICO metric dimensions after unit conversion.
- The ORICO bare PCB values in this document come from direct user measurement
  and redesign notes: `51.0 x 51.0 mm` PCB, `2.5 mm` design hole diameter,
  `4.0 mm` hole-center inset, `43.0 x 43.0 mm` hole spacing, and a recommended
  `51.8 x 51.8 mm` support pocket.
