"""
Export Module — Generate PDF and CSV reports from analysis results
"""
import csv
import io
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def export_csv(result: dict, benchmarks: dict, filename: str) -> bytes:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Log Analyzer — Analysis Report"])
    writer.writerow(["File", filename])
    writer.writerow(["Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow([])
    writer.writerow(["Benchmark", "Value"])
    writer.writerow(["Total Lines", benchmarks.get("total_lines", 0)])
    writer.writerow(["Processing Speed (lines/sec)", benchmarks.get("lines_per_sec", 0)])
    writer.writerow(["Total Time (s)", benchmarks.get("t_total", 0)])
    writer.writerow(["Chunks", benchmarks.get("num_chunks", 0)])
    writer.writerow(["Workers", benchmarks.get("num_workers", 0)])
    writer.writerow([])
    writer.writerow(["Metric", "Count"])
    for k, v in sorted(result.items()):
        writer.writerow([k, v])
    return output.getvalue().encode("utf-8")


def export_pdf(result: dict, benchmarks: dict, filename: str, insights: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title = Paragraph(f"Log Analyzer — Analysis Report", styles["Title"])
    story.append(title)
    story.append(Spacer(1, 12))

    # Header info
    header_info = [
        ["File", filename],
        ["Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
    ]
    header_table = Table(header_info)
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 24))

    # Benchmarks Section
    story.append(Paragraph("MapReduce Benchmarks", styles["Heading2"]))
    story.append(Spacer(1, 6))
    benchmarks_data = [
        ["Benchmark", "Value"],
        ["Total Lines Processed", str(benchmarks.get("total_lines", 0))],
        ["Processing Speed", f"{benchmarks.get('lines_per_sec', 0)} lines/sec"],
        ["Total Time", f"{benchmarks.get('t_total', 0)}s"],
        ["Parallel Workers", str(benchmarks.get("num_workers", 0))],
        ["Chunks", str(benchmarks.get("num_chunks", 0))],
        ["Split Time", f"{benchmarks.get('t_split', 0)}s"],
        ["Map Time", f"{benchmarks.get('t_map', 0)}s"],
        ["Shuffle Time", f"{benchmarks.get('t_shuffle', 0)}s"],
        ["Reduce Time", f"{benchmarks.get('t_reduce', 0)}s"],
    ]
    bm_table = Table(benchmarks_data)
    bm_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.green),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(bm_table)
    story.append(Spacer(1, 24))

    # HTTP Errors
    errors = {k: v for k, v in result.items() if k.startswith("HTTP_")}
    if errors:
        story.append(Paragraph("HTTP Status Code Distribution", styles["Heading2"]))
        story.append(Spacer(1, 6))
        error_data = [["Status Code", "Count"]]
        for k, v in sorted(errors.items()):
            error_data.append([k, str(v)])
        err_table = Table(error_data)
        err_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.red),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightpink),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(err_table)
        story.append(Spacer(1, 24))

    # Traffic
    hours = {k: v for k, v in result.items() if k.startswith("Hour_")}
    if hours:
        story.append(Paragraph("Traffic by Hour", styles["Heading2"]))
        story.append(Spacer(1, 6))
        hour_data = [["Hour", "Requests"]]
        for k, v in sorted(hours.items()):
            label = k.replace("Hour_", "") + ":00"
            hour_data.append([label, str(v)])
        hr_table = Table(hour_data)
        hr_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(hr_table)
        story.append(Spacer(1, 24))

    # AI Insights
    if insights:
        story.append(Paragraph("AI-Powered Insights", styles["Heading2"]))
        story.append(Spacer(1, 6))
        for ins in insights:
            severity = ins.get('severity', 'low').upper()
            title = ins.get('title', '')
            detail = ins.get('detail', '')
            p = Paragraph(f"<b>[{severity}]</b> {title}<br/><br/>{detail}", styles["BodyText"])
            story.append(p)
            story.append(Spacer(1, 12))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
