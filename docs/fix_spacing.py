"""Apply DSTU paragraph spacing (1.5 lines, 12pt after) without breaking tables."""
import time
import win32com.client
from pathlib import Path

ROOT = Path(__file__).parent
src = ROOT / "_build_otush.docx"
if not src.exists():
    src = ROOT / "_build_tmp.docx"
if not src.exists():
    src = ROOT.parent / "POYASNLYUVALNA_ZAPYSKA_UA.docx"

out = ROOT.parent / "POYASNLYUVALNA_ZAPYSKA_UA.docx"
desktop = Path.home() / "OneDrive" / "Desktop" / "Timur_Yamchuk.docx"

word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
document = word.Documents.Open(str(src.resolve()))
time.sleep(1)

for i in range(1, document.Paragraphs.Count + 1):
    paragraph = document.Paragraphs(i)
    pf = paragraph.Format
    pf.LineSpacingRule = 1
    pf.SpaceAfter = 12
    pf.SpaceBefore = 0

pages = document.ComputeStatistics(2)
words = document.ComputeStatistics(0)
print(f"Pages: {pages}, Words: {words}")

for target in (out, desktop):
    try:
        document.SaveAs2(str(target.resolve()))
        print(f"Saved: {target}")
    except Exception:
        alt = target.with_name(target.stem + "_35p" + target.suffix)
        document.SaveAs2(str(alt.resolve()))
        print(f"Saved (locked): {alt}")

document.Close(False)
word.Quit()
