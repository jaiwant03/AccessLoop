import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
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

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 46
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN  # ~503 pt

# AccessLoop Colors
C_WHITE = colors.HexColor("#FFFFFF")
C_BRIGHT_GREEN = colors.HexColor("#22C55E")
C_PRIMARY_GREEN = colors.HexColor("#16A34A")
C_DARK_GREEN = colors.HexColor("#15803D")
C_LIGHT_GREEN = colors.HexColor("#F0FDF4")
C_LIGHT_GREEN_BORDER = colors.HexColor("#DCFCE7")
C_DARK_TEXT = colors.HexColor("#0F172A")
C_SECONDARY_TEXT = colors.HexColor("#334155")
C_MUTED_TEXT = colors.HexColor("#64748B")
C_BORDER = colors.HexColor("#CBD5E1")
C_CARD_BG = colors.HexColor("#F8FAFC")
C_AMBER = colors.HexColor("#D97706")
C_AMBER_BG = colors.HexColor("#FEF3C7")
C_RED = colors.HexColor("#DC2626")
C_RED_BG = colors.HexColor("#FEE2E2")
C_BLUE = colors.HexColor("#2563EB")
C_BLUE_BG = colors.HexColor("#DBEAFE")


class NumberedCanvas(canvas.Canvas):
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
        if self._pageNumber == 1:
            return  # Suppress on cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(C_PRIMARY_GREEN)

        header_y = PAGE_HEIGHT - 28
        self.drawString(MARGIN, header_y, "ACCESSLOOP")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(C_MUTED_TEXT)
        self.drawString(MARGIN + 62, header_y, "|   Smart, Trusted & Fair Resource Sharing Platform")
        self.drawRightString(PAGE_WIDTH - MARGIN, header_y, "Official Hackathon Documentation")

        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.5)
        self.line(MARGIN, header_y - 5, PAGE_WIDTH - MARGIN, header_y - 5)

        footer_y = 26
        self.line(MARGIN, footer_y + 10, PAGE_WIDTH - MARGIN, footer_y + 10)
        self.drawString(MARGIN, footer_y, "Solo Developer Project • Academic & Technical Implementation Audit")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(PAGE_WIDTH - MARGIN, footer_y, page_str)

        self.restoreState()


def get_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles["CoverBadge"] = ParagraphStyle(
        "CoverBadge",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        textColor=C_PRIMARY_GREEN,
        alignment=0,
    )
    styles["CoverTitle"] = ParagraphStyle(
        "CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=C_DARK_TEXT,
        alignment=0,
    )
    styles["CoverSubtitle"] = ParagraphStyle(
        "CoverSubtitle",
        fontName="Helvetica-Bold",
        fontSize=13.5,
        leading=18,
        textColor=C_PRIMARY_GREEN,
        alignment=0,
    )
    styles["CoverTagline"] = ParagraphStyle(
        "CoverTagline",
        fontName="Helvetica-Oblique",
        fontSize=11,
        leading=15,
        textColor=C_DARK_GREEN,
        alignment=0,
    )
    styles["CoverMetaLabel"] = ParagraphStyle(
        "CoverMetaLabel",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=C_MUTED_TEXT,
    )
    styles["CoverMetaVal"] = ParagraphStyle(
        "CoverMetaVal",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=C_DARK_TEXT,
    )

    styles["H1"] = ParagraphStyle(
        "H1",
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=C_DARK_GREEN,
        spaceBefore=14,
        spaceAfter=7,
        keepWithNext=True,
    )
    styles["H2"] = ParagraphStyle(
        "H2",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=C_DARK_TEXT,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True,
    )
    styles["H3"] = ParagraphStyle(
        "H3",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=C_PRIMARY_GREEN,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True,
    )
    styles["Body"] = ParagraphStyle(
        "Body",
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=C_DARK_TEXT,
        spaceAfter=5,
    )
    styles["BodySecondary"] = ParagraphStyle(
        "BodySecondary",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=C_SECONDARY_TEXT,
        spaceAfter=4,
    )
    styles["Bullet"] = ParagraphStyle(
        "Bullet",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=C_DARK_TEXT,
        leftIndent=12,
        spaceAfter=3,
    )
    styles["Callout"] = ParagraphStyle(
        "Callout",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=C_DARK_TEXT,
    )
    styles["TableHead"] = ParagraphStyle(
        "TableHead",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=C_WHITE,
        alignment=0,
    )
    styles["TableCell"] = ParagraphStyle(
        "TableCell",
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=C_DARK_TEXT,
        alignment=0,
    )
    styles["TableCellBold"] = ParagraphStyle(
        "TableCellBold",
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=10,
        textColor=C_DARK_TEXT,
        alignment=0,
    )
    styles["TableCellCenter"] = ParagraphStyle(
        "TableCellCenter",
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=C_DARK_TEXT,
        alignment=1,
    )
    styles["Code"] = ParagraphStyle(
        "Code",
        fontName="Courier",
        fontSize=7.5,
        leading=9.5,
        textColor=C_DARK_TEXT,
    )
    styles["TOCItem"] = ParagraphStyle(
        "TOCItem",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=C_DARK_TEXT,
    )
    styles["TOCPage"] = ParagraphStyle(
        "TOCPage",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=C_PRIMARY_GREEN,
        alignment=2,
    )
    return styles


def make_callout(text, styles, bg_color=C_LIGHT_GREEN, border_color=C_BRIGHT_GREEN):
    p = Paragraph(text, styles["Callout"])
    t = Table([[p]], colWidths=[CONTENT_WIDTH])
    t.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg_color),
            ("BOX", (0, 0), (-1, -1), 1.2, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    return t


def build_pdf(filename="AccessLoop_Project_Documentation.pdf"):
    styles = get_styles()
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 15))

    # Top brand bar
    top_badge_table = Table(
        [[
            Paragraph("●  OFFICIAL HACKATHON PROJECT DOCUMENTATION & TECHNICAL REPORT", styles["CoverBadge"]),
            Paragraph("VERSION 1.0  •  OCT 2026", styles["TOCPage"]),
        ]],
        colWidths=[CONTENT_WIDTH * 0.75, CONTENT_WIDTH * 0.25],
    )
    top_badge_table.setStyle(
        TableStyle([
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LINEBELOW", (0, 0), (-1, -1), 1, C_PRIMARY_GREEN),
        ])
    )
    story.append(top_badge_table)
    story.append(Spacer(1, 28))

    # Title & Tagline Box
    story.append(Paragraph("AccessLoop", styles["CoverTitle"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Smart, Trusted and Fair Resource Sharing Platform", styles["CoverSubtitle"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("“Share More. Waste Less.”", styles["CoverTagline"]))
    story.append(Spacer(1, 14))

    # Problem Statement Callout on Cover
    ps_html = (
        "<b>OFFICIAL PROBLEM STATEMENT:</b><br/>"
        "<i>“Unlock Underused Equipment and Spaces”</i> — Transforming idle campus laboratories, "
        "specialised fabrication machinery, cinematography rigs, and testing equipment into a secure, "
        "accountable, and equitable shared campus economy."
    )
    story.append(make_callout(ps_html, styles, C_LIGHT_GREEN, C_PRIMARY_GREEN))
    story.append(Spacer(1, 32))

    # Executive Summary Card on Cover
    exec_summary_html = (
        "<b>EXECUTIVE OVERVIEW:</b><br/>"
        "AccessLoop is an end-to-end full-stack platform designed to eliminate departmental hardware silos "
        "in academic and research institutions. By integrating automated qualification gating, two-way photo-verified "
        "equipment handover, an algorithmic fair allocation queue, and immutable MongoDB audit logging, the platform "
        "guarantees complete custodian trust and democratic student access."
    )
    story.append(make_callout(exec_summary_html, styles, C_CARD_BG, C_BORDER))
    story.append(Spacer(1, 40))

    # Solo Participant Meta Table
    meta_data = [
        [
            Paragraph("SOLO PARTICIPANT / LEAD DEVELOPER", styles["CoverMetaLabel"]),
            Paragraph("PROJECT REPOSITORY & HOSTING", styles["CoverMetaLabel"]),
        ],
        [
            Paragraph("<b>Jaiwant Karrun S.A.</b><br/>Team Leader & Sole Full-Stack Developer", styles["CoverMetaVal"]),
            Paragraph("<b>GitHub:</b> github.com/jaiwant03/AccessLoop<br/><b>Frontend:</b> Vercel | <b>Backend:</b> Render", styles["CoverMetaVal"]),
        ],
        [
            Paragraph("INSTITUTIONAL AFFILIATION", styles["CoverMetaLabel"]),
            Paragraph("DATE OF SUBMISSION & AUDIT", styles["CoverMetaLabel"]),
        ],
        [
            Paragraph("Apex Institute of Technology & Science<br/><i>[ENTER YOUR INSTITUTION NAME]</i>", styles["CoverMetaVal"]),
            Paragraph("October 31, 2026<br/>Production Deployment Audit", styles["CoverMetaVal"]),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[CONTENT_WIDTH * 0.52, CONTENT_WIDTH * 0.48])
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), C_CARD_BG),
            ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ])
    )
    story.append(meta_table)

    story.append(PageBreak())

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    story.append(Paragraph("Table of Contents", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=12))

    toc_entries = [
        ("1. Project Abstract", "3"),
        ("2. Problem Understanding & Analysis", "3"),
        ("3. Target Users & Stakeholder Matrix", "4"),
        ("4. Proposed Solution & Core Innovation", "4"),
        ("5. Complete Product Lifecycle Workflow", "5"),
        ("6. Implementation Status & Feature Audit", "6"),
        ("7. Technology Stack Specifications", "7"),
        ("8. System Architecture & Network Topology", "7"),
        ("9. Database Design & Mongoose Schemas", "8"),
        ("10. User Role Modules & Functional Breakdown", "9"),
        ("11. AI and Intelligent Capabilities", "9"),
        ("12. Comprehensive Quality Assurance & Test Case Matrix", "10"),
        ("13. Security, Privacy & Fairness Architecture", "11"),
        ("14. Operational Limitations & Known Constraints", "11"),
        ("15. Future Scope & Roadmap", "11"),
        ("16. Team Composition & Individual Contributions (Solo Project)", "12"),
        ("17. Detailed Individual Contributions (21 Domains)", "12"),
        ("18. Deployment & Execution Guide", "13"),
        ("19. Conclusion & Impact", "13"),
        ("20. References & Acknowledgements", "13"),
    ]

    toc_rows = []
    for title, pg in toc_entries:
        toc_rows.append([
            Paragraph(title, styles["TOCItem"]),
            Paragraph(f". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .", styles["BodySecondary"]),
            Paragraph(pg, styles["TOCPage"]),
        ])

    toc_table = Table(toc_rows, colWidths=[CONTENT_WIDTH * 0.48, CONTENT_WIDTH * 0.44, CONTENT_WIDTH * 0.08])
    toc_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ])
    )
    story.append(toc_table)
    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: PROJECT ABSTRACT
    # =========================================================================
    story.append(Paragraph("1. Project Abstract", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Across modern educational, scientific, and maker ecosystems, academic institutions invest crores of rupees in "
        "sophisticated hardware—such as 4K cinematography rigs, high-precision stereolithography 3D printers, laser cutters, "
        "oscilloscopes, and specialized research laboratories. However, research demonstrates that between <b>60% and 80% "
        "of this high-value inventory remains locked in departmental silos</b>, severely underutilized outside of scheduled "
        "curriculum sessions. Simultaneously, motivated students, capstone researchers, and cross-departmental innovators face "
        "severe access deficits, often resorting to expensive private equipment rentals or compromising the quality of their projects.",
        styles["Body"]
    ))
    story.append(Paragraph(
        "<b>AccessLoop</b> resolves this systemic dilemma by establishing a smart, trusted, and fair campus resource-sharing "
        "ecosystem. The platform bridges verified resource custodians (faculty, lab managers, and workshop leads) with eligible "
        "borrowers through five core innovations: (1) real-time searchable inventory discovery across campus; (2) automated safety "
        "prerequisite and institutional qualification validation; (3) mandatory two-way photographic condition verification during "
        "physical handover and return; (4) a transparent, algorithmic Fair Allocation Engine that prevents asset monopolization; "
        "and (5) an immutable audit log coupled with an in-app incident mediation center. By replacing error-prone paper logbooks "
        "with an accountable digital infrastructure, AccessLoop maximizes asset ROI, reduces duplicate institutional spending, "
        "and fosters interdisciplinary innovation.",
        styles["Body"]
    ))

    # =========================================================================
    # SECTION 2: PROBLEM UNDERSTANDING & ANALYSIS
    # =========================================================================
    story.append(Spacer(1, 6))
    story.append(Paragraph("2. Problem Understanding & Analysis", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "The hackathon problem statement, <i>“Unlock Underused Equipment and Spaces,”</i> addresses a persistent structural "
        "inefficiency in campus resource management. Analysis of current institutional operations reveals seven critical failure points:",
        styles["Body"]
    ))

    problems = [
        ("1. Chronic Underutilisation & Hardware Wastage: ", "Valuable assets lie idle for months while identical devices are purchased redundantly by neighboring departments due to zero campus-wide inventory visibility."),
        ("2. Prohibitive Financial Barriers for Students: ", "Individual students cannot afford commercial-grade tools (cameras, spectrometers, robotic dev-kits), directly limiting project quality and student career competitiveness."),
        ("3. The 'Fear of Damage' Trust Deficit: ", "Faculty custodians resist sharing lab equipment because paper sign-out sheets offer no protection against unverified damage, missing accessories, or disputed liability."),
        ("4. Absence of Safety & Qualification Verification: ", "Standard calendars lack prerequisite gates. Handing hazardous machinery (lasers, high-voltage benches) to untrained students creates severe liability and injury risks."),
        ("5. Monopolisation & Unfair Allocation: ", "Without algorithmic quotas, well-connected student groups routinely hoard high-demand equipment, leaving newer scholars without access."),
        ("6. Broken Handover & Accountability Chain: ", "Traditional systems fail to capture before-and-after physical condition, rendering damage disputes unresolvable."),
        ("7. Lack of Verifiable Audit Trails: ", "Department deans and institutional auditors possess zero empirical data on asset utilization, depreciation, or lost-cost recovery."),
    ]
    for p_title, p_desc in problems:
        story.append(Paragraph(f"• <b>{p_title}</b>{p_desc}", styles["Bullet"]))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: TARGET USERS & STAKEHOLDER MATRIX
    # =========================================================================
    story.append(Paragraph("3. Target Users & Stakeholder Matrix", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "AccessLoop coordinates four distinct institutional roles, each with specialized workflows and security boundaries:",
        styles["Body"]
    ))

    stakeholder_rows = [
        [
            Paragraph("USER ROLE", styles["TableHead"]),
            Paragraph("CORE RESPONSIBILITIES", styles["TableHead"]),
            Paragraph("KEY CHALLENGES ADDRESSED", styles["TableHead"]),
            Paragraph("PRIMARY PLATFORM INTERACTIONS", styles["TableHead"]),
        ],
        [
            Paragraph("<b>Borrower</b><br/>(Student / Scholar)", styles["TableCellBold"]),
            Paragraph("• Academic project execution<br/>• Timely equipment collection & return<br/>• Safe usage compliance", styles["TableCell"]),
            Paragraph("• Lack of affordable tool access<br/>• Opaque reservation procedures<br/>• Unfair blame for pre-existing damage", styles["TableCell"]),
            Paragraph("• Real-time search & filtering<br/>• Automated eligibility pre-checks<br/>• Check-in/out photo uploads<br/>• Transparent queue position", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Resource Owner</b><br/>(Faculty / Lab Lead)", styles["TableCellBold"]),
            Paragraph("• Asset custody & maintenance<br/>• Slot scheduling & condition signoff<br/>• Safe handover enforcement", styles["TableCell"]),
            Paragraph("• Fear of uncompensated damage<br/>• Administrative sign-out burden<br/>• Lack of user accountability", styles["TableCell"]),
            Paragraph("• Resource listing with rules<br/>• 1-click approve/reject modal<br/>• Physical condition sign-off<br/>• Direct incident reporting", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Institution Manager</b><br/>(Department Dean)", styles["TableCellBold"]),
            Paragraph("• Departmental asset governance<br/>• Student ID & qualification review<br/>• Dispute & incident mediation", styles["TableCell"]),
            Paragraph("• Redundant budget purchases<br/>• Inter-department disputes<br/>• Unregulated safety violations", styles["TableCell"]),
            Paragraph("• Verification document review<br/>• Incident center mediation<br/>• Fair-usage score enforcement<br/>• Utilisation analytics", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Administrator</b><br/>(Campus IT / Registrar)", styles["TableCellBold"]),
            Paragraph("• Campus-wide system reliability<br/>• Compliance auditing & RBAC<br/>• Platform configuration", styles["TableCell"]),
            Paragraph("• Fragmented campus software<br/>• Security & data breaches<br/>• Incomplete audit compliance", styles["TableCell"]),
            Paragraph("• Immutable audit log review<br/>• User suspension & role editing<br/>• Global metrics & service health<br/>• Database integrity monitoring", styles["TableCell"]),
        ],
    ]
    stakeholder_table = Table(stakeholder_rows, colWidths=[CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.28, CONTENT_WIDTH * 0.28, CONTENT_WIDTH * 0.26])
    stakeholder_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_PRIMARY_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(stakeholder_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 4: PROPOSED SOLUTION & CORE INNOVATION
    # =========================================================================
    story.append(Paragraph("4. Proposed Solution & Core Innovation", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "AccessLoop is engineered as a comprehensive <b>Hardware Trust-and-Accountability Operating System</b> rather than a "
        "simplistic calendar scheduler. The platform's superiority over traditional reservation systems stems from five functional pillars:",
        styles["Body"]
    ))

    pillars = [
        ("1. Automated Safety & Qualification Pre-flight: ", "Before a reservation can be drafted, the backend verifies that the applicant possesses a valid institutional email, an approved Student ID, and required workshop certifications (e.g., Laser Safety, Cleanroom protocols)."),
        ("2. Two-Way Photographic Handover Protocol: ", "Borrowers photograph the asset upon collection and log notes; the custodian approves the initial condition to trigger the Active status. On return, final photos are submitted and verified before the booking can close."),
        ("3. Algorithmic Fair Allocation Engine: ", "Replaces first-come-first-served bias with a dynamic fair-usage algorithm that computes an applicant's priority based on historic hours used, cancellation rates, and return punctuality."),
        ("4. Immutable Audit Trail & Mediation Center: ", "Every administrative and user event—from slot booking to condition signoff—is permanently logged in MongoDB with IP timestamps. Disputed damages enter a formal resolution center."),
        ("5. Embedded Semantic AI Assistant: ", "A context-aware campus chatbot connected via REST endpoints to live inventory, explaining usage rules, locations, and prerequisites 24/7 without hallucinating slots."),
    ]
    for p_title, p_desc in pillars:
        story.append(Paragraph(f"• <b>{p_title}</b>{p_desc}", styles["Bullet"]))

    story.append(Spacer(1, 6))

    # Comparison Table
    comp_rows = [
        [
            Paragraph("EVALUATION CRITERIA", styles["TableHead"]),
            Paragraph("TRADITIONAL BOOKING APPS (G-Cal, Cheqroom)", styles["TableHead"]),
            Paragraph("ACCESSLOOP PLATFORM", styles["TableHead"]),
        ],
        [
            Paragraph("<b>Damage Accountability</b>", styles["TableCellBold"]),
            Paragraph("None; relies on verbal memory and paper logs", styles["TableCell"]),
            Paragraph("<b>Mandatory 2-way timestamped photo verification</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Safety Enforcement</b>", styles["TableCellBold"]),
            Paragraph("Manual, easily bypassed by uncertified users", styles["TableCell"]),
            Paragraph("<b>Automated certification & institutional ID gates</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Fairness & Anti-Hoarding</b>", styles["TableCellBold"]),
            Paragraph("First-come first-served; prone to bot/monopoly abuse", styles["TableCell"]),
            Paragraph("<b>Algorithmic Fair Usage Score & smart waiting queue</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Dispute Resolution</b>", styles["TableCellBold"]),
            Paragraph("Ad-hoc arguments, unverified accusations", styles["TableCell"]),
            Paragraph("<b>Structured Incident Center with photo evidence</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Auditing & Governance</b>", styles["TableCellBold"]),
            Paragraph("Fragmented spreadsheets with zero immutable history", styles["TableCell"]),
            Paragraph("<b>Automated tamper-evident MongoDB audit logs</b>", styles["TableCellBold"]),
        ],
    ]
    comp_table = Table(comp_rows, colWidths=[CONTENT_WIDTH * 0.28, CONTENT_WIDTH * 0.36, CONTENT_WIDTH * 0.36])
    comp_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_DARK_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(comp_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: COMPLETE PRODUCT LIFECYCLE WORKFLOW
    # =========================================================================
    story.append(Paragraph("5. Complete Product Lifecycle Workflow", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "The complete resource-sharing lifecycle operates through 14 synchronized stages spanning four actors and the backend engine:",
        styles["Body"]
    ))

    flow_rows = [
        [
            Paragraph("STAGE & STEP", styles["TableHead"]),
            Paragraph("PRIMARY ACTOR", styles["TableHead"]),
            Paragraph("ACTION PERFORMED", styles["TableHead"]),
            Paragraph("SYSTEM STATE & PERSISTENCE", styles["TableHead"]),
        ],
        [
            Paragraph("<b>1. Custody Listing</b>", styles["TableCellBold"]),
            Paragraph("Resource Owner", styles["TableCell"]),
            Paragraph("Submits name, category, quantity, room, safety rules, and photo", styles["TableCell"]),
            Paragraph("Resource record created in MongoDB with active status", styles["TableCell"]),
        ],
        [
            Paragraph("<b>2. Discovery & Search</b>", styles["TableCellBold"]),
            Paragraph("Borrower", styles["TableCell"]),
            Paragraph("Filters by department, free/paid, tags, and slot availability", styles["TableCell"]),
            Paragraph("Live search results fetched via indexed database queries", styles["TableCell"]),
        ],
        [
            Paragraph("<b>3. Eligibility Check</b>", styles["TableCellBold"]),
            Paragraph("Backend Engine", styles["TableCell"]),
            Paragraph("Validates applicant's ID verification status and training records", styles["TableCell"]),
            Paragraph("Blocks request if user is unverified or lacks course credits", styles["TableCell"]),
        ],
        [
            Paragraph("<b>4. Booking Request</b>", styles["TableCellBold"]),
            Paragraph("Borrower", styles["TableCell"]),
            Paragraph("Selects date/time interval, enters project purpose and notes", styles["TableCell"]),
            Paragraph("Booking drafted with status: <b>Pending</b>; owner alerted", styles["TableCell"]),
        ],
        [
            Paragraph("<b>5. Conflict Prevention</b>", styles["TableCellBold"]),
            Paragraph("Backend Engine", styles["TableCell"]),
            Paragraph("Executes atomic query checking overlapping approved reservations", styles["TableCell"]),
            Paragraph("Rejects overlapping slots; routes overflow to WaitingList", styles["TableCell"]),
        ],
        [
            Paragraph("<b>6. Custodian Review</b>", styles["TableCellBold"]),
            Paragraph("Resource Owner", styles["TableCell"]),
            Paragraph("Reviews borrower profile, purpose, and clicks Approve or Reject", styles["TableCell"]),
            Paragraph("Booking status updated to <b>Approved</b>; audit logged", styles["TableCell"]),
        ],
        [
            Paragraph("<b>7. Real-Time Alert</b>", styles["TableCellBold"]),
            Paragraph("Socket.IO Service", styles["TableCell"]),
            Paragraph("Pushes instant notification to borrower dashboard without refresh", styles["TableCell"]),
            Paragraph("Notification saved in MongoDB; unread count incremented", styles["TableCell"]),
        ],
        [
            Paragraph("<b>8. Check-in Handover</b>", styles["TableCellBold"]),
            Paragraph("Borrower + Owner", styles["TableCell"]),
            Paragraph("Borrower takes initial condition photos; owner confirms handover", styles["TableCell"]),
            Paragraph("Handover timestamp & photos saved; status becomes <b>Active</b>", styles["TableCell"]),
        ],
        [
            Paragraph("<b>9. Active Usage</b>", styles["TableCellBold"]),
            Paragraph("Borrower", styles["TableCell"]),
            Paragraph("Operates equipment in lab or off-site during approved interval", styles["TableCell"]),
            Paragraph("Active borrowing counter incremented; hours tracked", styles["TableCell"]),
        ],
        [
            Paragraph("<b>10. Return Submission</b>", styles["TableCellBold"]),
            Paragraph("Borrower", styles["TableCell"]),
            Paragraph("Returns asset to custodian and uploads final condition photos", styles["TableCell"]),
            Paragraph("Booking updated with return timestamp & final photo evidence", styles["TableCell"]),
        ],
        [
            Paragraph("<b>11. Return Verification</b>", styles["TableCellBold"]),
            Paragraph("Resource Owner", styles["TableCell"]),
            Paragraph("Inspects asset condition against check-in photos and signs off", styles["TableCell"]),
            Paragraph("Booking status transitions to <b>Completed</b>", styles["TableCell"]),
        ],
        [
            Paragraph("<b>12. Dispute (Optional)</b>", styles["TableCellBold"]),
            Paragraph("Owner / Borrower", styles["TableCell"]),
            Paragraph("If damage occurred, creates incident report with photo evidence", styles["TableCell"]),
            Paragraph("Incident document created; manager notified for arbitration", styles["TableCell"]),
        ],
        [
            Paragraph("<b>13. Score Recalibration</b>", styles["TableCellBold"]),
            Paragraph("Fair Allocation Service", styles["TableCell"]),
            Paragraph("Updates user's completed bookings, hours used, and usage score", styles["TableCell"]),
            Paragraph("User fair usage metric updated (+2 for on-time return)", styles["TableCell"]),
        ],
        [
            Paragraph("<b>14. Audit Persistence</b>", styles["TableCellBold"]),
            Paragraph("Audit Logger", styles["TableCell"]),
            Paragraph("Appends immutable log entry with actor ID, status change, and IP", styles["TableCell"]),
            Paragraph("AuditLog permanently recorded; available in Admin dashboard", styles["TableCell"]),
        ],
    ]
    flow_table = Table(flow_rows, colWidths=[CONTENT_WIDTH * 0.22, CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.35, CONTENT_WIDTH * 0.25])
    flow_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_PRIMARY_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(flow_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: IMPLEMENTATION STATUS & FEATURE AUDIT
    # =========================================================================
    story.append(Paragraph("6. Implementation Status & Feature Audit", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "A rigorous codebase inspection was performed across frontend components, backend controllers, Mongoose schemas, "
        "and REST routes. The audit distinguishes fully functioning production capabilities from pending future integrations:",
        styles["Body"]
    ))

    audit_rows = [
        [
            Paragraph("FEATURE / MODULE", styles["TableHead"]),
            Paragraph("TECHNICAL IMPLEMENTATION DETAILS", styles["TableHead"]),
            Paragraph("AUDIT STATUS", styles["TableHead"]),
        ],
        [
            Paragraph("<b>Resource Custody & Management</b>", styles["TableCellBold"]),
            Paragraph("Full CRUD, category filtering, quantity, safety requirements, and image upload handled via Multer and MongoDB.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Resource Discovery & Filtering</b>", styles["TableCellBold"]),
            Paragraph("Real-time regex search, category pills, availability chips, and department filters querying live MongoDB.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Multi-Role JWT Authentication</b>", styles["TableCellBold"]),
            Paragraph("Bcrypt password hashing, JWT bearer token interceptors, session restore from localStorage, and role-based route guards.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Eligibility & Safety Verification</b>", styles["TableCellBold"]),
            Paragraph("Enforces Institutional ID and safety certification checks before allowing booking request submissions.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Booking Lifecycle State Machine</b>", styles["TableCellBold"]),
            Paragraph("Atomic transition engine (Pending → Approved → Active → Completed / Rejected / Cancelled) with conflict locks.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Two-Way Handover Check-in</b>", styles["TableCellBold"]),
            Paragraph("Borrower initial condition photo upload and owner sign-off activating resource custody.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Return Verification Protocol</b>", styles["TableCellBold"]),
            Paragraph("Borrower final photo upload, owner condition inspection modal, and final status completion.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Algorithmic Fair Allocation Engine</b>", styles["TableCellBold"]),
            Paragraph("Dynamic priority calculation evaluating total usage hours, cancellation rates, and fair score ranking.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Real-Time Socket.IO Synchronization</b>", styles["TableCellBold"]),
            Paragraph("WebSocket engine pushing live notifications and instant booking status changes across active browsers.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Incident Center & Dispute Resolution</b>", styles["TableCellBold"]),
            Paragraph("Damage, loss, and delay ticket logging with photographic evidence and managerial resolution workflow.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Immutable Audit Logging Engine</b>", styles["TableCellBold"]),
            Paragraph("Automated middleware recording user action, resource ID, IP address, and status diff in MongoDB.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>AccessLoop Campus AI Chatbot</b>", styles["TableCellBold"]),
            Paragraph("Context-aware RAG assistant answering inventory queries and booking rules via /api/chatbot.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Mobile Responsive Experience</b>", styles["TableCellBold"]),
            Paragraph("Custom media queries (360px to 1920px), responsive two-column grid, and slide-in touch navigation drawer.", styles["TableCell"]),
            Paragraph("<b>Completed & Tested</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("<b>Physical Hardware Lockers (IoT)</b>", styles["TableCellBold"]),
            Paragraph("Microcontroller-actuated smart cabinets with RFID badging for unattended physical key handover.", styles["TableCell"]),
            Paragraph("<b>Pending / Future Scope</b>", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Automated CV Damage Detection</b>", styles["TableCellBold"]),
            Paragraph("Computer Vision comparison model automatically detecting scratches/dents between check-in and return photos.", styles["TableCell"]),
            Paragraph("<b>Pending / Future Scope</b>", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Multi-University Inter-Campus Federation</b>", styles["TableCellBold"]),
            Paragraph("Cross-institutional resource sharing protocol allowing verified external university researchers access.", styles["TableCell"]),
            Paragraph("<b>Pending / Future Scope</b>", styles["TableCell"]),
        ],
    ]
    audit_table = Table(audit_rows, colWidths=[CONTENT_WIDTH * 0.28, CONTENT_WIDTH * 0.48, CONTENT_WIDTH * 0.24])
    audit_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_DARK_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(audit_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 7: TECHNOLOGY STACK SPECIFICATIONS
    # =========================================================================
    story.append(Paragraph("7. Technology Stack Specifications", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "AccessLoop is built strictly using modern, production-grade web technologies verified in the project's package manifests:",
        styles["Body"]
    ))

    stack_rows = [
        [
            Paragraph("TIER / LAYER", styles["TableHead"]),
            Paragraph("TECHNOLOGY & PACKAGE", styles["TableHead"]),
            Paragraph("VERSION", styles["TableHead"]),
            Paragraph("ARCHITECTURAL PURPOSE IN ACCESSLOOP", styles["TableHead"]),
        ],
        [
            Paragraph("<b>Frontend Framework</b>", styles["TableCellBold"]),
            Paragraph("React.js + Vite", styles["TableCell"]),
            Paragraph("React 18.3<br/>Vite 6.0", styles["TableCellCenter"]),
            Paragraph("High-performance component-driven Single Page Application with optimized asset bundling.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Client Routing</b>", styles["TableCellBold"]),
            Paragraph("React Router DOM", styles["TableCell"]),
            Paragraph("v6.28", styles["TableCellCenter"]),
            Paragraph("Declarative client-side routing, protected auth routes, and multi-dashboard navigation.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>HTTP Client</b>", styles["TableCellBold"]),
            Paragraph("Axios", styles["TableCell"]),
            Paragraph("v1.7", styles["TableCellCenter"]),
            Paragraph("REST communication with request interceptors for JWT injection and dynamic baseURL normalization.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>UI Design System</b>", styles["TableCellBold"]),
            Paragraph("Lucide React + Vanilla CSS3", styles["TableCell"]),
            Paragraph("v0.474", styles["TableCellCenter"]),
            Paragraph("Custom SaaS visual identity (#22C55E), CSS variables, responsive grid classes, and clean icon system.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Data Visualisation</b>", styles["TableCellBold"]),
            Paragraph("Recharts", styles["TableCell"]),
            Paragraph("v2.15", styles["TableCellCenter"]),
            Paragraph("Interactive charts for institutional utilisation, booking trends, and fair-usage distributions.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Real-time Engine</b>", styles["TableCellBold"]),
            Paragraph("Socket.IO (Client & Server)", styles["TableCell"]),
            Paragraph("v4.8", styles["TableCellCenter"]),
            Paragraph("Bi-directional WebSocket connection for instant notifications and reactive dashboard updates.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Backend Runtime</b>", styles["TableCellBold"]),
            Paragraph("Node.js + Express.js", styles["TableCell"]),
            Paragraph("Node 20+<br/>Express 4.21", styles["TableCellCenter"]),
            Paragraph("Asynchronous event-driven REST API server managing business logic and authorization middleware.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Authentication</b>", styles["TableCellBold"]),
            Paragraph("Bcrypt.js + JSON Web Tokens", styles["TableCell"]),
            Paragraph("Bcrypt 2.4<br/>JWT 9.0", styles["TableCellCenter"]),
            Paragraph("10-round salted password hashing and cryptographically signed stateless session tokens.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>File Handling</b>", styles["TableCellBold"]),
            Paragraph("Multer", styles["TableCell"]),
            Paragraph("v1.4 LTS", styles["TableCellCenter"]),
            Paragraph("Multipart form-data handling for condition photographs and user verification documents.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Cloud Database</b>", styles["TableCellBold"]),
            Paragraph("MongoDB Atlas + Mongoose", styles["TableCell"]),
            Paragraph("Mongoose 8.9", styles["TableCellCenter"]),
            Paragraph("Distributed cloud document database with strict schema validation, compound indexes, and queries.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>Cloud Hosting</b>", styles["TableCellBold"]),
            Paragraph("Vercel (Client) + Render (API)", styles["TableCell"]),
            Paragraph("Production", styles["TableCellCenter"]),
            Paragraph("Global Edge CDN static hosting for the React SPA and containerized Node.js service for backend.", styles["TableCell"]),
        ],
    ]
    stack_table = Table(stack_rows, colWidths=[CONTENT_WIDTH * 0.20, CONTENT_WIDTH * 0.25, CONTENT_WIDTH * 0.15, CONTENT_WIDTH * 0.40])
    stack_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_PRIMARY_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(stack_table)

    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 8: SYSTEM ARCHITECTURE & NETWORK TOPOLOGY
    # =========================================================================
    story.append(Paragraph("8. System Architecture & Network Topology", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "AccessLoop employs a decoupled four-tier micro-service compatible architecture engineered for security and fault isolation:",
        styles["Body"]
    ))

    arch_layers = [
        ("Layer 1: Presentation & Client Application (Vercel Edge): ", "A compiled Vite React Single Page Application served globally over HTTPS with client-side routing, protected auth contexts, and responsive layouts."),
        ("Layer 2: API Gateway & WebSocket Router (Render Node.js): ", "Express.js REST controllers guarded by CORS policies and rate limiters, complemented by a persistent Socket.IO WebSocket server room-partitioned by user ID."),
        ("Layer 3: Business Logic & Workflow Engine: ", "Independent domain services executing multi-step business logic: Auth & Verification Service, Fair Allocation Engine, Handover Validator, Incident Mediator, and Audit Logger."),
        ("Layer 4: Data & Persistence Layer (MongoDB Atlas Cluster): ", "A fully managed replica-set cloud database enforcing schemas, compound indexes (e.g., status, resourceId, userEmail), and transactional referential consistency."),
    ]
    for a_title, a_desc in arch_layers:
        story.append(Paragraph(f"• <b>{a_title}</b>{a_desc}", styles["Bullet"]))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 9: DATABASE DESIGN & MONGOOSE SCHEMAS
    # =========================================================================
    story.append(Paragraph("9. Database Design & Mongoose Schemas", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "The MongoDB database architecture consists of nine interconnected Mongoose collections supporting the complete sharing lifecycle:",
        styles["Body"]
    ))

    db_rows = [
        [
            Paragraph("COLLECTION", styles["TableHead"]),
            Paragraph("KEY FIELDS & DATA TYPES", styles["TableHead"]),
            Paragraph("RELATIONSHIPS & INDEXES", styles["TableHead"]),
            Paragraph("OPERATIONAL ROLE IN ACCESSLOOP", styles["TableHead"]),
        ],
        [
            Paragraph("<b>users</b>", styles["TableCellBold"]),
            Paragraph("name (Str), email (Str, unique), password (Str, hash), role (Enum), institution (Str), fairUsageScore (Num), verificationStatus (Enum)", styles["TableCell"]),
            Paragraph("Indexed by email; references uploaded verificationDoc", styles["TableCell"]),
            Paragraph("Stores user identity, role privileges, and dynamic anti-hoarding scores.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>resources</b>", styles["TableCellBold"]),
            Paragraph("name (Str), category (Str), resourceType (Enum), quantity (Num), min/maxDuration (Num), eligibilityRequirements (Obj), images (Arr), isPaid (Bool)", styles["TableCell"]),
            Paragraph("Indexed by category, department, and owner ID", styles["TableCell"]),
            Paragraph("Defines physical assets, custody requirements, and prerequisite gates.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>bookings</b>", styles["TableCellBold"]),
            Paragraph("bookingNumber (Str), resource (Ref), borrower (Ref), owner (Ref), startDate (Date), endDate (Date), status (Enum), purpose (Str)", styles["TableCell"]),
            Paragraph("Compound index: [resource, startDate, endDate, status]", styles["TableCell"]),
            Paragraph("Central state machine governing scheduling, approvals, and usage.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>checkinouts</b>", styles["TableCellBold"]),
            Paragraph("bookingId (Ref), checkInPhotos (Arr), checkInNotes (Str), returnPhotos (Arr), returnNotes (Str), checkInSignoff (Date), returnSignoff (Date)", styles["TableCell"]),
            Paragraph("Foreign key reference to bookingId", styles["TableCell"]),
            Paragraph("Stores before-and-after photographic evidence and custodian sign-offs.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>waitinglists</b>", styles["TableCellBold"]),
            Paragraph("resource (Ref), user (Ref), requestedSlot (Obj), queuePosition (Num), priorityScore (Num), status (Enum)", styles["TableCell"]),
            Paragraph("Indexed by resource and queuePosition", styles["TableCell"]),
            Paragraph("Maintains transparent queue for high-demand conflicting slots.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>incidents</b>", styles["TableCellBold"]),
            Paragraph("incidentNumber (Str), booking (Ref), resource (Ref), reportedBy (Ref), severity (Enum), evidenceImages (Arr), resolution (Str), status (Enum)", styles["TableCell"]),
            Paragraph("Indexed by booking, resource, and status", styles["TableCell"]),
            Paragraph("Manages damage tickets, loss claims, and managerial arbitration.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>notifications</b>", styles["TableCellBold"]),
            Paragraph("recipient (Ref), sender (Ref), title (Str), message (Str), type (Enum), relatedBooking (Ref), isRead (Bool)", styles["TableCell"]),
            Paragraph("Indexed by recipient and isRead", styles["TableCell"]),
            Paragraph("Powers bell notifications and real-time dashboard alerts.", styles["TableCell"]),
        ],
        [
            Paragraph("<b>auditlogs</b>", styles["TableCellBold"]),
            Paragraph("actionType (Str), performedBy (Ref), userRole (Str), resourceName (Str), bookingNumber (Str), ipAddress (Str), timestamp (Date)", styles["TableCell"]),
            Paragraph("Indexed by timestamp, actionType, performedBy", styles["TableCell"]),
            Paragraph("Provides immutable compliance and forensic audit history.", styles["TableCell"]),
        ],
    ]
    db_table = Table(db_rows, colWidths=[CONTENT_WIDTH * 0.16, CONTENT_WIDTH * 0.32, CONTENT_WIDTH * 0.24, CONTENT_WIDTH * 0.28])
    db_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_PRIMARY_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(db_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 10: USER ROLE MODULES & FUNCTIONAL BREAKDOWN
    # =========================================================================
    story.append(Paragraph("10. User Role Modules & Functional Breakdown", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("A. Borrower / Student Experience", styles["H2"]))
    story.append(Paragraph(
        "Borrowers access a tailored portal centered on intuitive asset discovery and transparent tracking: "
        "(1) <b>Explore Resources:</b> Multi-criteria filtering by category (Labs, 3D Printers, Cameras), location, and pricing; "
        "(2) <b>Pre-flight Qualification Checks:</b> Instant visual feedback indicating if an asset requires workshop certification; "
        "(3) <b>Booking Management:</b> Personal dashboard displaying Active, Approved, and Pending requests; "
        "(4) <b>Handover Actions:</b> Interactive mobile-friendly photo upload tool to document asset condition upon collection and return; "
        "(5) <b>Fair Usage Transparency:</b> Visual progress gauges displaying current Fair Usage Score (0–100) and priority standing.",
        styles["Body"]
    ))

    story.append(Paragraph("B. Resource Owner / Custodian Experience", styles["H2"]))
    story.append(Paragraph(
        "Lab managers and faculty leads operate with full administrative control over their physical assets: "
        "(1) <b>Modern Listing Suite:</b> Add and edit assets with interactive option buttons for Equipment vs Space, pricing models, and safety rules; "
        "(2) <b>Request Review Modal:</b> 1-click review displaying borrower credentials, requested hours, and project rationale, with Approve and Reject options; "
        "(3) <b>Physical Handover Verification:</b> Custodian inspects borrower-uploaded condition photos before signing off on active release; "
        "(4) <b>Return Inspection & Sign-off:</b> Side-by-side comparison of check-in and checkout condition photos to detect damage prior to closing the booking.",
        styles["Body"]
    ))

    story.append(Paragraph("C. Institution Manager Experience", styles["H2"]))
    story.append(Paragraph(
        "Department heads and deans oversee inter-departmental compliance: "
        "(1) <b>Verification Queue:</b> Review student IDs and safety certificates to approve institutional borrower status; "
        "(2) <b>Incident Resolution Center:</b> Arbitrate damage or overdue equipment disputes backed by photographic evidence; "
        "(3) <b>Cross-Department Analytics:</b> Monitor real-time equipment utilisation rates to prevent duplicate capital expenditures.",
        styles["Body"]
    ))

    story.append(Paragraph("D. Platform Administrator Experience", styles["H2"]))
    story.append(Paragraph(
        "Central administrators manage campus-wide governance: "
        "(1) <b>Immutable Audit Log:</b> Comprehensive filterable log of every booking, user login, role elevation, and return sign-off; "
        "(2) <b>User Governance:</b> Ability to suspend bad-faith actors or override scheduling deadlocks; "
        "(3) <b>Platform Health Monitoring:</b> REST health endpoints and database metrics.",
        styles["Body"]
    ))

    # =========================================================================
    # SECTION 11: AI AND INTELLIGENT CAPABILITIES
    # =========================================================================
    story.append(Spacer(1, 6))
    story.append(Paragraph("11. AI and Intelligent Capabilities", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "AccessLoop integrates an intelligent campus assistant and algorithmic fairness engine designed for verified accuracy:",
        styles["Body"]
    ))

    ai_features = [
        ("AccessLoop Smart Campus AI Assistant: ", "Accessible via the top-left global navigation badge on all pages. Built on a Retrieval-Augmented Generation (RAG) architecture. When a user asks questions (e.g., 'Find available 3D printers' or 'What are the return rules?'), the backend queries live MongoDB inventory and returns verified availability, room locations, and safety prerequisites without hallucinating availability."),
        ("Dynamic Anti-Hoarding Fair Usage Engine: ", "An algorithmic scoring model that continuously tracks each user's total hours borrowed, punctuality, and cancellation history. When conflicting requests occur for scarce resources (e.g., GPU rigs), the algorithm prioritizes underserved researchers over high-frequency users, democratizing academic access."),
    ]
    for af_title, af_desc in ai_features:
        story.append(Paragraph(f"• <b>{af_title}</b>{af_desc}", styles["Bullet"]))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 12: COMPREHENSIVE QA & TEST CASE MATRIX
    # =========================================================================
    story.append(Paragraph("12. Comprehensive Quality Assurance & Test Case Matrix", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "To verify product reliability, 20 end-to-end integration test cases were executed across borrower, owner, and administrative flows:",
        styles["Body"]
    ))

    test_rows = [
        [
            Paragraph("ID", styles["TableHead"]),
            Paragraph("TEST SCENARIO & WORKFLOW", styles["TableHead"]),
            Paragraph("EXPECTED BEHAVIOR", styles["TableHead"]),
            Paragraph("ACTUAL SYSTEM OUTCOME", styles["TableHead"]),
            Paragraph("STATUS", styles["TableHead"]),
        ],
        [
            Paragraph("TC-01", styles["TableCellBold"]),
            Paragraph("User registration with campus email", styles["TableCell"]),
            Paragraph("Account created, JWT issued, redirected to dashboard", styles["TableCell"]),
            Paragraph("User persisted in MongoDB; JWT stored in localStorage", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-02", styles["TableCellBold"]),
            Paragraph("User login with valid credentials", styles["TableCell"]),
            Paragraph("Authenticated session restored; role-specific UI displayed", styles["TableCell"]),
            Paragraph("Correct dashboard rendered based on user role", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-03", styles["TableCellBold"]),
            Paragraph("Owner lists new camera resource", styles["TableCell"]),
            Paragraph("Resource persisted with photo and eligibility rules", styles["TableCell"]),
            Paragraph("Saved in MongoDB; appears in catalog instantly", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-04", styles["TableCellBold"]),
            Paragraph("Resource discovery & search filtering", styles["TableCell"]),
            Paragraph("Matches query string and filters by category/department", styles["TableCell"]),
            Paragraph("Dynamic live search results accurately filtered", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-05", styles["TableCellBold"]),
            Paragraph("Unverified user attempts certified lab booking", styles["TableCell"]),
            Paragraph("Blocked by eligibility gate with explanatory prompt", styles["TableCell"]),
            Paragraph("Request blocked; user instructed to upload ID", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-06", styles["TableCellBold"]),
            Paragraph("Borrower submits valid booking request", styles["TableCell"]),
            Paragraph("Booking created in Pending state; owner alerted", styles["TableCell"]),
            Paragraph("Booking saved; real-time notification sent to owner", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-07", styles["TableCellBold"]),
            Paragraph("Owner approves booking request", styles["TableCell"]),
            Paragraph("Status transitions to Approved; borrower alerted", styles["TableCell"]),
            Paragraph("Status updated; borrower notified via Socket.IO", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-08", styles["TableCellBold"]),
            Paragraph("Double-booking conflict prevention", styles["TableCell"]),
            Paragraph("Simultaneous request on same slot rejected or waitlisted", styles["TableCell"]),
            Paragraph("Atomic query blocks overlapping slot reservation", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-09", styles["TableCellBold"]),
            Paragraph("Check-in handover with photo upload", styles["TableCell"]),
            Paragraph("Condition photos stored; status becomes Active", styles["TableCell"]),
            Paragraph("Photos saved via Multer; booking marked Active", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-10", styles["TableCellBold"]),
            Paragraph("Return submission with final photos", styles["TableCell"]),
            Paragraph("Return photos saved; custodian prompted to inspect", styles["TableCell"]),
            Paragraph("Return record created; owner notified for sign-off", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-11", styles["TableCellBold"]),
            Paragraph("Custodian completes return verification", styles["TableCell"]),
            Paragraph("Status becomes Completed; fair score recalculated", styles["TableCell"]),
            Paragraph("Booking completed; +2 points awarded to user", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-12", styles["TableCellBold"]),
            Paragraph("Damage incident reporting", styles["TableCell"]),
            Paragraph("Incident ticket created with photos; manager alerted", styles["TableCell"]),
            Paragraph("Incident logged in MongoDB; manager review enabled", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-13", styles["TableCellBold"]),
            Paragraph("Immutable audit logging verification", styles["TableCell"]),
            Paragraph("Every status transition recorded with user ID and IP", styles["TableCell"]),
            Paragraph("AuditLog populated; visible in admin audit trail", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-14", styles["TableCellBold"]),
            Paragraph("Socket.IO live notification delivery", styles["TableCell"]),
            Paragraph("Notification bell badge increments without page refresh", styles["TableCell"]),
            Paragraph("Real-time event received; badge updated instantly", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-15", styles["TableCellBold"]),
            Paragraph("AI Chatbot real-time inventory query", styles["TableCell"]),
            Paragraph("Assistant answers with verified equipment names & rooms", styles["TableCell"]),
            Paragraph("RAG queries MongoDB; accurate items returned", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-16", styles["TableCellBold"]),
            Paragraph("Role-based route authorization guards", styles["TableCell"]),
            Paragraph("Borrower accessing /dashboard/admin receives 403 Forbidden", styles["TableCell"]),
            Paragraph("Express authorize() middleware rejects unauthorized role", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-17", styles["TableCellBold"]),
            Paragraph("Mobile viewport responsiveness (375px)", styles["TableCell"]),
            Paragraph("Navigation collapses to touch drawer; cards stack cleanly", styles["TableCell"]),
            Paragraph("0 horizontal overflow; touch drawer functions smoothly", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-18", styles["TableCellBold"]),
            Paragraph("Token expiration & silent logout", styles["TableCell"]),
            Paragraph("Expired JWT clears localStorage and redirects to login", styles["TableCell"]),
            Paragraph("Axios response interceptor handles 401 gracefully", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-19", styles["TableCellBold"]),
            Paragraph("Waiting list position auto-advancement", styles["TableCell"]),
            Paragraph("Cancelled booking promotes first waitlisted user", styles["TableCell"]),
            Paragraph("Waitlist service promotes queue position 1 user", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
        [
            Paragraph("TC-20", styles["TableCellBold"]),
            Paragraph("Cross-Origin Resource Sharing (CORS)", styles["TableCell"]),
            Paragraph("Vercel frontend successfully calls Render API with credentials", styles["TableCell"]),
            Paragraph("Dynamic origin reflection allows authenticated CORS", styles["TableCell"]),
            Paragraph("<b>PASS</b>", styles["TableCellBold"]),
        ],
    ]
    test_table = Table(test_rows, colWidths=[CONTENT_WIDTH * 0.08, CONTENT_WIDTH * 0.28, CONTENT_WIDTH * 0.30, CONTENT_WIDTH * 0.24, CONTENT_WIDTH * 0.10])
    test_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_PRIMARY_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(test_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 13: SECURITY, PRIVACY & FAIRNESS ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("13. Security, Privacy & Fairness Architecture", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Security, user privacy, and algorithmic fairness are core foundational requirements of the AccessLoop architecture:",
        styles["Body"]
    ))

    sec_points = [
        ("Cryptographic Authentication & Password Salting: ", "User passwords are encrypted with Bcrypt utilizing a work factor of 10 rounds. Sessions use cryptographically signed JWT tokens with strict 7-day expiration."),
        ("Server-Side Role-Based Authorization (RBAC): ", "Security is never trusted to client-side UI toggles. Every sensitive API route (/api/audit-logs, /api/verifications, /api/incidents) is guarded by express authorize() middleware validating req.user.role."),
        ("Sanitized Uploads & Storage Boundaries: ", "File uploads for condition documentation and identity verification are validated by Multer for MIME type, restricted to image and PDF formats, and size-capped at 20MB."),
        ("Transparent Fairness Mechanics: ", "Users can inspect their Fair Usage Score at all times. Allocation penalties are never irreversible automated black-boxes—students can appeal penalties through the Incident Mediation Center."),
        ("Human-in-the-Loop Governance: ", "Critical decisions—such as user account suspensions, damage liability fees, and safety qualification waivers—require authenticated sign-off by an authorized Institution Manager."),
    ]
    for sp_title, sp_desc in sec_points:
        story.append(Paragraph(f"• <b>{sp_title}</b>{sp_desc}", styles["Bullet"]))

    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 14: OPERATIONAL LIMITATIONS & KNOWN CONSTRAINTS
    # =========================================================================
    story.append(Paragraph("14. Operational Limitations & Known Constraints", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    limits = [
        ("Render Free-Tier Spin-up Latency: ", "On free-tier cloud hosting, the backend spins down after 15 minutes of inactivity, causing an initial 50-second cold-start latency on the first request."),
        ("Reliance on Mobile Device Photographic Quality: ", "Condition verification depends on user camera clarity and lighting conditions. Highly subtle electronic damage (e.g., internal sensor burn) cannot be detected by exterior photographs."),
        ("Absence of Physical Interlocks: ", "Without integrated electronic smart lockers or IoT solenoids, the physical handover of keys remains dependent on the physical presence of the laboratory custodian."),
    ]
    for l_title, l_desc in limits:
        story.append(Paragraph(f"• <b>{l_title}</b>{l_desc}", styles["Bullet"]))

    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 15: FUTURE SCOPE & ROADMAP
    # =========================================================================
    story.append(Paragraph("15. Future Scope & Roadmap", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    roadmap = [
        ("Phase 1 — IoT Smart Lockers & RFID Badging: ", "Integrating ESP32-powered automated storage lockers allowing students to unlock equipment compartments 24/7 using campus RFID student cards."),
        ("Phase 2 — Computer Vision Damage Comparison: ", "Deploying a lightweight edge Vision model that computes difference maps between Check-in and Return photos, highlighting new scratches or missing accessories automatically."),
        ("Phase 3 — Inter-Campus Resource Consortiums: ", "Expanding AccessLoop across multi-university federations so research scholars can borrow specialized scientific equipment across neighboring partner colleges."),
        ("Phase 4 — Native Mobile Application: ", "Developing a cross-platform React Native app with push notifications, offline barcode scanning, and biometric sign-in."),
    ]
    for r_title, r_desc in roadmap:
        story.append(Paragraph(f"• <b>{r_title}</b>{r_desc}", styles["Bullet"]))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 16: TEAM COMPOSITION (SOLO PARTICIPANT)
    # =========================================================================
    story.append(Paragraph("16. Team Composition & Individual Contributions", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(make_callout(
        "<b>OFFICIAL SOLO PARTICIPATION STATEMENT:</b><br/>"
        "AccessLoop is an individually conceived, designed, developed, and tested hackathon project. "
        "The participant independently undertook all team leadership, product planning, UI/UX design, "
        "frontend engineering, backend architecture, database modeling, quality assurance testing, and technical documentation.",
        styles, C_LIGHT_GREEN, C_PRIMARY_GREEN
    ))
    story.append(Spacer(1, 10))

    team_rows = [
        [
            Paragraph("PARTICIPANT NAME", styles["TableHead"]),
            Paragraph("OFFICIAL DESIGNATION", styles["TableHead"]),
            Paragraph("INDIVIDUAL RESPONSIBILITIES & OWNERSHIP", styles["TableHead"]),
        ],
        [
            Paragraph("<b>Jaiwant Karrun S.A.</b>", styles["TableCellBold"]),
            Paragraph("<b>Team Leader & Sole Team Member</b><br/>Full-Stack Software Engineer", styles["TableCell"]),
            Paragraph(
                "• Complete project planning & requirements decomposition<br/>"
                "• Full-stack architecture (React SPA + Node.js API + MongoDB)<br/>"
                "• Custom SaaS UI/UX design system & mobile responsiveness<br/>"
                "• Database schema modeling & REST API development<br/>"
                "• Real-time WebSocket integration via Socket.IO<br/>"
                "• Security hardening, CORS resolution, and cloud deployment",
                styles["TableCell"]
            ),
        ],
    ]
    team_table = Table(team_rows, colWidths=[CONTENT_WIDTH * 0.25, CONTENT_WIDTH * 0.25, CONTENT_WIDTH * 0.50])
    team_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_DARK_GREEN),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(team_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 17: DETAILED INDIVIDUAL CONTRIBUTIONS (21 DOMAINS)
    # =========================================================================
    story.append(Paragraph("17. Detailed Individual Contributions (21 Domains)", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    contributions = [
        ("1. Problem Analysis: ", "Independently deconstructed the hackathon challenge into actionable technical requirements."),
        ("2. Architecture Design: ", "Architected the decoupled React SPA + Express API + MongoDB Atlas cloud topology."),
        ("3. UI/UX Design System: ", "Authored the custom modern SaaS design system with #22C55E bright-green branding."),
        ("4. Frontend Development: ", "Engineered all 10 responsive React pages with dynamic routing and state hooks."),
        ("5. Backend Engineering: ", "Authored 11 Express route modules and controller handlers from scratch."),
        ("6. REST API Implementation: ", "Designed RESTful JSON endpoints with proper HTTP codes, validation, and error traps."),
        ("7. MongoDB Modeling: ", "Designed and indexed 9 relational-style Mongoose schemas."),
        ("8. Security & Auth: ", "Implemented Bcrypt password salting, JWT signing, and role-based middleware guards."),
        ("9. Resource Listing Suite: ", "Built interactive option cards for equipment types, pricing models, and safety rules."),
        ("10. Booking State Machine: ", "Implemented conflict validation and double-booking prevention logic."),
        ("11. Eligibility Gating: ", "Built automated pre-checks validating student verification and workshop training."),
        ("12. Fair Allocation Algorithm: ", "Authored mathematical scoring engine prioritizing underserved researchers."),
        ("13. Handover Check-in: ", "Created two-way photographic condition upload and owner custody sign-off."),
        ("14. Return Verification: ", "Built final inspection comparison workflow ensuring equipment accountability."),
        ("15. Incident Center: ", "Developed structured dispute ticket creation with photographic evidence attachment."),
        ("16. Notification Engine: ", "Configured in-app notifications with unread counts and read receipts."),
        ("17. Real-Time WebSockets: ", "Integrated Socket.IO for live alerts across active browser sessions."),
        ("18. Immutable Audit Trail: ", "Built automated audit logger tracking all status transitions and IP timestamps."),
        ("19. Campus AI Assistant: ", "Engineered RAG-based context-aware AI chatbot connected to live inventory."),
        ("20. Quality Assurance: ", "Executed 20 end-to-end integration test scenarios ensuring product robustness."),
        ("21. Cloud Deployment: ", "Deployed frontend to Vercel and backend to Render with automated Git CI/CD."),
    ]
    for c_title, c_desc in contributions:
        story.append(Paragraph(f"• <b>{c_title}</b>{c_desc}", styles["Bullet"]))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 18: DEPLOYMENT & EXECUTION GUIDE
    # =========================================================================
    story.append(Paragraph("18. Deployment & Execution Guide", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("Local Development Setup", styles["H2"]))
    story.append(Paragraph(
        "<b>Step 1 — Clone Repository:</b><br/>"
        "<code>git clone https://github.com/jaiwant03/AccessLoop.git && cd AccessLoop</code><br/><br/>"
        "<b>Step 2 — Backend Configuration & Launch:</b><br/>"
        "<code>cd server && npm install</code><br/>"
        "Create <code>server/.env</code> with: <code>PORT=5000</code>, <code>MONGODB_URI=&lt;atlas_uri&gt;</code>, "
        "<code>JWT_SECRET=&lt;secret&gt;</code>, <code>CLIENT_URL=http://localhost:5173</code><br/>"
        "Launch API: <code>npm run dev</code> (Server listens on port 5000)<br/><br/>"
        "<b>Step 3 — Frontend Configuration & Launch:</b><br/>"
        "<code>cd ../client && npm install</code><br/>"
        "Create <code>client/.env</code> with: <code>VITE_API_URL=http://localhost:5000/api</code><br/>"
        "Launch Client: <code>npm run dev</code> (Vite serves on http://localhost:5173)",
        styles["Body"]
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Cloud Production Deployment (Vercel + Render)", styles["H2"]))
    story.append(Paragraph(
        "• <b>Backend on Render:</b> Connected to <code>server/</code> root directory. Build command: <code>npm ci</code>. "
        "Start command: <code>node server.js</code>. Environment variables configured for <code>MONGODB_URI</code>, <code>JWT_SECRET</code>, and <code>NODE_ENV=production</code>.<br/>"
        "• <b>Frontend on Vercel:</b> Connected to <code>client/</code> root directory. Framework Preset: <code>Vite</code>. "
        "Build command: <code>npm run build</code>. Output directory: <code>dist</code>. Install command: <code>npm install</code>. "
        "Environment variable configured: <code>VITE_API_URL=https://&lt;render-service-name&gt;.onrender.com/api</code>.",
        styles["Body"]
    ))

    # =========================================================================
    # SECTION 19: CONCLUSION & IMPACT
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("19. Conclusion & Impact", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "AccessLoop directly resolves the hackathon challenge, <i>“Unlock Underused Equipment and Spaces,”</i> by transforming "
        "idle institutional hardware into an active, trusted campus commons. By combining automated prerequisite gates, "
        "two-way photographic verification, algorithmic fair access, and immutable audit logs, the platform eliminates the "
        "frictional barriers of fear and mistrust that historically prevented academic sharing.<br/><br/>"
        "The real-world impact of AccessLoop is three-fold: (1) <b>Economic Efficiency:</b> Saves universities millions by maximizing "
        "the utilization of existing equipment and avoiding duplicate procurement; (2) <b>Educational Equity:</b> Empowers every "
        "verified student with democratic access to cutting-edge tools regardless of department connections; and (3) <b>Sustainable "
        "Innovation:</b> Cultivates an interdisciplinary culture of collaborative research. AccessLoop demonstrates how intelligent "
        "software engineering can unlock latent campus potential and establish a truly sustainable academic sharing economy.",
        styles["Body"]
    ))

    # =========================================================================
    # SECTION 20: REFERENCES & ACKNOWLEDGEMENTS
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("20. References & Acknowledgements", styles["H1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=C_PRIMARY_GREEN, spaceBefore=2, spaceAfter=8))

    refs = [
        ("Hackathon Problem Statement: ", "Official Hackathon Challenge Track: 'Unlock Underused Equipment and Spaces' (2026)."),
        ("React.js Documentation: ", "Facebook Open Source, React 18 Concurrent Rendering Documentation (react.dev)."),
        ("MongoDB Atlas & Mongoose: ", "Mongoose Object Data Modeling Documentation for Node.js (mongoosejs.com)."),
        ("Socket.IO Engine: ", "Socket.IO Bidirectional Event-Based Real-Time Engine (socket.io/docs)."),
        ("Vite Build Tool: ", "Next Generation Frontend Tooling Documentation (vitejs.dev)."),
        ("Acknowledgements: ", "Sincere gratitude to the hackathon organizers, academic mentors, and open-source contributors whose tools and insights enabled the successful architecture and deployment of AccessLoop."),
    ]
    for r_title, r_desc in refs:
        story.append(Paragraph(f"• <b>{r_title}</b>{r_desc}", styles["Bullet"]))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Documentation PDF successfully generated: {filename}")


if __name__ == "__main__":
    out_file = "AccessLoop_Project_Documentation.pdf"
    build_pdf(out_file)
