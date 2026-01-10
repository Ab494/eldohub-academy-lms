import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export const generateCertificatePDF = (studentName, courseName, completionDate, certificateId) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    let buffers = [];

    doc.on('data', (buffer) => buffers.push(buffer));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f0f0');

    // Border
    doc.strokeColor('#333').lineWidth(3);
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

    // Title
    doc.fillColor('#333');
    doc.fontSize(48).font('Helvetica-Bold').text('CERTIFICATE', 0, 100, {
      align: 'center',
    });

    doc.fontSize(20).font('Helvetica').text('of Completion', 0, 160, {
      align: 'center',
    });

    // Divider
    doc.moveTo(100, 210).lineTo(doc.page.width - 100, 210).stroke();

    // Text
    doc.fontSize(16).text('This is to certify that', 0, 250, { align: 'center' });

    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#0066cc')
      .text(studentName, 0, 290, { align: 'center' });

    doc.fontSize(16).fillColor('#333').text('has successfully completed the course', 0, 350, {
      align: 'center',
    });

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#0066cc')
      .text(courseName, 0, 390, { align: 'center' });

    doc.fontSize(12).fillColor('#666').text(`Completion Date: ${completionDate}`, 0, 450, {
      align: 'center',
    });

    doc.fontSize(10).text(`Certificate ID: ${certificateId}`, 0, 480, {
      align: 'center',
    });

    // Signature lines
    doc
      .fontSize(12)
      .fillColor('#333')
      .text('_________________', 80, 550)
      .text('Oval Training Institute "OTI"', 80, 570);

    doc.text('_________________', doc.page.width - 220, 550).text('Date', doc.page.width - 220, 570);

    doc.end();
  });
};
