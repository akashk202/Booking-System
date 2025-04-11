const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, '../utils/fonts/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '../utils/fonts/Roboto-Medium.ttf'),
    italics: path.resolve(__dirname, '../utils/fonts/Roboto-Italic.ttf'),
    bolditalics: path.resolve(__dirname, '../utils/fonts/Roboto-MediumItalic.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

async function generateBookingPDF(booking) {
  const docDefinition = {
    content: [
      { text: 'Booking Report', style: 'header' },
      `Name: ${booking.userId?.name || 'N/A'}`,
      `Room: ${booking.roomId?.name || 'N/A'}`,
      `Date: ${new Date(booking.createdAt).toLocaleDateString()}`,
      `Status: ${booking.status}`,
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
    },
  };

  const pdfDir = path.resolve(__dirname, '../pdfs');

  // ✅ Create directory if it doesn't exist
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
  }

  const filePath = path.join(pdfDir, `booking-${booking._id}.pdf`);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.end();

  return filePath;
}

module.exports = { generateBookingPDF };
