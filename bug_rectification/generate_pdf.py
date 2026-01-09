
from fpdf import FPDF
import sys
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Bug Fix Verification Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_pdf(markdown_file, output_pdf):
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    try:
        with open(markdown_file, 'r') as f:
            for line in f:
                # Basic Markdown parsing
                if line.startswith('# '):
                   pdf.set_font("Arial", 'B', 16)
                   pdf.cell(0, 10, line.replace('# ', '').strip(), 0, 1)
                   pdf.set_font("Arial", size=11)
                elif line.startswith('## '):
                   pdf.set_font("Arial", 'B', 14)
                   pdf.cell(0, 10, line.replace('## ', '').strip(), 0, 1)
                   pdf.set_font("Arial", size=11)
                elif line.startswith('### '):
                   pdf.set_font("Arial", 'B', 12)
                   pdf.cell(0, 10, line.replace('### ', '').strip(), 0, 1)
                   pdf.set_font("Arial", size=11)
                elif line.startswith('```'):
                   continue # Skip code fences for simplicity
                else:
                   pdf.multi_cell(0, 5, line.strip())
                   pdf.ln(1)
                   
        pdf.output(output_pdf)
        print(f"PDF Generated: {output_pdf}")
    except Exception as e:
        print(f"Failed to generate PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_pdf.py <input.md> <output.pdf>")
    else:
        create_pdf(sys.argv[1], sys.argv[2])
