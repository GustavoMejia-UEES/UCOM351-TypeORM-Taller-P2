from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).parent
FONT = Path(r"C:\Windows\Fonts\consola.ttf")
SESSIONS = {
    "taller-6-sesion-4": "Sesión 4 - relaciones y consultas",
    "taller-7-sesion-5": "Sesión 5 - CRUD, validación y errores",
}


def render(source: Path, target: Path, title: str) -> None:
    lines = source.read_text(encoding="utf-8-sig").splitlines()
    font = ImageFont.truetype(str(FONT), 22)
    title_font = ImageFont.truetype(str(FONT), 24)
    visual_lines = [part for line in lines for part in (wrap(line, 100) or [""])]
    line_height = 35
    width = 1740
    height = 115 + line_height * len(visual_lines) + 48
    image = Image.new("RGB", (width, height), "#f3f5f9")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((24, 22, width - 24, height - 22), 18, fill="#101827")
    draw.rounded_rectangle((24, 22, width - 24, 86), 18, fill="#202b3c")
    draw.rectangle((24, 65, width - 24, 86), fill="#202b3c")
    for x, color in zip((54, 80, 106), ("#ff6b6b", "#f4c95d", "#42d392")):
        draw.ellipse((x, 45, x + 15, 60), fill=color)
    draw.text((140, 40), title, font=title_font, fill="#f3f5f9")
    y = 108
    for line in visual_lines:
        color = "#6ee7b7" if "HTTP 200" in line or "HTTP 201" in line or "HTTP 204" in line else "#d7e0ee"
        draw.text((54, y), line, font=font, fill=color)
        y += line_height
    image = image.quantize(colors=96, method=Image.Quantize.FASTOCTREE)
    image.save(target, optimize=True)


for folder, label in SESSIONS.items():
    session_dir = ROOT / folder
    render(session_dir / "api-terminal.txt", session_dir / "api-terminal.png", f"API - {label}")
    render(session_dir / "postgres-terminal.txt", session_dir / "postgres-terminal.png", f"PostgreSQL - {label}")
