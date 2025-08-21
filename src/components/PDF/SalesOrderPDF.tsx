// @ts-nocheck
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ToWords } from "to-words";

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
  companySection: {
    width: "40%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  orderDetailsSection: {
    width: "15%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  dateSection: {
    width: "15%",
    padding: 8,
  },
  merchantSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  paymentSection: {
    width: "30%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  emptySection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  billToSection: {
    width: "40%",
    padding: 8,
  },
  termsSection: {
    width: "60%",
    padding: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 11,
    lineHeight: 1.3,
    color: "#000",
    fontWeight: "normal",
  },
  table: {
    width: "100%",
    border: "1.5px solid #000",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 10,
  },
  col1: {
    width: "10%",
    padding: 8,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  col2: {
    width: "42%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "left",
    fontSize: 10,
  },
  col3: {
    width: "11%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  col4: {
    width: "12%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  col5: {
    width: "12%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  col6: {
    width: "13%",
    padding: 6,
    textAlign: "center",
    fontSize: 10,
  },
  totalRow: {
    fontWeight: "bold",
    backgroundColor: "#f8f8f8",
    fontSize: 11,
  },
  amountInWords: {
    padding: 10,
    border: "1px solid #000",
    minHeight: 50,
    marginTop: 15,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
  },
  amountValue: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#000",
    fontWeight: "normal",
  },
  bankDetails: {
    lineHeight: 1.4,
    fontSize: 10,
  },
  bankLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
  },
  signatureContainer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  bankDetailsAboveSignature: {
    width: "55%",
  },
  signatureBox: {
    width: "40%",
    border: "1px solid #000",
    padding: 10,
    minHeight: 80,
    textAlign: "center",
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
    textTransform: "uppercase",
  },
  termsOfDeliverySection: {
    marginTop: 25,
    padding: 15,
    border: "1px solid #000",
    minHeight: 75,
  },
  termsOfDeliveryLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textTransform: "uppercase",
  },
  termsWritingSpace: {
    marginTop: 10,
  },
  blankLine: {
    fontSize: 10,
    marginBottom: 12,
    color: "#ccc",
    letterSpacing: 0.5,
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

const SalesOrderPDF = ({ sale }: any) => {
  const subtotal = sale.price * sale.product_qty;
  const gstAmount = (subtotal * sale.GST) / 100;
  const total = subtotal + gstAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>SALES ORDER</Text>

        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Row 1: Company, Order No, Date */}
          <View style={styles.headerRow}>
            <View style={styles.merchantSection}>
              <Text style={styles.sectionLabel}>Merchant Name</Text>
              <Text style={styles.sectionValue}>
                {sale?.party?.consignee_name?.[0]?.length > 0
                  ? sale?.party?.consignee_name
                  : sale?.party?.company_name}
              </Text>
            </View>
            <View style={styles.emptySection}>
              <Text style={styles.sectionLabel}>Bill To Address</Text>
              <Text style={styles.sectionValue}>
                {sale.party?.bill_to || "N/A"}
              </Text>
            </View>
          </View>

          {/* Row 2: Merchant, Payment, Empty */}
          <View style={styles.headerRow}>
            <View style={styles.companySection}>
              <Text style={styles.sectionLabel}>Company Name</Text>
              <Text style={styles.sectionValue}>Deepnap Softech</Text>
            </View>
            <View style={styles.paymentSection}>
              <Text style={styles.sectionLabel}>Mode of Payment</Text>
              <Text style={styles.sectionValue}>
                {sale.mode_of_payment || "N/A"}
              </Text>
            </View>
            <View style={styles.orderDetailsSection}>
              <Text style={styles.sectionLabel}>Order No</Text>
              <Text style={styles.sectionValue}>{sale.order_id}</Text>
            </View>
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>Date</Text>
              <Text style={styles.sectionValue}>
                {new Date(sale.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.col1}>S. No.</Text>
            <Text style={styles.col2}>Product Name</Text>
            <Text style={styles.col3}>Quantity</Text>
            <Text style={styles.col4}>SubTotal</Text>
            <Text style={styles.col5}>GST</Text>
            <Text style={styles.col6}>Total Price</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>1</Text>
            <Text style={styles.col2}>
              {sale.product_id?.[0]?.name || "N/A"}
            </Text>
            <Text style={styles.col3}>{sale.product_qty}</Text>
            <Text style={styles.col4}>{subtotal.toFixed(2)}</Text>
            <Text style={styles.col5}>{sale.GST}%</Text>
            <Text style={styles.col6}>{total.toFixed(2)}</Text>
          </View>

          {/* Empty rows for spacing */}
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}></Text>
              <Text style={styles.col2}></Text>
              <Text style={styles.col3}></Text>
              <Text style={styles.col4}></Text>
              <Text style={styles.col5}></Text>
              <Text style={styles.col6}></Text>
            </View>
          ))}

          {/* Total Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={styles.col1}></Text>
            <Text style={styles.col2}>Total</Text>
            <Text style={styles.col3}>{sale.product_qty}</Text>
            <Text style={styles.col4}>{subtotal.toFixed(2)}</Text>
            <Text style={styles.col5}>{gstAmount.toFixed(2)}</Text>
            <Text style={styles.col6}>{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountInWords}>
          <Text style={styles.amountLabel}>Amount in Words:</Text>
          <Text style={styles.amountValue}>
            {toWords.convert(Number(total), { currency: true })}
          </Text>
        </View>

        {/* Company Bank Details and Signature */}
        <View style={styles.signatureContainer}>
          <View style={styles.bankDetailsAboveSignature}>
            <Text style={styles.bankLabel}>Company Bank Details:</Text>
            <Text style={styles.bankDetails}>
              Bank Name: HDFC Bank{"\n"}
              Account No.: 123456789123456{"\n"}
              IFSC Code: F4H5ED08
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <Text style={{ marginTop: 40, fontSize: 10 }}>
              _________________________
            </Text>
          </View>
        </View>

        <View style={styles.termsOfDeliverySection}>
          <Text style={styles.termsOfDeliveryLabel}>Terms of Delivery:</Text>
          <View style={styles.termsWritingSpace}>
            {[...Array(8)].map((_, i) => (
              <Text key={i} style={styles.blankLine}>
                _________________________________________________________________
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SalesOrderPDF;
