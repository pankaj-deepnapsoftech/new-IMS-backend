// @ts-nocheck
import { useMemo, useState } from "react";
import {
  Column,
  TableInstance,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import Loading from "../../ui/Loading";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import moment from "moment";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import axios from "axios";
import { useCookies } from "react-cookie";

const statusColorMap = {
  completed: "bg-green-100 text-green-800",
  "production started": "bg-blue-100 text-blue-800",
  "request for allow inventory": "bg-yellow-100 text-yellow-800",
  "raw material approval pending": "bg-red-100 text-red-800",
  "inventory in transit": "bg-orange-100 text-orange-800",
  "Inventory Allocated": "bg-purple-100 text-purple-800",
};

const defaultStatusClass = "bg-gray-100 text-gray-700";

interface ProcessTableProps {
  proces: Array<{
    creator: any;
    item: string;
    rm_store: string;
    fg_store: string;
    scrap_store: string;
    createdAt: string;
    updatedAt: string;
    status: string;
  }>;
  isLoadingProcess: boolean;
  openUpdateProcessDrawerHandler?: (id: string) => void;
  openProcessDetailsDrawerHandler?: (id: string) => void;
  deleteProcessHandler?: (id: string) => void;
  fetchProcessHandler?: (id: string) => void;
}

const updateProcessStatus = async (id, status) => {
  //new
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}production-process/update-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`, // if needed
        },
        body: JSON.stringify({ _id: id, status }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    toast.success(data.message || "Status updated successfully");
    // Refresh list after status update
    if (fetchProcessHandler) {
      fetchProcessHandler();
    }
  } catch (err) {
    toast.error(err.message || "Failed to update status");
  }
};

const ProcessTable: React.FC<ProcessTableProps> = ({
  proces,
  isLoadingProcess,
  openUpdateProcessDrawerHandler,
  openProcessDetailsDrawerHandler,
  deleteProcessHandler,
  fetchProcessHandler,
}) => {
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

  // Bulk selection states
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [cookies] = useCookies();

  const UpdatedStatus = async (id) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}production-process/start-production`,

        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({ _id: id }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(data.message || "Status updated successfully");
      if (fetchProcessHandler) {
        fetchProcessHandler();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const RequestForAllocated = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}production-process/allocation?_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      fetchProcessHandler();
      // console.log(cookies?.access_token);
    } catch (error) {
      console.error("Error requesting for allocated inventory:", error);
      toast.error(
        "Failed to request for allocated inventory. Please try again."
      );
    }
  };

  const columns = useMemo(
    () => [
      { Header: "Created By", accessor: "creator" },
      { Header: "Status", accessor: "status" },
      { Header: "Item", accessor: "item" },
      { Header: "RM Store", accessor: "rm_store" },
      { Header: "FG Store", accessor: "fg_store" },
      { Header: "Scrap Store", accessor: "scrap_store" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
      { Header: "Button", accessor: "button" },
    ],
    []
  );

  const statusStyles = {
    "raw material approval pending": {
      backgroundColor: colors.error[100],
      color: colors.error[700],
    },
    "raw materials approved": {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
    "work in progress": {
      backgroundColor: colors.warning[100],
      color: colors.warning[700],
    },
    completed: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },
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
  }: TableInstance<{
    proces: string;
    description: string;
    creator: any;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: proces,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  // Bulk selection functions

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProcesses(page.map((row) => row.original._id));
    } else {
      setSelectedProcesses([]);
    }
  };

  const handleSelectProcess = (processId, checked) => {
    if (checked) {
      setSelectedProcesses((prev) => [...prev, processId]);
    } else {
      setSelectedProcesses((prev) => prev.filter((id) => id !== processId));
    }
  };

  const handleBulkDelete = async () => {
    if (isBulkDeleting || selectedProcesses.length === 0) return;
    setIsBulkDeleting(true);

    try {
      // Use bulk delete endpoint
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}production-process/bulk-delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({ ids: selectedProcesses }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Success feedback
      toast.success(data.message);

      // Refresh the data
      if (fetchProcessHandler) {
        fetchProcessHandler();
      }

      setSelectedProcesses([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error(
        error.message || "Failed to delete processes. Please try again."
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  console.log(page);

  const isAllSelected =
    page.length > 0 && selectedProcesses.length === page.length;
  const isIndeterminate =
    selectedProcesses.length > 0 && selectedProcesses.length < page.length;

  return (
    <div className="p-6">
      {isLoadingProcess && (
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
              Loading processes...
            </span>
          </div>
        </div>
      )}

      {!isLoadingProcess && proces.length === 0 && (
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No processes found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by creating your first production process.
          </p>
        </div>
      )}

      {!isLoadingProcess && proces.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {proces.length} Process{proces.length !== 1 ? "es" : ""} Found
                </h3>
                {selectedProcesses.length > 0 && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    {selectedProcesses.length} selected
                  </p>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedProcesses.length > 0 && (
                <div className="flex items-center gap-3">
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
                    Delete Selected ({selectedProcesses.length})
                  </button>
                  <button
                    onClick={() => setSelectedProcesses([])}
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
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full">
                <thead
                  style={{
                    backgroundColor: colors.table.header,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <tr
                    style={{ borderBottom: `1px solid ${colors.table.border}` }}
                  >
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{
                        color: colors.table.headerText,
                        position: "sticky",
                        top: 0,
                        left: 0,
                        zIndex: 3,
                        backgroundColor: colors.table.header,
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
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{
                        color: colors.table.headerText,
                        position: "sticky",
                        top: 0,
                        left: "60px",
                        zIndex: 3,
                        backgroundColor: colors.table.header,
                      }}
                    >
                      Created By
                    </th>

                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Item
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      RM Store
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      FG Store
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Scrap Store
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

                    {/* Table Header */}
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      {page.some(
                        (row) => row.original.status === "Inventory Allocated"
                      )
                        ? "Request Allow"
                        : page.some(
                            (row) =>
                              row.original.status === "inventory in transit"
                          )
                        ? "Inventory Received"
                        : ""}
                    </th>

                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Status
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
                  {page.map((row, index) => {
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
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{
                            color: colors.text.secondary,
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            backgroundColor:
                              index % 2 === 0
                                ? colors.background.card
                                : colors.table.stripe,
                            width: "60px",
                            minWidth: "60px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProcesses.includes(
                              row.original._id
                            )}
                            onChange={(e) =>
                              handleSelectProcess(
                                row.original._id,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-mono whitespace-nowrap"
                          style={{
                            color: colors.text.secondary,
                            position: "sticky",
                            left: "60px",
                            zIndex: 1,
                            backgroundColor:
                              index % 2 === 0
                                ? colors.background.card
                                : colors.table.stripe,
                          }}
                        >
                          {row.original.creator
                            ? `${row.original.creator.first_name || ""} ${
                                row.original.creator.last_name || ""
                              }`.trim() || "N/A"
                            : "N/A"}
                        </td>

                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.item?.name || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.rm_store?.name || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.fg_store?.name || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.scrap_store?.name || "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.createdAt
                            ? moment(row.original.createdAt).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.updatedAt
                            ? moment(row.original.updatedAt).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: colors.text.secondary }}
                        >
                          {row.original.status === "Inventory Allocated" && (
                            <button
                              onClick={() =>
                                RequestForAllocated(
                                  row.original._id,
                                  "request for allow"
                                )
                              }
                              className="px-3 py-1 text-sm font-medium rounded-md"
                              style={{
                                backgroundColor: colors.error[200],
                                color: colors.warning[700],
                              }}
                            >
                              Request Allow
                            </button>
                          )}

                          {row.original.status === "inventory in transit" && (
                            <button
                              // onClick={() => updateProcessStatus(row.original._id, "production start")}
                              onClick={() => UpdatedStatus(row.original._id)}
                              className="px-3 py-1 text-sm font-medium rounded-md"
                              style={{
                                backgroundColor: colors.success[200],
                                color: colors.success[700],
                              }}
                            >
                              Inventory Received
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.original.status ? (
                            <span
                              className={`
        px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize
        ${statusColorMap[row.original.status] || defaultStatusClass}
      `}
                            >
                              {row.original.status}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {openProcessDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openProcessDetailsDrawerHandler(
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
                                title="View process details"
                              >
                                <MdOutlineVisibility size={16} />
                              </button>
                            )}
                            {openUpdateProcessDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateProcessDrawerHandler(
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
                                title="Edit process"
                              >
                                <MdEdit size={16} />
                              </button>
                            )}
                            {deleteProcessHandler && (
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
                                title="Delete process"
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            )}
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
                        Delete Process
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All process data will be
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
                    deleteProcessHandler(deleteId);
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
                        Delete {selectedProcesses.length} Process
                        {selectedProcesses.length > 1 ? "es" : ""}
                      </p>
                      <p
                        className="text-sm text-center"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All selected process data
                        will be permanently removed from the system.
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
                          Deleting processes...
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
                    `Delete ${selectedProcesses.length} Process${
                      selectedProcesses.length > 1 ? "es" : ""
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

export default ProcessTable;
