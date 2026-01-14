import PDFDocument from 'pdfkit';
import type { Expense } from '../domain/expense.entity';

export class PdfExporter {
  async toBuffer(rows: Expense[]) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Header
    doc.fontSize(16).text('Expenses Export');
    doc.moveDown(0.25);
    doc.fontSize(10).fillColor('gray').text(`Rows: ${rows.length}`);
    doc.fillColor('black');
    doc.moveDown(1);

    // Column positions
    const xDesc = 40;
    const xCat = 285;
    const xAmt = 380;
    const xDate = 460;

    // Table header
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Description', xDesc, doc.y, { width: 235 });
    doc.text('Category', xCat, doc.y, { width: 90 });
    doc.text('Amount', xAmt, doc.y, { width: 70, align: 'right' });
    doc.text('Date', xDate, doc.y, { width: 95 });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9);

    // Rows
    for (const r of rows.slice(0, 500)) {
      const date =
        r.date instanceof Date ? r.date.toISOString() : String(r.date);
      const y = doc.y;

      // basic page break
      if (y > 760) {
        doc.addPage();
      }

      doc.text(String(r.description ?? '').slice(0, 60), xDesc, doc.y, {
        width: 235,
      });
      doc.text(String(r.category ?? '').slice(0, 18), xCat, y, { width: 90 });
      doc.text(String(r.amount ?? ''), xAmt, y, { width: 70, align: 'right' });
      doc.text(date.slice(0, 10), xDate, y, { width: 95 });

      doc.moveDown(0.6);
    }

    doc.end();
    return done;
  }
}
