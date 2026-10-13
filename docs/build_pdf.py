import os
import sys

# Delegate to generate_academic_report
from generate_academic_report import generate_pdf

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.abspath(os.path.join(script_dir, ".."))
    md_file = os.path.join(script_dir, "PG_PROJECT_REPORT_PLATO.md")
    
    target_pdfs = [
        os.path.join(base_dir, "project report.pdf"),
        os.path.join(script_dir, "project report.pdf"),
        os.path.join(script_dir, "PG_PROJECT_REPORT_PLATO.pdf"),
    ]
    
    generate_pdf(target_pdfs, md_file)

if __name__ == "__main__":
    main()
