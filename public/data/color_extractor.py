#!/usr/bin/env python3
# public/data/color_extractor.py

import os
import json
import colorsys
from colorthief import ColorThief

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_PATH = os.path.join(SCRIPT_DIR, 'logo.png')
OUTPUT_JSON = os.path.join(SCRIPT_DIR, 'extracted_data.json')
NUM_COLORS = 5

def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)

def hex_to_rgb(hex_str):
    hex_str = hex_str.strip("#")
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return (r, g, b)

def hls_to_rgb_bytes(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return (int(round(r*255)), int(round(g*255)), int(round(b*255)))

def generate_color_combos(hex_color):
    base_rgb = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(base_rgb[0]/255.0, base_rgb[1]/255.0, base_rgb[2]/255.0)

    combos = {}
    # Complementary
    h_comp = (h + 0.5) % 1.0
    comp_rgb = hls_to_rgb_bytes(h_comp, l, s)
    combos["complementary"] = rgb_to_hex(comp_rgb)

    # Analogous +/- 30 deg
    hue_step = 30.0/360.0
    analog1 = hls_to_rgb_bytes((h + hue_step) % 1.0, l, s)
    analog2 = hls_to_rgb_bytes((h - hue_step) % 1.0, l, s)
    combos["analogous"] = [rgb_to_hex(analog1), rgb_to_hex(analog2)]

    # Triadic +/- 120 deg
    hue_step_120 = 120.0/360.0
    triad1 = hls_to_rgb_bytes((h + hue_step_120) % 1.0, l, s)
    triad2 = hls_to_rgb_bytes((h - hue_step_120) % 1.0, l, s)
    combos["triadic"] = [rgb_to_hex(triad1), rgb_to_hex(triad2)]
    return combos

def main():
    if not os.path.exists(IMAGE_PATH):
        print("No logo.png file found. Exiting.")
        return

    thief = ColorThief(IMAGE_PATH)
    dominant_rgb = thief.get_color(quality=1)
    palette_rgb = thief.get_palette(color_count=NUM_COLORS, quality=1)

    dominant_hex = rgb_to_hex(dominant_rgb)
    palette_hex = [rgb_to_hex(c) for c in palette_rgb]

    color_combos = []
    for c in palette_hex:
        color_combos.append({
            "base": c,
            "theory": generate_color_combos(c)
        })

    data = {
        "dominant": dominant_hex,
        "palette": palette_hex,
        "color_combos": color_combos
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2)
    print(f"[INFO] Wrote extracted_data.json with color combos.")

if __name__ == "__main__":
    main()
