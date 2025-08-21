// @ts-nocheck
import {
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tooltip,
} from "@chakra-ui/react";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp, FaFilePdf } from "react-icons/fa";
import {
  MdDeleteOutline,
  MdEdit,
  MdOutlinePayment,
  MdOutlineVisibility,
} from "react-icons/md";
import { usePagination, useSortBy, useTable } from "react-table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import InvoicePDF from "../PDF/InvoicePDF";

interface InvoiceTableProps {
  invoices: Array<{
    _id: string;
    creator: {
      first_name: string;
      last_name: string;
    };
    createdAt: string;
    updatedAt: string;
    buyer?: {
      name: string;
    };
    supplier?: {
      name: string;
    };
    subtotal: number;
    total: number;
    status: string;
  }>;
  isLoadingInvoices: boolean;
  openInvoiceDetailsHandler?: (id: string) => void;
  deleteInvoiceHandler?: (id: string) => void;
  openUpdateInvoiceDrawer?: (id: string) => void;
  openPaymentDrawer?: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoadingInvoices,
  openInvoiceDetailsHandler,
  deleteInvoiceHandler,
  openUpdateInvoiceDrawer,
  openPaymentDrawer,
}) => {
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      { Header: "Created By", accessor: "creator" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
      { Header: "Customer", accessor: "customer" },
      { Header: "Sub Total", accessor: "subtotal" },
      { Header: "Total", accessor: "total" },
    ],
    []
  );

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
      data: invoices,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  const handleDelete = (id: string) => {
    setDeleteModalId(id);
  };

  const confirmDelete = () => {
    if (deleteModalId && deleteInvoiceHandler) {
      deleteInvoiceHandler(deleteModalId);
      setDeleteModalId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalId(null);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden"
      style={{
        backgroundColor: colors.background.card,
        boxShadow: colors.shadow.base,
      }}
    >
      {isLoadingInvoices && <Loading />}

      {invoices.length === 0 && !isLoadingInvoices && <EmptyData />}

      {!isLoadingInvoices && invoices.length > 0 && (
        <>
          {/* Page Size Selector */}
          <div
            className="flex justify-between items-center p-4 "
            style={{ borderBottom: `1px solid ${colors.border.light}` }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              Invoices ({invoices.length})
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Show:
              </span>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                size="sm"
                width="80px"
                style={{
                  borderColor: colors.border.light,
                  fontSize: "14px",
                }}
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Table */}
          <TableContainer className="m-4 border rounded-md shadow-sm">
            <Table {...getTableProps()} variant="simple">
              <Thead style={{ backgroundColor: colors.table.header }}>
                {headerGroups.map((headerGroup) => (
                  <Tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <Th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        px={4}
                        py={3}
                        style={{
                          color: colors.table.headerText,
                          fontWeight: "600",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "16px",
                          borderBottom: `1px solid ${colors.table.border}`,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {column.render("Header")}
                          {column.isSorted && (
                            <span style={{ color: colors.primary[500] }}>
                              {column.isSortedDesc ? (
                                <FaCaretDown size={12} />
                              ) : (
                                <FaCaretUp size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </Th>
                    ))}
                    <Th
                      px={4}
                      py={3}
                      style={{
                        color: colors.table.headerText,
                        fontWeight: "600",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        borderBottom: `1px solid ${colors.table.border}`,
                      }}
                    >
                      Actions
                    </Th>
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {page.map((row, index) => {
                  prepareRow(row);
                  return (
                    <Tr
                      {...row.getRowProps()}
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? colors.background.card
                            : colors.table.stripe,
                        transition: "all 0.2s ease",
                      }}
                      _hover={{
                        backgroundColor: colors.table.hover,
                      }}
                    >
                      {row.cells.map((cell) => (
                        <Td
                          {...cell.getCellProps()}
                          style={{
                            padding: "16px",
                            borderBottom: `1px solid ${colors.table.border}`,
                            color: colors.text.primary,
                            fontSize: "14px",
                          }}
                          px={4}
                          py={3}
                        >
                          {/* Creator Name */}
                          {cell.column.id === "creator" &&
                            row.original?.creator && (
                              <span className="font-medium">
                                {`${row.original.creator.first_name} ${row.original.creator.last_name}`}
                              </span>
                            )}

                          {/* Created Date */}
                          {cell.column.id === "createdAt" &&
                            row.original?.createdAt && (
                              <span style={{ color: colors.text.secondary }}>
                                {moment(row.original.createdAt).format(
                                  "DD/MM/YYYY"
                                )}
                              </span>
                            )}

                          {/* Updated Date */}
                          {cell.column.id === "updatedAt" &&
                            row.original?.updatedAt && (
                              <span style={{ color: colors.text.secondary }}>
                                {moment(row.original.updatedAt).format(
                                  "DD/MM/YYYY"
                                )}
                              </span>
                            )}

                          {/* Customer */}
                          {cell.column.id === "customer" &&
                            (row.original?.buyer || row.original?.supplier) && (
                              <span className="font-medium">
                                {row.original?.buyer?.name ||
                                  row.original?.supplier?.name}
                              </span>
                            )}

                          {/* Subtotal */}
                          {cell.column.id === "subtotal" && (
                            <span
                              className="font-semibold"
                              style={{ color: colors.text.secondary }}
                            >
                              ₹{row.original.subtotal?.toLocaleString()}
                            </span>
                          )}

                          {/* Total */}
                          {cell.column.id === "total" && (
                            <span
                              className="font-bold"
                              style={{ color: colors.text.secondary }}
                            >
                              ₹{row.original.total?.toLocaleString()}
                            </span>
                          )}
                        </Td>
                      ))}

                      {/* Actions */}
                      <Td
                        style={{
                          padding: "16px",
                          borderBottom: `1px solid ${colors.table.border}`,
                        }}
                        px={4}
                        py={3}
                      >
                        <div className="flex items-center gap-2">
                          {openInvoiceDetailsHandler && (
                            <Tooltip label="View Invoice" placement="top">
                              <button
                                onClick={() =>
                                  openInvoiceDetailsHandler(row.original._id)
                                }
                                className="p-1 rounded-md transition-all duration-200 hover:scale-110"
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
                              >
                                <MdOutlineVisibility size={16} />
                              </button>
                            </Tooltip>
                          )}

                          {/* PDF Download Button */}
                          <Tooltip label="Download Invoice PDF" placement="top">
                            <PDFDownloadLink
                              document={<InvoicePDF invoice={row.original} />}
                              fileName={`Invoice-${row.original.invoice_no}.pdf`}
                              style={{ textDecoration: "none" }}
                            >
                              {({ loading }) => (
                                <button
                                  disabled={loading}
                                  className="p-1 rounded-md transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                  style={{
                                    color: colors.success[600],
                                    backgroundColor: colors.success[50],
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!loading) {
                                      e.currentTarget.style.backgroundColor =
                                        colors.success[100];
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      colors.success[50];
                                  }}
                                >
                                  <FaFilePdf size={16} />
                                </button>
                              )}
                            </PDFDownloadLink>
                          </Tooltip>

                          {openUpdateInvoiceDrawer && (
                            <Tooltip label="Edit Invoice" placement="top">
                              <button
                                onClick={() =>
                                  openUpdateInvoiceDrawer(row.original._id)
                                }
                                className="p-1 rounded-md transition-all duration-200 hover:scale-110"
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
                              >
                                <MdEdit size={16} />
                              </button>
                            </Tooltip>
                          )}

                          {openPaymentDrawer && (
                            <Tooltip label="Add Payment" placement="top">
                              <button
                                onClick={() =>
                                  openPaymentDrawer(row.original._id)
                                }
                                className="p-1 rounded-md transition-all duration-200 hover:scale-110"
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
                              >
                                <MdOutlinePayment size={16} />
                              </button>
                            </Tooltip>
                          )}

                          {deleteInvoiceHandler && (
                            <Tooltip label="Delete Invoice" placement="top">
                              <button
                                onClick={() => handleDelete(row.original._id)}
                                className="p-1 rounded-md transition-all duration-200 hover:scale-110"
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
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: `1px solid ${colors.border.light}` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, invoices.length)} of{" "}
                {invoices.length} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={previousPage}
                disabled={!canPreviousPage}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: canPreviousPage
                    ? colors.text.primary
                    : colors.text.muted,
                  backgroundColor: canPreviousPage
                    ? colors.gray[100]
                    : colors.gray[50],
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                Previous
              </button>
              <span
                className="px-4 py-2 text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                Page {pageIndex + 1} of {pageCount}
              </span>
              <button
                onClick={nextPage}
                disabled={!canNextPage}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: canNextPage ? colors.text.primary : colors.text.muted,
                  backgroundColor: canNextPage
                    ? colors.gray[100]
                    : colors.gray[50],
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: colors.background.card,
              boxShadow: colors.shadow.xl,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: colors.error[100] }}
              >
                <MdDeleteOutline
                  size={24}
                  style={{ color: colors.error[600] }}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Delete Invoice
              </h3>
            </div>
            <p className="mb-6" style={{ color: colors.text.secondary }}>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  color: colors.text.primary,
                  backgroundColor: colors.gray[100],
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: colors.error[600],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.error[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.error[600];
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
