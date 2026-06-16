# -*- coding: utf-8 -*-
"""Post-format docx in Word: enforce 1.5 line spacing and count pages."""
import time
import win32com.client
from pathlib import Path

SRC = Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA_build.docx"
OUT = Path(__file__).parent.parent / "POYASNLYUVALNA_ZAPYSKA_UA.docx"
DESKTOP = Path.home() / "OneDrive" / "Desktop" / "Timur_Yamchuk.docx"

wdLineSpaceExactly = 4

word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
doc = word.Documents.Open(str(SRC.resolve()))
time.sleep(2)

# Apply to entire document body
rng = doc.Content
pf = rng.ParagraphFormat
pf.LineSpacingRule = wdLineSpaceExactly
pf.LineSpacing = 21  # 14pt * 1.5
pf.SpaceAfter = 12
pf.FirstLineIndent = 35.43 * 1.25  # cm to points
pf.Alignment = 3  # wdAlignParagraphJustify

# Expand space under figure captions (paragraphs starting with "Рисунок")
for i in range(1, doc.Paragraphs.Count + 1):
    p = doc.Paragraphs(i)
    t = p.Range.Text.strip()
    if t.startswith("Рисунок"):
        p.Range.ParagraphFormat.SpaceAfter = 72  # ~2.5 cm
        # insert blank lines after figure caption
        ins = p.Range
        ins.Collapse(0)  # wdCollapseEnd
        ins.InsertParagraphAfter()
        ins.MoveEnd(1, 1)
        ins.ParagraphFormat.SpaceAfter = 144
        ins.Text = " "

doc.Repaginate()
time.sleep(1)
pages = doc.ComputeStatistics(2)
words = doc.ComputeStatistics(0)
print("After format — Pages:", pages, "Words:", words)

for target in (OUT, DESKTOP, SRC):
    try:
        doc.SaveAs2(str(target.resolve()))
        print("Saved:", target)
    except Exception as e:
        alt = target.with_name(target.stem + "_35p" + target.suffix)
        doc.SaveAs2(str(alt.resolve()))
        print("Saved alt:", alt, e)

doc.Close(False)
word.Quit()
