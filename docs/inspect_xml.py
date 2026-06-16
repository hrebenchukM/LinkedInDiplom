import zipfile
from pathlib import Path

docx = Path(r"C:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\docs\POYASNLYUVALNA_ZAPYSKA_UA.docx")
with zipfile.ZipFile(docx) as z:
    xml = z.read("word/document.xml").decode("utf-8", errors="replace")

# find first long body paragraph spacing
idx = xml.find("предметної області")
if idx > 0:
    chunk = xml[idx-500:idx+200]
    print(chunk)

# count spacing patterns
for pat in ['w:line="360"', 'w:line="240"', 'w:lineRule="auto"', 'w:lineRule="exact"']:
    print(pat, xml.count(pat))
