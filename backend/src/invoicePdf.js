const PDFDocument = require('pdfkit');

/**
 * Generate a professional, high-fidelity Tax Invoice PDF buffer using PDFKit.
 * @param {Object} data - Invoice and customer details
 * @returns {Promise<Buffer>} - Resolves with the PDF buffer
 */
function generateInvoicePdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Tax Invoice - ${data.invoiceNumber || 'INV'}`,
          Author: 'OXOO Multiix Enterprise Suite',
          Subject: 'Tax Invoice & Payment Receipt',
          Keywords: 'Invoice, OXOO, Tax, Receipt, SaaS'
        }
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#091322';
      const accentColor = '#0284c7';
      const darkText = '#0f172a';
      const grayText = '#64748b';
      const lightBg = '#f8fafc';
      const borderColor = '#e2e8f0';

      const invoiceNumber = data.invoiceNumber || `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderNumber = data.orderNumber || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const storageId = data.storageId || 'STG-08643413';
      const customerName = data.customerName || 'Valued Customer';
      const companyName = data.companyName || 'My Organization';
      const customerEmail = data.toEmail || data.customerEmail || 'customer@example.com';
      const customerPhone = data.customerPhone || 'N/A';
      const planName = data.planName || 'Standard Pack';
      const billingCycle = (data.billingCycle || 'monthly').toLowerCase();
      const isYearly = billingCycle === 'yearly';
      const paymentId = data.paymentId || 'pay_rzp_verified';
      const paymentMethod = data.paymentMethod || 'Credit / Debit Card (Online)';
      const invoiceDate = data.invoiceDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const totalAmount = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount || '0').replace(/[^0-9.]/g, '')) || 0;
      // Reverse calculate subtotal & tax if total is given
      const subtotal = Number((totalAmount / 1.18).toFixed(2));
      const totalTax = Number((totalAmount - subtotal).toFixed(2));
      const cgst = Number((totalTax / 2).toFixed(2));
      const sgst = Number((totalTax - cgst).toFixed(2));

      // --- 1. Top Brand Banner ---
      doc.rect(40, 40, 515, 65).fill(primaryColor);

      doc.fillColor('#ffffff')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('OXOO', 56, 52);

      doc.fillColor('#38bdf8')
        .fontSize(9)
        .font('Helvetica')
        .text('MULTIIX ENTERPRISE SUITE', 56, 78);

      doc.fillColor('#ffffff')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 380, 52, { align: 'right', width: 160 });

      doc.fillColor('#22c55e')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('PAID & VERIFIED', 380, 76, { align: 'right', width: 160 });

      // --- 2. Invoice Meta Details ---
      let y = 120;
      doc.rect(40, y, 515, 60).fillAndStroke(lightBg, borderColor);

      doc.fillColor(grayText).fontSize(8).font('Helvetica-Bold').text('INVOICE NUMBER', 55, y + 10);
      doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text(invoiceNumber, 55, y + 22);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(`Order ID: ${orderNumber}`, 55, y + 36);

      doc.fillColor(grayText).fontSize(8).font('Helvetica-Bold').text('INVOICE DATE', 200, y + 10);
      doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text(invoiceDate, 200, y + 22);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(`Payment: ${paymentId}`, 200, y + 36);

      doc.fillColor(grayText).fontSize(8).font('Helvetica-Bold').text('CUSTOMER STORAGE ID', 360, y + 10);
      doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold').text(storageId, 360, y + 22);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(`Portal Login ID`, 360, y + 36);

      // --- 3. Billed To & Service Provider ---
      y = 195;
      const colWidth = 248;

      // Left Box: Billed To
      doc.rect(40, y, colWidth, 90).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentColor).fontSize(9).font('Helvetica-Bold').text('BILLED TO (CUSTOMER)', 52, y + 10);
      doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text(customerName, 52, y + 26);
      doc.fillColor(darkText).fontSize(9).font('Helvetica').text(companyName, 52, y + 40);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(`Email: ${customerEmail}`, 52, y + 54);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(`Phone: ${customerPhone}`, 52, y + 68);

      // Right Box: Provider
      doc.rect(307, y, colWidth, 90).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentColor).fontSize(9).font('Helvetica-Bold').text('ISSUED BY', 319, y + 10);
      doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold').text('OXOO Multiix Cloud Technologies', 319, y + 26);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text('Enterprise Cloud SaaS Platform', 319, y + 40);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text('GSTIN: 07AAFCO2026P1Z3 (Registered)', 319, y + 54);
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text('Website: https://oxoo.ai | support@oxoo.ai', 319, y + 68);

      // --- 4. Line Items Table ---
      y = 300;
      doc.rect(40, y, 515, 24).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('DESCRIPTION / SOFTWARE MODULES', 50, y + 7, { width: 230 });
      doc.text('BILLING CYCLE', 285, y + 7, { width: 75, align: 'center' });
      doc.text('USERS', 365, y + 7, { width: 45, align: 'center' });
      doc.text('RATE (INR)', 415, y + 7, { width: 60, align: 'right' });
      doc.text('AMOUNT (INR)', 480, y + 7, { width: 65, align: 'right' });

      y += 24;

      // Item Row
      const apps = Array.isArray(data.selectedApps) && data.selectedApps.length > 0
        ? data.selectedApps.map(a => typeof a === 'string' ? a : (a.name || a.id)).join(', ')
        : 'Business Application Suite';

      const rowHeight = 44;
      doc.rect(40, y, 515, rowHeight).fillAndStroke('#ffffff', borderColor);

      doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text(planName, 50, y + 8, { width: 230 });
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(`Modules: ${apps}`, 50, y + 22, { width: 230, lineBreak: true });

      doc.fillColor(darkText).fontSize(8).font('Helvetica').text(isYearly ? 'Annual (12 Mos)' : 'Monthly', 285, y + 14, { width: 75, align: 'center' });
      doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text(String(data.userCount || 1), 365, y + 14, { width: 45, align: 'center' });
      doc.fillColor(darkText).fontSize(8).font('Helvetica').text(subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 415, y + 14, { width: 60, align: 'right' });
      doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold').text(subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 480, y + 14, { width: 65, align: 'right' });

      y += rowHeight + 10;

      // --- 5. Tax Breakdown & Total ---
      const summaryX = 320;
      const summaryWidth = 235;

      doc.rect(summaryX, y, summaryWidth, 100).fillAndStroke(lightBg, borderColor);

      const printSummaryLine = (label, value, lineY, isBold = false) => {
        doc.fillColor(isBold ? darkText : grayText).fontSize(8).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(label, summaryX + 12, lineY);
        doc.fillColor(darkText).fontSize(8).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(value, summaryX + 12, lineY, { width: summaryWidth - 24, align: 'right' });
      };

      printSummaryLine('Subtotal (Net of Taxes):', `Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, y + 10);
      printSummaryLine('Central GST (CGST @ 9%):', `Rs. ${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, y + 26);
      printSummaryLine('State GST (SGST @ 9%):', `Rs. ${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, y + 42);
      printSummaryLine('Total GST (18.00%):', `Rs. ${totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, y + 58);

      // Grand Total Highlight Bar
      doc.rect(summaryX, y + 74, summaryWidth, 26).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('TOTAL PAID:', summaryX + 12, y + 82);
      doc.fillColor('#38bdf8').fontSize(11).font('Helvetica-Bold').text(`Rs. ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + 12, y + 81, { width: summaryWidth - 24, align: 'right' });

      // Left Box beside Summary: Customer Account Info
      const noteX = 40;
      const noteWidth = 265;
      doc.rect(noteX, y, noteWidth, 100).fillAndStroke('#eff6ff', '#bfdbfe');
      doc.fillColor(accentColor).fontSize(9).font('Helvetica-Bold').text('CUSTOMER PORTAL ACCESS', noteX + 12, y + 10);
      doc.fillColor(darkText).fontSize(8).font('Helvetica').text(`Storage ID: ${storageId}`, noteX + 12, y + 26);
      doc.fillColor(darkText).fontSize(8).font('Helvetica').text(`User / Login ID: ${customerEmail}`, noteX + 12, y + 40);
      doc.fillColor(grayText).fontSize(7.5).font('Helvetica').text('Your password has been configured. Log in to your Customer Dashboard at:', noteX + 12, y + 56, { width: noteWidth - 24 });
      doc.fillColor(accentColor).fontSize(8).font('Helvetica-Bold').text('https://oxoo.ai/login', noteX + 12, y + 78);

      // --- 6. Terms & Footer ---
      const footerY = 510;
      doc.rect(40, footerY, 515, 60).fillAndStroke(lightBg, borderColor);
      doc.fillColor(darkText).fontSize(8).font('Helvetica-Bold').text('TERMS & CONDITIONS', 52, footerY + 8);
      doc.fillColor(grayText).fontSize(7.5).font('Helvetica').text(
        '1. This tax invoice represents active cloud subscription entitlement for the selected software modules.\n' +
        '2. Payments once confirmed are processed electronically. For inquiries or invoice disputes, contact support@oxoo.ai within 7 days.\n' +
        '3. This is an electronically generated legal invoice compliant with GST requirements. No physical signature is required.',
        52, footerY + 20, { width: 495, lineBreak: true }
      );

      // Bottom Bar
      doc.fillColor(grayText).fontSize(8).font('Helvetica').text(
        `Generated on ${new Date().toISOString()} | OXOO Cloud Enterprise | Page 1 of 1`,
        40, 770, { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoicePdf };
