from docx import Document
from docx.enum.text import WD_LINE_SPACING
from docx.shared import Pt
import zipfile

doc = Document()
p = doc.add_paragraph("Test paragraph with exact spacing.")
pf = p.paragraph_format
pf.line_spacing_rule = WD_LINE_SPACING.EXACTLY
pf.line_spacing = Pt(21)
pf.space_after = Pt(12)
doc.save("_test_spacing.docx")
x = zipfile.ZipFile("_test_spacing.docx").read("word/document.xml").decode()
print(x[x.find("<w:spacing"):x.find("<w:spacing")+120])
