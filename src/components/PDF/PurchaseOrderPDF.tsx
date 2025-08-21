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
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
  },
  purchaseOrderSection: {
    width: "25%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
  },
  dateSection: {
    width: "25%",
    padding: 8,
    minHeight: 80,
  },
  supplierSection: {
    width: "33.33%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 30,
  },
  gstinSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 30,
  },
  panSection: {
    width: "50%",
    padding: 8,
    minHeight: 30,
  },
  // emailSection: {
  //   width: "100%",
  //   padding: 8,
  //   borderTop: "1px solid #000",
  //   minHeight: 40,
  // },
  subjectSection: {
    width: "100%",
    padding: 8,
    borderTop: "1px solid #000",
    minHeight: 40,
  },
  termsSection: {
    width: "100%",
    padding: 8,
    borderTop: "1px solid #000",
    minHeight: 50,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 11,
    lineHeight: 1.3,
    color: "#000",
    fontWeight: "normal",
    marginBottom: 5,
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
  colSno: {
    width: "9%",
    padding: 8,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colItem: {
    width: "20%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colItemCode: {
    width: "14%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colHsnCode: {
    width: "14%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colQty: {
    width: "10%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colRate: {
    width: "11%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colTax: {
    width: "12%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  colAmount: {
    width: "10%",
    padding: 6,
    textAlign: "center",
    fontSize: 10,
  },
  totalSection: {
    backgroundColor: "#f8f8f8",
    fontWeight: "bold",
    fontSize: 11,
  },
  amountInWords: {
    padding: 10,
    border: "1px solid #000",
    minHeight: 50,
    marginTop: 15,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
  },
  amountValue: {
    fontSize: 12,
    lineHeight: 1.4,
    color: "#000",
    fontWeight: "normal",
  },
  termsConditionsSection: {
    marginTop: 15,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textTransform: "uppercase",
  },
  termsList: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 15,
  },
  remarksSection: {
    marginTop: 10,
  },
  remarksTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
  },
  remarksText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 10,
  },
  importantSection: {
    marginTop: 10,
  },
  importantTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
  },
  importantText: {
    fontSize: 10,
    lineHeight: 1.4,
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

const PurchaseOrderPDF = ({ purchaseOrder }: any) => {
  // Handle both new items array structure and legacy single item structure
  const items =
    purchaseOrder?.items && purchaseOrder.items.length > 0
      ? purchaseOrder.items
      : [
          {
            itemName:
              purchaseOrder?.itemName ||
              purchaseOrder?.product?.name ||
              "Sample Item",
            quantity: purchaseOrder?.quantity || 1,
            unitPrice: purchaseOrder?.unitPrice || 100,
            totalPrice:
              purchaseOrder?.totalPrice ||
              (purchaseOrder?.quantity || 1) *
                (purchaseOrder?.unitPrice || 100),
            productId: purchaseOrder?.product?.product_id || "ITM001",
          },
        ];

  // Calculate totals from actual items
  const baseAmount = items.reduce(
    (sum, item) => sum + (item.totalPrice || item.quantity * item.unitPrice),
    0
  );

  // Dynamic GST calculation based on GSTApply value
  const isIGST = purchaseOrder?.GSTApply === "igst";
  const cgstRate = 9; // 9% CGST
  const sgstRate = 9; // 9% SGST
  const igstRate = 18; // 18% IGST

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let grandTotal = baseAmount;

  if (isIGST) {
    igst = (baseAmount * igstRate) / 100;
    grandTotal = baseAmount + igst;
  } else {
    cgst = (baseAmount * cgstRate) / 100;
    sgst = (baseAmount * sgstRate) / 100;
    grandTotal = baseAmount + cgst + sgst;
  }

  console.log("Purchase Order Data:", purchaseOrder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PURCHASE ORDER</Text>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.supplierSection}>
              <Text style={styles.sectionLabel}>P.O. No:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.poOrder || "PO001"}
              </Text>
            </View>
            {/* <View style={styles.gstinSection}></View> */}
            <View style={styles.panSection}>
              <Text style={styles.sectionLabel}>Date:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.date
                  ? new Date(purchaseOrder.date).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Row 1: Company Details, P.O. No, Date */}
          <View style={styles.headerRow}>
            <View style={styles.companySection}>
              <Text style={styles.sectionLabel}>Company Name:</Text>
              <Text style={styles.sectionValue}>Deepnap Softech</Text>
              <Text style={styles.sectionLabel}>Address:</Text>
              <Text style={styles.sectionValue}>
                123 Street, Sector 28, Faridabad, Haryana - 1210002
              </Text>
              <Text style={styles.sectionLabel}>Phone No.:</Text>
              <Text style={styles.sectionValue}>+91-1234567890</Text>
              <Text style={styles.sectionLabel}>Our GSTIN:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplierShippedGSTIN || "N/A"}
              </Text>
              <Text style={styles.sectionLabel}>Our PAN No.:</Text>
              <Text style={styles.sectionValue}>ABCDE1234F</Text>
              <Text style={styles.sectionLabel}>Email:</Text>
              <Text style={styles.sectionValue}>info@deepnapsoftech.com</Text>
            </View>

            <View style={styles.companySection}>
              <Text style={styles.sectionLabel}>Supplier Name:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplier?.company_name ||
                  purchaseOrder?.supplier?.consignee_name?.[0] ||
                  purchaseOrder?.supplierName ||
                  "Supplier Name"}
              </Text>
              <Text style={styles.sectionLabel}>Supplier Address:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplier?.address?.[0] ||
                  purchaseOrder?.supplierShippedTo ||
                  "Supplier Address"}
              </Text>
              <Text style={styles.sectionLabel}>Supplier Code:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplier?.cust_id || "SUP001"}
              </Text>
              <Text style={styles.sectionLabel}>Supplier GSTIN:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplier?.gst_number?.[0] ||
                  purchaseOrder?.supplierBillGSTIN ||
                  "N/A"}
              </Text>
              <Text style={styles.sectionLabel}>Supplier PAN No.:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplier?.pan_number || "FGHIJ5678K"}
              </Text>
              <Text style={styles.sectionLabel}>Supplier Email:</Text>
              <Text style={styles.sectionValue}>
                {purchaseOrder?.supplier?.email_id?.[0] ||
                  purchaseOrder?.supplierEmail ||
                  "supplier@email.com"}
              </Text>
            </View>
            {/* <View style={styles.dateSection}>
              

              
            </View> */}
          </View>

          {/* Row 2: Supplier Details */}

          {/* Row 3: Email */}
          {/* <View style={styles.emailSection}></View> */}

          {/* Row 4: Subject */}
          <View style={styles.subjectSection}>
            <Text style={styles.sectionLabel}>
              Subject: Purchasing of Items
            </Text>
            <Text style={styles.sectionValue}>Dear Sir,</Text>
            <Text style={styles.sectionValue}>
              We are pleased to place an order for the below mentioned goods as
              per the terms & conditions enclosed.
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colSno}>S. No.</Text>
            <Text style={styles.colItem}>ITEM</Text>
            <Text style={styles.colItemCode}>ITEM CODE</Text>
            {/* <Text style={styles.colHsnCode}>HSN CODE</Text> */}
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>

          {/* Dynamic Items Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colSno}>{index + 1}</Text>
              <Text style={styles.colItem}>
                {item.itemName || "Sample Item"}
              </Text>
              <Text style={styles.colItemCode}>
                {item.productId || "ITM001"}
              </Text>
              {/* <Text style={styles.colHsnCode}>{item.hsn_code || "1234"}</Text> */}
              <Text style={styles.colQty}>{item.quantity || 1}</Text>
              <Text style={styles.colRate}>
                {(item.unitPrice || 0).toFixed(2)}
              </Text>
              <Text style={styles.colAmount}>
                {(
                  item.totalPrice ||
                  item.quantity * item.unitPrice ||
                  0
                ).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Empty rows for spacing - adjust based on items count */}
          {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
            <View key={`empty-${i}`} style={styles.tableRow}>
              <Text style={styles.colSno}></Text>
              <Text style={styles.colItem}></Text>
              <Text style={styles.colItemCode}></Text>
              {/* <Text style={styles.colHsnCode}></Text> */}
              <Text style={styles.colQty}></Text>
              <Text style={styles.colRate}></Text>
              <Text style={styles.colAmount}></Text>
            </View>
          ))}

          {/* Total Rows */}
          <View style={[styles.tableRow, styles.totalSection]}>
            <Text style={styles.colSno}></Text>
            <Text style={styles.colItem}></Text>
            <Text style={styles.colItemCode}></Text>
            {/* <Text style={styles.colHsnCode}></Text> */}
            <Text style={styles.colQty}></Text>
            <Text style={styles.colRate}>TOTAL</Text>
            <Text style={styles.colAmount}>{baseAmount.toFixed(2)}</Text>
          </View>

          {/* Tax Section - Conditional GST Display */}
          {isIGST ? (
            // Show IGST when GST Apply is "igst"
            <View style={[styles.tableRow, styles.totalSection]}>
              <Text style={styles.colSno}></Text>
              <Text style={styles.colItem}></Text>
              <Text style={styles.colItemCode}></Text>
              {/* <Text style={styles.colHsnCode}></Text> */}
              <Text style={styles.colQty}></Text>
              <Text style={styles.colRate}>IGST @ {igstRate}%</Text>
              <Text style={styles.colAmount}>{igst.toFixed(2)}</Text>
            </View>
          ) : (
            // Show CGST and SGST when GST Apply is "cgst/sgst"
            <>
              <View style={[styles.tableRow, styles.totalSection]}>
                <Text style={styles.colSno}></Text>
                <Text style={styles.colItem}></Text>
                <Text style={styles.colItemCode}></Text>
                {/* <Text style={styles.colHsnCode}></Text> */}
                <Text style={styles.colQty}></Text>
                <Text style={styles.colRate}>CGST @ {cgstRate}%</Text>
                <Text style={styles.colAmount}>{cgst.toFixed(2)}</Text>
              </View>

              <View style={[styles.tableRow, styles.totalSection]}>
                <Text style={styles.colSno}></Text>
                <Text style={styles.colItem}></Text>
                <Text style={styles.colItemCode}></Text>
                {/* <Text style={styles.colHsnCode}></Text> */}
                <Text style={styles.colQty}></Text>
                <Text style={styles.colRate}>SGST @ {sgstRate}%</Text>
                <Text style={styles.colAmount}>{sgst.toFixed(2)}</Text>
              </View>
            </>
          )}

          <View style={[styles.tableRow, styles.totalSection]}>
            <Text style={styles.colSno}></Text>
            <Text style={styles.colItem}></Text>
            <Text style={styles.colItemCode}></Text>
            {/* <Text style={styles.colHsnCode}></Text> */}
            <Text style={styles.colQty}></Text>
            <Text style={styles.colRate}>GRAND TOTAL</Text>
            <Text style={styles.colAmount}>{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountInWords}>
          <Text style={styles.amountLabel}>Amount in words:</Text>
          <Text style={styles.amountValue}>
            {toWords.convert(Number(grandTotal), { currency: true })}
          </Text>
        </View>

        {/* <View style={styles.termsConditionsSection}>
          <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.termsList}>
            1) {isIGST ? `IGST @ ${igstRate}%` : `CGST @ ${cgstRate}% and SGST @ ${sgstRate}%`}{"\n"}
            2) Packing and Forwarding{"\n"}
            3) Freight{"\n"}
            4) Mode of Payment: {purchaseOrder?.modeOfPayment || "Net Banking"}
            {"\n"}
            5) Delivery Add{"\n"}
            6) Delivery Period{"\n"}  
            7) Billing Address:{" "}
            {purchaseOrder?.billingAddress || "Same as above"}
            {"\n"}
            8) Bill to be Sent{"\n"}
            9) Payment Terms
          </Text>
        </View>

        <View style={styles.remarksSection}>
          <Text style={styles.remarksTitle}>REMARK:</Text>
          <Text style={styles.remarksText}>
            1) All the consignment should be accompanied with GST Invoice.{"\n"}
            2) The company reserve the right to reject the material, in case, it
            is found to be sub standard.
          </Text>
        </View>

        <View style={styles.importantSection}>
          <Text style={styles.importantTitle}>IMPORTANT:</Text>
          <Text style={styles.importantText}>
            1) Purchase order reference to be quoted on all Challan and
            Invoices.{"\n"}
            2) Delivery not to exceed order quantity.{"\n"}
            3) Delivery schedule to be adhered strictly.{"\n"}
            4) Laboratory Analysis Report to be forwarded along with dispatch
            documents.{"\n"}
            5) Weight and measurement to be verified carefully before final.
            {"\n"}
            6) Please Deposit {isIGST ? 'IGST' : 'CGST/SGST'} and send us documentary evidence to
            enable us to process your payment.
          </Text>
        </View> */}
      </Page>
    </Document>
  );
};

export default PurchaseOrderPDF;
