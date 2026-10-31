import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

# Page geometry
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 54  # 0.75 in = 54 pt

# Primary Color Palette
C_WHITE = colors.HexColor("#FFFFFF")
C_BRIGHT_GREEN = colors.HexColor("#22C55E")
C_PRIMARY_GREEN = colors.HexColor("#16A34A")
C_DARK_GREEN = colors.HexColor("#15803D")
C_DARK_TEXT = colors.HexColor("#0F172A")
C_SECONDARY_TEXT = colors.HexColor("#475569")
C_LIGHT_BG = colors.HexColor("#F0FDF4")
C_BORDER = colors.HexColor("#E2E8F0")
C_CARD_BG = colors.HexColor("#F8FAFC")
C_AMBER = colors.HexColor("#D97706")
C_RED = colors.HexColor("#DC2626")


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute total page count and add headers/footers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        # Skip header and footer on cover page (page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(C_SECONDARY_TEXT)

        # Header (Top)
        header_y = PAGE_HEIGHT - 36
        self.drawString(
            MARGIN,
            header_y,
            "AccessLoop – Smart, Trusted & Fair Resource Sharing Platform",
        )
        self.drawRightString(
            PAGE_WIDTH - MARGIN, header_y, "Official Project Documentation"
        )

        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.6)
        self.line(MARGIN, header_y - 6, PAGE_WIDTH - MARGIN, header_y - 6)

        # Footer (Bottom)
        footer_y = 36
        self.line(MARGIN, footer_y + 12, PAGE_WIDTH - MARGIN, footer_y + 12)

        self.drawString(
            MARGIN, footer_y, "Hackathon Technical Report & Implementation Audit"
        )
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(PAGE_WIDTH - MARGIN, footer_y, page_str)

        self.restoreState()


print("NumberedCanvas class ready.")
