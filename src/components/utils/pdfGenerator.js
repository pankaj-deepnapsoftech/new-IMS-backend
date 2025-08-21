// utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateProformaInvoicePDF = (invoiceData, items, allItems) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFORMA INVOICE', 105, 20, { align: 'center' });
  
  // Page info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Pages', 185, 30);
  doc.text('1 of 1', 185, 35);
  
  // Draw borders and sections
  // Main container
  doc.rect(10, 40, 190, 250);
  
  // Seller section
  doc.rect(10, 40, 95, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Seller', 12, 48);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const sellerText = `Itsybizz Powered by Deepnap Softech
Plot No. 121B, 2nd floor, Sector-31,
HSIIDC, Faridabad, Haryana 121003`;
  
  const sellerLines = doc.splitTextToSize(sellerText, 90);
  doc.text(sellerLines, 12, 55);
  
  // Invoice details section (right side)
  doc.rect(105, 40, 95, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Invoice Number', 107, 48);
  doc.text('Issue Date', 148, 48);
  doc.text('Buyer Reference', 107, 58);
  doc.text('Due Date', 148, 58);
  
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.proforma_invoice_no || '', 107, 53);
  doc.text(formatDate(invoiceData.document_date) || '', 148, 53);
  doc.text('', 107, 63); // Buyer Reference - blank
  doc.text('', 148, 63); // Due Date - blank
  
  // Buyer section
  doc.rect(10, 90, 95, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Buyer', 12, 98);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const buyerName = invoiceData.supplier?.name || invoiceData.buyer?.name || '';
  doc.text(buyerName, 12, 108);
  
  // Delivery Date section
  doc.rect(105, 70, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Delivery Date', 107, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoiceData.sales_order_date) || '', 107, 85);
  
  // Shipping details section
  doc.rect(10, 140, 190, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Method of Dispatch', 12, 148);
  doc.text('Type of Shipment', 70, 148);
  doc.text('Terms / Method of Payment', 130, 148);
  doc.text('Port of Loading', 12, 158);
  doc.text('Port of Discharge', 70, 158);
  
  // Items table header
  const tableStartY = 170;
  doc.rect(10, tableStartY, 190, 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Product Code', 12, tableStartY + 8);
  doc.text('Description of Goods', 45, tableStartY + 8);
  doc.text('Unit Quantity', 95, tableStartY + 8);
  doc.text('Unit Type', 125, tableStartY + 8);
  doc.text('Price', 150, tableStartY + 8);
  doc.text('Amount', 175, tableStartY + 8);
  
  // Draw vertical lines for table
  doc.line(40, tableStartY, 40, tableStartY + 15); // Product Code
  doc.line(90, tableStartY, 90, tableStartY + 15); // Description
  doc.line(120, tableStartY, 120, tableStartY + 15); // Quantity
  doc.line(145, tableStartY, 145, tableStartY + 15); // Unit Type
  doc.line(170, tableStartY, 170, tableStartY + 15); // Price
  
  // Items data
  let currentY = tableStartY + 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  items.forEach((item, index) => {
    const product = allItems.find(p => p._id === item.item.value);
    const rowHeight = 12;
    
    // Draw row
    doc.rect(10, currentY, 190, rowHeight);
    
    // Draw vertical lines
    doc.line(40, currentY, 40, currentY + rowHeight);
    doc.line(90, currentY, 90, currentY + rowHeight);
    doc.line(120, currentY, 120, currentY + rowHeight);
    doc.line(145, currentY, 145, currentY + rowHeight);
    doc.line(170, currentY, 170, currentY + rowHeight);
    
    // Fill data
    doc.text(product?.code || `P${index + 1}`, 12, currentY + 7);
    doc.text(product?.name || item.item.label, 42, currentY + 7);
    doc.text(item.quantity.toString(), 92, currentY + 7);
    doc.text(product?.unit || 'Pcs', 122, currentY + 7);
    doc.text(`₹${item.price.toFixed(2)}`, 147, currentY + 7);
    doc.text(`₹${(item.quantity * item.price).toFixed(2)}`, 172, currentY + 7);
    
    currentY += rowHeight;
  });
  
  // Add some empty rows for spacing
  const emptyRows = 3;
  for (let i = 0; i < emptyRows; i++) {
    doc.rect(10, currentY, 190, 12);
    doc.line(40, currentY, 40, currentY + 12);
    doc.line(90, currentY, 90, currentY + 12);
    doc.line(120, currentY, 120, currentY + 12);
    doc.line(145, currentY, 145, currentY + 12);
    doc.line(170, currentY, 170, currentY + 12);
    currentY += 12;
  }
  
  // Total section
  const totalStartY = currentY;
  doc.rect(10, totalStartY, 190, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);	 
  doc.text('Total This Page', 12, totalStartY + 8);
  doc.text(`₹${invoiceData.subtotal?.toFixed(2) || '0.00'}`, 172, totalStartY + 8);
  
  doc.rect(10, totalStartY + 12, 190, 12);
  doc.text('Consignment Total', 12, totalStartY + 20);
  doc.text(`₹${invoiceData.total?.toFixed(2) || '0.00'}`, 172, totalStartY + 20);
  
  // Bottom section
  const bottomStartY = totalStartY + 24;
  doc.rect(10, bottomStartY, 95, 40);
  doc.rect(105, bottomStartY, 95, 40);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Additional Info', 12, bottomStartY + 8);
  doc.text('TOTAL:', 107, bottomStartY + 8);
  doc.text('Bank Details', 12, bottomStartY + 30);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Incoterms® 2020', 107, bottomStartY + 15);
  doc.text('Currency', 150, bottomStartY + 15);
  doc.text('Signatory Company', 107, bottomStartY + 22);
  doc.text('Name of Authorized Signatory', 107, bottomStartY + 30);
  doc.text('Signature', 107, bottomStartY + 37);
  
  // Add tax information if available
  if (invoiceData.tax && invoiceData.tax.tax_name) {
    doc.setFontSize(8);
    doc.text(`Tax: ${invoiceData.tax.tax_name}`, 12, bottomStartY + 15);
    doc.text(`Tax Amount: ₹${(invoiceData.total - invoiceData.subtotal).toFixed(2)}`, 12, bottomStartY + 22);
  }
  
  return doc;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};