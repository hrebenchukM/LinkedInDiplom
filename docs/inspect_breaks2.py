import zipfile
from pathlib import Path

p = Path(r"C:\Users\yamch\OneDrive\Desktop\Timur_Yamchuk_new.docx")
xml = zipfile.ZipFile(p).read("word/document.xml").decode("utf-8")
parts = xml.split('<w:br w:type="page"/>')
print("segments after split:", len(parts))
for i, seg in enumerate(parts[:8]):
    # last paragraph text snippet before break
    texts = [t for t in seg.split("<w:t")[-3:] if ">" in t]
    snippet = seg[-400:].replace("\n", " ")
    print(f"\n--- segment {i} tail ---")
    print(snippet[:350])
