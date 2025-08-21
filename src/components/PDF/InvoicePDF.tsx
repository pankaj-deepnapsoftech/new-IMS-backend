// @ts-nocheck
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ToWords } from "to-words";

// Company Information
const COMPANY_INFO = {
  name: "Deepnap Softech",
  address: "123 Street, Sector 28, Faridabad, Haryana - 121002",
  phone: "+91-1234567890",
  gstin: "DF56D4F48R96E5F",
  pan: "ABCDE1234F",
  email: "info@deepnapsoftech.com",
  bankName: "HDFC Bank",
  accountNo: "123456789123456",
  ifscCode: "F4H5ED08",
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  headerSection: {
    border: "1.5px solid #000",
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  sellerSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
  },
  invoiceNoSection: {
    width: "25%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
  },
  issueDateSection: {
    width: "25%",
    padding: 8,
    minHeight: 80,
  },
  buyerSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
  },
  documentDateSection: {
    width: "25%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
  },
  salesOrderDateSection: {
    width: "25%",
    padding: 8,
    minHeight: 80,
  },
  storeSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 60,
  },
  categorySection: {
    width: "25%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 60,
  },
  balanceSection: {
    width: "25%",
    padding: 8,
    minHeight: 60,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#2563eb",
  },
  sectionValue: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#374151",
  },
  table: {
    border: "1.5px solid #000",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottom: "1px solid #000",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    padding: 8,
    minHeight: 25,
  },
  tableCol1: {
    width: "8%",
    paddingRight: 4,
  },
  tableCol2: {
    width: "32%",
    paddingRight: 4,
  },
  tableCol3: {
    width: "15%",
    paddingRight: 4,
    textAlign: "center",
  },
  tableCol4: {
    width: "15%",
    paddingRight: 4,
    textAlign: "right",
  },
  tableCol5: {
    width: "15%",
    paddingRight: 4,
    textAlign: "right",
  },
  tableCol6: {
    width: "15%",
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  tableCellText: {
    fontSize: 9,
    color: "#374151",
  },
  totalsSection: {
    border: "1.5px solid #000",
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    padding: 8,
    minHeight: 25,
  },
  totalLabel: {
    width: "70%",
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  totalValue: {
    width: "30%",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
    color: "#1f2937",
  },
  amountInWords: {
    border: "1.5px solid #000",
    padding: 10,
    marginBottom: 15,
  },
  amountInWordsLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2563eb",
  },
  amountInWordsText: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#374151",
  },
  notesSection: {
    border: "1.5px solid #000",
    padding: 10,
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2563eb",
  },
  notesText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#374151",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  signatureBox: {
    width: "45%",
    minHeight: 60,
    border: "1px solid #000",
    padding: 10,
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#1f2937",
  },
  signatureLine: {
    borderBottom: "1px solid #000",
    width: "100%",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 9,
    textAlign: "center",
    color: "#6b7280",
  },
});

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: "Rupee",
      plural: "Rupees",
      symbol: "",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

interface InvoicePDFProps {
  invoice: {
    _id: string;
    invoice_no?: string;
    invoiceNo?: string;
    document_date?: string;
    sales_order_date?: string;
    category?: string;
    note?: string;
    subtotal?: number;
    total?: number;
    balance?: number;
    tax?: {
      tax_amount?: number;
      tax_name?: string;
    };
    creator?: {
      first_name?: string;
      last_name?: string;
    };
    buyer?: {
      _id?: string;
      name?: string;
      address?: string;
      gstin?: string;
      cust_id?: string;
    };
    supplier?: {
      _id?: string;
      name?: string;
      address?: string;
      gstin?: string;
      cust_id?: string;
    };
    store?: {
      _id?: string;
      name?: string;
      address?: string;
    };
    items?: Array<{
      item?: {
        _id?: string;
        name?: string;
        description?: string;
        hsn_code?: string;
      };
      quantity?: number;
      amount?: number;
    }>;
    // New comprehensive fields
    consigneeShipTo?: string;
    address?: string;
    gstin?: string;
    billerAddress?: string;
    billerGSTIN?: string;
    deliveryNote?: string;
    modeTermsOfPayment?: string;
    referenceNo?: string;
    otherReferences?: string;
    buyersOrderNo?: string;
    date?: string;
    dispatchDocNo?: string;
    deliveryNoteDate?: string;
    dispatchedThrough?: string;
    destination?: string;
    termsOfDelivery?: string;
    remarks?: string;
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return "0.00";
    return `${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getAmountInWords = (amount?: number) => {
    if (!amount && amount !== 0) return "Zero Rupees only";
    try {
      return toWords.convert(amount);
    } catch (error) {
      return `Rupees ${Math.floor(amount)} only`;
    }
  };

  const calculateTaxAmount = () => {
    const total = invoice.total || 0;
    const subtotal = invoice.subtotal || 0;
    return total - subtotal;
  };

  const customer = invoice.buyer || invoice.supplier;
  const isSupplier = !!invoice.supplier;

  // Safe access to nested properties
  const invoiceNumber = invoice.invoice_no || invoice.invoiceNo || "N/A";
  const documentDate =
    invoice.document_date || invoice.date || new Date().toISOString();
  const salesOrderDate =
    invoice.sales_order_date || invoice.date || new Date().toISOString();
  const category = invoice.category || "sale";
  const creatorName = invoice.creator
    ? `${invoice.creator.first_name || ""} ${
        invoice.creator.last_name || ""
      }`.trim() || "Unknown"
    : "Unknown";
  const storeName = invoice.store?.name || "Default Store";
  const storeAddress = invoice.store?.address || "";
  const items = invoice.items || [];
  const subtotal = invoice.subtotal || 0;
  const total = invoice.total || 0;
  const balance = invoice.balance || total;
  const taxAmount = invoice.tax?.tax_amount || 0;
  const taxName = invoice.tax?.tax_name || "No Tax";
  const note = invoice.note || invoice.remarks || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>{category.toUpperCase()} INVOICE</Text>

        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* First Row */}
          <View style={styles.headerRow}>
            <View style={styles.sellerSection}>
              <Text style={styles.sectionLabel}>
                {isSupplier ? "Buyer Details:" : "Seller Details:"}
              </Text>
              <Text style={styles.sectionValue}>
                {COMPANY_INFO.name}
                {"\n"}
                {COMPANY_INFO.address}
                {"\n"}
                Phone: {COMPANY_INFO.phone}
                {"\n"}
                GSTIN: {COMPANY_INFO.gstin}
                {"\n"}
                PAN: {COMPANY_INFO.pan}
                {"\n"}
                Email: {COMPANY_INFO.email}
              </Text>
            </View>
            <View style={styles.invoiceNoSection}>
              <Text style={styles.sectionLabel}>Invoice No:</Text>
              <Text style={styles.sectionValue}>{invoiceNumber}</Text>
            </View>
            <View style={styles.issueDateSection}>
              <Text style={styles.sectionLabel}>Issue Date:</Text>
              <Text style={styles.sectionValue}>
                {formatDate(documentDate)}
              </Text>
            </View>
          </View>

          {/* Second Row */}
          <View style={styles.headerRow}>
            <View style={styles.buyerSection}>
              <Text style={styles.sectionLabel}>
                {isSupplier ? "Supplier Details:" : "Buyer Details:"}
              </Text>
              <Text style={styles.sectionValue}>
                {customer?.name || "N/A"}
                {"\n"}
                {customer?.address || "Address not provided"}
                {"\n"}
                {customer?.gstin ? `GSTIN: ${customer.gstin}` : ""}
                {customer?.cust_id ? `\nCustomer ID: ${customer.cust_id}` : ""}
              </Text>
            </View>
            <View style={styles.documentDateSection}>
              <Text style={styles.sectionLabel}>Document Date:</Text>
              <Text style={styles.sectionValue}>
                {formatDate(documentDate)}
              </Text>
            </View>
            <View style={styles.salesOrderDateSection}>
              <Text style={styles.sectionLabel}>Sales Order Date:</Text>
              <Text style={styles.sectionValue}>
                {formatDate(salesOrderDate)}
              </Text>
            </View>
          </View>

          {/* Third Row */}
          <View style={[styles.headerRow, { borderBottom: "none" }]}>
            <View style={styles.storeSection}>
              <Text style={styles.sectionLabel}>Store:</Text>
              <Text style={styles.sectionValue}>
                {storeName}
                {storeAddress && `\n${storeAddress}`}
              </Text>
            </View>
            <View style={styles.categorySection}>
              <Text style={styles.sectionLabel}>Category:</Text>
              <Text style={styles.sectionValue}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
            <View style={styles.balanceSection}>
              <Text style={styles.sectionLabel}>Balance:</Text>
              <Text style={styles.sectionValue}>{formatCurrency(balance)}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableCol1}>
              <Text style={styles.tableHeaderText}>S.No</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.tableHeaderText}>HSN Code</Text>
            </View>
            <View style={styles.tableCol4}>
              <Text style={styles.tableHeaderText}>Quantity</Text>
            </View>
            <View style={styles.tableCol5}>
              <Text style={styles.tableHeaderText}>Rate</Text>
            </View>
            <View style={styles.tableCol6}>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.tableCellText}>{index + 1}</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.tableCellText}>
                  {item.item?.name || "Unknown Item"}
                  {item.item?.description && `\n${item.item.description}`}
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCellText}>
                  {item.item?.hsn_code || "N/A"}
                </Text>
              </View>
              <View style={styles.tableCol4}>
                <Text style={styles.tableCellText}>{item.quantity || 0}</Text>
              </View>
              <View style={styles.tableCol5}>
                <Text style={styles.tableCellText}>
                  {formatCurrency((item.amount || 0) / (item.quantity || 1))}
                </Text>
              </View>
              <View style={styles.tableCol6}>
                <Text style={styles.tableCellText}>
                  {formatCurrency(item.amount || 0)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {taxName} ({(taxAmount * 100).toFixed(0)}%):
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculateTaxAmount())}
            </Text>
          </View>
          <View
            style={[
              styles.totalRow,
              { borderBottom: "none", backgroundColor: "#f9fafb" },
            ]}
          >
            <Text
              style={[styles.totalLabel, { fontSize: 12, color: "#059669" }]}
            >
              Total Amount:
            </Text>
            <Text
              style={[styles.totalValue, { fontSize: 12, color: "#059669" }]}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountInWords}>
          <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
          <Text style={styles.amountInWordsText}>
            {getAmountInWords(total)}
          </Text>
        </View>

        {/* Bank Details Section */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Bank Details:</Text>
          <Text style={styles.notesText}>
            Bank Name: {COMPANY_INFO.bankName}
            {"\n"}
            Account No.: {COMPANY_INFO.accountNo}
            {"\n"}
            IFSC Code: {COMPANY_INFO.ifscCode}
          </Text>
        </View>

        {/* Notes Section */}
        {note && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{note}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Prepared By</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>{creatorName}</Text>
            <Text style={styles.signatureText}>
              Date: {formatDate(new Date().toISOString())}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>For {COMPANY_INFO.name}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Authorized Signatory</Text>
            <Text style={styles.signatureText}>Date: _______________</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
