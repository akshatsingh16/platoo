import os
import sys
import re
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable, KeepTogether
)
from reportlab.pdfgen import canvas

# Dimensions strictly adhering to departmental guidelines:
# Left margin: 4 cm, Top: 3 cm, Bottom: 3 cm, Right: 2 cm
PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT_MARGIN = 4.0 * cm   # 113.386 pt
RIGHT_MARGIN = 2.0 * cm  # 56.693 pt
TOP_MARGIN = 3.0 * cm    # 85.039 pt
BOTTOM_MARGIN = 3.0 * cm # 85.039 pt
PRINTABLE_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN # ~425.2 pt

def to_roman(num):
    if num <= 0:
        return ''
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syb = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"]
    roman_num = ''
    i = 0
    while num > 0:
        for _ in range(num // val[i]):
            roman_num += syb[i]
            num -= val[i]
        i += 1
    return roman_num

class NumberedCanvas(canvas.Canvas):
    chapter_one_page = 11  # default fallback

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number()
            super().showPage()
        super().save()

    def draw_page_number(self):
        page_num = self._pageNumber
        # Page 1 is Title Page -> No number displayed
        if page_num == 1:
            return
        
        ch1 = NumberedCanvas.chapter_one_page
        if page_num < ch1:
            # Preliminary pages: lowercase Roman numerals (ii, iii, iv, v, vi, vii, viii, ix, x...)
            page_str = to_roman(page_num)
        else:
            # Main content: Arabic numbers starting at 1 on Chapter 1
            page_str = str(page_num - ch1 + 1)

        self.saveState()
        self.setFont("Times-Roman", 11)
        # Bottom margin is 3 cm (~85 pt), placing page number at y = 1.6 cm (~45 pt)
        center_x = LEFT_MARGIN + (PRINTABLE_WIDTH / 2.0)
        self.drawCentredString(center_x, 1.6 * cm, page_str)
        self.restoreState()

class BookmarkFlowable(Flowable):
    def __init__(self, key, registry):
        super().__init__()
        self.key = key
        self.registry = registry
        self.width = 0
        self.height = 0

    def draw(self):
        self.registry[self.key] = self.canv._pageNumber
        if re.match(r'^Chapter\s+1\b\s*[-–—]', self.key) or self.key == "Chapter 1 – Introduction":
            NumberedCanvas.chapter_one_page = self.canv._pageNumber

def clean_inline_formatting(text):
    text = text.replace('&', '&amp;')
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    text = re.sub(r'`(.+?)`', r'<font face="Courier" size="9.5"><b>\1</b></font>', text)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'<u>\1</u>', text)
    text = text.replace('&amp;amp;', '&amp;')
    return text

def create_code_flowable(code_text, styles):
    code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    lines = code_text.split('\n')
    
    CHUNK_SIZE = 15
    chunks = [lines[j:j+CHUNK_SIZE] for j in range(0, len(lines), CHUNK_SIZE)]
    
    table_data = []
    for chunk in chunks:
        formatted = '<br/>'.join([l.replace(' ', '&nbsp;') for l in chunk])
        p = Paragraph(f'<font face="Courier" size="7.5">{formatted}</font>', styles['CodeStyle'])
        table_data.append([p])
        
    t = Table(table_data, colWidths=[PRINTABLE_WIDTH])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t

def create_table_flowable(table_lines, styles):
    if len(table_lines) < 2:
        return None

    raw_rows = []
    for line in table_lines:
        parts = [c.strip() for c in line.strip('|').split('|')]
        if all(re.match(r'^[:\-]+$', p) for p in parts if p):
            continue
        raw_rows.append(parts)

    if not raw_rows:
        return None

    num_cols = max(len(r) for r in raw_rows)
    table_data = []
    for r_idx, row in enumerate(raw_rows):
        normalized = row + [''] * (num_cols - len(row))
        p_row = []
        for c in normalized:
            if r_idx == 0:
                p_row.append(Paragraph(f"<b>{clean_inline_formatting(c)}</b>", styles['TableHeader']))
            else:
                p_row.append(Paragraph(clean_inline_formatting(c), styles['TableCell']))
        table_data.append(p_row)

    col_width = PRINTABLE_WIDTH / float(num_cols)
    col_widths = [col_width] * num_cols

    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t

def add_safe_page_break(flowables):
    if not flowables:
        return
    for elem in reversed(flowables):
        if isinstance(elem, PageBreak):
            return
        if isinstance(elem, (Paragraph, Table)):
            break
    flowables.append(PageBreak())

def parse_markdown(md_path, styles, registry, toc_overrides=None):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    flowables = []
    in_code_block = False
    code_lines = []
    table_lines = []
    in_toc_section = False
    in_lof_section = False
    in_lot_section = False
    in_abstract_section = False
    in_main_chapters = False

    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\r\n')

        # Code block
        if line.startswith('```'):
            if in_code_block:
                code_text = '\n'.join(code_lines)
                flowables.append(create_code_flowable(code_text, styles))
                flowables.append(Spacer(1, 8))
                in_code_block = False
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Table detection
        if line.strip().startswith('|') and line.strip().endswith('|'):
            table_lines.append(line.strip())
            if i + 1 < len(lines) and lines[i+1].strip().startswith('|') and lines[i+1].strip().endswith('|'):
                pass
            else:
                tf = create_table_flowable(table_lines, styles)
                if tf:
                    flowables.append(Spacer(1, 6))
                    flowables.append(tf)
                    flowables.append(Spacer(1, 8))
                table_lines = []
            i += 1
            continue

        # Horizontal rule
        if line.strip() == '---':
            in_toc_section = False
            in_lof_section = False
            in_lot_section = False
            in_abstract_section = False
            add_safe_page_break(flowables)
            i += 1
            continue

        if not line.strip():
            i += 1
            continue

        # If inside preliminary TOC, LOF, or LOT sections:
        if in_toc_section or in_lof_section or in_lot_section:
            if line.startswith('#'):
                in_toc_section = False
                in_lof_section = False
                in_lot_section = False
            else:
                # We skip reading the raw markdown entries inside preliminary listings
                i += 1
                continue

        # Headings
        if line.startswith('# '):
            heading_text = line[2:].strip()
            add_safe_page_break(flowables)
            in_abstract_section = False

            # Title page check
            if heading_text.startswith('PLATO'):
                # Center aligned, properly proportioned Title Page
                flowables.append(Spacer(1, 35))
                flowables.append(Paragraph("A Project Report on", styles['TitleSub']))
                flowables.append(Spacer(1, 15))
                flowables.append(Paragraph("<b>PLATO &mdash; A MULTI-TENANT QR-BASED RESTAURANT MANAGEMENT PLATFORM</b>", styles['TitleMain']))
                flowables.append(Spacer(1, 30))
                flowables.append(Paragraph("Submitted in partial fulfillment of the requirements for the award of the degree of", styles['TitleSub']))
                flowables.append(Spacer(1, 8))
                flowables.append(Paragraph("<b>MASTER OF COMPUTER APPLICATIONS</b>", styles['TitleDegree']))
                flowables.append(Spacer(1, 35))
                flowables.append(Paragraph("Submitted by:<br/><b>STUDENT CANDIDATE TEAM</b>", styles['TitleSub']))
                flowables.append(Spacer(1, 30))
                flowables.append(Paragraph("Under the Guidance of:<br/><b>INTERNAL FACULTY SUPERVISOR</b>", styles['TitleSub']))
                flowables.append(Spacer(1, 35))
                flowables.append(Paragraph("<b>DEPARTMENT OF COMPUTER APPLICATIONS</b>", styles['TitleDept']))
                flowables.append(Paragraph("Academic Year 2026&ndash;2027", styles['TitleSub']))
                i += 1
                while i < len(lines) and lines[i].strip() != '---':
                    i += 1
                continue

            if heading_text.startswith("Chapter 1 –") or heading_text.startswith("Chapter 1 -"):
                in_main_chapters = True

            flowables.append(BookmarkFlowable(heading_text, registry))
            p = Paragraph(clean_inline_formatting(heading_text), styles['CustomH1'])
            flowables.append(p)
            flowables.append(Spacer(1, 10))
            i += 1
            continue

        if line.startswith('## '):
            subheading_text = line[3:].strip()
            if subheading_text in ["Bonafide Certificate", "Declaration", "Acknowledgement", "Abstract", "Table of Contents", "List of Figures", "List of Tables"]:
                add_safe_page_break(flowables)
                flowables.append(BookmarkFlowable(subheading_text, registry))
                p = Paragraph(clean_inline_formatting(subheading_text), styles['PreliminaryH'])
                flowables.append(p)
                flowables.append(Spacer(1, 12))

                if subheading_text == "Abstract":
                    in_abstract_section = True
                elif subheading_text == "Table of Contents":
                    in_toc_section = True
                    in_abstract_section = False
                    if toc_overrides and 'toc_table' in toc_overrides:
                        flowables.append(toc_overrides['toc_table'])
                elif subheading_text == "List of Figures":
                    in_lof_section = True
                    in_abstract_section = False
                    if toc_overrides and 'lof_table' in toc_overrides:
                        flowables.append(toc_overrides['lof_table'])
                elif subheading_text == "List of Tables":
                    in_lot_section = True
                    in_abstract_section = False
                    if toc_overrides and 'lot_table' in toc_overrides:
                        flowables.append(toc_overrides['lot_table'])
            elif subheading_text.startswith("Appendix"):
                add_safe_page_break(flowables)
                in_abstract_section = False
                flowables.append(BookmarkFlowable(subheading_text, registry))
                p = Paragraph(clean_inline_formatting(subheading_text), styles['CustomH2'])
                flowables.append(p)
                flowables.append(Spacer(1, 10))
            else:
                in_abstract_section = False
                flowables.append(BookmarkFlowable(subheading_text, registry))
                p = Paragraph(clean_inline_formatting(subheading_text), styles['CustomH2'])
                flowables.append(Spacer(1, 8))
                flowables.append(p)
                flowables.append(Spacer(1, 6))
            i += 1
            continue

        if line.startswith('### '):
            text = line[4:].strip()
            in_abstract_section = False
            flowables.append(BookmarkFlowable(text, registry))
            p = Paragraph(clean_inline_formatting(text), styles['CustomH3'])
            flowables.append(Spacer(1, 6))
            flowables.append(p)
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        if line.startswith('#### '):
            text = line[5:].strip()
            in_abstract_section = False
            p = Paragraph(clean_inline_formatting(text), styles['CustomH4'])
            flowables.append(Spacer(1, 4))
            flowables.append(p)
            flowables.append(Spacer(1, 3))
            i += 1
            continue

        # Bullet List
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            text = line.strip()[2:].strip()
            if in_main_chapters:
                if re.match(r'^Fig\.\s*\d+\.\d+', text):
                    fig_match = re.match(r'^(Fig\.\s*\d+\.\d+[^:\n]+)', text)
                    if fig_match:
                        flowables.append(BookmarkFlowable(fig_match.group(1).strip(), registry))
                elif re.match(r'^Table\s*\d+\.\d+', text):
                    tbl_match = re.match(r'^(Table\s*\d+\.\d+[^:\n]+)', text)
                    if tbl_match:
                        flowables.append(BookmarkFlowable(tbl_match.group(1).strip(), registry))

            p = Paragraph(f"&bull;&nbsp;&nbsp;{clean_inline_formatting(text)}", styles['CustomBullet'])
            flowables.append(p)
            i += 1
            continue

        # Numbered list
        num_match = re.match(r'^(\d+)\.\s+(.+)$', line.strip())
        if num_match:
            num = num_match.group(1)
            text = num_match.group(2)
            p = Paragraph(f"{num}.&nbsp;&nbsp;{clean_inline_formatting(text)}", styles['CustomBullet'])
            flowables.append(p)
            i += 1
            continue

        # Check for figure/table caption lines
        line_clean = line.strip()
        if in_main_chapters:
            if re.match(r'^Fig\.\s*\d+\.\d+', line_clean):
                fig_match = re.match(r'^(Fig\.\s*\d+\.\d+[^:\n]+)', line_clean)
                if fig_match:
                    flowables.append(BookmarkFlowable(fig_match.group(1).strip(), registry))
            elif re.match(r'^Table\s*\d+\.\d+', line_clean):
                tbl_match = re.match(r'^(Table\s*\d+\.\d+[^:\n]+)', line_clean)
                if tbl_match:
                    flowables.append(BookmarkFlowable(tbl_match.group(1).strip(), registry))

        # Check for Bonafide certificate signature block
        if "Internal Guide" in line and "Head of the Department" in line:
            sig_table = Table([
                [
                    Paragraph("<b>Internal Guide</b><br/><font size='9'>Project Supervisor</font>", styles['SigBlockLeft']),
                    Paragraph("<b>Head of the Department</b><br/><font size='9'>Department of Computer Applications</font>", styles['SigBlockRight'])
                ],
                [
                    Paragraph("<br/><br/>Viva-Voce Examination held on: _____________________", styles['SigBlockLeft']),
                    Paragraph("", styles['SigBlockRight'])
                ],
                [
                    Paragraph("<br/><b>Internal Examiner</b>", styles['SigBlockLeft']),
                    Paragraph("<br/><b>External Examiner</b>", styles['SigBlockRight'])
                ]
            ], colWidths=[PRINTABLE_WIDTH * 0.55, PRINTABLE_WIDTH * 0.45])
            sig_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 14),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            flowables.append(Spacer(1, 25))
            flowables.append(sig_table)
            i += 1
            while i < len(lines) and lines[i].strip() != '---':
                i += 1
            continue

        # Regular paragraph
        if in_abstract_section:
            p = Paragraph(clean_inline_formatting(line), styles['AbstractBody'])
            flowables.append(p)
            flowables.append(Spacer(1, 4))
        else:
            p = Paragraph(clean_inline_formatting(line), styles['CustomBody'])
            flowables.append(p)
            flowables.append(Spacer(1, 5))
        i += 1

    return flowables

def build_toc_tables(registry, ch1_page, styles):
    def fmt_page(page):
        if not page:
            return ""
        if page < ch1_page:
            return to_roman(page)
        return str(page - ch1_page + 1)

    # 1. Table of Contents Items
    toc_data = []
    prelims = [
        ("Bonafide Certificate", "ii"),
        ("Declaration", "iii"),
        ("Acknowledgement", "iv"),
        ("Abstract", "v"),
        ("Table of Contents", "vi"),
        ("List of Figures", fmt_page(registry.get("List of Figures")) or "ix"),
        ("List of Tables", fmt_page(registry.get("List of Tables")) or "x"),
    ]
    for title, page_str in prelims:
        p_title = Paragraph(f"<b>{title}</b>", styles['TOCItemBold'])
        p_page = Paragraph(f"<b>{page_str}</b>", styles['TOCPageBold'])
        toc_data.append([p_title, p_page])

    for key in registry:
        if key.startswith("Chapter "):
            p_num = registry.get(key)
            p_str = fmt_page(p_num)
            p_title = Paragraph(f"<b>{key}</b>", styles['TOCItemBold'])
            p_page = Paragraph(f"<b>{p_str}</b>", styles['TOCPageBold'])
            toc_data.append([p_title, p_page])
        elif re.match(r'^\d+\.\d+\s+', key):
            p_num = registry.get(key)
            p_str = fmt_page(p_num)
            p_title = Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;{key}", styles['TOCItemRegular'])
            p_page = Paragraph(p_str, styles['TOCPageRegular'])
            toc_data.append([p_title, p_page])
        elif re.match(r'^\d+\.\d+\.\d+\s+', key):
            p_num = registry.get(key)
            p_str = fmt_page(p_num)
            p_title = Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{key}", styles['TOCItemSub'])
            p_page = Paragraph(p_str, styles['TOCPageRegular'])
            toc_data.append([p_title, p_page])
        elif key.startswith("Appendix "):
            p_num = registry.get(key)
            p_str = fmt_page(p_num)
            p_title = Paragraph(f"<b>{key}</b>", styles['TOCItemBold'])
            p_page = Paragraph(f"<b>{p_str}</b>", styles['TOCPageBold'])
            toc_data.append([p_title, p_page])

    toc_table = Table(toc_data, colWidths=[PRINTABLE_WIDTH - 45, 45])
    toc_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.25, HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))

    # 2. List of Figures Items
    lof_data = []
    seen_figs = set()
    for key in registry:
        if re.match(r'^Fig\.\s*\d+\.\d+', key):
            clean_key = re.sub(r'\s+', ' ', key).strip()
            if clean_key in seen_figs:
                continue
            seen_figs.add(clean_key)
            p_num = registry.get(key)
            p_str = fmt_page(p_num)
            p_title = Paragraph(clean_key, styles['TOCItemRegular'])
            p_page = Paragraph(p_str, styles['TOCPageRegular'])
            lof_data.append([p_title, p_page])

    lof_table = Table(lof_data, colWidths=[PRINTABLE_WIDTH - 45, 45]) if lof_data else None
    if lof_table:
        lof_table.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 0.25, HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))

    # 3. List of Tables Items
    lot_data = []
    seen_tbls = set()
    for key in registry:
        if re.match(r'^Table\s*\d+\.\d+', key):
            clean_key = re.sub(r'\s+', ' ', key).strip()
            if clean_key in seen_tbls:
                continue
            seen_tbls.add(clean_key)
            p_num = registry.get(key)
            p_str = fmt_page(p_num)
            p_title = Paragraph(clean_key, styles['TOCItemRegular'])
            p_page = Paragraph(p_str, styles['TOCPageRegular'])
            lot_data.append([p_title, p_page])

    lot_table = Table(lot_data, colWidths=[PRINTABLE_WIDTH - 45, 45]) if lot_data else None
    if lot_table:
        lot_table.setStyle(TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 0.25, HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))

    return {
        'toc_table': toc_table,
        'lof_table': lof_table,
        'lot_table': lot_table
    }

def get_report_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='TitleMain',
        fontName='Times-Bold',
        fontSize=18,
        leading=24,
        alignment=1,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TitleDegree',
        fontName='Times-Bold',
        fontSize=14,
        leading=20,
        alignment=1,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TitleDept',
        fontName='Times-Bold',
        fontSize=13,
        leading=18,
        alignment=1,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TitleSub',
        fontName='Times-Roman',
        fontSize=12,
        leading=17,
        alignment=1,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='PreliminaryH',
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        alignment=1,
        spaceAfter=14,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CustomH1',
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CustomH2',
        fontName='Times-Bold',
        fontSize=13,
        leading=17,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CustomH3',
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CustomH4',
        fontName='Times-Bold',
        fontSize=12,
        leading=16,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CustomBody',
        fontName='Times-Roman',
        fontSize=12,
        leading=18,
        firstLineIndent=25,
        alignment=4,
        spaceAfter=4,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='AbstractBody',
        fontName='Times-Roman',
        fontSize=11.5,
        leading=16.5,
        firstLineIndent=25,
        alignment=4,
        spaceAfter=5,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CustomBullet',
        fontName='Times-Roman',
        fontSize=12,
        leading=17,
        leftIndent=20,
        spaceAfter=3,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Times-Bold',
        fontSize=8.5,
        leading=11,
        alignment=0,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Times-Roman',
        fontSize=8.5,
        leading=11,
        alignment=0,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='CodeStyle',
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=HexColor('#0F172A')
    ))

    styles.add(ParagraphStyle(
        name='TOCItemBold',
        fontName='Times-Bold',
        fontSize=10.5,
        leading=14,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TOCItemRegular',
        fontName='Times-Roman',
        fontSize=10,
        leading=13.5,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TOCItemSub',
        fontName='Times-Roman',
        fontSize=9.5,
        leading=13,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TOCPageBold',
        fontName='Times-Bold',
        fontSize=10.5,
        leading=14,
        alignment=2,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='TOCPageRegular',
        fontName='Times-Roman',
        fontSize=10,
        leading=13.5,
        alignment=2,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='SigBlockLeft',
        fontName='Times-Roman',
        fontSize=11,
        leading=15,
        alignment=0,
        textColor=black
    ))

    styles.add(ParagraphStyle(
        name='SigBlockRight',
        fontName='Times-Roman',
        fontSize=11,
        leading=15,
        alignment=2,
        textColor=black
    ))

    return styles

def generate_pdf(output_paths, md_path):
    styles = get_report_styles()
    primary_pdf = output_paths[0]

    # PASS 1: Base scan
    print("=== PASS 1: Analyzing document structure and section page mapping ===")
    registry_p1 = {}
    NumberedCanvas.chapter_one_page = 11
    flowables_p1 = parse_markdown(md_path, styles, registry_p1)

    temp_doc1 = SimpleDocTemplate(
        "temp_pass1.pdf",
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )
    temp_doc1.build(flowables_p1, canvasmaker=NumberedCanvas)
    ch1_p1 = NumberedCanvas.chapter_one_page
    print(f"Pass 1 complete. Initial Chapter 1 physical page: {ch1_p1}")

    # PASS 2: First iteration of TOC tables
    print("\n=== PASS 2: Formatting dynamic TOC/LOF/LOT tables ===")
    toc_tables_p2 = build_toc_tables(registry_p1, ch1_p1, styles)
    registry_p2 = {}
    NumberedCanvas.chapter_one_page = ch1_p1
    flowables_p2 = parse_markdown(md_path, styles, registry_p2, toc_overrides=toc_tables_p2)

    temp_doc2 = SimpleDocTemplate(
        "temp_pass2.pdf",
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )
    temp_doc2.build(flowables_p2, canvasmaker=NumberedCanvas)
    ch1_p2 = NumberedCanvas.chapter_one_page
    print(f"Pass 2 complete. Converged Chapter 1 physical page: {ch1_p2}")

    # PASS 3: Final exact pagination build
    print("\n=== PASS 3: Compiling final converged publication-grade report ===")
    toc_tables_p3 = build_toc_tables(registry_p2, ch1_p2, styles)
    registry_final = {}
    NumberedCanvas.chapter_one_page = ch1_p2
    flowables_final = parse_markdown(md_path, styles, registry_final, toc_overrides=toc_tables_p3)

    doc = SimpleDocTemplate(
        primary_pdf,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )
    doc.build(flowables_final, canvasmaker=NumberedCanvas)

    # Clean up temp files
    for tmp in ["temp_pass1.pdf", "temp_pass2.pdf"]:
        if os.path.exists(tmp):
            os.remove(tmp)

    # Copy to all requested destinations
    for out_path in output_paths[1:]:
        shutil.copyfile(primary_pdf, out_path)
        print(f"Copied report to: {out_path}")

    # Verify total page count
    with open(primary_pdf, 'rb') as f:
        pdf_data = f.read()
    total_pages = len(re.findall(rb'/Type\s*/Page\b', pdf_data))
    print(f"\nFinal PDF generated successfully!")
    print(f"File: {primary_pdf}")
    print(f"Total Pages: {total_pages} (Department requirement: Minimum 60 pages)")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    md_file = os.path.join(base_dir, "docs", "PG_PROJECT_REPORT_PLATO.md")
    
    target_pdfs = [
        os.path.join(base_dir, "project report.pdf"),
        os.path.join(base_dir, "docs", "project report.pdf"),
        os.path.join(base_dir, "docs", "PG_PROJECT_REPORT_PLATO.pdf"),
    ]
    
    generate_pdf(target_pdfs, md_file)
