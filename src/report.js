import { jsPDF } from 'jspdf';
import { totals, monthLabel, dateLabel, today } from './model.js';

// Standard PDF fonts lack the colon currency glyph. CRC keeps amounts legible.
const currency = n => `CRC ${new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n).replace(/\u00a0/g, ' ')}`;
const safeText = text => String(text).replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
export function createReport(period) {
  const pdf = new jsPDF();
  const { spent, remaining, categories } = totals(period);
  const ink = '#233c35';
  const heading = title => {
    pdf.setFillColor('#f3f5ef'); pdf.rect(0, 0, 210, 43, 'F');
    pdf.setTextColor(ink); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(22);
    pdf.text(safeText(title), 18, 22);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
    pdf.text(`POCKETS / Informe de gastos / Generado: ${safeText(dateLabel(today()))}`, 18, 33);
  };
  heading(monthLabel(period.date).replace(/^./, c => c.toUpperCase()));
  pdf.setFontSize(11);
  const sourceLines = pdf.splitTextToSize(`Ingreso: ${safeText(period.source)}`, 170);
  pdf.text(sourceLines, 18, 54);
  const base = 54 + sourceLines.length * 5;
  pdf.text(`Periodo: ${safeText(dateLabel(period.date))} al ${safeText(dateLabel(period.closedAt || today()))}`, 18, base + 3);
  pdf.text(`Ingreso recibido: ${currency(period.income)}`, 18, base + 11);

  const chartY = base + 20;
  if (spent > 0) {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 640;
    const ctx = canvas.getContext('2d'); let start = -Math.PI / 2;
    for (const category of categories.filter(c => c.amount > 0)) {
      const end = start + category.amount / spent * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(320, 320); ctx.arc(320, 320, 305, start, end); ctx.closePath();
      ctx.fillStyle = category.color; ctx.fill(); start = end;
    }
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 18, chartY, 66, 66);
  } else {
    pdf.setDrawColor('#d5ddd8'); pdf.circle(51, chartY + 33, 28); pdf.setFontSize(10); pdf.text('Sin gastos', 51, chartY + 34, { align: 'center' });
  }
  categories.forEach((category, index) => {
    const y = chartY + 5 + index * 8;
    pdf.setFillColor(category.color); pdf.circle(96, y - 1, 1.6, 'F');
    pdf.setTextColor(ink); pdf.setFontSize(10);
    pdf.text(category.name, 101, y); pdf.text(currency(category.amount), 192, y, { align: 'right' });
  });
  let y = chartY + 72;
  const tableHeader = () => {
    pdf.setFontSize(10); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(ink);
    pdf.text('Fecha / Categoria / Detalle', 18, y); pdf.text('Monto', 192, y, { align: 'right' });
    pdf.setDrawColor('#d5ddd8'); pdf.line(18, y + 3, 192, y + 3); y += 11;
    pdf.setFont('helvetica', 'normal');
  };
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.text('Detalle de gastos', 18, y); y += 10; tableHeader();
  for (const expense of [...period.expenses].sort((a, b) => a.date.localeCompare(b.date))) {
    const category = categories.find(c => c.id === expense.category);
    const lines = pdf.splitTextToSize(safeText(`${dateLabel(expense.date)} / ${category.name}${expense.note ? ` / ${expense.note}` : ''}`), 122);
    const height = lines.length * 5 + 5;
    if (y + height > 264) { pdf.addPage(); heading('Detalle de gastos'); y = 56; tableHeader(); }
    pdf.setFontSize(10); pdf.text(lines, 18, y); pdf.text(currency(expense.amount), 192, y, { align: 'right' }); y += height;
  }
  if (!period.expenses.length) { pdf.text('No se registraron gastos en este periodo.', 18, y); y += 12; }
  if (y + 28 > 274) { pdf.addPage(); heading('Totales del periodo'); y = 56; }
  pdf.setDrawColor('#38796a'); pdf.line(18, y, 192, y); y += 10;
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
  pdf.text('TOTAL DE GASTOS', 18, y); pdf.text(currency(spent), 192, y, { align: 'right' }); y += 10;
  pdf.text(remaining < 0 ? 'SALDO EN NEGATIVO' : 'SALDO DISPONIBLE', 18, y); pdf.text(currency(remaining), 192, y, { align: 'right' });
  const count = pdf.getNumberOfPages();
  for (let page = 1; page <= count; page++) {
    pdf.setPage(page); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor('#65736b');
    pdf.text('Montos en colones costarricenses (CRC).', 18, 286);
    pdf.text(`${page} / ${count}`, 192, 286, { align: 'right' });
  }
  return pdf;
}
export function downloadReport(period) {
  createReport(period).save(`Pockets-${period.date}-${period.id.slice(0, 8)}.pdf`);
}
