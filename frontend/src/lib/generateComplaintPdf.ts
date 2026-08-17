import jsPDF from "jspdf";
import type { Complaint } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, [number, number, number]> = {
  SUBMITTED: [37, 99, 235],
  UNDER_REVIEW: [217, 119, 6],
  IN_PROGRESS: [234, 88, 12],
  RESOLVED: [22, 163, 74],
  CLOSED: [107, 114, 128],
  REJECTED: [220, 38, 38],
};

// Light tint for status pill backgrounds (pastel)
function statusBg(r: number, g: number, b: number): [number, number, number] {
  return [
    Math.min(255, Math.round(r * 0.15 + 240)),
    Math.min(255, Math.round(g * 0.15 + 240)),
    Math.min(255, Math.round(b * 0.15 + 240)),
  ];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

// Draw the tiled diagonal watermark on the current page.
// Small text-only marks, no filled shapes — never blocks content.
function drawWatermark(doc: jsPDF, W: number, H: number) {
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.055 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(120, 90, 0);

  const stepX = 52;
  const stepY = 38;
  const angle = 45;

  for (let row = -2; row * stepY < H + stepY * 2; row++) {
    for (let col = -1; col * stepX < W + stepX * 2; col++) {
      const x = col * stepX + (row % 2 === 0 ? 0 : stepX / 2);
      const y = row * stepY;
      doc.text("Municipal Civic Track", x, y, { angle, align: "center" });
    }
  }

  doc.restoreGraphicsState();
}

export function generateComplaintPdf(complaint: Complaint) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210;
  const H = 297;
  const margin = 18;
  const contentW = W - margin * 2;

  // ── PAGE 1 WATERMARK ────────────────────────────────────────────────────
  drawWatermark(doc, W, H);

  // ── HEADER BAR (compact single row, 16mm tall) ──────────────────────────
  const headerH = 16;
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, W, headerH, "F");

  // Logo circle
  const logoX = margin + 5;
  const logoY = headerH / 2;
  doc.setFillColor(255, 255, 255);
  doc.circle(logoX, logoY, 4.5, "F");
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("CT", logoX, logoY + 2.2, { align: "center" });

  // App name + subtitle on one row
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Municipal Civic Track", margin + 13, logoY - 0.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(186, 210, 255); // blue-200 equivalent
  doc.text("Citizen Complaint & Resolution Portal", margin + 13, logoY + 4.5);

  // Generated timestamp right-aligned
  doc.setFontSize(6.5);
  doc.setTextColor(186, 210, 255);
  doc.text(
    `Generated: ${formatDate(new Date().toISOString())}`,
    W - margin,
    logoY + 2,
    { align: "right" }
  );

  // ── DOCUMENT TITLE ROW ──────────────────────────────────────────────────
  let y = headerH + 9;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Complaint Report", margin, y);

  // Tracking code pill (right side, same baseline)
  const tcLabel = complaint.trackingCode;
  doc.setFontSize(8.5);
  const tcW = doc.getTextWidth(tcLabel) + 8;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.roundedRect(W - margin - tcW, y - 5.5, tcW, 7, 1.5, 1.5, "FD");
  doc.setTextColor(30, 64, 175);
  doc.text(tcLabel, W - margin - tcW / 2, y - 0.5, { align: "center" });

  // Status badge
  y += 7;
  const statusLabel = STATUS_LABELS[complaint.status] ?? complaint.status;
  const [sr, sg, sb] = STATUS_COLORS[complaint.status] ?? [107, 114, 128];
  const [br, bg2, bb] = statusBg(sr, sg, sb);
  doc.setFontSize(8);
  const swW = doc.getTextWidth(statusLabel) + 8;
  doc.setFillColor(br, bg2, bb);
  doc.setDrawColor(sr, sg, sb);
  doc.roundedRect(margin, y - 4.5, swW, 6.5, 1.5, 1.5, "FD");
  doc.setTextColor(sr, sg, sb);
  doc.text(statusLabel, margin + swW / 2, y, { align: "center" });

  // Divider
  y += 7;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.35);
  doc.line(margin, y, W - margin, y);
  y += 6;

  // ── SECTION HEADER HELPER ───────────────────────────────────────────────
  function sectionHeader(label: string) {
    // Left accent bar + label
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, y - 3.5, 2.5, 7, "F");
    doc.setFillColor(243, 244, 246);
    doc.rect(margin + 2.5, y - 3.5, contentW - 2.5, 7, "F");
    doc.setTextColor(30, 64, 175);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(label.toUpperCase(), margin + 6, y + 1);
    y += 10;
  }

  // ── COMPLAINT DETAILS ───────────────────────────────────────────────────
  sectionHeader("Complaint Details");

  function fieldPair(
    label1: string, val1: string,
    label2: string, val2: string
  ) {
    const colW = contentW / 2 - 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text(label1, margin, y);
    doc.text(label2, margin + colW + 8, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    const lines1 = wrapText(doc, val1 || "—", colW);
    const lines2 = wrapText(doc, val2 || "—", colW);
    doc.text(lines1, margin, y + 4.5);
    doc.text(lines2, margin + colW + 8, y + 4.5);
    y += Math.max(lines1.length, lines2.length) * 4.8 + 9;
  }

  // Title full-width
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text("TITLE", margin, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39);
  const titleLines = wrapText(doc, complaint.title, contentW);
  doc.text(titleLines, margin, y + 4.5);
  y += titleLines.length * 5.5 + 9;

  fieldPair("DEPARTMENT", complaint.departmentName, "CATEGORY", complaint.categoryName);
  fieldPair("SUBMITTED", formatDate(complaint.createdAt), "LAST UPDATED", formatDate(complaint.updatedAt));

  if (complaint.resolvedAt) {
    fieldPair("RESOLVED AT", formatDate(complaint.resolvedAt), "ASSIGNED OFFICER", complaint.assignedOfficerName ?? "Unassigned");
  } else {
    fieldPair("ASSIGNED OFFICER", complaint.assignedOfficerName ?? "Unassigned", "FILED BY", complaint.citizenName);
  }

  // Description
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text("DESCRIPTION", margin, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  const descLines = wrapText(doc, complaint.description, contentW);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.8 + 7;

  // Location
  if (complaint.location) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text("LOCATION", margin, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    const locLines = wrapText(doc, complaint.location, contentW);
    doc.text(locLines, margin, y);
    y += locLines.length * 4.8 + 3;
    if (complaint.latitude && complaint.longitude) {
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `GPS: ${complaint.latitude.toFixed(6)}, ${complaint.longitude.toFixed(6)}`,
        margin, y
      );
      y += 6;
    }
  }

  // ── ACTIVITY TIMELINE ───────────────────────────────────────────────────
  y += 5;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.35);
  doc.line(margin, y, W - margin, y);
  y += 7;

  sectionHeader("Activity Timeline");

  const ROLE_LABELS: Record<string, string> = {
    CITIZEN: "Citizen",
    OFFICER: "Municipal Team",
    ADMIN: "Admin Officer",
  };

  const STATUS_TIMELINE_LABELS: Record<string, string> = {
    SUBMITTED: "Complaint Submitted",
    UNDER_REVIEW: "Under Review",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    REJECTED: "Rejected",
  };

  const timelineIndent = margin + 8; // text starts here
  const dotX = margin + 2.5;

  for (let i = 0; i < complaint.updates.length; i++) {
    const update = complaint.updates[i];
    const isLast = i === complaint.updates.length - 1;
    const isStatus = update.statusChangedTo !== null;

    // Estimate row height to decide page break
    const commentLines = update.comment
      ? wrapText(doc, update.comment, contentW - 12)
      : [];
    const rowH = isStatus
      ? 8 + (commentLines.length > 0 ? commentLines.length * 4.5 + 3 : 0) + 6
      : 6 + (commentLines.length > 0 ? commentLines.length * 4.2 + 2 : 0) + 5;

    if (y + rowH > H - 18) {
      doc.addPage();
      drawWatermark(doc, W, H);
      y = 16;
    }

    const dotY = y + 1.5;

    if (isStatus) {
      // ── STATUS CHANGE ENTRY ──────────────────────────────────────────
      const [cr, cg, cb] = STATUS_COLORS[update.statusChangedTo!] ?? [107, 114, 128];
      const [bgr, bgg, bgb] = statusBg(cr, cg, cb);

      // Filled coloured dot
      doc.setFillColor(cr, cg, cb);
      doc.circle(dotX, dotY, 2.2, "F");

      // Coloured pill badge for the status label
      const pillLabel = STATUS_TIMELINE_LABELS[update.statusChangedTo!] ?? update.statusChangedTo!;
      doc.setFontSize(8);
      const pillW = doc.getTextWidth(pillLabel) + 7;
      doc.setFillColor(bgr, bgg, bgb);
      doc.setDrawColor(cr, cg, cb);
      doc.setLineWidth(0.3);
      doc.roundedRect(timelineIndent, y - 1, pillW, 6, 1.5, 1.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(cr, cg, cb);
      doc.text(pillLabel, timelineIndent + pillW / 2, y + 3.2, { align: "center" });

      // Date · author (right of pill)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      const byLine = `${formatDate(update.createdAt)}  ·  ${ROLE_LABELS[update.authorRole] ?? update.authorName}`;
      doc.text(byLine, timelineIndent + pillW + 3, y + 3.2);

      y += 8;

      // Comment under the badge (if any)
      if (commentLines.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(55, 65, 81);
        doc.text(commentLines, timelineIndent, y);
        y += commentLines.length * 4.5 + 3;
      }
    } else {
      // ── PLAIN COMMENT ENTRY ──────────────────────────────────────────
      // Small hollow dot
      doc.setDrawColor(180, 188, 200);
      doc.setLineWidth(0.4);
      doc.circle(dotX, dotY, 1.5, "D");

      // "Comment" label — lighter, smaller
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 140, 155);
      doc.text("Comment", timelineIndent, y + 3);

      // Date · author inline
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(150, 158, 170);
      const byLine = `${formatDate(update.createdAt)}  ·  ${ROLE_LABELS[update.authorRole] ?? update.authorName}`;
      const labelW = doc.getTextWidth("Comment") + 3;
      doc.text(byLine, timelineIndent + labelW, y + 3);

      y += 6;

      // Comment text — indented, slightly muted
      if (commentLines.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(75, 85, 99);
        doc.text(commentLines, timelineIndent + 2, y);
        y += commentLines.length * 4.2 + 2;
      }
    }

    // Connector line to next item
    if (!isLast) {
      doc.setDrawColor(210, 215, 222);
      doc.setLineWidth(0.3);
      doc.line(dotX, dotY + 2.5, dotX, y + 1);
    }

    y += 5;
  }

  // ── FOOTER (all pages) ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Thin accent line above footer
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, H - 12, W - margin, H - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "Municipal Civic Track  ·  Citizen Complaint & Resolution Portal  ·  Khursheed Alam Khan",
      margin,
      H - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, W - margin, H - 7, { align: "right" });
  }

  doc.save(`CivicTrack-${complaint.trackingCode}.pdf`);
}
