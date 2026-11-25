from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).parent
FONT = Path(r"C:\Windows\Fonts\consola.ttf")


def render_terminal(source: str, title: str, target: str) -> None:
    lines = (BASE / source).read_text(encoding="utf-8-sig").splitlines()
    font = ImageFont.truetype(str(FONT), 23)
    title_font = ImageFont.truetype(str(FONT), 25)
    wrapped = [part for line in lines for part in (wrap(line, 92) or [""])]
    line_height = 37
    width = 1560
    height = 112 + line_height * len(wrapped) + 50
    image = Image.new("RGB", (width, height), "#f3f5f9")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((28, 24, width - 28, height - 24), 18, fill="#101827")
    draw.rounded_rectangle((28, 24, width - 28, 88), 18, fill="#202b3c")
    draw.rectangle((28, 68, width - 28, 88), fill="#202b3c")
    for x, color in zip((58, 84, 110), ("#ff6b6b", "#f4c95d", "#42d392")):
        draw.ellipse((x, 47, x + 15, 62), fill=color)
    draw.text((145, 42), title, font=title_font, fill="#f3f5f9")
    y = 111
    for line in wrapped:
        color = "#6ee7b7" if line.startswith("HTTP ") else "#d7e0ee"
        draw.text((58, y), line, font=font, fill=color)
        y += line_height
    image.save(BASE / target, optimize=True)


render_terminal("api-terminal.txt", "API - filtros, orden y relaciones", "api-terminal.png")
render_terminal("postgres-terminal.txt", "PostgreSQL - tablas y relaciones", "postgres-terminal.png")
