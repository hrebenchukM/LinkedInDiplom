Option Explicit
Dim wordApp, doc, src, dst
src = "c:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\docs\_build_otush.docx"
dst = "c:\Users\yamch\OneDrive\Desktop\LinkedInDiplom-master\Timur_Yamchuk.pdf"

Set wordApp = CreateObject("Word.Application")
wordApp.Visible = False
wordApp.DisplayAlerts = 0

Set doc = wordApp.Documents.Open(src, False, True)
doc.SaveAs dst, 17
doc.Close False
wordApp.Quit

Set doc = Nothing
Set wordApp = Nothing
