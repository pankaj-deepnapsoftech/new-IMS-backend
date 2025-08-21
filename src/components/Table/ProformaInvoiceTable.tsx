// @ts-nocheck

import { Select, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp, FaFilePdf } from "react-icons/fa";
import { usePagination, useSortBy, useTable } from "react-table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { colors } from "../../theme/colors";
import PorformaInvoicePDF from "../PDF/PorformaInvoicePDF";

interface ProformaInvoiceTableProps {
  proformaInvoices: Array<{
    creator: string;
    created_on: string;
    customer?: string;
    startdate: string;
    subtotal: string;
    total: string;
    status: string;
  }>;
  isLoadingProformaInvoices: boolean;
  openProformaInvoiceDetailsHandler?: (id: string) => void;
  deleteProformaInvoiceHandler?: (id: string) => void;
  openUpdateProformaInvoiceDrawer?: (id: string) => void;
}

const ProformaInvoiceTable: React.FC<ProformaInvoiceTableProps> = ({
  proformaInvoices,
  isLoadingProformaInvoices,
  openProformaInvoiceDetailsHandler,
  deleteProformaInvoiceHandler,
  openUpdateProformaInvoiceDrawer,
}) => {
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

  const columns = useMemo(
    () => [
      {
        Header: "PI Number",
        accessor: "proforma_invoice_no",
      },

      { Header: "Created By", accessor: "creator" },
      { Header: "Created At", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
      { Header: "Customer", accessor: "customer" },
      { Header: "Sub Total", accessor: "subtotal" },
      { Header: "Total", accessor: "total" },
    ],
    []
  );

  const dynamicBg = (index) => {
    return index % 2 !== 0 ? colors.table.stripe : colors.background.card;
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  } = useTable(
    {
      columns,
      data: proformaInvoices,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );
  // console.log(proformaInvoices)

  return (
    <div className="p-6">
      {isLoadingProformaInvoices && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.primary[500] }}
            ></div>
            <span
              className="font-medium"
              style={{ color: colors.text.secondary }}
            >
              Loading proforma invoices...
            </span>
          </div>
        </div>
      )}

      {!isLoadingProformaInvoices && proformaInvoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="rounded-full p-6 mb-4"
            style={{ backgroundColor: colors.gray[100] }}
          >
            <svg
              className="w-12 h-12"
              style={{ color: colors.gray[400] }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No proforma invoices found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by creating your first proforma invoice.
          </p>
        </div>
      )}

      {!isLoadingProformaInvoices && proformaInvoices.length > 0 && (
        <>
          {/* Table Header with Stats and Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {proformaInvoices.length} Invoice
                  {proformaInvoices.length !== 1 ? "s" : ""} Found
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Show:
              </span>
              <Select
                onChange={(e) => setPageSize(Number(e.target.value))}
                value={pageSize}
                size="sm"
                width="auto"
                borderRadius="lg"
                borderColor={colors.border.light}
                _focus={{
                  borderColor: colors.primary[500],
                  boxShadow: `0 0 0 1px ${colors.primary[500]}`,
                }}
              >
                {[5, 10, 20, 50, 100, 100000].map((size) => (
                  <option key={size} value={size}>
                    {size === 100000 ? "All" : size}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Enhanced Table */}
          <div
            className="rounded-xl shadow-sm whitespace-nowrap"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <div className="overflow-x-auto">
              <Table
                {...getTableProps()}
                variant="simple"
                size="md"
                minWidth="800px"
              >
                <Thead bg={colors.table.header}>
                  {headerGroups.map((hg, headerIndex) => {
                    const { key, ...headerGroupProps } =
                      hg.getHeaderGroupProps();
                    return (
                      <Tr
                        key={key}
                        {...headerGroupProps}
                        borderBottom="1px solid"
                        borderColor={colors.table.border}
                      >
                        {hg.headers.map((column: any) => {
                          const { key: columnKey, ...columnProps } =
                            column.getHeaderProps(
                              column.getSortByToggleProps()
                            );
                          return (
                            <Th
                              key={columnKey}
                              {...columnProps}
                              style={{
                                position: "sticky",
                                top: 0,
                                left: column.id === "creator" ? 0 : undefined,
                                zIndex: column.id === "creator" ? 11 : 10,
                                backgroundColor: colors.table.header,
                              }}
                              px={4}
                              py={3}
                            >
                              <div className="flex items-center gap-1">
                                {column.render("Header")}
                                {column.isSorted && (
                                  <span
                                    style={{ color: colors.primary[500] }}
                                  >
                                    {column.isSortedDesc ? (
                                      <FaCaretDown />
                                    ) : (
                                      <FaCaretUp />
                                    )}
                                  </span>
                                )}
                              </div>
                            </Th>
                          );
                        })}
                        <Th
                          fontSize="14px"
                          fontWeight="600"
                          color={colors.table.headerText}
                          whiteSpace="nowrap"
                          px={4}
                          py={3}
                        >
                          Actions
                        </Th>
                      </Tr>
                    );
                  }
                  )}
                </Thead>
                <Tbody {...getTableBodyProps()}>
                  {page.map((row: any, index) => {
                    prepareRow(row);
                    const { key: rowKey, ...rowProps } = row.getRowProps();

                    return (
                      <Tr
                        key={rowKey}
                        {...rowProps}
                        _hover={{
                          bg: colors.table.hover,
                          transform: "translateY(-1px)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          shadow: "md",
                        }}
                        bgColor={
                          index % 2 !== 0
                            ? colors.table.stripe
                            : colors.background.card
                        }
                        transition="all 0.2s ease"
                        borderBottom="1px solid"
                        borderColor={colors.table.border}
                      >
                        {row.cells.map((cell: any) => {
                          const { key: cellKey, ...cellProps } =
                            cell.getCellProps();
                          return (
                            <Td
                              key={cellKey}
                              {...cellProps}
                              style={{
                                position:
                                  cell.column.id === "creator"
                                    ? "sticky"
                                    : undefined,
                                left:
                                  cell.column.id === "creator" ? 0 : undefined,
                                backgroundColor:
                                  cell.column.id === "creator"
                                    ? dynamicBg(index)
                                    : undefined,
                                zIndex:
                                  cell.column.id === "creator" ? 1 : undefined,
                              }}
                              px={4}
                              py={3}
                            >
                              {/* Default render if no special condition */}
                              {cell.column.id !== "createdAt" &&
                                cell.column.id !== "updatedAt" &&
                                cell.column.id !== "customer" &&
                                cell.column.id !== "creator" &&
                                cell.column.id !== "proforma_invoice_no" &&
                                cell.render("Cell")}

                              {cell.column.id === "creator" &&
                                row.original?.creator && (
                                  <span style={{ color: colors.text.primary }}>
                                    {row.original?.creator?.first_name +
                                      " " +
                                      row.original?.creator?.last_name}
                                  </span>
                                )}

                              {cell.column.id === "createdAt" &&
                                row.original?.createdAt && (
                                  <span
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {moment(row.original?.createdAt).format(
                                      "DD/MM/YYYY"
                                    )}
                                  </span>
                                )}

                              {cell.column.id === "updatedAt" &&
                                row.original?.updatedAt && (
                                  <span
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {moment(row.original?.updatedAt).format(
                                      "DD/MM/YYYY"
                                    )}
                                  </span>
                                )}
                              {cell.column.id === "customer" &&
                                (row.original?.buyer ||
                                  row.original?.supplier) && (
                                  <span style={{ color: colors.text.primary }}>
                                    {row.original?.buyer
                                      ? row.original.buyer.consignee_name &&
                                        String(
                                          row.original.buyer.consignee_name
                                        ).trim() !== ""
                                        ? String(
                                            row.original.buyer.consignee_name
                                          )
                                        : row.original.buyer.company_name &&
                                          String(
                                            row.original.buyer.company_name
                                          ).trim() !== ""
                                        ? String(
                                            row.original.buyer.company_name
                                          )
                                        : row.original.buyer.name
                                      : row.original.supplier.name}
                                  </span>
                                )}

                              {cell.column.id === "proforma_invoice_no" &&
                                row.original?.proforma_invoice_no && (
                                  <span style={{ color: colors.text.primary }}>
                                    {row.original.proforma_invoice_no}
                                  </span>
                                )}
                            </Td>
                          );
                        })}

                        <Td px={4} py={3}>
                          <div className="flex items-center gap-2">
                            {openProformaInvoiceDetailsHandler && (
                              <button
                                onClick={() =>
                                  openProformaInvoiceDetailsHandler(
                                    row.original._id
                                  )
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.secondary[600],
                                  backgroundColor: colors.secondary[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.secondary[50];
                                }}
                                title="View Invoice Details"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            )}
                            {openUpdateProformaInvoiceDrawer && (
                              <button
                                onClick={() =>
                                  openUpdateProformaInvoiceDrawer(
                                    row.original._id
                                  )
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.primary[600],
                                  backgroundColor: colors.primary[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.primary[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.primary[50];
                                }}
                                title="Edit Invoice"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}
                            {deleteProformaInvoiceHandler && (
                              <button
                                onClick={() => {
                                  setdeleteId(row.original._id);
                                  setshowDeletePage(true);
                                }}
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.error[600],
                                  backgroundColor: colors.error[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.error[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.error[50];
                                }}
                                title="Delete Invoice"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* PDF Download Button */}
                            <PDFDownloadLink
                              document={
                                <PorformaInvoicePDF
                                  proformaInvoice={row.original}
                                />
                              }
                              fileName={`ProformaInvoice_${row.original._id}.pdf`}
                            >
                              {({ blob, url, loading, error }) => (
                                <button
                                  disabled={loading}
                                  className="p-2 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50"
                                  style={{
                                    color: colors.warning[600],
                                    backgroundColor: colors.warning[50],
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.backgroundColor =
                                        colors.warning[100];
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.backgroundColor =
                                        colors.warning[50];
                                    }
                                  }}
                                  title={
                                    loading
                                      ? "Generating PDF..."
                                      : "Download PDF"
                                  }
                                >
                                  <FaFilePdf className="w-4 h-4" />
                                </button>
                              )}
                            </PDFDownloadLink>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>

              </Table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div
            className="flex items-center justify-center px-6 py-4 border-t"
            style={{
              backgroundColor: colors.gray[50],
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-2">
              <button
                disabled={!canPreviousPage}
                onClick={previousPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                  border: `1px solid ${colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.card;
                  }
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageIndex + 1 === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        /* Add page navigation logic if needed */
                      }}
                      className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: isActive
                          ? colors.primary[500]
                          : "transparent",
                        color: isActive
                          ? colors.text.inverse
                          : colors.text.primary,
                        boxShadow: isActive ? colors.shadow.sm : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor =
                            colors.gray[100];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={!canNextPage}
                onClick={nextPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                  border: `1px solid ${colors.border.light}`,
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.card;
                  }
                }}
              >
                Next
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {showDeletePage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md transform transition-all"
            style={{
              backgroundColor: colors.background.card,
              boxShadow: colors.shadow.xl,
            }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full"
              style={{ backgroundColor: colors.error[100] }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: colors.error[600] }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3
              className="text-lg font-semibold text-center mb-2"
              style={{ color: colors.text.primary }}
            >
              Confirm Deletion
            </h3>
            <p
              className="text-sm text-center mb-6"
              style={{ color: colors.text.secondary }}
            >
              Are you sure you want to delete this proforma invoice? This action
              cannot be undone and will permanently remove the invoice from the
              system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setshowDeletePage(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.gray[100],
                  focusRingColor: colors.gray[500],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[100];
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProformaInvoiceHandler(deleteId);
                  setshowDeletePage(false);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  color: colors.text.inverse,
                  backgroundColor: colors.error[600],
                  boxShadow: colors.shadow.lg,
                  focusRingColor: colors.error[500],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.error[700];
                  e.currentTarget.style.boxShadow = colors.shadow.xl;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.error[600];
                  e.currentTarget.style.boxShadow = colors.shadow.lg;
                }}
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaInvoiceTable;
