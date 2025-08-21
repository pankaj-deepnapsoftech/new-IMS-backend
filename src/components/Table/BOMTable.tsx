// @ts-nocheck

import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Column,
  HeaderGroup,
  TableInstance,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import Loading from "../../ui/Loading";
import { FcApproval, FcDatabase } from "react-icons/fc";
import {
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { FaCaretDown, FaCaretUp, FaFilePdf } from "react-icons/fa";
import moment from "moment";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import { useCookies } from "react-cookie";
import BOMPDF from "../PDF/BOMPDF";

interface BOMTableProps {
  boms: Array<{
    _id: string;
    bom_name: string;
    parts_count: string;
    total_cost: string;
    approval_date?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingBoms: boolean;
  openUpdateBomDrawerHandler?: (id: string) => void;
  openBomDetailsDrawerHandler?: (id: string) => void;
  deleteBomHandler?: (id: string) => void;
  approveBomHandler?: (id: string) => void;
  refreshBoms?: () => void; // Add refresh function prop
}

const BOMTable: React.FC<BOMTableProps> = ({
  boms,
  isLoadingBoms,
  openUpdateBomDrawerHandler,
  openBomDetailsDrawerHandler,
  deleteBomHandler,
  approveBomHandler,
  refreshBoms,
}) => {
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");
  const [cookies] = useCookies();

  // Bulk selection states
  const [selectedBoms, setSelectedBoms] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to fetch complete BOM data for PDF
  const fetchBomForPDF = async (bomId: string) => {
    try {
      setIsGeneratingPDF(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/${bomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.bom;
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch BOM data");
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle PDF download with complete BOM data
  const handlePDFDownload = async (bomId: string, bomName: string) => {
    const fullBomData = await fetchBomForPDF(bomId);
    if (fullBomData) {
      // Create a temporary PDF download link
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<BOMPDF bom={fullBomData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BOM_${bomName || bomId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const columns = useMemo(
    () => [
      { Header: "BOM ID", accessor: "_id" },
      { Header: "BOM Name", accessor: "bom_name" },
      { Header: "Parts Count", accessor: "parts_count" },
      { Header: "Total Cost", accessor: "total_cost" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
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
  }: TableInstance<{
    _id: string;
    bom_name: string;
    parts_count: string;
    total_cost: string;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: boms,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  // Bulk selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBoms(page.map((row) => row.original._id));
    } else {
      setSelectedBoms([]);
    }
  };

  const handleSelectBom = (bomId, checked) => {
    if (checked) {
      setSelectedBoms((prev) => [...prev, bomId]);
    } else {
      setSelectedBoms((prev) => prev.filter((id) => id !== bomId));
    }
  };

  const handleBulkDelete = async () => {
    if (isBulkDeleting || selectedBoms.length === 0) return;
    setIsBulkDeleting(true);

    try {
      // Call the bulk delete API endpoint
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}bom/bulk-delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({ ids: selectedBoms }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete BOMs");
      }

      // Single success toast message
      toast.success(
        data.message ||
          `Successfully deleted ${selectedBoms.length} BOM${
            selectedBoms.length > 1 ? "s" : ""
          }`
      );

      // Refresh the BOMs list
      if (refreshBoms) {
        refreshBoms();
      }

      setSelectedBoms([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error(error.message || "Failed to delete BOMs. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isAllSelected = page.length > 0 && selectedBoms.length === page.length;
  const isIndeterminate =
    selectedBoms.length > 0 && selectedBoms.length < page.length;

  return (
    <div className="p-6">
      {isLoadingBoms && (
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
              Loading BOMs...
            </span>
          </div>
        </div>
      )}

      {!isLoadingBoms && boms.length === 0 && (
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
            No BOMs found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by creating your first Bill of Materials to manage your
            production processes.
          </p>
        </div>
      )}

      {!isLoadingBoms && boms.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {boms.length} BOM{boms.length !== 1 ? "s" : ""} Found
                </h3>
                {/* {selectedBoms.length > 0 && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    {selectedBoms.length} selected
                  </p>
                )} */}
              </div>

              {/* Bulk Actions */}
              {selectedBoms.length > 0 && (
                <div className="flex items-center gap-3">
                  {deleteBomHandler && (
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
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
                      Delete Selected ({selectedBoms.length})
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBoms([])}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                Show:
              </span>
              <select
                onChange={(e) => setPageSize(Number(e.target.value))}
                value={pageSize}
                className="px-3 py-2 text-sm rounded-lg border transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.border.light,
                  color: colors.text.primary,
                }}
              >
                {[5, 10, 20, 50, 100, 100000].map((size) => (
                  <option key={size} value={size}>
                    {size === 100000 ? "All" : size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Table */}
          <div
            className="rounded-xl shadow-sm overflow-hidden"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: colors.table.header }}>
                  <tr
                    style={{ borderBottom: `1px solid ${colors.table.border}` }}
                  >
                    {cookies?.role === "admin" && (
                      <th
                        className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                        style={{
                          color: colors.table.headerText,
                          width: "60px",
                          minWidth: "60px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </th>
                    )}
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      BOM ID
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      BOM Name
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Parts Count
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Total Cost
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Created On
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Last Updated
                    </th>
                    <th
                      className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.map((row: any, index) => {
                    prepareRow(row);
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:shadow-sm"
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe,
                          borderBottom: `1px solid ${colors.table.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.table.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            index % 2 === 0
                              ? colors.background.card
                              : colors.table.stripe;
                        }}
                      >
                        {cookies?.role === "admin" && (
                          <td
                            className="px-4 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: colors.text.secondary,
                              width: "60px",
                              minWidth: "60px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedBoms.includes(row.original._id)}
                              onChange={(e) =>
                                handleSelectBom(
                                  row.original._id,
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        )}
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap font-mono"
                          style={{ color: colors.text.secondary }}
                          title={row.original._id}
                        >
                          {row.original.bom_id || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap truncate max-w-xs"
                          style={{ color: colors.text.primary }}
                          title={row.original.bom_name}
                        >
                          {row.original.bom_name || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: colors.primary[100],
                              color: colors.primary[700],
                            }}
                          >
                            {row.original.parts_count || "0"} parts
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap"
                          style={{ color: colors.success[600] }}
                        >
                          {cookies?.role === "admin"
                            ? `₹${row.original.total_cost}`
                            : "₹*****"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.createdAt
                            ? moment(row.original.createdAt).format(
                                "DD/MM/YYYY"
                              )
                            : "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.updatedAt
                            ? moment(row.original.updatedAt).format(
                                "DD/MM/YYYY"
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {openBomDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openBomDetailsDrawerHandler(row.original._id)
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
                                title="View BOM details"
                              >
                                <MdOutlineVisibility size={16} />
                              </button>
                            )}
                            {openUpdateBomDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateBomDrawerHandler(row.original._id)
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
                                title="Edit BOM"
                              >
                                <MdEdit size={16} />
                              </button>
                            )}
                            {deleteBomHandler && cookies?.role === "admin" && (
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
                                title="Delete BOM"
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            )}
                            {approveBomHandler && (
                              <button
                                onClick={() =>
                                  approveBomHandler(row.original._id)
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.success[600],
                                  backgroundColor: colors.success[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.success[50];
                                }}
                                title="Approve BOM"
                              >
                                <FcApproval size={16} />
                              </button>
                            )}

                            {/* PDF Download Button */}
                            <button
                              disabled={isGeneratingPDF}
                              onClick={() =>
                                handlePDFDownload(
                                  row.original._id,
                                  row.original.bom_name
                                )
                              }
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
                                isGeneratingPDF
                                  ? "Generating PDF..."
                                  : "Download BOM PDF"
                              }
                            >
                              {isGeneratingPDF ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-current"></div>
                              ) : (
                                <FaFilePdf size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div
            className="flex items-center justify-center px-6 py-4 border-t mt-4"
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

              <span
                className="mx-4 text-sm"
                style={{ color: colors.text.secondary }}
              >
                Page {pageIndex + 1} of {pageCount}
              </span>

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

      {/* Enhanced Delete Modal */}
      {showDeletePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Deletion
                </h2>
              </div>

              <div className="mb-6">
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete BOM
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All BOM data will be
                        permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setshowDeletePage(false)}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteBomHandler(deleteId);
                    setshowDeletePage(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Confirm Bulk Deletion
                </h2>
                {!isBulkDeleting && (
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="p-1 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: colors.text.secondary }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mb-6">
                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ backgroundColor: colors.error[50] }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      style={{ color: colors.error[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p
                        className="font-medium text-center"
                        style={{ color: colors.error[800] }}
                      >
                        Delete {selectedBoms.length} BOM
                        {selectedBoms.length > 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All selected BOM data will
                        be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>

                {isBulkDeleting && (
                  <div
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent"
                        style={{ borderColor: colors.primary[500] }}
                      ></div>
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: colors.primary[800] }}
                        >
                          Deleting BOMs...
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.primary[600] }}
                        >
                          Please wait while we process your request.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                    backgroundColor: colors.background.card,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.error[500],
                    color: colors.text.inverse,
                  }}
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    `Delete ${selectedBoms.length} BOM${
                      selectedBoms.length > 1 ? "s" : ""
                    }`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMTable;
