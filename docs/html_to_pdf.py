"""Build styled HTML from markdown and print to PDF via Edge/Chrome headless."""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MD = ROOT / "POYASNLYUVALNA_ZAPYSKA_UA.md"
HTML = Path(r"C:\Temp\Timur_Yamchuk.html")
PDF = Path(r"C:\Temp\Timur_Yamchuk.pdf")
OUT1 = ROOT.parent / "Timur_Yamchuk.pdf"
OUT2 = Path.home() / "OneDrive" / "Desktop" / "Timur_Yamchuk.pdf"

CSS = """
@page { size: A4; margin: 20mm 10mm 20mm 25mm; }
body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; color: #000; }
h1, h2, h3 { text-align: center; font-weight: bold; page-break-before: always; margin-top: 0; }
h1:first-of-type, .no-break { page-break-before: auto; }
p { text-align: justify; text-indent: 1.25cm; margin: 0 0 12pt 0; }
.no-indent { text-indent: 0; }
table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 12pt; }
th, td { border: 1px solid #000; padding: 6px; text-align: left; }
th { font-weight: bold; }
.caption { font-weight: normal; text-indent: 0; margin-top: 12pt; }
.title-page { text-align: center; page-break-after: always; min-height: 90vh; display: flex; flex-direction: column; justify-content: space-between; }
.title-block p { text-indent: 0; text-align: center; margin: 0 0 6pt 0; }
.title-bottom { margin-top: auto; }
"""


def md_to_html(text: str) -> str:
    lines = text.splitlines()
    html = ['<!DOCTYPE html><html lang="uk"><head><meta charset="utf-8"><title>Пояснювальна записка</title><style>', CSS, '</style></head><body>']
    i = 0
    in_table = False
    table_rows = []

    def flush_table():
        nonlocal table_rows, in_table
        if not table_rows:
            return
        html.append('<table>')
        for ri, row in enumerate(table_rows):
            tag = 'th' if ri == 0 else 'td'
            html.append('<tr>' + ''.join(f'<{tag}>{c}</{tag}>' for c in row) + '</tr>')
        html.append('</table>')
        table_rows = []
        in_table = False

    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s or s == '---' or s.startswith('<!--'):
            i += 1
            continue
        if s.startswith('|'):
            in_table = True
            if set(s.replace('|', '').replace('-', '').replace(':', '').strip()):
                table_rows.append([c.strip() for c in s.strip('|').split('|')])
            i += 1
            continue
        if in_table:
            flush_table()
        if s.upper() in {'СПИСОК АВТОРІВ', 'РЕФЕРАТ', 'ЗМІСТ', 'СКОРОЧЕННЯ ТА УМОВНІ ПОЗНАЧЕННЯ', 'ВСТУП', 'ВИСНОВКИ ТА РЕКОМЕНДАЦІЇ', 'ПЕРЕЛІК ДЖЕРЕЛ', 'ДОДАТКИ'} or s.upper().startswith('РОЗДІЛ '):
            html.append(f'<h1 class="no-break">{s}</h1>')
        elif re.match(r'^\d+(\.\d+)*\.\s', s):
            html.append(f'<h2>{s}</h2>')
        elif s.startswith('Таблиця ') or s.startswith('Рисунок '):
            html.append(f'<p class="caption no-indent"><b>{s}</b></p>')
            if s.startswith('Рисунок '):
                html.append('<div style="height:8cm;margin:12pt 0;border:1px dashed #999;"></div>')
        elif re.match(r'^\d+\.\s', s) and s.upper() != 'ЗМІСТ':
            html.append(f'<p class="no-indent">{s}</p>')
        else:
            html.append(f'<p>{s}</p>')
        i += 1
    flush_table()
    html.append('</body></html>')
    return '\n'.join(html)


def find_browser():
    candidates = [
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError('Chrome/Edge not found')


def main():
    text = MD.read_text(encoding='utf-8')
    idx = text.upper().find('СПИСОК АВТОРІВ')
    body = text[idx:] if idx >= 0 else text
    title = """<div class="title-page"><div class="title-block">
<p>Приватний заклад вищої освіти</p>
<p>Одеський технологічний університет «ШАГ»</p>
<p>Кафедра інформаційних технологій та фундаментальної підготовки</p>
<p>&nbsp;</p>
<p><b>ПОЯСНЮВАЛЬНА ЗАПИСКА</b></p>
<p>до дипломного проєкту (роботи)</p>
<p><b>«РОЗРОБКА ІНФОРМАЦІЙНО-КОМУНІКАЦІЙНОЇ СИСТЕМИ РЕКРУТИНГОВОГО ПРИЗНАЧЕННЯ»</b></p>
<p>на здобуття бакалаврського ступеня</p>
<p>першого рівня вищої освіти</p>
<p>зі спеціальності «F3 Комп'ютерні науки»</p>
<p>&nbsp;</p>
<p>Виконав:</p>
<p>студент групи КН-П-222</p>
<p>________ Ямчук Тимур Четінович</p>
<p>&nbsp;</p>
<p>Керівник:</p>
<p>к. ф.-м. н., доцент</p>
<p>________ Самойленко Д. М.</p>
</div><div class="title-bottom"><p>Одеса – 2026</p></div></div>"""
    html = md_to_html(body)
    html = html.replace('<body>', '<body>' + title, 1)
    HTML.write_text(html, encoding='utf-8')

    browser = find_browser()
    if PDF.exists():
        PDF.unlink()
    cmd = [
        str(browser),
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        f'--print-to-pdf={PDF}',
        HTML.as_uri(),
    ]
    subprocess.run(cmd, check=True, timeout=120)
    import shutil
    for out in (OUT1, OUT2):
        shutil.copy2(PDF, out)
        print(f'Saved: {out} ({out.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
