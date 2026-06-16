import time
import win32com.client
from pathlib import Path

p = Path(r"C:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\POYASNLYUVALNA_ZAPYSKA_UA.docx")
word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
doc = word.Documents.Open(str(p.resolve()), ReadOnly=True)
time.sleep(2)
print("Pages:", doc.ComputeStatistics(2))
print("Words:", doc.ComputeStatistics(0))
doc.Close(False)
word.Quit()
