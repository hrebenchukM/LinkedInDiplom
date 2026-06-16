import time
import zipfile
import win32com.client
from pathlib import Path

docx = Path(r"C:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\docs\POYASNLYUVALNA_ZAPYSKA_UA.docx")
pdf = Path(r"C:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\docs\_pagecount.pdf")

word = win32com.client.DispatchEx("Word.Application")
word.Visible = False
word.DisplayAlerts = 0
doc = word.Documents.Open(str(docx.resolve()))
time.sleep(2)
doc.SaveAs2(str(pdf.resolve()), FileFormat=17)
pages = doc.ComputeStatistics(2)
doc.Close(False)
word.Quit()
print("Word pages:", pages)

from pypdf import PdfReader
print("PDF pages:", len(PdfReader(str(pdf)).pages))

with zipfile.ZipFile(docx) as z:
    xml = z.read("word/document.xml").decode("utf-8", errors="replace")
    # count top-level body children
    body = xml.split("<w:body>")[1].split("</w:body>")[0]
    print("body page br:", body.count('w:type="page"'))
    print("tables in body:", body.count("<w:tbl"))
