import sys
from pathlib import Path

from reportlab import rl_config
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

rl_config.invariant = 1

ROOT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = Path(__file__).resolve().parent
if str(DOCS_DIR) not in sys.path:
    sys.path.insert(0, str(DOCS_DIR))

from generate_defense_presentation import NAV_ITEMS, SLIDES

OUTPUT_FILE = ROOT_DIR / "presentation.pdf"
FONT_PATH = Path("C:/Windows/Fonts/arial.ttf")
FONT_NAME = "ArialUA"
SLIDE_SIZE = (1280, 720)

BG = (0.03, 0.05, 0.09)
HEADER = (0.05, 0.08, 0.14)
CARD = (0.08, 0.11, 0.18)
CARD_SOFT = (0.12, 0.16, 0.25)
CARD_LIGHT = (0.16, 0.22, 0.34)
BLUE = (0.04, 0.40, 0.76)
PURPLE = (0.58, 0.45, 0.96)
CYAN = (0.22, 0.74, 0.97)
GREEN = (0.20, 0.83, 0.60)
ORANGE = (0.98, 0.57, 0.24)
TEXT = (0.92, 0.95, 0.98)
TEXT_MUTED = (0.58, 0.64, 0.72)
BORDER = (0.22, 0.30, 0.42)


def register_font():
    if not FONT_PATH.exists():
        raise FileNotFoundError(f"Font not found: {FONT_PATH}")
    pdfmetrics.registerFont(TTFont(FONT_NAME, str(FONT_PATH)))


def rgb(pdf, color):
    pdf.setFillColorRGB(*color)


def line_rgb(pdf, color):
    pdf.setStrokeColorRGB(*color)


def rect(pdf, x, y, w, h, color=CARD, radius=12, stroke=False):
    rgb(pdf, color)
    if stroke:
        line_rgb(pdf, BORDER)
    pdf.roundRect(x, y, w, h, radius, stroke=1 if stroke else 0, fill=1)


def text(pdf, value, x, y, size=16, color=TEXT, bold=False):
    rgb(pdf, color)
    pdf.setFont(FONT_NAME, size)
    pdf.drawString(x, y, value)


def centered(pdf, value, x, y, w, size=16, color=TEXT, bold=False):
    rgb(pdf, color)
    pdf.setFont(FONT_NAME, size)
    pdf.drawCentredString(x + w / 2, y, value)


def wrapped(pdf, value, x, y, w, size=15, color=TEXT, line_h=None, max_lines=4):
    if line_h is None:
        line_h = size + 6
    rgb(pdf, color)
    pdf.setFont(FONT_NAME, size)
    lines = simpleSplit(str(value), FONT_NAME, size, w)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(" .,:;") + "..."
    yy = y
    for line in lines:
        pdf.drawString(x, yy, line)
        yy -= line_h
    return yy


def bullets(pdf, items, x, y, w, size=14, gap=52, max_lines=2):
    for i, item in enumerate(items):
        yy = y - i * gap
        rgb(pdf, PURPLE)
        pdf.circle(x, yy + 5, 5, stroke=0, fill=1)
        wrapped(pdf, item, x + 18, yy, w - 18, size=size, max_lines=max_lines)


def base(pdf, idx, total, focus=None, show_nav=True, show_header=True):
    w, h = SLIDE_SIZE
    rgb(pdf, BG)
    pdf.rect(0, 0, w, h, stroke=0, fill=1)
    if show_header:
        rgb(pdf, HEADER)
        pdf.rect(0, h - 52, w, 52, stroke=0, fill=1)
        rgb(pdf, BORDER)
        pdf.rect(0, h - 54, w, 2, stroke=0, fill=1)
        rect(pdf, 55, h - 42, 42, 32, BLUE, radius=6)
        centered(pdf, "in", 55, h - 34, 42, size=18)
        text(pdf, "LinkedIn Clone", 108, h - 32, size=11, color=TEXT)
        if show_nav:
            x = 260
            for key, label in NAV_ITEMS:
                active = key == focus
                rect(pdf, x, h - 40, 158, 24, PURPLE if active else CARD_SOFT, radius=8)
                centered(pdf, label, x, h - 34, 158, size=9, color=BG if active else TEXT_MUTED)
                x += 168
    rgb(pdf, HEADER)
    pdf.rect(0, 0, w, 18, stroke=0, fill=1)
    rgb(pdf, BLUE)
    pdf.rect(0, 0, w * idx / total, 18, stroke=0, fill=1)

    text(pdf, "LinkedIn Diplom", 55, 5, size=8, color=TEXT_MUTED)
    rgb(pdf, TEXT_MUTED)
    pdf.setFont(FONT_NAME, 8)
    pdf.drawRightString(w - 30, 5, f"{idx}/{total}")


def draw_title(pdf, title, subtitle=None):
    wrapped(pdf, title, 70, 625, 1120, size=26, color=TEXT, max_lines=1)
    if subtitle:
        wrapped(pdf, subtitle, 72, 598, 1060, size=12, color=TEXT_MUTED, max_lines=1)


def infer_focus(data):
    focus = data.get("focus")
    if focus:
        return focus
    title = data.get("title", "").lower()
    if "ваканс" in title or "jobs" in title:
        return "vacancies"
    if "чат" in title or "messaging" in title:
        return "chat"
    if "network" in title or "мереж" in title:
        return "network"
    if "profile" in title or "проф" in title:
        return "profile"
    if "frontend" in title or "home" in title:
        return "home"
    return None


def draw_cover(pdf, data, idx, total):
    base(pdf, idx, total, show_nav=False, show_header=False)
    rect(pdf, 75, 485, 105, 78, BLUE, radius=12)
    centered(pdf, "in", 75, 508, 105, size=40)
    wrapped(pdf, data["title"], 220, 520, 900, size=40, max_lines=1)
    wrapped(pdf, data["subtitle"], 225, 475, 860, size=19, color=TEXT_MUTED, max_lines=2)
    rect(pdf, 220, 175, 915, 240, CARD, radius=16)
    bullets(pdf, data["facts"], 258, 370, 825, size=15.5, gap=38, max_lines=1)


def draw_statement(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"])
    wrapped(pdf, data["headline"], 90, 505, 720, size=28, max_lines=3)
    rect(pdf, 885, 385, 260, 145, CARD_SOFT, radius=18)
    centered(pdf, data["metric"], 885, 445, 260, size=66, color=PURPLE)
    wrapped(pdf, data["metric_label"], 925, 410, 190, size=13, color=TEXT, max_lines=2)
    rect(pdf, 90, 205, 750, 185, CARD, radius=16)
    bullets(pdf, data["points"], 125, 345, 675, size=15, gap=46, max_lines=2)


def draw_matrix(pdf, data, idx, total):
    base(pdf, idx, total, infer_focus(data))
    draw_title(pdf, data["title"])
    rect(pdf, 70, 120, 545, 430, CARD, radius=16)
    rect(pdf, 665, 120, 545, 430, CARD, radius=16)
    text(pdf, data.get("left_title", "Факти"), 100, 505, size=16, color=PURPLE)
    text(pdf, data.get("right_title", "Практичні висновки"), 695, 505, size=16, color=PURPLE)
    bullets(pdf, data["left"], 105, 455, 465, size=14, gap=88, max_lines=3)
    bullets(pdf, data["right"], 700, 455, 465, size=14, gap=88, max_lines=3)


def draw_modules(pdf, data, idx, total):
    base(pdf, idx, total, infer_focus(data))
    draw_title(pdf, data["title"], data.get("subtitle"))
    colors = [BLUE, PURPLE, CYAN, GREEN, ORANGE, BLUE, PURPLE, CYAN]
    for i, (name, desc) in enumerate(data["items"]):
        col = i % 4
        row = i // 4
        x = 70 + col * 300
        y = 350 - row * 155
        rect(pdf, x, y, 260, 120, CARD, radius=14)
        rect(pdf, x + 18, y + 78, 50, 26, colors[i % len(colors)], radius=8)
        text(pdf, name, x + 82, y + 84, size=15)
        wrapped(pdf, desc, x + 18, y + 45, 220, size=11, color=TEXT_MUTED, max_lines=2)
    rect(pdf, 120, 75, 1040, 55, CARD_SOFT, radius=12)
    centered(pdf, "Єдина платформа об'єднує роботу, контент, мережу контактів і комунікацію.", 120, 96, 1040, size=14)


def draw_comparison(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"])
    rect(pdf, 70, 120, 545, 430, CARD, radius=16)
    rect(pdf, 665, 120, 545, 430, CARD_SOFT, radius=16)
    text(pdf, data["left_title"], 100, 505, size=18, color=ORANGE)
    text(pdf, data["right_title"], 695, 505, size=18, color=GREEN)
    bullets(pdf, data["left"], 105, 455, 465, size=13, gap=78, max_lines=3)
    bullets(pdf, data["right"], 700, 455, 465, size=13, gap=78, max_lines=3)


def draw_stack(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"], "Стек відповідає реальному коду проєкту та документації")
    for i, (group, items) in enumerate(data["groups"]):
        x = 80 + (i % 2) * 575
        y = 335 - (i // 2) * 210
        rect(pdf, x, y, 520, 170, CARD, radius=16)
        text(pdf, group, x + 25, y + 130, size=18, color=PURPLE)
        for j, item in enumerate(items):
            chip_x = x + 25 + (j % 3) * 155
            chip_y = y + 84 - (j // 3) * 42
            rect(pdf, chip_x, chip_y, 135, 28, CARD_LIGHT, radius=9)
            centered(pdf, item, chip_x, chip_y + 8, 135, size=8.5)


def draw_architecture(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"], "Основний потік запиту від інтерфейсу до бази даних")
    colors = [BLUE, PURPLE, CYAN, GREEN, ORANGE]
    for i, (name, desc) in enumerate(data["steps"]):
        x = 70 + i * 240
        rect(pdf, x, 330, 205, 145, CARD, radius=16)
        centered(pdf, name, x, 420, 205, size=14, color=colors[i])
        wrapped(pdf, desc, x + 18, 385, 170, size=11, max_lines=2)
        if i < len(data["steps"]) - 1:
            text(pdf, "→", x + 214, 388, size=24, color=TEXT_MUTED)
    rect(pdf, 125, 165, 1030, 80, CARD_SOFT, radius=14)
    wrapped(pdf, data["note"], 155, 205, 970, size=14, max_lines=2)


def draw_database(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"], "Логічна ізоляція даних за доменами")
    rect(pdf, 90, 165, 405, 365, CARD, radius=16)
    centered(pdf, "PostgreSQL 16", 90, 475, 405, size=22, color=CYAN)
    for i, schema in enumerate(data["schemas"]):
        x = 125 + (i % 3) * 118
        y = 405 - (i // 3) * 62
        rect(pdf, x, y, 95, 32, CARD_LIGHT, radius=8)
        centered(pdf, schema, x, y + 10, 95, size=8)
    rect(pdf, 555, 165, 635, 365, CARD_SOFT, radius=16)
    bullets(pdf, data["points"], 590, 470, 560, size=14, gap=70, max_lines=3)


def draw_security(pdf, data, idx, total):
    base(pdf, idx, total, infer_focus(data))
    draw_title(pdf, data["title"])
    for i, (name, desc) in enumerate(data["points"]):
        x = 90 + (i % 2) * 565
        y = 350 - (i // 2) * 170
        rect(pdf, x, y, 500, 130, CARD, radius=16)
        rgb(pdf, BLUE if i % 2 == 0 else PURPLE)
        pdf.circle(x + 42, y + 72, 24, stroke=0, fill=1)
        centered(pdf, "✓", x + 18, y + 64, 48, size=18)
        text(pdf, name, x + 88, y + 88, size=16)
        wrapped(pdf, desc, x + 88, y + 55, 365, size=12, color=TEXT_MUTED, max_lines=2)


def draw_frontend(pdf, data, idx, total):
    base(pdf, idx, total, infer_focus(data))
    draw_title(pdf, data["title"], "SPA з guarded routes, state providers, темою та i18n")
    rect(pdf, 80, 110, 1120, 445, CARD, radius=16)
    for i, (route, desc) in enumerate(data["routes"]):
        x = 115 + (i % 3) * 360
        y = 365 - (i // 3) * 170
        rect(pdf, x, y, 300, 120, CARD_SOFT, radius=14)
        text(pdf, route, x + 22, y + 78, size=19, color=PURPLE)
        wrapped(pdf, desc, x + 22, y + 45, 245, size=12, max_lines=2)


def draw_journey(pdf, data, idx, total):
    base(pdf, idx, total, infer_focus(data))
    draw_title(pdf, data["title"], "Демонстраційний шлях користувача на захисті")
    for i, step in enumerate(data["steps"]):
        x = 90 + i * 190
        rgb(pdf, BLUE if i < 3 else PURPLE)
        pdf.circle(x + 42, 400, 42, stroke=0, fill=1)
        centered(pdf, str(i + 1), x, 390, 84, size=22)
        centered(pdf, step, x - 30, 305, 145, size=11)
        if i < len(data["steps"]) - 1:
            text(pdf, "→", x + 105, 392, size=24, color=TEXT_MUTED)
    rect(pdf, 140, 160, 1000, 70, CARD_SOFT, radius=14)
    wrapped(pdf, data["note"], 175, 195, 930, size=14, max_lines=2)


def draw_feature(pdf, data, idx, total):
    base(pdf, idx, total, infer_focus(data))
    draw_title(pdf, data["title"])
    wrapped(pdf, data["headline"], 90, 505, 730, size=23, max_lines=2)
    rect(pdf, 90, 165, 720, 250, CARD, radius=16)
    bullets(pdf, data["points"], 125, 365, 640, size=13, gap=50, max_lines=2)
    rect(pdf, 885, 160, 270, 380, CARD_SOFT, radius=18)
    rect(pdf, 915, 490, 210, 32, CARD_LIGHT, radius=8)
    text(pdf, "UI mockup", 930, 500, size=9, color=TEXT_MUTED)
    for y in [420, 350, 280]:
        rect(pdf, 915, y, 210, 42, CARD_LIGHT, radius=10)
    rect(pdf, 915, 205, 125, 30, BLUE, radius=9)
    centered(pdf, "Action", 915, 214, 125, size=9)


def draw_integration(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"], "Єдиний клієнт API, токени в localStorage, refresh при 401")
    for i, (domain, routes) in enumerate(data["rows"]):
        y = 500 - i * 66
        rect(pdf, 95, y, 190, 38, CARD_LIGHT, radius=10)
        rect(pdf, 320, y - 2, 820, 42, CARD, radius=10)
        centered(pdf, domain, 95, y + 12, 190, size=11)
        wrapped(pdf, routes, 345, y + 12, 760, size=10.5, max_lines=1)


def draw_quality(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"])
    for i, (name, desc) in enumerate(data["items"]):
        x = 85 + (i % 3) * 390
        y = 350 - (i // 3) * 170
        rect(pdf, x, y, 340, 125, CARD, radius=14)
        text(pdf, name, x + 22, y + 82, size=15, color=PURPLE)
        wrapped(pdf, desc, x + 22, y + 48, 290, size=11.5, max_lines=2)


def draw_infrastructure(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"], "Проєкт відтворюється локально та через Docker Compose")
    for i, (name, desc) in enumerate(data["points"]):
        y = 485 - i * 88
        rect(pdf, 110, y, 220, 50, CARD_LIGHT, radius=12)
        rect(pdf, 370, y - 2, 760, 54, CARD, radius=12)
        centered(pdf, name, 110, y + 18, 220, size=12, color=CYAN)
        wrapped(pdf, desc, 395, y + 18, 700, size=12, max_lines=1)


def draw_roadmap(pdf, data, idx, total):
    base(pdf, idx, total)
    draw_title(pdf, data["title"], "Що чесно винесено за межі першої версії")
    for i, (name, desc) in enumerate(data["steps"]):
        x = 90 + i * 226
        rect(pdf, x, 205, 180, 280, CARD, radius=16)
        centered(pdf, str(i + 1), x, 420, 180, size=30, color=PURPLE)
        centered(pdf, name, x, 350, 180, size=13)
        wrapped(pdf, desc, x + 20, 305, 140, size=10.5, color=TEXT_MUTED, max_lines=3)


def draw_final(pdf, data, idx, total):
    base(pdf, idx, total)
    centered(pdf, data["title"], 120, 520, 1040, size=42)
    centered(pdf, "Готовий MVP демонструє інтерфейс, API, дані, безпеку та запуск.", 120, 475, 1040, size=17, color=TEXT_MUTED)
    for i, fact in enumerate(data["facts"]):
        y = 350 - i * 85
        rect(pdf, 160, y, 960, 56, CARD_SOFT, radius=12)
        wrapped(pdf, fact, 190, y + 22, 900, size=13.5, max_lines=1)


def draw_slide(pdf, data, idx, total):
    render = {
        "cover": draw_cover,
        "statement": draw_statement,
        "matrix": draw_matrix,
        "modules": draw_modules,
        "comparison": draw_comparison,
        "stack": draw_stack,
        "architecture": draw_architecture,
        "database": draw_database,
        "security": draw_security,
        "frontend": draw_frontend,
        "journey": draw_journey,
        "feature": draw_feature,
        "integration": draw_integration,
        "quality": draw_quality,
        "infrastructure": draw_infrastructure,
        "roadmap": draw_roadmap,
        "roles": draw_matrix,
        "final": draw_final,
    }
    render[data["type"]](pdf, data, idx, total)


def build_pdf():
    register_font()
    pdf = canvas.Canvas(str(OUTPUT_FILE), pagesize=SLIDE_SIZE)
    total = len(SLIDES)
    for idx, data in enumerate(SLIDES, start=1):
        draw_slide(pdf, data, idx, total)
        pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    build_pdf()
    print(f"PDF saved: {OUTPUT_FILE}")
