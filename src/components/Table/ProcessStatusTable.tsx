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
import {
  MdDeleteOutline,
  MdEdit,
  MdInfoOutline,
  MdOutlineVisibility,
} from "react-icons/md";
import moment from "moment";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Button } from "@chakra-ui/react";

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
  fetchProcessHandler?: () => void;
}

const updateProcessStatus = async (id, status) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}production-process/update-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({ _id: id, status }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    toast.success(data.message || "Status updated successfully");
    // Trigger a re-render instead of full page reload
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
    window.location.reload();
  } catch (err) {
    toast.error(err.message || "Failed to update status");
  }
};

const ProcessStatusTable: React.FC<ProcessTableProps> = ({
  proces,
  isLoadingProcess,
  openUpdateProcessDrawerHandler,
  openProcessDetailsDrawerHandler,
  deleteProcessHandler,
  fetchProcessHandler,
}) => {
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [closeModal,setCloseModal] =  useState(false)
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
      // Trigger a re-render instead of full page reload
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
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
    } catch (error) {
      console.error("Error requesting for allocated inventory:", error);
      toast.error(
        "Failed to request for allocated inventory. Please try again."
      );
    }
  };

  const handlePauseProcess = async (id) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}production-process/pause`,
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

      toast.success(data.message || "Process paused successfully");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to pause process");
    }
  };
  const markOutFinishGoods = async (id) => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "";
      const res = await axios.post(
        `${baseURL}production-process/out-finish-goods`,
        { id }
      );

      toast.success(res.data.message || "Finished goods marked out!");
      if (fetchProcessHandler) {
        fetchProcessHandler();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Error marking finished goods"
      );
    }
  };
  const handleMoveToDispatch = async (id) => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "";
      const res = await axios.post(
        `${baseURL}dispatch/send-from-production`,
        { production_process_id: id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      toast.success(res.data.message || "Moved to Dispatch successfully");
      setCloseModal(true); 
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error moving to dispatch");
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
    "production started": {
      backgroundColor: "#e0f2fe",
      color: "#0277bd",
    },
    "Production Started": {
      backgroundColor: "#e0f2fe",
      color: "#0277bd",
    },
    "production in progress": {
      backgroundColor: "#fff3e0",
      color: "#f57c00",
    },
    "Production in Progress": {
      backgroundColor: "#fff3e0",
      color: "#f57c00",
    },
    completed: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },
    Completed: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },
    "moved to inventory": {
      backgroundColor: "#f3e5f5",
      color: "#7b1fa2",
    },
    "Moved to Inventory": {
      backgroundColor: "#f3e5f5",
      color: "#7b1fa2",
    },
   "allocated finish goods": {
      backgroundColor: "#e8f5e8",
      color: "#2e7d32",
    },
    Allocated: {
      backgroundColor: "#e8f5e8",
      color: "#2e7d32",
    },
    received: {
      backgroundColor: "#e1f5fe",
      color: "#0097a7",
    },
    Received: {
      backgroundColor: "#e1f5fe",
      color: "#0097a7",
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

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProcesses(page.map((row) => row.original._id));
    } else {
      setSelectedProcesses([]);
    }
  };
  const openProcessFullDetails = async (data) => {
   
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}production-process/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      setSelectedProcess(res.data?.production_process);
    } catch (error) {
      console.error("Failed to fetch process details:", error);
      toast.error("Failed to load process details");
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
    if (
      isBulkDeleting ||
      selectedProcesses.length === 0 ||
      !deleteProcessHandler
    )
      return;
    setIsBulkDeleting(true);

    try {
      const deletePromises = selectedProcesses.map((processId) =>
        deleteProcessHandler(processId)
      );

      await Promise.all(deletePromises);

      toast.success(
        `Successfully deleted ${selectedProcesses.length} process${
          selectedProcesses.length > 1 ? "es" : ""
        }`
      );

      setSelectedProcesses([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete some processes. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const moveToInventory = async (processId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}production-process/move-to-inventory`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ processId: processId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Moved to inventory successfully");
        setCloseModal(true); 
      } else {
        toast.error("Failed to move to inventory");
      }
    } catch (err) {
      toast.error("Error moving to inventory");
    }
  };

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
                  {deleteProcessHandler && (
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
                  )}
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
                      Status
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

                    <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
                      Button
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
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.original.status && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                              style={
                                statusStyles[row.original.status] || {
                                  backgroundColor: colors.gray[100],
                                  color: colors.gray[700],
                                }
                              }
                            >
                              {row.original.status.charAt(0).toUpperCase() +
                                row.original.status.slice(1)}
                            </span>
                          )}
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
                        <td className="px-4 py-3 text-left">
                          {row?.original.status === "allocated finish goods" && (
                            <button
                              onClick={() =>
                                markOutFinishGoods(row.original?._id)
                              }
                              className="px-3 py-2 text-xs font-medium rounded-md border transition-all whitespace-nowrap"
                              style={{
                                backgroundColor: colors.primary[50],
                                borderColor: colors.primary[200],
                                color: colors.primary[700],
                                minWidth: "fit-content",
                              }}
                            >
                              Out Finish Goods
                            </button>
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
                            <button
                              onClick={() =>
                               {  openProcessFullDetails(row.original);}
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
                              title="View all details"
                            >
                              <MdInfoOutline size={16} />
                            </button>

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
                                {/* <MdEdit size={16} /> */}
                                Start
                              </button>
                            )}

                            <button
                              className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                              onClick={() =>
                                handlePauseProcess(row.original?._id)
                              }
                              style={{
                                color: colors.error[600],
                                backgroundColor: colors.error[50],
                              }}
                            >
                              Pause
                            </button>

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

      {selectedProcess  &&(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 overflow-y-auto max-h-[90vh] border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProcess?.bom?.finished_good?.item?.name} - Details
              </h2>
              <button
                onClick={() => setSelectedProcess(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* General Info */}
            <section className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl shadow-sm mb-6 text-gray-800">
              <p>
                <strong>Created By:</strong>{" "}
                {`${selectedProcess.creator?.first_name} ${selectedProcess.creator?.last_name}`}
              </p>
              <p>
                <strong>Status:</strong>
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {selectedProcess.status}
                </span>
              </p>
              <p>
                <strong>Finished Goods Store:</strong>{" "}
                {selectedProcess.fg_store?.name}
              </p>
              <p>
                <strong>Raw Material Store:</strong>{" "}
                {selectedProcess.rm_store?.name}
              </p>
              <p>
                <strong>Scrap Store:</strong>{" "}
                {selectedProcess.scrap_store?.name}
              </p>
              <p>
                <strong>Created On:</strong>{" "}
                {moment(selectedProcess.createdAt).format("DD/MM/YYYY")}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {moment(selectedProcess.updatedAt).format("DD/MM/YYYY")}
              </p>
            </section>

            {/* Production Progress */}
            <section className="mb-6">
              <h3 className="font-semibold mb-3 text-lg text-gray-900">
                Production Progress
              </h3>
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      ((selectedProcess.finished_good?.produced_quantity || 0) /
                        (selectedProcess.finished_good?.estimated_quantity ||
                          1)) *
                      100
                    }%`,
                    background: "linear-gradient(to right, #4ade80, #22c55e)",
                  }}
                />
              </div>
              <p className="text-xs mt-2 text-gray-600">
                {selectedProcess.finished_good?.produced_quantity || 0} /{" "}
                {selectedProcess.finished_good?.estimated_quantity || 0} units
                completed
              </p>
            </section>

            {/* Process Steps */}
            <section className="mb-6">
              <h3 className="font-semibold mb-3 text-lg text-gray-900">
                Process Steps
              </h3>
              <ul className="space-y-2">
                {selectedProcess.processes?.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          step.done ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="text-gray-800">{step.process}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {step.work_done} done
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            {/* Finished Good Table */}
            <section className="mb-6">
              <h3 className="font-semibold mb-3 text-lg text-gray-900">
                Finished Good
              </h3>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Estimated Quantity</th>
                    <th className="p-3 text-left">Produced Quantity</th>
                    <th className="p-3 text-left">Unit Price</th>
                    <th className="p-3 text-left">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-gray-100 transition">
                    <td className="p-3 text-gray-800">
                      {selectedProcess.finished_good?.item?.name || "N/A"}
                    </td>
                    <td className="p-3 text-gray-800">
                      {selectedProcess.finished_good?.estimated_quantity || 0}
                    </td>
                    <td className="p-3 text-gray-800">
                      {selectedProcess.finished_good?.produced_quantity || 0}
                    </td>
                    <td className="p-3 text-gray-800">
                      ₹{selectedProcess.finished_good?.item?.price || 0}
                    </td>
                    <td className="p-3 text-gray-800">
                      ₹
                      {(
                        (selectedProcess.finished_good?.estimated_quantity || 0) *
                        (selectedProcess.finished_good?.item?.price || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tbody>

              </table>
            </section>

            {/* Raw Materials Table */}
            <section className="mb-6">
              <h3 className="font-semibold mb-3 text-lg text-gray-900">
                Raw Materials
              </h3>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Estimated Quantity</th>
                    <th className="p-3 text-left">Produced Quantity</th>
                    <th className="p-3 text-left">Unit Price</th>
                    <th className="p-3 text-left">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProcess?.raw_materials?.map((rm, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="p-3 text-gray-800">
                        {rm.item?.name || "N/A"}
                      </td>
                      <td className="p-3 text-gray-800">
                        {rm.estimated_quantity || 0}
                      </td>
                      <td className="p-3 text-gray-800">
                        {rm.used_quantity || 0}
                      </td>
                      <td className="p-3 text-gray-800">
                        ₹{rm.item?.price || 0}
                      </td>
                      <td className="p-3 text-gray-800">
                        ₹
                        {(
                          (rm?.estimated_quantity || 0) *
                          (rm?.item?.price || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Scrap Materials Table */}
            <section className="mb-6">
              <h3 className="font-semibold mb-3 text-lg text-gray-900">
                Scrap Materials
              </h3>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Estimated Quantity</th>
                    <th className="p-3 text-left">Produced Quantity</th>
                    <th className="p-3 text-left">Unit Price</th>
                    <th className="p-3 text-left">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProcess?.bom.scrap_materials?.map((sm, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="p-3 text-gray-800">
                        {sm.item?.name || "N/A"}
                      </td>
                      <td className="p-3 text-gray-800">
                        {selectedProcess?.scrap_materials[0]
                          .estimated_quantity || 0}
                      </td>
                      <td className="p-3 text-gray-800">
                        {selectedProcess?.scrap_materials[0]
                          .produced_quantity || 0}
                      </td>
                      <td className="p-3 text-gray-800">
                        ₹{sm.item?.price || 0}
                      </td>
                      <td className="p-3 text-gray-800">
                        ₹
                        {(
                          (selectedProcess?.scrap_materials[0]
                            .estimated_quantity || 0) *
                          (sm?.item?.price || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {moveToInventory(selectedProcess?._id); }}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
              >
                Move to Inventory
              </button>
              <button
                onClick={() => handleMoveToDispatch(selectedProcess._id)}
                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-md transition"
              >
                Move to Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessStatusTable;
