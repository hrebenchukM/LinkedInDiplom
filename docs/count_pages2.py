import time
import win32com.client
from pathlib import Path

src = Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA_build.docx"
word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
doc = word.Documents.Open(str(src.resolve()), ReadOnly=True)
time.sleep(2)
# wdStatisticPages=2, wdActiveEndPageNumber=3, wdNumberOfPagesInDocument=4
stat_pages = doc.ComputeStatistics(2)
sel = word.Selection
sel.EndKey(Unit=6)  # wdStory
end_page = sel.Information(3)
print("ComputeStatistics pages:", stat_pages)
print("Selection end page:", end_page)
print("Words:", doc.ComputeStatistics(0))
doc.Close(False)
word.Quit()
