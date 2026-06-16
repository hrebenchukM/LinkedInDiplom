import time
import win32com.client
from pathlib import Path

docx = Path.home() / "OneDrive" / "Desktop" / "Timur_Yamchuk.docx"
word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
doc = word.Documents.Open(str(docx.resolve()), ReadOnly=True)
time.sleep(2)
pages = doc.ComputeStatistics(2)
words = doc.ComputeStatistics(0)
print("Pages:", pages)
print("Words:", words)
doc.Close(False)
word.Quit()
