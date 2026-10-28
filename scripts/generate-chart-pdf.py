"""Regenerate the published chart with Python/reportlab and Node.js available.

Run from any directory: python scripts/generate-chart-pdf.py
Values and presentation rounding come from the application's shared math module.
The generated PDF is committed as a static asset; hosting needs no Python runtime.
"""
import json
import subprocess
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
source = """
import {generateSquareRootCurveChart, formatCurveValue} from './src/lib/squareRootCurve.ts';
console.log(JSON.stringify(generateSquareRootCurveChart().map(({raw,curved}) => [raw,formatCurveValue(curved)])));
"""
entries = json.loads(subprocess.run(
    ['node', '--experimental-strip-types', '--input-type=module', '-e', source],
    cwd=ROOT, check=True, capture_output=True, text=True,
).stdout)
target = ROOT / 'public' / 'square-root-curve-chart.pdf'
pdf = canvas.Canvas(str(target), pagesize=letter, invariant=1, pageCompression=0)
pdf.setTitle('Square Root Curve Chart (0-100) | SquareRootCurve.com')
pdf.setAuthor('SquareRootCurve.com')
ink, blue, rule = (HexColor(c) for c in ['#181816', '#244B6B', '#D5CFC2'])
pdf.setFillColor(ink)
pdf.setFont('Times-Bold', 23)
pdf.drawString(42, 744, 'Square Root Curve Chart')
pdf.setFont('Helvetica', 10)
pdf.drawString(42, 723, 'Complete 0-100 percentage reference')
pdf.setFont('Courier', 10)
pdf.drawString(42, 698, 'Curved percentage = 10 x sqrt(raw percentage)')
pdf.setFont('Helvetica', 9)
pdf.drawString(42, 680, 'Example: 64% raw becomes 80% curved (+16 percentage points).')
for group in range(3):
    left = 42 + group * 180
    pdf.setFillColor(ink)
    pdf.setFont('Helvetica-Bold', 9)
    pdf.drawRightString(left + 58, 650, 'RAW (%)')
    pdf.drawRightString(left + 148, 650, 'CURVED (%)')
    pdf.setStrokeColor(ink)
    pdf.line(left, 642, left + 158, 642)
    for offset, (raw, curved) in enumerate(entries[group * 34:(group + 1) * 34]):
        y = 626 - offset * 14
        pdf.setStrokeColor(rule)
        pdf.setLineWidth(0.3)
        pdf.line(left, y - 5, left + 158, y - 5)
        pdf.setFillColor(ink)
        pdf.setFont('Courier', 9)
        pdf.drawRightString(left + 58, y, str(raw))
        pdf.setFillColor(blue)
        pdf.drawRightString(left + 148, y, curved)
pdf.setFillColor(ink)
pdf.setFont('Helvetica', 9)
pdf.drawString(42, 128, 'Values are rounded to the nearest tenth; unnecessary .0 is omitted.')
pdf.drawString(42, 112, 'For points: convert earned / possible x 100 to a percentage first.')
pdf.drawString(42, 96, 'Confirm the curve and final rounding with your instructor. 0 and 100 stay unchanged.')
pdf.setStrokeColor(rule)
pdf.line(42, 75, 570, 75)
pdf.setFont('Helvetica', 9)
pdf.drawString(42, 57, 'SquareRootCurve.com')
pdf.linkURL('https://squarerootcurve.com/square-root-curve-chart/', (42, 52, 160, 69))
pdf.drawRightString(570, 57, 'Calculation details: squarerootcurve.com/methodology/')
pdf.showPage()
pdf.save()
print(target)
