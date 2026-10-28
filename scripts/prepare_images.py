"""Turn original product photos into web images.

For each product writes static/images/products/<ID>-photo.webp (white background,
max 1000 px) and <ID>-cutout.webp (transparent background, max 700 px).

Usage (needs: pip install pillow numpy scipy):
    python scripts/prepare_images.py <folder with original photos>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage as ndi

OUT = Path(__file__).resolve().parent.parent / "static" / "images" / "products"

# product id -> (file name, how to separate the product from the background)
SOURCES = {
    "OR-PK-101": ("206A7464.JPG", "saturated_or_dark"),
    "OR-PK-105": ("206A7456.JPG", "saturated"),
    "OR-VS-603": ("206A9051.jpg", "dark"),
    "OR-VS-602": ("206A9076.jpg", "warm"),
    "OR-DE-702": ("206A7451.JPG", "not_background"),
    "OR-KT-502": ("JOY_print.jpg", "print"),
    "OR-KT-504": ("LIN_print.jpg", "print"),
}
PRINT_BOX = (171, 73, 730, 828)  # artwork area inside the 900 x 900 print files


def mask_for(im: Image.Image, method: str) -> np.ndarray:
    a = np.asarray(im).astype(np.float32)
    hsv = np.asarray(im.convert("HSV")).astype(np.float32) / 255
    if method == "saturated":
        return hsv[..., 1] > 0.35
    if method == "saturated_or_dark":
        return (hsv[..., 1] > 0.30) | (hsv[..., 2] < 0.35)
    if method == "dark":
        return hsv[..., 2] < 0.42
    if method == "warm":
        return (a[..., 0] - a[..., 2]) > 22
    if method == "not_background":
        rows = np.median(np.concatenate([a[:, :40], a[:, -40:]], axis=1), axis=1)
        d = np.sqrt(((a - rows[:, None, :]) ** 2).sum(-1))
        rb = a[..., 0] - a[..., 2]
        return ((d > 22) | (rb > 10)) & ~((np.abs(rb) < 6) & (d < 48))
    raise ValueError(method)


def clean(m: np.ndarray) -> np.ndarray:
    m = ndi.binary_closing(m, iterations=4)
    m = ndi.binary_fill_holes(m)
    m = ndi.binary_opening(m, iterations=2)
    lab, n = ndi.label(m)
    sizes = ndi.sum(m, lab, range(1, n + 1))
    m = lab == (np.argmax(sizes) + 1)
    return ndi.binary_erosion(m, iterations=1)


def main(src: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for pid, (name, method) in SOURCES.items():
        im = ImageOps.exif_transpose(Image.open(src / name)).convert("RGB")
        if method == "print":
            art = im.crop(PRINT_BOX)
            art.thumbnail((1000, 1000), Image.LANCZOS)
            art.save(OUT / f"{pid}-photo.webp", quality=86)
            art.thumbnail((700, 700), Image.LANCZOS)
            art.save(OUT / f"{pid}-cutout.webp", quality=86)
            print(pid, "print", art.size)
            continue
        photo = im.copy()
        photo.thumbnail((1000, 1000), Image.LANCZOS)
        photo.save(OUT / f"{pid}-photo.webp", quality=84)
        work = im.copy()
        work.thumbnail((1600, 1600), Image.LANCZOS)
        m = clean(mask_for(work, method))
        alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
        cut = work.copy()
        cut.putalpha(alpha)
        cut = cut.crop(alpha.getbbox())
        cut.thumbnail((700, 700), Image.LANCZOS)
        cut.save(OUT / f"{pid}-cutout.webp", quality=88)
        print(pid, method, cut.size)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
