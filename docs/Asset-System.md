# 🎨 Asset System

## Character Sprites

**Location**: `webview-ui/public/assets/characters/`

6 pre-colored PNGs (`char_0.png` – `char_5.png`), 112×96 pixels each:
- 7 frames × 16px wide
- 3 directions × 32px tall (down, up, right)
- Frame order: walk1, walk2, walk3, type1, type2, read1, read2

### Palette Assignment
- First 6 agents → unique skins
- Beyond 6 → random hue shift (45–315°)

---

## Floor Tiles

**Source**: `floors.png` (112×16, 7 patterns)

Colorized via HSBC sliders (Photoshop-style)

---

## Wall Tiles

**Source**: `walls.png` (64×128, 4×4 grid)

16 auto-tile variations using 4-bit bitmask (N=1, E=2, S=4, W=8)

---

## Furniture Catalog

**Source**: `furniture-catalog.json`

| Category | Description |
|----------|-------------|
| `desks` | Work surfaces |
| `chairs` | Seating |
| `storage` | Bookcases |
| `electronics` | Monitors |
| `decor` | Plants |
| `wall` | Paintings |

---

## Asset Import

```bash
npm run import-tileset
```

Stages: detect → edit → vision-inspect → review → export

---

## Third-Party

- **Office Tileset**: [Donarg](https://donarg.itch.io/officetileset) ($2)
- **Characters**: [Metro City by JIK-A-4](https://jik-a-4.itch.io/metrocity-free-topdown-character-pack)