import zipfile
import re
from pathlib import Path

x = zipfile.ZipFile(Path(__file__).parent / "_build_tmp.docx").read("word/document.xml").decode("utf-8", errors="replace")
styles = re.findall(r"w:pStyle w:val=\"([^\"]+)\"", x)
from collections import Counter
print(Counter(styles).most_common(10))
# sample body pPr without pStyle
m = re.search(r"<w:pPr><w:spacing w:lineRule=\"exact\"[^/]*/>[^<]*<w:ind[^>]*709[^>]*>.*?<w:t>[^<]{50,}", x)
print("has long exact para:", bool(m))
