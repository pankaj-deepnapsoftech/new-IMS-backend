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
} from "@chakra-ui/react";
import moment from "moment";
import { useMemo } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { MdDeleteOutline, MdEdit, MdOutlineVisibility } from "react-icons/md";
import { FcApproval, FcDatabase } from "react-icons/fc";
import {
  usePagination,
  useSortBy,
  useTable,
  Column,
  TableState,
  TableInstance,
  HeaderGroup,
  Row,
  Cell,
} from "react-table";
import Loading from "../../ui/Loading";
import EmptyData from "../../ui/emptyData";
import { colors } from "../../theme/colors";

interface WIPProductTableProps {
  products: Array<{
    name: string;
    product_id: string;
    uom: string;
    category: string;
    sub_category?: string;
    item_type: string;
    product_or_service: string;
    current_stock: number;
    price: number;
    min_stock?: number;
    max_stock?: number;
    hsn_code?: number;
    inventory_category?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  isLoadingProducts: boolean;
  openUpdateProductDrawerHandler?: (id: string) => void;
  openProductDetailsDrawerHandler?: (id: string) => void;
  deleteProductHandler?: (id: string) => void;
  approveProductHandler?: (id: string) => void;
}

const WIPProductTable: React.FC<WIPProductTableProps> = ({
  products,
  isLoadingProducts,
  openUpdateProductDrawerHandler,
  openProductDetailsDrawerHandler,
  deleteProductHandler,
  approveProductHandler,
}) => {
  const columns: Column<{
    name: string;
    product_id: string;
    uom: string;
    category: string;
    sub_category?: string;
    item_type: string;
    product_or_service: string;
    current_stock: number;
    price: number;
    min_stock?: number;
    max_stock?: number;
    hsn_code?: number;
    inventory_category?: string;
    createdAt: string;
    updatedAt: string;
  }>[] = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "product_id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "BOM",
        accessor: "bom",
      },
      {
        Header: "Finished Good",
        accessor: "finished_good",
      },
      {
        Header: "Category",
        accessor: "category",
      },
      {
        Header: "Sub Category",
        accessor: "sub_category",
      },
      {
        Header: "UOM",
        accessor: "uom",
      },
      {
        Header: "Estimated Quantity",
        accessor: "estimated_quantity",
      },
      {
        Header: "Used Quantity",
        accessor: "used_quantity",
      },
      {
        Header: "Created On",
        accessor: "createdAt",
      },
      {
        Header: "Last Updated",
        accessor: "updatedAt",
      },
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
    name: string;
    product_id: string;
    uom: string;
    category: string;
    sub_category?: string;
    item_type: string;
    product_or_service: string;
    current_stock: number;
    price: number;
    min_stock?: number;
    max_stock?: number;
    hsn_code?: number;
    createdAt: string;
    updatedAt: string;
  }> = useTable(
    {
      columns,
      data: products,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="p-6">
      {isLoadingProducts && <Loading />}

      {!isLoadingProducts && products.length === 0 && (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            No WIP products found
          </h3>
          <p className="max-w-md" style={{ color: colors.text.muted }}>
            No work-in-progress products available at the moment.
          </p>
        </div>
      )}

      {!isLoadingProducts && products.length > 0 && (
        <div>
          {/* Header with count and page size selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {products.length} WIP Product
                  {products.length !== 1 ? "s" : ""} Found
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
              <select
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 text-sm rounded-lg border transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.border.light,
                  color: colors.text.primary,
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={100000}>All</option>
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
                  {headerGroups.map((hg: HeaderGroup) => (
                    <tr
                      key={hg.id}
                      style={{
                        borderBottom: `1px solid ${colors.table.border}`,
                      }}
                    >
                      {hg.headers.map((column: any) => (
                        <th
                          key={column.id}
                          className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors"
                          style={{ color: colors.table.headerText }}
                          onClick={column.getSortByToggleProps().onClick}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.table.hover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.table.header;
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {column.render("Header")}
                            {column.isSorted && (
                              <span>
                                {column.isSortedDesc ? (
                                  <FaCaretDown className="text-xs" />
                                ) : (
                                  <FaCaretUp className="text-xs" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {page.map((row: any, index: number) => {
                    prepareRow(row);
                    return (
                      <tr
                        key={row.id || index}
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
                        {row.cells.map((cell: Cell) => {
                          const colId = cell.column.id;
                          const original = row.original;

                          let displayValue;
                          if (colId === "product_id" && original?.item) {
                            displayValue = original.item.product_id;
                          } else if (colId === "name" && original?.item) {
                            displayValue = original.item.name;
                          } else if (colId === "bom" && original?.bom) {
                            displayValue = original.bom.bom_name;
                          } else if (
                            colId === "finished_good" &&
                            original?.bom
                          ) {
                            displayValue =
                              original.bom.finished_good?.item?.name;
                          } else if (colId === "category" && original?.item) {
                            displayValue = original.item.category;
                          } else if (
                            colId === "sub_category" &&
                            original?.item
                          ) {
                            displayValue = original.item.sub_category || "N/A";
                          } else if (colId === "uom" && original?.item) {
                            displayValue = original.item.uom;
                          } else if (colId === "estimated_quantity") {
                            displayValue = original.estimated_quantity || "0";
                          } else if (colId === "used_quantity") {
                            displayValue = original.used_quantity || "0";
                          } else if (colId === "createdAt") {
                            displayValue = original.createdAt
                              ? moment(original.createdAt).format("DD/MM/YYYY")
                              : "N/A";
                          } else if (colId === "updatedAt") {
                            displayValue = original.updatedAt
                              ? moment(original.updatedAt).format("DD/MM/YYYY")
                              : "N/A";
                          } else {
                            displayValue = cell.render("Cell");
                          }

                          return (
                            <td
                              key={cell.column.id}
                              className="px-4 py-3 text-sm whitespace-nowrap truncate max-w-xs"
                              style={{ color: colors.text.secondary }}
                              title={
                                typeof displayValue === "string"
                                  ? displayValue
                                  : ""
                              }
                            >
                              {displayValue}
                            </td>
                          );
                        })}
                        {/* <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {openProductDetailsDrawerHandler && (
                              <button
                                onClick={() =>
                                  openProductDetailsDrawerHandler(
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
                                title="View details"
                              >
                                <MdOutlineVisibility size={16} />
                              </button>
                            )}
                            {openUpdateProductDrawerHandler && (
                              <button
                                onClick={() =>
                                  openUpdateProductDrawerHandler(
                                    row.original._id
                                  )
                                }
                                className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{
                                  color: colors.warning[600],
                                  backgroundColor: colors.warning[50],
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.warning[100];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    colors.warning[50];
                                }}
                                title="Edit product"
                              >
                                <MdEdit size={16} />
                              </button>
                            )}
                            {approveProductHandler && (
                              <button
                                onClick={() =>
                                  approveProductHandler(row.original._id)
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
                                title="Approve product"
                              >
                                <FcApproval size={16} />
                              </button>
                            )}
                            {deleteProductHandler && (
                              <button
                                onClick={() =>
                                  deleteProductHandler(row.original._id)
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
                                title="Delete product"
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            )} 
                          </div>
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={previousPage}
              disabled={!canPreviousPage}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                canPreviousPage ? "hover:shadow-md" : "cursor-not-allowed"
              }`}
              style={{
                backgroundColor: canPreviousPage
                  ? colors.primary[600]
                  : colors.gray[400],
                color: "white",
                opacity: canPreviousPage ? 1 : 0.6,
              }}
            >
              Previous
            </button>

            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Page {pageIndex + 1} of {pageCount}
            </span>

            <button
              onClick={nextPage}
              disabled={!canNextPage}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                canNextPage ? "hover:shadow-md" : "cursor-not-allowed"
              }`}
              style={{
                backgroundColor: canNextPage
                  ? colors.primary[600]
                  : colors.gray[400],
                color: "white",
                opacity: canNextPage ? 1 : 0.6,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WIPProductTable;
