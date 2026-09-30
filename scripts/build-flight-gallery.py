"""Build optimized WebP derivatives for the Aviation interests gallery."""

from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "flight images"
OUTPUT = ROOT / "assets" / "aviation"
MAX_EDGE = 1800

PHOTOS = {
    "Monterrey": ["IMG_0270.HEIC"],
    "San Jose": ["IMG_0261.HEIC", "IMG_0262.HEIC", "IMG_0263.HEIC", "IMG_6222.HEIC", "IMG_9899.HEIC"],
    "Alameda": ["IMG_3389.HEIC", "IMG_3394.HEIC", "IMG_3409.HEIC", "IMG_3416.HEIC", "IMG_3422.HEIC", "IMG_3433.HEIC"],
    "Merced": ["IMG_7745.HEIC", "IMG_7748.HEIC", "IMG_7750.HEIC"],
    "Oakdale": ["IMG_7738.HEIC", "IMG_7741.HEIC", "IMG_7742.HEIC"],
}


def output_name(location: str, filename: str) -> str:
    slug = location.lower().replace(" ", "-")
    return f"{slug}-{Path(filename).stem.lower()}.webp"


def main() -> None:
    register_heif_opener()
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for location, filenames in PHOTOS.items():
        for filename in filenames:
            source = SOURCE / location / filename
            destination = OUTPUT / output_name(location, filename)
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image).convert("RGB")
                image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
                image.save(destination, "WEBP", quality=82, method=6)
            print(f"{source.relative_to(ROOT)} -> {destination.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
