// @ts-nocheck

import { Select, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import moment from "moment";
import { useMemo } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { usePagination, useSortBy, useTable } from "react-table";
import { colors } from "../../theme/colors";

interface EmployeeTableProps {
  employees: Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingEmployees: boolean;
  openUpdateEmployeeDrawerHandler?: (id: string) => void;
  openEmployeeDetailsDrawerHandler?: (id: string) => void;
  deleteEmployeeHandler?: (id: string) => void;
  approveEmployeeHandler?: (id: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoadingEmployees,
  openUpdateEmployeeDrawerHandler,
  openEmployeeDetailsDrawerHandler,
  deleteEmployeeHandler,
  approveEmployeeHandler,
}) => {

  const columns = useMemo(
    () => [
      {
        Header: "Employee Id",
        accessor: "employeeId",
        Cell: ({ value }) => value || "N/A",
      },
      { Header: "First Name", accessor: "first_name" },
      { Header: "Last Name", accessor: "last_name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      { Header: "Role", accessor: "role" },
      { Header: "isVerified", accessor: "isVerified" },
      { Header: "Created On", accessor: "createdAt" },
      { Header: "Last Updated", accessor: "updatedAt" },
    ],
    []
  );
  console.log(employees)
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
      data: employees,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="p-6">
      {isLoadingEmployees && (
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
              Loading employees...
            </span>
          </div>
        </div>
      )}

      {!isLoadingEmployees && employees.length === 0 && (
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
            No employees found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            Get started by adding your first employee to manage your team.
          </p>
        </div>
      )}

      {!isLoadingEmployees && employees.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {employees.length} Employee{employees.length !== 1 ? "s" : ""}{" "}
                  Found
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
                {[5,10, 20, 50, 100, 100000].map((size) => (
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
            <div className="overflow-x-auto whitespace-nowrap">
              <div
                style={{
                  maxHeight: "500px", // or as per your design
                  overflowY: "auto",
                  overflowX: "auto", // if needed
                }}>
                <Table
                  {...getTableProps()}
                  variant="simple"
                  size="md"
                  minWidth="800px"
                ><Thead
                  position="sticky"
                  top={0}
                  zIndex={2}
                  bg={colors.table.header}
                >

                    {headerGroups.map((hg) => (
                      <Tr
                        {...hg.getHeaderGroupProps()}
                        borderBottom="1px solid"
                        borderColor={colors.table.border}
                      >
                        {hg.headers.map((column) => (
                          <Th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            fontSize="14px"
                            fontWeight="600"
                            position={column.id === "first_name" ? "sticky" : "sticky"} // keep all headers sticky
                            top={0}
                            left={column.id === "first_name" ? 0 : undefined}
                            zIndex={column.id === "first_name" ? 4 : 3}
                            bg={colors.table.header}
                          >
                            <div className="flex items-center gap-1">
                              {column.render("Header")}
                              {column.isSorted &&
                                (column.isSortedDesc ? <FaCaretDown /> : <FaCaretUp />)}
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
                              position={cell.column.id === "first_name" ? "sticky" : "static"}
                              left={cell.column.id === "first_name" ? 0 : undefined}
                              zIndex={cell.column.id === "first_name" ? 1 : undefined}
                              bg={cell.column.id === "first_name" ? dynamicBg(index) : undefined}
                              px={4}
                              py={3}
                            >
                              {cell.column.id === "createdAt" ||
                                cell.column.id === "updatedAt" ? (
                                moment(row.original[cell.column.id]).format(
                                  "DD/MM/YYYY"
                                )
                              ) : cell.column.id === "isVerified" ? (
                                <span
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                  style={{
                                    backgroundColor: row.original.isVerified
                                      ? colors.success[100]
                                      : colors.error[100],
                                    color: row.original.isVerified
                                      ? colors.success[800]
                                      : colors.error[800],
                                  }}
                                >
                                  {row.original.isVerified ? (
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
                                  ) : (
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
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  {row.original.isVerified
                                    ? "Verified"
                                    : "Not Verified"}
                                </span>
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
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  {(row.original?.role &&
                                    row.original.role.role) ||
                                    (row.original.isSuper && "Super Admin") ||
                                    "No Role"}
                                </span>
                              ) : (
                                cell.render("Cell")
                              )}
                            </Td>
                          ))}
                          <Td px={4} py={3}>
                            <div className="flex items-center gap-2">
                              {openEmployeeDetailsDrawerHandler && (
                                <button
                                  onClick={() =>
                                    openEmployeeDetailsDrawerHandler(
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
                                  title="View Employee Details"
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
                              {openUpdateEmployeeDrawerHandler && (
                                <button
                                  onClick={() =>
                                    openUpdateEmployeeDrawerHandler(
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
                                  title="Edit Employee"
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
                              {deleteEmployeeHandler && (
                                <button
                                  onClick={() =>
                                    deleteEmployeeHandler(row.original._id)
                                  }
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
                                  title="Delete Employee"
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
                              {approveEmployeeHandler && (
                                <button
                                  onClick={() =>
                                    approveEmployeeHandler(row.original._id)
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
                                  title="Approve Employee"
                                >
                                  <FcApproval className="w-4 h-4" />
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
      )
      }
    </div >
  );
};

export default EmployeeTable;
