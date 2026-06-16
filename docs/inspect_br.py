import zipfile
from pathlib import Path

x = zipfile.ZipFile(Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA_build.docx").read("word/document.xml").decode("utf-8", errors="replace")
parts = x.split('w:type="page"')
for i, p in enumerate(parts[1:4], 1):
    print(f"\n=== break {i} before ===")
    print(p[:200].replace("\n", " "))
