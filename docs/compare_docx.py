import zipfile
from pathlib import Path

for name in ["POYASNLYUVALNA_ZAPYSKA_UA.docx", "POYASNLYUVALNA_ZAPYSKA_UA_new.docx", "POYASNLYUVALNA_ZAPYSKA_UA_build.docx"]:
    p = Path(__file__).parent / name
    if not p.exists():
        continue
    x = zipfile.ZipFile(p).read("word/document.xml").decode("utf-8", errors="replace")
    print(name, "exact", x.count('w:lineRule="exact"'), "auto", x.count('w:lineRule="auto"'), "mtime", p.stat().st_mtime)
