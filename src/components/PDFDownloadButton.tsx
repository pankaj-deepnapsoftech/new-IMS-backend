// components/PDFDownloadButton.jsx
import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { generateProformaInvoicePDF, downloadPDF } from './utils/pdfGenerator';
import { toast } from 'react-toastify';

interface PDFDownloadButtonProps {
	invoiceData: any;
	allItems?: any[];
	className?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
	invoiceData,
	allItems = [],
	className = ""
}) => {

	const handleDownload = async () => {
		try {
			// Transform the invoice data to match the expected format
			const transformedData = {
				proforma_invoice_no: invoiceData.proforma_invoice_no,
				document_date: invoiceData.document_date,
				sales_order_date: invoiceData.sales_order_date,
				subtotal: invoiceData.subtotal,
				total: invoiceData.total,
				tax: invoiceData.tax,
				buyer: invoiceData.buyer,
				supplier: invoiceData.supplier,
				note: invoiceData.note
			};

			// Transform items to match the expected format
			const transformedItems = invoiceData.items?.map((item: any) => ({
				item: {
					value: item.item._id || item.item,
					label: item.item.name || 'Unknown Item'
				},
				quantity: item.quantity,
				price: item.amount || item.price
			})) || [];

			const doc = generateProformaInvoicePDF(transformedData, transformedItems, allItems);
			const filename = `Proforma_Invoice_${invoiceData.proforma_invoice_no || invoiceData._id}.pdf`;
			downloadPDF(doc, filename);

			toast.success('PDF downloaded successfully!');
		} catch (error) {
			console.error('Error generating PDF:', error);
			toast.error('Failed to generate PDF');
		}
	};

	return (
		<button
			onClick={handleDownload}
			className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 ${className}`}
			title="Download PDF"
		>
			<FiDownload className="w-4 h-4" />
			<span className="hidden sm:inline">Download PDF</span>
		</button>
	);
};

export default PDFDownloadButton;