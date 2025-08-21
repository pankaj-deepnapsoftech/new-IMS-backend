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
import { useCookies } from "react-cookie";
import { SquarePen } from "lucide-react";

interface ResourceTableProps {
  resources: Array<{
    _id: string;
    name: string;
    type: string;
    specification?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingResources: boolean;
  openUpdateResourceDrawerHandler?: (id: string) => void;
  openResourceDetailsDrawerHandler?: (id: string) => void;
  deleteResourceHandler?: (id: string) => void;
  fetchResourcesHandler?: () => void;
  setEditResource?: (resource: any) => void;
  editResource?: any;
  openAddResourceDrawerHandler?: () => void;
  setAddResourceDrawerOpened?: (isOpen: boolean) => void;
  bulkDeleteResourcesHandler?: (ids: string[]) => void;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  resources = [],
  isLoadingResources,
  openUpdateResourceDrawerHandler,
  openResourceDetailsDrawerHandler,
  deleteResourceHandler,
  setEditResource,
  editResource,
  openAddResourceDrawerHandler,
  setAddResourceDrawerOpened,
  bulkDeleteResourcesHandler,
}) => {
  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

  // Bulk selection states
  const [selectedResources, setSelectedResources] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [cookies] = useCookies();
  const columns = useMemo(
    () => [
      { Header: "CustomId", accessor: "customid" },
      { Header: "Name", accessor: "name" },
      { Header: "Type", accessor: "type" },
      { Header: "Specification", accessor: "specification" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );

  console.log("resource data", resources);

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
    name: string;
    type: string;
    specification: string;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: resources || [],
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  // Bulk selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedResources(page.map((row) => row.original._id));
    } else {
      setSelectedResources([]);
    }
  };

  const handleSelectResource = (resourceId, checked) => {
    if (checked) {
      setSelectedResources((prev) => [...prev, resourceId]);
    } else {
      setSelectedResources((prev) => prev.filter((id) => id !== resourceId));
    }
  };

  const handleBulkDelete = async () => {
    if (
      isBulkDeleting ||
      selectedResources.length === 0 ||
      !bulkDeleteResourcesHandler
    )
      return;

    setIsBulkDeleting(true);

    try {
      await bulkDeleteResourcesHandler(selectedResources);
      setSelectedResources([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete some resources. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isAllSelected =
    page.length > 0 && selectedResources.length === page.length;
  const isIndeterminate =
    selectedResources.length > 0 && selectedResources.length < page.length;

  return (
    <div className="p-6">
      {isLoadingResources && (
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
              Loading resources...
            </span>
          </div>
        </div>
      )}

      {!isLoadingResources && resources.length === 0 && (
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
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No resources found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by adding your first resource to manage your production
            equipment.
          </p>
        </div>
      )}

      {!isLoadingResources && resources.length > 0 && (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {resources.length} Resource{resources.length !== 1 ? "s" : ""}{" "}
                  Found
                </h3>
              </div>

              {/* Bulk Actions */}
              {selectedResources.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {deleteResourceHandler && (
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
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
                      <span className="hidden sm:inline">Delete Selected</span>
                      <span className="sm:hidden">Delete</span>
                      <span className="ml-1">({selectedResources.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedResources([])}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
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
                    <span className="hidden sm:inline">Clear Selection</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 lg:flex-shrink-0">
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: colors.text.secondary }}
              >
                Show:
              </span>
              <select
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 text-sm rounded-lg border transition-colors min-w-0"
                value={pageSize}
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
                      Custom Id
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Name
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Type
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      Specification
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
                    {cookies?.role === "admin" && (
                      <th
                        className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                        style={{ color: colors.table.headerText }}
                      >
                        Actions
                      </th>
                    )}
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
                              checked={selectedResources.includes(
                                row.original._id
                              )}
                              onChange={(e) =>
                                handleSelectResource(
                                  row.original._id,
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        )}
                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap truncate max-w-xs"
                          style={{ color: colors.text.primary }}
                          title={row.original?.customId}
                        >
                          {row.original?.customId || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium whitespace-nowrap truncate max-w-xs"
                          style={{ color: colors.text.primary }}
                          title={row.original.name}
                        >
                          {row.original.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                              backgroundColor:
                                row.original.type === "Machine"
                                  ? colors.primary[100]
                                  : colors.secondary[100],
                              color:
                                row.original.type === "Machine"
                                  ? colors.primary[700]
                                  : colors.secondary[700],
                            }}
                          >
                            {console.log("dsfsdf", row.original.type)}
                            {row.original.type}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap truncate max-w-xs"
                          style={{ color: colors.text.secondary }}
                          title={row.original.specification}
                        >
                          {row.original.specification || "—"}
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
                        {cookies?.role === "admin" && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {openResourceDetailsDrawerHandler && (
                                <button
                                  onClick={() =>
                                    openResourceDetailsDrawerHandler(
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
                                  title="View resource details"
                                >
                                  <MdOutlineVisibility size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditResource(row.original);
                                  setAddResourceDrawerOpened(true);
                                }}
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
                                title="Edit resource"
                              >
                                <MdEdit size={16} />
                              </button>
                              {deleteResourceHandler && (
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
                                  title="Delete resource"
                                >
                                  <MdDeleteOutline size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
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
                    <div className="text-center">
                      <p
                        className="font-medium"
                        style={{ color: colors.error[800] }}
                      >
                        Delete Resource
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All resource data will be
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
                    deleteResourceHandler(deleteId);
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
                    <div className="text-center">
                      <p
                        className="font-medium"
                        style={{ color: colors.error[800] }}
                      >
                        Delete {selectedResources.length} Resource
                        {selectedResources.length > 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.error[600] }}
                      >
                        This action cannot be undone. All selected resource data
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
                          Deleting resources...
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
                    `Delete ${selectedResources.length} Resource${
                      selectedResources.length > 1 ? "s" : ""
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

export default ResourceTable;
