import shutil
import time
import win32com.client
from pathlib import Path

src = Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA_build.docx"
targets = [
    Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA.docx",
    Path(__file__).parent.parent / "POYASNLYUVALNA_ZAPYSKA_UA.docx",
    Path.home() / "OneDrive" / "Desktop" / "Timur_Yamchuk.docx",
]
for t in targets:
    try:
        shutil.copy2(src, t)
        print("Copied ->", t)
    except PermissionError:
        alt = t.with_name(t.stem + "_35p" + t.suffix)
        shutil.copy2(src, alt)
        print("Copied (locked) ->", alt)

word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
doc = word.Documents.Open(str(src.resolve()), ReadOnly=True)
time.sleep(3)
print("Pages:", doc.ComputeStatistics(2))
print("Words:", doc.ComputeStatistics(0))
doc.Close(False)
word.Quit()
