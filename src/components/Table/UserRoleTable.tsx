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
  Badge,
} from "@chakra-ui/react";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import { usePagination, useSortBy, useTable } from "react-table";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";

interface UserRoleTableProps {
  roles: Array<{
    role: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    _id: string;
  }>;
  isLoadingRoles: boolean;
  openUpdateRoleDrawerHandler?: (id: string) => void;
  openRoleDetailsDrawerHandler?: (id: string) => void;
  deleteRoleHandler?: (id: string) => void;
}

const UserRoleTable: React.FC<UserRoleTableProps> = ({
  roles,
  isLoadingRoles,
  openUpdateRoleDrawerHandler,
  openRoleDetailsDrawerHandler,
  deleteRoleHandler,
}) => {
  const columns = useMemo(
    () => [
      {
        Header: "Role",
        accessor: "role",
        minWidth: 120, // Ensure minimum width for sticky column
        width: 150, // Set preferred width
      },
      { Header: "Description", accessor: "description" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );

  const dynamicBg = (index) => {
    return index % 2 !== 0 ? colors.table.stripe : colors.background.card;
  };

  const [showDeletePage, setshowDeletePage] = useState(false);
  const [deleteId, setdeleteId] = useState("");

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
    setPageSize,
    state: { pageIndex, pageSize },
    pageCount,
  } = useTable(
    { columns, data: roles, initialState: { pageIndex: 0 } },
    useSortBy,
    usePagination
  );

  return (
    <div className="p-6">
      {isLoadingRoles && (
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
              Loading roles...
            </span>
          </div>
        </div>
      )}

      {!isLoadingRoles && roles.length === 0 && (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No roles found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by creating your first user role to manage permissions
            and access levels.
          </p>
        </div>
      )}

      {!isLoadingRoles && roles.length > 0 && (
        <>
          {/* Table Header with Stats and Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {roles.length} Role{roles.length !== 1 ? "s" : ""} Found
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
            className="rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <div
              className="overflow-x-auto"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
                scrollbarColor: `${colors.gray[300]} ${colors.gray[100]}`,
              }}
            >
              <Table
                {...getTableProps()}
                variant="simple"
                size="md"
                minWidth="800px"
              >
                <Thead
                  bg={colors.table.header}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {headerGroups.map((hg) => (
                    <Tr
                      {...hg.getHeaderGroupProps()}
                      borderBottom="1px solid"
                      borderColor={colors.table.border}
                    >
                      {hg.headers.map((column) => (
                        <Th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          fontSize="14px"
                          color="gray.700"
                          fontWeight="600"
                          whiteSpace="nowrap"
                          px={4}
                          py={3}
                          style={{
                            backgroundColor: colors.table.header,
                            ...(column.id === "role" && {
                              position: "sticky",
                              left: 0,
                              zIndex: 2,
                            }),
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {column.render("Header")}
                            {column.isSorted &&
                              (column.isSortedDesc ? (
                                <FaCaretDown />
                              ) : (
                                <FaCaretUp />
                              ))}
                          </div>
                        </Th>
                      ))}
                      <Th
                        fontSize="14px"
                        fontWeight="600"
                        color="gray.700"
                        whiteSpace="nowrap"
                        px={4}
                        py={3}
                        style={{
                          backgroundColor: colors.table.header,
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
                        _hover={{
                          bg: colors.table.hover,
                          transform: "translateY(-1px)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          shadow: "md",
                        }}
                        bgColor={dynamicBg(index)}
                        transition="all 0.2s ease"
                        borderBottom="1px solid"
                        borderColor={colors.table.border}
                      >
                        {row.cells.map((cell) => (
                          <Td
                            {...cell.getCellProps()}
                            fontSize="14px"
                            color={colors.text.primary}
                            px={4}
                            py={3}
                            style={{
                              // Make Role column sticky on horizontal scroll
                              ...(cell.column.id === "role" && {
                                position: "sticky",
                                left: 0,
                                zIndex: 1,
                                backgroundColor: dynamicBg(index),
                                boxShadow: "4px 0 8px rgba(0,0,0,0.15)",
                                borderRight: `2px solid ${colors.border.light}`,
                              }),
                            }}
                          >
                            {cell.column.id === "createdAt" ||
                            cell.column.id === "updatedAt" ? (
                              moment(row.original[cell.column.id]).format(
                                "DD/MM/YYYY"
                              )
                            ) : cell.column.id === "role" ? (
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]})`,
                                  color: colors.text.inverse,
                                }}
                              >
                                <svg
                                  className="w-4 h-4 mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {row.original.role}
                              </span>
                            ) : (
                              cell.render("Cell")
                            )}
                          </Td>
                        ))}
                        <Td px={4} py={3}>
                          <div className="flex items-center gap-2">
                            {openRoleDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openRoleDetailsDrawerHandler(row.original._id)
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
                                title="View Role Details"
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
                            {openUpdateRoleDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateRoleDrawerHandler(row.original._id)
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
                                title="Edit Role"
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
                            {deleteRoleHandler && (
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
                                title="Delete Role"
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
              Are you sure you want to delete this role? This action cannot be
              undone and will permanently remove the role from the system.
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
                  deleteRoleHandler(deleteId);
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
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleTable;
