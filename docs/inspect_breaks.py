import re
import zipfile
from pathlib import Path

p = Path(r"C:\Users\yamch\OneDrive\Desktop\Timur_Yamchuk_new.docx")
xml = zipfile.ZipFile(p).read("word/document.xml").decode("utf-8")
manual = len(re.findall(r'<w:br w:type="page"/>', xml))
rendered = xml.count("lastRenderedPageBreak")
print("manual br page:", manual)
print("lastRendered:", rendered)
