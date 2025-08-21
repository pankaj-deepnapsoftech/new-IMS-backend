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
  sellerSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 60,
  },
  invoiceNoSection: {
    width: "25%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 60,
  },
  issueDateSection: {
    width: "25%",
    padding: 8,
    minHeight: 60,
  },
  buyerRefSection: {
    width: "25%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 40,
  },
  dueDateSection: {
    width: "25%",
    padding: 8,
    minHeight: 40,
  },
  buyerSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 60,
  },
  deliveryDateSection: {
    width: "33.33%",
    padding: 8,
    minHeight: 60,
  },
  methodDispatchSection: {
    width: "33.33%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 40,
  },
  typeShipmentSection: {
    width: "33.33%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 40,
  },
  termsPaymentSection: {
    width: "25%",
    padding: 8,
    minHeight: 40,
  },
  portLoadingSection: {
    width: "33.33%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 40,
  },
  portDischargeSection: {
    width: "33.33%",
    padding: 8,
    minHeight: 60,
    borderRight: "1px solid #000",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  sectionValue: {
    fontSize: 10,
    lineHeight: 1.2,
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
  },
  colSno: {
    width: "10%",
    padding: 8,
    borderRight: "1px solid #000",
    textAlign: "center",
  },
  colName: {
    width: "25%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
  },
  colUnitQty: {
    width: "15%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
  },
  colUnitType: {
    width: "20%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
  },
  colPrice: {
    width: "18%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
  },
  colTax: {
    width: "12%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
  },
  colAmount: {
    width: "13%",
    padding: 6,
    textAlign: "center",
  },
  totalWordsSection: {
    padding: 8,
    border: "1px solid #000",
    minHeight: 60,
    marginTop: 15,
  },
  footerSection: {
    marginTop: 15,
    flexDirection: "row",
  },
  amountDetailsSection: {
    width: "100%",
    padding: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bankDetailsSection: {
    width: "50%",
    padding: 8,
    borderRight: "1px solid #000",
    minHeight: 80,
    marginTop: 10,
  },
  signatureSection: {
    width: "50%",
    padding: 8,
    minHeight: 80,
    marginTop: 10,
    textAlign: "center",
  },
  additionalInfoDetailSection: {
    marginTop: 25,
    padding: 15,
    border: "1px solid #000",
    minHeight: 50,
  },
  additionalInfoDetailLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textTransform: "uppercase",
  },
  additionalInfoWritingSpace: {
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

const PorformaInvoicePDF = ({ proformaInvoice }: any) => {
  const subtotal = proformaInvoice?.subtotal || 0;
  const cgst = (subtotal * 9) / 100;
  const sgst = (subtotal * 9) / 100;
  const total = subtotal + cgst + sgst;

  console.log(proformaInvoice);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PROFORMA INVOICE</Text>

        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.sellerSection}>
              <Text style={styles.sectionLabel}>Seller</Text>
              <Text style={styles.sectionValue}>Deepnap Softech</Text>
            </View>
            <View style={styles.invoiceNoSection}>
              <Text style={styles.sectionLabel}>Invoice No.</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.proforma_invoice_no || "N/A"}
              </Text>
            </View>
            <View style={styles.issueDateSection}>
              <Text style={styles.sectionLabel}>Issue Date:</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.sales_order_date
                  ? new Date(
                      proformaInvoice.sales_order_date
                    ).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.headerRow}>
            <View style={styles.buyerSection}>
              <Text style={styles.sectionLabel}>Buyer</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.buyer?.company_name ||
                  proformaInvoice?.buyer?.consignee_name?.[0] ||
                  proformaInvoice?.buyer?.name ||
                  proformaInvoice?.customer ||
                  "N/A"}
              </Text>
            </View>
            <View style={styles.buyerRefSection}>
              <Text style={styles.sectionLabel}>Buyer Reference No.</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.buyer?.cust_id || "N/A"}
              </Text>
            </View>
            <View style={styles.termsPaymentSection}>
              <Text style={styles.sectionLabel}>Method of Payment</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.tax?.tax_name || "N/A"}
              </Text>
            </View>
          </View>

          {/* Row 3: Buyer, Delivery Date */}
          {/* <View style={styles.headerRow}>
            <View style={styles.deliveryDateSection}>
              <Text style={styles.sectionLabel}>Delivery Date</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.startdate
                  ? new Date(proformaInvoice.startdate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View> */}

          {/* Row 4: Method of Dispatch, Type of Shipment, Terms/Method of Payment */}
          {/* <View style={styles.headerRow}>
            <View style={styles.methodDispatchSection}>
              <Text style={styles.sectionLabel}>Method of Dispatch</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.methodOfDispatch || "N/A"}
              </Text>
            </View>
            <View style={styles.typeShipmentSection}>
              <Text style={styles.sectionLabel}>Type of Shipment</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.typeOfShipment || "N/A"}
              </Text>
            </View> 
             <View style={styles.termsPaymentSection}>
              <Text style={styles.sectionLabel}>Terms/Method of Payment</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.termsPayment || "N/A"}
              </Text>
            </View> 
            <View style={styles.deliveryDateSection}>
              <Text style={styles.sectionLabel}>Delivery Date</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.startdate
                  ? new Date(proformaInvoice.startdate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View> */}

          {/* Row 5: Port of Loading, Port of Discharge */}
          {/* <View style={styles.headerRow}>
            <View style={styles.portLoadingSection}>
              <Text style={styles.sectionLabel}>Port of Loading</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.portOfLoading || "N/A"}
              </Text>
            </View>
            <View style={styles.portDischargeSection}>
              <Text style={styles.sectionLabel}>Port of Discharge</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.portOfDischarge || "N/A"}
              </Text>
            </View>
            <View style={styles.dueDateSection}>
              <Text style={styles.sectionLabel}>Due Date:</Text>
              <Text style={styles.sectionValue}>
                {proformaInvoice?.dueDate
                  ? new Date(proformaInvoice.dueDate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View> */}
        </View>

        {/* Product Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colSno}>S. No.</Text>
            <Text style={styles.colName}>Name</Text>
            <Text style={styles.colUnitQty}>Quantity</Text>
            <Text style={styles.colUnitType}>Type</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTax}>GST</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>

          {proformaInvoice?.items?.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colSno}>{index + 1}</Text>
              <Text style={styles.colName}>{item?.name || "N/A"}</Text>
              <Text style={styles.colUnitQty}>{item?.quantity || "0"}</Text>
              <Text style={styles.colUnitType}>{"Piece"}</Text>
              <Text style={styles.colPrice}>
                {(item?.amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.colTax}>
                {proformaInvoice?.tax?.tax_name || "18%"}
              </Text>
              <Text style={styles.colAmount}>{total.toFixed(2)}</Text>
            </View>
          )) || (
            <View style={styles.tableRow}>
              <Text style={styles.colSno}>1</Text>
              <Text style={styles.colName}>No items found</Text>
              <Text style={styles.colUnitQty}>0</Text>
              <Text style={styles.colUnitType}>Piece</Text>
              <Text style={styles.colPrice}>0.00</Text>
              <Text style={styles.colTax}>0%</Text>
              <Text style={styles.colAmount}>0.00</Text>
            </View>
          )}

          {/* Empty rows for spacing */}
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colSno}></Text>
              <Text style={styles.colName}></Text>
              <Text style={styles.colUnitQty}></Text>
              <Text style={styles.colUnitType}></Text>
              <Text style={styles.colPrice}></Text>
              <Text style={styles.colTax}></Text>
              <Text style={styles.colAmount}></Text>
            </View>
          ))}
        </View>

        {/* Total in Words */}
        <View style={styles.totalWordsSection}>
          <Text style={styles.sectionLabel}>Total in words</Text>
          <Text style={styles.sectionValue}>
            {toWords.convert(Number(total), { currency: true })}
          </Text>
        </View>

        {/* Footer Section - Amount Details Only */}
        {/* <View style={styles.footerSection}>
          <View style={styles.amountDetailsSection}>
            <View style={styles.amountRow}>
              <Text style={styles.sectionLabel}>Net Amount:</Text>
              <Text style={styles.sectionValue}>{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.sectionLabel}>CGST</Text>
              <Text style={styles.sectionValue}>{cgst.toFixed(2)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.sectionLabel}>SGST</Text>
              <Text style={styles.sectionValue}>{sgst.toFixed(2)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={[styles.sectionLabel, { fontWeight: "bold" }]}>
                Total Amount:
              </Text>
              <Text style={[styles.sectionValue, { fontWeight: "bold" }]}>
                {total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View> */}

        {/* Bank Details and Signature */}
        <View style={styles.footerSection}>
          <View style={styles.bankDetailsSection}>
            <Text style={styles.sectionLabel}>Bank Details</Text>
            <Text style={styles.sectionValue}>
              Bank Name: HDFC Bank{"\n"}
              Account No.: 123456789123456{"\n"}
              IFSC Code: F4H5ED08
            </Text>
          </View>
          <View style={styles.signatureSection}>
            <Text style={styles.sectionLabel}>Authorised Signatory</Text>
            <Text style={{ marginTop: 40 }}>_________________________</Text>
          </View>
        </View>

        {/* Additional Info Detail Section with Writing Space */}
        <View style={styles.additionalInfoDetailSection}>
          <Text style={styles.additionalInfoDetailLabel}>
            Additional Information:
          </Text>
          <View style={styles.additionalInfoWritingSpace}>
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

export default PorformaInvoicePDF;
