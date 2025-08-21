// @ts-nocheck
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ToWords } from "to-words";
import { useCookies } from "react-cookie";

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
  bomDetailsSection: {
    width: "30%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  dateSection: {
    width: "30%",
    padding: 8,
  },
  bomNameSection: {
    width: "40%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  costSection: {
    width: "30%",
    padding: 8,
    borderRight: "1px solid #000",
  },
  partsSection: {
    width: "30%",
    padding: 8,
  },
  descriptionSection: {
    width: "100%",
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
    // borderBottom: "1px solid #000",
    borderTop: "1px solid #000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 10,
  },
  col1: {
    width: "12%",
    padding: 8,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  col2: {
    width: "25%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "left",
    fontSize: 10,
  },
  col3: {
    width: "15%",
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
    width: "15%",
    padding: 6,
    borderRight: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
  },
  col7: {
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
  notesSection: {
    padding: 10,
    border: "1px solid #000",
    minHeight: 60,
    marginTop: 15,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textTransform: "uppercase",
  },
  notesValue: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#000",
    fontWeight: "normal",
  },
  signatureContainer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  approvalBox: {
    width: "45%",
    border: "1px solid #000",
    padding: 10,
    minHeight: 80,
    textAlign: "center",
  },
  signatureBox: {
    width: "45%",
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

const BOMPDF = ({ bom }: any) => {
  const totalCost = bom?.total_cost || 0;
  const partsCount = bom?.parts_count || 0;
  const rawMaterials = bom?.raw_materials || [];
  const scrapMaterials = bom?.scrap_materials || [];
  const resources = bom?.resources || [];
  const manpower = bom?.manpower || [];
  const otherCharges = bom?.other_charges || {};
  const process = bom?.processes || [];

  const [cookies] = useCookies();
  console.log(bom);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>BILL OF MATERIALS (BOM)</Text>

        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Row 1: Company, BOM ID, Date */}
          <View style={styles.headerRow}>
            <View style={styles.companySection}>
              <Text style={styles.sectionLabel}>Company Name</Text>
              <Text style={styles.sectionValue}>Deepnap Softech</Text>
            </View>
            <View style={styles.bomDetailsSection}>
              <Text style={styles.sectionLabel}>BOM ID</Text>
              <Text style={styles.sectionValue}>
                {bom?.bom_id || bom?._id || "BOM-001"}
              </Text>
            </View>
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>Created Date</Text>
              <Text style={styles.sectionValue}>
                {bom?.createdAt
                  ? new Date(bom.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Row 2: BOM Name, Total Cost, Parts Count */}
          <View style={styles.headerRow}>
            <View style={styles.bomNameSection}>
              <Text style={styles.sectionLabel}>BOM Name</Text>
              <Text style={styles.sectionValue}>{bom?.bom_name || "N/A"}</Text>
            </View>
            <View style={styles.costSection}>
              <Text style={styles.sectionLabel}>Total Cost</Text>
              {cookies?.role === "admin" ? (
                <Text style={styles.sectionValue}>
                  {Number(totalCost).toFixed(2)}
                </Text>
              ) : (
                <Text style={[styles.col7, { width: "10%" }]}>*****</Text>
              )}
            </View>
            <View style={styles.partsSection}>
              <Text style={styles.sectionLabel}>Total Parts</Text>
              <Text style={styles.sectionValue}>{partsCount} Parts</Text>
            </View>
          </View>
        </View>

        {/* Finished Good Section */}
        {bom?.finished_good && (
          <View style={[styles.table, { marginTop: 15 }]}>
            <Text
              style={[
                styles.sectionLabel,
                { marginBottom: 5, fontSize: 12, fontWeight: "bold" },
              ]}
            >
              FINISHED GOODS
            </Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.col1, { width: "15%" }]}>S. No.</Text>
              <Text style={[styles.col2, { width: "25%" }]}>Product Name</Text>
              <Text style={[styles.col4, { width: "12%" }]}>Quantity</Text>
              <Text style={[styles.col5, { width: "10%" }]}>Unit</Text>
              <Text style={[styles.col7, { width: "10%" }]}>Cost</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.col1, { width: "15%" }]}>1</Text>
              <Text style={[styles.col2, { width: "25%" }]}>
                {bom.finished_good?.item?.name || "N/A"}
              </Text>
              <Text style={[styles.col4, { width: "12%" }]}>
                {bom.finished_good?.quantity || 0}
              </Text>
              <Text style={[styles.col5, { width: "10%" }]}>
                {bom.finished_good?.item?.uom || "PCS"}
              </Text>
              {cookies?.role === "admin" ? (
                <Text style={[styles.col7, { width: "10%" }]}>
                  {Number(bom.finished_good?.cost || 0).toFixed(2)}
                </Text>
              ) : (
                <Text style={[styles.col7, { width: "10%" }]}>*****</Text>
              )}
            </View>
          </View>
        )}

        {rawMaterials.length > 0 && (
          <View style={styles.table}>
            <Text
              style={[
                styles.sectionLabel,
                { marginBottom: 5, fontSize: 12, fontWeight: "bold" },
              ]}
            >
              RAW MATERIALS
            </Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.col1}>S. No.</Text>
              <Text style={styles.col2}>Material Name</Text>
              <Text style={styles.col4}>Quantity</Text>
              <Text style={styles.col5}>Unit</Text>
              <Text style={styles.col6}>Unit Cost</Text>
              <Text style={styles.col7}>Total Cost</Text>
            </View>

            {rawMaterials.map((material: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{material?.item?.name || "N/A"}</Text>
                <Text style={styles.col4}>{material?.quantity || 0}</Text>
                <Text style={styles.col5}>{material?.item?.uom || "PCS"}</Text>
                <Text style={styles.col6}>
                  {Number(
                    material?.item?.price || material?.unit_cost || 0
                  ).toFixed(2)}
                </Text>
                {cookies?.role === "admin" ? (
                  <Text style={[styles.col7, { width: "10%" }]}>
                    {Number(material?.total_part_cost || 0).toFixed(2)}
                  </Text>
                ) : (
                  <Text style={[styles.col7, { width: "10%" }]}>*****</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {scrapMaterials.length > 0 && (
          <View style={[styles.table, { marginTop: 15 }]}>
            <Text
              style={[
                styles.sectionLabel,
                { marginBottom: 5, fontSize: 12, fontWeight: "bold" },
              ]}
            >
              SCRAP MATERIALS
            </Text>

            {/* Fixed Header */}
            <View style={[styles.tableRow, styles.tableHeader]} fixed>
              <Text style={styles.col1}>S. No.</Text>
              <Text style={styles.col2}>Material Name</Text>
              <Text style={styles.col4}>Quantity</Text>
              <Text style={styles.col5}>Unit</Text>
              <Text style={styles.col6}>Unit Cost</Text>
              <Text style={styles.col7}>Total Cost</Text>
            </View>

            {/* Body Rows */}
            {scrapMaterials.map((material: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{material?.item?.name || "N/A"}</Text>
                <Text style={styles.col4}>{material?.quantity || 0}</Text>
                <Text style={styles.col5}>{material?.item?.uom || "PCS"}</Text>
                <Text style={styles.col6}>
                  {Number(
                    material?.item?.price || material?.unit_cost || 0
                  ).toFixed(2)}
                </Text>
                <Text style={styles.col7}>
                  {Number(material?.total_part_cost || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Resources Table */}
        {resources.length > 0 && (
          <View style={[styles.table, { marginTop: 15 }]}>
            <Text
              style={[
                styles.sectionLabel,
                { marginBottom: 5, fontSize: 12, fontWeight: "bold" },
              ]}
            >
              RESOURCES
            </Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.col1, { width: "10%" }]}>S. No.</Text>
              <Text style={[styles.col2, { width: "35%" }]}>Resource Name</Text>
              <Text style={[styles.col3, { width: "25%" }]}>Type</Text>
              <Text style={[styles.col4, { width: "30%" }]}>Specification</Text>
            </View>

            {resources.map((resource: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.col1, { width: "10%" }]}>{index + 1}</Text>
                <Text style={[styles.col2, { width: "35%" }]}>
                  {resource?.name || resource?.resource_id?.name || "N/A"}
                </Text>
                <Text style={[styles.col3, { width: "25%" }]}>
                  {resource?.type || resource?.resource_id?.type || "—"}
                </Text>
                <Text style={[styles.col4, { width: "30%" }]}>
                  {resource?.specification ||
                    resource?.resource_id?.specification ||
                    "—"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {process.length > 0 && (
          <View style={[styles.table, { marginTop: 15 }]}>
            <Text
              style={[
                styles.sectionLabel,
                { marginBottom: 5, fontSize: 12, fontWeight: "bold" },
              ]}
            >
              Process
            </Text>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.col1, { width: "15%" }]}>S. No.</Text>
              <Text style={[styles.col2, { width: "40%" }]}>Process </Text>
            </View>

            {process.map((process: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.col1, { width: "15%" }]}>{index + 1}</Text>
                <Text style={[styles.col2, { width: "40%" }]}>
                  {`${process} ` || "N/A"}
                </Text>
              </View>
            ))}
          </View>
        )}

        
        <View style={styles.amountInWords}>
          <Text style={styles.amountLabel}>Total Cost in Words:</Text>
          {cookies?.role === "admin" ? (
            <Text style={styles.amountValue}>
              {toWords.convert(Number(totalCost), { currency: true })}
            </Text>
          ) : (
            <Text style={[styles.col7, { width: "10%" }]}>*****</Text>
          )}
        </View>

        {bom?.remarks && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Remarks:</Text>
            <Text style={styles.notesValue}>{bom.remarks}</Text>
          </View>
        )}

        <View style={styles.signatureContainer}>
          <View style={styles.approvalBox}>
            <Text style={styles.signatureLabel}>Approved By</Text>
            <Text style={{ marginTop: 30, fontSize: 10 }}>
              _________________________
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <Text style={{ marginTop: 30, fontSize: 10 }}>
              _________________________
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BOMPDF;
