import zipfile
from pathlib import Path

x = zipfile.ZipFile(Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA_build.docx").read("word/document.xml").decode("utf-8", errors="replace")
idx = x.find("AuthPage.jsx")
chunk = x[max(0, idx-400):idx+50]
Path(__file__).parent.joinpath("_body_spacing.txt").write_text(chunk, encoding="utf-8")

after240 = x.count('w:after="240"')
exact420 = x.count('w:line="420"')
print("after240:", after240, "exact420:", exact420)
