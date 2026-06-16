import time
import win32com.client
from pathlib import Path

for p in [
    Path(r"C:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\docs\_build_tmp.docx"),
    Path(r"C:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\POYASNLYUVALNA_ZAPYSKA_UA.docx"),
]:
    if not p.exists():
        continue
    word = win32com.client.DispatchEx("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    doc = word.Documents.Open(str(p.resolve()), ReadOnly=True)
    time.sleep(1)
    pf = doc.Content.ParagraphFormat
    pf.LineSpacingRule = 1  # wdLineSpace1pt5
    pf.LineSpacing = 18
    pf.SpaceAfter = 12
    print(p.name, "->", doc.ComputeStatistics(2), "pages", doc.ComputeStatistics(0), "words")
    doc.Close(False)
    word.Quit()
    break
